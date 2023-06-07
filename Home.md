## Introduction
This document describes the Hacklab Booking System. It outlines its high level purpose, design, as well as documentation for the backend API and frontend components. There is also be a brief software bill of materials and a rationale for why each dependency is used. 

### Revision History
| Version | Date       | Changelog       |
| ------- | ---------- | --------------- |
| 2.0     | 2023-06-07 | Initial release |


### Purpose

The Hacklab is a space for students and student organizations to work, socialize, learn, and develop their skills. As of now, few groups can use Hacklab for meetings because it requires TCard access. **Our solution makes Hacklab a more accessible place for everyone who needs it.** For example, groups for upper-year courses may want Hacklab to host standups but are unable due to the TCard requirement. To allow clubs and student groups to access the Hacklab for these meetings, we proposed a booking system allowing students to book the Hacklab. Any current bookings may then be viewed on the **Hacklab iPad** that will be placed in front of the Hacklab, alerting students of private meeting occupancy. The _Hacklab Booking System_ project from Winter 2023 is the solution to this problem, but it currently **needs features and stability for production deployment.**


### Scope

The goal of the Hacklab Booking System to make it ready for production use. First and foremost, **a rewrite of the backend server is needed to scale better with users and rooms.** For instance, some backend routes currently run at O(n) with respect to the number of users, which would be unacceptable for a production environment. Another issue is that our backend routes are integrated too tightly with the frontend, which makes our API less extensible for people who would like to use it. Our proposed solution is to migrate the current database from MongoDB to PostgreSQL.

Next, the current booking system allows faculty to approve and deny requests; however, there is only one avenue for notifications–email, which not everyone may check frequently. This issue may be solved by **adding more venues for notifications**, including Discord, Slack, and Web notifications via service workers. Furthermore the user experience for request approvers to approve and deny requests in the notification itself is also improved. 

Finally, the **code quality of the existing codebase** is improved by using *TypeScript*, which would increase the readability and predictability of our codebase. There is also a *GitHub Wiki* to document backend routes and functions to increase maintainability for future teams, decreasing the need to first acquire tribal knowledge. This would allow our booking system to be safely deployed for the Hacklab for years to come.


## System Overview

### Technology Stack

![Tech Stack diagram](https://i.imgur.com/syb7drv.png)

A full software bill of materials may be found in the [backend package.json](https://github.com/utmgdsc/hacklab-booking/blob/main/backend/package.json),  the [frontend package.json](https://github.com/utmgdsc/hacklab-booking/blob/main/frontend/package.json), and in the `Dockerfile`s of both.

For our backend and frontend, we aim to use [TypeScript](https://www.typescriptlang.org/) as much as possible for easier readability. We also aim to use [ESLint](https://eslint.org/) as a pre-commit hoot for the same reason. 

Our code will be hosted on our [GitHub repository](https://github.com/utmgdsc/hacklab-booking) and production servers are deployed with [Docker Compose](https://docs.docker.com/compose/) using [Docker](https://www.docker.com/) containers.

The Docker containers will be hosted in a UofT-provided virtual machine, and authentication is handled by [UofT's SSO auth, Shibboleth](http://sites.utoronto.ca/security/projects/shibboleth.htm). 

#### Frontend
 * [**React**](https://react.dev) - A component-based library for JavaScript. Our frontend is bootstrapped with [`create-react-app`](https://create-react-app.dev/).
 * [**Material UI**](https://mui.com/material-ui/) - A majority of our frontend components are from MaterialUI, which are a library of components implementing [Google's Material Design](https://m2.material.io/).
 * [**Axios**](https://axios-http.com/) - An HTTP client for JavaScript, which simplify network requests to the backend API. 
 * [**DayJS**](https://day.js.org/) - Required for the [MaterialUI `DatePicker`](https://mui.com/x/react-date-pickers/date-picker/) component to work. Also simplifies the manipulation of dates for the booking pages.
 * [**Apple iPad**](https://www.apple.com/ca/ipad/) - For displaying current events in front of Hacklab

The Material UI component library was chosen as our project is under [GDSC UTM](https://gdscutm.com), a club affiliated with Google. Thus, a component library that mimics Google's design language will better align with our organization's design.

#### Backend
 * **[NGINX](https://www.nginx.com/)** - Reverse proxy that allows our webapp to be hosted on port 443.
 * **[NodeJS](https://nodejs.org)** - JavaScript on server side :yum:
 * **[ExpressJS](https://expressjs.com)** - An RESTful backend web application framework for NodeJS.
 * **[Google API](https://github.com/googleapis/google-api-nodejs-client)** - Allows for integration with Gmail, Google Calendar.
 * **[Prisma](https://www.prisma.io/)** - Next-generation Node.js and TypeScript ORM that supports PostgreSQL

#### Database
 * [**PostgreSQL**](https://www.postgresql.org/) - An open source SQL-compliant relational database system.
A relational databse was chosen for this project as a replacement for the previous *MongoDB*, as our dataset is highly relational. For instance, each request has an author (which is a `User`), a `Group`, and a `Room`. `Group`s store different arrays for `User`s depending on whether they're a member, invited, or a group manager, and so on.



## System Architecture

![Abstracted System Architecture](https://i.imgur.com/YgUfPZs.png)
*This heavily simplified flowchart depicts the system architecture. The user logs in using Shibboleth to access the frontend. The frontend communicates using the REST API to make requests to the server, which modifies the database accordindly using the ORM (Prisma) interface.*

### User Roles

#### Student

The student role is the default role given to everyone upon first launch (given already authenticated with Shibboleth. It gives the following permissions:

* Create a group


#### Request Approver

The request approver role is manually given to faculty upon request. It gives the following permissions:

* View a log of all previous requests
* Can approve/deny requests made by any student


#### TCard Approver

The TCard Approver role is given to system administrators (e.g., Andrew Wang) for the purposes of notifying the student that TCard access has been granted. It gives the following permissions:

* View a log of all previous requests
* Modify students’ database entry regarding TCard access


#### Administrator

The administrator role has all permissions (i.e., the permissions of both Request Approver and TCard Approver) and is given to faculty upon request. It gives the following permissions:

* View a log of all previous requests
* Modify students’ database entry regarding TCard access
* Can approve/deny requests made by any student
* Reject bookings that are already approved
* Can delete student groups


### Groups

Groups are a concept used by the Hacklab Booking System to allow multiple people to view the status of bookings. There is no limit for how many members a group can have, and there is no limit for the number of total groups. Students **must be added into a group or create a group in order to create requests**.

#### Student Group Roles

In a group, there are two roles with the following permissions:


###### Group Manager

* Can add/remove people to the group (without approval from faculty)
* Can delete other bookings within their group
* Can delete the group


###### Group Member

* Can request bookings under their group name
* Can leave the group
* Can view all the group’s bookings


### Design Constraints and Limitations

Our design has some limitations:

* Administrators do not have permission to make other people administrator. Their role must be changed in the database manually.


## Data Design
![Data design diagram](https://i.imgur.com/RjVoK7P.png)
*This diagram depicts a high level overview of the data design.*

### Data Description
#### Accounts
This table stores the account infomation for all users (students and faculty). The permission level is identified by the role field. 
```dbml
Table accounts {
  id integer [pk]
  utorid string
  email string
  name string 
  role account_role
}
``` 
#### Account roles
This enum defines the permission level of a user, for more information see [User Roles](#User-Roles)
```dbml
enum account_role {
    student
    admin
    approver
    tcard
}
```

#### Request
This table stores all requests. Each request as a group and a room assigned to it. The status field is an enum which represents the current status of the request, see [Request status enum](#Request-status-enum).
```dbml
Table requests {
  id integer [pk]
  status request_status // the status of the request defined by the Request status enum
  group integer [ref: > groups.id] // the group making the request
  author integer [ref: > accounts.id] // the author of the request
  approver integer [ref: > accounts.id] // (optional) if the request has been approved 
  start_date date // the starting date and time of the request in ISO 8601 format
  end_date date // the ending date and time of the request in ISO 8601 format
  description string // a summary of the event provided to the approvers for review
  title string // the name of the event
  room integer [ref: > rooms.id] // the room booked
  reason string [null] // (optional) the reason for the denial/approval of a request
}
```

#### Request status enum
Every request must have a status, the status shows the state of a given request.
```dbml
enum request_status {
  pending // the request is awaiting approver's approval 
  denied // the request has been denied by approver
  cancelled // the request has been cancelled by the author or group manager
  need_tcard // the request has been approved by an approver but still needs TCard approval
  completed // the request is approved and author has TCard access
}
```

#### Groups
This table contains information about the groups. 
```dbml
Table groups {
  id integer [pk]
  members integer[] [ref: <> accounts.id] // all members of the group, including managers, excluding any invited users 
  invited integer[] [ref: <> accounts.id] // users that have been invited to the group and have yet to accept
  managers integer[] [ref: <> accounts.id] // the managers of the group
}
```

#### Rooms
This table stores all bookable rooms.
```dbml
Table rooms {
  id integer [pk]
  room_name string // the room number, eg. DH2014
  friendly_name string // friendly name, eg. Hacklab
  capacity integer // (optional) occupancy limit
}
```

### Google API Integration

Google API integration is handelled by [google-api-javascript-client](https://github.com/google/google-api-javascript-client). The backend is linked with the Google Account `hacklab.booking<at>gmail<dot>com` It is currently used for updating the Hacklab Google Calendar and sending emails. 

#### Email Notifications

Email notifications are handled by the Google API integration. Emails are sent on the Hacklab Booking Google account for the purposes of notification only. Emails are sent in a plain-text format with actionable buttons, which lead to the Hacklab Booking website.


## Backend REST API v2 Design

Items that are not checked as "Optional" are required fields.

### Booking Requests 

#### `POST /requests/create`

Creates a request under a group.

###### Request Parameters
Parameters are not required for this API route.

###### Authorization
This HTTP request can only be performed by members of the group specified in the `group` parameter.

###### Request body
| Field         | Type     | Description                                                 | Optional |
| ------------- | -------- | ----------------------------------------------------------- | --- |
| `group`       | `string` | The ID of the group that will be representing this request. |     |
| `start_date`  | `Date`   | The start date for the booking                              |     |
| `end_date`    | `Date`   | The end date for the booking                                |     |
| `description` | `string` | Description of the booking                                  |    |
| `title`       | `string` | The title of the booking                                    |     |
| `room`        | `string` | The room number of the booking                              |     |

###### Response 
If successful, this endpoint returns an HTTP 200 code with the newly created `Request` object.
If the user is not part of the supplied group, HTTP 403 is returned.
If the `start_date` is after `end_date` HTTP 400 is returned.


#### `GET /requests`

Get requests by user or group. See the Authorization section for more information on default behaviour.

###### Request Parameters
| Field         | Type     | Description                                                 | Optional           |
| ------------- | -------- | ----------------------------------------------------------- | ------------------ |
| `start_date`  | `Date`   | The start date for the booking                              | :heavy_check_mark: |
| `group`       | `string` | The ID of the group that will be representing this request. | :heavy_check_mark: |
| `end_date`    | `Date`   | The end date for the booking                                | :heavy_check_mark: |
| `description` | `string` | Description of the booking                                  | :heavy_check_mark: |
| `title`       | `string` | The title of the booking                                    | :heavy_check_mark: |
| `room`        | `string` | The room number of the booking                              | :heavy_check_mark: |


###### Authorization
For administrators, this request returns all active future requests by default (i.e., when no parameters are supplied).

For students, this request returns all active future requests of any groups the user is a part of.


###### Response 
If successful, this endpoint returns an HTTP 200 code with a `Request` array.
If a student tries to access other user's or group's requests, the endpoint will return HTTP 403.


#### `GET /requests/:id`

Get request info given a request ID.

###### Request Parameters
Do not supply request parameters with this endpoint.


###### Authorization
For administrators, this request returns all active future requests by default (i.e., when no parameters are supplied).

For students, this request returns all active future requests of any groups the user is a part of.


###### Response 
If successful, this endpoint returns an HTTP 200 code with the `Request` object specified.

If the user does not have permission to view this request, then this endpoint returns HTTP 403. It will return HTTP 404 if the request ID does not exist.


#### `DELETE /requests/:id`

Delete a request given a request ID.

###### Request Parameters
Do not supply request parameters with this endpoint.

###### Authorization
Only managers of the group which the request belongs to, the author of the request, and administrators may delete the request.

###### Response 
If successful, this endpoint returns an HTTP 200 code.

If the user does not have permission to delete this request, then this endpoint returns HTTP 403. It will return HTTP 404 if the request ID does not exist.


#### `POST /requests/:id`

Modify a request given its ID.

###### Request Parameters
| Field         | Type     | Description                                                 | Optional           |
| ------------- | -------- | ----------------------------------------------------------- | ------------------ |
| `start_date`  | `Date`   | The start date for the booking                              | :heavy_check_mark: |
| `group`       | `string` | The ID of the group that will be representing this request. | :heavy_check_mark: |
| `end_date`    | `Date`   | The end date for the booking                                | :heavy_check_mark: |
| `description` | `string` | Description of the booking                                  | :heavy_check_mark: |
| `title`       | `string` | The title of the booking                                    | :heavy_check_mark: |
| `room`        | `string` | The room number of the booking                              | :heavy_check_mark: |


###### Authorization
Only managers of the group which the request belongs to, the author of the request, and administrators may edit the request.


###### Response 
If successful, this endpoint returns an HTTP 200 code.

If the user does not have permission to delete this request, then this endpoint returns HTTP 403. It will return HTTP 404 if the request ID does not exist.



### Accounts 

#### `GET /accounts`

Get the current user info (based on who is currently logged in)

###### Request Parameters
Parameters are not required for this API route.

###### Authorization
Can be used by anyone authenticated by Shibboleth.


###### Response 
this endpoint returns an HTTP 200 code with the requested `Account` object.

#### `GET /accounts/:utorid`

Get the user info of a certain user.

###### Request Parameters
Parameters are not required for this API route.

###### Authorization
Can only be used by admins.


###### Response 
this endpoint returns an HTTP 200 code with the requested `Account` object or a HTTP 403 if the user lacks permissions.


#### `PUT /accounts/:id/changerole`

Change the role of a user.

###### Request Parameters
Do not supply request parameters with this endpoint.

###### Request body
| Field         | Type     | Description                                                 | Optional |
| ------------- | -------- | ----------------------------------------------------------- | --- |
| `role`       | `string` | The new role of the user (can either be `student`, `approver`, `tcard`, or `admin`) |     |

###### Authorization
This is an admin only endpoint.

###### Response 
If successful, this endpoint returns an HTTP 200 code.
If anyone other than admins tries to access this endpoint, the endpoint will return HTTP 403.

#### `POST /accounts/changetheme`

Change the current theme of the logged in user. `system` specifies that the theme will be decided based on the system preferences.

###### Request Parameters
Parameters are not required for this API route.

###### Request body
| Field         | Type     | Description                                                 | Optional |
| ------------- | -------- | ----------------------------------------------------------- | --- |
| `theme`       | `string` | The new role of the user (can either be `light`, `dark`, or `system`) |     |


###### Authorization
Can be used by anyone authenticated by Shibboleth.


###### Response 
This endpoint returns HTTP 200 on a successful theme change, otherwise HTTP 400 is returned.


### Rooms
#### `GET /rooms/:room`

Get room info given its room number.

###### Request Parameters
Do not supply request parameters with this endpoint.

###### Authorization
Only managers of the group which the request belongs to, the author of the request, and administrators may edit the request.


###### Response 
If successful, this endpoint returns an HTTP 200 code and the `Room` object specified by the path parameter.

If the user does not have permission to delete this request, then this endpoint returns HTTP 403. It will return HTTP 404 if the request ID does not exist.


#### `GET /rooms/:rooms/blockeddates`

Return all the dates already booked or pending, defaults to within the next week.

###### Request Parameters
| Field        | Type     | Description                                                                                        | Optional           |
| ------------ | -------- | -------------------------------------------------------------------------------------------------- | ------------------ |
| `start_date` | `Date`   | The start date to filter by in the ISO 8601 format. (YYYY-MM-DD). Defaults to the current date.    | :heavy_check_mark: |
| `group`      | `string` | The end date to filter by in ISO 8601 format. (YYYY-MM-DD). Defaults to the current date + 7 days. | :heavy_check_mark: |

###### Authorization
All authenticated users can access this endpoint.

###### Response 
If successful, this endpoint returns an HTTP 200 code and an array of date strings in ISO 8061 format. 


#### `PUT /rooms/:rooms/grantAccess`

Given a room and UTORid, update the user with the supplied UTORid to have access to the room supplied by the path parameters.

###### Request Parameters
Do not supply request parameters with this endpoint.


###### Authorization
Only `tcard` and `admin` roles are approved to call this endpoint.

###### Request Body
| Field    | Type     | Description                                            | Optional |
| -------- | -------- | ------------------------------------------------------ | -------- |
| `utorid` | `string` | The UTORid of the student that will be granted access. |          |

###### Response 
If successful, this endpoint returns an HTTP 200 code. 

If the user or room doesn't exist or is not found, this endpoint returns an HTTP 404 code. 

If the method caller does not have the `tcard` or `admin` role, this endpoint returns an HTTP 430 code.


#### `GET /rooms/:rooms/requests`

Return all the dates already booked or pending, defaults to all requests.

###### Request Parameters
| Field        | Type     | Description                                                                                        | Optional           |
| ------------ | -------- | -------------------------------------------------------------------------------------------------- | ------------------ |
| `start_date` | `Date`   | The start date to filter by in the ISO 8601 format. (YYYY-MM-DD). Defaults to the current date.    | :heavy_check_mark: |
| `group`      | `string` | The end date to filter by in ISO 8601 format. (YYYY-MM-DD). Defaults to the current date + 7 days. | :heavy_check_mark: |

###### Authorization
All authenticated users can access this endpoint.

###### Response 
If successful, this endpoint returns an HTTP 200 code and an array of request objects.



### Groups
#### `GET /groups`

Get all groups you belong to (will return all existing groups for staff)

###### Request Parameters
Do not supply request parameters with this endpoint.


###### Authorization
Can be used by anyone authenticated by Shibboleth.


###### Response 
This endpoint returns an HTTP 200 code with an array of `Group` objects. 

#### `GET /groups/:id`

Get information about a certain group.

###### Request Parameters
Do not supply request parameters with this endpoint.


###### Authorization
Can be used by anyone authenticated by Shibboleth.


###### Response 
If successful, this endpoint returns an HTTP 200 code with a `Group` object.
Returns 403 if the user is not an admin and is not part of the group.


#### `POST /groups/create`

Create a new student group, with the current user as its manager.

###### Request Parameters
Do not supply request parameters with this endpoint.


###### Authorization
Can be used by anyone authenticated by Shibboleth.

###### Request Body
| Field  | Type     | Description                | Optional |
| ------ | -------- | -------------------------- | -------- |
| `name` | `string` | The name of the new group. |          |

###### Response 
If successful, this endpoint returns an HTTP 200 code. 

If a group with the same name already exists, HTTP 409 will be returned.

#### `POST /groups/:id/changeRole`

Change the role of a user. Note that the caller cannot change their own role. Other members must change their role for them.

###### Request Parameters
Do not supply request parameters with this endpoint.

###### Authorization
The caller of this endpoint must be a manager of the group identified by the path parameters.

###### Request Body
| Field    | Type     | Description                                                            | Optional |
| -------- | -------- | ---------------------------------------------------------------------- | -------- |
| `utorid` | `string` | The utorid of the target user                                           |          |
| `role`   | `string` | The the new role of the specified user (either `manager` or `member`). |          |

###### Response 
If successful, this endpoint returns an HTTP 200 code. 
If the caller is not a manager of the group, HTTP 403 will be returned.
If the caller tries to change their own role, HTTP 400 will be returned. 
If the user is not found or is not in the group, 404 will be returned


#### `POST /groups/:id/invite`

Invite a user to the group.

###### Request Parameters
Do not supply request parameters with this endpoint.

###### Authorization
The caller of this endpoint must be a manager of the group identified by the path parameters.

###### Request Body
| Field    | Type     | Description                                                            | Optional |
| -------- | -------- | ---------------------------------------------------------------------- | -------- |
| `utorid` | `string` | The utorid of the target user                                        |          |

###### Response 
If successful, this endpoint returns an HTTP 200 code. 
If the caller is not a manager of the group, HTTP 403 will be returned.
If the caller tries to invite someone who is already in the group, HTTP 400 will be returned.
If the user is not found, 404 will be returned


#### `POST /groups/:id/invite/accept`

Accept a pending invite from a group.

###### Request Parameters
Do not supply request parameters with this endpoint.

###### Authorization
The caller of this endpoint must be a manager of the group identified by the path parameters.

###### Request Body
Do not supply body with this endpoint.

###### Response 
If successful, this endpoint returns an HTTP 200 code. 
If the caller is not invited to the group HTTP 400 will be returned.

#### `POST /groups/:id/remove`

Remove a user from the group.

###### Request Parameters
Do not supply request parameters with this endpoint.

###### Authorization
The caller of this endpoint must be a manager of the group identified by the path parameters.

###### Request Body
| Field    | Type     | Description                                                            | Optional |
| -------- | -------- | ---------------------------------------------------------------------- | -------- |
| `utorid` | `string` | The utorid of the target user                                        |          |

###### Response 
If successful, this endpoint returns an HTTP 200 code. 
If the caller is not a manager of the group, HTTP 403 will be returned.
If the user is not found or is not in the group, 404 will be returned.

#### `DELETE /groups/:id`

Delete a group.

###### Request Parameters
Do not supply request parameters with this endpoint.

###### Authorization
The caller of this endpoint must be a manager of the group identified by the path parameters.

###### Request Body
Do not supply body with this endpoint.

###### Response 
If successful, this endpoint returns an HTTP 200 code. 
If the caller is not a manager of the group, HTTP 403 will be returned.


## Frontend

### Local Deployment for Development
A local instance may be deployed either
1. On the host machine using `npm`, or
2. Using `docker-compose`.

#### npm installation
* install npm:
	```sh
	> npm install npm@latest -g
	```

* install dependencies:
	```sh
	> cd frontend
	> npm install
	```

* start the app:
	```sh
	> npm start
	```

#### Local deployment using Docker
* make sure `docker-compose` is installed:
    ```sh
    > docker-compose version
    Docker Compose version v2.17.3
    ```

* load `docker-compose.dev.yml` into docker
    ```sh
    > docker-compose up -f docker-compose.dev.yml
    ```

### Folder structure
Only important files and directories are shown below.
```
frontend
├── public                      # All public facing assets/files
│   ├── index.html
├── contexts
│   ├── UserContext.jsx
├── components
├── pages
│   ├── Admin             
│   ├── Calendar             
│   ├── CreateBooking             
│   ├── Dashboard             
│   ├── Group             
│   ├── NotFound             
│   └── Settings             
│       ├── Webhooks 
├── layouts
│   ├── ErrorPage.jsx
│   ├── SubPage.jsx
├── theme
├── axios.ts                    
└── App.tsx                     # Starting point of the client
```

### Components
Each component is documented using the [JSDoc Standard](https://github.com/jsdoc/jsdoc), which allows compatability with [VS Code Intellisense](https://code.visualstudio.com/docs/languages/javascript#_jsdoc-support). To learn more about each component, please refer to [the components folder](https://github.com/utmgdsc/hacklab-booking/tree/dev/backend/frontend/src/components) and view the JSDoc written in each file.


## Human Interface Design

### Overview of User Interface

[View the original Figma mockup](https://www.figma.com/file/zP24KYpLBAmSJNCloNrWdC/Hacklab?type=design&node-id=0-1)

#### Student
![Dashboard, groups page](https://i.imgur.com/C7cmECn.png)
*The groups page can be reached by clicking "Your Groups" on the Dashboard. By clicking "view" on each group card, more information about the group can be viewed.*

![Create booking workflow](https://i.imgur.com/lomT76m.png)
*The booking creation page can be reached by clicking "Book" on the Dashboard. After being prompted some information about the booking, it is created and sent to the select approver for review.*

![Active requests progress](https://i.imgur.com/thJW54r.png)
*Request tracking changes state from sent, to pending T-Card access, to complete.*

#### Approver
![Approving view](https://i.imgur.com/s1iud4L.png)
*All approvers have to do is click "Approve" or "Deny", then provide a reason for doing so.*

#### Administrator
![UTORid granting view](https://i.imgur.com/M3TphyI.png)
*Administrators can view users who are approved for T-Card access to the Hacklab but do not have it.*

### User flow

#### Main flow
![Main flow](https://hackmd.io/_uploads/rJ6J-mSIh.png)
*When a user logs in, their role is identified by the backend. If the user is new, they are given the student role.*

#### Student flow
![Student flow](https://hackmd.io/_uploads/SkGZb7BI3.png)
*Upon being recognized as a student, relevant booking information and user information is retrieved. Students are given the base permissions as shown in the flowchart above.*

#### Approver flow
![Approver flow](https://hackmd.io/_uploads/SJGGWQrI3.png)
*Upon being recognized as an approver, active request information and user information is retrieved. Approvers are given the base permissions plus permissions to approve/deny requests, as shown in the flowchart above.*

#### Admin flow
![Admin flow](https://hackmd.io/_uploads/HkJQZmSL3.png)
*Upon being recognized as a admin, active request information and user information is retrieved. Admins are given all permissions as shown in the flowchart above. They also have permission to use a special "Admin" page, where they can view a history of all requests, and modify a list of people who need TCard access to each room which that requires it.*

#### Settings user flow
![Settings user flow](https://hackmd.io/_uploads/B1yS-XHI3.png)
All users can control the same settings, including webhook notifications, light/dark theme, and profile information.


#### Group directory user flow
![Group directory user flow](https://hackmd.io/_uploads/HyftbQrL3.png)
*Upon opening the groups directory, a list of all groups a user is in is shown. Users are also given the opportunity to accept any group invitations they may have, or create a new group. They can also view details groups they may be in.*


#### Create booking user flow
![Booking user flow](https://hackmd.io/_uploads/Byhc-XBI3.png)
*The booking process follows the flow chart process above. When creating a booking, a user has to input an explanation, room, event title, group, and time. Then, they have to select an approver to notify. Upon approval, the request is marked as accepted and TCard access is provided by admins.*

## Deployment Instructions

*Modified from [the GitHub Wiki](https://github.com/utmgdsc/hacklab-booking/wiki/Current-Hosting#prod-deployment)*
**This part is subject to change as our tech stack continues to evolve**

As of now, the project is hosted on a VM provided by UTM. There is an Apache instance listening on ports 80 and 443 and reverse proxies to port 3555.

Our app is self-contained and has its own nginx reverse proxy to have all requests to `/api` directed to the backend container and all other requests to the frontend container.

The front end is created with react and is served by serve. The backend is a nodejs app.

To deploy, get the latest code, and run `docker-compose up -d --build`. This will start up our application on port 3555. A different port would require modifying the compose file.
