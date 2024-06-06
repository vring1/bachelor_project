import openai

class ChatHandler:
    def __init__(self):
        openai.api_key = open('../../../api_key.txt', 'r').read().strip('\n')
        self.messages = [{"role": "system", "content": "You are an intelligent assistant providing advice on tasks for morning routines, evening routines, or general tasks. Feel free to ask for recommendations!"}]


class GraphCreator:
    def __init__(self):
        openai.api_key = open('../../../api_key.txt', 'r').read().strip('\n')
        self.messages = [{"role": "system", "content": "Hello. I need you to help me create a graph in DCR. They consist of activities and relations between the activities."+
                          "Here's a list of the relations:" +
                            "1. Condition: A condition between two activities ensures that the second activity cannot be executed unless the first is excluded or has been executed at least once." +
                            "2. Response: A response, or goal, ensures that once the first activity has been executed the other activity becomes a goal, that must eventually be executed or excluded." +
                            "3. Include: The include relation includes other activities upon execution." +
                            "4. Exclude: The exclude relation excludes other activities upon execution." +
                            "5. Milestone: The milestone relation blocks the second activity if the first is currently a goal (response) and included." +

                            "An activity can also be pending (be a goal), which is just a boolean. The first activity mentioned should ALWAYS be pending. Also every activity should always have some sort of relation to another. And, an activity can have more relations to the same activity (fx both a condition and response)." +
                            "Here's an example of what I need you to be able to do:" +
                            "This is a graph described in natural language:" +
                            "I have to brush my teeth before washing my hands, but I should also remember to wash my hands when I'm done brushing." +
                            "In the above we have both a condition and a response, as I'm not allowed to wash hands before and I have to do it when done brushing. I need you to be able to identify the activities and relations from a provided text like the above." +
                            "Right now it's also possible to generate the graphs manually using my React client, and then the following format is sent to the server (this is an example):" +
                            "const graphData =" +
                            "{" +
                            "'title': 'Blabla'," +
                            "'activities': [" +
                            "{" +
                            "'title': 'hey med dig'," +
                            "'pending': True," +
                            "'role': 'Valdemar'," +
                            "'relations': [" +
                            "{" +
                            "'relatedActivity': 'hey nej'," +
                            "'type': 'Condition'" +
                            "}," +
                            "{" +
                            "'relatedActivity': 'hey nej'," +
                            "'type': 'Response'" +
                            "}" +
                            "]" +
                            "}," +
                            "{" +
                            "'title': 'hey nej'," +
                            "'pending': False," +
                            "'role': 'Valdemar'," +
                            "'relations': [" +
                            "{" +
                            "'relatedActivity': 'hey nej nej'," +
                            "'type': 'Condition'" +
                            "}" +
                            "]" +
                            "}," +
                            "{" +
                            "'title': 'hej nej nej'," +
                            "'pending': False," +
                            "'role': 'Valdemar'," +
                            "'relations': [" +
                            "]" +
                            "}" +
                            "]" +
                            "}" +
                            "Now, please convert the text sent to you in the next message into activities with relations to eachother and give me them in the same format as from react. Also, please ONLY send the json and not eny other text!"}]
        
