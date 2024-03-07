import React from 'react';

const fetchFromServer = (id, setFetchedData, setGraphId) => {
  //fetch(`http://localhost:5000/fetchData?username=${username}&password=${password}&graph_id=${id}&role=${role}`)
  fetch(`http://localhost:5000/fetchData?graph_id=${id}`)
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
const fetchGraphs = (setErrorMessage, setFetchedGraphs) => {
  //fetch(`http://localhost:5000/fetchGraphs?username=${username}&password=${password}`)
  fetch(`http://localhost:5000/fetchGraphsAfterLogin`)
    .then(response => response.json())
    .then(data => {
      //console.log(data); // Add this line to inspect the fetched data in the console
      // Assuming data is an array and each item in the array has a 'label' property
      if (data === null) {
        setErrorMessage('You are not logged in (TODO: maybe send you to login page)'); // Set appropriate error message
      } else if (data.graphs) {
        setFetchedGraphs(data.graphs); // Update state with fetched labels from the server
      } else {
        setErrorMessage('No graphs found for this user.'); // Set appropriate error message
      }
      //console.log(data.graphs);
    })
    .catch(error => console.error(error));
}
const performEvent = (event_id, setFetchedData) => {
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

const clearEvents = (setFetchedData) => {
  // Reset the fetched data to an empty array
  setFetchedData([]);
  // Perform any other cleanup or reset tasks as needed
  // For example, you might want to reset other state variables or perform additional actions
};
export { fetchFromServer, fetchGraphs, performEvent, clearEvents };