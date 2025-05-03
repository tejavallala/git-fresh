import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { Modal, Button, Form, Alert, ProgressBar } from 'react-bootstrap';
import { MapPin, CheckCircle, FileText, List, Upload, AlertTriangle, CheckSquare } from 'lucide-react';

import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
// Document verification utilities
const extractHashFromPdf = async (file) => {
  try {
    const fileArrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: fileArrayBuffer }).promise;
    const numPages = pdf.numPages;
    const page = await pdf.getPage(numPages);
    const textContent = await page.getTextContent();
    const strings = textContent.items.map(item => item.str);
    const hashRegex = /[a-f0-9]{64}/i;
    
    for (const str of strings) {
      const match = str.match(hashRegex);
      if (match) {
        return match[0];
      }
    }
    
    const allText = strings.join('');
    const match = allText.match(hashRegex);
    return match ? match[0] : null;
  } catch (error) {
    console.error('Error extracting hash from PDF:', error);
    return null;
  }
};

const verifyPdfDocument = async (file, expectedHashSource) => {
  try {
    if (!expectedHashSource) {
      console.error('No expected hash source provided for verification');
      return false;
    }
    
    const expectedHash = CryptoJS.SHA256(expectedHashSource).toString();
    const extractedHash = await extractHashFromPdf(file);
    
    if (!extractedHash) {
      console.error('No hash found in the document');
      return false;
    }
    
    return extractedHash.toLowerCase() === expectedHash.toLowerCase();
  } catch (error) {
    console.error('Error verifying PDF document:', error);
    return false;
  }
};

// List For Sale Modal Component
const ListForSaleModal = ({ show, handleClose, land, onListingSuccess }) => {
  const [file, setFile] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleModalClose = () => {
    setFile(null);
    setVerificationStatus('idle');
    setErrorMessage('');
    setPrice('');
    setDescription('');
    setIsSubmitting(false);
    handleClose();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    setVerificationStatus('idle');
    setErrorMessage('');
    
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setErrorMessage('Please upload a PDF document');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleVerifyDocument = async () => {
    if (!file) {
      setErrorMessage('Please select a document to verify');
      return;
    }

    setVerificationStatus('verifying');
    setErrorMessage('');

    try {
      const isVerified = await verifyPdfDocument(file, land.lastTransactionHash);

      if (isVerified) {
        setVerificationStatus('success');
      } else {
        setVerificationStatus('error');
        setErrorMessage('Document verification failed. This document appears to be invalid or does not match this land record.');
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      setVerificationStatus('error');
      setErrorMessage('An error occurred during document verification. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (verificationStatus !== 'success') {
      setErrorMessage('Please verify your document before listing the land for sale');
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setErrorMessage('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('landId', land._id);
      formData.append('price', price);
      formData.append('description', description);
      if (file) {
        formData.append('document', file);
      }

      const response = await axios.post(
        'http://localhost:4000/landRoute/list-for-sale',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        const updatedLand = {
          ...land,
          isListed: true,
          listingPrice: Number(price),
          listingDescription: description
        };
        onListingSuccess(updatedLand);
      } else {
        setErrorMessage(response.data.message || 'Failed to list land for sale');
      }
    } catch (error) {
      console.error('Error listing land for sale:', error);
      setErrorMessage(error.response?.data?.message || 'An error occurred while listing the land for sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleModalClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>List Land for Sale</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4">
          <h6 className="text-muted mb-2">Land Details</h6>
          <div className="d-flex align-items-center mb-2">
            <FileText size={16} className="text-primary me-2" />
            <span><strong>Location:</strong> {land.location}</span>
          </div>
          <div className="d-flex align-items-center mb-2">
            <FileText size={16} className="text-primary me-2" />
            <span><strong>Survey Number:</strong> {land.surveyNumber}</span>
          </div>
          <div className="d-flex align-items-center">
            <FileText size={16} className="text-primary me-2" />
            <span><strong>Area:</strong> {land.area} sq ft</span>
          </div>
        </div>
        
        <hr className="my-3" />
        
        <div className="mb-4">
          <h6 className="mb-3">Document Verification</h6>
          
          {errorMessage && (
            <Alert variant="danger" className="py-2 mb-3">
              <AlertTriangle size={16} className="me-2" />
              {errorMessage}
            </Alert>
          )}
          
          {verificationStatus === 'success' && (
            <Alert variant="success" className="py-2 mb-3">
              <CheckCircle size={16} className="me-2" />
              Document verified successfully! You can now list your land for sale.
            </Alert>
          )}
          
          <Form.Group controlId="document" className="mb-3">
            <Form.Label>Upload Transfer Certificate</Form.Label>
            <div className="input-group">
              <Form.Control
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                disabled={verificationStatus === 'verifying' || verificationStatus === 'success'}
              />
              <Button 
                variant="outline-secondary" 
                onClick={() => fileInputRef.current?.click()}
                disabled={verificationStatus === 'verifying' || verificationStatus === 'success'}
              >
                <Upload size={16} className="me-1" />
                Browse
              </Button>
            </div>
            <Form.Text className="text-muted">
              Upload your Land Transfer Certificate PDF to verify ownership.
            </Form.Text>
          </Form.Group>
          
          {verificationStatus === 'verifying' && (
            <div className="mb-3">
              <ProgressBar animated now={100} label="Verifying..." className="mb-2" />
              <p className="text-center text-muted small">Please wait while we verify your document...</p>
            </div>
          )}
          
          <Button
            variant="primary"
            onClick={handleVerifyDocument}
            disabled={!file || verificationStatus === 'verifying' || verificationStatus === 'success'}
            className="w-100"
          >
            {verificationStatus === 'verifying' ? 'Verifying...' : 'Verify Document'}
          </Button>
        </div>
        
        {verificationStatus === 'success' && (
          <>
            <hr className="my-3" />
            
            <Form onSubmit={handleSubmit}>
              <h6 className="mb-3">Listing Details</h6>
              
              <Form.Group className="mb-3" controlId="listingPrice">
                <Form.Label>Price (₹)</Form.Label>
                <Form.Control
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter listing price"
                  required
                  min="1"
                />
              </Form.Group>
              
              <Form.Group className="mb-3" controlId="listingDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter additional details about your property"
                />
              </Form.Group>
              
              <Button
                variant="success"
                type="submit"
                className="w-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'List Land for Sale'}
              </Button>
            </Form>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleModalClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Main OwnedLands Component
const OwnedLands = () => {
  const userId = sessionStorage.getItem('userId');
  const [lands, setLands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [selectedLand, setSelectedLand] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchOwnedLands();
    }
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
      phone: owner?.phoneNumber || 'Not available'
    };
  };

  const handleListForSale = (land) => {
    setSelectedLand(land);
    setShowListModal(true);
  };

  const handleCloseModal = () => {
    setShowListModal(false);
    setSelectedLand(null);
  };

  const handleListingSuccess = (updatedLand) => {
    setLands(prevLands => 
      prevLands.map(land => 
        land._id === updatedLand._id ? updatedLand : land
      )
    );
    setShowListModal(false);
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
              <div className="card h-100 shadow-sm land-card">
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
                      <MapPin className="me-2 text-primary" size={18} />
                      {land.location}
                    </h5>
                    <span className="badge bg-success">
                      <CheckCircle className="me-1" size={14} />
                      Owned
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="mb-1"><strong>Survey Number:</strong> {land.surveyNumber}</p>
                    <p className="mb-1"><strong>Area:</strong> {land.area} sq ft</p>
                    
                    <div className="border-start ps-2 my-3">
                      <h6 className="text-muted mb-2">Previous Owner Details</h6>
                      {land.userId ? (
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
                      ) : (
                        <div className="alert alert-warning p-2 mb-0">
                          <small>Previous owner details not available</small>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="alert alert-info p-2 mb-3">
                    <small>
                      <FileText className="me-2" size={14} />
                      <strong>Transfer Date:</strong>{' '}
                      {land.lastTransactionDate 
                        ? new Date(land.lastTransactionDate).toLocaleString('en-IN')
                        : 'Not available'
                      }
                    </small>
                  </div>

                  <div className="d-flex gap-2">
                    {land.lastTransactionHash && (
                      <button 
                        className="btn btn-outline-primary btn-sm flex-grow-1"
                        onClick={() => window.open(`https://sepolia.etherscan.io/tx/${land.lastTransactionHash}`, '_blank')}
                      >
                        <FileText size={14} className="me-1" />
                        View Transaction
                      </button>
                    )}
                    
                    <button 
                      className={`btn btn-${land.isListed ? 'success' : 'outline-success'} btn-sm flex-grow-1`}
                      onClick={() => handleListForSale(land)}
                      disabled={land.isListed}
                    >
                      {land.isListed ? (
                        <>
                          <CheckSquare size={14} className="me-1" />
                          Listed
                        </>
                      ) : (
                        <>
                          <List size={14} className="me-1" />
                          List for Sale
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedLand && (
        <ListForSaleModal 
          show={showListModal} 
          handleClose={handleCloseModal} 
          land={selectedLand}
          onListingSuccess={handleListingSuccess}
        />
      )}

      <style jsx>{`
        .land-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          overflow: hidden;
        }

        .land-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }

        .land-card .card-img-top {
          transition: transform 0.5s ease;
        }

        .land-card:hover .card-img-top {
          transform: scale(1.05);
        }

        .previous-owner-details {
          font-size: 0.9rem;
        }

        .verification-steps {
          position: relative;
        }

        .verification-steps::before {
          content: "";
          position: absolute;
          top: 12px;
          left: 12px;
          height: calc(100% - 20px);
          width: 2px;
          background-color: #dee2e6;
          z-index: 0;
        }

        .verification-step {
          position: relative;
          z-index: 1;
        }

        .step-icon {
          width: 25px;
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background-color: #f8f9fa;
          border: 2px solid #dee2e6;
        }

        .step-active .step-icon {
          background-color: #e3f2fd;
          border-color: #0d6efd;
        }

        .step-complete .step-icon {
          background-color: #d1e7dd;
          border-color: #198754;
        }

        .step-error .step-icon {
          background-color: #f8d7da;
          border-color: #dc3545;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .verifying-animation {
          animation: pulse 1.5s infinite;
        }

        @keyframes success-appear {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .verification-success {
          animation: success-appear 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OwnedLands;