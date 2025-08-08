#!/bin/bash

# Function to display help text
show_help() {
    echo "Usage: $0 <registry/repo:image-tag> [--timeout <time-in-seconds>]"
    echo ""
    echo "Wait for a Docker image with the specified tag to exist in the given registry."
    echo ""
    echo "Options:"
    echo "  --timeout  Set the timeout period in seconds (default: 600 seconds)."
}

# Default timeout (10 minutes in seconds)
DEFAULT_TIMEOUT=600

# Parse arguments
TIMEOUT=$DEFAULT_TIMEOUT
IMAGE_TAG=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            IMAGE_TAG="$1"
            shift
            ;;
    esac
done

# Validate IMAGE_TAG argument
if [ -z "$IMAGE_TAG" ]; then
    echo "Error: image tag is required."
    show_help
    exit 1
fi

# Split the IMAGE_TAG into registry, repository and tag
if [[ "$IMAGE_TAG" == */*:* ]]; then
    REGISTRY=${IMAGE_TAG%%/*}
    REST=${IMAGE_TAG#*/}
    REPOSITORY=${REST%:*}
    TAG=${REST##*:}
else
    echo "Error: image tag must be in the format <registry>/repo:tag"
    exit 1
fi

# Function to check if the Docker image tag exists in the registry
check_image_exists() {
    curl -fsSL "https://$REGISTRY/v2/$REPOSITORY/manifests/$TAG" > /dev/null 2>&1
}

# Function to print out additional timeout information
print_timeout_info() {
    echo "==> Timeout reached after waiting $TIMEOUT seconds.
==> Image \"$IMAGE_TAG\" not found in the Nexus PROD container registry.

ISSUE: The image was not promoted to Nexus PROD container registry by the Genesys Pipeline.

RESOLUTION:
    1. Re-run the FULL pipeline to re-kickoff the genesys pipeline, as the pipeline has issues at times.

        To do this:
        a. click on Build->Pipelines on the left side of the gitlab UI
        b. click on the 'Run pipeline' blue button on the top right of the screen
        c. select the branch you want to rerun from the 'Run for branch or tag' dropdown
        d. click on the 'Run pipeline' button
        e. if the wait_for stage fails again, then go to resolution 2

    2. Contact the DevEX team to investigate why the Genesys Pipeline did not promote the image.

        - The Plato team does not own or have the needed access to resolve issues with the Genesys Pipeline.
"
}

# Start time
start_time=$(date +%s)

# Check loop
echo "Waiting for \"$IMAGE_TAG\" to be scanned and promoted.

+---------------+        +--------------+               +----------+                     +------------+
| cookiecutter  |------->| Nexus CI Dev |-------------->| Genesys  |-------------------->| Nexus PROD |
|     repo      | pushes |  container   |     nexus     | Pipeline | if scans successful | container  |
|   pipeline    |   to   |  registry    | automatically |  scans   |  then promotes to   | registry   |
+---------------+        +--------------+   initiates   +----------+                     +------------+

    ***********************************************************************************************
    ** This stage is waiting to ensure that your container passes scans and has been promoted to **
    ** Nexus PROD so that you can access it from your rundeck job using fmk.nexus.onefiserv.net. **
    ** The cookiecutter repo does not control the Genesys Pipeline, which is owned by the DevEX  **
    ** team.  We are just waiting for the pipeline to complete and promote your container.       **
    ***********************************************************************************************
"
while true; do
    if check_image_exists; then
        echo "Image $REGISTRY/$REPOSITORY:$TAG found."
        exit 0
    else
        current_time=$(date +%s)
        if (( current_time - start_time >= TIMEOUT )); then
            print_timeout_info
            exit 1
        fi
        sleep 10
    fi
done
