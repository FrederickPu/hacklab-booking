## Deployment and Installation Instructions

### Production Deployment information

As of now, the project is hosted on a VM provided by UTM. There is an Apache instance listening on ports 80 and 443 and reverse proxies to port 3555.

Our app is self-contained and has its own nginx reverse proxy to have all requests to `/api` directed to the backend container and all other requests to the frontend container.

GitHub Actions CI is configured to auto-deploy the [main branch](https://github.com/utmgdsc/hacklab-booking/tree/main) to the UTM production VM.

The frontend was bootstrapped with `create-react-app` and is served by `serve`. The backend is a `nodejs` app.

There are certain environmental variables that the backend expects. These environment variables may be placed in an `.env` file in the `backend` folder, and **must never be pushed to the Git history**.

|Backend enviroment variable name|Purpose|
|-|-|
|`EMAIL_USER`|The username used by `node_mailer` to send emails|
|`EMAIL_PASSWORD`|The password used by `node_mailer` to send emails. Note that an *[app password](https://support.google.com/accounts/answer/185833?hl=en)* may be required for this field.|
|`FRONTEND_URL`|The base URL of the frontend deployment, e.g., `https://hacklabbooking.utm.utoronto.ca`|

To deploy, get the latest code, and run `docker compose up -d --build`. This will start up our application on port 3555. A different port would require modifying the compose file.

### Development Deployment via Docker Compose

- make sure `docker-compose` is installed:

  ```sh
  > docker-compose version
  Docker Compose version v2.17.3
  ```

- make sure `npm` and `node` are installed:
  ```sh
  > node -v
  v20.3.0
  > npm -v
  8.19.2
  ```
- run `npm install` on the `/backend` and `/frontend` directories

  ```sh
  > pwd
  /repos/hacklab-booking # repo root directory
  > cd backend
  > npm install
  > cd ../frontend
  > npm install
  ```

- load `docker-compose.dev.yml` into docker
  ```sh
  > docker compose -f docker-compose.dev.yml up -d
  ```

- once successfully deployed, connect to the frontend by injecting the following request headers to `localhost:3555`. `http_mail` is your email, and `http_cn` is currently unused:
  ```
  utorid
  http_mail
  http_cn
  ```

- connect to PostgreSQL by connecting to `jdbc:postgresql://localhost:5432/postgres` with the credentials `postgres:example`.

    - under the `User` table, modify your account to have the `admin` role.


## Initial Configuration
After installing and deploying *Hacklab Booking*, there are additional steps that must be completed first before it can be used.

### Creating the first admin account
To create an admin account, start by logging in as a regular user. Your account will be created with a `student` role. To modify this role without other administrators, you will have to directly modify the PostgreSQL database.

1. Connect to the database by using `jdbc:postgresql://<deployment url>:5432/postgres`
2. Use the password `example` to access the `User` table.
3. Find your `utorid` and change the role from `student` to `admin`.
4. After refreshing your Hacklab Booking System browser window, you will see an `administrator` button.
![Dashboard with "Admin dashboard" button](https://i.imgur.com/dwZ1WmQ.png)

### Create the first room
1. Access the *Admin dashboard*, which can be accessed by clicking the "Admin" button on the dashboard
![Admin dashboard showing Room manager, User Manager](https://i.imgur.com/Kr2YeCj.png)
2. Access the *Room manager* by clicking "Manage rooms" then click "Create room" and fill in the details
![Room manager in the "Add a room" view with information filled in, the mouse hovering on the "Add" button](https://i.imgur.com/MZT4QAD.png)
3. Click "Add"
4. In the "Control access" page, select at least one approver who can approve requests for that room
![A screenshot of a room in the "Control access" page with somebody selected as the approver](https://i.imgur.com/ARHvz79.png)
5. The room is now ready to accept booking requests
