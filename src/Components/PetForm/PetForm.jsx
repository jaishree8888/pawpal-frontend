import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../PetForm/petform.css";
import Navbar from '../Navbar/Navbar';

const PetForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    description: '',
    image: null,
    sellerName: '',
    sellerPhone: '',
  });

  const [userId, setUserId] = useState(null);  // Store userId

  const navigate = useNavigate();

  // Decode JWT Token Function
  const decodeJWT = (token) => {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token');
    }
    const payload = parts[1];
    const padding = '='.repeat((4 - (payload.length % 4)) % 4);
    const base64 = (payload + padding).replace('-', '+').replace('_', '/');
    const decodedPayload = JSON.parse(atob(base64));
    return decodedPayload;
  };

  // Get userId from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = decodeJWT(token);
      setUserId(decodedToken?.id || '');  // Set userId from decoded token
      setFormData((prevState) => ({
        ...prevState,
        sellerName: decodedToken?.username || '', 
      }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) {
      alert('Please upload an image for the pet.');
      return;
    }

    if (!formData.name || !formData.breed || !formData.age || !formData.description || !formData.sellerName || !formData.sellerPhone) {
      alert('Please fill out all the fields.');
      return;
    }

    const token = localStorage.getItem('token');
    const decoded = decodeJWT(token);
    const userId = decoded?.id;

    const data = new FormData();
    data.append('name', formData.name);
    data.append('breed', formData.breed);
    data.append('age', formData.age);
    data.append('description', formData.description);
    data.append('image', formData.image);
    data.append('sellerName', formData.sellerName);
    data.append('sellerPhone', formData.sellerPhone);
    data.append('userId', userId);  // Attach userId

    try {
      const response = await axios.post('http://localhost:5000/api/pets', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Pet added successfully!');
      setFormData({ name: '', breed: '', age: '', description: '', image: null, sellerName: '', sellerPhone: '' });
      navigate('/home');
    } catch (err) {
      console.error(err);
      alert('An error occurred while adding the pet. Please try again.');
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  return (
    <>
    <Navbar />
    <form onSubmit={handleSubmit} className="pet-form">
      <h2>Sell a Pet</h2>
      <input
        type="text"
        name="name"
        placeholder="Pet Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="breed"
        placeholder="Breed"
        value={formData.breed}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="age"
        placeholder="Age"
        value={formData.age}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="sellerName"
        placeholder="Seller Name"
        value={formData.sellerName}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="sellerPhone"
        placeholder="Seller PhoneNumber"
        value={formData.sellerPhone}
        onChange={handleChange}
        required
      />
      <input
        type="file"
        name="image"
        accept="image/*"
        onChange={handleChange}
        required
      />
      <button type="submit">Add Pet</button>
    </form>
    </>
  );
};

export default PetForm;
