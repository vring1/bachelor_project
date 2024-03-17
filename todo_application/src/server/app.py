from flask import Flask, jsonify, request, session
from flask_session import Session
from flask_cors import CORS
from database_connector import DatabaseConnector
from data_fetcher import DataFetcher
from chat_handler import ChatHandler
import openai

app = Flask(__name__)
CORS(app, supports_credentials=True)


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
    print("fetch_graphs_after_login COOKIE: ",request.headers.get('Cookie'))
    session_token = request.headers.get('Cookie').split('=')[1]
    print("Session token: ", session)
    try:
        user = data_fetcher.execute_query("SELECT * FROM users WHERE session_token = %s;", (session_token,))
        username = user[0][1]
        password = user[0][2]
        print("User: ", user)
        graphs = data_fetcher.fetch_graphs_after_login(username, password)
        if graphs is None:
            return jsonify(None)
        #return jsonify({'graphs': graphs})
        # TODO: Implement in database such that the graphs that the user has created can be shown and not hardcoded here
        filtered_graphs = [graph for graph in graphs if
                           "blood draw" == graph['@Title'].lower() or
                           "testing" == graph['@Title'].lower() or
                           "aaa" == graph['@Title'].lower() or
                           "dcr" == graph['@Title'].lower()]
    except Exception as e:
        print("Error in fetchGraphsAfterLogin: ", e)
        return None
    return jsonify({'graphs': filtered_graphs})




@app.route('/testIfUserExistsInDcrAndAddToDatabase', methods=['GET'])
def test_if_user_exists_in_dcr_and_add_to_database(): # Register
    graphs = data_fetcher.test_if_user_exists_in_dcr_and_add_to_database()
    if graphs is None:
        return jsonify(None)
    return jsonify({'graphs': graphs})

@app.route('/testIfUserExistsInDatabase', methods=['POST']) #generate session token
def test_if_user_exists_in_database(): # Login
    data = request.json
    username = data['username']
    password = data['password']
    user, session_token = data_fetcher.test_if_user_and_password_exists_in_database(username, password)
    if user is None:
        return jsonify(None)
    #return jsonify({'user': user, 'session_token': session_token})
    return jsonify({'user': user, 'session_token': session_token})


@app.route('/fetchData', methods=['GET'])
def fetch_data():
    session_token = request.headers.get('Cookie').split('=')[1]
    print("Session token: ", session)
    try:
        user = data_fetcher.execute_query("SELECT * FROM users WHERE session_token = %s;", (session_token,))
        username = user[0][1]
        password = user[0][2]
        print("User: ", user)
        labels = data_fetcher.fetch_data(username, password)
    #labels = data_fetcher.fetch_data()
    except Exception as e:
        print("Error: ", e)
        return None
    return jsonify({'labels': labels})

@app.route('/performEvent', methods=['POST'])
def perform_event():
    session_token = request.headers.get('Cookie').split('=')[1]
    print("Session token: ", session_token)
    try:
        user = data_fetcher.execute_query("SELECT * FROM users WHERE session_token = %s;", (session_token,))
        username = user[0][1]
        password = user[0][2]
        print("User: ", user)
        event_id = request.json['event_id']
        labels = data_fetcher.perform_event(event_id, username, password)
    except Exception as e:
        print("Error: ", e)
        return None 
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
    session_token = request.headers.get('Cookie').split('=')[1]
    print("Session token: ", session_token)
    role = request.json['role']
    # find user from session token
    user = data_fetcher.execute_query("SELECT * FROM users WHERE session_token = %s;", (session_token,))
    if user:
        print("User exists in database")
        username = user[0][1]
        print("Requesting role for user: ", username)
        try:
            # Add role request to database, but only if the user has not already requested that specific role
            req = data_fetcher.execute_query("SELECT * FROM role_requests WHERE username = %s AND role = %s;", (username, role))
            #print("Request: ", request)
            if req:
                print("User has already requested that role")
            else:
                # Add role request to database if it does not exist
                data_fetcher.execute_query("INSERT INTO role_requests (username, role) VALUES (%s, %s);", (username, role))
        except Exception as e:
            print("Error: ", e)
            return None
        return jsonify({'username': username, 'role': role})
    else:
        print("User does not exist in database")
        return None


@app.route('/checkIfAdmin', methods=['GET'])
def check_if_admin():
    session_token = request.headers.get('Cookie').split('=')[1]
    print("Session token: ", session_token)
    try:
        user = data_fetcher.execute_query("SELECT * FROM users WHERE session_token = %s;", (session_token,))
        print("User: ", user)
        if user:
            print("User exists in database")
            if user[0][3] == 1:
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
        requests = data_fetcher.execute_query("SELECT * FROM role_requests;")
        print("Requests: ", requests)
        if requests:
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
        data_fetcher.execute_query("INSERT INTO roles (role, username) VALUES (%s, %s);", (role, username))
        print("Role added to user in database")
        # Delete role request from database
        data_fetcher.execute_query("DELETE FROM role_requests WHERE username = %s AND role = %s;", (username, role))
        print("Role request deleted from database")
    except Exception as e:
        print("Error: ", e)
        return None
    return jsonify({'username': username, 'role': role})

@app.route('/denyRoleRequest', methods=['POST'])
def deny_role_request():
    print("Denying role request")
    username = request.json['username']
    role = request.json['role']
    try:
        # Delete role request from database
        data_fetcher.execute_query("DELETE FROM role_requests WHERE username = %s AND role = %s;", (username, role))
        print("Role request deleted from database")
    except Exception as e:
        print("Error: ", e)
        return None
    return jsonify({'username': username, 'role': role})

@app.route('/fetchRolesForUser', methods=['GET'])
def fetch_roles_for_user():
    session_token = request.headers.get('Cookie').split('=')[1]
    print("Session token fetch roles for user: ", session_token)
    try:
        user = data_fetcher.execute_query("SELECT * FROM users WHERE session_token = %s;", (session_token,))
        username = user[0][1]
        # Query roles associated with the provided username
        roles = data_fetcher.execute_query("SELECT role FROM roles WHERE username = %s;", (username,))
        roles = [row[0] for row in roles] if roles else []
        return jsonify({'roles': roles}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


    
@app.route('/setCurrentRole', methods=['POST'])
def set_current_role():
    role = request.json['role']
    print("ROLE FROM REQUEST: ", role)
    # set role in user table
    session_token = request.headers.get('Cookie').split('=')[1]
    print("Session token: ", session_token)
    try:
        print("ROLE FROM REQUEST 2: ", role)

        user = data_fetcher.execute_query("SELECT * FROM users WHERE session_token = %s;", (session_token,))
        username = user[0][1]
        print("ROLE FROM REQUEST 3: ", role)

        print("USERNAME IN SET_CURRENT_ROLE: ", username)
        data_fetcher.execute_query("UPDATE users SET current_role = %s WHERE username = %s;", (role, username))
        # select and print role
        print("ROLE FROM REQUEST 4: ", role)

        user = data_fetcher.execute_query("SELECT * FROM users WHERE session_token = %s;", (session_token,))
        print("ROLE FROM REQUEST 5: ", role)
        role = user[0][5]
        print("set_current_role: ", role)
    except Exception as e:
        print("Error: ", e)
        return None
        
    return jsonify({'role': role})