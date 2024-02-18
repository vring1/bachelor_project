import React, { useState } from 'react';
import './App.css'; // Import the external CSS file

function App() {
  const [content, setContent] = useState('THIS IS THE CONTENT IN THE BEGINNING');
  const [fetchedData, setFetchedData] = useState([]);

  const changeContent = () => {
    setContent('New Content!');
  };

  const changeContentBack = () => {
    setContent('THIS IS THE CONTENT IN THE BEGINNING');
  };

  const openNewWindow = () => {
    window.open('https://www.google.com');
  };

  const fetchFromServer = () => {
    fetch('http://localhost:5000/fetchData') // Sending a GET request to the server
      .then(response => response.json())
      .then(data => {
        console.log(data); // Add this line to inspect the fetched data in the console
        setFetchedData(data.labels); // Update state with fetched data from the server
      })
      .catch(error => console.error(error));
  };

  const handleDoubleClick = () => {
    alert("Button DOUBLE-clicked!");
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

      <button className="button" onClick={fetchFromServer}>
        Fetch data from server
      </button>

      {/* Display fetched data */}
      <div>
        <h2>Fetched Data:</h2>
        <ul>
          {fetchedData.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
