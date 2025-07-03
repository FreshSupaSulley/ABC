# Approved BOM Catalog

React frontend, Django backend. No cookie-cutter BS (yet), unsure to what extent this will be dockerized. This is likely just going to be the place to do dev as it will be deployed elsewhere.

[Template repo](https://github.com/techwithtim/Django-React-Full-Stack-App/blob/d7f1f708cb7188b25fe2c19e9715d9305e4a2346/backend/api/views.py#L13)

## Quickstart
You need 2 shells, one for the frontend and one for the backend. See the respective subfolders on how to start them. Or just run `sh run.sh` at the root.

# bs

Please add your documentation here and delete the cookiecutter info once you project has been released.

# Notes on Using this Template
- To clone this repo use the clone pulldown on the main page to copy the command.  Click Approved BOM Catalog in the upper left to get to the main page.
- All build-related files are located in the root of the project, while all python files are located in the approved_bom_catalog folder.
- You will find the following section in pyproject.toml.  The configuration means that after running `poetry install` and entering the venv you will be able to run `approved-bom-catalog` which will invoke the function main in the file `approved_bom_catalog/main.py`
```toml
[tool.poetry.scripts]
approved-bom-catalog = "approved_bom_catalog.main:main"
```
- You may add as many scripts as you would like there pointing to other functions.
- This initial script is the ENTRYPOINT of the docker container.  You may change this on the last line of `Dockerfile` or switch it back to `python` and use a script name as a command.
# Setup Script
- The `cc-setup` script can be used on the pushbutton server to set up recommended [direnv](https://direnv.net) and Visual Studio Code (VS Code) settings:
    - Adds recommended VS Code settings to the workspace (.vscode folder)
    - Adds recommended VS Code extensions
    - Creates a .envrc file for [direnv](https://direnv.net/), enables it, and runs it
    - Adds a pre-commit hook to run all tests before committing

- The resulting `.envrc` file will does the following automatically whenever you enter the project folder or a sub-folder:
    - Installs or updates the Python virtual environment (venv)

    - Configures vscode to use the venv
    - Activates the venv
    - Watches pyproject.toml and requirements.yml for changes and automatically installs or updates when changes are detected
    - Adds a pre-commit hook and runs the tests before a commit is made, to improve the chances the build will succeed in the Gitlab pipeline
