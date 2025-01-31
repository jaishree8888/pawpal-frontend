import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./adopt.css";
import Navbar from "../../Components/Navbar/Navbar";

// Manual JWT decoding function
const decodeJWT = (token) => {
  if (!token) return null;
  try {
    const [header, payload, signature] = token.split(".");
    const decodedPayload = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodedPayload);
  } catch (err) {
    console.error("Error decoding JWT:", err);
    return null;
  }
};

const Adopt = () => {
  const { id } = useParams();  // Get the pet ID from URL
  const [pet, setPet] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);  // Track loading state
  const [error, setError] = useState("");  // State for errors
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPetDetails = async () => {
      console.log("Fetching pet with ID:", id);  // Log the ID
      try {
        // Fetch pet details using the ID from the URL
        const res = await axios.get(`http://localhost:5000/api/pets/${id}`);
        setPet(res.data);  // Set pet data
        setLoading(false);  // Set loading to false after the data is fetched
      } catch (err) {
        console.error("Error fetching pet details:", err);
        setError("Could not fetch pet details.");
        setLoading(false);  // Set loading to false on error
      }
    };

    if (id) {  // Check if ID is available
      fetchPetDetails();
    }
  }, [id]);  // Dependency on the id from useParams

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        setUserId(decoded.id);
      }
    }
  }, []);

  const handleContactClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCallSeller = () => {
    if (pet && pet.sellerPhone) {
      window.location.href = `tel:${pet.sellerPhone}`;
    }
  };

  const handleAdoptionConfirm = async () => {
    if (pet && userId) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Unauthorized action!");
          return;
        }

        // Update pet as adopted in the database
        await axios.put(`http://localhost:5000/api/pets/adopt/${pet._id}`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });

        alert("You have successfully adopted the pet!");

        // Navigate back to the home page after adoption
        navigate("/home");
      } catch (err) {
        console.error("Error confirming adoption:", err);
        alert("Error adopting the pet.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="adopt-container">
        {loading ? (
          <p className="loading-text">Loading pet details...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : pet ? (
          <div className="adopt-card">
            {/* Pet Image Section */}
            <div className="pet-image-section">
              {pet.image ? (
                <img src={pet.image} alt={pet.name} className="pet-image" />
              ) : (
                <div className="no-image">No Image Available</div>
              )}
            </div>

            {/* Pet Information */}
            <div className="pet-info-section">
              <h2>{pet.name}</h2>
              <p><strong>Breed:</strong> {pet.breed}</p>
              <p><strong>Age:</strong> {pet.age} years</p>
              <p><strong>Description:</strong> {pet.description}</p>

              {/* Seller Information */}
              <div className="seller-info">
                <h3>Seller Information</h3>
                <p><strong>Name:</strong> {pet.sellerName || "Not available"}</p>
                <p><strong>Phone:</strong> {pet.sellerPhone || "Not available"}</p>
                <div className="buttons-container">
                  <button className="contact-button" onClick={handleContactClick}>Contact Seller</button>
                  <button className="contact-button" onClick={handleAdoptionConfirm}>
                    {pet.isAdopted ? "Already Adopted" : "Confirm Adoption"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="loading-text">Pet not found</p>
        )}
      </div>

      {isModalOpen && pet && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Contact Seller</h3>
            <p><strong>Name:</strong> {pet.sellerName}</p>
            <p><strong>Phone:</strong> {pet.sellerPhone}</p>
            <button className="call-button" onClick={handleCallSeller}>Call Seller</button>
            <button className="close-button" onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Adopt;
