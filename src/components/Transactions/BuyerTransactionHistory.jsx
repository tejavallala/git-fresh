import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCheckCircle, FaEthereum, FaMapMarkerAlt, FaClock, FaExchangeAlt } from "react-icons/fa";

function BuyerTransaction() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/landRoute/user-transactions/${userId}`
      );
      setTransactions(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success';
      case 'inEscrow':
        return 'bg-warning';
      case 'releasedToSeller':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="me-1" />;
      case 'inEscrow':
        return <FaClock className="me-1" />;
      case 'releasedToSeller':
        return <FaExchangeAlt className="me-1" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'inEscrow':
        return 'In Escrow';
      case 'releasedToSeller':
        return 'Released to Seller';
      default:
        return 'Processing';
    }
  };

  const getTransactionMessage = (transaction, userId) => {
    const isBuyer = transaction.buyerId._id === userId;

    if (transaction.paymentType === 'escrow') {
      switch (transaction.status) {
        case 'inEscrow':
          return (
            <div className="alert alert-warning mb-0 py-2">
              <FaClock className="me-2" />
              {isBuyer 
                ? 'Payment sent to Land Inspector. Waiting for verification and release to seller.'
                : 'Buyer payment is held by Land Inspector. Waiting for release.'}
            </div>
          );
        case 'releasedToSeller':
          return (
            <div className="alert alert-info mb-0 py-2">
              <FaExchangeAlt className="me-2" />
              Payment has been released by Land Inspector
            </div>
          );
        case 'completed':
          return (
            <p className="text-success mb-0">
              <FaCheckCircle className="me-2" />
              {isBuyer
                ? `Successfully purchased from ${transaction.sellerId.name}`
                : `Successfully sold to ${transaction.buyerId.name}`}
            </p>
          );
        default:
          return null;
      }
    } else {
      return (
        <p className="text-success mb-0">
          <FaCheckCircle className="me-2" />
          {isBuyer
            ? `Successfully purchased from ${transaction.sellerId.name}`
            : `Successfully sold to ${transaction.buyerId.name}`}
        </p>
      );
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" /></div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Transaction History</h2>
      {transactions.length === 0 ? (
        <div className="alert alert-info">No transactions found.</div>
      ) : (
        <div className="row">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">
                      {transaction.buyerId._id === userId ? "Land Purchased" : "Land Sold"}
                    </h5>
                    <span className={`badge ${getStatusBadgeClass(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      {getStatusText(transaction.status)}
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
                    <h6>Transaction Details:</h6>
                    <p className="mb-1">
                      <FaEthereum className="me-2" />
                      Price: ₹{transaction.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="mb-1">
                      <strong>Date:</strong>{' '}
                      {new Date(transaction.paymentDate).toLocaleDateString()}
                    </p>
                    <p className="mb-1">
                      <strong>Payment Type:</strong>{' '}
                      <span className={`badge ${transaction.paymentType === 'escrow' ? 'bg-info' : 'bg-primary'}`}>
                        {transaction.paymentType === 'escrow' ? 'Escrow Payment' : 'Direct Payment'}
                      </span>
                    </p>
                    {transaction.transactionHash && (
                      <p className="mb-1 text-truncate">
                        <strong>Transaction Hash:</strong>{' '}
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
                    {getTransactionMessage(transaction, userId)}
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

export default BuyerTransaction;