## Project Overview

### Introduction

This document describes the Hacklab Booking System. It outlines its high-level purpose, design, and documentation for the backend API and frontend components. There is also a brief software bill of materials and a rationale for each dependency.

### Revision History

| Version | Date       | Changelog       |
| ------- | ---------- | --------------- |
| 2.1     | 2023-08-17 | Final document  |
| 2.0     | 2023-06-07 | Initial release |

### Background and Motivation

The Hacklab is a space for students and student organizations to work, socialize, learn, and develop their skills. As of now, few groups can use Hacklab for meetings because it requires TCard access. **Our solution makes Hacklab a more accessible place for everyone who needs it.** For example, groups for upper-year courses may want Hacklab to host standups but are unable due to access control restrictions on Hacklab. To allow clubs and student groups to access the Hacklab for these meetings, we proposed a booking system allowing students to book the Hacklab. Any current bookings may then be viewed on the **Hacklab iPad** that will be placed in front of the Hacklab, alerting students of private meeting occupancy. The _Hacklab Booking System_ project from Winter 2023 is the solution to this problem, but it currently **needs features and stability for production deployment.**

### Scope

The goal of the Hacklab Booking System is to make it ready for production use. First and foremost, **a rewrite of the backend server is needed to scale better with users and rooms.** For instance, some backend routes currently run at O(n) with respect to the number of users, which would be unacceptable for a production environment. Another issue is that our backend routes are integrated too tightly with the frontend, which makes our API less extensible for people who would like to use it. Our proposed solution is to migrate the current database from MongoDB to PostgreSQL.

Next, the current booking system allows faculty to approve and deny requests; however, there is only one avenue for notifications–email, which not everyone may check frequently. This issue may be solved by **adding more venues for notifications**, including Discord, Slack, and Web notifications via service workers. Furthermore, the user experience for request approvers to approve and deny requests in the notification itself is also improved.

Finally, the **code quality of the existing codebase** is improved by using _TypeScript_, which would increase the readability and predictability of our codebase. There is also a _GitHub Wiki_ to document backend routes and functions to improve maintainability for future teams, decreasing the need to first acquire tribal knowledge. This would allow our booking system to be safely deployed for the Hacklab for years to come.

## System Overview

### Technology Stack

![Tech Stack diagram](https://i.imgur.com/syb7drv.png)

A full software bill of materials may be found in the [backend package.json](https://github.com/utmgdsc/hacklab-booking/blob/main/backend/package.json), the [frontend package.json](https://github.com/utmgdsc/hacklab-booking/blob/main/frontend/package.json), and in the `Dockerfile`s of both.

For our backend and frontend, we aim to use [TypeScript](https://www.typescriptlang.org/) as much as possible for easier readability. We also aim to use [ESLint](https://eslint.org/) as a pre-commit hoot for the same reason.

Our code will be hosted on our [GitHub repository](https://github.com/utmgdsc/hacklab-booking) and production servers are deployed with [Docker Compose](https://docs.docker.com/compose/) using [Docker](https://www.docker.com/) containers.

The Docker containers will be hosted in a UofT-provided virtual machine, and authentication is handled by [UofT's SSO auth, Shibboleth](http://sites.utoronto.ca/security/projects/shibboleth.htm).

#### Frontend

- [**React**](https://react.dev) - A component-based library for JavaScript. Our frontend is bootstrapped with [`create-react-app`](https://create-react-app.dev/).
- [**Material UI**](https://mui.com/material-ui/) - A majority of our frontend components are from MaterialUI, which are a library of components implementing [Google's Material Design](https://m2.material.io/).
- [**Axios**](https://axios-http.com/) - An HTTP client for JavaScript, which simplifies network requests to the backend API.
- [**DayJS**](https://day.js.org/) - Required for the [MaterialUI `DatePicker`](https://mui.com/x/react-date-pickers/date-picker/) component to work. Also simplifies the manipulation of dates for the booking pages.
- [**Apple iPad**](https://www.apple.com/ca/ipad/) - For displaying current events in front of Hacklab

The Material UI component library was chosen as our project is under [GDSC UTM](https://gdscutm.com), a club affiliated with Google. Thus, a component library that mimics Google's design language will better align with our organization's design.

#### Backend

- **[NGINX](https://www.nginx.com/)** - Reverse proxy that allows our web app to be hosted on port 443.
- **[NodeJS](https://nodejs.org)** - JavaScript on server side :yum:
- **[ExpressJS](https://expressjs.com)** - An RESTful backend web application framework for NodeJS.
- **[Prisma](https://www.prisma.io/)** - Next-generation Node.js and TypeScript ORM that supports PostgreSQL

#### Database

- **[PostgreSQL](https://www.postgresql.org/)** - An open source SQL-compliant relational database system.
  A relational database was chosen for this project as a replacement for the previous _MongoDB_, as our dataset is highly relational. For instance, each request has an author (which is a `User`), a `Group`, and a `Room`. `Group`s store different arrays for `User`s depending on whether they're a member, invited, or a group manager, and so on.