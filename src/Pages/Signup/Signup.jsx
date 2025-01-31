import React, { useState } from 'react';
import axios from 'axios';
import "../Signup/signup.css";
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', {
        username,
        email,
        password,
        role,
      });
      console.log(res.data); 
      localStorage.setItem('username', username); 
      localStorage.setItem('token', res.data.token);
      navigate('/login'); 
    } catch (err) {
      console.error(err); 
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Signup</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
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
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="buyer">Buyer</option>
        <option value="seller">Seller</option>
        <option value="both">Both</option>
      </select>
      <button id="btn" type="submit">Signup</button>

      <div style={{ marginTop: '10px' }}>
        <p>Already have an account? <Link to="/login" style={{ color: '#ff758c', textDecoration: 'none' }}>Login</Link></p>
      </div>
    </form>
  );
};

export default Signup;
