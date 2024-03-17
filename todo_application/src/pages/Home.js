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
  const [title, setTitle] = useState(null);
  //const [role, setRole] = useState('');

  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const location = useLocation();
  //const {username, password, role} = location.state;

  const [isAdmin, setIsAdmin] = useState(false);
  const [requests, setRequests] = useState([]); // State to store role requests

  const [roles, setRoles] = useState([]); // State to store roles
  const [selectedRole, setSelectedRole] = useState(''); // State to store selected role

  // State to store whether to check if user is admin
  const [checkAdminInterval, setCheckAdminInterval] = useState(false);

  const [initialRoleSelected, setInitialRoleSelected] = useState(false); // State to track initial role selection

  const [checkSendSelectedRoleInterval, setCheckSendSelectedRoleInterval] = useState(false);
  // Check if user is admin on component mount
  useEffect(() => {
    setCheckAdminInterval(true); // Set to true when the component mounts
    return () => {
      setCheckAdminInterval(false);
    };
  }, []);

  useEffect(() => {
    setCheckSendSelectedRoleInterval(true); // Set to true when the component mounts
    return () => {
      setCheckSendSelectedRoleInterval(false);
    };
  }, []);

  useEffect(() => {
    if (checkAdminInterval) {
      fetchRolesForUser(); // Call checkIfAdmin when the component mounts
      sendSelectedRole(selectedRole);
      handleFetchGraphs();
      checkIfAdmin();
    
      const interval = setInterval(() => {
        checkIfAdmin(); // Call checkIfAdmin every 5 seconds
        fetchRolesForUser();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [checkAdminInterval, selectedRole]);


  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
    sendSelectedRole(newRole);
  };

  //const checkIfAdmin = () => {
  //  fetch('http://localhost:5000/checkIfAdmin')
  //    .then(response => response.json())
  //    .then(data => {
  //      console.log(data); // Log the response for debugging
  //      // Assuming the response contains an 'admin' property indicating admin status
  //      if (data.admin) {
  //        console.log('User is admin');
  //        setIsAdmin(true);
  //        // Handle the case where the user is an admin
  //        // Call fetchRoleRequests and renderRoleRequests when admin status is true
  //        fetchRoleRequests();
  //      } else {
  //        console.log('User is not admin');
  //        setIsAdmin(false);
  //        // Handle the case where the user is not an admin
  //      }
  //    })
  //    .catch(error => console.error(error));
  //};
  const checkIfAdmin = () => {
    fetch('http://localhost:5000/checkIfAdmin', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': document.cookie // Send the entire cookie value
        }
    })
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
  
  
  const renderRoleRequests = () => {
    return (
      <div>
        <h2>Role Requests</h2>
        <ul>
          {requests.map((request, index) => (
            <li key={index}>
              Username: {request[1]}, Role: {request[2]}
              {isAdmin && (
                <div>
                  <button onClick={() => approveRoleRequest(request[1], request[2])}>
                    Approve
                  </button>
                  <button onClick={() => denyRoleRequest(request[1], request[2])}>
                    Deny
                  </button>
                </div>
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
      console.log(data); 
      fetchRoleRequests();
    })
    .catch(error => console.error(error));
  };
  
  const denyRoleRequest = (username, role) => {
    fetch('http://localhost:5000/denyRoleRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, role })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data); 
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

  const handleFetchFromServer = (id, title) => {
    fetchFromServer(id, setFetchedData, setGraphId, title, setTitle);
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
    e.target.role.value = ''; // Clear the role submit field
    console.log("Role: ", role);
    console.log("Document cookie: ", document.cookie);
    fetch('http://localhost:5000/requestRole', {
      method: 'POST', // Use POST method
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json', // Specify content type as JSON
        'Cookie': document.cookie // Send cookies with the request
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

  //const fetchRolesForUser = () => {
  //  fetch('http://localhost:5000/fetchRolesForUser')
  //    .then(response => response.json())
  //    .then(data => {
  //      console.log(data); // Log the response for debugging
  //      if (data.roles) {
  //        console.log('Roles fetched successfully');
  //        setRoles(data.roles); // Update state with fetched roles
  //        console.log('Roles:', roles);
  //        //if (data.roles.length > 0) {
  //        //  setSelectedRole(data.roles[0]);
  //        //}
  //        // Set role only if it's the initial fetch and roles are not empty
  //        if (!initialRoleSelected && data.roles.length > 0) {
  //          setSelectedRole(data.roles[0]);
  //          setInitialRoleSelected(true); // Set initial role selection state
  //        }
  //      } else {
  //        console.log('No roles found');
  //      }
  //    }
  //    )
  //    .catch(error => console.error(error));
  //};

  const fetchRolesForUser = () => {
    fetch('http://localhost:5000/fetchRolesForUser', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': document.cookie // Send the entire cookie value
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); // Log the response for debugging
        if (data.roles) {
            console.log('Roles fetched successfully');
            setRoles(data.roles); // Update state with fetched roles
            console.log('Roles:', roles);
            //if (data.roles.length > 0) {
            //  setSelectedRole(data.roles[0]);
            //}
            // Set role only if it's the initial fetch and roles are not empty
            if (!initialRoleSelected && data.roles.length > 0) {
                setSelectedRole(data.roles[0]);
                setInitialRoleSelected(true); // Set initial role selection state
            }
        } else {
            console.log('No roles found');
        }
    })
    .catch(error => console.error(error));
};


    
  const handleFetchRolesClick = () => {
    fetchRolesForUser();
  };

  const sendSelectedRole = (role) => {
    console.log('Selected role:', role);
    if (role) {
      fetch('http://localhost:5000/setCurrentRole', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie // Send cookies with the request
        },
        body: JSON.stringify({ role: role })
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
        {/*<button className="button" onClick={checkIfAdmin}>
          Check if admin/fetch role requests
  </button>*/}
        {isAdmin && <AdminComponent />}
      </div>
      <div>
        <h2>Request or choose a role</h2>
        <form onSubmit={requestRole}>
          <label>Request a role:</label>
          <input type="text" name="role" />
          <br/>
          <input type="submit" value="Submit"/>
        </form>
        <h3>Or choose a role:</h3>
        {/*<select name="role" onChange={e => setSelectedRole(e.target.value)} value={selectedRole}>
            {roles.map((role, index) => (
              <option key={index} value={role}>{role}</option>
            ))}
          </select>*/}
          <select name="role" onChange={handleRoleChange} value={selectedRole}>
            {roles.map((role, index) => (
            <option key={index} value={role}>{role}</option>
            ))}
          </select>
          {/*<button className="button" onClick={sendSelectedRole}>
          Send Selected Role
          </button>
          <button className="button" onClick={handleFetchRolesClick}>
          Fetch Roles
            </button>*/}
      </div>
        
      <div>
        {/*<button className="button" onClick={handleFetchGraphs}>
          Fetch graphs
        </button>*/}
        {/* Render error message if fetch attempt fails */}
        {errorMessage && (
          <div>
            <p>{errorMessage}</p>
          </div>
        )}
      </div>
        
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
          <button key={index} onClick={() => handleFetchFromServer(graph['@Id'], graph['@Title'])}>
            {graph['@Title']}
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