from flask import Flask, request, jsonify, session, render_template
import os
import json
from datetime import datetime
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

PRODUCTS_FILE = "products.json"
ORDERS_FILE = "orders.json"

# -------------------------
# Utility Functions
# -------------------------

def read_json(file_path):
    """Read JSON file and return data"""
    if not os.path.exists(file_path):
        with open(file_path, "w") as f:
            json.dump([], f)
    with open(file_path, "r") as f:
        return json.load(f)

def write_json(file_path, data):
    """Write data to JSON file"""
    with open(file_path, "w") as f:
        json.dump(data, f, indent=4)

def get_product_by_id(product_id):
    """Get product by ID"""
    products = read_json(PRODUCTS_FILE)
    for product in products:
        if product["id"] == product_id:
            return product
    return None

def initialize_cart():
    """Initialize cart in session"""
    if "cart" not in session:
        session["cart"] = {}

def get_cart_total():
    """Calculate cart total"""
    initialize_cart()
    cart = session["cart"]
    total = 0
    for product_id, qty in cart.items():
        product = get_product_by_id(int(product_id))
        if product:
            total += product["price"] * qty
    return total

def get_cart_count():
    """Get total items in cart"""
    initialize_cart()
    return sum(session["cart"].values())

# -------------------------
# HTML Template Routes (Pages)
# -------------------------

@app.route("/")
def home():
    """Render home page"""
    return render_template("home.html")

@app.route("/products")
def products_page():
    """Render products page"""
    return render_template("products.html")

@app.route("/cart")
def cart_page():
    """Render cart page"""
    return render_template("cart.html")

@app.route("/checkout")
def checkout_page():
    """Render checkout page"""
    initialize_cart()
    if not session["cart"]:
        return render_template("cart.html")
    return render_template("checkout.html")

@app.route("/orders")
def orders_page():
    """Render orders page"""
    if os.path.exists("templates/orders.html"):
        return render_template("orders.html")
    else:
        return jsonify(read_json(ORDERS_FILE))

@app.route("/test-images")
def test_images():
    """Test images page"""
    return render_template("test_images.html")

# -------------------------
# API Routes (JSON Data)
# -------------------------

@app.route("/api/products", methods=["GET"])
def api_get_products():
    """API: Get all products"""
    products = read_json(PRODUCTS_FILE)
    return jsonify(products)

@app.route("/api/product/<int:product_id>", methods=["GET"])
def api_product_detail(product_id):
    """API: Get product by ID"""
    product = get_product_by_id(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product)

@app.route("/api/search", methods=["GET"])
def api_search_products():
    """API: Search products"""
    query = request.args.get("q", "").lower()
    products = read_json(PRODUCTS_FILE)
    results = [
        product for product in products
        if query in product["name"].lower() or query in product.get("description", "").lower()
    ]
    return jsonify(results)

@app.route("/api/cart", methods=["GET"])
def api_view_cart():
    """API: View cart"""
    initialize_cart()
    cart = session["cart"]
    cart_items = []
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
        "total": total,
        "count": get_cart_count()
    })

@app.route("/api/cart/add", methods=["POST"])
def api_add_to_cart():
    """API: Add to cart"""
    initialize_cart()
    data = request.json
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)
    product = get_product_by_id(product_id)

    if not product:
        return jsonify({"error": "Product not found"}), 404
    if quantity <= 0:
        return jsonify({"error": "Invalid quantity"}), 400

    cart = session["cart"]
    product_key = str(product_id)
    current_quantity = cart.get(product_key, 0)

    if product["stock"] < (current_quantity + quantity):
        return jsonify({"error": "Not enough stock"}), 400

    if product_key in cart:
        cart[product_key] += quantity
    else:
        cart[product_key] = quantity

    session["cart"] = cart
    session.modified = True

    return jsonify({
        "message": "Product added to cart",
        "cart_count": get_cart_count()
    })

@app.route("/api/cart/update", methods=["PUT"])
def api_update_cart():
    """API: Update cart quantity"""
    initialize_cart()
    data = request.json
    product_id = str(data.get("product_id"))
    quantity = data.get("quantity", 1)

    if quantity <= 0:
        return jsonify({"error": "Invalid quantity"}), 400

    product = get_product_by_id(int(product_id))
    if not product:
        return jsonify({"error": "Product not found"}), 404
    if product["stock"] < quantity:
        return jsonify({"error": "Not enough stock"}), 400

    cart = session["cart"]
    cart[product_id] = quantity
    session["cart"] = cart
    session.modified = True

    return jsonify({
        "message": "Cart updated",
        "cart_count": get_cart_count()
    })

@app.route("/api/cart/remove", methods=["DELETE"])
def api_remove_from_cart():
    """API: Remove from cart"""
    initialize_cart()
    data = request.json
    product_id = str(data.get("product_id"))
    cart = session["cart"]

    if product_id in cart:
        del cart[product_id]
        session["cart"] = cart
        session.modified = True
        return jsonify({
            "message": "Product removed from cart",
            "cart_count": get_cart_count()
        })

    return jsonify({"error": "Product not in cart"}), 404

@app.route("/api/cart/clear", methods=["DELETE"])
def api_clear_cart():
    """API: Clear cart"""
    session["cart"] = {}
    session.modified = True
    return jsonify({
        "message": "Cart cleared",
        "cart_count": 0
    })

@app.route("/api/checkout", methods=["POST"])
def api_checkout():
    """API: Checkout"""
    initialize_cart()
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

        for p in products:
            if p["id"] == product["id"]:
                p["stock"] -= qty
                break

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
        "total": total,
        "status": "pending",
        "created_at": datetime.now().isoformat()
    }

    orders.append(order)
    write_json(ORDERS_FILE, orders)
    session["cart"] = {}
    session.modified = True

    return jsonify({
        "message": "Order placed successfully",
        "order": order
    })

@app.route("/api/orders", methods=["GET"])
def api_get_orders():
    """API: Get all orders"""
    orders = read_json(ORDERS_FILE)
    return jsonify(orders)

@app.route("/api/orders/<int:order_id>", methods=["GET"])
def api_get_order(order_id):
    """API: Get order by ID"""
    orders = read_json(ORDERS_FILE)
    for order in orders:
        if order["order_id"] == order_id:
            return jsonify(order)
    return jsonify({"error": "Order not found"}), 404

@app.route("/api/orders/<int:order_id>/status", methods=["PUT"])
def api_update_order_status(order_id):
    """API: Update order status"""
    orders = read_json(ORDERS_FILE)
    data = request.json
    new_status = data.get("status")
    
    if not new_status:
        return jsonify({"error": "Status is required"}), 400
    
    for order in orders:
        if order["order_id"] == order_id:
            order["status"] = new_status
            order["updated_at"] = datetime.now().isoformat()
            write_json(ORDERS_FILE, orders)
            return jsonify({
                "message": "Order status updated",
                "order": order
            })
    
    return jsonify({"error": "Order not found"}), 404

@app.route("/api/admin/products/add", methods=["POST"])
def api_add_product():
    """API: Add product"""
    data = request.json
    required_fields = ["name", "price", "description", "stock"]

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    products = read_json(PRODUCTS_FILE)
    new_product = {
        "id": len(products) + 1,
        "name": data["name"],
        "price": float(data["price"]),
        "description": data["description"],
        "stock": int(data["stock"]),
        "image": data.get("image", ""),
        "category": data.get("category", "general"),
        "created_at": datetime.now().isoformat()
    }

    products.append(new_product)
    write_json(PRODUCTS_FILE, products)
    return jsonify({
        "message": "Product added",
        "product": new_product
    }), 201

@app.route("/api/admin/products/edit/<int:product_id>", methods=["PUT"])
def api_edit_product(product_id):
    """API: Edit product"""
    products = read_json(PRODUCTS_FILE)
    data = request.json

    for product in products:
        if product["id"] == product_id:
            product["name"] = data.get("name", product["name"])
            product["price"] = float(data.get("price", product["price"]))
            product["description"] = data.get("description", product["description"])
            product["stock"] = int(data.get("stock", product["stock"]))
            product["image"] = data.get("image", product.get("image", ""))
            product["category"] = data.get("category", product.get("category", "general"))
            product["updated_at"] = datetime.now().isoformat()
            write_json(PRODUCTS_FILE, products)
            return jsonify({
                "message": "Product updated",
                "product": product
            })

    return jsonify({"error": "Product not found"}), 404

@app.route("/api/admin/products/delete/<int:product_id>", methods=["DELETE"])
def api_delete_product(product_id):
    """API: Delete product"""
    products = read_json(PRODUCTS_FILE)
    updated_products = [
        product for product in products
        if product["id"] != product_id
    ]

    if len(updated_products) == len(products):
        return jsonify({"error": "Product not found"}), 404

    write_json(PRODUCTS_FILE, updated_products)
    return jsonify({"message": "Product deleted"})

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "ShopHub E-Commerce API",
        "version": "2.0",
        "timestamp": datetime.now().isoformat()
    })

@app.route("/api/stats", methods=["GET"])
def get_stats():
    """Get store statistics"""
    products = read_json(PRODUCTS_FILE)
    orders = read_json(ORDERS_FILE)
    
    total_revenue = sum(order.get("total", 0) for order in orders)
    total_products = len(products)
    total_orders = len(orders)
    out_of_stock = len([p for p in products if p.get("stock", 0) == 0])
    
    return jsonify({
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "out_of_stock_products": out_of_stock,
        "average_order_value": total_revenue / total_orders if total_orders > 0 else 0
    })

# -------------------------
# Error Handlers
# -------------------------

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        "error": "Not found",
        "message": "The requested resource was not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        "error": "Internal server error",
        "message": "Something went wrong on our end"
    }), 500

@app.errorhandler(400)
def bad_request(error):
    """Handle 400 errors"""
    return jsonify({
        "error": "Bad request",
        "message": "The request was invalid"
    }), 400

# -------------------------
# Context Processor
# -------------------------

@app.context_processor
def inject_cart_count():
    """Inject cart count into all templates"""
    return dict(cart_count=get_cart_count())

# -------------------------
# Run Application
# -------------------------

if __name__ == "__main__":
    if not os.path.exists(PRODUCTS_FILE):
        write_json(PRODUCTS_FILE, [])
    if not os.path.exists(ORDERS_FILE):
        write_json(ORDERS_FILE, [])
    
    print("=" * 50)
    print("ShopHub E-Commerce Server Starting...")
    print("=" * 50)
    print("Home Page: http://localhost:5000/")
    print("Products: http://localhost:5000/products")
    print("Cart: http://localhost:5000/cart")
    print("Checkout: http://localhost:5000/checkout")
    print("Orders: http://localhost:5000/orders")
    print("Test Images: http://localhost:5000/test-images")
    print("=" * 50)
    
    app.run(host="0.0.0.0", port=5000, debug=True)