# NimbleMeet - A video Call Platform

> [**NimbleMeet**](https://teamsclone-hosting.web.app/) is a platform for you to conduct all your meet ups, conferences, classes and video calls. This platform was built during [Engage ’21](https://microsoft.acehacker.com/engage2021/). If you want to dive in directly and use the platform for all your video calls and communication, you can refer to this [video](https://youtu.be/fGbMYlIo85w).

**Try out the application [HERE](https://teamsclone-hosting.web.app/)**

For more details you can see the :
- [End-user Documentation.](https://docs.google.com/document/d/1kZGtg0Dant_C0DXceSIZ3JdEgP0VZU44/edit)
- [Project Documentation.](https://docs.google.com/document/d/1otgZ0irjIOBO81owPQU-kHpk6SgAMO-7/edit)

---

## Features

1. 	Host and join a meeting.
2.	Add up to 20 participants in a video call.
3.	Chat in between meeting, and these chats remain persistant even before and after the meetings. (**Adapt Feature**)
4.	Schedule meetings and create rooms.
5.	Restrict the meetings and have control over who can join it.
6.	Have a chat conversation before and after the meeting.
7.	ability to turn on/off the camera and mic in the meeting.
8.	check mic and camera before joining any meet using the popup.
9.	Has a meeting logs to access all your scheduled and completed meetings (rooms) in one place.
10.	Admin privilages to the user who schedules meetings to change meeting title/ date-time/ restriction status and add or delete participants from meeting, rest all users are normal participant.
11.	Sign up/ Sign In users.
12.	Email Authenticaion of users.
13.	Manage your user profile.
14. Responsive UI.

---
## Technologies used
-	**Node.js** – An open-source, cross-platform, back-end JavaScript runtime environment used to run the applications.
-	**React JS** - a free and open-source front-end JavaScript library for building user interfaces or UI components. Maintained by Facebook React is used to develop single page progressive web apps
-	**Firebase** – A cloud-hosted Realtime NoSQL database used to store and sync data between users in Realtime. Also used to authenticate and manage users.
-	**Twilio Programmable video** – A SDK Build on top of WebRTC with a set of flexible APIs that integrate video into apps. This is used to create and manage video rooms and WebRTC channels.
-	**Twilio Programmable chat** – A SDK used to create and manage communication channels for chat.

---
## WebRTC Architecture used

NimbleMeet uses Twilio programable Video for video calls. Twilio programmable video is a SDK built on top of WebRTC for creating RealTime communication applications. 

> There were three options for WebRTC architecture :
>- ***Peer-to-peer*** network
>- ***MCU*** - Multipoint Conferencing Unit
>- ***SFU***- Standard Forwarding Unit

I went on to use **SFU architecture** as it suits the best for my application requirements. For more details refer to [Project Documentation](https://docs.google.com/document/d/1otgZ0irjIOBO81owPQU-kHpk6SgAMO-7/edit).

---

## **Agile Methodology**

>The agile approach is based on teamwork, close collaboration with customers and stakeholders, flexibility, and ability to quickly respond to changes. 

During Engage '21 we were Advised to use agile methodology so we can integrate a suprise feature during the build.

## **Agile RoadMap**

For more detail refer [Agile Process Documentation](https://docs.google.com/document/d/1otgZ0irjIOBO81owPQU-kHpk6SgAMO-7/edit)

| Week | Task Completed | Backlog |
------------ | ------------- | ---
|Week 1 | 1. Compared and selected TechStack | NIL
-|2. Designed UI and Database  | 
-|3. Researched on WebRTC|
Week 2 | 1. Implemented video call | 1. Refactoring of code
-|2. implemented the call UI | 2. commenting the code
-| 3. brokedown application into smaller components| 3. Make UI responsive 
Week 3 | 1. added participant support up to 20 people | 1. Create Login Screen
-|2. Made UI responsive | 2. Create Firebase Database
-| 3. Refactored the code| 3. Add Suprise Feature 
-|4. Added In call Chat|
Week 4 | 1. Added Suprise Feature | 1. Commenting Code
-|2. Added user authentication | -
-| 3. Added other functions like schedule meet and admin control| 3. Documentation

---

## Installation

In the project directory, run `npm install` to install all the dependencis. then run `npm start` to run the application on localhost. Use `npm run build` to create a production build (in **\build** folder) for deployment.

### Dependencies

NimbleMeet runs on **Node js** and uses **React JS** for front end and
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). Following the dependencies used by NimbleMeet :

- @date-io/date-fns
- material-ui
- kendo-react-conversational-ui
- firebase
- twilio-chat
- twilio-video
