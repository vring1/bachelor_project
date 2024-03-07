from flask import Flask, render_template, request, session
import os
from datetime import timedelta

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days = 7)

# login
@app.route('/<username>', methods=['GET', 'POST'])
def home(username):
    if username in session:
        print(session.keys())
        return 'hello {}'.format(username)
    else:
        session[username] = username
        # generate this user's variable
        a[username] = 0
        print(session.keys())
        return 'login as {}'.format(username)

# logout
@app.route('/logout/<username>', methods=['GET', 'POST'])
def logout(username):
    session.pop(username)
    print(session.keys())
    return '{} logout!'.format(username)

# call add function with specific username
@app.route('/add/<username>')
def add(username):
    global a
    a[username] += 1
    return str(a[username])


if __name__ == '__main__':
    a = {}
    #HOST = environ.get('SERVER_HOST', 'localhost')
    HOST = '10.10.50.23'
    try:
        PORT = int(os.environ.get('SERVER_PORT', '5555'))
    except ValueError:
        PORT = 5555
    app.run(HOST, PORT, debug=True)
