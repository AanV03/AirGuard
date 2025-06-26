# 🌿 AirGuard - Smart Air Quality Monitoring & Purification System

**AirGuard** is a student-developed IoT project focused on monitoring and improving indoor air quality using a custom hardware device and a web interface. It includes a chatbot named **GuardBot**, which educates users about air quality and environmental awareness.

---

## 📌 Overview

The system collects real-time data using sensors and an ESP32 microcontroller. The data is processed and displayed via a Node.js-based web application using MVC architecture. GuardBot provides informative responses related to air quality and ecological themes.

---

## 🧩 Current Project Architecture

/AirGuard
│
├── config/
│ └── db.js
│
├── controllers/
│ ├── deviceController.js
│ └── userController.js
│
├── models/
│ ├── Device.js
│ ├── Reading.js
│ └── User.js
│
├── routes/
│ └── (pending or in progress)
│
├── static/
│ ├── css/
│ │ ├── Configuration.css
│ │ ├── login.css
│ │ ├── mainpage.css
│ │ └── register.css
│ ├── img/
│ │ ├── logo.png
│ │ ├── polygon-scatter-haikei.svg
│ │ ├── prototipo1.png
│ │ ├── prototipo2.png
│ │ ├── secretario.cur
│ │ └── secretario.png
│ └── js/
│ └── (pending or empty)
│
├── templates/
│ ├── Configuration.html
│ ├── login.html
│ ├── Mainpage.html
│ └── Register.html
│
├── app.js
├── .env
├── package.json
└── package-lock.json


---

## 🤖 GuardBot - Ecological Chatbot

**GuardBot** is an informative chatbot embedded into the web platform. It helps users learn about:

- Air pollutants (PM2.5, CO, VOCs, etc.)
- Environmental responsibility
- Tips for improving air quality
- Sensor meanings and health impacts

GuardBot's responses are stored in structured objects categorized by subtopic. These will later be expanded or connected to more dynamic logic.

---

## 🧠 Tech Stack

| Area        | Tech             |
|-------------|------------------|
| Backend     | Node.js, Express |
| Frontend    | HTML, CSS        |
| Database    | MongoDB (via Mongoose) |
| Architecture| MVC              |
| Templates   | EJS-style or raw HTML (depending on future changes) |

---

## 🚧 Status

| Feature                  | Status       |
|--------------------------|--------------|
| MVC structure            | In progress  |
| MongoDB setup            | Partial      |
| Web dashboard HTML       | Drafted      |
| Static styling (CSS)     | In progress  |
| GuardBot base logic      | Planned      |
| Authentication/Security  | Not implemented yet |

---

## 🔜 To-Do

- [ ] Add route logic in `/routes`
- [ ] Finish reading and writing data to MongoDB
- [ ] Connect frontend templates to backend
- [ ] Develop GuardBot’s data model and controller
- [ ] Implement login/register logic
- [ ] Plan security/authentication strategy

---

## 👥 Team

| Name     | Role                          |
|----------|-------------------------------|
| Aaron    | Web Full-Stack & Team Leader  |
| Betsy     | IoT & Sensors (ESP32)         |
| Bryan    | App developer          |
| Ray       | UI/UX Design  & 3D designer                |
| Emmanuel   | Database & Data Modeling      |

---

## 📌 Notes

- This is an academic project, so modularity, clarity, and structure are prioritized over optimization.
- Security layer (e.g., JWT, bcrypt) will be added later once login flow is implemented.

---


