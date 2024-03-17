import mysql.connector
import mysql.connector.pooling

class DatabaseConnector:
    def __init__(self):
        self.host = 'localhost'
        self.user = 'root'
        self.password = 'password'
        self.database = 'todo_database'
        self.pool_size = 10
        self.connect()

    def connect(self):
        try:
            self.pool = mysql.connector.pooling.MySQLConnectionPool(
                pool_name="pool",
                pool_size=self.pool_size,
                pool_reset_session=True,
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database
            )
            print("Connection pool created successfully")
            self.initialize_database()

        except mysql.connector.Error as e:
            print("Error: ", e)

    def initialize_database(self):
        try:
            connection = self.pool.get_connection()
            if connection.is_connected():
                print("Connection to MySQL database successful")

                cursor = connection.cursor()

                cursor.execute("CREATE DATABASE IF NOT EXISTS todo_database;")
                cursor.execute("USE todo_database;")

                # Create a table for storing users
                cursor.execute("CREATE TABLE IF NOT EXISTS users ("
                               "id INT AUTO_INCREMENT PRIMARY KEY,"
                               "username VARCHAR(255) NOT NULL UNIQUE,"
                               "password VARCHAR(255) NOT NULL,"
                               "admin BOOLEAN,"
                               "session_token VARCHAR(255),"
                               "current_role VARCHAR(50)"
                               ");")
                
                # drop table
                #cursor.execute("DROP TABLE IF EXISTS users;")
                

                # Delete all users from the table
                #self.cursor.execute("DELETE FROM users;")
                #self.db.commit()

                # Select all users from the table
                cursor.execute("SELECT * FROM users;")
                users = cursor.fetchall()
                print("Users: ")
                for user in users:
                    print(user)

                # Create a table for storing active_graph_info
                cursor.execute("CREATE TABLE IF NOT EXISTS active_graph_info ("
                                    "id INT AUTO_INCREMENT PRIMARY KEY,"
                                    "graph_id INT NOT NULL,"
                                    "simulation_id INT NOT NULL,"
                                    "graph_name VARCHAR(255) NOT NULL,"
                                    "username VARCHAR(255) NOT NULL"
                                    ");")

                # drop table
                #cursor.execute("DROP TABLE IF EXISTS active_graph_info;")

                # Delete all graphs from the table
                #self.cursor.execute("DELETE FROM graphs;")
                #self.db.commit()

                # Select all graphs from the table
                cursor.execute("SELECT * FROM active_graph_info;")
                graphs = cursor.fetchall()
                print("Active graphs info: ")
                for graph in graphs:
                    print(graph)

                # Create a table for storing requests
                cursor.execute("CREATE TABLE IF NOT EXISTS role_requests ("
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

                cursor.execute("SELECT * FROM role_requests;")
                requests = cursor.fetchall()
                print("Requests: ")
                for req in requests:
                    print(req)


                # Create a table for storing roles with their users
                cursor.execute("CREATE TABLE IF NOT EXISTS roles ("
                                    "id INT AUTO_INCREMENT PRIMARY KEY,"
                                    "role VARCHAR(50) NOT NULL,"
                                    "username VARCHAR(255) NOT NULL"
                                    ");")
                # drop table
                #cursor.execute("DROP TABLE IF EXISTS roles;")
                
                # delete all roles
                #self.cursor.execute("DELETE FROM roles;")
                #self.db.commit()

                cursor.execute("SELECT * FROM roles;")
                roles = cursor.fetchall()
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
                
                connection.commit()
                cursor.close()
                connection.close()
                print("Database initialization completed")

        except mysql.connector.Error as e:
            print("Error during database initialization: ", e)

    def close_pool(self):
        self.pool.close()
        print("Connection pool closed")
    

