import httpx
import xmltodict
from database_connector import DatabaseConnector
from flask import request
import uuid

class DataFetcher:
    def __init__(self):
        self.db = DatabaseConnector()

    def acquire_connection(self):
        try:
            connection = self.db.pool.get_connection()
            if connection.is_connected():
                print("Connection to MySQL database successful")
                return connection
        except Exception as e:
            print("Error: ", e)
            return None
        
    def execute_query(self, query, params=None):
        connection = self.acquire_connection()
        if connection:
            try:
                with connection.cursor() as cursor:
                    if params:
                        cursor.execute(query, params)
                    else:
                        cursor.execute(query)
                    result = cursor.fetchall()
                    connection.commit()
                    return result
            except Exception as e:
                print("Error: ", e)
                return None
            finally:
                connection.close()
                print("Connection to MySQL database closed")
        return None

    # Add data fetching and processing methods here
    def test_if_user_exists_in_dcr_and_add_to_database(self):
        username = request.args.get('username')
        password = request.args.get('password')
        if username == "valdemarring1@gmail.com":
            admin = True
        else:
            admin = False

        try:
            graphs = httpx.get(
                url=f"https://repository.dcrgraphs.net/api/graphs?sort=title",
                auth=(username, password)
            )
            graphs_json = xmltodict.parse(graphs.text)
        except Exception as e:
            print("VALDEMAR: ", e)
            return None
        # Check if user exists in database
        user = self.execute_query("SELECT * FROM users WHERE username = %s;", (username,))
        if user:
            print("User exists in database, and is not added")
        else:
            try:
                self.execute_query("INSERT INTO users (username, password, admin) VALUES (%s, %s, %s);", (username, password, admin))
                print("User added to database")
            except Exception as e:
                print("Error: ", e)
                return None
        
        return graphs_json['graphs']['graph']
    
    def fetch_graphs_after_login(self, username, password):
        graphs = httpx.get(
            url=f"https://repository.dcrgraphs.net/api/graphs?sort=title",
            auth=(username, password)
        )

        graphs_json = xmltodict.parse(graphs.text)
        return graphs_json['graphs']['graph']


    def fetch_data(self, username, password):
        graph_id = request.args.get('graph_id')
        graph_name = request.args.get('title')
        print('Fetching data')

        # Make a POST request to create a new simulation
        newsim_response = httpx.post(
            url=f"https://repository.dcrgraphs.net/api/graphs/{graph_id}/sims",
            auth=(username, password)
        )
        
        simulation_id = newsim_response.headers.get('simulationID')
        
        self.execute_query("INSERT INTO active_graph_info (graph_id, simulation_id, graph_name, username) VALUES (%s, %s, %s, %s);", (graph_id, simulation_id, graph_name, username))
        
        
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

        #print(events_json)
    
        # find role of user in database
        role = self.execute_query("SELECT current_role FROM users WHERE username = %s;", (username,))[0][0]
        print("Role in fetch data!: ", role)



        if 'events' in events_json and 'event' in events_json['events']:
            events = events_json['events']['event']
            if isinstance(events, list):
                filtered_events = [event for event in events if event.get('@roles') == role]
            elif isinstance(events, dict):
                filtered_events = [events] if events.get('@roles') == role else []
            else:
                filtered_events = []
        else:
            filtered_events = []

        return filtered_events


    def perform_event(self, event_id, username, password):
        # get newest graph_id and simulation_id from database, that is connected to the user
        graph_id, simulation_id = self.execute_query("SELECT graph_id, simulation_id FROM active_graph_info WHERE username = %s ORDER BY id DESC LIMIT 1;", (username,))[0]
        #graph_id, simulation_id = self.execute_query("SELECT graph_id, simulation_id FROM active_graph_info WHERE username = %s;", (username,))[0]
        print("Graph id: ", graph_id)
        print("Simulation id: ", simulation_id)
        print('Performing event')

        url = (f"https://repository.dcrgraphs.net/api/graphs/{graph_id}/sims/"
            f"{simulation_id}/events/{event_id}")
        httpx.post(url, auth=(username, password))

        next_activities_response = httpx.get(
            f"https://repository.dcrgraphs.net/api/graphs/{graph_id}/sims/{simulation_id}/events?filter=only-enabled",
            auth=(username, password)
        )

        events_xml = next_activities_response.text
        events_xml_no_quotes = events_xml[1:len(events_xml)-1]
        events_xml_clean = events_xml_no_quotes.replace('\\\"', "\"")
        events_json = xmltodict.parse(events_xml_clean)

        # find role of user in database
        role = self.execute_query("SELECT current_role FROM users WHERE username = %s;", (username,))[0][0]
        print("Role in perform event!: ", role)

        filtered_events = [event for event in events_json['events']['event'] if event['@roles'] == role]
        
        return filtered_events
    
    def test_if_user_and_password_exists_in_database(self, username, password):
        user = self.execute_query("SELECT * FROM users WHERE username = %s AND password = %s;", (username, password))
        if user:
            print("User exists in database")
        else:
            print("User does not exist in database")
            return None
        session_token = str(uuid.uuid4())
        self.execute_query("UPDATE users SET session_token = %s WHERE username = %s;", (session_token, username))

        user = self.execute_query("SELECT * FROM users WHERE username = %s;", (username,))[0] # NEW!!!
        print("User in test_if_user_and_password_exists_in_database: ", user)
        return user, session_token
    
    

