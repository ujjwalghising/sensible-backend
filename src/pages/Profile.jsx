// Profile.jsx
import "./Profile.css";
import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../assets/default-avatar.png"; // Default profile image

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [updatedInfo, setUpdatedInfo] = useState({
    name: "",
    bio: "",
    profilePicture: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setUpdatedInfo({
          name: response.data.name,
          bio: response.data.bio,
          profilePicture: response.data.profilePicture || "",
        });
      } catch (error) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login", { state: { message: "Session expired. Please log in again." } });
        } else {
          setError("Failed to fetch profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login",{replace: true});
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/api/profile", updatedInfo, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ ...user, ...updatedInfo });
      setEditMode(false);
    } catch (error) {
      setError("Failed to update profile.");
    }
  };

  if (loading) return <div className="profile-container">Loading...</div>;
  if (error) return <div className="profile-container">{error}</div>;

  if (!user) return <div className="profile-container">User not found.</div>;

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <div className="profile-card">
      <div className="profile-picture">
  <img 
    src={updatedInfo.profilePicture || user.profilePicture || defaultAvatar} 
    alt="Profile" 
  />
  {editMode && (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setUpdatedInfo({ ...updatedInfo, profilePicture: reader.result });
          };
          reader.readAsDataURL(file);
        }
      }}
    />
  )}
</div>
        <div className="profile-details">
          <strong>Name:</strong>
          {editMode ? (
            <input
              type="text"
              value={updatedInfo.name}
              onChange={(e) =>
                setUpdatedInfo({ ...updatedInfo, name: e.target.value })
              }
            />
          ) : (
            user.name
          )}
          <br />
          <strong>Email:</strong> {user.email}
          <br />
          <strong>Age:</strong> {user.age}
          <br />
          <strong>Gender:</strong> {user.gender}
          <br />
          <strong>Bio:</strong>
          {editMode ? (
            <textarea
              value={updatedInfo.bio}
              onChange={(e) =>
                setUpdatedInfo({ ...updatedInfo, bio: e.target.value })
              }
            />
          ) : (
            user.bio
          )}
          <br />
        </div>
        <div className="profile-actions">
          {editMode ? (
            <div>
              <button onClick={handleUpdateProfile}>Save Changes</button>
              <button onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setEditMode(true)}>Edit Profile</button>
          )}
          <button onClick={handleLogout}>Log Out</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
