#!/bin/bash

# Define color variables using tput
WELCOME=$(tput setaf 5; tput bold)  # purple
NOTE=$(tput setaf 3)  # yellow
COMMAND=$(tput setaf 4; tput bold)  # blue
ARG=$(tput setaf 2)  # green
RESET=$(tput sgr0)

# Use the variable within the heredoc
cat << EOF
${WELCOME}Welcome to the Fiserv Cookiecutter Repository${RESET}

${NOTE}We've made it easy to test and run your projects on local containers to match the environment used on push-button servers and Rundeck. Here are some helpful commands to get you started. These commands will automatically build if there are new files, so you don't have to do it manually.${RESET}

${COMMAND}poe test${RESET}
Runs the same tests that are checked in pre-commit hooks or pipelines. If they pass here, they should pass everywhere else. Make sure you have the recommended VSCode extensions installed to catch issues early.

${COMMAND}poe run${RESET}
Executes your main workflow. You can override any Dockerfile arguments by adding them to this command. For example:
  - Python: ${ARG}poe run <args_for_my_command>${RESET}
  - Ansible: ${ARG}poe run my-playbook.yml -i my-inventory${RESET}
  Ansible arguments are passed to ${ARG}ansible-playbook${RESET}. For Python, the script executes from ${ARG}code_folder/main.py${RESET}, starting at the ${ARG}main()${RESET} function.

${COMMAND}poe explore${RESET}
This command builds your container (if necessary) and opens a shell inside it. It's a convenient way to check the container's contents and structure.

${NOTE}Tip: These commands encourage you to open your project folder in VSCode for the best development experience. It saves time and helps ensure your code meets all required standards and checks.${RESET}

EOF
