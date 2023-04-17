# Hosting
## Prod deployment
As of now, the project is hosted on a VM provided by UTM.
There is an Apache instance listening on ports 80 and 443 and reverse proxies to port 3555.

Our app is self-contained and has its own nginx reverse proxy to have all requests to `/api` directed to the backend container and all other requests to the frontend container.

The front end is created with react and is served by serve.
The backend is a nodejs app.

To deploy, get the latest code, and run `docker compose up -d --build`.
This will start up our application on port 3555. A different port would require modifying the compose file.