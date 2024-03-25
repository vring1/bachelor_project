import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'; // Import the external CSS file
import Login from './pages/Login';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import CreateGraph from './pages/CreateGraph';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/creategraph" element={<CreateGraph />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
