from flask import Flask ,request

app=Flask(__name__)
users=[]
user_id=1

@app.route("/users",methods=["POST"])
def create_user():
    global user_id
    data=request.get_json() or {}
    name=data.get("name")
    age=data.get("age")

    if not name:
        return{
            "error":"Name is required"
        },400
    name=name.strip()
    if len(name)<3:
        return{
            "error":"Name must be atleast 3 character"
        },400
    
    if age is None:
        return {
            "error":"Age is required"
        },400
    try:
        age=int(age)
    except:
        return{
            "error":"Age must be number"
        },400
    if age < 3:
        return{
            "error":"Age must be at least 3 years"
        },400
    
    user={
        "id":user_id,
        "name":name,
        "age":age
    }

    users.append(user)
    user_id +=1

    return user,201

@app.route("/users",methods=["GET"])
def get_user():
    return users,200

if __name__==("__main__"):
    app.run(debug=True)
