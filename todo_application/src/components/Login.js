import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(''); // State for role
  const [errorMessage, setErrorMessage] = useState(''); // State to store error message
  const navigate = useNavigate(); // Get navigate function

  const fetchGraphs = (e) => {
    e.preventDefault(); // Prevent default form submission
    fetch(`http://localhost:5000/testIfUserExistsInDcrAndAddToDatabase?username=${username}&password=${password}&role=${role}`)
      .then(response => response.json())
      .then(data => {
        if (data === null) {
          setErrorMessage('User does not exist or password is wrong. Use same login details as on dcrgraphs.net'); // Set appropriate error message
        } else if (data.graphs) {
          navigate('/home'); // Redirect to /home upon successful login
        } 
        else {
          setErrorMessage('User does not exist or password is wrong. Use same login details as on dcrgraphs.net'); // Set appropriate error message
        }
      })
      .catch(error => {
        console.error(error);
        setErrorMessage('An error occurred. Please try again later.'); // Set error message
      });
  }

  return (
    <div>
      <h2>Login</h2>
      {/* Your login form */}
      <form onSubmit={fetchGraphs}>
        <label>
          Username:
          <input type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <br />
        <label>
          Password:
          <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <br />
        <label>
          Role:
          <input type="text" name="role" value={role} onChange={(e) => setRole(e.target.value)} />
        </label>
        <br />
        <input type="submit" value="Submit" />
      </form>

      {/* Render error message if fetch attempt fails */}
      {errorMessage && (
        <div>
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
}

export default Login;
