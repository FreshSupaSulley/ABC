#!/bin/bash

# to run these tests from push-button run the following:
# docker-compose up --build --force-recreate --exit-code-from test test
# (if using push-button you can use the `run-tests` alias)

set -e

print() {
    python -c '
import sys
from rich import console
c = console.Console(color_system="256")
c.print(sys.argv[1])
' \
"$1"
}

print "[bold blue]Running Ruff"
ruff check \
    --ignore D,I,N,PLR,PLW,RUF,S,W \
    .
print "[green]Ruff Linting Passes
"

print "[bold blue]Running Ruff Format"
ruff format --check --diff . || (print "[red]:warning: It appears ruff format has not been run. \
In vscode use Shift-Alt-F or Shift-Option-F to format code with ruff. Or, run \
'ruff format .' from project root"; false)
print "[green]Ruff Formatting Verified
"



print "[bold blue]Running PyTest"
pytest -vvv --color yes
print "[green]PyTest Passes
"
