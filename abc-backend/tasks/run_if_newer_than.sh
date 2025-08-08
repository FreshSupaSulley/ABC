#!/bin/bash

# This script checks for files newer than the 'Created' date of a given Podman image.
# If newer files are found, it proceeds to build. Otherwise, it skips the build.

# Make sure an image name is supplied
if [[ -z "$1" ]]; then
    echo "Usage: $0 <image_name>"
    exit 1
fi

image=$1

# Step 1: Retrieve 'Created' Date from Podman image metadata
if created_date=$(podman inspect --format '{{ .Created }}' "$image"); then
    # The date extracted above is in RFC3339Nano format

    # Step 2: Parse and Convert Date to Local Timezone
    # Remove the fractional seconds and timezone part using awk
    parsed_date=$(echo "$created_date" | awk '{print $1 " " $2}')

    # Convert parsed date to Unix epoch time
    epoch_time=$(date -d "${parsed_date}Z" "+%s")

    # Convert Unix epoch time back to a human-readable format
    formatted_date=$(date -d @"$epoch_time" "+%Y-%m-%d %H:%M:%S")
else
    # shortcut to force a build if it hasn't been built yet
    formatted_date=$(date -d @0 "+%Y-%m-%d %H:%M:%S")
fi

set -e

# Check if converting date was successful
if [[ -z $formatted_date ]]; then
    echo "Failed to convert date format."
    exit 1
fi

# Step 3: Check for files newer than the 'Created' date
# Using find to check for files newer than the specified date
newer_files=$(find "$POE_ROOT" -type f -newermt "$formatted_date" -not -path '*/.*/*')

# Step 4: Conditional build based on file check
if [[ -z "$newer_files" ]]; then
    echo "No newer files found. Skipping build."
else
    echo "Files newer than $formatted_date found. Proceeding with build."
    shift
    "$@"
fi