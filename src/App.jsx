import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Pages/Login/Login';
import Home from './Pages/Home/Home';
import Signup from './Pages/Signup/Signup';
import Pet from './Pages/Pets/Pet';
import Adopt from './Pages/Adopt/Adopt';
import YourPet from './Pages/YourPet/YourPet';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/pets" element={<Pet />} />
        <Route path="/adopt/:id" element={<Adopt />} /> 
      </Routes>
    </Router>
  );
};

export default App;
