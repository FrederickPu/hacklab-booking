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

## User Guide
### Logging in
1. Go to the [Hacklab Booking System](https://hacklabbooking.utm.utoronto.ca)
2. If you are not to sign into U of T, you are already logged in. Otherwise, follow the usual U of T login process via Shibboleth.
![Shibboleth login](https://i.imgur.com/GgzBHBJ.png)
3. You will be redirected to the dashboard.

### Create a group
1. Click on the "Groups" button on the dashboard
![Dashboard groups button](https://i.imgur.com/j2ART5i.png)
2. Click on the "Create group" button
![Create group](https://i.imgur.com/eatbGgy.png)
3. Fill in the group name and press "Add"
![Adding a group](https://i.imgur.com/jULY8vt.png)
4. You should now see the group in the list of groups
![Groups list](https://i.imgur.com/ey7jeiC.png)

### Manage group
#### Invite a member
1. Go to the group view by clicking on "view" while in the groups list
2. Click "Add Student"
![Adding a student](https://i.imgur.com/v9UvTuL.png)
3. Fill in the student's utorid and press "Add"
![Adding a student (pop up)](https://i.imgur.com/flTTEBu.png)
4. The student has been sent an invitation to join the group. They will be able to accept the invite from their dashboard.
#### Manage invitations
1. Go to the group view by clicking on "View" while in the groups list
2. If you have any pending invites you should see them in the "Pending Invites" section
![Pending group invite](https://i.imgur.com/cnThyBv.png)
3. You can either accept or decline the invite, if you accept you should see the group in your list of groups, if you decline you will no longer see the invite and will need a new invite to join the group.
#### Remove a member
1. Go to the group view by clicking on "view" while in the groups list
2. Click on the "Remove" button next to the member you want to remove (note that only group managers can remove members)
3. The member has been removed from the group, they will need a new invite to join the group. Note that all their requests will remain in the system.
#### Delete a group
1. Go to the group view by clicking on "view" while in the groups list
2. Click on the "Delete" button
3. The group has been deleted. Note that all requests from this group will be deleted.
#### Leave a group
1. Go to the group view by clicking on "view" while in the groups list
2. Click on the "Leave" button, note that you can only leave if the group has more than one manager (if you are the only manager you will have to delete the group)
3. You have left the group. Note that your all requests will remain in the system.
#### Group role hierarchy
- There are two roles in a group: **group manager** and **group member**.
- Group managers can invite/remove members, delete the group, and approve requests from the group.
- **Group managers can demote/remove other group managers. Only promote trusted members.**
- Group members can create requests for the group.
- Managers can manage the group's roles in the group view.
### Create a request
1. Click on the "book" button on the dashboard
![book request dashboard](https://i.imgur.com/DnexMV8.png)
2. Fill in the booking request information and click "Submit"
3. The request has been sent to the approvers you selected.
4. You can view the request in the "Active requests" section of the dashboard
### Cancel/edit a request
You can cancel/edit active requests from the dashboard using the icons on the top right of the card.
![Request card](https://i.imgur.com/uTj2x9F.png)
### Approve a request
1. If you are an admin or an approver, you will see a "Your Pending Requests" section on the dashboard.
2. You can approve/deny requests from this section using the buttons on the bottom of the card.
![Approver request card](https://i.imgur.com/4B14jpx.png)
3. You are required to provide a reason for approving/denying the request using the pop-up.
![Approval reason pop-up](https://i.imgur.com/W4FShSh.png)
4. Once you enter a reason, the request will be approved/denied.
5. If the request is approved, the request author will be notified and the request will be marked as "pending TCard access" if the author does not already have room access, otherwise the request will be marked as "completed".

**Note**: If you are not an admin, you will only see requests assigned to you.
### Grant TCard access
1. If you are an admin or a TCard approver, you will see a "Your Pending Requests" section on the dashboard.
2. These requests are requests that have been approved by an approver and require TCard access to be granted.
![TCard Approval](https://i.imgur.com/CxizndJ.png)
4. Once you give the author TCard access, you can mark TCard access by clicking on the "TCard access was granted" button on the request card.

**Note**: If you are an admin you will see both requests that require TCard access and requests that require approval.