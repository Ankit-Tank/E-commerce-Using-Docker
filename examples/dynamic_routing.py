from flask import Flask
app=Flask(__name__)
@app.route("/user/<name>")
def user (name):
    return (f"Hello {name}")


@app.route("/age/<int:age>")
def age (age):
    return (f"my age is {age}")

    

@app.route("/product/<name>/<int:price>")
def product (name,price):
    return (f"product name is  {name} and price is{price}")

if __name__=="__main__":
    app.run(debug=True)