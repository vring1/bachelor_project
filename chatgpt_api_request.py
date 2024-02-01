import requests
import json

def send_message(message):
    api_url = 'https://api.openai.com/v1/chat/completions'  # Check OpenAI API documentation for the correct endpoint
    api_key = 'YOUR_API_KEY'

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}',
    }

    data = {
        'messages': [
            {'role': 'system', 'content': 'You are a chatbot.'},
            {'role': 'user', 'content': message},
        ],
    }

    try:
        response = requests.post(api_url, data=json.dumps(data), headers=headers)
        response.raise_for_status()  # Raise an exception for bad responses (4xx or 5xx)

        result = response.json()
        return result

    except requests.exceptions.HTTPError as errh:
        print("HTTP Error:", errh)

    except requests.exceptions.ConnectionError as errc:
        print("Error Connecting:", errc)

    except requests.exceptions.Timeout as errt:
        print("Timeout Error:", errt)

    except requests.exceptions.RequestException as err:
        print("Request Error:", err)

# Example usage
user_input = "Hello, ChatGPT!"
response_data = send_message(user_input)
print(response_data)
