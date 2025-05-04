import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTimes } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Spinner } from 'react-bootstrap';

function VerifyLand() {
  const [lands, setLands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingLands = async () => {
    try {
      const response = await axios.get("http://localhost:4000/landRoute/pending-lands");
      setLands(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching pending lands:", error);
      setError("Failed to fetch pending lands");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLands();
  }, []);

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <div className="custom-spinner-container">
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading verify Land page...</p>
        </div>
      </Container>
    );
  }

  const handleVerification = async (landId, status, comments) => {
    try {
      await axios.post(`http://localhost:4000/landRoute/verify-land/${landId}`, {
        status,
        comments,
        inspectorId: sessionStorage.getItem("userId")
      });
      fetchPendingLands(); // Refresh the list
    } catch (error) {
      console.error("Error verifying land:", error);
      alert("Failed to verify land");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Verify Land Listings</h2>
      {lands.length === 0 ? (
        <div className="alert alert-info">No pending land verifications</div>
      ) : (
        <div className="row g-4">
          {lands.map((land) => (
            <div key={land._id} className="col-md-6 col-lg-4">
              <div className="card h-100">
                {land.landImages && land.landImages[0] && (
                  <img
                    src={`data:${land.landImages[0].contentType};base64,${land.landImages[0].data}`}
                    className="card-img-top"
                    alt="Land"
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{land.location}</h5>
                  <div className="mb-3">
                    <p className="mb-1"><strong>Owner:</strong> {land.name}</p>
                    <p className="mb-1"><strong>Survey Number:</strong> {land.surveyNumber}</p>
                    <p className="mb-1"><strong>Area:</strong> {land.area} sq ft</p>
                    <p className="mb-1"><strong>Price:</strong> ₹{land.price.toLocaleString("en-IN")}</p>
                  </div>

                  <div className="verification-actions">
                    <textarea
                      className="form-control mb-2"
                      placeholder="Add verification comments..."
                      id={`comments-${land._id}`}
                    />
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success flex-grow-1"
                        onClick={() => {
                          const comments = document.getElementById(`comments-${land._id}`).value;
                          handleVerification(land._id, "approved", comments);
                        }}
                      >
                        <FaCheck className="me-1" /> Approve
                      </button>
                      <button
                        className="btn btn-danger flex-grow-1"
                        onClick={() => {
                          const comments = document.getElementById(`comments-${land._id}`).value;
                          handleVerification(land._id, "rejected", comments);
                        }}
                      >
                        <FaTimes className="me-1" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VerifyLand;