import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCheckCircle, FaEthereum, FaMapMarkerAlt, FaExchangeAlt, FaClock, FaTimesCircle, FaSync } from "react-icons/fa";
import "../CSS/SellerTransaction.css";

const getTransactionStatus = (transaction) => {
  if (transaction.paymentType === 'direct') {
    return {
      badge: 'bg-success',
      icon: <FaCheckCircle className="me-1" />,
      text: 'Payment Received'
    };
  }

  switch (transaction.status) {
    case 'inEscrow':
      return {
        badge: 'bg-warning text-dark',
        icon: <FaClock className="me-1" />,
        text: 'Payment in Escrow'
      };
    case 'releasedToSeller':
      return {
        badge: 'bg-info',
        icon: <FaExchangeAlt className="me-1" />,
        text: 'Payment Released'
      };
    case 'completed':
      return {
        badge: 'bg-success',
        icon: <FaCheckCircle className="me-1" />,
        text: 'Payment Completed'
      };
    default:
      return {
        badge: 'bg-secondary',
        icon: <FaSync className="me-1" />,
        text: 'Processing'
      };
  }
};

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

    // Check if payment is still in escrow
    const isPaymentInEscrow = transaction.paymentType === 'escrow' && 
      (transaction.status === 'inEscrow' || transaction.status === 'pending');

    // If transfer is already completed, show success badge
    if (status === 'completed') {
      return (
        <span className="badge bg-success">
          <FaCheckCircle className="me-1" />
          Land Inspector Approved
        </span>
      );
    }

    // If payment is in escrow and not released, show waiting message
    if (isPaymentInEscrow) {
      return (
        <span className="badge bg-warning text-dark">
          <FaClock className="me-1" />
          Waiting for Escrow Release
        </span>
      );
    }

    // If no transfer request yet, show request button
    if (!transferRequests[transaction._id]) {
      return (
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => requestTransfer(transaction)}
          disabled={isPaymentInEscrow}
          title={isPaymentInEscrow ? "Wait for Land Inspector to release funds" : "Request land transfer"}
        >
          <FaExchangeAlt className="me-2" />
          Request Transfer
          {isPaymentInEscrow && 
            <small className="d-block text-white-50">
              Waiting for fund release
            </small>
          }
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
              disabled={isPaymentInEscrow}
              title={isPaymentInEscrow ? "Wait for Land Inspector to release funds" : "Request transfer again"}
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
                    <div>
                      <span className={`badge ${getTransactionStatus(transaction).badge} me-2`}>
                        {getTransactionStatus(transaction).icon}
                        {getTransactionStatus(transaction).text}
                      </span>
                      {transaction.paymentType === 'escrow' && (
                        <span className="badge bg-info">
                          <FaEthereum className="me-1" />
                          Escrow Payment
                        </span>
                      )}
                    </div>
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
                    <h6>Payment Details:</h6>
                    <p className="mb-1">
                      <FaEthereum className="me-2" />
                      Amount: ₹{transaction.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="mb-1">
                      <strong>Date:</strong>{' '}
                      {new Date(transaction.paymentDate).toLocaleDateString()}
                    </p>
                    {transaction.paymentType === 'escrow' && (
                      <div className="alert alert-info py-2 mb-2">
                        {transaction.status === 'inEscrow' ? (
                          <>
                            <FaClock className="me-2" />
                            Payment is held by Land Inspector
                          </>
                        ) : transaction.status === 'releasedToSeller' ? (
                          <>
                            <FaExchangeAlt className="me-2" />
                            Payment released by Land Inspector
                          </>
                        ) : (
                          <>
                            <FaCheckCircle className="me-2" />
                            Transaction completed
                          </>
                        )}
                      </div>
                    )}
                    {transaction.transactionHash && (
                      <p className="mb-1 text-truncate">
                        <strong>Transaction:</strong>{' '}
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${transaction.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary"
                        >
                          {transaction.transactionHash}
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="border-top pt-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <p className={`mb-0 ${transaction.status === 'completed' ? 'text-success' : 'text-muted'}`}>
                        <FaCheckCircle className="me-2" />
                        Sold to {transaction.buyerId.name}
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