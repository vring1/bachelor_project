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
11. Sudden change in DCR API - naming in json is capital instead of lower case.
12. pooling

## TODO

### Urgent

1. logout skal have metode, der sender token og sørger for man ikke er logget ind længere(MÅSKE)
1. Man kan approve den samme flere gange?? + den forsvinder ikke ???
1. KÆMPE REFACTOR!!!
1. datafetcher har for mange responsibilities
1. brug pk (integer id) i stedet for email (lige nu har du mails stored i flere tables. de burde bare joines på id)
1. max antal requests + man skal kunne vælge de godkendte (og de skal self kunne godkendes af en!!)
1. MÅSKE FUCK SESSION OG KLAR ALT GENNEM DATABASE?? SÅ HVER GANG DER TRYKKES TJEK I DATABASEN HVOR USERNAME MATCHER F.EKS.
1. Få session til at virke - indebærer ordentligt register/login logik.
1. /home skal måske ikke kunne tilgås hvis man ikke er logget ind.
1. database sættes op, så graf navne / id kan hentes I stedet for hard coded
1. logout skal have en metode

### Other

1. Make /home only accesible via the other route (not just entering .../home)
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
1. update user set authentication_string=password('password') where user='root';
1. FLUSH PRIVILEGES;

## Spørgsmål / Noter til vejledning

1. Hvordan skal rapport sættes op? - Disposition...
   - Omfang???v
   - Declarative vs imperativ
   - Brug af API (fordele ulemper) -f.eks. begrænsede muligehder fra udbyder
   - App'en skal testes (dokumentation på det)
   - Kode i appendix og online
2. Indhold til rapport?

   - Gennemgang af kode og processen med udvikling?
   - Skal beskrive opbygningen af app'en (herunder især anvendelsen af de to API'er)

3. Teori?
   - Design patterns & principper (solid)?
   - Objektorienteret programmering in general

## Opgavebeskrivelse

I projektet udvikles en todo-app der ved hjælp af DCR REST-api gør det muligt at se og opdatere dagens opgaver og
planlægge opgaver, herunder gentagende opgaver og opgaver med og uden frist.
ChatGPT API'en bruges til at komme med forslag til opgaver som kan tilføjes opgavelisten.

Der afleveres en rapport som beskrive opbygningen af app’en, herunder især anvendelsen af de to API’er med
diskussion af fordele/ulemper ved at bruge sådanne 3. part services samt hvordan app’en er testet og kan afprøves.
Kode gøres tilgængeligt i appendix og online.

Hvis tiden tillader laves integration med kalender via API og/eller der laves kategorier af opgaver (træningsøvelser,
madopskrifter,m ..)

### Inconsitency in DCR API naming

```html
{/* Display fetched events */}
      <div>
        <h2>Fetched Events:</h2>
        {fetchedData.map((item, index) => (
          <button key={index} className={item['@Pending'] === 'true' ||
           item['@EffectivelyPending'] === 'true' ? 'pending-button' : 'regular-button'}
            onClick={() => handlePerformEvent(item['@id'])}>
            {item['@label']}
          </button>
        ))}
      </div>
      {/* Display fetched graphs */}
      <div>
        <h2>Fetched Graphs:</h2>
        {fetchedGraphs.map((graph, index) => (
          <button key={index} onClick={() => handleFetchFromServer(graph['@Id'])}>
            {graph['@Title']}
          </button>
        ))}
      </div>
```
