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