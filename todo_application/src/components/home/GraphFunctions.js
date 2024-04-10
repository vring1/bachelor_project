import React from 'react';


const fetchFromServer = (id, setFetchedData, title) => {
  console.log("Document cookie: ", document.cookie);
  fetch(`http://localhost:5000/fetchData?graph_id=${id}&title=${title}`, {
    method: 'GET',
    credentials: 'include', 
    headers: {
      'Content-Type': 'application/json',
      'Authorization' : `Bearer ${sessionStorage.getItem('session_token')}`
    },
  })
    .then(response => response.json())
    .then(data => {
      console.log(data); 
      setFetchedData(data.labels);
      console.log(data.labels);
    })
    .catch(error => console.error(error));  
};


const fetchGraphs = (setFetchedGraphs) => {
  console.log("Document cookie: ", document.cookie);
  fetch(`http://localhost:5000/fetchGraphsAfterLogin` , {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization' : `Bearer ${sessionStorage.getItem('session_token')}`
    },
  })
    .then(response => response.json())
    .then(data => {
      if (data === null) {
        console.log('You are not logged in (TODO: maybe send you to login page)'); 
      } else if (data.graphs) {
        setFetchedGraphs(data.graphs); 
      } else {
        console.log('No graphs found for this user.'); 
      }
    })
    .catch(error => console.error(error));
}


const performEvent = (event_id, setFetchedData) => {
  console.log("Document cookie: ", document.cookie);
  fetch('http://localhost:5000/performEvent', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization' : `Bearer ${sessionStorage.getItem('session_token')}`
    },
    body: JSON.stringify({ event_id: event_id })
  })
  .then(response => response.json())
  .then(data => {
    console.log(data); 
    setFetchedData(data.labels);
  })
  .catch(error => console.error(error));
};

const clearEvents = (setFetchedData) => {
  setFetchedData([]);
};


export { fetchFromServer, fetchGraphs, performEvent, clearEvents };