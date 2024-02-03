import React, { useState } from 'react';
import './App.css'; // Import the external CSS file

function App() {
  const [content, setContent] = useState('THIS IS THE CONTENT IN THE BEGINNING');
  const [apiLink, setApiLink] = useState('');

  const changeContent = () => {
    setContent('New Content!');
  };

  const changeContentBack = () => {
    setContent('THIS IS THE CONTENT IN THE BEGINNING');
  };

  const openNewWindow = () => {
    window.open('https://www.google.com');
  };

  const fetchDataFromAPILink = () => {
    const linkToFetch = apiLink.trim() !== '' ? apiLink : 'https://api.publicapis.org/entries';

    fetch(linkToFetch)
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error(error));
  };

  const handleDoubleClick = () => {
    alert("Button DOUBLE-clicked!");
  }

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

      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          fetchDataFromAPILink();
        }}
      >
        <input
          type="text"
          id="api_link"
          placeholder="Enter an API link to fetch"
          value={apiLink}
          onChange={(e) => setApiLink(e.target.value)}
          className="input"
        />
        <input type="submit" value="Submit" className="submitButton" />
      </form>
    </div>
  );
}

export default App;
