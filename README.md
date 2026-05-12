# 🚀 Flask API Basics  

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" width="160px">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.x-blue?logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Flask-Web%20Framework-black?logo=flask&logoColor=white" />
  <img src="https://img.shields.io/badge/API-REST-green" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" />
</p>

A simple and beginner-friendly Flask REST API project demonstrating core API development concepts using Python and Flask.  
Designed as a foundational backend project for learning and portfolio building.

---

## ✨ Features

- ✅ Basic Flask server setup  
- ✅ RESTful API endpoints (GET & POST)  
- ✅ JSON request and response handling  
- ✅ Clean and minimal project structure  
- ✅ Easy to extend and customize  

---


## ⚙️ Installation & Setup

```bash
# Clone the repository
git clone https://github.com/your-username/Flask-API-Basics.git

# Navigate into the project folder
cd Flask-API-Basics

# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask application
python app.py
```

Server will run at:

```
http://127.0.0.1:5000/
```

---

## 🔗 Example Endpoints

### ✅ GET Request

```http
GET /api/hello
```

**Response:**
```json
{
  "message": "Hello, World!"
}
```

---

### ✅ POST Request

```http
POST /api/data
```

**Request Body (JSON):**
```json
{
  "name": "John"
}
```

**Response:**
```json
{
  "received": "John"
}
```

---

## 👨‍💻 Author

krishna Prajapat  

# GitHub: https://github.com/krishnaa-21  

---

⭐ If you found this project helpful, feel free to star the repository!
