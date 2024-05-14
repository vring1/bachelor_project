import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import './../App.css';
import { fetchFromServer, fetchGraphs, performEvent, clearEvents } from '../components/home/GraphFunctions'; 
import { Button, TextField, Select, MenuItem, Grid, Typography, List, ListItem } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';


function Home() {
  const [fetchedData, setFetchedData] = useState([]); 
  const [fetchedGraphs, setFetchedGraphs] = useState([]); 

  


  const [isAdmin, setIsAdmin] = useState(false); 
  const [requests, setRequests] = useState([]); 

  const [roles, setRoles] = useState([]); 
  const [selectedRole, setSelectedRole] = useState(''); 

  const [checkAdminInterval, setCheckAdminInterval] = useState(false); 

  const [initialRoleSelected, setInitialRoleSelected] = useState(false); 

  const [checkSendSelectedRoleInterval, setCheckSendSelectedRoleInterval] = useState(false);

  const navigate = useNavigate(); 

  useEffect(() => {
    const sessionToken = sessionStorage.getItem('session_token');
    if (!sessionToken) {
      navigate('/');
    }
  }, [navigate]); 


  useEffect(() => {
    setCheckAdminInterval(true);
    return () => {
      setCheckAdminInterval(false);
    };
  }, []);

  useEffect(() => {
    setCheckSendSelectedRoleInterval(true);
    return () => {
      setCheckSendSelectedRoleInterval(false);
    };
  }, []);

  useEffect(() => {
    if (checkAdminInterval) {
      fetchRolesForUser();
      sendSelectedRole(selectedRole);
      handleFetchGraphs();
      checkIfAdmin();
    
      const interval = setInterval(() => {
        checkIfAdmin();
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
            'Authorization' : `Bearer ${sessionStorage.getItem('session_token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); 
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

  

  const fetchRoleRequests = () => {
    fetch('http://localhost:5000/fetchRoleRequests')
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (data.requests) {
          console.log('Requests fetched successfully');
          setRequests(data.requests); 
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
    e.preventDefault();
    const role = e.target.role.value; 
    e.target.role.value = ''; 
    console.log("Role: ", role);
    console.log("Document cookie: ", document.cookie);
    fetch('http://localhost:5000/requestRole', {
      method: 'POST', 
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json', 
        'Authorization' : `Bearer ${sessionStorage.getItem('session_token')}`
      },
      body: JSON.stringify({ role: role }) 
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
        console.log(data); 
        if (data.roles) {
            console.log('Roles fetched successfully');
            setRoles(data.roles);
            console.log('Roles:', roles);
            if (!initialRoleSelected && data.roles.length > 0) {
                setSelectedRole(data.roles[0]);
                setInitialRoleSelected(true);
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
      mode: 'dark', 
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