import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaCamera } from 'react-icons/fa';
import '../CSS/TransferRequests.css';
import FingerprintCapture from '../Fingerprint/FingerprintCapture';

function TransferRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [verificationStep, setVerificationStep] = useState('initial'); // initial, seller-photo, buyer-photo, details
  const [sellerPhoto, setSellerPhoto] = useState(null);
  const [buyerPhoto, setBuyerPhoto] = useState(null);
  const [sellerFingerprint, setSellerFingerprint] = useState(null);
  const [buyerFingerprint, setBuyerFingerprint] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchTransferRequests();
  }, []);

  const fetchTransferRequests = async () => {
    try {
      const response = await axios.get('https://git-back-k93u.onrender.com/landRoute/transfer-requests');
      setRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transfer requests:', error);
      setLoading(false);
    }
  };

  const startPhotoVerification = async (request) => {
    setSelectedRequest(request);
    setVerificationStep('seller-photo');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera');
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const photo = canvas.toDataURL('image/jpeg');
    
    if (verificationStep === 'seller-photo') {
      setSellerPhoto(photo);
      setVerificationStep('buyer-photo');
    } else if (verificationStep === 'buyer-photo') {
      setBuyerPhoto(photo);
      setVerificationStep('details');
      // Stop camera stream
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleTransfer = async (requestId, action) => {
    try {
      await axios.post(`https://git-back-k93u.onrender.com/landRoute/process-transfer/${requestId}`, {
        action,
        sellerPhoto,
        buyerPhoto,
        sellerFingerprint,
        buyerFingerprint,
        verificationDate: new Date()
      });
      
      // Reset states
      setSelectedRequest(null);
      setVerificationStep('initial');
      setSellerPhoto(null);
      setBuyerPhoto(null);
      
      fetchTransferRequests();
      alert(`Transfer ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error processing transfer:', error);
      alert('Failed to process transfer');
    }
  };

  useEffect(() => {
    if (selectedRequest) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [selectedRequest]);

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" /></div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Land Transfer Requests</h2>
      {requests.length === 0 ? (
        <div className="alert alert-info">No pending transfer requests.</div>
      ) : (
        <div className="row">
          {requests.map((request) => (
            <div key={request._id} className="col-12 mb-4">
              <div className="card shadow">
                <div className="card-body">
                  <h5 className="card-title mb-4">Transfer Request #{request._id}</h5>
                  
                  <div className="row">
                    <div className="col-md-4">
                      <h6>Land Details</h6>
                      <p><FaMapMarkerAlt className="me-2" />{request.landId.location}</p>
                      <p><strong>Survey Number:</strong> {request.landId.surveyNumber}</p>
                      <p><strong>Area:</strong> {request.landId.area} sq ft</p>
                    </div>

                    <div className="col-md-4">
                      <h6>Seller Details</h6>
                      <p><strong>Name:</strong> {request.sellerId.name}</p>
                      <p><strong>Email:</strong> {request.sellerId.email}</p>
                      <p><strong>Phone:</strong> {request.sellerId.phoneNumber}</p>
                    </div>

                    <div className="col-md-4">
                      <h6>Buyer Details</h6>
                      <p><strong>Name:</strong> {request.buyerId.name}</p>
                      <p><strong>Email:</strong> {request.buyerId.email}</p>
                      <p><strong>Phone:</strong> {request.buyerId.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="mt-3 border-top pt-3">
                    <p><strong>Transaction Hash:</strong></p>
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${request.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-break"
                    >
                      {request.transactionHash}
                    </a>
                  </div>

                  <div className="mt-4 d-flex justify-content-end gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => startPhotoVerification(request)}
                    >
                      <FaCamera className="me-2" />
                      Start Photo Verification
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleTransfer(request._id, 'reject')}
                    >
                      <FaTimesCircle className="me-2" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedRequest && (
        <div className="verification-modal">
          <div className="modal-content">
            <h4>Photo Verification</h4>
            
            {(verificationStep === 'seller-photo' || verificationStep === 'buyer-photo') && (
              <div className="camera-container">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="camera-preview"
                />
                <button 
                  className="btn btn-primary capture-btn"
                  onClick={capturePhoto}
                >
                  <FaCamera className="me-2" />
                  Capture {verificationStep === 'seller-photo' ? 'Seller' : 'Buyer'} Photo
                </button>
              </div>
            )}

            {verificationStep === 'details' && (
              <div className="verification-details">
                <div className="row">
                  <div className="col-md-6">
                    <h5>Seller Verification</h5>
                    <img src={sellerPhoto} alt="Seller" className="verification-photo" />
                    <div className="user-details">
                      <p><strong>Name:</strong> {selectedRequest.sellerId.name}</p>
                      <p><strong>Email:</strong> {selectedRequest.sellerId.email}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h5>Buyer Verification</h5>
                    <img src={buyerPhoto} alt="Buyer" className="verification-photo" />
                    <div className="user-details">
                      <p><strong>Name:</strong> {selectedRequest.buyerId.name}</p>
                      <p><strong>Email:</strong> {selectedRequest.buyerId.email}</p>
                    </div>
                  </div>
                </div>

                <div className="land-details mt-4">
                  <h5>Land Details</h5>
                  <p><FaMapMarkerAlt className="me-2" />{selectedRequest.landId.location}</p>
                  <p><strong>Survey Number:</strong> {selectedRequest.landId.surveyNumber}</p>
                  <p><strong>Area:</strong> {selectedRequest.landId.area} sq ft</p>
                </div>

                <div className="action-buttons mt-4">
                  <button
                    className="btn btn-success me-2"
                    onClick={() => handleTransfer(selectedRequest._id, 'approve')}
                  >
                    <FaCheckCircle className="me-2" />
                    Confirm & Approve Transfer
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedRequest(null);
                      setVerificationStep('initial');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TransferRequests;