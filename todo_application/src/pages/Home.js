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

  const [isAdmin, setIsAdmin] = useState(false);
  const [requests, setRequests] = useState([]); // State to store role requests

  const [roles, setRoles] = useState([]); // State to store roles
  const [selectedRole, setSelectedRole] = useState(''); // State to store selected role

  const checkIfAdmin = () => {
    fetch('http://localhost:5000/checkIfAdmin')
      .then(response => response.json())
      .then(data => {
        console.log(data); // Log the response for debugging
        // Assuming the response contains an 'admin' property indicating admin status
        if (data.admin) {
          console.log('User is admin');
          setIsAdmin(true);
          // Handle the case where the user is an admin
          // Call fetchRoleRequests and renderRoleRequests when admin status is true
          fetchRoleRequests();
        } else {
          console.log('User is not admin');
          setIsAdmin(false);
          // Handle the case where the user is not an admin
        }
      })
      .catch(error => console.error(error));
  };

  

  // Function to fetch role requests from the server
  const fetchRoleRequests = () => {
    fetch('http://localhost:5000/fetchRoleRequests')
      .then(response => response.json())
      .then(data => {
        console.log(data); // Log the response for debugging
        if (data.requests) {
          console.log('Requests fetched successfully');
          setRequests(data.requests); // Update state with fetched role requests
          console.log('Requests:', requests);
        } else {
          console.log('No requests found');
        }
      })
      .catch(error => console.error(error));
  };
  
  
  

  // Render role requests
  const renderRoleRequests = () => {
    return (
      <div>
        <h2>Role Requests</h2>
        <ul>
          {requests.map((request, index) => (
            <li key={index}>
              Username: {request[1]}, Role: {request[2]}
              {isAdmin && (
                <button onClick={() => approveRoleRequest(request[1], request[2])}>
                  Approve
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };


  const approveRoleRequest = (username, role) => {
    fetch('http://localhost:5000/approveRoleRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, role })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data); // Log the response for debugging
      // You may want to update the local state or fetch role requests again after approval
      fetchRoleRequests();
    })
    .catch(error => console.error(error));
  };
  


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

  const AdminComponent = () => {
    return (
      <div>
        <h2>Admin Component</h2>
        <p>This is where the admin should be able to approve role requests</p>
        {renderRoleRequests()}
      </div>
    );
  };

  const fetchRolesForUser = () => {
    fetch('http://localhost:5000/fetchRolesForUser')
      .then(response => response.json())
      .then(data => {
        console.log(data); // Log the response for debugging
        if (data.roles) {
          console.log('Roles fetched successfully');
          setRoles(data.roles); // Update state with fetched roles
          console.log('Roles:', roles);
          if (data.roles.length > 0) {
            setSelectedRole(data.roles[0]);
          }
        } else {
          console.log('No roles found');
        }
      }
      )
      .catch(error => console.error(error));
  };

    
  const handleFetchRolesClick = () => {
    fetchRolesForUser();
  };

  const sendSelectedRole = () => {
    console.log('Selected role:', selectedRole);
    if (selectedRole) {
      fetch('http://localhost:5000/setDatafetcherRole', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: selectedRole })
      })
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => console.error(error));
    }
  };

  return (
    <div className="container">
        <Link to="/">
        <button>Log out</button>
      </Link>
      <h1 className="heading">JS Example</h1>
      <div>
        {/* Render admin component only if user is an admin */}
        {/* Button to check if is admin */}
        <button className="button" onClick={checkIfAdmin}>
          Check if admin/fetch role requests
        </button>
        {isAdmin && <AdminComponent />}
      </div>
      <div>
        <h2>Request or choose a role</h2>
        <form onSubmit={requestRole}>
          <label>Request a role:</label>
          <input type="text" name="role" />
          <br/>
          <input type="submit" value="Submit" />
        </form>
        <h3>Or choose a role:</h3>
        <select name="role" onChange={e => setSelectedRole(e.target.value)} value={selectedRole}>
            {roles.map((role, index) => (
              <option key={index} value={role}>{role}</option>
            ))}
          </select>
          <button className="button" onClick={sendSelectedRole}>
          Send Selected Role
          </button>
          <button className="button" onClick={handleFetchRolesClick}>
          Fetch Roles
        </button>
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