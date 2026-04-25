```markdown
# 🌐 Flask API Basics

<p align="center">
  <img src="https://cdn.worldvectorlogo.com/logos/flask.svg" alt="Flask Logo" width="160px"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white"/>
  <img src="https://img.shields.io/badge/REST%20API-FF6C37?style=for-the-badge&logo=postman&logoColor=white"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge"/>
</p>

---

A beginner-friendly RESTful API built with **Flask** and **Python**.  
Covers the fundamentals of building, routing, and testing API endpoints. 🚀

---

## ✨ Features

- ⚡ Lightweight and fast Flask-based REST API
- 🔁 Supports **GET** and **POST** HTTP methods
- 🧩 Clean and modular project structure
- 🛡️ JSON request & response handling
- 🐍 Pure Python — no heavy dependencies
- 🌍 Easy to extend and deploy

---

## 📁 Project Structure

```
flask-api-basics/
│
├── app.py                  # Main Flask application
├── routes/
│   ├── __init__.py
│   └── api_routes.py       # All API route definitions
├── models/
│   └── data_model.py       # Data models / mock database
├── requirements.txt        # Project dependencies
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/flask-api-basics.git
cd flask-api-basics
```

**2. Create a virtual environment**
```bash
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Run the Flask app**
```bash
python app.py
```

> 🟢 Server running at: `http://127.0.0.1:5000`

---

## 🔌 Example Endpoints

### 📥 GET — Fetch all items

```http
GET /api/items
```

**Response:**
```json
{
  "status": "success",
  "data": [
    { "id": 1, "name": "Item One" },
    { "id": 2, "name": "Item Two" }
  ]
}
```

---

### 📤 POST — Create a new item

```http
POST /api/items
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Item"
}
```

**Response:**
```json
{
  "status": "created",
  "message": "Item added successfully",
  "item": { "id": 3, "name": "New Item" }
}
```

---

## 👨‍💻 Author

<p align="center">
  Made with ❤️ by <strong>Your Name</strong>
</p>

<p align="center">
  <a href="https://github.com/yourusername">
    <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"/>
  </a>
  <a href="https://linkedin.com/in/yourprofile">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"/>
  </a>
</p>

---

<p align="center">
  ⭐ Star this repo if you found it helpful!
</p>
```