from flask import Flask , request
app=Flask(__name__)
@app.route("/user", methods=["GET"])
def get_user():
    name=request.args.get("name")
    return f"Hello {name} "

@app.route("/user",methods=["POST"])
def create_user():
    data=request.get_json()
    name=data.get("name")
    age=data.get("age")
    return f"Hello {name} your age is{age}"
if __name__=="__main__":
    app.run(debug=True)