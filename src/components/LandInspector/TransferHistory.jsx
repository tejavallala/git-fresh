import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDownload, FaEye, FaUser, FaMapMarked, FaFileAlt, FaCheckCircle } from 'react-icons/fa';
import jsPDF from 'jspdf';
import CryptoJS from 'crypto-js';
import '../CSS/TransferHistory.css';

const TransferHistory = () => {
  const [completedTransfers, setCompletedTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  useEffect(() => {
    fetchCompletedTransfers();
  }, []);

  const fetchCompletedTransfers = async () => {
    try {
      const response = await axios.get('http://localhost:4000/landRoute/completed-transfers');
      setCompletedTransfers(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load transfer history');
      setLoading(false);
    }
  };

  const getPhotoUrl = (photoData) => {
    if (!photoData?.data) return null;
    return `data:${photoData.contentType};base64,${photoData.data}`;
  };

  const generatePDF = async (transfer) => {
    try {
      const essentialContent = {
        surveyNumber: transfer?.landId?.surveyNumber?.toLowerCase().trim(),
        location: transfer?.landId?.location?.toLowerCase().trim(),
        area: String(transfer?.landId?.area || '').toLowerCase().replace(/\s+/g, '').replace(/sqft|sq\s*ft/i, ''),
        sellerId: (transfer?.seller?.name || '').toLowerCase().trim(),
        buyerId: (transfer?.buyer?.name || '').toLowerCase().trim(),
        transactionHash: String(transfer?.transactionHash || '').trim(),
      };
  
      const contentString = Object.keys(essentialContent)
        .sort()
        .map((key) => `${key}:${essentialContent[key]}`)
        .join('|');
  
      const documentHash = CryptoJS.SHA256(contentString).toString();
      console.log("🔒 Hash Content String:", contentString);
      console.log("📦 Hash:", documentHash);
  
      const doc = new jsPDF();
  
      // Add visible content
      doc.setFontSize(20);
      doc.text('Transfer Certificate', 105, 20, { align: 'center' });
  
      doc.setFontSize(12);
      doc.text(`Survey Number: ${transfer?.landId?.surveyNumber}`, 20, 40);
      doc.text(`Location: ${transfer?.landId?.location}`, 20, 50);
      doc.text(`Area: ${transfer?.landId?.area} sq ft`, 20, 60);
      doc.text(`Seller: ${transfer?.seller?.name}`, 20, 80);
      doc.text(`Buyer: ${transfer?.buyer?.name}`, 20, 90);
      doc.text(`Transaction Hash: ${transfer?.transactionHash}`, 20, 100);
  
      // Embed hash as metadata
      doc.setProperties({
        title: 'Transfer Certificate',
        subject: 'Land Transfer Details',
        author: 'Your Application',
        keywords: `hash:${documentHash}`, // Add the hash as a keyword
      });
  
      doc.save(`transfer-${essentialContent.surveyNumber}.pdf`);
    } catch (error) {
      console.error("❌ Error generating PDF:", error);
      alert("Failed to generate PDF.");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4">
        <div className="col">
          <h2 className="display-6 text-primary">
            <FaFileAlt className="me-2" />
            Transfer History
          </h2>
        </div>
      </div>

      <div className="row">
        {completedTransfers.map(transfer => (
          <div key={transfer?._id || Math.random()} className="col-12 mb-4">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <FaMapMarked className="me-2 text-primary" />
                  Land ID: {transfer?.landId?.surveyNumber || 'N/A'}
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Land Details */}
                  <div className="col-md-4">
                    <h6 className="text-primary mb-3">Land Details</h6>
                    <p className="mb-2">
                      <strong>Location:</strong> {transfer?.landId?.location || 'N/A'}
                    </p>
                    <p className="mb-2">
                      <strong>Area:</strong> {transfer?.landId?.area ? `${transfer.landId.area} sq ft` : 'N/A'}
                    </p>
                    <p className="mb-2">
                      <strong>Price:</strong> {transfer?.landId?.price ? `₹${transfer.landId.price}` : 'N/A'}
                    </p>
                  </div>

                  {/* Seller Details */}
                  <div className="col-md-4">
                    <h6 className="text-primary mb-3">
                      <FaUser className="me-2" />
                      Seller Details
                    </h6>
                    <p className="mb-2">
                      <strong>Name:</strong> {transfer?.seller?.name || 'N/A'}
                    </p>
                    <p className="mb-2">
                      <strong>Email:</strong> {transfer?.seller?.email || 'N/A'}
                    </p>
                    <p className="mb-2">
                      <strong>Phone:</strong> {transfer?.seller?.phoneNumber || 'N/A'}
                    </p>
                    {transfer?.sellerVerificationPhoto && (
                      <img 
                        src={getPhotoUrl(transfer.sellerVerificationPhoto)}
                        alt="Seller"
                        className="verification-photo mt-2"
                      />
                    )}
                  </div>

                  {/* Buyer Details */}
                  <div className="col-md-4">
                    <h6 className="text-primary mb-3">
                      <FaUser className="me-2" />
                      Buyer Details
                    </h6>
                    <p className="mb-2">
                      <strong>Name:</strong> {transfer?.buyer?.name || 'N/A'}
                    </p>
                    <p className="mb-2">
                      <strong>Email:</strong> {transfer?.buyer?.email || 'N/A'}
                    </p>
                    <p className="mb-2">
                      <strong>Phone:</strong> {transfer?.buyer?.phoneNumber || 'N/A'}
                    </p>
                    {transfer?.buyerVerificationPhoto && (
                      <img 
                        src={getPhotoUrl(transfer.buyerVerificationPhoto)}
                        alt="Buyer"
                        className="verification-photo mt-2"
                      />
                    )}
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="row mt-3">
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded">
                      <div>
                        <FaCheckCircle className="text-success me-2" />
                        <small className="text-muted">Transaction Hash: </small>
                        <small className="text-break">{transfer?.transactionHash || 'N/A'}</small>
                      </div>
                      <div>
                        <button 
                          className="btn btn-outline-primary btn-sm me-2"
                          onClick={() => setSelectedTransfer(transfer)}
                          disabled={!transfer?.landId}
                        >
                          <FaEye className="me-1" /> View Details
                        </button>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => generatePDF(transfer)}
                          disabled={!transfer?.landId}
                        >
                          <FaDownload className="me-1" /> Download Certificate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add some CSS styles */}
      <style jsx>{`
        .verification-photo {
          max-width: 100px;
          height: auto;
          border-radius: 8px;
          border: 2px solid #e9ecef;
        }
        .card {
          transition: transform 0.2s;
        }
        .card:hover {
          transform: translateY(-2px);
        }
      `}</style>

      {/* Details Modal */}
      {selectedTransfer && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Transfer Details</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedTransfer(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Land Details</h6>
                    <p>Survey Number: {selectedTransfer?.landId?.surveyNumber || 'N/A'}</p>
                    <p>Location: {selectedTransfer?.landId?.location || 'N/A'}</p>
                    <p>Area: {selectedTransfer?.landId?.area ? `${selectedTransfer.landId.area} sq ft` : 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Verification Photos</h6>
                    <div className="row">
                      <div className="col-6">
                        <p>Seller Photo:</p>
                        {selectedTransfer?.sellerVerificationPhoto ? (
                          <img 
                            src={getPhotoUrl(selectedTransfer.sellerVerificationPhoto)}
                            alt="Seller"
                            className="img-fluid"
                          />
                        ) : (
                          <div className="no-photo">No photo available</div>
                        )}
                      </div>
                      <div className="col-6">
                        <p>Buyer Photo:</p>
                        {selectedTransfer?.buyerVerificationPhoto ? (
                          <img 
                            src={getPhotoUrl(selectedTransfer.buyerVerificationPhoto)}
                            alt="Buyer"
                            className="img-fluid"
                          />
                        ) : (
                          <div className="no-photo">No photo available</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferHistory;
