# Bachelor Project

## Problems & thoughts throughtout development

1. CORS between client and server
2. using "request" in python, to receive arguments from client
3. only giving the client relevant data (filtering away other roles from the json)
4. graphs API'en giver en masse grafer der ikke tilhører profilen
5. limited to the amount of API calls available from the provider
6. API calls cost money
7. pip install mysql-connector-python
8. if the server is restarted midsession, the user is still on the home page, but cant use anything
9. Session management (first big challenge)
10. redis??

## TODO

### Urgent

1. datafetcher har for mange responsibilities
1. max antal requests + man skal kunne vælge de godkendte (og de skal self kunne godkendes af en!!)
1. MÅSKE FUCK SESSION OG KLAR ALT GENNEM DATABASE?? SÅ HVER GANG DER TRYKKES TJEK I DATABASEN HVOR USERNAME MATCHER F.EKS.
1. Få session til at virke - indebærer ordentligt register/login logik.
1. tjek om eksisterer i DCR når der registreres og brug simpel login logik når der skal logges ind (med database) + der er en med en admin rolle, der skal godkende når folk registrere en rolle
1. hvis mail eksisterer + rolle eksisterer, ik add - hvis kun mail eksistere men ikke rollen også, tilføj
1. /home skal måske ikke kunne tilgås hvis man ikke er logget ind.
1. database sættes op, så graf navne / id kan hentes I stedet for hard coded
1. logout skal have en metode

### Other

1. Make /home only accesible via the other route (not just entering .../home)
1. Lav loginside, så man logger ind først. Lav test API kald, så man ved om en matchende DCR konto findes.
   - database med brugere
   - man kan registrere sin bruger såfremt navn og kode findes på DCR
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
1. Make pretty

## How the session management works

1. After logging in, the server sets cookie on the client called "session_id" (then you dont store password etc.)
2. Everytime client makes request, the server receives that session_id
3. Server will check for any session which refers to the session_id
4. if there is a session with that id, you're authenticated.

## MySQL setup with password...

1. sudo service mysql stop
1. sudo mysqld_safe --skip-grant-tables
1. sudo service mysql start
1. sudo mysql -u root
1. use mysql;
1. show tables;
1. describe user;
1. update user set authentication_string=password('1111') where user='root';
1. FLUSH PRIVILEGES;
