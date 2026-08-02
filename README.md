# 📝 Real-Time Collaborative To-Do Board

A cloud-deployed collaborative task management application that enables multiple users to create, update, and synchronize tasks in real time using **Node.js**, **Express.js**, **Socket.IO**, and **Render**.

---

# 📖 Overview

Modern teams often collaborate remotely and require task management systems where updates made by one user are immediately visible to everyone else.

Traditional web applications rely on repeated page refreshes or periodic polling to fetch updates, leading to unnecessary network requests and delayed synchronization.

This project demonstrates how **real-time communication** using **WebSockets** can eliminate these limitations by instantly broadcasting task updates to every connected client.

The application is deployed on the cloud using **Render**, allowing users to access the system through a web browser without local installation.

---

# 🎯 Objectives

- Build a collaborative task management application.
- Synchronize tasks across multiple users in real time.
- Understand WebSocket-based communication.
- Deploy a Node.js application on the cloud.
- Demonstrate client-server architecture using Express.js and Socket.IO.

---

# ✨ Features

- ✅ Create new tasks
- ✅ Delete completed tasks
- ✅ Real-time synchronization across connected users
- ✅ Instant updates without page refresh
- ✅ Lightweight and responsive interface
- ✅ Cloud deployment using Render
- ✅ Browser-based access
- ✅ Multi-user collaboration

---

# 🏗️ System Architecture

```text
                  Client A
                     │
                     │
                     ▼
              Socket.IO Client
                     │
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
          Express.js + Node.js Server
                    │
                    │
         Socket.IO Event Broadcasting
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
 Socket.IO Client          Socket.IO Client
      Client B                 Client C
```

---

# 🔄 Workflow

1. A user opens the collaborative board.
2. The browser establishes a Socket.IO connection with the server.
3. When a task is created or updated, an event is sent to the server.
4. The server broadcasts the update to every connected client.
5. Every user immediately sees the updated task list without refreshing the page.

---

# 🚀 Why Socket.IO?

Traditional HTTP follows a **request-response** model.

```
Client

↓

Request

↓

Server

↓

Response
```

If another user updates the task list, your browser does not know about it unless it requests the latest data again.

Socket.IO establishes a persistent WebSocket connection, allowing the server to **push updates instantly**.

Benefits include:

- Low latency
- Real-time communication
- Reduced network overhead
- Better collaboration experience

---

# 🌐 Why Express.js?

Express.js was used because it provides a lightweight and efficient framework for building Node.js web applications.

It simplifies:

- Route handling
- Static file serving
- Middleware integration
- HTTP request processing

---

# ☁️ Cloud Deployment

The application is deployed using **Render**.

Deployment workflow:

```text
GitHub Repository

        │

        ▼

Render

        │

Automatic Build

        │

        ▼

Live Application
```

Advantages of using Render:

- Free cloud hosting
- Automatic deployments
- GitHub integration
- HTTPS support
- Easy Node.js deployment

---

# 🖥️ Technology Stack

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js

### Real-Time Communication

- Socket.IO

### Deployment

- Render

### Version Control

- Git
- GitHub

---

# 📂 Project Structure

```text
RT-Collaborative-ToDo-App/

├── public/
│   ├── css/
│   ├── js/
│   └── index.html
│
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

---

# ⚙️ Installation

### Clone the repository

```bash
git clone https://github.com/SemesterProjects/RT-Collaborative-ToDo-App.git
```

### Navigate to the project

```bash
cd RT-Collaborative-ToDo-App
```

### Install dependencies

```bash
npm install
```

### Start the server

```bash
npm start
```

The application will be available at:

```
http://localhost:3000
```

---

# 📡 Real-Time Communication Flow

```text
User Adds Task

        │

        ▼

Browser emits Socket.IO event

        │

        ▼

Node.js Server receives event

        │

        ▼

Server broadcasts update

        │

        ▼

Every connected client updates instantly
```

---

# 🔮 Future Improvements

Potential enhancements include:

- User authentication
- Task priorities
- Due dates
- Persistent database storage
- Team workspaces
- Drag-and-drop task organization
- Notifications
- Activity logs
- Mobile responsiveness
- Docker deployment

---

# 📚 Learning Outcomes

Through this project, I gained practical experience with:

- Client-Server Architecture
- Real-Time Web Applications
- WebSockets
- Socket.IO
- Express.js
- Node.js
- Cloud Deployment
- GitHub Integration
- Event-Driven Programming

---

# 👨‍💻 Author

**Visha Yadav**

Computer Engineering Student

Interested in Software Engineering, Cloud Computing, and Full-Stack Development.

---

# 📄 License

Copyright (c) 2026 Visha Yadav

All rights reserved.

This source code is provided for viewing purposes only.

No permission is granted to copy, modify, distribute, sublicense, use in academic submissions, or present this work as your own without prior written permission from the copyright holder.

Unauthorized academic submission or plagiarism of this work may constitute copyright infringement and academic misconduct.
