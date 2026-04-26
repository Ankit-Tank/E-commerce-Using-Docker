from flask import Flask,request,render_template

app=Flask(__name__)

@app.route("/")
def home ():
    return render_template ("index.html")

@app.route("/user", methods=["POST"])
def user():
    #data=request.get_json()
    name=request.form.get("name")
    age=request.form.get("age")
    return f"Hello {name} and my age is {age}"
#print(app.url_map)
if __name__=="__main__":
    app.run(debug=True) 