import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const SellerProfile = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [showImage, setShowImage] = useState(false); // State to toggle image visibility

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("Fetching data for userId:", userId); // Debug userId
        const response = await axios.get(`http://localhost:4000/sellerRouter/get-user/${userId}`);
        console.log("API Response:", response.data); // Debug response
        if (response.data) {
          setUserData(response.data);
        } else {
          setError("No user data found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Error fetching user data. Please try again.");
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!userData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white">
          <h3 className="card-title">Seller Profile</h3>
        </div>
        <div className="card-body">
          <div className="row">
            {/* Left Column */}
            <div className="col-md-6">
              <div className="mb-4">
                <label className="form-label"><strong>Name:</strong></label>
                <p className="form-control-static">{userData.name}</p>
              </div>
              <div className="mb-4">
                <label className="form-label"><strong>Email:</strong></label>
                <p className="form-control-static">{userData.email}</p>
              </div>
              <div className="mb-4">
                <label className="form-label"><strong>Address:</strong></label>
                <p className="form-control-static">{userData.location || "Address not available"}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-md-6">
              <div className="mb-4">
                <label className="form-label"><strong>Phone Number:</strong></label>
                <p className="form-control-static">{userData.phoneNumber || "Not provided"}</p>
              </div>
              <div className="mb-4">
                <label className="form-label"><strong>Government ID:</strong></label>
                <p className="form-control-static">{userData.governmentId || "Not provided"}</p>
              </div>
              <div className="mb-4">
                <label className="form-label"><strong>Government ID Image:</strong></label>
                {userData.governmentIdImage && userData.governmentIdImage.data ? (
                  <div
                    className="image-container"
                    style={{
                      border: "2px solid #ddd",
                      borderRadius: "8px",
                      padding: "10px",
                      cursor: "pointer",
                      textAlign: "center",
                      backgroundColor: "#f9f9f9",
                      transition: "all 0.3s ease",
                      overflow: "hidden",
                    }}
                    onClick={() => setShowImage(!showImage)}
                  >
                    {showImage ? (
                      <img
                        src={`data:${userData.governmentIdImage.contentType};base64,${userData.governmentIdImage.data}`}
                        alt="Government ID"
                        className="img-fluid rounded"
                        style={{
                          maxWidth: "100%",
                          height: "auto",
                          transition: "all 0.3s ease",
                        }}
                      />
                    ) : (
                      <p className="mb-0" style={{ color: "#007bff", fontWeight: "500" }}>
                        Click to view Government ID Image
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="form-control-static">No image available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;