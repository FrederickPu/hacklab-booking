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
