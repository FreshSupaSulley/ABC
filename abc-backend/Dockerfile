###################
# Prod Dependencies
#
ARG POETRY_IMAGE
ARG PYTHON_IMAGE
FROM ${POETRY_IMAGE} AS prod-dependencies
ARG CDNX_R_USER
ARG CDNX_R_PASSWORD

COPY pyproject.toml poetry.lock ./
RUN run_install.py prod-deps


##################
# Test Dependencies
#
FROM prod-dependencies AS test-dependencies
ARG CDNX_R_USER
ARG CDNX_R_PASSWORD

RUN run_install.py test-deps

############
# Unit tests
#
FROM ${PYTHON_IMAGE} AS test

ENV PYTHONPATH=/usr/src/app


COPY --from=test-dependencies /usr/local/app/venv/ /usr/local/app/venv/

WORKDIR /usr/src/app/
# Copy in the application code
COPY . .

# Set up Entrypoint
ENTRYPOINT  ["/bin/bash"]
CMD ["-c", "source /usr/local/app/venv/bin/activate && /usr/src/app/tests.sh"]

########################
# Prod Code Installation
#
FROM prod-dependencies as prod-full

COPY . .
# RUN run_install.py prod-final

#############
# Final image
#
# This creates a runnable CLI container
ARG GIT_REMOTE
FROM ${PYTHON_IMAGE} AS build
LABEL io.fisv.Maintainer="Erich Boschert"
LABEL io.fisv.MaintainerEmail="erich.boschert@fiserv.com"
LABEL io.fisv.GitRepo="${GIT_REMOTE}"
LABEL io.fisv.AppName="ABC Backend"
LABEL io.fisv.AppSlug="abc-backend"

WORKDIR /usr/src/app
ENV PATH=/usr/local/app/venv/bin:$PATH

COPY --from=prod-full /usr/local/app/venv/ /usr/local/app/venv/

COPY . .

# You're apparently supposed to do this
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

RUN python manage.py collectstatic --noinput
# Is this required?? maybe
RUN chmod +x /usr/src/app/start.sh

# Runs the shell script that configures Django
ENTRYPOINT [ "sh", "-c", "./start.sh" ]
