import httpx
import xmltodict
from database_connector import DatabaseConnector
from flask import request

class DataFetcher:
    def __init__(self):
        self.username = None
        #self.password = None
        #self.role = None
        self.db = DatabaseConnector()
        self.cursor = self.db.get_cursor()
        self.simulation_id = None

    # Add data fetching and processing methods here
    def test_if_user_exists_in_dcr_and_add_to_database(self):
        #self.graph_id = request.args.get('graph_id')
        #self.username = request.args.get('username')
        #self.password = request.args.get('password')
        #self.role = request.args.get('role')
        self.username = request.args.get('username')
        self.password = request.args.get('password')
        self.role = None#'Nurse'#request.args.get('role') # role will be none, as role is not choosen when registering
        self.admin = False

        try:
            graphs = httpx.get(
                url=f"https://repository.dcrgraphs.net/api/graphs?sort=title",
                auth=(self.username, self.password)
            )
            graphs_json = xmltodict.parse(graphs.text)
        except Exception as e:
            print("VALDEMAR: ", e)
            return None
        # Check if user exists in database
        try:
            self.cursor.execute("SELECT * FROM users WHERE username = %s;", (self.username,))
            user = self.cursor.fetchone()
            print("User: ", user)
            if user is not None:
                print("User already exists in database, and is not added")
            else:
                # Add user to database if it does not exist
                try:
                    self.cursor.execute("INSERT INTO users (username, password, admin) VALUES (%s, %s, %s);", (self.username, self.password, self.admin))
                    self.db.commit()
                    print("User added to database")
                except Exception as e:
                    print("Error: ", e)
                    return None
                
        except Exception as e:
            print("Error: ", e)
            return None
        
        return graphs_json['graphs']['graph']
    
    def fetch_graphs_after_login(self):

        if self.username is None:
            return None
        graphs = httpx.get(
            url=f"https://repository.dcrgraphs.net/api/graphs?sort=title",
            auth=(self.username, self.password)
        )

        graphs_json = xmltodict.parse(graphs.text)
        return graphs_json['graphs']['graph']


    def fetch_data(self):
        self.graph_id = request.args.get('graph_id')
        #print("GRAPHID: " + self.graph_id)
        #self.username = request.args.get('username')
        #self.password = request.args.get('password')
        #self.role = request.args.get('role')

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

        filtered_events = [event for event in events_json['events']['event'] if event['@roles'] == self.role]
        
        return filtered_events
    
    def test_if_user_and_password_exists_in_database(self, username, password):
        self.username = username
        self.password = password
        #self.username = request.args.get('username')
        #self.password = request.args.get('password')
        #self.cookie = request.cookies.get('loggedInUser')
        #print("Cookie: ", self.cookie)
        #user_cookie = request.cookies.get('user')
        #print("User cookie: ", user_cookie)

        try:
            self.cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s;", (self.username, self.password))
            user = self.cursor.fetchone()
            print("User: ", user)
            if user is not None:
                print("User exists in database")
            else:
                print("User does not exist in database")
        except Exception as e:
            print("Error: ", e)
            return None
        return user