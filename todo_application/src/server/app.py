from flask import Flask, jsonify, request
from flask_cors import CORS
from database_connector import DatabaseConnector
from data_fetcher import DataFetcher
from chat_handler import ChatHandler
import openai

app = Flask(__name__)
CORS(app)
#db_connector = DatabaseConnector()
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
                       "blood draw" == graph['@title'].lower() or
                       "testing" == graph['@title'].lower() or
                       "aaa" == graph['@title'].lower() or
                       "dcr" == graph['@title'].lower()]
    
    return jsonify({'graphs': filtered_graphs})

@app.route('/testIfUserExistsInDcrAndAddToDatabase', methods=['GET'])
def test_if_user_exists_in_dcr_and_add_to_database():
    graphs = data_fetcher.test_if_user_exists_in_dcr_and_add_to_database()
    if graphs is None:
        return jsonify(None)
    #return jsonify({'graphs': graphs})
    # TODO: Implement in database such that the graphs that the user has created can be shown and not hardcoded here
    filtered_graphs = [graph for graph in graphs if
                       "blood draw" == graph['@title'].lower() or
                       "testing" == graph['@title'].lower() or
                       "aaa" == graph['@title'].lower() or
                       "dcr" == graph['@title'].lower()]

    return jsonify({'graphs': filtered_graphs})

@app.route('/testIfUserExistsInDatabase', methods=['GET'])
def test_if_user_exists_in_database():
    user = data_fetcher.test_if_user_and_password_exists_in_database()
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
        data_fetcher.cursor.execute("SELECT * FROM requests WHERE username = %s AND role = %s;", (data_fetcher.username, role))
        req = data_fetcher.cursor.fetchone()
        print("Request: ", request)
        if req is not None:
            print("User has already requested that role")
        else:
            # Add role request to database if it does not exist
            try:
                data_fetcher.cursor.execute("INSERT INTO requests (username, role) VALUES (%s, %s);", (data_fetcher.username, role))
                data_fetcher.db.commit()
                print("Role request added to database")

            except Exception as e:
                print("Error: ", e)
                return None
    except Exception as e:
        print("Error: ", e)
        return None
    return jsonify({'username': data_fetcher.username, 'role': role})
