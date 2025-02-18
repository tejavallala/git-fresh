import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCheckCircle, FaEthereum, FaMapMarkerAlt, FaExchangeAlt, FaClock, FaTimesCircle, FaSync } from "react-icons/fa";
import "../CSS/SellerTransaction.css";

function SellerTransaction() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferRequests, setTransferRequests] = useState({});
  const [transferStatuses, setTransferStatuses] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    fetchTransactions();
    fetchTransferStatuses();
  }, [userId]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/landRoute/user-transactions/${userId}`
      );
      // Filter for seller transactions only
      const sellerTransactions = response.data.filter(
        (transaction) => transaction.sellerId._id === userId
      );
      setTransactions(sellerTransactions);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    }
  };

  const fetchTransferStatuses = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/landRoute/transfer-statuses`);
      const statusMap = {};
      response.data.forEach(transfer => {
        statusMap[transfer.paymentId] = transfer.status;
      });
      setTransferStatuses(statusMap);
    } catch (error) {
      console.error("Error fetching transfer statuses:", error);
    }
  };

  const requestTransfer = async (transaction) => {
    try {
      const transferData = {
        landId: transaction.landId._id,
        sellerId: transaction.sellerId._id,
        buyerId: transaction.buyerId._id,
        transactionHash: transaction.transactionHash,
        paymentId: transaction._id
      };

      await axios.post('http://localhost:4000/landRoute/request-transfer', transferData);
      
      setTransferRequests({
        ...transferRequests,
        [transaction._id]: true
      });

      alert('Transfer request sent successfully!');
    } catch (error) {
      console.error('Error requesting transfer:', error);
      alert('Failed to send transfer request');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchTransactions(),
      fetchTransferStatuses()
    ]);
    setRefreshing(false);
  };

  const getTransferStatusBadge = (transaction) => {
    const status = transferStatuses[transaction._id];

    // If transfer is already completed, only show the success badge
    if (status === 'completed') {
      return (
        <span className="badge bg-success">
          <FaCheckCircle className="me-1" />
          Land Inspector Approved
        </span>
      );
    }

    // If no transfer request yet, show the request button
    if (!transferRequests[transaction._id]) {
      return (
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => requestTransfer(transaction)}
        >
          <FaExchangeAlt className="me-2" />
          Request Transfer
        </button>
      );
    }

    // Handle other statuses
    switch (status) {
      case 'rejected':
        return (
          <div>
            <span className="badge bg-danger mb-2">
              <FaTimesCircle className="me-1" />
              Transfer Rejected
            </span>
            <button 
              className="btn btn-primary btn-sm d-block"
              onClick={() => requestTransfer(transaction)}
            >
              <FaExchangeAlt className="me-2" />
              Request Again
            </button>
          </div>
        );
      case 'pending':
      default:
        return (
          <span className="badge bg-warning text-dark">
            <FaClock className="me-1" />
            Awaiting Inspector Approval
          </span>
        );
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" /></div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Land Sales History</h2>
        <button 
          className={`btn btn-outline-primary ${refreshing ? 'disabled' : ''}`}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <FaSync className={`me-2 ${refreshing ? 'spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      {transactions.length === 0 ? (
        <div className="alert alert-info">No sales transactions found.</div>
      ) : (
        <div className="row">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">Land Sold</h5>
                    <span className="badge bg-success">
                      <FaCheckCircle className="me-1" />
                      Payment Received
                    </span>
                  </div>

                  <div className="mb-3">
                    <h6>Land Details:</h6>
                    <p className="mb-1">
                      <FaMapMarkerAlt className="me-2" />
                      {transaction.landId.location}
                    </p>
                    <p className="mb-1">
                      <strong>Survey Number:</strong> {transaction.landId.surveyNumber}
                    </p>
                    <p className="mb-1">
                      <strong>Area:</strong> {transaction.landId.area} sq ft
                    </p>
                  </div>

                  <div className="mb-3">
                    <h6>Sale Details:</h6>
                    <p className="mb-1">
                      <FaEthereum className="me-2" />
                      Amount Received: ₹{transaction.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="mb-1">
                      <strong>Sale Date:</strong>{' '}
                      {new Date(transaction.paymentDate).toLocaleDateString()}
                    </p>
                    <p className="mb-1 text-truncate">
                      <strong>Transaction Hash:</strong>{' '}
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${transaction.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {transaction.transactionHash}
                      </a>
                    </p>
                  </div>

                  <div className="border-top pt-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <p className="text-success mb-0">
                        <FaCheckCircle className="me-2" />
                        Successfully sold to {transaction.buyerId.name}
                      </p>
                      {getTransferStatusBadge(transaction)}
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

export default SellerTransaction;