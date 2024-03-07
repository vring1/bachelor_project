export const sendMessage = (message, setResponse) => {
    fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: message })
    })
    .then(response => response.json())
    .then(data => {
      setResponse(data.response);
    })
    .catch(error => console.error(error));
  };
  
export const sendMessageFromButton = (msg, setResponse) => {
  fetch('http://localhost:5000/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: msg })
  })
  .then(response => response.json())
  .then(data => {
    setResponse(data.response);
  })
  .catch(error => console.error(error));
};
  