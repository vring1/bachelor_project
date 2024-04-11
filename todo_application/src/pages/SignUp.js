import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Button, TextField, Select, MenuItem, Grid, Typography, List, ListItem } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State to store error message
  const navigate = useNavigate(); // Get navigate function

  const fetchGraphs = (e) => {
    e.preventDefault(); // Prevent default form submission
    fetch(`http://localhost:5000/testIfUserExistsInDcrAndAddToDatabase?username=${username}&password=${password}`)//&role=${role}`)
      .then(response => response.json())
      .then(data => {
        if (data === null) {
          setErrorMessage('User does not exist or password is wrong. Use same login details as on dcrgraphs.net'); // Set appropriate error message
        } else if (data.graphs) {
          navigate('/'); // Redirect to / upon successful registration
        } 
        else {
          setErrorMessage('User does not exist or password is wrong. Use same login details as on dcrgraphs.net'); // Set appropriate error message
        }
        setUsername(''); // Clear username
        setPassword(''); // Clear password
      })
      .catch(error => {
        console.error(error);
        setErrorMessage('An error occurred. Please try again later.'); // Set error message
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
        <form onSubmit={fetchGraphs} style={{ width: '300px' }}>
          
          <Typography variant="body1" paragraph>
            Please sign up using your DCR credentials (email and password).
          </Typography>
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
            <Typography variant="body1" style={{ color: 'red', marginTop: '10px' }}>
              {errorMessage}
            </Typography>
          )}
          <Typography variant="body1" style={{ marginTop: '10px' }}>
            Already have an account? <Link to="/">Login</Link>
          </Typography>
        </form>
      </div>
    </ThemeProvider>
  );
}

export default SignUp;