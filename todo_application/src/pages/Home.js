import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import './../App.css';
import { sendMessage, sendMessageFromButton } from '../components/home/ChatFunctions'; // Import chatbot functions
import { fetchFromServer, fetchGraphs, performEvent, clearEvents } from '../components/home/GraphFunctions'; // Import server functions

function Home() {
  const [fetchedData, setFetchedData] = useState([]);
  const [fetchedGraphs, setFetchedGraphs] = useState([]);
  const [errorMessage, setErrorMessage] = useState(''); // State to store error message

  //const [username, setUsername] = useState('');
  //const [password, setPassword] = useState('');

  const [graphId, setGraphId] = useState(null);
  //const [role, setRole] = useState('');

  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const location = useLocation();
  //const {username, password, role} = location.state;

  const handleSendMessage = () => {
    sendMessage(message, setResponse); // Call sendMessage function from imported chatbot functions
  };

  const handleSendMessageFromButton = (msg) => {
    sendMessageFromButton(msg, setResponse); // Call sendMessageFromButton function from imported chatbot functions
  };

  const handleFetchFromServer = (id) => {
    fetchFromServer(id, setFetchedData, setGraphId);
  };
  
  const handleFetchGraphs = () => {
    fetchGraphs(setErrorMessage, setFetchedGraphs);
  };
  
  const handlePerformEvent = (event_id) => {
    performEvent(event_id, setFetchedData);
  };
  
  const handleClearEvents = () => {
    clearEvents(setFetchedData);
  };
  
  const requestRole = (e) => {
    e.preventDefault(); // Prevent default form submission
    const role = e.target.role.value; // Extract role from the form
    console.log("Role: ", role);
    fetch('http://localhost:5000/requestRole', {
      method: 'POST', // Use POST method
      headers: {
        'Content-Type': 'application/json' // Specify content type as JSON
      },
      body: JSON.stringify({ role: role }) // Send role in the request body
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => console.error(error));
  };

  return (
    <div className="container">
        <Link to="/">
        <button>Log out</button>
      </Link>
      <h1 className="heading">JS Example</h1>
      <div>
        <h2>Request or choose a role</h2>
        <form onSubmit={requestRole}>
          <label>Request a role:</label>
          <input type="text" name="role" />
          <br/>
          <input type="submit" value="Submit" />
        </form>

      </div>
      <div>
        <button className="button" onClick={handleFetchGraphs}>
          Fetch graphs
        </button>
        {/* Render error message if fetch attempt fails */}
        {errorMessage && (
          <div>
            <p>{errorMessage}</p>
          </div>
        )}
      </div>
        
      {/* Display fetched data */}
      <div>
        <h2>Fetched Data:</h2>
        {fetchedData.map((item, index) => (
          <button key={index} className={item['@pending'] === 'true' ||
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
          <button key={index} onClick={() => handleFetchFromServer(graph['@id'])}>
            {graph['@title']}
          </button>
        ))}
      </div>
      <div>
        {/* Render clear events button only if there are no pending tasks */}
        <button className="button" onClick={handleClearEvents}>
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
      <button onClick={handleSendMessage}>Send</button>
      <div>
        <p>Bot's response:</p>
        <p>{response}</p>
      </div>
      <h2 className='exampleMessages'>Example messages:</h2>
      <button onClick={() => {
        handleSendMessageFromButton('Which tasks could I add to my morning routine?');
      }}>Which tasks could I add to my morning routine?</button>
    </div>
  );

}

export default Home;