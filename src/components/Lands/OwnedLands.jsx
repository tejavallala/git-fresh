import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaMapMarkerAlt, FaFileAlt } from 'react-icons/fa';
import '../CSS/OwnedLands.css';

const OwnedLands = () => {
  const userId = sessionStorage.getItem('userId');
  const [lands, setLands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedLand, setSelectedLand] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (userId) fetchOwnedLands();
  }, [userId]);

  const fetchOwnedLands = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/landRoute/owned-lands/${userId}`);
      setLands(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching owned lands:', error);
      setError('Failed to fetch your owned lands');
      setIsLoading(false);
    }
  };

  const getPreviousOwnerDetails = (land) => {
    const owner = land.previousOwner || land.userId;
    return {
      name: owner?.name || 'Not available',
      email: owner?.email || 'Not available',
      phone: owner?.phoneNumber || 'Not available',
    };
  };

  const parseEssentialContent = (text) => {
    const getBetween = (text, startLabel, endLabel) => {
      const regex = new RegExp(`${startLabel}:\\s*(.*?)\\s*${endLabel}:`, 'is');
      const match = text.match(regex);
      return match ? match[1].trim() : '';
    };
  
    const getAfter = (text, label) => {
      const regex = new RegExp(`${label}:\\s*(.*)`, 'is');
      const match = text.match(regex);
      return match ? match[1].trim() : '';
    };
  
    return {
      surveyNumber: getBetween(text, 'Survey Number', 'Location').toLowerCase(),
      location: getBetween(text, 'Location', 'Area').toLowerCase(),
      area: getBetween(text, 'Area', 'Seller').toLowerCase().replace(/sq\s*ft|sqft/gi, '').replace(/\s+/g, ''),
      sellerId: getBetween(text, 'Seller', 'Buyer').trim(),
      buyerId: getBetween(text, 'Buyer', 'Transaction Hash').trim(),
      transactionHash: getAfter(text, 'Transaction Hash').trim()
    };
  };
  

  const verifyTransferDocument = async () => {
    if (!uploadFile || !selectedLand) {
      alert('Please select a file and land');
      return;
    }
  
    try {
      setIsVerifying(true);
      setVerificationStatus(null);
  
      // Read the uploaded PDF file
      const arrayBuffer = await uploadFile.arrayBuffer();
  
      // Use pdf-lib to extract metadata
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.load(arrayBuffer);
  
      // Extract the hash from the metadata
      const metadata = pdfDoc.getKeywords();
      const match = metadata?.match(/hash:([a-f0-9]{64})/);
  
      if (!match) {
        alert("❌ Document hash not found in PDF metadata. Please upload the original file.");
        return;
      }
  
      const extractedHash = match[1];
      const storedHash = selectedLand.transferDocumentHash;
  
      console.log("📥 PDF Upload - Extracted Hash:", extractedHash);
      console.log("📦 Stored Hash:", storedHash);
  
      if (extractedHash === storedHash) {
        setVerificationStatus('original');
        alert('✅ Document verified! Land listed for sale.');
        // (Optional) Proceed to list land for sale
      } else {
        setVerificationStatus('modified');
        alert('❌ Fake document! Hash mismatch.');
      }
    } catch (error) {
      console.error("❌ Verification Error:", error);
      alert("Error verifying the PDF.");
    } finally {
      setIsVerifying(false);
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
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Your Owned Lands</h2>
      {lands.length === 0 ? (
        <div className="alert alert-info">You don't own any lands yet.</div>
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
                    <p><strong>Survey Number:</strong> {land.surveyNumber}</p>
                    <p><strong>Area:</strong> {land.area} sq ft</p>

                    <div className="border-start ps-2 my-3">
                      <h6 className="text-muted mb-2">Previous Owner Details</h6>
                      <p><strong>Name:</strong> {getPreviousOwnerDetails(land).name}</p>
                      <p><strong>Email:</strong> {getPreviousOwnerDetails(land).email}</p>
                      <p><strong>Phone:</strong> {getPreviousOwnerDetails(land).phone}</p>
                    </div>
                  </div>

                  <div className="alert alert-info p-2 mb-3">
                    <small>
                      <FaFileAlt className="me-2" />
                      <strong>Transfer Date:</strong>{' '}
                      {land.lastTransactionDate
                        ? new Date(land.lastTransactionDate).toLocaleString('en-IN')
                        : 'Not available'}
                    </small>
                  </div>

                  {land.lastTransactionHash && (
                    <button
                      className="btn btn-outline-primary btn-sm w-100"
                      onClick={() =>
                        window.open(`https://sepolia.etherscan.io/tx/${land.lastTransactionHash}`, '_blank')
                      }
                    >
                      View Transaction Details
                    </button>
                  )}

                  {land.transferDocumentHash && (
                    <button
                      className="btn btn-primary btn-sm mt-2 w-100"
                      onClick={() => {
                        setSelectedLand(land);
                        setShowSellModal(true);
                        setVerificationStatus(null);
                        setUploadFile(null);
                      }}
                    >
                      List for Sale
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Upload & Verification */}
      {showSellModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-md">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Upload Transfer Certificate</h5>
                <button type="button" className="btn-close" onClick={() => setShowSellModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Please upload the original transfer certificate PDF.</p>
                <input
                  type="file"
                  accept=".pdf"
                  className="form-control"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                />
                {verificationStatus === 'original' && (
                  <div className="alert alert-success mt-3">✅ Document is original and verified.</div>
                )}
                {verificationStatus === 'modified' && (
                  <div className="alert alert-danger mt-3">❌ Document is modified or fake.</div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowSellModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" disabled={!uploadFile || isVerifying} onClick={verifyTransferDocument}>
                  {isVerifying ? 'Verifying...' : 'Verify & List'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnedLands;
