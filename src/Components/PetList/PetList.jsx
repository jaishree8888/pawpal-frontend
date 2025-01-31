import React, { useEffect, useState } from "react";
import axios from "axios";
import "./petlist.css";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const decodeJWT = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split(" ")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Error decoding JWT:", err);
    return null;
  }
};

const PetList = () => {
  const [pets, setPets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPets, setFilteredPets] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(null); // Track which pet is being edited
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        setUserId(decoded.id);
      }
    }
  }, []);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await axios.get("https://pawpal-backend-06o7.onrender.com/api/pets");
        setPets(res.data);
        setFilteredPets(res.data);
      } catch (err) {
        console.error("Error fetching pets:", err);
      }
    };
    fetchPets();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredPets(
        pets.filter(
          (pet) =>
            pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pet.age.toString().includes(searchTerm)
        )
      );
    } else {
      setFilteredPets(pets);
    }
  }, [searchTerm, pets]);

  const handleUpdate = (pet) => {
    setIsEditing(pet._id);
  };

  const handleSaveUpdate = async (pet) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Unauthorized action!");
        return;
      }

      const updatedPet = new FormData();
      updatedPet.append("name", pet.name);
      updatedPet.append("breed", pet.breed);
      updatedPet.append("age", pet.age);
      updatedPet.append("description", pet.description);
      updatedPet.append("sellerName", pet.sellerName);
      updatedPet.append("sellerPhone", pet.sellerPhone);
      if (pet.image) {
        updatedPet.append("image", pet.image);
      }

      await axios.put(`https://pawpal-backend-06o7.onrender.com/api/pets/${pet._id}`, updatedPet, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setPets((prevPets) =>
        prevPets.map((p) => (p._id === pet._id ? { ...p, ...pet } : p))
      );
      setFilteredPets((prevPets) =>
        prevPets.map((p) => (p._id === pet._id ? { ...p, ...pet } : p))
      );

      setIsEditing(null);
    } catch (err) {
      console.error("Error updating pet:", err);
    }
  };

  const handleDelete = async (pet) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Unauthorized action!");
        return;
      }

      await axios.delete(`https://pawpal-backend-06o7.onrender.com/api/pets/${pet._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPets((prevPets) => prevPets.filter((p) => p._id !== pet._id));
      setFilteredPets((prevPets) => prevPets.filter((p) => p._id !== pet._id));
    } catch (err) {
      console.error("Error deleting pet:", err);
    }
  };

  const handleAdopt = (pet) => {
    if (pet.isAdopted) return;
    pet.isAdopted = true;
    setPets((prevPets) =>
      prevPets.map((p) => (p._id === pet._id ? { ...p, isAdopted: true } : p))
    );
    setFilteredPets((prevPets) =>
      prevPets.map((p) => (p._id === pet._id ? { ...p, isAdopted: true } : p))
    );
    localStorage.setItem("adoptedPets", JSON.stringify([...JSON.parse(localStorage.getItem("adoptedPets") || "[]"), pet]));
    navigate(`/adopt/${pet._id}`);
  };

  return (
    <div className="pet-container">
      <h2>Available Pets</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, breed, age or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <span className="search-icon">
          <FaSearch />
        </span>
      </div>
      <div className="pet-list">
        {filteredPets.length > 0 ? (
          filteredPets.map((pet) => (
            <div key={pet._id} className="pet-card">
              {isEditing === pet._id ? (
                <div className="edit-form">
                  <button
                    className="back-btn"
                    onClick={() => setIsEditing(null)}
                  >
                    Back
                  </button>
                  <input
                    type="text"
                    value={pet.name}
                    onChange={(e) =>
                      setPets((prevPets) =>
                        prevPets.map((p) =>
                          p._id === pet._id ? { ...p, name: e.target.value } : p
                        )
                      )
                    }
                  />
                  <input
                    type="text"
                    value={pet.breed}
                    onChange={(e) =>
                      setPets((prevPets) =>
                        prevPets.map((p) =>
                          p._id === pet._id ? { ...p, breed: e.target.value } : p
                        )
                      )
                    }
                  />
                  <textarea
                    value={pet.description}
                    onChange={(e) =>
                      setPets((prevPets) =>
                        prevPets.map((p) =>
                          p._id === pet._id
                            ? { ...p, description: e.target.value }
                            : p
                        )
                      )
                    }
                  />
                  <input
                    type="file"
                    onChange={(e) => {
                      const updatedPet = { ...pet, image: e.target.files[0] };
                      setPets((prevPets) =>
                        prevPets.map((p) =>
                          p._id === pet._id ? updatedPet : p
                        )
                      );
                    }}
                  />
                  <button onClick={() => handleSaveUpdate(pet)}>Save</button>
                </div>
              ) : (
                <div>
                  <h3>{pet.name}</h3>
                  {pet.image && (
                    <img src={pet.image} alt={pet.name} className="pet-image" />
                  )}
                  <p>
                    <strong>Breed:</strong> {pet.breed}
                  </p>
                  <p>
                    <strong>Age:</strong> {pet.age} years
                  </p>
                  <p>
                    <strong>Description:</strong> {pet.description}
                  </p>
                  <p className="seller-info">
                    <strong>Seller:</strong> <span id="name">{pet.sellerName || "Not available"}</span>
                  </p>

                  <div className="seller-actions">
                    <button
                      className="update-btn"
                      onClick={() => handleUpdate(pet)}
                    >
                      <FaEdit /> Update
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(pet)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>

                  {!pet.isAdopted && (
                    <button
                      className="adopt-btn"
                      onClick={() => handleAdopt(pet)}
                    >
                      Adopt
                    </button>
                  )}
                  {pet.isAdopted && <p className="adopted">Adopted</p>}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No pets match your search criteria.</p>
        )}
      </div>
    </div>
  );
};

export default PetList;
