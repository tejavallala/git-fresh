import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaMapMarkerAlt, FaCalendar, FaUser } from 'react-icons/fa';
import '../CSS/TransferHistory.css';

const TransferHistory = () => {
  const [completedTransfers, setCompletedTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchCompletedTransfers();
  }, []);

  const fetchCompletedTransfers = async () => {
    try {
      const response = await axios.get('https://git-back-k93u.onrender.com/landRoute/completed-transfers');
      setCompletedTransfers(response.data);
    } catch (error) {
      console.error('Error fetching completed transfers:', error);
      setError('Failed to load transfer history');
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (photoData) => {
    if (!photoData?.data) return null;
    return `data:${photoData.contentType};base64,${photoData.data}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Transfer History</h2>
      {completedTransfers.length === 0 ? (
        <div className="alert alert-info">No completed transfers found.</div>
      ) : (
        <div className="row">
          {completedTransfers.map(transfer => (
            <div key={transfer._id} className="col-12 mb-4">
              <div className="card shadow-sm">
                <div className="card-header bg-success text-white">
                  <FaCheckCircle className="me-2" />
                  Transfer Completed
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h5 className="card-title mb-3">Land Details</h5>
                      <p className="mb-2">
                        <FaMapMarkerAlt className="me-2 text-primary" />
                        {transfer.landId.location}
                      </p>
                      <p className="mb-2">
                        <strong>Survey Number:</strong> {transfer.landId.surveyNumber}
                      </p>
                      <p className="mb-2">
                        <strong>Area:</strong> {transfer.landId.area} sq ft
                      </p>
                    </div>
                    
                    <div className="col-md-6">
                      <h5 className="card-title mb-3">Verification Photos</h5>
                      <div className="row g-3">
                        <div className="col-6">
                          <div className="verification-photo-container">
                            {transfer.sellerVerificationPhoto ? (
                              <img 
                                src={getPhotoUrl(transfer.sellerVerificationPhoto)}
                                alt="Seller Verification"
                                className="img-fluid verification-photo"
                                onClick={() => setSelectedPhoto(getPhotoUrl(transfer.sellerVerificationPhoto))}
                              />
                            ) : (
                              <div className="no-photo">
                                <FaUser />
                                <span>No seller photo</span>
                              </div>
                            )}
                            <small className="text-muted d-block mt-1">
                              <FaCalendar className="me-1" />
                              {transfer.sellerVerificationPhoto?.capturedAt 
                                ? formatDate(transfer.sellerVerificationPhoto.capturedAt)
                                : 'N/A'}
                            </small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="verification-photo-container">
                            {transfer.buyerVerificationPhoto ? (
                              <img 
                                src={getPhotoUrl(transfer.buyerVerificationPhoto)}
                                alt="Buyer Verification"
                                className="img-fluid verification-photo"
                                onClick={() => setSelectedPhoto(getPhotoUrl(transfer.buyerVerificationPhoto))}
                              />
                            ) : (
                              <div className="no-photo">
                                <FaUser />
                                <span>No buyer photo</span>
                              </div>
                            )}
                            <small className="text-muted d-block mt-1">
                              <FaCalendar className="me-1" />
                              {transfer.buyerVerificationPhoto?.capturedAt 
                                ? formatDate(transfer.buyerVerificationPhoto.capturedAt)
                                : 'N/A'}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="photo-modal"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="modal-content">
            <img src={selectedPhoto} alt="Verification" className="img-fluid" />
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferHistory;
