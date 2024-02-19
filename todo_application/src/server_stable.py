from flask import Flask, jsonify, request
from flask_cors import CORS
import httpx
import xmltodict

app = Flask(__name__)
CORS(app)
#CORS(app, resources={r"/fetchData": {"origins": "http://localhost:3000"}}) # Allow requests from localhost:3000


@app.route('/fetchData', methods=['GET'])
def fetch_data():
    print('Fetching data')
    graph_id = 1704571
    username = 'birgitte_stage@yahoo.dk'
    password = 'Valdemar_Nick91'
    role = 'Nurse'

    #graph_id = request.args.get('graph_id')
    #username = request.args.get('username')
    #password = request.args.get('password')
    #role = request.args.get('role')
    # Make a POST request to create a new simulation
    newsim_response = httpx.post(
        url=f"https://repository.dcrgraphs.net/api/graphs/{graph_id}/sims",
        auth=(username, password)
    )
    
    simulation_id = newsim_response.headers.get('simulationID')
    
    # Make a GET request to fetch events for the simulation
    next_activities_response = httpx.get(
        f"https://repository.dcrgraphs.net/api/graphs/{graph_id}/sims/{simulation_id}/events?filter=only-enabled",
        auth=(username, password)
    )

    # Formatting the XML response
    events_xml = next_activities_response.text
    events_xml_no_quotes = events_xml[1:len(events_xml)-1]
    events_xml_clean = events_xml_no_quotes.replace('\\\"', "\"")

    # Translate XML to JSON dictionary
    events_json = xmltodict.parse(events_xml_clean)
    print(events_json)
    for event in events_json['events']['event']:
        if event['@roles'] == role:
            labels = [event['@label'] for event in events_json['events']['event'] if event['@roles'] == role]
        
    # Prepare data to send back to the client
    #labels = [event['@label'] for event in events_json['events']['event']]
    return jsonify({'labels': labels})

@app.route('/performEvent', methods=['POST'])
def perform_event():
    print('Performing event')
    graph_id = 1704571
    username = 'birgitte_stage@yahoo.dk'
    password = 'Valdemar_Nick91'
    role = 'Nurse'


    url = (f"https://repository.dcrgraphs.net/api/graphs/{graph_id}/sims/"
        f"{simulation_id}/events/{event_id}")
    httpx.post(url, auth=(username,password))

    next_activities_response = httpx.get(
        f"https://repository.dcrgraphs.net/api/graphs/{graph_id}/sims/{simulation_id}/events?filter=only-enabled",
        auth=(username, password)
    )

    events_xml = next_activities_response.text
    events_xml_no_quotes = events_xml[1:len(events_xml)-1]
    events_xml_clean = events_xml_no_quotes.replace('\\\"', "\"")
    events_json = xmltodict.parse(events_xml_clean)

    labels = [event['@label'] for event in events_json['events']['event'] if event['@roles'] == role]
    return jsonify({'labels': labels}) 

if __name__ == '__main__':
    print('Starting server')
    app.run(debug=True)
