import React, { useState } from 'react';
import "../Login/login.css";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      navigate('/home');
    } catch (err) {
      console.error(err);
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
    <h2>LOGIN</h2>
    <input 
      type="email" 
      placeholder="Email" 
      value={email} 
      onChange={(e) => setEmail(e.target.value)} 
      required 
    />
    <input 
      type="password" 
      placeholder="Password" 
      value={password} 
      onChange={(e) => setPassword(e.target.value)} 
      required 
    />
    <button id="btn" type="submit">Login</button>
  
    <div style={{ marginTop: '10px' }}>
      <p>Don't have an account? <Link to="/signup" style={{ color: '#ff758c', textDecoration: 'none' }}>Sign up</Link></p>
    </div>
  </form>
  

  );
};

export default Login;