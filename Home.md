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
