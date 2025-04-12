import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaTimes} from 'react-icons/fa';

function VerifyPurchases() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    fetchPurchaseRequests();
  }, []);

  const fetchPurchaseRequests = async () => {
    try {
      const response = await axios.get('https://git-back-k93u.onrender.com/inspectorRoute/pending-purchases');
      setRequests(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching purchase requests:', error);
      setError('Failed to fetch purchase requests');
      setIsLoading(false);
    }
  };

  const handleVerification = async (requestId, status) => {
    try {
      const inspectorId = sessionStorage.getItem('userId');
      const comments = document.getElementById(`comments-${requestId}`).value;

      await axios.post(`https://git-back-k93u.onrender.com/inspectorRoute/verify-purchase/${requestId}`, {
        status,
        comments,
        inspectorId
      });

      alert(`Purchase request ${status} successfully`);
      fetchPurchaseRequests(); // Refresh the list
    } catch (error) {
      console.error('Error verifying purchase:', error);
      alert('Failed to verify purchase request');
    }
  };

  if (isLoading) return <div className="text-center mt-5"><div className="spinner-border" /></div>;
  if (error) return <div className="alert alert-danger m-3">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Verify Purchase Requests</h2>
      
      {requests.length === 0 ? (
        <div className="alert alert-info">No pending purchase requests</div>
      ) : (
        <div className="row g-4">
          {requests.map((request) => (
            <div key={request._id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                {request.landId.landImages && request.landId.landImages[0] && (
                  <img
                    src={`data:${request.landId.landImages[0].contentType};base64,${request.landId.landImages[0].data}`}
                    className="card-img-top"
                    alt="Land"
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{request.landId.location}</h5>
                  
                  <div className="mb-3">
                    <div className="mb-2 p-2 bg-light rounded">
                      <p className="mb-1">
                        <strong>Buyer:</strong>{' '}
                        {request.buyerId?.name || 'N/A'}
                        {request.buyerId?.phoneNumber && (
                          <>
                            <br />
                            <small className="text-muted">
                              Phone: {request.buyerId.phoneNumber}
                            </small>
                          </>
                        )}
                        {request.buyerId?.email && (
                          <>
                            <br />
                            <small className="text-muted">
                              Email: {request.buyerId.email}
                            </small>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="mb-2 p-2 bg-light rounded">
                      <p className="mb-1">
                        <strong>Seller:</strong>{' '}
                        {request.sellerId?.name || 'N/A'}
                        {request.sellerId?.phoneNumber && (
                          <>
                            <br />
                            <small className="text-muted">
                              Phone: {request.sellerId.phoneNumber}
                            </small>
                          </>
                        )}
                        {request.sellerId?.email && (
                          <>
                            <br />
                            <small className="text-muted">
                              Email: {request.sellerId.email}
                            </small>
                          </>
                        )}
                      </p>
                    </div>

                    <p className="mb-1"><strong>Survey Number:</strong> {request.landId.surveyNumber}</p>
                    <p className="mb-1"><strong>Area:</strong> {request.landId.area} sq ft</p>
                    <p className="mb-1"><strong>Price:</strong> ₹{request.landId.price.toLocaleString('en-IN')}</p>
                    <p className="mb-1">
                      <strong>Request Date:</strong>{' '}
                      {new Date(request.requestDate).toLocaleDateString('en-IN')}
                    </p>
                  </div>

                  <div className="verification-actions">
                    <textarea
                      className="form-control mb-2"
                      placeholder="Add verification comments..."
                      id={`comments-${request._id}`}
                    />
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success flex-grow-1"
                        onClick={() => handleVerification(request._id, 'approved')}
                      >
                        <FaCheck className="me-1" /> Approve
                      </button>
                      <button
                        className="btn btn-danger flex-grow-1"
                        onClick={() => handleVerification(request._id, 'rejected')}
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

export default VerifyPurchases;