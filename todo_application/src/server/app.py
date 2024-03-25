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
    session_token = request.headers.get('Authorization').split('Bearer ')[1]
    print("Session token fetch graphs after login: ", session_token)
    #print("fetch_graphs_after_login COOKIE: ",request.headers.get('Cookie'))
    #session_token = request.headers.get('Cookie').split('=')[1]
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
        #filtered_graphs = [graph for graph in graphs if
        #                   "blood draw" == graph['@Title'].lower() or
        #                   "testing" == graph['@Title'].lower() or
        #                   "aaa" == graph['@Title'].lower() or
        #                   "jubi" == graph['@Title'].lower()]
        
        # Check if the first symbol on CategoryId is 8
        filtered_graphs = [graph for graph in graphs if
                            graph['@CategoryId'][0] == '8'
                           ]
        
    except Exception as e:
        print("Error in fetchGraphsAfterLogin: ", e)
        return None
    return jsonify({'graphs': filtered_graphs})

import httpx
import json
def generate_xml(activities, title):
    xml = f"<dcrgraph title=\"{title}\" dataTypesStatus=\"hide\" filterLevel=\"-1\" insightFilter=\"false\" zoomLevel=\"0\" formGroupStyle=\"Normal\" formLayoutStyle=\"Horizontal\" formShowPendingCount=\"true\" graphBG=\"#f1f6fe\" graphType=\"0\" exercise=\"false\" version=\"1.0\">\n"
    xml += "<specification>\n"
    xml += "<resources>\n"
    xml += "<events>\n"

    for i, activity in enumerate(activities):
        xml += f"<event id=\"Activity{i}\">\n"
        xml += "<precondition message=\"\" />\n"
        xml += "<custom>\n"
        xml += "<visualization>\n"
        xml += "<location xLoc=\"100\" yLoc=\"25\" />\n" # Most likely not important to change
        xml += "<colors bg=\"#f9f7ed\" textStroke=\"#000000\" stroke=\"#cccccc\" />\n"
        xml += "</visualization>\n"
        xml += "<roles>\n"
        if activity['role']: # MAYBE NOT WORKING!!!!!! Empty role gets sent without this check
            xml += f"<role>{activity['role']}</role>\n"
        xml += "<role />\n"
        xml += "</roles>\n"
        xml += "<readRoles>\n"
        xml += "<readRole />\n"
        xml += "</readRoles>\n"
        xml += "<groups>\n"
        xml += "<group />\n"
        xml += "</groups>\n"
        xml += "<phases>\n"
        xml += "<phase />\n"
        xml += "</phases>\n"
        xml += "<eventType>\n"
        xml += "</eventType>\n"
        xml += "<eventScope>private</eventScope>\n"
        xml += "<eventTypeData>\n"
        xml += "</eventTypeData>\n"
        xml += "<eventDescription>\n"
        xml += "</eventDescription>\n"
        xml += "<purpose>\n"
        xml += "</purpose>\n"
        xml += "<guide>\n"
        xml += "</guide>\n"
        xml += "<insight use=\"false\">\n"
        xml += "</insight>\n"
        xml += "<level>1</level>\n"
        xml += "<sequence>1</sequence>\n"
        xml += "<costs>0</costs>\n"
        xml += "<eventData>\n"
        xml += "</eventData>\n"
        xml += "<interfaces>\n"
        xml += "</interfaces>\n"
        xml += "</custom>\n"
        xml += "</event>\n"

    xml += "</events>\n"
    xml += "<subProcesses>\n"
    xml += "</subProcesses>\n"
    xml += "<distribution>\n"
    xml += "</distribution>\n"
    xml += "<labels>\n"

    for i, activity in enumerate(activities):
        xml += f"<label id=\"{activity['title']}\" />\n"

    xml += "</labels>\n"
    xml += "<labelMappings>\n"

    for i, activity in enumerate(activities):
        xml += f"<labelMapping eventId=\"Activity{i}\" labelId=\"{activity['title']}\" />\n"

    xml += "</labelMappings>\n"
    xml += "<expressions>\n"
    xml += "</expressions>\n"
    xml += "<variables>\n"
    xml += "</variables>\n"
    xml += "<variableAccesses>\n"
    xml += "<writeAccesses />\n"
    xml += "</variableAccesses>\n"
    xml += "<custom>\n"
    xml += "<keywords>\n"
    xml += "</keywords>\n"
    xml += "<roles>\n"
    xml += "</roles>\n"
    xml += "<groups>\n"
    xml += "</groups>\n"
    xml += "<phases>\n"
    xml += "</phases>\n"
    xml += "<eventTypes>\n"
    xml += "</eventTypes>\n"
    xml += "<eventParameters>\n"
    xml += "</eventParameters>\n"
    xml += "<graphDetails>DCR Process</graphDetails>\n"
    xml += "<graphDocumentation>\n"
    xml += "</graphDocumentation>\n"
    xml += "<graphLanguage>en-US</graphLanguage>\n"
    xml += "<graphDomain>process</graphDomain>\n"
    xml += "<graphFilters>\n"
    xml += "<filteredGroups>\n"
    xml += "</filteredGroups>\n"
    xml += "<filteredRoles>\n"
    xml += "</filteredRoles>\n"
    xml += "<filteredPhases>\n"
    xml += "</filteredPhases>\n"
    xml += "</graphFilters>\n"
    xml += "<hightlighterMarkup id=\"HLM\">\n"
    xml += "</hightlighterMarkup>\n"
    xml += "<highlighterMarkup>\n"
    xml += "<highlightLayers>\n"
    xml += "</highlightLayers>\n"
    xml += "<highlights>\n"
    xml += "</highlights>\n"
    xml += "</highlighterMarkup>\n"
    xml += "</custom>\n"
    xml += "</resources>\n"
    xml += "<constraints>\n"
    xml += "<conditions>\n"

    activity_id_mapping = {activity['title']: f"Activity{i}" for i, activity in enumerate(activities)}

    for i, activity in enumerate(activities):
        for relation in activity['relations']:
            print("Relation: ", relation)
            if relation['type'] == 'Condition':
                related_activity_id = activity_id_mapping.get(relation['relatedActivity'])
                print("Related activity id: ", related_activity_id)
                print(activity_id_mapping[activity['title']])
                if related_activity_id:
                    xml += f"<condition sourceId=\"{activity_id_mapping[activity['title']]}\" targetId=\"{related_activity_id}\" filterLevel=\"1\" description=\"\" time=\"\" groups=\"\" />\n"
    xml += "</conditions>\n"
    xml += "<responses>\n"
    for i, activity in enumerate(activities):
        for relation in activity['relations']:
            if relation['type'] == 'Response':
                xml += f"<response sourceId=\"Activity{i}\" targetId=\"{relation['relatedActivity']}\" filterLevel=\"1\" description=\"\" time=\"\" groups=\"\" />\n"
    xml += "</responses>\n"
    xml += "<excludes>\n"
    for i, activity in enumerate(activities):
        for relation in activity['relations']:
            if relation['type'] == 'Exclude':
                xml += f"<exclude sourceId=\"Activity{i}\" targetId=\"{relation['relatedActivity']}\" filterLevel=\"1\" description=\"\" time=\"\" groups=\"\" />\n"
    xml += "</excludes>\n"
    xml += "<includes>\n"
    for i, activity in enumerate(activities):
        for relation in activity['relations']:
            if relation['type'] == 'Include':
                xml += f"<include sourceId=\"Activity{i}\" targetId=\"{relation['relatedActivity']}\" filterLevel=\"1\" description=\"\" time=\"\" groups=\"\" />\n"
    xml += "</includes>\n"
    xml += "<milestones>\n"
    for i, activity in enumerate(activities):
        for relation in activity['relations']:
            if relation['type'] == 'Milestone':
                xml += f"<milestone sourceId=\"Activity{i}\" targetId=\"{relation['relatedActivity']}\" filterLevel=\"1\" description=\"\" time=\"\" groups=\"\" link=\"Activity{i}--{relation['type'].lower()}--{relation['relatedActivity']}\" />\n"
    xml += "</milestones>\n"
    xml += "<updates>\n"
    xml += "</updates>\n"
    xml += "<spawns>\n"
    xml += "</spawns>\n"
    xml += "<templateSpawns>\n"
    xml += "</templateSpawns>\n"
    xml += "</constraints>\n"
    xml += "</specification>\n"
    xml += "<runtime>\n"
    xml += "<custom>\n"
    xml += "<globalMarking>\n"
    xml += "</globalMarking>\n"
    xml += "</custom>\n"
    xml += "<marking>\n"
    xml += "<globalStore>\n"
    xml += "</globalStore>\n"
    xml += "<executed>\n"
    xml += "</executed>\n"
    xml += "<included>\n"
    for i, _ in enumerate(activities):
        xml += f"<event id=\"Activity{i}\" />\n"
    xml += "</included>\n"
    xml += "<pendingResponses>\n"
    for i, activity in enumerate(activities):
        if activity['pending']:
            xml += f"<event id=\"Activity{i}\" />\n"
    xml += "</pendingResponses>\n"
    xml += "</marking>\n"
    xml += "</runtime>\n"
    xml += "</dcrgraph>\n"

    print("XML: ", xml)
    return xml
    

@app.route('/createGraph', methods=['POST'])
def create_graph():
    print("Creating graph 1")
    session_token = request.headers.get('Authorization').split('Bearer ')[1]
    try:
        user = data_fetcher.execute_query("SELECT * FROM users WHERE session_token = %s;", (session_token,))
        username = user[0][1]
        password = user[0][2]
        print("User: ", user)
        title = "Lets go"#graph_data['title']
        activities_data = request.json #.activities eller giv activities_data['activities'] som argument
        
        print("Graph data: ", activities_data)
        
        role_for_activity0 = "Valdemar"
        role_for_activity1 = "Valdemar"
        xml = generate_xml(activities_data['activities'], title)

        data_new = {
            "xml": xml,
            "dcrsopCategory": "8888",
            "title": title
        }

        # Retrieve a dictionary of each activity with its label and role and its relation to other activities
        
        data = {
          "xml": f"<dcrgraph title=\"{title}\" dataTypesStatus=\"hide\" filterLevel=\"-1\" insightFilter=\"false\" zoomLevel=\"0\" formGroupStyle=\"Normal\" formLayoutStyle=\"Horizontal\" formShowPendingCount=\"true\" graphBG=\"#f1f6fe\" graphType=\"0\" exercise=\"false\" version=\"1.0\">\n"
            "<specification>\n"
            "<resources>\n"
            "<events>\n"
            "<event id=\"Activity0\">\n"
            "<precondition message=\"\" />\n"
            "<custom>\n"
            "<visualization>\n"
            "<location xLoc=\"100\" yLoc=\"25\" />\n" # xLoc and yLoc should be calculated (low priority)
            "<colors bg=\"#f9f7ed\" textStroke=\"#000000\" stroke=\"#cccccc\" />\n"
            "</visualization>\n"
            "<roles>\n"
            f"<role>{role_for_activity0}</role>\n" # Role for activity should be set
            "<role />\n"
            "</roles>\n"
            "<readRoles>\n"
            "<readRole />\n"
            "</readRoles>\n"
            "<groups>\n"
            "<group />\n"
            "</groups>\n"
            "<phases>\n"
            "<phase />\n"
            "</phases>\n"
            "<eventType>\n"
            "</eventType>\n"
            "<eventScope>private</eventScope>\n"
            "<eventTypeData>\n"
            "</eventTypeData>\n"
            "<eventDescription>\n"
            "</eventDescription>\n"
            "<purpose>\n"
            "</purpose>\n"
            "<guide>\n"
            "</guide>\n"
            "<insight use=\"false\">\n"
            "</insight>\n"
            "<level>1</level>\n"
            "<sequence>1</sequence>\n"
            "<costs>0</costs>\n"
            "<eventData>\n"
            "</eventData>\n"
            "<interfaces>\n"
            "</interfaces>\n"
            "</custom>\n"
            "</event>\n" # End of event (this whole block should be repeated for each activity, with the correct role)
            "</events>\n" # End of events
            "<subProcesses>\n"
            "</subProcesses>\n"
            "<distribution>\n"
            "</distribution>\n"
            "<labels>\n"
            "<label id=\"Send invoice\" />\n" # Get label from client
            "<label id=\"Approve\" />\n"  # Get label from client
            "</labels>\n"
            "<labelMappings>\n"
            "<labelMapping eventId=\"Activity0\" labelId=\"Send invoice\" />\n" # Set label for activity
            "<labelMapping eventId=\"Activity1\" labelId=\"Approve\" />\n" # Set label for activity
            "</labelMappings>\n"
            "<expressions>\n"
            "</expressions>\n"
            "<variables>\n"
            "</variables>\n"
            "<variableAccesses>\n"
            "<writeAccesses />\n"
            "</variableAccesses>\n"
            "<custom>\n"
            "<keywords>\n"
            "</keywords>\n"
            "<roles>\n"
            "</roles>\n"
            "<groups>\n"
            "</groups>\n"
            "<phases>\n"
            "</phases>\n"
            "<eventTypes>\n"
            "</eventTypes>\n"
            "<eventParameters>\n"
            "</eventParameters>\n"
            "<graphDetails>DCR Process</graphDetails>\n"
            "<graphDocumentation>\n"
            "</graphDocumentation>\n"
            "<graphLanguage>en-US</graphLanguage>\n"
            "<graphDomain>process</graphDomain>\n"
            "<graphFilters>\n"
            "<filteredGroups>\n"
            "</filteredGroups>\n"
            "<filteredRoles>\n"
            "</filteredRoles>\n"
            "<filteredPhases>\n"
            "</filteredPhases>\n"
            "</graphFilters>\n"
            "<hightlighterMarkup id=\"HLM\">\n"
            "</hightlighterMarkup>\n"
            "<highlighterMarkup>\n"
            "<highlightLayers>\n"
            "</highlightLayers>\n"
            "<highlights>\n"
            "</highlights>\n"
            "</highlighterMarkup>\n"
            "</custom>\n"
            "</resources>\n"
            "<constraints>\n"
            "<conditions>\n"
            "<condition sourceId=\"Activity0\" targetId=\"Activity1\" filterLevel=\"1\" description=\"\" time=\"\" groups=\"\" link=\"Activity0--condition--Activity1\" />\n"
            "</conditions>\n"
            "<responses>\n"
            "</responses>\n"
            "<coresponses>\n"
            "</coresponses>\n"
            "<excludes>\n"
            "</excludes>\n"
            "<includes>\n"
            "</includes>\n"
            "<milestones>\n"
            "<milestone sourceId=\"Activity0\" targetId=\"Activity1\" filterLevel=\"1\" description=\"\" time=\"\" groups=\"\" link=\"Activity0--condition--Activity1\" />\n"
            "</milestones>\n"
            "<updates>\n"
            "</updates>\n"
            "<spawns>\n"
            "</spawns>\n"
            "<templateSpawns>\n"
            "</templateSpawns>\n"
            "</constraints>\n"
            "</specification>\n"
            "<runtime>\n"
            "<custom>\n"
            "<globalMarking>\n"
            "</globalMarking>\n"
            "</custom>\n"
            "<marking>\n"
            "<globalStore>\n"
            "</globalStore>\n"
            "<executed>\n"
            "</executed>\n"
            "<included>\n"
            "<event id=\"Activity0\" />\n"
            "<event id=\"Activity1\" />\n"
            "</included>\n"
            "<pendingResponses>\n"
            "</pendingResponses>\n"
            "</marking>\n"
            "</runtime>\n"
            "</dcrgraph>",
            "dcrsopCategory": "8888",
            "title": title
        }
        try:
            # Make a POST request to create a new graph
            url = "https://repository.dcrgraphs.net/api/graphs"
            response = httpx.post(url, auth=(username, password), headers={"Content-Type": "application/json-patch+json"}, json=data_new)
            print("Response: ", response)
            
        except Exception as e:
            print("Error: ", e)
            return None
    except Exception as e:
        print("Error: ", e)
        return None



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
    session_token = request.headers.get('Authorization').split('Bearer ')[1]
    #session_token = request.headers.get('Cookie').split('=')[1]
    print("Session token fetchdata: ", session_token)
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
    session_token = request.headers.get('Authorization').split('Bearer ')[1]
    #session_token = request.headers.get('Cookie').split('=')[1]
    print("Session token perform event: ", session_token)
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
    #data_fetcher.graph_id = graph_id
    labels = data_fetcher.perform_event(event_id)
    return jsonify({'labels': labels})

@app.route('/requestRole', methods=['POST'])
def request_role():
    session_token = request.headers.get('Authorization').split('Bearer ')[1]
    #session_token = request.headers.get('Cookie').split('=')[1]
    print("Session token request role: ", session_token)
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
    session_token = request.headers.get('Authorization').split('Bearer ')[1]
    #session_token = request.headers.get('Cookie').split('=')[1]
    print("Session token check if admin: ", session_token)
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
    session_token = request.headers.get('Authorization').split('Bearer ')[1]
    #session_token = request.headers.get('Cookie').split('=')[1]
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
    session_token = request.headers.get('Authorization').split('Bearer ')[1]
    #session_token = request.headers.get('Cookie').split('=')[1]
    print("Session token set current role: ", session_token)
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