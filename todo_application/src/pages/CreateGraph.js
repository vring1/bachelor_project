import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { createGraphFromMessage, sendMessage, sendMessageFromButton } from '../components/home/ChatFunctions'; // Import chatbot functions
import { Button, TextField, Grid, Typography, List, ListItem, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

function CreateGraph() {
  const [activities, setActivities] = useState([]);
  const [graphTitle, setGraphTitle] = useState(''); 

  // Relation types options
  const relationTypes = ['Condition', 'Response', 'Include', 'Exclude', 'Milestone', 'Spawn'];
  const [message, setMessage] = useState(''); // Message state for chatGPT


  const [messageChat, setMessageChat] = useState(''); // Message state for chatGPT
  const [response, setResponse] = useState(''); // Response state for chatGPT

  const navigate = useNavigate(); 

  useEffect(() => {
    // Check if user is logged in
    const sessionToken = sessionStorage.getItem('session_token');
    if (!sessionToken) {
      // If not logged in, redirect to login page
      navigate('/');
    }
  }, [navigate]); // Dependency array to ensure useEffect runs only once

  // Function to add a new activity to the list
  const addActivity = () => {
    setActivities([...activities, { 
      title: '', 
      pending: false, 
      role: '', 
      relations: [] 
    }]);
  };

  // Function to handle changes in activity properties
  const handleActivityChange = (index, field, value) => {
    const updatedActivities = [...activities];
    updatedActivities[index][field] = value;
    setActivities(updatedActivities);
  };

  // Function to add a relation for an activity
  const addRelation = (index) => {
    const updatedActivities = [...activities];
    updatedActivities[index].relations.push({ relatedActivity: '', type: relationTypes[0] });
    setActivities(updatedActivities);
  };

  // Function to handle changes in relation properties
  const handleRelationChange = (activityIndex, relationIndex, field, value) => {
    const updatedActivities = [...activities];
    updatedActivities[activityIndex].relations[relationIndex][field] = value;
    setActivities(updatedActivities);
  };

  // Function to remove a relation from an activity
  const removeRelation = (activityIndex, relationIndex) => {
    const updatedActivities = [...activities];
    updatedActivities[activityIndex].relations.splice(relationIndex, 1);
    setActivities(updatedActivities);
  };

  // Function to remove an activity from the list
  const removeActivity = (index) => {
    const updatedActivities = [...activities];
    updatedActivities.splice(index, 1);
    setActivities(updatedActivities);
  };

  // Function to create a new graph
  const createGraph = (event) => {
    event.preventDefault(); // Prevent default form submission

    // Ask for confirmation
    const confirmed = window.confirm("Are you sure you want to submit the graph?");
    if (!confirmed) {
      return; // Don't proceed if not confirmed
    }

    const graphData = {
      title: graphTitle,
      activities: activities.map(activity => ({
        title: activity.title,
        pending: activity.pending,
        role: activity.role,
        relations: activity.relations
      }))
    };

      

  fetch('http://localhost:5000/createGraph', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
    },
    body: JSON.stringify(graphData)
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
  })
  .catch(error => console.error(error));
  };

  const handleCreateGraphFromMessage = (e) => {
    e.preventDefault(); // Prevent default form submission
    createGraphFromMessage(message); // Call sendMessage function from imported chatbot functions
    setMessage('');
  };

  const handleSendMessage = (e) => {
    e.preventDefault(); // Prevent default form submission
    sendMessage(messageChat, setResponse); // Call sendMessage function from imported chatbot functions
    setMessageChat('');
  };

  const handleSendMessageFromButton = (msg) => {
    sendMessageFromButton(msg, setResponse); // Call sendMessageFromButton function from imported chatbot functions
  };
  
  const theme = createTheme({
    palette: {
      mode: 'dark', // Dark grey color
    },
  });

  return (
    <ThemeProvider theme={theme}>
    <div>
      <Grid container spacing={2} alignItems="center">
      <Grid item>
            <Link to="/home">
              <Button  color="primary"><img src={require('../img/./todo.png')} alt="Todo" style={{ width: 'auto', height: '100px', marginLeft: '8px' }} /></Button>
          </Link>
      </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="" justifyContent="space-between">
      <Grid item>
        <br />
      <Typography variant="h4" style={{color: theme.palette.primary.dark}}>Create a new graph</Typography>
      <br />

      <form onSubmit={createGraph}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
             <TextField 
              label="Graph Title" 
              value={graphTitle} 
              onChange={(e) => setGraphTitle(e.target.value)} 
              fullWidth
              variant="outlined"  
              style={{ flex: 1 }} 
              margin="normal" 
            />
              <Button type="submit" variant="contained" color="primary" style={{marginLeft:"10px"}}>Create Graph</Button>         
               </div>
              <br />
              {activities.map((activity, activityIndex) => (
                <div key={activityIndex}>
                  <Typography variant="h6">Activity</Typography>
                  <TextField 
                    label="Title" 
                    value={activity.title} 
                    onChange={(e) => handleActivityChange(activityIndex, 'title', e.target.value)} 
                    variant="outlined" 
                    fullWidth
                    margin="normal" 
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Pending</InputLabel>
                    <Select
                      value={activity.pending}
                      onChange={(e) => handleActivityChange(activityIndex, 'pending', e.target.value)}
                      variant="outlined"
                    >
                      <MenuItem value={true}>True</MenuItem>
                      <MenuItem value={false}>False</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField 
                    label="Role" 
                    value={activity.role} 
                    onChange={(e) => handleActivityChange(activityIndex, 'role', e.target.value)} 
                    variant="outlined" 
                    fullWidth 
                    margin="normal" 
                  />
                  <Button variant="contained" color="secondary" onClick={() => removeActivity(activityIndex)}>Remove</Button>

            {/* Relation Inputs */}
            <Typography variant="subtitle1">Relations</Typography>
            {activity.relations.map((relation, relationIndex) => (
                    <div key={relationIndex}>
                      <TextField 
                        label="Related Activity" 
                        value={relation.relatedActivity} 
                        onChange={(e) => handleRelationChange(activityIndex, relationIndex, 'relatedActivity', e.target.value)} 
                        variant="outlined" 
                        fullWidth 
                        margin="normal" 
                      />
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={relation.type}
                          onChange={(e) => handleRelationChange(activityIndex, relationIndex, 'type', e.target.value)}
                          variant="outlined"
                        >
                          {relationTypes.map((type, index) => (
                            <MenuItem key={index} value={type}>{type}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button variant="contained" color="secondary" style={{marginBottom:"10px"}} onClick={() => removeRelation(activityIndex, relationIndex)}>Remove Relation</Button>
                    </div>
                  ))}
                  <Button variant="contained" color="primary" style={{marginBottom:"10px"}} onClick={() => addRelation(activityIndex)}>Add Relation</Button>
                </div>
              ))}
              <Button variant="contained" color="primary" onClick={addActivity}>Add Activity</Button>
      </form>
      </Grid>
      <Grid item>
        <br />
      <Typography variant="h4" style={{color: theme.palette.primary.dark}}>Create a graph from a message</Typography>
      <Typography variant="h5" style={{color: theme.palette.primary.dark}}>Remember to indicate title and role(s)</Typography>
      <br />
      <form onSubmit={handleCreateGraphFromMessage}>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <TextField
          label="Type your message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          variant="outlined"
        />
        </Grid>
        <Grid item>
          <Button type="submit" variant="contained" color="primary">Send</Button>
        </Grid>
      </Grid>
      </form>
      </Grid>
        <Grid item xs={3}>
        <br />
        <Typography variant="h4" style={{color: theme.palette.primary.dark}}>Ask me anything</Typography>
        <br />
      <form onSubmit={handleSendMessage}>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <TextField
          label="Type your message..."
          value={messageChat}
          onChange={e => setMessageChat(e.target.value)}
          variant="outlined"
        />
        </Grid>
        <Grid item>
          <Button type="submit" variant="contained" color="primary">Send</Button>
        </Grid>
      </Grid>
      </form>
      <br />
      <div>
      <Typography variant="h7" style={{color: theme.palette.primary.dark}}>{response}</Typography>
      </div>
      <br />
      <Button onClick={() => { handleSendMessageFromButton('Which tasks could I add to my morning routine?'); }}>Which tasks could I add to my morning routine?</Button>
      <br />
      <br />
      <Button onClick={() => { handleSendMessageFromButton('Which tasks could I add to my evening routine?'); }}>Which tasks could I add to my evening routine?</Button>
      <br />
      <br />
      <Button onClick={() => { handleSendMessageFromButton('How much time should I spend outside a day?'); }}>How much time should I spend outside a day?</Button>
      <br />
      <br /> 
      <Button onClick={() => { handleSendMessageFromButton('What are some chores I should do everyday?'); }}>What are some chores I should do everyday?</Button>
      </Grid>
      </Grid>
        
    </div>
    </ThemeProvider>
  );
}

export default CreateGraph;
