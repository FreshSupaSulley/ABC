"""Module providing the ability to generate a rundeck job via a VSCode task."""

import getpass
import pathlib
import re
import subprocess
import sys

import requests


def parse_git_remote_show_output(command_output: str) -> str:
    """Parse the output of `git remote show -n origin` to get the push URL.

    Args:
        command_output (str): Output of the `git remote show -n origin` command.

    Returns:
        str: The push URL from the command output.

    Raises:
        ValueError: If the output does not contain a push URL.

    Examples:
        >>> output = '''* remote origin
        ... Fetch URL: git@gitlab.onefiserv.net:rundeck/download-link.git
        ... Push  URL: git@gitlab.onefiserv.net:rundeck/download-link.git
        ... HEAD branch: (not queried)
        ... Remote branch: (status not queried)
        ... master'''
        >>> parse_git_remote_show_output(output)
        'git@gitlab.onefiserv.net:rundeck/download-link.git'
    """
    lines = command_output.splitlines()
    for line in lines:
        if line.strip().startswith("Push  URL:"):
            push_url = line.strip().replace("Push  URL:", "").strip()
            return push_url
    raise ValueError("Push URL not found in command output.")


def construct_gitlab_project_url(push_url: str) -> str:
    """Construct the GitLab project URL from the push URL.

    Args:
        push_url (str): The push URL from the command output.

    Returns:
        str: The GitLab project URL.

    Examples:
        >>> construct_gitlab_project_url('https://gitlab.onefiserv.net/rundeck/download-link.git')
        'https://gitlab.onefiserv.net/rundeck/download-link/'
        >>> construct_gitlab_project_url('git@gitlab.onefiserv.net:rundeck/download-link.git')
        'https://gitlab.onefiserv.net/rundeck/download-link/'
    """
    # Convert SSH URL to HTTPS format
    if push_url.startswith("git@"):
        push_url = re.sub(r"git@(.*?):(.*)", r"https://\1/\2", push_url)

    # Remove the '.git' suffix if it exists
    if push_url.endswith(".git"):
        push_url = push_url[:-4]

    # Append a trailing '/' if not present
    if not push_url.endswith("/"):
        push_url = f"{push_url}/"

    return push_url


def create_yaml_file(yaml_file):
    """Creates a str version of a rendered yml template given usr input."""
    my_file = pathlib.Path(yaml_file)
    yaml_content = my_file.read_text(encoding="utf-8")

    # check git origin to point user to jobs
    git_remote_output = subprocess.check_output(["/usr/bin/git", "remote", "show", "-n", "origin"]).decode("utf-8")  # noqa: S603
    gitlab_url = construct_gitlab_project_url(parse_git_remote_show_output(git_remote_output))
    gitlab_url += "-/jobs"

    # Gather input data
    print("Create an api_token at https://rundeck-giolab.1dc.com/user/profile")
    api_token = getpass.getpass(prompt="Enter your Rundeck DEV API token: ")
    job_name = input("Enter your job name: ")
    project_name = input("Enter the name of your project [sandbox]: ")
    print(f"Check the wait_release job at {gitlab_url} to find the image reference at the end of the job output.")
    image_ref = input("Enter the image reference: ")

    user: str = getpass.getuser()

    if not project_name:
        project_name = "sandbox"
    if "-" in image_ref:
        # removing the date if we see a hyphen so that the user can copy over a dated tag
        image_ref = image_ref.rsplit("-", 1)[0]

    values = {
        "job_name": job_name,
        "image_ref": image_ref,
        "lab_user": user,
    }

    new_yaml_content = yaml_content.format(**values)

    return new_yaml_content, project_name, api_token


def make_post_request(yaml_string, proj, my_api_token):
    """Executes POST request to deploy job."""
    # Define the Rundeck API endpoint
    url = f"https://rundeck-giolab.1dc.com/api/40/project/{proj}/jobs/import"

    # Set the headers, including the authentication token
    headers = {
        "X-Rundeck-Auth-Token": my_api_token,
        "Content-Type": "application/yaml",
        "Accept": "application/json",
    }

    # Send the POST request with headers and data
    response = requests.post(
        url, headers=headers, data=yaml_string, timeout=10
    )  # data = string version of rendered yml template

    try:
        data = response.json()
        print(data)
    except ValueError as e:
        # If JSON decoding fails, print the response text to investigate
        print("Error decoding JSON:")
        print(e)
        print("Response text:")
        print(response.text)
    except Exception as e:
        # Catch any other exceptions that might occur
        print(f"An unexpected error occurred: {e}")

    print(f"Status code: {response.status_code}")

    if response.status_code == requests.codes["OK"]:
        print(
            "SUCCEEDED: Job has successfully been generated!  "
            f"Look for the tag {getpass.getuser()} at the top of your project."
        )
    else:
        print("FAILED: Job failed to be generated!")


def main():
    """Put main code here."""
    yaml_file_path = sys.argv[1]
    created_yaml_str, proj_name, api_token = create_yaml_file(yaml_file_path)
    make_post_request(created_yaml_str, proj_name, api_token)


if __name__ == "__main__":
    main()
