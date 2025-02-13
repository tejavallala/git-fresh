import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

const YourLands = () => {
  const { userId } = useParams();
  const [lands, setLands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserLands();
  }, [userId]);

  const fetchUserLands = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/landRoute/user-lands/${userId}`);
      setLands(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching lands:', error);
      setError('Failed to fetch your lands');
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="badge bg-success">
            <FaCheckCircle className="me-1" /> Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="badge bg-danger">
            <FaTimesCircle className="me-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="badge bg-warning">
            <FaClock className="me-1" /> Pending
          </span>
        );
    }
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
      <h2 className="mb-4">Your Lands</h2>
      {lands.length === 0 ? (
        <div className="alert alert-info">
          You haven't added any lands yet.
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
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title mb-0"><strong>Location : </strong>{land.location}</h5>
                    {getStatusBadge(land.verificationStatus)}
                  </div>
                  
                  <hr className="my-2" />

                  <div className="mb-3">
                    <p className="mb-1"><strong>Survey Number:</strong> {land.surveyNumber}</p>
                    <p className="mb-1"><strong>Area:</strong> {land.area} sq ft</p>
                    <p className="mb-1"><strong>Price:</strong> ₹{land.price.toLocaleString('en-IN')}</p>
                  </div>

                  {land.verificationComments && (
                    <div className="alert alert-info p-2 mb-2">
                      <small>
                        <strong>Inspector Comments:</strong><br />
                        {land.verificationComments}
                      </small>
                    </div>
                  )}

                  <hr className="my-2" />

                  <p className="text-muted mb-0">
                    <strong>Created On:</strong> {new Date(land.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YourLands;
