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
                               "admin BOOLEAN,"
                               "session_token VARCHAR(255)"
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
                self.cursor.execute("CREATE TABLE IF NOT EXISTS role_requests ("
                                    "id INT AUTO_INCREMENT PRIMARY KEY,"
                                    "username VARCHAR(255) NOT NULL,"
                                    "role VARCHAR(50) NOT NULL,"
                                    "approved BOOLEAN"
                                    ");")
                # drop table
                #self.cursor.execute("DROP TABLE IF EXISTS role_requests;")


                # delete all requests
                #self.cursor.execute("DELETE FROM requests;")
                #self.db.commit()

                self.cursor.execute("SELECT * FROM role_requests;")
                requests = self.cursor.fetchall()
                print("Requests: ")
                for req in requests:
                    print(req)


                # Create a table for storing roles with their users
                self.cursor.execute("CREATE TABLE IF NOT EXISTS roles ("
                                    "id INT AUTO_INCREMENT PRIMARY KEY,"
                                    "role VARCHAR(50) NOT NULL,"
                                    "username VARCHAR(255) NOT NULL"
                                    ");")
                # drop table
                #self.cursor.execute("DROP TABLE IF EXISTS roles;")
                
                # delete all roles
                #self.cursor.execute("DELETE FROM roles;")
                #self.db.commit()

                self.cursor.execute("SELECT * FROM roles;")
                roles = self.cursor.fetchall()
                print("Roles: ")
                for role in roles:
                    print(role)

                # show tables
                #self.cursor.execute("SHOW TABLES;")
                #tables = self.cursor.fetchall()
                #print("Tables: ")
                #for table in tables:
                #    print(table)
                
                # insert into users
                #self.cursor.execute("INSERT INTO users (username, password, admin) VALUES ('valdemarring1@gmail.com', 'valdemar123', 1);")
                #self.db.commit()

        
        except mysql.connector.Error as e:
            print("Error: ", e)

    def commit(self):
        if self.db.is_connected():
            self.db.commit()

    def get_cursor(self):
        return self.cursor
        
    # Add other database-related methods here
