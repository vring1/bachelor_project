import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import './../App.css';
import { sendMessage, sendMessageFromButton } from '../components/home/ChatFunctions'; // Import chatbot functions
import { fetchFromServer, fetchGraphs, performEvent, clearEvents } from '../components/home/GraphFunctions'; // Import server functions
import { Button, TextField, Select, MenuItem, Grid, Typography, List, ListItem } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';


function Home() {
  const [fetchedData, setFetchedData] = useState([]); // State to store fetched events
  const [fetchedGraphs, setFetchedGraphs] = useState([]); // State to store fetched graphs

  


  const [isAdmin, setIsAdmin] = useState(false); // State to store admin status
  const [requests, setRequests] = useState([]); // State to store role requests

  const [roles, setRoles] = useState([]); // State to store roles
  const [selectedRole, setSelectedRole] = useState(''); // State to store selected role

  const [checkAdminInterval, setCheckAdminInterval] = useState(false); // State to track admin status

  const [initialRoleSelected, setInitialRoleSelected] = useState(false); // State to track initial role selection

  const [checkSendSelectedRoleInterval, setCheckSendSelectedRoleInterval] = useState(false); // State to track sending selected role

  const navigate = useNavigate(); 

  useEffect(() => {
    // Check if user is logged in
    const sessionToken = sessionStorage.getItem('session_token');
    if (!sessionToken) {
      // If not logged in, redirect to login page
      navigate('/');
    }
  }, [navigate]); // Dependency array to ensure useEffect runs only once


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

 
  const checkIfAdmin = () => {
    fetch('http://localhost:5000/checkIfAdmin', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            //'Cookie': document.cookie // Send the entire cookie value
            'Authorization' : `Bearer ${sessionStorage.getItem('session_token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); // Log the response for debugging
        if (data.admin) {
            console.log('User is admin');
            setIsAdmin(true);
            fetchRoleRequests();
        } else {
            console.log('User is not admin');
            setIsAdmin(false);
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
        <List>
          {requests.map((request, index) => (
            <ListItem key={index} style={{ marginBottom: '10px' }}>
              {isAdmin && (
                <div>
                  <Button onClick={() => approveRoleRequest(request[1], request[2])} variant="contained" color="primary" style={{ marginRight: '5px'}}>
                    Approve
                  </Button>
                  <Button onClick={() => denyRoleRequest(request[1], request[2])} variant="contained" color="secondary" style={{ marginRight: '5px'}}>
                    Deny
                  </Button>
                </div>
              )}
              <Grid item xs={3}>
              <Typography>
                {request[1]}: {request[2]}
              </Typography>
              </Grid>
              
            </ListItem>
          ))}
        </List>
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
      setRequests(prevRequests => prevRequests.filter(request => request[1] !== username && request[2] !== role));
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
      setRequests(prevRequests => prevRequests.filter(request => request[1] !== username && request[2] !== role));
      fetchRoleRequests();
    })
    .catch(error => console.error(error));
  };

  

 

  const handleFetchFromServer = (id, title) => {
    fetchFromServer(id, setFetchedData, title);
  };

  
  const handleFetchGraphs = () => {
    fetchGraphs(setFetchedGraphs);
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
        //'Cookie': document.cookie // Send cookies with the request
        'Authorization' : `Bearer ${sessionStorage.getItem('session_token')}`
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
        {renderRoleRequests()}
      </div>
    );
  };

  const fetchRolesForUser = () => {
    fetch('http://localhost:5000/fetchRolesForUser', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${sessionStorage.getItem('session_token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); // Log the response for debugging
        if (data.roles) {
            console.log('Roles fetched successfully');
            setRoles(data.roles); // Update state with fetched roles
            console.log('Roles:', roles);
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



  const sendSelectedRole = (role) => {
    console.log('Selected role:', role);
    if (role) {
      fetch('http://localhost:5000/setCurrentRole', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          //'Cookie': document.cookie // Send cookies with the request
          'Authorization' : `Bearer ${sessionStorage.getItem('session_token')}`
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

  const deleteGraph = (id) => {
    fetch('http://localhost:5000/deleteGraph', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization' : `Bearer ${sessionStorage.getItem('session_token')}`
      },
      body: JSON.stringify({ id: id })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      handleFetchGraphs();
    })
    .catch(error => console.error(error));
  };

  const theme = createTheme({
    palette: {
      mode: 'dark', // Dark grey color
    },
  });
  
  return (
    <ThemeProvider theme={theme}>
      <div className="container">
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Link to="/home">
              <Button  color="primary"><img src={require('../img/./todo.png')} alt="Todo" style={{ width: 'auto', height: '100px', marginLeft: '8px' }} /></Button>
          </Link>
          </Grid>
          <Grid item>
            {/* Grid container for Log out and Create a new graph buttons */}
            <Grid container justifyContent="flex-end" spacing={2}>
              <Grid item>
                <Link to="/creategraph">
                  <Button variant="contained" color="primary">Create a new graph</Button>
                </Link>
              </Grid>
              <Grid item>
                <Link to="/">
                  <Button variant="contained" color="primary">Log out</Button>
                </Link>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <br /> <br />
        <Grid container justifyContent="space-between" spacing={8} alignItems="flex-start">
          <Grid item>
            <Typography variant="h4" style={{color: theme.palette.primary.dark}}>Graphs</Typography>
          </Grid>
          <Grid item>
            <Select value={selectedRole} onChange={handleRoleChange}>
              {roles.map((role, index) => (
                <MenuItem key={index} value={role}>{role}</MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item>
            <form onSubmit={requestRole}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <TextField label="Request a role" name="role" variant="outlined" />
                </Grid>
                <Grid item>
                  <Button type="submit" variant="contained" color="primary">Submit</Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
          <Grid item>
            <Grid container alignItems="center">
                {isAdmin && <Typography variant="h4" style={{color: theme.palette.primary.dark}}>Role Requests</Typography>}
              </Grid>
          </Grid>
        </Grid>
        <Grid container alignItems="flex-start" spacing={8} justifyContent="space-between">
          {/* Grid item for fetched graphs */}
          <Grid item xs={4}>
            <div>
              {fetchedGraphs.map((graph, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <Button onClick={() => handleFetchFromServer(graph['@Id'], graph['@Title'])}>
                    {graph['@Title']}
                  </Button>
                  <Button onClick={() => deleteGraph(graph['@Id'])} variant="contained" color="secondary" style={{ marginLeft: '5px' }}>
                    Delete
                  </Button>
                </div>
              ))}
            </div>
            
        </Grid>
        <Grid item xs={3}>
            <br />
            {fetchedData.length > 0 && (
                    <Button variant="contained" color="secondary" onClick={handleClearEvents}>
                      Clear Events
                    </Button>
                  )}
            <br />
            {fetchedData.map((item, index) => (
                  <Button key={index} style={{ marginTop: '15px', marginLeft: '10px', marginRight: '10px' }} variant={item['@Pending'] === 'true' || item['@EffectivelyPending'] === 'true' ? 'contained' : 'outlined'} onClick={() => handlePerformEvent(item['@id'])}>
                    {item['@label']}
                  </Button>
                ))}
          </Grid>
          <Grid item>
          </Grid>
          <Grid item>
          </Grid>
          <Grid item>
          </Grid>
          <Grid item xs={3}>
          {isAdmin && <AdminComponent />}
          </Grid>
        </Grid>
      </div>
    </ThemeProvider>
  );
  
  

}

export default Home;