"""Get a sourceable list of containers."""

import argparse
import json
import logging
import os
import re
import time
import traceback
from datetime import datetime
from typing import Optional

import requests


class TagNotFoundError(Exception):
    """Raise if a last tag is not found and a last tag was requested."""


def get_logger(level: int = logging.INFO):
    """Get a logger."""
    logging.basicConfig(format="%(filename)s:%(lineno)s:%(funcName)s:%(levelname)s: %(message)s")
    logger = logging.getLogger()
    logger.setLevel(level)
    return logger


def get_last_tag(repo_tags_endpoint: str, tag_prefix: str, session: requests.Session) -> str:
    """Get the last tag for the prefix."""
    requests.packages.urllib3.disable_warnings(requests.packages.urllib3.exceptions.InsecureRequestWarning)
    response = session.get(repo_tags_endpoint, verify=False, timeout=30)
    if response.status_code == requests.codes.not_found:
        raise TagNotFoundError(f"{repo_tags_endpoint}, {tag_prefix}")
    response.raise_for_status()

    data = response.json()
    # concatenating here because escaping the brackets leads to jinja removing them later
    # when cookiecutter is run on this file.
    tag_regex = re.compile(tag_prefix + r"-\d{4}.\d{2}.\d{2}.\d+$")
    tags = [x for x in data["tags"] if tag_regex.match(x)]
    # the sequence numbers aren't padded so an alphabetical sort won't work, convert to an integer tuple
    if tags:
        return max(tags, key=lambda x: tuple(int(y) for y in x.rsplit("-", 1)[-1].split(".")))
    else:
        raise TagNotFoundError(f"{repo_tags_endpoint}, {tag_prefix}")


def get_new_tag(repo_tags_endpoint: str, tag_prefix: str, session: requests.Session) -> str:
    """Get a new tag for a container repo."""
    # get the date for the new tag
    current_datetime = datetime.utcnow()
    current_date = current_datetime.replace(hour=0, minute=0, second=0, microsecond=0)
    new_tag_date = current_date.strftime("%Y.%m.%d")

    try:
        last_tag = get_last_tag(repo_tags_endpoint, tag_prefix, session)
    except TagNotFoundError:
        return f"{tag_prefix}-{new_tag_date}.1"
    else:
        last_tag_date, last_tag_sequence = last_tag.replace(f"{tag_prefix}-", "").rsplit(".", 1)
        if last_tag_date == new_tag_date:
            return f"{tag_prefix}-{new_tag_date}.{int(last_tag_sequence) + 1}"
        return f"{tag_prefix}-{new_tag_date}.1"


def get_fmk_container(
    container_repo_path: str,
    tag_prefix: str,
    get_tag: str,
    logger: Optional[logging.Logger] = None,
    session: Optional[requests.Session] = None,
) -> str:
    """Get the fmk container."""
    if logger is None:
        logger = get_logger()
    if session is None:
        session = requests.Session()

    logger.debug(
        "entering :: container_repo: %s :: tag_prefix: %s :: get_tag: %s",
        container_repo_path,
        tag_prefix,
        get_tag,
    )
    if get_tag == "last":
        registry_hostname = "fmk.nexus.onefiserv.net"
    elif get_tag == "new":
        registry_hostname = "fmk.nexus-ci.onefiserv.net"
    else:
        raise ValueError("get_tag must be 'last' or 'new'")

    api_endpoint = f"https://{registry_hostname}/v2/{container_repo_path}/tags/list"
    image_ref = f"{registry_hostname}/{container_repo_path}"

    logger.debug("api: %s", api_endpoint)
    retry = 0
    max_retry = 3
    while retry < max_retry:
        try:
            if get_tag == "last":
                tag = get_last_tag(
                    repo_tags_endpoint=api_endpoint,
                    tag_prefix=tag_prefix,
                    session=session,
                )
            elif get_tag == "new":
                tag = get_new_tag(
                    repo_tags_endpoint=api_endpoint,
                    tag_prefix=tag_prefix,
                    session=session,
                )
            else:
                # we should have already raised this - but just to be sure
                raise ValueError("get_tag must be 'last' or 'new'")
            return f"{image_ref}:{tag}"
        except requests.RequestException as exc:
            logger.debug(
                "Exception (%s) :: %s :: traceback: %s",
                type(exc).__name__,
                exc.args,
                traceback.format_exc().splitlines(),
            )
            retry += 1
            if retry < max_retry:
                time.sleep(8)
                session = requests.Session()
                logger.info("Nexus connectivity issue, retrying...")
            else:
                raise exc

    raise TagNotFoundError


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="tag versions")
    parser.add_argument(
        "--container-repo-path",
        default=f"apm/{os.environ.get('APM_NUMBER')}/{os.environ.get('CI_PROJECT_NAME')}",
    )
    parser.add_argument("--only-build-containers", action="store_true", default=False)
    parser.add_argument("--python-version", default="3.12")
    parser.add_argument("--log-level", default="INFO")
    args = parser.parse_args()

    logger = get_logger(args.log_level)
    session = requests.Session()
    if not args.only_build_containers:
        for prefix in ["build", "latest"]:
            push_container = get_fmk_container(
                container_repo_path=args.container_repo_path,
                tag_prefix=prefix,
                get_tag="new",
                logger=logger,
                session=session,
            )
            pull_container = push_container.replace("nexus-ci", "nexus")
            print(
                f"{prefix.upper()}_PUSH_IMAGE",
                push_container,
                sep="=",
            )
            print(
                f"{prefix.upper()}_PULL_IMAGE",
                pull_container,
                sep="=",
            )
    for image_type in ["poetry", "python"]:
        print(
            f"{image_type.upper()}_IMAGE",
            json.dumps(
                get_fmk_container(
                    f"apm/0002898/{image_type}-container-{args.python_version}",
                    "latest",
                    get_tag="last",
                    logger=logger,
                    session=session,
                )
            ),
            sep="=",
        )
