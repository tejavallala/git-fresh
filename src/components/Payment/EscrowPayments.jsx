import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import '../CSS/EscrowPayments.css';
import { FaEthereum, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const EscrowPayments = () => {
  const [escrowPayments, setEscrowPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationConfirmed, setVerificationConfirmed] = useState(false);
  const [sellerAddress, setSellerAddress] = useState('');
  const [currentPayment, setCurrentPayment] = useState(null);

  useEffect(() => {
    fetchEscrowPayments();
  }, []);

  const fetchEscrowPayments = async () => {
    try {
      const response = await axios.get('http://localhost:4000/landRoute/escrow-payments');
      setEscrowPayments(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching escrow payments:', error);
      setIsLoading(false);
    }
  };

  const handleVerifyClick = (payment) => {
    setCurrentPayment(payment);
    setSellerAddress(payment.sellerId.walletAddress || '');
    setShowVerificationModal(true);
  };

  const handleReleasePayment = async (payment) => {
    try {
      if (!ethers.utils.isAddress(sellerAddress)) {
        alert('Please enter a valid wallet address');
        return;
      }

      setIsProcessing(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = provider.getSigner();

      // Convert the amount from INR to ETH
      const ethAmount = (payment.amount / 250000).toFixed(8);
      const amountInWei = ethers.utils.parseEther(ethAmount);

      // Send the payment to the entered wallet address
      const tx = await signer.sendTransaction({
        to: sellerAddress, // Use the entered wallet address
        value: amountInWei,
        gasLimit: 21000
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      // Update the payment status in backend
      await axios.post(`http://localhost:4000/landRoute/release-escrow/${payment._id}`, {
        transactionHash: tx.hash,
        inspectorAddress: await signer.getAddress(),
        sellerWalletAddress: sellerAddress, // Include the used wallet address
        status: 'completed'
      });

      // Close modal and show success
      setShowVerificationModal(false);
      setVerificationConfirmed(false);
      setSellerAddress('');
      
      // Refresh the payments list
      await fetchEscrowPayments();
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);

    } catch (error) {
      console.error('Error releasing payment:', error);
      alert('Failed to release payment: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const VerificationModal = () => {
    if (!currentPayment) return null;

    return (
      <div 
        className={`modal fade ${showVerificationModal ? 'show d-block' : ''}`}
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Verify Payment Details</h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowVerificationModal(false)}
              ></button>
            </div>

            <div className="modal-body p-4">
              <div className="mb-4">
                <h6 className="border-bottom border-primary pb-2 mb-3">Land Details</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <p className="mb-2"><strong>Location:</strong> {currentPayment.landId.location}</p>
                    <p className="mb-2"><strong>Survey Number:</strong> {currentPayment.landId.surveyNumber}</p>
                    <p className="mb-2"><strong>Area:</strong> {currentPayment.landId.area} sq ft</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-2"><strong>Price:</strong> ₹{currentPayment.amount.toLocaleString('en-IN')}</p>
                    <p className="mb-2"><strong>ETH Amount:</strong> {(currentPayment.amount / 250000).toFixed(8)} ETH</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="border-bottom border-primary pb-2 mb-3">Seller Details</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <p className="mb-2"><strong>Name:</strong> {currentPayment.sellerId.name}</p>
                    <p className="mb-2"><strong>Email:</strong> {currentPayment.sellerId.email}</p>
                    <p className="mb-2"><strong>Phone:</strong> {currentPayment.sellerId.phoneNumber}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-2"><strong>Government ID:</strong> {currentPayment.sellerId.governmentId}</p>
                    <p className="mb-2"><strong>Address:</strong> {currentPayment.sellerId.address}</p>
                  </div>
                </div>
              </div>

              <div className="alert alert-warning d-flex align-items-center mb-4">
                <FaExclamationTriangle className="me-2" />
                <span>Please verify all details before proceeding with payment release</span>
              </div>

              <div className="mb-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="verification-checkbox"
                    checked={verificationConfirmed}
                    onChange={(e) => setVerificationConfirmed(e.target.checked)}
                  />
                  <label className="form-check-label user-select-none" htmlFor="verification-checkbox">
                    I confirm that I have verified all land and seller details
                  </label>
                </div>
              </div>

              {verificationConfirmed && (
                <div className="mb-3">
                  <label className="form-label">Enter Seller's Wallet Address</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className={`form-control ${!ethers.utils.isAddress(sellerAddress) ? 'is-invalid' : 'is-valid'}`}
                      placeholder="0x..."
                      value={sellerAddress}
                      onChange={(e) => setSellerAddress(e.target.value)}
                    />
                    {sellerAddress && (
                      <div className={`${ethers.utils.isAddress(sellerAddress) ? 'valid-feedback' : 'invalid-feedback'}`}>
                        {ethers.utils.isAddress(sellerAddress) 
                          ? 'Valid wallet address' 
                          : 'Please enter a valid Ethereum wallet address'}
                      </div>
                    )}
                  </div>
                  <small className="text-muted mt-1 d-block">
                    Double-check the wallet address before proceeding with the payment
                  </small>
                </div>
              )}
            </div>

            <div className="modal-footer bg-light">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowVerificationModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success d-flex align-items-center"
                disabled={!verificationConfirmed || !ethers.utils.isAddress(sellerAddress) || isProcessing}
                onClick={() => handleReleasePayment(currentPayment)}
              >
                {isProcessing ? (
                  <>
                    <FaSpinner className="spinner me-2" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FaEthereum className="me-2" />
                    <span>Release Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center mt-5">
        <FaSpinner className="spinner" />
        <p>Loading escrow payments...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Escrow Payments Management</h2>
      
      {showConfirmation && (
        <div className="alert alert-success">
          <FaCheckCircle className="me-2" />
          Payment successfully released to seller!
        </div>
      )}

      {escrowPayments.length === 0 ? (
        <div className="alert alert-info">
          No pending escrow payments found.
        </div>
      ) : (
        <div className="row">
          {escrowPayments.map((payment) => (
            <div key={payment._id} className="col-md-6 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Payment ID: #{payment._id.slice(-6)}</h5>
                  <span className="badge bg-light text-primary">
                    ₹{payment.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="card-body">
                  <h6 className="border-bottom pb-2 mb-3">Land Details</h6>
                  <p><strong>Location:</strong> {payment.landId.location}</p>
                  <p><strong>Survey Number:</strong> {payment.landId.surveyNumber}</p>
                  <p><strong>Area:</strong> {payment.landId.area} sq ft</p>

                  <h6 className="border-bottom pb-2 mb-3 mt-4">Transaction Details</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Buyer:</strong> {payment.buyerId.name}</p>
                      <p><small className="text-muted">{payment.buyerId.walletAddress}</small></p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Seller:</strong> {payment.sellerId.name}</p>
                      <p><small className="text-muted">{payment.sellerId.walletAddress}</small></p>
                    </div>
                  </div>

                  <div className="alert alert-warning mt-3">
                    <FaExclamationTriangle className="me-2" />
                    Verify all details before releasing payment
                  </div>

                  <button
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                    onClick={() => handleVerifyClick(payment)}
                  >
                    <FaEthereum className="me-2" />
                    <span>Review & Release Payment</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <VerificationModal />
    </div>
  );
};

export default EscrowPayments;