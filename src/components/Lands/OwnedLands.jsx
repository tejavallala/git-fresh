import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaMapMarkerAlt, FaFileAlt } from 'react-icons/fa';
import '../CSS/OwnedLands.css';

const OwnedLands = () => {
  const userId = sessionStorage.getItem('userId'); // Get userId from session storage
  const [lands, setLands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchOwnedLands();
    }
  }, [userId]);

  const fetchOwnedLands = async () => {
    try {
      const response = await axios.get(`https://git-back-k93u.onrender.com/landRoute/owned-lands/${userId}`);
      
      // Enhanced debug logging
      console.log('Owned lands response:', JSON.stringify(response.data, null, 2));
      if (response.data.length > 0) {
        console.log('First land previous owner:', {
          previousOwner: response.data[0]?.previousOwner,
          userId: response.data[0]?.userId
        });
      }
      
      setLands(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching owned lands:', error);
      setError('Failed to fetch your owned lands');
      setIsLoading(false);
    }
  };

  // Add this helper function at the top of your component
  const getPreviousOwnerDetails = (land) => {
    // Try to get details from previousOwner first, fall back to userId
    const owner = land.previousOwner || land.userId;
    return {
      name: owner?.name || 'Not available',
      email: owner?.email || 'Not available',
      phone: owner?.phoneNumber || 'Not available'
    };
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Your Owned Lands</h2>
      {lands.length === 0 ? (
        <div className="alert alert-info">
          You don't own any lands yet.
        </div>
      ) : (
        <div className="row g-4">
          {lands.map((land) => (
            <div key={land._id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                {land.landImages && land.landImages[0] && (
                  <img
                    src={`data:${land.landImages[0].contentType};base64,${land.landImages[0].data}`}
                    className="card-img-top"
                    alt="Land"
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">
                      <FaMapMarkerAlt className="me-2 text-primary" />
                      {land.location}
                    </h5>
                    <span className="badge bg-success">
                      <FaCheckCircle className="me-1" />
                      Owned
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="mb-1"><strong>Survey Number:</strong> {land.surveyNumber}</p>
                    <p className="mb-1"><strong>Area:</strong> {land.area} sq ft</p>
                    
                    {/* Previous Owner Details Section */}
                    <div className="border-start ps-2 my-3">
                      <h6 className="text-muted mb-2">Previous Owner Details</h6>
                      {land.userId ? (
                        <>
                          <div className="previous-owner-details">
                            <p className="mb-1">
                              <strong>Name:</strong> {getPreviousOwnerDetails(land).name}
                            </p>
                            <p className="mb-1">
                              <strong>Email:</strong> {getPreviousOwnerDetails(land).email}
                            </p>
                            <p className="mb-1">
                              <strong>Phone:</strong> {getPreviousOwnerDetails(land).phone}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="alert alert-warning p-2 mb-0">
                          <small>Previous owner details not available</small>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="alert alert-info p-2 mb-3">
                    <small>
                      <FaFileAlt className="me-2" />
                      <strong>Transfer Date:</strong>{' '}
                      {land.lastTransactionDate 
                        ? new Date(land.lastTransactionDate).toLocaleString('en-IN')
                        : 'Not available'
                      }
                    </small>
                  </div>

                  {land.lastTransactionHash && (
                    <button 
                      className="btn btn-outline-primary btn-sm w-100"
                      onClick={() => window.open(`https://sepolia.etherscan.io/tx/${land.lastTransactionHash}`, '_blank')}
                    >
                      View Transaction Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnedLands;