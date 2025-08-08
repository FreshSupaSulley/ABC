#!/bin/bash

set -e

# Function that provides help text
show_help() {
    cat << EOF
Build a target, adding POETRY_IMAGE and PYTHON_IMAGE before starting.

Usage: ${0##*/} [-h|--help] --target <target_name> [DOCKER_OPTIONS...]

Options:
  -h, --help           Show help message
  --target <target_name>  Specify the Docker target to build (defaults to build)
  DOCKER_OPTIONS       Any additional options to pass to Docker/Podman build

Example:
  ${0##*/} --target my_target --no-cache
EOF
}

# Function that builds Docker target
build_target() {
    local target_name="$1"
    shift
    local docker_options=("$@")
    
    if [ -e "$POE_ROOT/pipeline.env" ]; then
        source "$POE_ROOT/pipeline.env"
    fi

    if [ -z "$POETRY_IMAGE" ] || [ -z "$PYTHON_IMAGE" ]; then
        eval "$(poe -q get-tags --only-build-containers)"
    fi

    if [ -z "$LOCAL_REPO" ]; then
        LOCAL_REPO="$(poe -q get-local-repo)"
    fi

    echo "Building image with $LOCAL_REPO"

    if command -v podman > /dev/null; then
        podman build \
            --target "$target_name" \
            --jobs 2 \
            --tag "$LOCAL_REPO:$target_name" \
            --build-arg POETRY_IMAGE="$POETRY_IMAGE" \
            --build-arg PYTHON_IMAGE="$PYTHON_IMAGE" \
            --build-arg CDNX_R_USER="$CDNX_R_USER" \
            --build-arg CDNX_R_PASSWORD="$CDNX_R_PASSWORD" \
            "${docker_options[@]}" \
            "$POE_ROOT"
    else
        docker build \
            --target "$target_name" \
            --tag "$LOCAL_REPO:$target_name" \
            --build-arg POETRY_IMAGE="$POETRY_IMAGE" \
            --build-arg PYTHON_IMAGE="$PYTHON_IMAGE" \
            --build-arg CDNX_R_USER="$CDNX_R_USER" \
            --build-arg CDNX_R_PASSWORD="$CDNX_R_PASSWORD" \
            "${docker_options[@]}" \
            "$POE_ROOT"
    fi
}

# Initialize variables
target_name=""
declare -a docker_options

# Parse command line arguments
while :; do
    case "$1" in
        -h|--help)
            show_help
            exit 0
            ;;
        --target)
            if [ "$2" ]; then
                target_name="$2"
                shift
            else
                echo 'Error: "--target" requires a non-empty option argument.' >&2
                exit 1
            fi
            ;;
        --) # End of all options
            shift
            break
            ;;
        -?*)
            docker_options+=("$1")
            ;;
        *) # End of positional arguments
            break
    esac
    shift
done

# Add remainder of arguments as docker options
for arg in "$@"; do
    docker_options+=("$arg")
done

# Validate the target name is set
if [ -z "$target_name" ]; then
    target_name="build"
fi

# Call the build_target function
build_target "$target_name" "${docker_options[@]}"
