#!/bin/bash

set -e
# Check for unstaged changes
if git diff --exit-code > /dev/null; then
    if [ "$TERM" != "dumb" ]; then
        echo "No unstaged changes, starting tests."
    fi
else
    echo "There are unstaged changes. Please stage or stash them before committing."
    exit 1
fi

if [ "$TERM" != "dumb" ]; then
    echo -e "\033[0;34mThe '.git/hooks/pre-commit' tests are being run. These tests will ensure that your code meets the necessary standards before it is committed.\033[0m"
    echo "The test container is being created. This may take a while on the first run."
fi
if poe build --target test > /dev/null; then
    if [ "$TERM" == "dumb" ]; then
        test_output=$(set -o pipefail; poe run-tag test | sed 's/\x1b\[[0-9;]*m//g'; exit_code=${PIPESTATUS[0]}; echo exit_code="$exit_code")
        exit_code=$(echo "$test_output" | grep "exit_code=" | sed 's/exit_code=//')
        if [ "$exit_code" -eq 0 ]; then
            echo "All tests pass!"
            exit 0
        else
            echo "Pre-commit tests have failed!  Please inspect 'Show Command Output'"
            echo "$test_output"
            exit "$exit_code"
        fi
    else
        if ! poe run-tag test; then
            echo -e "\033[0;31mThe pre-commit tests have failed. Please review the output from the task above this message for more information.\033[0m"
            exit 1
        fi
    fi
else
    # run it again so the error can be seen
    echo "Test container build failed."
    poe build --target test
fi
