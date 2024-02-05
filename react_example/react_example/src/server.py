from flask import Flask, jsonify, request
import requests

app = Flask(__name__)

@app.route('/fetch-api', methods=['POST'])
def fetch_api():
    data = request.get_json()
    api_link = data.get('apiLink')

    try:
        response = requests.get(api_link)
        response.raise_for_status()
        data = response.json()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
