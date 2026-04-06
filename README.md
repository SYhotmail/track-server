# 📦 Track Server

Backend API for a React Native tracking app.  
Handles location data, user sessions, and track storage.

---

## 🚀 Features

- 📍 Store user location tracks (latitude, longitude, timestamp)
- 🔐 Authentication (JWT-based)
- 📡 REST API for mobile clients
- 🧾 Retrieve and manage tracking history
- ⚡ Lightweight and fast Node.js server

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication

---

## 📁 Project Structure

track-server/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   └── app.js
├── server.js
├── .env
├── package.json
└── README.md

---

## ⚙️ Setup & Installation

### 1. Clone repository
git clone <your-repo-url>
cd track-server

### 2. Install dependencies
npm install

---

## 🔐 Environment Variables

Create a `.env` file:

MONGO_URI=mongodb://localhost:27017/track-server

---

## ▶️ Running the Server

### Development
npm run dev

### Production
npm start

Server will run on:
http://localhost:3000

---

## 📡 API Endpoints

### 🔐 Auth

POST /api/auth/register
POST /api/auth/login

---

### 📍 Tracks

POST /api/tracks
GET /api/tracks

---

## 🧪 Testing the API

curl http://localhost:3000/api/tracks \
  -H "Authorization: Bearer <token>"

---

## 🧠 How It Works

1. Mobile app sends location data → /api/tracks  
2. Server validates user via JWT  
3. Data is stored in database  
4. Client fetches history when needed  

---

## 🔒 Security Notes

- Never commit `.env`
- Use strong JWT secrets
- Validate all inputs

---

## 🐞 Troubleshooting

### MongoDB not connecting
mongod

### Port already in use
lsof -i :3000
kill -9 <PID>

---

## 🚀 Deployment Tips

- Render / Railway / AWS / DigitalOcean
- Set environment variables in hosting dashboard

