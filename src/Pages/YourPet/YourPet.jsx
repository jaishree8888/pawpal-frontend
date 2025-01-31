import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";

// Decode JWT to extract user information
const decodeJWT = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Error decoding JWT:", err);
    return null;
  }
};

const YourPet = () => {
  const [userPets, setUserPets] = useState([]);
  const [editingPetId, setEditingPetId] = useState(null);
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [description, setDescription] = useState("");
  const [age, setAge] = useState("");
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  // Decode the JWT token to get the userId
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        setUserId(decoded.id);  // Get userId from the JWT token
      }
    }
  }, []);

  // Fetch pets only for the logged-in user
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/pets");
        // Filter pets by userId
        const petsByUser = res.data.filter((pet) => pet.seller === userId);  // Match the pet seller with the logged-in userId
        setUserPets(petsByUser);
      } catch (err) {
        console.error("Error fetching pets:", err);
      }
    };
    if (userId) fetchPets();  // Fetch pets only when userId is available
  }, [userId]);

  // Handle pet edit logic
  const handleEdit = (pet) => {
    if (pet.seller !== userId) {
      alert("You are not authorized to edit this pet!");
      return;
    }
    setEditingPetId(pet._id);
    setName(pet.name);
    setBreed(pet.breed);
    setDescription(pet.description);
    setAge(pet.age);
  };

  // Handle pet deletion
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Unauthorized action!");
        return;
      }

      // Confirm the pet belongs to the logged-in user before deletion
      const petToDelete = userPets.find(pet => pet._id === id);
      if (petToDelete && petToDelete.seller !== userId) {
        alert("You are not authorized to delete this pet!");
        return;
      }

      await axios.delete(`http://localhost:5000/api/pets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Pet deleted successfully!");
      setUserPets((prevPets) => prevPets.filter((pet) => pet._id !== id));
    } catch (err) {
      console.error("Error deleting pet:", err);
    }
  };

  const handleSaveUpdate = async (id) => {
    try {
      const updatedPet = {
        name,
        breed,
        description,
        age,
      };

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Unauthorized action!");
        return;
      }

      await axios.put(`http://localhost:5000/api/pets/${id}`, updatedPet, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update pet list after saving changes
      setUserPets((prevPets) =>
        prevPets.map((pet) =>
          pet._id === id ? { ...pet, ...updatedPet } : pet
        )
      );
      setEditingPetId(null);
    } catch (err) {
      console.error("Error saving update:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="your-pets-container">
        <h2>Your Pets</h2>
        <div className="pet-list">
          {userPets.length > 0 ? (
            userPets.map((pet) => (
              <div key={pet._id} className="pet-card">
                {editingPetId === pet._id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      placeholder="Pet Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Breed"
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                    />
                    <textarea
                      placeholder="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                    <button onClick={() => handleSaveUpdate(pet._id)}>Save Changes</button>
                    <button onClick={() => setEditingPetId(null)}>Cancel</button>
                  </div>
                ) : (
                  <div className="pet-card-details">
                    <h3>{pet.name}</h3>
                    {pet.image && <img src={pet.image} alt={pet.name} className="pet-image" />}
                    <p><strong>Breed:</strong> {pet.breed}</p>
                    <p><strong>Age:</strong> {pet.age} years</p>
                    <p><strong>Description:</strong> {pet.description}</p>
                    <div className="seller-actions">
                      <button className="update-btn" onClick={() => handleEdit(pet)}>
                        <FaEdit /> Update
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(pet._id)}>
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>You have no pets to manage.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default YourPet;
