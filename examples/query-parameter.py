from flask import Flask,request

app=Flask(__name__)

'''@app.route("/user")
def user():
    name=request.args.get("name")
    return f"Hello {name}"  '''

@app.route("/search")
def search():
    item=request.args.get("item")
    return f"Hyy i have {item}"

@app.route("/user")
def user():
    name=request.args.get("name")
    age=request.args.get("age")
    return f"Hello my name is {name} and i am {age} year old"

if __name__=="__main__":
    app.run(debug=True)