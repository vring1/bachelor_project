import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { createGraphFromMessage } from '../components/home/ChatFunctions'; // Import chatbot functions

function CreateGraph() {
  const [activities, setActivities] = useState([]);
  const [graphTitle, setGraphTitle] = useState(''); 

  // Relation types options
  const relationTypes = ['Condition', 'Response', 'Include', 'Exclude', 'Milestone', 'Spawn'];
  const [message, setMessage] = useState(''); // Message state for chatGPT

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

  const handleCreateGraphFromMessage = () => {
    createGraphFromMessage(message); // Call sendMessage function from imported chatbot functions
  };
  

  return (
    <div>
      <Link to="/home">
        <button>Back to home</button>
      </Link>
      <h2>Create a new graph</h2>
      <form onSubmit={createGraph}>
        {/* Title on graph */}
        <label>
          Graph Title:
          <input 
            type="text" 
            value={graphTitle} 
            onChange={(e) => setGraphTitle(e.target.value)} 
          />
        </label>
        {activities.map((activity, activityIndex) => (
          <div key={activityIndex}>
            <h3>Activity</h3>
            <label>
              Title:
              <input 
                type="text" 
                value={activity.title} 
                onChange={(e) => handleActivityChange(activityIndex, 'title', e.target.value)} 
              />
            </label>
            <label>
              Pending:
              <input 
                type="checkbox" 
                checked={activity.pending} 
                onChange={(e) => handleActivityChange(activityIndex, 'pending', e.target.checked)} 
              />
            </label>
            <label>
              Role:
              <input 
                type="text" 
                value={activity.role} 
                onChange={(e) => handleActivityChange(activityIndex, 'role', e.target.value)} 
              />
            </label>
            <button type="button" onClick={() => removeActivity(activityIndex)}>Remove</button>

            {/* Relation Inputs */}
            <h5>Relations</h5>
            {activity.relations.map((relation, relationIndex) => (
              <div key={relationIndex}>
                <label>
                  Related Activity:
                  <input 
                    type="text" 
                    value={relation.relatedActivity} 
                    onChange={(e) => handleRelationChange(activityIndex, relationIndex, 'relatedActivity', e.target.value)} 
                  />
                </label>
                <label>
                  Type:
                  <select
                    value={relation.type}
                    onChange={(e) => handleRelationChange(activityIndex, relationIndex, 'type', e.target.value)}
                  >
                    {relationTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <button type="button" onClick={() => removeRelation(activityIndex, relationIndex)}>Remove Relation</button>
              </div>
            ))}
            <button type="button" onClick={() => addRelation(activityIndex)}>Add Relation</button>
          </div>
        ))}
        <button type="button" onClick={addActivity}>Add Activity</button>
        <input type="submit" value="Create Graph"/>
      </form>

      <h1 className="heading">Chatbot Example</h1>
      <h2 className="sub-heading">Create a graph from a message</h2>
      <h3>Remember to explicitly write what you want the title and roles to be.</h3>
      <input 
        type="text" 
        value={message} 
        onChange={e => setMessage(e.target.value)} 
        placeholder="Type your message..." 
      />
      <button onClick={handleCreateGraphFromMessage}>Send</button>
      {/*<div>
        <p>Bot's response:</p>
        <p>{response}</p>
      </div>*/}
    </div>
  );
}

export default CreateGraph;
