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

# -------------------------
# Cart Routes
# -------------------------

def view_cart():
    initilization_cart()
    cart=session["cart"]
    cart_items=[]
    total=0

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

@app.route("/cart/add", methods=["POST"])
def add_to_cart():
    initilization_cart()

    data = request.json
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    product = get_product_by_id(product_id)

    if not product:
        return jsonify({"error": "Product not found"}), 404

    if quantity <= 0:
        return jsonify({"error": "Invalid quantity"}), 400

    if product["stock"] < quantity:
        return jsonify({"error": "Not enough stock"}), 400

    cart = session["cart"]

    product_key = str(product_id)

    if product_key in cart:
        cart[product_key] += quantity
    else:
        cart[product_key] = quantity

    session["cart"] = cart
    session.modified = True

    return jsonify({"message": "Product added to cart"})

# -------------------------
# Checkout
# -------------------------

@app.route("/checkout", methods=["POST"])
def checkout():
    initilization_cart

    data = request.json

    customer_name = data.get("name")
    address = data.get("address")
    phone = data.get("phone")

    if not customer_name or not address or not phone:
        return jsonify({"error": "Missing customer details"}), 400

    cart = session["cart"]

    if not cart:
        return jsonify({"error": "Cart is empty"}), 400

    products = read_json(PRODUCTS_FILE)
    orders = read_json(ORDERS_FILE)

    order_items = []
    total = 0

    for product_id, qty in cart.items():
        product = get_product_by_id(int(product_id))

        if not product:
            continue

        if qty > product["stock"]:
            return jsonify({
                "error": f"Insufficient stock for {product['name']}"
            }), 400
        
        subtotal = product["price"] * qty
        total += subtotal

        product["stock"] -= qty

        order_items.append({
            "product_id": product["id"],
            "name": product["name"],
            "quantity": qty,
            "price": product["price"],
            "subtotal": subtotal
        })

    write_json(PRODUCTS_FILE, products)

    order = {
        "order_id": len(orders) + 1,
        "customer": {
            "name": customer_name,
            "address": address,
            "phone": phone
        },
        "items": order_items,
        "total": total
    }

    orders.append(order)
    write_json(ORDERS_FILE, orders)

    session["cart"] = {}
    session.modified = True

    return jsonify({
        "message": "Order placed successfully",
        "order": order
    })

# -------------------------
# Admin Routes
# -------------------------

