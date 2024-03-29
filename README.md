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
9. Session management (first big challenge) - localstorage
10. redis??
11. Sudden change in DCR API - naming in json is capital instead of lower case.
12. pooling
13. Hele sessionen er baseret på den cookie og dermed behov for forskellige browsers, eftersom cookies er i hele browsersessionen (gem det som problem i opgaven)
14. Meget volatilt at bruge CategoryId[0] = '8' uden at kende mere til DCR id-brug

## TODO

### Urgent

1. konkret bruge chatgpt til at give information til app-kreering
1. Find på bedre løsning til performevent med at finde rigtige graph og sim i databasen.
1. register skal lige give en ordentlig besked i guess
1. logout skal have metode, der sender token og sørger for man ikke er logget ind længere(MÅSKE)
1. KÆMPE REFACTOR!!!
1. datafetcher har for mange responsibilities
1. brug pk (integer id) i stedet for email (lige nu har du mails stored i flere tables. de burde bare joines på id)
1. max antal requests + man skal kunne vælge de godkendte (og de skal self kunne godkendes af en!!)
1. database sættes op, så graf navne / id kan hentes I stedet for hard coded

### Other

1. Choose different graphs (already implemented but..)
   - Add "Morgenrutine", "Aftenrutine", "Søndagsopgaver" etc.
1. Brug database til grafnavne og load så kun dem man kender...

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

   - Omfang??? Introduktion (motivér opgaven)
     Bagggrundsinformation (DCR, ChatGPT)

     Analyse:
     Hvad er problemet og hvilke tekonologier er til rådighed?
     deklarativ vs imperativ
     process aware information systems
     Hvad er det man prøver at løse? - sikkerhed, lovgivning

     Design/implementering: - Test.. (ikke kun manuelt testet) - Fremhæv overordnet design - Fremhæv dele af kode (ChatGPT API og DCR API f.eks.) - Design patterns & principper (solid)? - Objektorienteret programmering in general - Koden kan vedligheholdes på baggrund af principper etc.

     Diskussion:
     Fordele og ulemper - ved APIAbility to - chatGPT - deklarativ vs imperativ
     Hvad mangler? Hvis det var en rigtig app - GDPR
     Hvilke udfordringer har der været
     Hver er gode ting man har fundet

     Appendix:
     Vejledning til kørsel etc.
     Vis vejledning til brug af DCR
     Link til github og kode i appendix

   - Declarative vs imperativ
   - Brug af API (fordele ulemper) -f.eks. begrænsede muligehder fra udbyder
   - App'en skal testes (dokumentation på det)
   - Kode i appendix og online
     Valdemar API bachelorprojekt (del overleaf dokument (find template måske))

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

### Brug Swagger

#### Request til at lave tom graf

```
{
  "dcrModel": {
    "additionalProp1": [
      "string"
    ],
    "additionalProp2": [
      "string"
    ],
    "additionalProp3": [
      "string"
    ]
  },
  "base64Data": "string",
  "updatedXML": "string",
  "modeOfSharing": "string",
  "sharedWith": 0,
  "dcrGraphId": 0,
  "dcrsopCategory": "5302",
  "title": "test title"
}
```

### ChatGPT as graph creator brainstorm

Hello. I need you to help me create a graph in DCR. They consist of activities and relations between the activities.

Here's a list of the relations:

1. Condition: A condition between two activities ensures that the second activity cannot be executed unless the first is excluded or has been executed at least once.
2. Response: A response, or goal, ensures that once the first activity has been executed the other activity becomes a goal, that must eventually be executed or excluded.
3. Include: The include relation includes other activities upon execution.
4. Exclude: The exclude relation excludes other activities upon execution.
5. Milestone: The milestone relation blocks the second activity if the first is currently a goal (response) and included.
6. Spawn: Spawns a new sub-process.

Here's an example of what I need you to be able to do:

This is a graph described in natural language:

"I have to brush my teeth before washing my hands, but I should also remember to wash my hands when I'm done brushing."

In the above we have both a condition and a response, as I'm not allowed to wash hands before and I have to do it when done brushing. I need you to be able to identify the activities and relations from a provided text like the above.

Right now it's also possible to generate the graphs manually using my React client, and then the following format is sent to the server:

const graphData = {
title: graphTitle,
activities: activities.map(activity => ({
title: activity.title,
pending: activity.pending,
role: activity.role,
relations: activity.relations
}))
};

Now, please convert the text sent to you in the next message into activities with relations to eachother and give me them in the same format as from react.
