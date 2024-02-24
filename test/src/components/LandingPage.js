import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const [user, setUser] = useState(null); // Set user state to null
  const navigate = useNavigate(); // Get navigate function

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/@me', {
          method: 'GET',
          credentials: 'include', // Include cookies in the request
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log(response);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData(); // Call fetchData function when component mounts
  }, []); // Empty dependency array ensures that this effect runs only once after initial render

  function navigateToLogin() {
    navigate('/login'); // Navigate to /login
  }

  function navigateToRegister() {
    navigate('/register'); // Navigate to /register
  }

  return (
    <div>
      <h1>Welcome to the landing page</h1>
      <br />
      {user ? (
        <div>
          <p>You are logged in as: {user.email}</p>
          {/* Render additional user information as needed */}
        </div>
      ) : (
        <div>
          <p>You are not logged in</p>
          <br />
          <p>Please login or register</p>
          <div className='buttons'>
            <button onClick={navigateToLogin}>Login</button>
            <button onClick={navigateToRegister}>Register</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
