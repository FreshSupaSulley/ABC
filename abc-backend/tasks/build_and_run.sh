#!/bin/bash

set -e

# Initialize the tag variable.
tag=""

# Iterate through the arguments to find the first non-option argument.
for arg in "$@"; do
    if [[ "$arg" != -* ]]; then
        tag="$arg"
        break
    fi
done

# If no tag was found, exit with an error.
if [ -z "$tag" ]; then
    echo "Error: No tag specified."
    exit 1
fi

# Run poe commands with the found tag.
poe -q run-if-newer-than "$(poe -q get-local-repo):$tag" poe -q build --target "$tag"
echo -n "$(tput setaf 4)"  # set the termcolor blue
echo "-----------------------------------------------------------------------------"
echo "running $*"
echo "-----------------------------------------------------------------------------"
echo -n "$(tput sgr0)"  #reset the termcolor
poe -q run-tag "$@"
