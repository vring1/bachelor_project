import openai

class ChatHandler:
    def __init__(self):
        openai.api_key = open('api_key.txt', 'r').read().strip('\n')
        self.messages = [{"role": "system", "content": "You are an intelligent assistant providing advice on tasks for morning routines, evening routines, or general tasks. Feel free to ask for recommendations!"}]

    # Add chat-related methods here
