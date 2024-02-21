from flask import Flask, jsonify, request
from flask_cors import CORS
import httpx
import xmltodict
import openai
import mysql.connector

class MyApp(Flask):
    def __init__(self, *args, **kwargs):
        super(MyApp, self).__init__(*args, **kwargs)
        CORS(self)

app = MyApp(__name__)

mysql_host = 'localhost'
mysql_user = 'root'
mysql_password = 'password'
mysql_db = 'todo_database'

db = mysql.connector.connect(
    host=mysql_host,
    user=mysql_user,
    password=mysql_password,
    database=mysql_db
)

# Check if the connection is successful
if db.is_connected():
    print("Connection to MySQL database successful")
else:
    print("Failed to connect to MySQL database")

class DataFetcher:
    def __init__(self):
        #self.graph_id = 1704571#None#
        #self.username = 'birgitte_stage@yahoo.dk'#None#
        #self.password = 'Valdemar_Nick91'#None#
        #self.role = 'Nurse'#None#
        self.simulation_id = None

    def fetch_graphs(self):
        #self.graph_id = request.args.get('graph_id')
        #if self.username is None or self.password is None or self.role is None:
        self.username = request.args.get('username')
        self.password = request.args.get('password')
        self.role = request.args.get('role')
        graphs = httpx.get(
            url=f"https://repository.dcrgraphs.net/api/graphs?sort=title",
            auth=(self.username, self.password)
        )

        graphs_json = xmltodict.parse(graphs.text)
        print(graphs_json['graphs']['graph'])
        return graphs_json['graphs']['graph']


    def fetch_data(self):
        self.graph_id = request.args.get('graph_id')
        print("GRAPHID: " + self.graph_id)
        self.username = request.args.get('username')
        self.password = request.args.get('password')
        self.role = request.args.get('role')

        print('Fetching data')

        # Make a POST request to create a new simulation
        newsim_response = httpx.post(
            url=f"https://repository.dcrgraphs.net/api/graphs/{self.graph_id}/sims",
            auth=(self.username, self.password)
        )
        
        self.simulation_id = newsim_response.headers.get('simulationID')
        
        # Make a GET request to fetch events for the simulation
        next_activities_response = httpx.get(
            f"https://repository.dcrgraphs.net/api/graphs/{self.graph_id}/sims/{self.simulation_id}/events?filter=only-enabled",
            auth=(self.username, self.password)
        )

        # Formatting the XML response
        events_xml = next_activities_response.text
        events_xml_no_quotes = events_xml[1:len(events_xml)-1]
        events_xml_clean = events_xml_no_quotes.replace('\\\"', "\"")

        # Translate XML to JSON dictionary
        events_json = xmltodict.parse(events_xml_clean)
        #print(events_json)
        #labels = [event['@label'] for event in events_json['events']['event'] if event['@roles'] == self.role]
        

        #filtered_events = [event for event in events_json['events']['event'] if event['@roles'] == self.role]

        #return filtered_events
    
        if 'events' in events_json and 'event' in events_json['events']:
            events = events_json['events']['event']
            if isinstance(events, list):
                filtered_events = [event for event in events if event.get('@roles') == self.role]
            elif isinstance(events, dict):
                filtered_events = [events] if events.get('@roles') == self.role else []
            else:
                filtered_events = []
        else:
            filtered_events = []

        return filtered_events


    def perform_event(self, event_id):
        print('Performing event')

        url = (f"https://repository.dcrgraphs.net/api/graphs/{self.graph_id}/sims/"
            f"{self.simulation_id}/events/{event_id}")
        httpx.post(url, auth=(self.username, self.password))

        next_activities_response = httpx.get(
            f"https://repository.dcrgraphs.net/api/graphs/{self.graph_id}/sims/{self.simulation_id}/events?filter=only-enabled",
            auth=(self.username, self.password)
        )

        events_xml = next_activities_response.text
        events_xml_no_quotes = events_xml[1:len(events_xml)-1]
        events_xml_clean = events_xml_no_quotes.replace('\\\"', "\"")
        events_json = xmltodict.parse(events_xml_clean)

        #labels = [event['@label'] for event in events_json['events']['event'] if event['@roles'] == self.role]
        filtered_events = [event for event in events_json['events']['event'] if event['@roles'] == self.role]
        
        #pending_events_exist = any(event['@pending'] == 'true' or event['@EffectivelyPending'] == 'true' for event in filtered_events)
        
        #if not pending_events_exist:
        #    filtered_events = []

        return filtered_events
    

data_fetcher = DataFetcher()

system_context = "You are an intelligent assistant providing advice on tasks for morning routines, evening routines, or general tasks. Feel free to ask for recommendations!"

# Set the OpenAI API key
openai.api_key = open('api_key.txt', 'r').read().strip('\n')
messages = [ {"role": "system", "content":  
              system_context} ] 
# Flask route to handle chat requests
@app.route('/chat', methods=['POST'])
def chat():
    # Extract the message content from the client request
    message = request.json['message']
    if message: 
        messages.append( 
            {"role": "user", "content": message}, 
        ) 
        chat = openai.ChatCompletion.create( 
            model="gpt-3.5-turbo", messages=messages 
        )
    else:
        raise ValueError("Message is empty")
    
    reply = chat.choices[0].message.content 
    # Return the response back to the client
    return jsonify({'response': reply})


@app.route('/fetchGraphs', methods=['GET'])
def fetch_graphs():
    graphs = data_fetcher.fetch_graphs()
    #return jsonify({'graphs': graphs})
    # TODO: Implement in database such that the graphs that the user has created can be shown and not hardcoded here
    filtered_graphs = [graph for graph in graphs if
                       "blood draw" == graph['@title'].lower() or
                       "testing" == graph['@title'].lower() or
                       "aaa" == graph['@title'].lower() or
                       "dcr" == graph['@title'].lower()]

    return jsonify({'graphs': filtered_graphs})

@app.route('/fetchData', methods=['GET'])
def fetch_data():
    labels = data_fetcher.fetch_data()
    return jsonify({'labels': labels})

@app.route('/performEvent', methods=['POST'])
def perform_event():
    print(request.json)
    event_id = request.json['event_id']
    print("event_id", event_id)
    labels = data_fetcher.perform_event(event_id)
    return jsonify({'labels': labels}) 

@app.route('/performGraphEvent', methods=['POST'])
def perform_graph_event():
    print(request.json)
    event_id = request.json['event_id']
    graph_id = request.json['graph_id']
    data_fetcher.graph_id = graph_id
    labels = data_fetcher.perform_event(event_id)
    return jsonify({'labels': labels})



if __name__ == '__main__':
    print('Starting server')
    app.run(debug=True)
