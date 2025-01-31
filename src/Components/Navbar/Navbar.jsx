import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';
import Logo from "../../assets/Logo.png";

const Navbar = () => {
  const username = localStorage.getItem('username');
  const [cartCount, setCartCount] = useState(0); 

  useEffect(() => {
    const updateCartCount = () => {
      const count = parseInt(localStorage.getItem('cartCount') || '0', 10);
      setCartCount(count);
    };
  
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);
  

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('cartCount');
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/home">
          <img src={Logo} alt="Pet Adoption" className="logo" />
        </Link>
      </div>

      <div className="nav-links">
        <Link to="/home" className="nav-item">Home</Link>
        <Link to="/pets" className="nav-item">Sell a Pet</Link>
        {/* <Link to="/your-pets" className="nav-item">My Pets</Link> */}
      </div>

      <div className="navbar-right">
        {username && <span className="username">Welcome, {username}</span>}
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
