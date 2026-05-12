from flask import Flask, request, jsonify, session
import os
import json

app=Flask(__name__)

PRODUCTS_FILE="products.json"
ORDERS_FILE="orders.json"

# -------------------------
# Utility Functions
# -------------------------

def read_json(file_path):
    if not os.path.exists(file_path):
        with open(file_path,"w") as f:
            json.dump([],f)

    with open(file_path, "r") as f:
        return json.load(f)
    
def write_json(file_path , data):
    with open (file_path,"w") as f:
        json.dump(data,f,indent=4)

def get_product_by_id (product_id):
    products=read_json(PRODUCTS_FILE)
    for product in products:
        if product["id"]==product_id:
            return product
    return None

def initilization_cart():
    if "cart" not in session :
        session ["cart"]={}    

# -------------------------
# Product Routes
# -------------------------

@app.route("/")
def home():
    return jsonify({
         "message": "Welcome to Flask E-Commerce API"
    })

@app.route("/products", methods=["GET"])
def get_products():
    products=read_json(PRODUCTS_FILE)
    return jsonify(products)

@app.route("/product/<int:product_id>",methods=["GET"])
def product_detail(product_id):
    product=get_product_by_id(product_id)

    if not product:
        return jsonify({"error": "Product not found"}), 404

    return jsonify(product)

@app.route("/search", methods=["GET"])
def search_products():
    query = request.args.get("q", "").lower()

    products = read_json(PRODUCTS_FILE)

    results = [
        product for product in products
        if query in product["name"].lower()
    ]

    return jsonify(results)

# ------------------------
# Cart Routes
# -------------------------

def view_cart():
    initilization_cart()
    cart=session["cart"]
    cart_items=[]
    total = 0

    for product_id, qty in cart.items():
        product = get_product_by_id(int(product_id))

        if product:
            subtotal = product["price"] * qty
            total += subtotal

            cart_items.append({
                "product": product,
                "quantity": qty,
                "subtotal": subtotal
            })
    return jsonify({
        "cart": cart_items,
        "total": total
    })



