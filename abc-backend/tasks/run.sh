#!/bin/bash

# Enabling exit on error
set -e

# Determine container executable, preferring podman over docker if available
if command -v podman > /dev/null; then
    container_executable="podman"
else
    container_executable="docker"
fi

# Array to hold options
options=("--rm")

# Loop over the arguments to populate options and get the tag
while [[ $# -gt 0 ]]; do
  case "$1" in
    -*)
      if [[ "$#" -gt 1 ]]; then
        # It's an option, add to options array
        options+=("$1")
        shift
      else
        # If there is only one argument left, and it is an option.
        echo "Expected one positional argument: tag" >&2
        exit 1
      fi
      ;;
    *)
      # First non-option argument is the tag
      tag="$1"
      shift
      break
      ;;
  esac
done


# If tag is 'build', add interactive/tty options
if [ "$tag" = "build" ]; then
  options+=("--interactive")
  options+=("--tty")
fi

# Run the container command with the parsed options and tag
"$container_executable" run "${options[@]}" "localhost${POE_ROOT,,}:$tag" "$@"
