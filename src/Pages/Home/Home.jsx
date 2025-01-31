import React from 'react'
import "../Home/home.css";
import Navbar
 from '../../Components/Navbar/Navbar';
import PetList from '../../Components/PetList/PetList';

const Home = () => {
  return (
    <div className="home-container">
      <Navbar />
      <div className="home-content">
        <PetList />
      </div>
    </div>
  )
}

export default Home
