import mysql.connector

class DatabaseConnector:
    def __init__(self):
        self.host = 'localhost'
        self.user = 'root'
        self.password = 'password'
        self.connect()

    def connect(self):
        try:
            self.db = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password
            )
            self.cursor = self.db.cursor()
            if self.db.is_connected():
                print("Connection to MySQL database successful")

                self.cursor.execute("CREATE DATABASE IF NOT EXISTS todo_database;")
                self.cursor.execute("USE todo_database;")

                # Create a table for storing users
                self.cursor.execute("CREATE TABLE IF NOT EXISTS users ("
                               "id INT AUTO_INCREMENT PRIMARY KEY,"
                               "username VARCHAR(255) NOT NULL,"
                               "password VARCHAR(255) NOT NULL,"
                               "role VARCHAR(50)" # nullable, will be set later when logged in and admin have approved
                               ");")
                
                # drop table
                #self.cursor.execute("DROP TABLE IF EXISTS users;")
                

                # Delete all users from the table
                #self.cursor.execute("DELETE FROM users;")
                #self.db.commit()

                # Select all users from the table
                self.cursor.execute("SELECT * FROM users;")
                users = self.cursor.fetchall()
                print("Users: ")
                for user in users:
                    print(user)

                # Create a table for storing graphs
                self.cursor.execute("CREATE TABLE IF NOT EXISTS graphs ("
                                    "id INT AUTO_INCREMENT PRIMARY KEY,"
                                    "graph_id INT NOT NULL,"
                                    "graph_name VARCHAR(255) NOT NULL,"
                                    "simulation_id INT NOT NULL,"
                                    "owner_id INT NOT NULL"
                                    ");")

                # Delete all graphs from the table
                #self.cursor.execute("DELETE FROM graphs;")
                #self.db.commit()

                # Select all graphs from the table
                self.cursor.execute("SELECT * FROM graphs;")
                graphs = self.cursor.fetchall()
                print("Graphs: ")
                for graph in graphs:
                    print(graph)

                # Create a table for storing requests
                self.cursor.execute("CREATE TABLE IF NOT EXISTS requests ("
                                    "id INT AUTO_INCREMENT PRIMARY KEY,"
                                    "username VARCHAR(255) NOT NULL,"
                                    "role VARCHAR(50) NOT NULL"
                                    ");")
                self.cursor.execute("SELECT * FROM requests;")
                requests = self.cursor.fetchall()
                print("Requests: ")
                for req in requests:
                    print(req)
        
        
        except mysql.connector.Error as e:
            print("Error: ", e)

    def commit(self):
        if self.db.is_connected():
            self.db.commit()

    def get_cursor(self):
        return self.cursor
        
    # Add other database-related methods here
