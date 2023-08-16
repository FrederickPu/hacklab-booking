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