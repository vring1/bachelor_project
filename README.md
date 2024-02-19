# Bachelor Project

## Problems & thoughts throughtout development

1. CORS between client and server
2. using "request" in python, to receive arguments from client
3. only giving the client relevant data (filtering away other roles from the json)

## TODO

1. Choose different graphs (already implemented but..)
   - Add "Morgenrutine", "Aftenrutine", "Søndagsopgaver" etc.
1. Brug database til grafnavne og load så kun dem man kender...
1. Create graphs through application

   - There's an API for this:
   - https://repository.dcrgraphs.net/api/graphs
   - \*Create a new DCR Process Model, returning the id. A DCR Process Model is described using DCR XML Ability to create new graph as copy from another graph, and place graph into specific category on creation (DCRSOPCategory). Title attribute to give graph new title on creation,
   - https://documentation.dcr.design/documentation/dcr-xml/

1. Add ChatGPT API.
   - You should be able to write some natural language and then it should convert it to conditionals etc.
   - Also it should be used to give suggestions to tasks and graphs in generel.
