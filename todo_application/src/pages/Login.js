import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { Button, TextField, Select, MenuItem, Grid, Typography, List, ListItem } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

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
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data === null) {
          setErrorMessage('User does not exist or password is wrong. Use same login details as on dcrgraphs.net.');
        } else if (data) {
          sessionStorage.setItem('session_token', data.session_token);
          console.log('session_token:', data.session_token);
          navigate('/home');
        } else {
          setErrorMessage('User does not exist or password is wrong. Use same login details as on dcrgraphs.net.');
        }
        setUsername('');
        setPassword('');
      })
      .catch(error => {
        console.error(error);
        setErrorMessage('An error occurred. Please try again later.');
      });
  }
  const theme = createTheme({
    palette: {
      mode: 'dark', // Dark grey color
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        {/* Centered login form */}
        <form onSubmit={redirectToHome} style={{ width: '300px' }}>
          <TextField
            label="Username"
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
            fullWidth
            style={{ marginBottom: '10px' }}
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            fullWidth
            style={{ marginBottom: '10px' }}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Submit
          </Button>

          {errorMessage && (
            <div style={{ marginBottom: '10px' }}>
              <br />
              <Typography variant="body1" style={{ color: 'red' }}>
                {errorMessage}
              </Typography>
            </div>
          )}

          <Typography variant="body1" style={{ marginTop: '10px' }}>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </Typography>
        </form>
      </div>
    </ThemeProvider>
  );
}

export default Login;
