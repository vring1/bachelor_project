from flask import Flask, jsonify, request, session
from flask_session import Session
from flask_cors import CORS
from database_connector import DatabaseConnector
from data_fetcher import DataFetcher
from chat_handler import ChatHandler
import openai

app = Flask(__name__)
CORS(app)


data_fetcher = DataFetcher()
chat_handler = ChatHandler()


@app.route('/chat', methods=['POST'])
def chat():
    # Extract the message content from the client request
    message = request.json['message']
    if message: 
        chat_handler.messages.append( 
            {"role": "user", "content": message}, 
        ) 
        chat = openai.ChatCompletion.create( 
            model="gpt-3.5-turbo", messages=chat_handler.messages 
        )
    else:
        raise ValueError("Message is empty")
    
    reply = chat.choices[0].message.content 
    # Return the response back to the client
    return jsonify({'response': reply})

@app.route('/fetchGraphsAfterLogin', methods=['GET'])
def fetch_graphs_after_login():
    graphs = data_fetcher.fetch_graphs_after_login()
    if graphs is None:
        return jsonify(None)
    #return jsonify({'graphs': graphs})
    # TODO: Implement in database such that the graphs that the user has created can be shown and not hardcoded here
    filtered_graphs = [graph for graph in graphs if
                       "blood draw" == graph['@Title'].lower() or
                       "testing" == graph['@Title'].lower() or
                       "aaa" == graph['@Title'].lower() or
                       "dcr" == graph['@Title'].lower()]
    
    return jsonify({'graphs': filtered_graphs})

@app.route('/testIfUserExistsInDcrAndAddToDatabase', methods=['GET'])
def test_if_user_exists_in_dcr_and_add_to_database(): # Register
    graphs = data_fetcher.test_if_user_exists_in_dcr_and_add_to_database()
    if graphs is None:
        return jsonify(None)
    return jsonify({'graphs': graphs})

@app.route('/testIfUserExistsInDatabase', methods=['POST'])
def test_if_user_exists_in_database(): # Login
    data = request.json
    username = data['username']
    password = data['password']
    user = data_fetcher.test_if_user_and_password_exists_in_database(username, password)
    if user is None:
        return jsonify(None)
    return jsonify({'user': user})


@app.route('/fetchData', methods=['GET'])
def fetch_data():
    labels = data_fetcher.fetch_data()
    return jsonify({'labels': labels})

@app.route('/performEvent', methods=['POST'])
def perform_event():
    event_id = request.json['event_id']
    labels = data_fetcher.perform_event(event_id)
    return jsonify({'labels': labels}) 

@app.route('/performGraphEvent', methods=['POST'])
def perform_graph_event():
    event_id = request.json['event_id']
    graph_id = request.json['graph_id']
    data_fetcher.graph_id = graph_id
    labels = data_fetcher.perform_event(event_id)
    return jsonify({'labels': labels})

@app.route('/requestRole', methods=['POST'])
def request_role():
    print("Requesting role for user: ", data_fetcher.username)
    #username = request.args.get('username')
    role = request.json['role']
    try:
        # Add role request to database, but only if the user has not already requested that specific role
        data_fetcher.cursor.execute("SELECT * FROM role_requests WHERE username = %s AND role = %s;", (data_fetcher.username, role))
        req = data_fetcher.cursor.fetchone()
        print("Request: ", request)
        if req is not None:
            print("User has already requested that role")
        else:
            # Add role request to database if it does not exist
            try:
                data_fetcher.cursor.execute("INSERT INTO role_requests (username, role) VALUES (%s, %s);", (data_fetcher.username, role))
                data_fetcher.db.commit()
                print("Role request added to database")

            except Exception as e:
                print("Error: ", e)
                return None
    except Exception as e:
        print("Error: ", e)
        return None
    return jsonify({'username': data_fetcher.username, 'role': role})

@app.route('/checkIfAdmin', methods=['GET'])
def check_if_admin():
    print("Checking if user is admin: ", data_fetcher.username)
    try:
        data_fetcher.cursor.execute("SELECT * FROM users WHERE username = %s;", (data_fetcher.username,))
        user = data_fetcher.cursor.fetchone()
        print("User: ", user)
        if user is not None:
            print("User exists in database")
            if user[3] == 1:
                print("User is admin")
                return jsonify({'admin': True})
            else:
                print("User is not admin")
                return jsonify({'admin': False})
        else:
            print("User does not exist in database")
            return jsonify({'admin': False})
    except Exception as e:
        print("Error: ", e)
        return None

@app.route('/fetchRoleRequests', methods=['GET'])
def fetch_role_requests():
    print("Fetching role requests")
    try:
        data_fetcher.cursor.execute("SELECT * FROM role_requests;")
        requests = data_fetcher.cursor.fetchall()
        print("Requests: ", requests)
        if requests is not None:
            print("Requests exist in database")
            return jsonify({'requests': requests})
        else:
            print("No requests exist in database")
            return jsonify({'requests': None})
    except Exception as e:
        print("Error: ", e)
        return None

@app.route('/approveRoleRequest', methods=['POST'])
def approve_role_request():
    print("Approving role request")
    username = request.json['username']
    role = request.json['role']
    try:
        # Add role to user in database
        data_fetcher.cursor.execute("INSERT INTO roles (role, username) VALUES (%s, %s);", (role, username))
        data_fetcher.db.commit()
        print("Role added to user in database")
        # Delete role request from database
        data_fetcher.cursor.execute("DELETE FROM role_requests WHERE username = %s AND role = %s;", (username, role))
        data_fetcher.db.commit()
        print("Role request deleted from database")
    except Exception as e:
        print("Error: ", e)
        return None
    return jsonify({'username': username, 'role': role})


@app.route('/fetchRolesForUser', methods=['GET'])
def fetch_roles_for_user():
    username = data_fetcher.username
    try:
        cursor = data_fetcher.cursor
        # Query roles associated with the provided username
        cursor.execute("SELECT role FROM roles WHERE username = %s;", (username,))
        roles = [row[0] for row in cursor.fetchall()]  # Extract roles from the result set

        return jsonify({'roles': roles}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/setDatafetcherRole', methods=['POST'])
def set_data_fetcher_role():
    role = request.json['role']
    data_fetcher.role = role
    return jsonify({'role': role})