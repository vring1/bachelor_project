import mysql.connector

# Connect to MySQL server using default credentials
db_connection = mysql.connector.connect(
    host="localhost",
    user="root",  # Default username
    password="password"   # No password for default setup
)

# Create a cursor object to execute SQL commands
cursor = db_connection.cursor()


cursor.execute("CREATE DATABASE IF NOT EXISTS todo_database;")
cursor.execute("USE todo_database;")

# Create a table for storing users
cursor.execute("CREATE TABLE IF NOT EXISTS users ("
               "id INT AUTO_INCREMENT PRIMARY KEY,"
               "username VARCHAR(255) NOT NULL,"
               "password VARCHAR(255) NOT NULL,"
               "role VARCHAR(50) NOT NULL"
               ");")

# Insert a user into the table
#cursor.execute("INSERT INTO users (username, password, role) VALUES ('admin', 'admin', 'admin');")

# Delete all users from the table
#cursor.execute("DELETE FROM users;")
#db_connection.commit()


# Select all users from the table
cursor.execute("SELECT * FROM users;")
users = cursor.fetchall()
print(users)


# Close cursor and database connection
cursor.close()
db_connection.close()
