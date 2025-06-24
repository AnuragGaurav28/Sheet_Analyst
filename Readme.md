# 📊 Sheet Analyst

**Sheet Analyst** is a modern web-based Excel analytics platform that allows users to upload spreadsheet files (Excel), analyze their contents visually, and track history — all from a secure, elegant dashboard. Admins can manage users, view upload stats, and monitor recent activity.

---

## 🚀 Features

### 👤 User Panel
- 🔐 Secure login & registration (Email + OAuth)
- 📁 Upload Excel files (XLS/XLSX)
- 📊 Interactive visual analytics (including 3D charts)
- 📜 Upload history with download, delete, and "Analyze Again"
- ⚙️ Settings (Dark Mode, Font Size, Profile Update)

### 🛠️ Admin Panel
- 👥 View all users and uploaded files
- 📈 File upload trends (charts)
- 🕒 Recent activity tracking
- ❌ Delete user or file access

---

## 💻 Tech Stack

| Frontend          | Backend              | Database     | Tools & Auth       |
|------------------|----------------------|--------------|--------------------|
| React.js         | Node.js + Express    | MongoDB      | JWT, Google, GitHub |
| Tailwind CSS     | RESTful API          | Mongoose     | Multer, Chart.js    |
| React Router     | Nodemailer (optional)|              |                    |

---

## 📦 Folder Structure

```

Sheet\_Analyst/
├── client/         # React frontend
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── assets/
├── server/         # Node.js backend
│   ├── routes/
│   ├── models/
│   └── uploads/

````

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/AnuragGaurav28/Sheet_Analyst.git
cd Sheet_Analyst
````

### 2. Install dependencies

**Frontend:**

```bash
cd client
npm install
```

**Backend:**

```bash
cd ../server
npm install
```

### 3. Set up environment variables

Create a `.env` file inside the `server/` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password_or_app_password
```

---

### 4. Start the project

**In two terminals (or tabs):**

**Frontend:**

```bash
cd client
npm start
```

**Backend:**

```bash
cd server
node index.js
```

---

## 📷 Screenshots

LogIn Page![Screenshot 2025-06-24 211624](https://github.com/user-attachments/assets/8d0fae00-27a6-4a5d-927c-3dc4f0bf66ff)
User Dashboard![Screenshot 2025-06-24 212934](https://github.com/user-attachments/assets/ae014b11-de03-4b9e-99f3-e499e58cce0d)
Analysis Page![Screenshot 2025-06-24 211752](https://github.com/user-attachments/assets/1ea7905c-bf70-483f-be86-0057cb97296e)
Admin Dashboard![Screenshot 2025-06-24 211932](https://github.com/user-attachments/assets/7b240af7-fe70-4f28-abd9-b033712d94e5)


## ✨ Future Features

* 🔎 AI-powered insights from Excel files
* 📤 Export analyzed data
* 📬 Email notifications on upload

---

## 📬 Contact

Made by [Anurag Gaurav](https://github.com/AnuragGaurav28)
Email-anurag28gaurav@gmail.com

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

MIT License

Copyright (c) 2025 Anurag Gaurav

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


