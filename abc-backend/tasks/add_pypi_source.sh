#!/bin/bash

show_help() {
    echo "Usage: $0 <url>"
    echo ""
    echo "This script adds a poetry source and configures HTTP Basic Auth for a specified URL."
    echo "The URL must point to a 'onefiserv.net' nexus source."
    echo ""
    echo "Options:"
    echo "  --help    Display this help message and exit."
}

# Function to extract hostname from URL
get_hostname() {
    local url="$1"
    echo "$url" | awk -F[/:] '{print $4}'
}

# Function to validate hostname
validate_hostname() {
    local hostname="$1"
    local suffix="onefiserv.net"
    if [[ "$hostname" != *"$suffix" ]]; then
        echo "Error: Fiserv restricts access to sources other than our own."
        exit 1
    fi
}

# Function to construct the source name
construct_source_name() {
    local url="$1"
    local base_name
    base_name=$(echo "$url" | awk -F/ '{print $5}')
    local repo_id
    repo_id=$(echo "$base_name" | awk -F- '{print $2}')  # Assuming it's always the second
    # Extract the relevant part before 'repository' in the URL (e.g., nexus-ci or nexus-dev)
    local prefix
    prefix=$(echo "$url" | awk -F/ '{print $3}' | awk -F. '{print $1}')
    echo "${prefix}-${repo_id}"
}

# Check if help is requested or no argument provided
if [[ "$1" == "--help" || "$#" -lt 1 ]]; then
    show_help
    exit 0
fi

# Extract hostname from the input URL
input_url="$1"
hostname=$(get_hostname "$input_url")

# Validate the hostname
validate_hostname "$hostname"

# Construct the source name
source_name=$(construct_source_name "$input_url")

# Add the poetry source
poetry source add --priority=explicit "$source_name" "$input_url"

# Assuming the environment variables CDNX_R_USER and CDNX_R_PASSWORD are set for authentication
poetry config http-basic."$source_name" "$CDNX_R_USER" "$CDNX_R_PASSWORD"

echo "Poetry source added and configured successfully for $source_name."
echo "Add packages with 'poetry add --source $source_name <package-name>'"
