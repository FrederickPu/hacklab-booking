## System Architecture

![Abstracted System Architecture](https://i.imgur.com/YgUfPZs.png)
_This heavily simplified flowchart depicts the system architecture. The user logs in using Shibboleth to access the frontend. The frontend communicates using the REST API to make requests to the server, which modifies the database accordingly using the ORM (Prisma) interface._

### User Roles and Characteristics

#### Student

The student role is the default role given to everyone upon first launch (given already authenticated with Shibboleth. It gives the following permissions:

- Create a group

#### Request Approver

The request approver role is manually given to faculty upon request. After being granted the `approver` role, faculty must also request permission to become an approver for each room they would like to approve. It gives the following permissions:

- View a log of all previous requests
- Can approve/deny requests for all rooms that they requested

#### TCard Approver

The TCard Approver role is given to system administrators (e.g., Andrew Wang) for the purpose of notifying the student that TCard access has been granted. It gives the following permissions:

- View a log of all previous requests
- Modify students’ database entry regarding TCard access

#### Administrator

The administrator role has all permissions (i.e., the permissions of both Request Approver and TCard Approver) and is given to faculty upon request. It gives the following permissions:

- View a log of all previous requests
- Modify students’ database entry regarding TCard access
- Can approve/deny requests made by any student
- Reject bookings that are already approved
- Can delete student groups

### Groups

Groups are a concept used by the Hacklab Booking System to allow multiple people to view the status of bookings. There is no limit to how many members a group can have, and there is no limit to the number of total groups. Students **must be added to a group or create a group to create requests**.

#### Student Group Roles

In a group, there are two roles with the following permissions:

###### Group Manager

- Can add/remove people to the group (without approval from faculty)
- Can delete other bookings within their group
- Can delete the group

###### Group Member

- Can request bookings under their group name
- Can leave the group
- Can view all the group’s bookings

### Design Constraints and Limitations

Our design has some limitations:

- Upon initialization, there will be no administrators. The first administrator must be added by interacting directly with PostgreSQL.

## Data Design

![Data design diagram](https://i.imgur.com/hf23TsB.png)
_This diagram depicts a high-level overview of the data design._

### Data Description

#### Accounts

This table stores the account information for all users (students and faculty). The permission level is identified by the role field.

```dbml
Table accounts {
  utorid string [pk]
  email string
  name string 
  role account_role
  webhooks Json
  discordWebhook string
  slackWebhook string
  theme theme
}
```

#### Account roles

This enum defines the permission level of a user, for more information see [User Roles](#User-Roles)

```dbml
enum account_role {
    admin
    student
    approver
    tcard
}
```

#### Account theme
This enum defines the theme that will be displayed to the user.
```dbml
enum theme {
  system
  light
  dark
}
```

#### Request

This table stores all requests. Each request is a group and a room is assigned to it. The status field is an enum which represents the current status of the request, see [Request status enum](#Request-status-enum).

```dbml
Table requests {
  id uuid [pk]
  status request_status // the status of the request defined by the Request status enum
  group uuid [ref: > groups.id] // the group making the request
  author string [ref: > accounts.utorid] // the author of the request
  approvers string[] [ref: > accounts.utorid] // the approvers assigned to this booking
  start_date date // the starting date and time of the request in ISO 8601 format
  end_date date // the ending date and time of the request in ISO 8601 format
  description string // a summary of the event provided to the approvers for review
  title string // the name of the event
  room string [ref: > rooms.room_name] // the room booked
  reason string [null] // (optional) the reason for the denial/approval of a request
  createdAt date
  updatedAt date
}
```

#### Request status enum

Every request must have a status, the status shows the state of a given request.

```dbml
enum request_status {
  pending // the request is awaiting the approver's approval
  denied // the request has been denied by an approver
  cancelled // the request has been cancelled by the author or group manager
  need_tcard // the request has been approved by an approver but still needs TCard approval
  completed // the request is approved and the author has TCard access
}
```

The following flowchart further details the relationship between these request statuses in the booking system:

![A flowchart detailing the request statuses](https://i.imgur.com/oTeoh52.png)

Once a user enters booking information, it enters the selected approvers' request list, where it is reviewed and either approved or denied. If a request is approved and it is the request authors' first time booking, then it enters the TCard approvers' request list to grant the request author TCard access to the room. Once the proper TCard access is granted, the request will be marked as "complete."

#### Groups

This table contains information about the groups.

```dbml
Table groups {
  id uuid [pk]
  members integer[] [ref: <> accounts.id] // all members of the group, including managers, excluding any invited users
  invited integer[] [ref: <> accounts.id] // users that have been invited to the group and have yet to accept
  managers integer[] [ref: <> accounts.id] // the managers of the group
}
```

#### Rooms

This table stores all bookable rooms.

```dbml
Table rooms {
  room_name string [pk] // the room number, eg. DH2014
  friendly_name string // friendly name, eg. Hacklab
  capacity integer // (optional) occupancy limit
  userAccess string[] [ref: <> accounts.utorid] // users that have access to this room
  approvers string[] [ref: <> accounts.utorid] // approvers for this room
}
```

<!-- ### Google API Integration

Google API integration is handled by [google-api-javascript-client](https://github.com/google/google-api-javascript-client) and [nodemailer](https://nodemailer.com/about/). The backend is linked with the Google Account `hacklab.booking<at>gmail<dot>com` `google-api-javascript-client` is currently used for updating the Hacklab Google Calendar and `nodemailer` is used for sending emails. `nodemailer` authenticates to Gmail through an app password. -->


## Backend
### Notifications
Notifications are sent to the user using an event system. Each event has a cooresponding type which defines:
- Who receives the notifications
- What information is sent along with the notification (context)
#### Email Notifications

Email notifications are handled by nodemailer. Emails are sent to the Hacklab Booking Google account in a HTML format with actionable buttons, which lead to the Hacklab Booking website.
#### Events
All events are defined in `backend/src/types/EventTypes.ts`
Here is the current list of events and their corresponding contexts:
- `ADMIN_BOOKING_CREATED`: A booking has been created by a user (sent to admins)
  - `full_name`: The full name of the user who created the booking
  - `room`: The room number of the booking
  - `room_friendly`: The friendly name of the room
  - `group_name`: The name of the group that the booking belongs to
  - `booking_id`: The ID of the booking
  - `title`: The title of the booking
  - `description`: The description of the booking
  - `start_time`: The start time of the booking ISO format
  - `end_time`: The end time of the booking in ISO format
  - `utorid`: The utorid of the user who created the booking
- `BOOKING_APPROVAL_REQUESTED`: A booking has been requested by a user (sent to approvers)
    - `full_name`: The full name of the user who created the booking
    - `room`: The room number of the booking
    - `room_friendly`: The friendly name of the room
    - `group_name`: The name of the group that the booking belongs to
    - `booking_id`: The ID of the booking
    - `title`: The title of the booking
    - `description`: The description of the booking
    - `start_time`: The start time of the booking ISO format
    - `end_time`: The end time of the booking in ISO format
    - `utorid`: The utorid of the user who created the booking
- `ADMIN_BOOKING_UPDATED`: A booking has been updated by a user (sent to admins)
    - `full_name`: The full name of the user who created the booking
    - `room`: The room number of the booking
    - `room_friendly`: The friendly name of the room
    - `group_name`: The name of the group that the booking belongs to
    - `booking_id`: The ID of the booking
    - `title`: The title of the booking
    - `description`: The description of the booking
    - `start_time`: The start time of the booking ISO format
    - `end_time`: The end time of the booking in ISO format
    - `utorid`: The utorid of the user who created the booking
    - `changer_utorid`: The utorid of the user who updated the booking
    - `changer_full_name`: The full name of the user who updated the booking
    - `status`: The status of the booking
- `BOOKING_STATUS_CHANGED`: A booking has been approved or rejected by an approver (sent to the user who created the booking)
    - `full_name`: The full name of the user who created the booking
    - `room`: The room number of the booking
    - `room_friendly`: The friendly name of the room
    - `group_name`: The name of the group that the booking belongs to
    - `booking_id`: The ID of the booking
    - `title`: The title of the booking
    - `description`: The description of the booking
    - `start_time`: The start time of the booking ISO format
    - `end_time`: The end time of the booking in ISO format
    - `utorid`: The utorid of the user who created the booking
    - `changer_utorid`: The utorid of the user who updated the booking
    - `changer_full_name`: The full name of the user who updated the booking
    - `status`: The status of the booking
    - `reason`: The reason for the status change (if applicable)
- `ADMIN_BOOKING_STATUS_CHANGED`: A booking has been approved or rejected by an approver (sent to admins)
    - `full_name`: The full name of the user who created the booking
    - `room`: The room number of the booking
    - `room_friendly`: The friendly name of the room
    - `group_name`: The name of the group that the booking belongs to
    - `booking_id`: The ID of the booking
    - `title`: The title of the booking
    - `description`: The description of the booking
    - `start_time`: The start time of the booking ISO format
    - `end_time`: The end time of the booking in ISO format
    - `utorid`: The utorid of the user who created the booking
    - `changer_utorid`: The utorid of the user who updated the booking
    - `changer_full_name`: The full name of the user who updated the booking
    - `status`: The status of the booking
    - `reason`: The reason for the status change (if applicable)
- `ADMIN_ROOM_CREATED`: A room has been created by an admin (sent to admins)
    - `room`: The room number of the room
    - `room_friendly`: The friendly name of the room
    - `full_name`: The full name of the user who created the room
    - `utorid`: The utorid of the user who created the room
    - `capacity`: The capacity of the room
- `ROOM_ACCESS_REQUESTED`: A user has requested access to a room (sent to approvers)
    - `full_name`: The full name of the user who requested access
    - `room`: The room number of the room
    - `room_friendly`: The friendly name of the room
    - `utorid`: The utorid of the user who requested access
- `ROOM_ACCESS_GRANTED`: A user has been granted access to a room (sent to the user)
    - `full_name`: The full name of the user who was granted access
    - `room`: The room number of the room
    - `room_friendly`: The friendly name of the room
    - `utorid`: The utorid of the user who was granted access
    - `approver_utorid`: The utorid of the user who approved the access
    - `approver_full_name`: The full name of the user who approved the access
- `ADMIN_ROOM_ACCESS_GRANTED`: A user has been granted access to a room (sent to admins)
    - `full_name`: The full name of the user who was granted access
    - `room`: The room number of the room
    - `room_friendly`: The friendly name of the room
    - `utorid`: The utorid of the user who was granted access
    - `approver_utorid`: The utorid of the user who approved the access
    - `approver_full_name`: The full name of the user who approved the access
- `ROOM_ACCESS_REVOKED`: A user has been revoked access to a room (sent to the user)
    - `full_name`: The full name of the user who was revoked access
    - `room`: The room number of the room
    - `room_friendly`: The friendly name of the room
    - `utorid`: The utorid of the user who was revoked access
    - `approver_utorid`: The utorid of the user who revoked the access
    - `approver_full_name`: The full name of the user who revoked the access
- `ADMIN_ROOM_ACCESS_REVOKED`: A user has been revoked access to a room (sent to admins)
    - `full_name`: The full name of the user who was revoked access
    - `room`: The room number of the room
    - `room_friendly`: The friendly name of the room
    - `utorid`: The utorid of the user who was revoked access
    - `approver_utorid`: The utorid of the user who revoked the access
    - `approver_full_name`: The full name of the user who revoked the access
- `GROUP_MEMBER_INVITED`: A user has been invited to a group (sent to the group mangers)
    - `full_name`: The full name of the user who was invited
    - `group_name`: The name of the group that the user was invited to
    - `group_id`: The ID of the group that the user was invited to
    - `inviter_utorid`: The utorid of the user who invited the user
    - `inviter_full_name`: The full name of the user who invited the user
- `USER_INVITED_TO_GROUP`: A user has been invited to a group (sent to the user)
    - `full_name`: The full name of the user who was invited
    - `group_name`: The name of the group that the user was invited to
    - `group_id`: The ID of the group that the user was invited to
    - `inviter_utorid`: The utorid of the user who invited the user
    - `inviter_full_name`: The full name of the user who invited the user
- `GROUP_MEMBER_JOINED`: A user has joined a group (sent to the group managers)
    - `full_name`: The full name of the user who joined
    - `group_name`: The name of the group that the user joined
    - `group_id`: The ID of the group that the user joined
- `GROUP_MEMBER_REMOVED`: A user has been removed from a group (sent to the group managers)
    - `full_name`: The full name of the user who was removed
    - `group_name`: The name of the group that the user was removed from
    - `group_id`: The ID of the group that the user was removed from
    - `remover_utorid`: The utorid of the user who removed the user
    - `remover_full_name`: The full name of the user who removed the user
- `USER_REMOVED_FROM_GROUP`: A user has been removed from a group (sent to the user)
    - `full_name`: The full name of the user who was removed
    - `group_name`: The name of the group that the user was removed from
    - `group_id`: The ID of the group that the user was removed from
    - `remover_utorid`: The utorid of the user who removed the user
    - `remover_full_name`: The full name of the user who removed the user
- `ADMIN_GROUP_CREATED`: A group has been created (sent to admins)
    - `group_name`: The name of the group that was created
    - `group_id`: The ID of the group that was created
    - `full_name`: The utorid of the user who created the group
    - `utorid`: The full name of the user who created the group
- `ADMIN_GROUP_DELETED`: A group has been deleted (sent to admins)
    - `group_name`: The name of the group that was deleted
    - `group_id`: The ID of the group that was deleted
    - `full_name`: The utorid of the user who deleted the group
    - `utorid`: The full name of the user who deleted the group
- `GROUP_ROLE_CHANGED`: A user's role in a group has been changed (sent to the group_managers)
    - `group_name`: The name of the group that the user's role was changed in
    - `group_id`: The ID of the group that the user's role was changed in
    - `full_name`: The full name of the user who's role was changed
    - `role`: The new role of the user
    - `changer_utorid`: The utorid of the user who changed the user's role
    - `changer_full_name`: The full name of the user who changed the user's role
- `USER_GROUP_ROLE_CHANGED`: A user's role in a group has been changed (sent to the user)
    - `group_name`: The name of the group that the user's role was changed in
    - `group_id`: The ID of the group that the user's role was changed in
    - `full_name`: The full name of the user who's role was changed
    - `role`: The new role of the user
    - `changer_utorid`: The utorid of the user who changed the user's role
    - `changer_full_name`: The full name of the user who changed the user's role
- `GROUP_MEMBER_REMOVED`: A user has been removed from a group (sent to the group managers)
    - `full_name`: The full name of the user who was removed
    - `group_name`: The name of the group that the user was removed from
    - `group_id`: The ID of the group that the user was removed from
    - `remover_utorid`: The utorid of the user who removed the user
    - `remover_full_name`: The full name of the user who removed the user
- `USER_REMOVED_FROM_GROUP`: A user has been removed from a group (sent to the user)
    - `full_name`: The full name of the user who was removed
    - `group_name`: The name of the group that the user was removed from
    - `group_id`: The ID of the group that the user was removed from
    - `remover_utorid`: The utorid of the user who removed the user
    - `remover_full_name`: The full name of the user who removed the user

In addition to the above, all events share the common context fields:
- `receiver_utorid`: The utorid of the user who received the notification
- `receiver_full_name`: The full name of the user who received the notification
- `receiver_email`: The email of the user who received the notification
- `frontend_url`: The URL of the application frontend

### Notification Templates
Template strings utilize context variables in the form of `{{variable_name}}`. These variables are replaced with the corresponding values in the context object (see above).
### Notification Destinations
Notification destinations are the endpoints that the notification will be sent to. Currently, the following destinations are supported:
- `email`: Sends an email to the user
- `discord`: Sends a message to a Discord channel using a [discord webhook](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks).
- `slack`: Sends a message to a Slack channel using a [slack webhook](https://api.slack.com/messaging/webhooks).
#### Configuring Templates
The file `backend/notifications/templates.ts` contains the templates for each notification type. The `template` field is the default template for all webhook destinations. If you wish to configure the template for a specific destination, you can add a specific field for that destination. For example, if you wish to configure the template for the `discord` destination, you can add a `discord` field to the template object. The `discord` field will then be used as the template for the `discord` destination. If a specific template is not configured for a destination, the default `template` will be used.
##### Configuring Emails
If you wish to have further control on emails sent you can configure the following fields under the `email` field:
- `subject`: The subject of the email
- `html`: The HTML content of the email

Note that if the field is an object, all fields in the sub-object are required.
