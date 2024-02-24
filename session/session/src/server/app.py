from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from flask_session import Session
from models import db, User
from config import ApplicationConfig

app = Flask(__name__)
app.config.from_object(ApplicationConfig)


bcrypt = Bcrypt(app)
server_session = Session(app)
db.init_app(app)

with app.app_context():
    db.create_all()


@app.route("/@me", methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if user_id is None:
        return jsonify({
            "error": "User not logged in"
        }), 400
    
    user = User.query.get(user_id)
    return jsonify({
        "id": user.id,
        "email": user.email
    })

@app.route('/register', methods=['POST'])
def register():
    email = request.json.get('email')
    password = request.json.get('password')

    user_exists = User.query.filter_by(email=email).first() is not None

    if user_exists:
        return jsonify({
            "error": "User already exists"
        }), 400
    
    hashed_password = bcrypt.generate_password_hash(password)#.decode('utf-8')
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "id": new_user.id,
        "email": new_user.email
    })


@app.route('/login', methods=['POST'])
def login():
    email = request.json.get('email')
    password = request.json.get('password')

    user = User.query.filter_by(email=email).first()

    if user is None:
        return jsonify({
            "error": "User doesn't exist"
        }), 400
    
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({
            "error": "Invalid password"
        }), 400
    
    session['user_id'] = user.id

    return jsonify({
        "id": user.id,
        "email": user.email
    })

if __name__ == '__main__':
    app.run(debug=True)