# ABCD
Approved BOM Catalog (Dev)

This repo contains the frontend and backend repositories as submodules. You can make changes to */abc-frontend* and */abc-backend* and test your changes with `sh dev.sh`. When you push commits on either submoduled repo, their pipelines will build their images to our Nexus repository that can then be tested in prod using `docker-compose`.

See the [confluence page](https://enterprise-confluence.onefiserv.net/pages/viewpage.action?spaceKey=FTSNE&title=Approved+BOM+Catalog+%28ABC%29+-+Concept) for a general overview of this project.

# Prerequisites
Run `sh setup.sh` to fully setup your dev environment. This will:
- Submodule the frontend and backend repos
- Download npm packges and poetry dependencies
- Setup the Django db and create a superuser with `admin/admin` credentials

# Development
Run `sh dev.sh` to start the frontend and backend development servers, allowing you to make changes in each submoduled repo and see live changes. Whenver you push commits on either repo, it triggers their pipeline to build a production Docker image to our Nexus repository. See [production](#production) for testing those images.

## Port conflicts
React uses port 3000 and Django uses 8000. Sometimes on push button servers, another process might already being using these ports. `dev.sh` takes 2 optional arguments that change the frontend and backend ports respectively.
> Example: `sh ./dev.sh 3001 8001` will start React at port 3001 and Django at 8001.

# Production
When you commit your changes to the submoduled repos and need to test the production site:

1. `docker compose down -v`. Clears old images and volumes (-v)
2. `docker-compose pull`. Updates the frontend / backend images
3. `docker-compose up`. Starts all containers

Once you run all of the commands above, you're then able to navigate to *localhost:80* on your browser. **Be sure to port forward it!**

## Hosting on the cloud
There will be differences between testing the images with docker-compose and ABC's eventual cloud deployment. In the cloud config, make sure the `nginx.conf` is copied as closely as possible to keep functionality the same. You'll need to define "services" for the containers to discover each other.

# Notes
## Differences between Dev and Prod
1. The Django admin site is hosted at **localhost:8000/admin**. In prod, you would access */admin*, which redirects you to the Django admin page.

## Learning Resources
This is a great [video](https://www.youtube.com/watch?v=c-QsfbznSXI) for setting up a React frontend with a Django backend (I followed this to get a demo up from the repo [here](https://github.com/techwithtim/Django-React-Full-Stack-App)).
