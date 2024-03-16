import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(''); // State for role
  const [errorMessage, setErrorMessage] = useState(''); // State to store error message
  const navigate = useNavigate(); // Get navigate function


  const redirectToHome = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/testIfUserExistsInDatabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      //credentials: 'include',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data === null) {
          setErrorMessage('User does not exist or password is wrong. Use same login details as on dcrgraphs.net');
        } else if (data) {
          document.cookie = `session_token=${data.session_token};path=/`;
          console.log('session_token:', data.session_token);
          navigate('/home');
        } else {
          setErrorMessage('User does not exist or password is wrong. Use same login details as on dcrgraphs.net');
        }
        setUsername('');
        setPassword('');
      })
      .catch(error => {
        console.error(error);
        setErrorMessage('An error occurred. Please try again later.');
      });
  }

  return (
    <div>
      <h2>Login</h2>
      {/* Your login form */}
      <form onSubmit={redirectToHome}>
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
        {/*<label>
          Role:
          <input type="text" name="role" value={role} onChange={(e) => setRole(e.target.value)} />
        </label>
  <br /> */}
        <input type="submit" value="Submit" />
      </form>

      {/* Render error message if fetch attempt fails */}
      {errorMessage && (
        <div>
          <p>{errorMessage}</p>
        </div>
      )}


      <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
    </div>
  );
}

export default Login;
