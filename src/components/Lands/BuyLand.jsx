import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaClock, FaShoppingCart } from 'react-icons/fa';

function BuyLand() {
  const [lands, setLands] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'verified', 'unverified'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllLands();
  }, []);

  const fetchAllLands = async () => {
    try {
      const response = await axios.get('https://git-back-k93u.onrender.com/landRoute/available-lands');
      // Filter out only rejected lands
      const availableLands = response.data.filter(land => 
        land.verificationStatus !== 'rejected'
      );
      console.log('Available lands:', availableLands); // Add this for debugging
      setLands(availableLands);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching lands:', error);
      setError('Failed to fetch lands');
      setIsLoading(false);
    }
  };

  const handleBuyRequest = async (landId) => {
    try {
      const buyerId = sessionStorage.getItem('userId');
      const response = await axios.post(`https://git-back-k93u.onrender.com/landRoute/buy-request/${landId}`, {
        buyerId,
        requestDate: new Date()
      });
      alert('Buy request sent successfully!');
    } catch (error) {
      console.error('Error sending buy request:', error);
      alert('Failed to send buy request');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge bg-success"><FaCheckCircle className="me-1" /> Verified</span>;
      case 'rejected':
        return <span className="badge bg-danger"><FaTimesCircle className="me-1" /> Rejected</span>;
      default:
        return <span className="badge bg-warning"><FaClock className="me-1" /> Pending Verification</span>;
    }
  };

  // Update the filteredLands logic
  const filteredLands = lands.filter(land => {
    switch (filter) {
      case 'verified':
        return land.verificationStatus === 'approved';
      case 'unverified':
        return land.verificationStatus === 'pending' || !land.verificationStatus;
      default: // 'all'
        return true;
    }
  });

  if (isLoading) return <div className="text-center mt-5"><div className="spinner-border" /></div>;
  if (error) return <div className="alert alert-danger m-3">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Available Lands</h2>
        <div className="btn-group">
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('all')}
          >
            All Lands
          </button>
          <button 
            className={`btn ${filter === 'verified' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('verified')}
          >
            Verified Only
          </button>
          <button 
            className={`btn ${filter === 'unverified' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('unverified')}
          >
            Unverified Only
          </button>
        </div>
      </div>

      {filteredLands.length === 0 ? (
        <div className="alert alert-info">No lands found matching the selected filter.</div>
      ) : (
        <div className="row g-4">
          {filteredLands.map((land) => (
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
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{land.location}</h5>
                    {getStatusBadge(land.verificationStatus)}
                  </div>

                  <div className="mb-3">
                    <p className="mb-1"><strong>Survey Number:</strong> {land.surveyNumber}</p>
                    <p className="mb-1"><strong>Area:</strong> {land.area} sq ft</p>
                    <p className="mb-1"><strong>Price:</strong> ₹{land.price.toLocaleString('en-IN')}</p>
                    <p className="mb-1"><strong>Owner:</strong> {land.name}</p>
                  </div>

                  <div className="mt-auto">
                    {land.verificationStatus === 'approved' ? (
                      <button
                        className="btn btn-primary w-100"
                        onClick={() => handleBuyRequest(land._id)}
                      >
                        <FaShoppingCart className="me-2" />
                        Send Buy Request
                      </button>
                    ) : (
                      <div className="alert alert-warning mb-0">
                        <small>
                          <FaTimesCircle className="me-1" />
                          This land needs to be verified before purchase
                        </small>
                      </div>
                    )}
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

export default BuyLand;
