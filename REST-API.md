## REST API Design

Items that are not checked as "Optional" are required fields.

### Booking Requests

#### `GET /requests`

Get requests by user or group. See the Authorization section for more information on default behaviour.

###### Request Parameters

| Field        | Type     | Description                                                 | Optional           |
| ------------ | -------- | ----------------------------------------------------------- | ------------------ |
| `start_date` | `Date`   | Bookings from this date.                                    | :heavy_check_mark: |
| `group`      | `string` | The ID of the group that will be representing this request. | :heavy_check_mark: |
| `end_date`   | `Date`   | Bookings before this day                                    | :heavy_check_mark: |
| `room`       | `string` | The room number of the booking                              | :heavy_check_mark: |

###### Authorization

For administrators, this request returns all active future requests by default (i.e., when no parameters are supplied).

For students, this request returns all active future requests of any groups the user is a part of.

###### Response

If successful, this endpoint returns an HTTP 200 code with a `Request` array.
If a student tries to access other users' or groups' requests, the endpoint will return HTTP 403.

#### `POST /requests/create`

Creates a request under a group.

###### Request Parameters

Parameters are not required for this API route.

###### Authorization

This HTTP request can only be performed by members of the group specified in the `group` parameter.

###### Request body

| Field         | Type     | Description                                                 | Optional |
| ------------- | -------- | ----------------------------------------------------------- | -------- |
| `group`       | `string` | The ID of the group that will be representing this request. |          |
| `start_date`  | `Date`   | The start date for the booking                              |          |
| `end_date`    | `Date`   | The end date for the booking                                |          |
| `description` | `string` | Description of the booking                                  |          |
| `title`       | `string` | The title of the booking                                    |          |
| `room`        | `string` | The room number of the booking                              |          |

###### Response

If successful, this endpoint returns an HTTP 200 code with the newly created `Request` object.
If the user is not part of the supplied group, HTTP 403 is returned.
If the `start_date` is after `end_date` HTTP 400 is returned.

#### `GET /requests/:id`

Get request info given a request ID.

###### Request Parameters

Do not supply request parameters with this endpoint.

###### Authorization

For staff or for students within the requests' group.

###### Response

If successful, this endpoint returns an HTTP 200 code with the `Request` object specified.

If the user does not have permission to view this request, then this endpoint returns HTTP 403. It will return HTTP 404 if the request ID does not exist.

#### `DELETE /requests/:id`

Delete a request given a request ID.

###### Request Parameters

Do not supply request parameters with this endpoint.

###### Authorization

Only managers of the group to which the request belongs, the author of the request, and administrators may delete the request.

###### Response

If successful, this endpoint returns an HTTP 200 code.

If the user does not have permission to delete this request, then this endpoint returns HTTP 403. It will return HTTP 404 if the request ID does not exist.

#### `PUT /requests/:id`

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

#### `PUT /requests/:id/approve`

Approve a booking request

###### Request Parameters

| Field         | Type     | Description                                                 | Optional           |
| ------------- | -------- | ----------------------------------------------------------- | ------------------ |
| `reason`  | `string`   | The reason for the approval                              | |


###### Authorization

Only approvers with the requisite permission can call this endpoint.

###### Response

If successful, this endpoint returns an HTTP 200 code.

If the user does not have permission to approve this request, then this endpoint returns HTTP 403. It will return HTTP 404 if the request ID does not exist. It also returns HTTP 400 if the group does not exist.

#### `PUT /requests/:id/deny`

Deny a booking request

###### Request Parameters

| Field         | Type     | Description                                                 | Optional           |
| ------------- | -------- | ----------------------------------------------------------- | ------------------ |
| `reason`  | `string`   | The reason for the denial                              | |


###### Authorization

Only approvers with the requisite permission can call this endpoint.

###### Response

If successful, this endpoint returns an HTTP 200 code.

If the user does not have permission to deny this request, then this endpoint returns HTTP 403. It will return HTTP 404 if the request ID does not exist. It also returns HTTP 400 if the group does not exist.


#### `PUT /requests/:id/cancel`

Cancel a booking request

###### Request Parameters

Do not supply request parameters with this endpoint.

###### Authorization

Only approvers with the requisite permission, group managers, or the author of the request can call this endpoint.

###### Response

If successful, this endpoint returns an HTTP 200 code.

If the user does not have permission to approve this request, then this endpoint returns HTTP 403. It will return HTTP 404 if the request ID does not exist. It also returns HTTP 400 if the group does not exist.

### Accounts

#### `GET /accounts`

Get the current user info (based on who is currently logged in)

###### Request Parameters

Parameters are not required for this API route.

###### Authorization

Can be used by anyone authenticated by Shibboleth.

###### Response

this endpoint returns an HTTP 200 code with the requested `Account` object.

#### `GET /accounts/approvers`

Get a list of everyone with the `approver` role.

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

this endpoint returns an HTTP 200 code with the requested `Account` object or an HTTP 403 if the user lacks permissions.

#### `PUT /accounts/:utorid/changerole`

Change the role of a user.

###### Request Parameters

Do not supply request parameters with this endpoint.

###### Request body

| Field  | Type     | Description                                                                         | Optional |
| ------ | -------- | ----------------------------------------------------------------------------------- | -------- |
| `role` | `string` | The new role of the user (can either be `student`, `approver`, `tcard`, or `admin`) |          |

###### Authorization

This is an admin-only endpoint.

###### Response

If successful, this endpoint returns an HTTP 200 code.
If anyone other than admins tries to access this endpoint, the endpoint will return HTTP 403.

#### `PUT /accounts/webhooks`

Set the webhooks settings object for this user.

###### Request Parameters

Do not supply request parameters with this endpoint.

###### Request body

Provide a JSON dictionary with the keys being a notification event (see Notifications section) and the values a JSON array with all destinations for that event (eg. `['email','slack', 'discord']`). 

###### Authorization

Can be used by anyone authenticated by Shibboleth.

###### Response

If successful, this endpoint returns an HTTP 200. 400 otherwise (bad JSON dictionary).

#### `PUT /accounts/webhooks/discord`

Set the discord webhook destination for this user.

###### Request Parameters

Do not supply request parameters with this endpoint.

###### Request body

| Field  | Type     | Description             | Optional |
| ------ | -------- |-------------------------| -------- |
| `webhook` | `string` | The discord webhook URL |          |

###### Authorization

Can be used by anyone authenticated by Shibboleth.

###### Response

If successful, this endpoint returns an HTTP 200. 400 otherwise (invalid webhook URL).

#### `PUT /accounts/webhooks/slack`

Set the discord webhook destination for this user.

###### Request Parameters

Do not supply request parameters with this endpoint.

###### Request body

| Field  | Type     | Description             | Optional |
| ------ | -------- |-------------------------| -------- |
| `webhook` | `string` | The slack webhook URL |          |

###### Authorization

Can be used by anyone authenticated by Shibboleth.

###### Response

If successful, this endpoint returns an HTTP 200. 400 otherwise (invalid webhook URL).

#### `POST /accounts/changetheme`

Change the current theme of the logged-in user. `system` specifies that the theme will be decided based on the system preferences.

###### Request Parameters

Parameters are not required for this API route.

###### Request body

| Field   | Type     | Description                                                           | Optional |
| ------- | -------- | --------------------------------------------------------------------- | -------- |
| `theme` | `string` | The new role of the user (can either be `light`, `dark`, or `system`) |          |

###### Authorization

Can be used by anyone authenticated by Shibboleth.

###### Response

This endpoint returns HTTP 200 on a successful theme change, otherwise, HTTP 400 is returned.

### Rooms

#### `GET /rooms`

Get information about all rooms.

###### Request Parameters

Do not supply request parameters with this endpoint.

###### Authorization

Any authenticated user may access this route.

###### Response

If successful, this endpoint returns an HTTP 200 code and an array of `Room` objects.

#### `POST /rooms/create`

Create a new room

###### Request Parameters

Do not supply request parameters with this endpoint.

###### Authorization

Only users with the administrator role may use this route.

###### Response

If successful, this endpoint returns an HTTP 200 code and an array of `Room` objects.

#### `GET /rooms/:room`

Get room info given its room number.

###### Request Parameters

| Field          | Type      | Description                                          | Optional |
| -------------- | --------- | ---------------------------------------------------- | -------- |
| `friendlyName` | `string`  | The room's common name (e.g., Hacklab, TA Room, etc) |          |
| `room`         | `string`  | The room's ID or room number (e.g., DH2014)          |          |
| `capacity`     | `integer` | How many people can fit in this room                 |          |

###### Authorization

Only managers of the group to which the request belongs, the author of the request, and administrators may edit the request.

###### Response

If successful, this endpoint returns an HTTP 200 code and the `Room` object specified by the request parameter.

If the user does not have permission to delete this request, then this endpoint returns HTTP 403.

#### `GET /rooms/:rooms/blockeddates`

Return all the dates already booked or pending, defaults to within the next week.

###### Request Parameters

| Field        | Type     | Description                                                                                        | Optional           |
| ------------ | -------- | -------------------------------------------------------------------------------------------------- | ------------------ |
| `start_date` | `Date`   | The start date to filter by in the ISO 8601 format. (YYYY-MM-DD). Defaults to the current date.    | :heavy_check_mark: |
| `end_date`   | `string` | The end date to filter by in ISO 8601 format. (YYYY-MM-DD). Defaults to the current date + 7 days. | :heavy_check_mark: |

###### Authorization

All authenticated users can access this endpoint.

###### Response

If successful, this endpoint returns an HTTP 200 code and an array of date strings in ISO 8061 format.

#### `PUT /rooms/:rooms/grantaccess`

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

#### `PUT /rooms/:rooms/revokeaccess`

Given a room and UTORid, update the user with the supplied UTORid to not have access to the room supplied by the path parameters.

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

#### `PUT /rooms/:rooms/addapprover`

Given a room and UTORid, update the approver with the given UTORid to have permission to approve the room specified in the path parameter.

Note that the user with the given `utorid` must already have the approver role.

###### Request Parameters

Do not supply request parameters with this endpoint.

###### Authorization

Only users with the `admin` role are allowed to call this endpoint.

###### Request Body

| Field    | Type     | Description                                             | Optional |
| -------- | -------- | ------------------------------------------------------- | -------- |
| `utorid` | `string` | The UTORid of the approver that will be granted access. |          |

###### Response

If successful, this endpoint returns an HTTP 200 code.

If the user or room doesn't exist or is not found, this endpoint returns an HTTP 404 code.

If the method caller does not have the `admin` role, this endpoint returns an HTTP 430 code.

#### `PUT /rooms/:rooms/revokeAccess`

Given a room and UTORid, remove the approver with the given UTORid's permission to approve the room specified in the path parameter.

Note that the user with the given `utorid` must already have the approver role.

###### Request Parameters

Do not supply request parameters with this endpoint.

###### Authorization

Only users with the `admin` role are allowed to call this endpoint.

###### Request Body

| Field    | Type     | Description                                             | Optional |
| -------- | -------- | ------------------------------------------------------- | -------- |
| `utorid` | `string` | The UTORid of the approver that will be revoked access. |          |

###### Response

If successful, this endpoint returns an HTTP 200 code.

If the user or room doesn't exist or is not found, this endpoint returns an HTTP 404 code.

If the method caller does not have the `admin` role, this endpoint returns an HTTP 430 code.

<!-- #### `GET /rooms/:rooms/requests`

Return all the dates already booked or pending, defaults to all requests.

###### Request Parameters
| Field        | Type     | Description                                                                                        | Optional           |
| ------------ | -------- | -------------------------------------------------------------------------------------------------- | ------------------ |
| `start_date` | `Date`   | The start date to filter by in the ISO 8601 format. (YYYY-MM-DD). Defaults to the current date.    | :heavy_check_mark: |
| `end_date`      | `string` | The end date to filter by in ISO 8601 format. (YYYY-MM-DD). Defaults to the current date + 7 days. | :heavy_check_mark: |

###### Authorization
All authenticated users can access this endpoint.

###### Response
If successful, this endpoint returns an HTTP 200 code and an array of request objects.

 -->

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

Change the role of a user. Note that the caller cannot change their own role. Other members must change their roles for them.

###### Request Parameters

Do not supply request parameters with this endpoint.

###### Authorization

This endpoint's caller must be a group manager identified by the path parameters.

###### Request Body

| Field    | Type     | Description                                                            | Optional |
| -------- | -------- | ---------------------------------------------------------------------- | -------- |
| `utorid` | `string` | The utorid of the target user                                          |          |
| `role`   | `string` | The new role of the specified user (either `manager` or `member`). |          |

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

This endpoint's caller must be a group manager identified by the path parameters.

###### Request Body

| Field    | Type     | Description                   | Optional |
| -------- | -------- | ----------------------------- | -------- |
| `utorid` | `string` | The utorid of the target user |          |

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

The caller of this endpoint must be invited to the group specified by the path parameters.

###### Request Body

Do not supply a request body with this endpoint.

###### Response

If successful, this endpoint returns an HTTP 200 code.
If the caller is not invited to the group HTTP 400 will be returned.

#### `POST /groups/:id/invite/reject`

Reject a pending invite from a group.

###### Request Parameters

Do not supply request parameters with this endpoint.

###### Authorization

The caller of this endpoint must be invited to the group specified by the path parameters.

###### Request Body

Do not supply a request body with this endpoint.

###### Response

If successful, this endpoint returns an HTTP 200 code.
If the caller is not invited to the group HTTP 400 will be returned.

#### `POST /groups/:id/remove`

Remove a user from the group.

###### Request Parameters

Do not supply request parameters with this endpoint.

###### Authorization

The caller of this endpoint must be one of the following:

- a manager of the group identified by the path parameters,
- have the `administrator` role,
- or be trying to remove themselves (i.e., the `utorid` in the request body is the same as the caller's `utorid`).

###### Request Body

| Field    | Type     | Description                   | Optional |
| -------- | -------- | ----------------------------- | -------- |
| `utorid` | `string` | The utorid of the target user |          |

###### Response

If successful, this endpoint returns an HTTP 200 code.
If the caller is not a manager of the group, HTTP 403 will be returned.
If the user is not found or is not in the group, 404 will be returned.

#### `DELETE /groups/:id`

Delete a group.

###### Request Parameters

Do not supply request parameters with this endpoint.

###### Authorization

This endpoint's caller must be a group manager identified by the path parameters.

###### Request Body

Do not supply a request body with this endpoint.

###### Response

If successful, this endpoint returns an HTTP 200 code.
If the caller is not a manager of the group, HTTP 403 will be returned.

## Frontend

### Local Deployment for Development

A local instance may be deployed either

1. On the host machine using `npm`, or
2. Using `docker-compose`.

#### npm installation

- install npm:

  ```sh
  > npm install npm@latest -g
  ```

- install dependencies:

  ```sh
  > cd frontend
  > npm install
  ```

- start the app:
  ```sh
  > npm start
  ```

### Folder structure

Only important files and relevant directories are shown below.

```
frontend
├── public                      # All public-facing assets/files
│   ├── index.html
├── contexts
│   ├── UserContext.tsx
├── components
│   ├── index.tsx
│   ├── utils.tsx
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
│   ├── ErrorPage.tsx
│   ├── SubPage.tsx
├── theme
├── axios.ts
└── App.tsx                     # Starting point of the client
```

### Components

Each component is documented using the [JSDoc Standard](https://github.com/jsdoc/jsdoc), which allows compatibility with [VS Code Intellisense](https://code.visualstudio.com/docs/languages/javascript#_jsdoc-support). To learn more about each component, please refer to [the components folder](https://github.com/utmgdsc/hacklab-booking/tree/dev/backend/frontend/src/components) and view the JSDoc written in each file.

## Human Interface Design

### Overview of User Interface

[View the original Figma mockup](https://www.figma.com/file/zP24KYpLBAmSJNCloNrWdC/Hacklab?type=design&node-id=0-1)

#### Student

![Dashboard, groups page](https://i.imgur.com/C7cmECn.png)
_The groups page can be reached by clicking "Your Groups" on the Dashboard. By clicking "view" on each group card, more information about the group can be viewed._

![Create booking workflow](https://i.imgur.com/lomT76m.png)
_The booking creation page can be reached by clicking "Book" on the Dashboard. After being prompted some information about the booking, it is created and sent to the select approver for review._

![Active requests progress](https://i.imgur.com/thJW54r.png)
_Request tracking changes state from sent, to pending T-Card access, to complete._

#### Approver

![Approving view](https://i.imgur.com/s1iud4L.png)
_All approvers have to do is click "Approve" or "Deny", then provide a reason for doing so._

#### Administrator

![UTORid granting view](https://i.imgur.com/M3TphyI.png)
_Administrators can view users who are approved for T-Card access to the Hacklab but do not have it._

### User flow

#### Main flow

![Main flow](https://hackmd.io/_uploads/rJ6J-mSIh.png)
_When a user logs in, their role is identified by the backend. If the user is new, they are given the student role._

#### Student flow
![Student flow](https://hackmd.io/_uploads/SJq4rCt22.png)

_Upon being recognized as a student, relevant booking information and user information is retrieved. Students are given the base permissions as shown in the flowchart above._

#### Approver flow
![Approver flow](https://hackmd.io/_uploads/HkWWHAt23.png)

_Upon being recognized as an approver, active request information and user information is retrieved. Approvers are given the base permissions plus permissions to approve/deny requests, as shown in the flowchart above._

#### Admin flow

![Admin flow](https://i.imgur.com/uhvrSZ1.png)
_Upon being recognized as a admin, active request information and user information is retrieved. Admins are given all permissions as shown in the flowchart above. They also have permission to use a special "Admin" page, where they can view a history of all requests, and modify a list of people who need TCard access to each room which that requires it._

#### Settings user flow

![Settings user flow](https://hackmd.io/_uploads/B1yS-XHI3.png)
All users can control the same settings, including webhook notifications, light/dark themes, and profile information.

#### Group directory user flow

![Group directory user flow](https://hackmd.io/_uploads/HyftbQrL3.png)
_Upon opening the groups' directory, a list of all groups a user is in is shown. Users are also given the opportunity to accept any group invitations they may have, or create a new group. They can also view details groups they may be in._

#### Create booking user flow

![Booking user flow](https://hackmd.io/_uploads/Byhc-XBI3.png)
_The booking process follows the flow chart process above. When creating a booking, a user has to input an explanation, room, event title, group, and time. Then, they have to select an approver to notify. Upon approval, the request is marked as accepted and TCard access is provided by admins._