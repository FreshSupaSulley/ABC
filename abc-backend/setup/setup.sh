#!/bin/bash
# Define the user prompt with pretty and noticeable colors:
# Define ANSI color codes for better readability
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
BOLD="\033[1m"
RESET="\033[0m"

# Craft the prompt message with embedded color codes
USER_PROMPT="${GREEN}Would you like to set up this folder with recommended settings?${RESET} (${BLUE}[${BOLD}Y${RESET}${BLUE}]es${RESET}, ${RED}[${BOLD}n${RESET}${RED}]o${RESET}, or ${YELLOW}[${BOLD}d${RESET}${YELLOW}]on't ask again${RESET})"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo "jq is required but not installed. Please install jq and retry."
  exit 1
fi

# Function to prompt the user until a valid response is given
get_user_choice() {
  local valid_input=0
  while [ $valid_input -eq 0 ]; do
    echo -en "${USER_PROMPT}"
    read -r -n 1 user_choice
    echo # move to new line
    user_choice=$(echo "$user_choice" | tr '[:upper:]' '[:lower:]') # ensure case insensitivity

    case "$user_choice" in
      y|n|d)
        valid_input=1
        ;;
      *)
        echo "Invalid input. Please type 'y' for yes, 'n' for no, or 'd' for don't ask again."
        valid_input=0
        ;;
    esac
  done
}

wait_for_key() {
  echo "Press any key to continue..."
  read -n 1 -s
}

# Check if all required files exist
if [ -f .envrc ] && [ -f .vscode/settings.json ] && [ -f .git/hooks/pre-commit ]; then
  echo "This project has already been set up, exiting."
  exit 0
fi

# Prompt the user until a valid input is given
get_user_choice

# Handle user choices
case "$user_choice" in
  [nN]) 
    echo "Have a nice day!!"
    exit 0
    ;;
  [dD])
    echo "This isn't implemented yet."
    wait_for_key
    exit 0
    ;;
  [yY])
    # If the target file does not exist, copy the setup file
    if [ ! -f .vscode/settings.json ]; then
      cp setup/vscode/settings.json .vscode/settings.json
      echo ".vscode/settings.json was set up."
    else
      echo ".vscode/settings.json already exists."
    fi

    if [ ! -f .envrc ]; then
      cp setup/envrc .envrc
      echo ".envrc was set up."
    else
      echo ".envrc already exists."
    fi

    if [ ! -f .git/hooks/pre-commit ]; then
      cp setup/pre-commit-hook.sh .git/hooks/pre-commit
      echo ".git/hooks/pre-commit was set up."
    else
      echo ".git/hooks/pre-commit already exists."
    fi

    # Apply direnv settings
    direnv allow

    # Run the initial poetry install and collection install
    # Direnv does not seem to be doing it in this context
    poetry env use 3.12
    poetry install
    poetry run bash -c 'insert_vscode_settings "python.defaultInterpreterPath:$VIRTUAL_ENV/bin/python"'

    
    wait_for_key
    ;;
  *)
    echo "Invalid input. Please run the script again and provide a valid input."
    exit 1
    ;;
esac
