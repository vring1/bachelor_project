import React, { useState } from 'react';

// Functional component for the main App
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


  document.getElementById("change_content_button").addEventListener("dblclick", function() {
    alert("Button DOUBLE-clicked!");
  });

  return (
    <div>
      <h1>JS Example</h1>
      <p id="demo">{content}</p>
      <button id="change_content_button" onClick={changeContent}>
        Change content
      </button>
      <button onClick={changeContentBack}>Change content back</button>
      <button onClick={openNewWindow}>Open new window</button>

      <form
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
        />
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}

export default App;
