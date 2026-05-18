# Ecommerce API & Frontend UI

A simple full-stack ecommerce project featuring a Flask backend API and frontend user interface for product browsing and order management.

---

## Features

- Product listing
- Order management
- Product search
- Frontend UI
- JSON-based temporary data storage
- Docker support
- REST API endpoints

---

## Tech Stack

### Backend
- Python
- Flask
- Flask-CORS
- JSON

### Frontend
- HTML
- CSS
- JavaScript

### Tools
- Git
- GitHub
- Docker

---

## Project Structure

```bash
ecommerce-api/
├── backend/
│   ├── app.py
│   ├── data/
│   │   ├── products.json
│   │   └── orders.json
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
│
├── frontend/
│   ├── home.html
│   ├── script.js
│   └── style.css
│
├── .gitignore
└── README.md
```

---

## API Endpoints

### Products
```http
GET /products
```

Returns all products.

---

### Orders
```http
GET /orders
```

Returns all orders.

```http
POST /orders
```

Creates a new order.

---

## Local Setup

### Clone repository

```bash
git clone https://github.com/Krishnaa-21/ecommerce-api.git
cd ecommerce-api
```

---

### Backend setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs at:

```text
http://localhost:5000
```

---

### Frontend setup

Open:

```text
frontend/home.html
```

or use Live Server.

---

## Docker Setup

### Build Docker image

```bash
cd backend
docker build -t ecommerce-api .
```

---

### Run Docker container

```bash
docker run -p 5000:5000 ecommerce-api
```

---

### Access application

Backend:

```text
http://localhost:5000
```

Products API:

```text
http://localhost:5000/products
```

Orders API:

```text
http://localhost:5000/orders
```

---

## Future Improvements

- Database integration (SQLite / PostgreSQL)
- User authentication
- Shopping cart functionality
- Payment integration
- Admin dashboard
- Deployment to cloud

---

## Notes

This project currently uses JSON files for temporary data storage for learning purposes.

---

## Author

Krishna Prajapat