import React, { useState } from 'react';
import './App.css'; // Import the external CSS file

function App() {
  const [content, setContent] = useState('THIS IS THE CONTENT IN THE BEGINNING');
  const [fetchedData, setFetchedData] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [graphId, setGraphId] = useState('');
  const [role, setRole] = useState('');

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
    fetch(`http://localhost:5000/fetchData?username=${username}&password=${password}&graph_id=${graphId}&role=${role}`)
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

  const handleButtonClick = (label) => {
    alert(`Button clicked: ${label}`);
    // Here you can add any action you want to perform when the button is clicked
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

      <div>
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <input type="text" value={graphId} onChange={e => setGraphId(e.target.value)} placeholder="Graph ID" />
        <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="Role" />
        <button className="button" onClick={fetchFromServer}>
          Fetch data from server
        </button>
      </div>

      {/* Display fetched data */}
      <div>
        <h2>Fetched Data:</h2>
        {fetchedData.map((item, index) => (
          <button key={index} onClick={() => handleButtonClick(item)}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
