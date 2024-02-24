import React, { useState, useEffect } from 'react';
import './App.css'; // Import the external CSS file

function App() {
  const [content, setContent] = useState('THIS IS THE CONTENT IN THE BEGINNING');
  const [fetchedData, setFetchedData] = useState([]);
  const [fetchedGraphs, setFetchedGraphs] = useState([]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [graphId, setGraphId] = useState(null);
  const [role, setRole] = useState('');

  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const sendMessage = () => {
    fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: message })
    })
    .then(response => response.json())
    .then(data => {
      setResponse(data.response);
    })
    .catch(error => console.error(error));
  };

  const sendMessageFromButton = (msg) => {
    fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: msg })
    })
    .then(response => response.json())
    .then(data => {
      setResponse(data.response);
    })
    .catch(error => console.error(error));
  };

  const changeContent = () => {
    setContent('New Content!');
  };

  const changeContentBack = () => {
    setContent('THIS IS THE CONTENT IN THE BEGINNING');
  };

  const openNewWindow = () => {
    window.open('https://www.google.com');
  };

  const fetchFromServer = (id) => {
    fetch(`http://localhost:5000/fetchData?username=${username}&password=${password}&graph_id=${id}&role=${role}`)
      .then(response => response.json())
      .then(data => {
        console.log(data); // Add this line to inspect the fetched data in the console
        // Assuming data is an array and each item in the array has a 'label' property
        setFetchedData(data.labels); // Update state with fetched labels from the server
        setGraphId(id);
        console.log(data.labels);
      })
      .catch(error => console.error(error));
  };
  const fetchGraphs = () => {
    fetch(`http://localhost:5000/fetchGraphs?username=${username}&password=${password}`)
      .then(response => response.json())
      .then(data => {
        console.log(data); // Add this line to inspect the fetched data in the console
        // Assuming data is an array and each item in the array has a 'label' property
        setFetchedGraphs(data.graphs); // Update state with fetched labels from the server
        console.log(data.graphs);
      })
      .catch(error => console.error(error));
  }

  const handleDoubleClick = () => {
    alert("Button DOUBLE-clicked!");
  };
  

  const performEvent = (event_id) => {
    // Make a POST request to perform the event
    fetch('http://localhost:5000/performEvent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ event_id: event_id })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data); // You can handle the response here if needed
      setFetchedData(data.labels);
      //checkPendingTasks(graphId); // Check if there are any pending tasks
      // Check if there are any pending tasks
      //if (data.labels.length === 0) {
      //  alert('No more pending tasks!');
      //}
    })
    .catch(error => console.error(error));
  };
  
  const clearEvents = () => {
    // Reset the fetched data to an empty array
    setFetchedData([]);
    // Perform any other cleanup or reset tasks as needed
    // For example, you might want to reset other state variables or perform additional actions
  };
  
  return (
    <div className="container">
      <h1 className="heading">JS Example</h1>
      <p id="demo" className="paragraph">{content}</p>
      <button id="change_content_button" className="button" onClick={changeContent}>
        Change content
      </button>
      <button className="button" onClick={changeContentBack} onDoubleClick={handleDoubleClick}>
        Change content back
      </button>
      <button className="button" onClick={openNewWindow}>
        Open new window
      </button>

      <div>
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        {/*<input type="text" value={graphId} onChange={e => setGraphId(e.target.value)} placeholder="Graph ID" />*/}
        <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="Role" />
        {/*<button className="button" onClick={fetchFromServer}>
          Fetch data from server
        </button> */}
        <button className="button" onClick={fetchGraphs}>
          Fetch graphs
        </button>
      </div>

      {/* Display fetched data */}
      <div>
        <h2>Fetched Data:</h2>
        {fetchedData.map((item, index) => (
          <button key={index} className={item['@pending'] === 'true' ||
           item['@EffectivelyPending'] === 'true' ? 'pending-button' : 'regular-button'}
            onClick={() => performEvent(item['@id'])}>
            {item['@label']}
          </button>
        ))}
      </div>
      {/* Display fetched graphs */}
      <div>
        <h2>Fetched Graphs:</h2>
        {fetchedGraphs.map((graph, index) => (
          <button key={index} onClick={() => fetchFromServer(graph['@id'])}>
            {graph['@title']}
          </button>
        ))}
      </div>
      <div>
        {/* Render clear events button only if there are no pending tasks */}
        <button className="button" onClick={clearEvents}>
          Clear Events
        </button>     
      </div>

      <h1 className="heading">Chatbot Example</h1>
      <input 
        type="text" 
        value={message} 
        onChange={e => setMessage(e.target.value)} 
        placeholder="Type your message..." 
      />
      <button onClick={sendMessage}>Send</button>
      <div>
        <p>Bot's response:</p>
        <p>{response}</p>
      </div>
      <h2 className='exampleMessages'>Example messages:</h2>
      <button onClick={() => {
        sendMessageFromButton('Which tasks could I add to my morning routine?');
      }}>Which tasks could I add to my morning routine?</button>
    </div>
  );
}

export default App;
