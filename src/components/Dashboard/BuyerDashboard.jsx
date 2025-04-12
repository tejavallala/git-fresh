import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  FaSignOutAlt,
  FaLandmark,
  FaHistory,
  FaUser,
  FaExclamationCircle,
  FaCheckCircle,
  FaLock,
  FaCreditCard, // Add this import
  FaHome, // Add this new import
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SellerDashboard";

function BuyerDashboard() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [buyerData, setBuyerData] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0); // Add this state for tracking refresh

  useEffect(() => {
    fetchBuyerData();
    fetchPendingPayments();
  }, [userId, location.key, refreshKey]); // Update useEffect to include refreshKey

  const fetchBuyerData = async () => {
    try {
      const response = await axios.get(
        `https://git-back-k93u.onrender.com/buyerRouter/get-user/${userId}`
      );
      setBuyerData(response.data);
      setVerificationStatus(response.data.isVerified || false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching buyer data:", error);
      setIsLoading(false);
    }
  };

  // Update the fetchPendingPayments function
  const fetchPendingPayments = async () => {
    try {
      const response = await axios.get(
        `https://git-back-k93u.onrender.com/landRoute/pending-payments/${userId}`
      );
      // Show all pending payments without filtering
      setPendingPayments(response.data);
      console.log('Pending payments:', response.data); // Debug log
    } catch (error) {
      console.error("Error fetching pending payments:", error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("userId");
    navigate("/");
  };

  const refreshDashboard = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  const VerificationBadge = () => (
    <div
      className={`verification-badge ${
        verificationStatus ? "verified" : "unverified"
      }`}
    >
      {verificationStatus ? (
        <>
          <FaCheckCircle className="me-2" />
          <span>Verified Buyer</span>
        </>
      ) : (
        <>
          <FaExclamationCircle className="me-2" />
          <span>Pending Verification</span>
        </>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-warning">
        <div className="container">
          <h3>Welcome {buyerData?.name}</h3>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarNav"
          >
            <ul className="navbar-nav align-items-center">
              <li className="nav-item me-3">
                <VerificationBadge />
              </li>
              <li className="nav-item">
                {verificationStatus ? (
                  <Link className="nav-link" to="/buy-land">
                    <FaLandmark className="me-1" /> Buy Land
                  </Link>
                ) : (
                  <span
                    className="nav-link text-muted"
                    style={{ cursor: "not-allowed" }}
                  >
                    <FaLock className="me-1" /> Buy Land
                  </span>
                )}
              </li>
              {/* Add this new nav item */}
              <li className="nav-item">
                <Link className="nav-link" to={`/owned-lands/${userId}`}>
                  <FaHome className="me-1" /> Your Lands
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/transaction-history">
                  <FaHistory className="me-1" /> Transaction History
                </Link>
              </li>
              <li className="nav-item">
                {pendingPayments.length > 0 && (
                  <Link 
                    className="nav-link" 
                    to={`/land-payment/${pendingPayments[0]._id}`}
                  >
                    <FaCreditCard className="me-1" /> 
                    Pending Payment
                    <span className="badge bg-danger ms-2">
                      {pendingPayments.length}
                    </span>
                  </Link>
                )}
              </li>
              <li className="nav-item">
                <Link className="nav-link" to={`/profile/${userId}`}>
                  <FaUser className="me-1" /> Profile
                </Link>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link border-0 bg-transparent"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="me-1" /> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container mt-5">
        {!verificationStatus && (
          <div className="alert alert-warning mb-4" role="alert">
            <FaExclamationCircle className="me-2" />
            <strong>Account Pending Verification:</strong> Your account is
            currently under review. Some features are restricted until a land
            inspector verifies your account.
          </div>
        )}

        <h1 className="text-center mb-5">Buyer Dashboard</h1>

        <div className="row justify-content-center g-4">
          <div className="col-md-6 col-lg-3">
            <div
              className={`card h-100 ${!verificationStatus ? "disabled" : ""}`}
            >
              <div className="card-body text-center">
                <FaLandmark className="card-icon mb-3 text-primary" size={24} />
                <h5 className="card-title">Buy Land</h5>
                <p className="card-text">
                  Explore and purchase available properties.
                </p>
                {!verificationStatus && (
                  <div className="text-danger mt-2">
                    <FaLock className="me-1" />
                    Requires verification
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <FaHistory className="card-icon mb-3 text-primary" size={24} />
                <h5 className="card-title">Transaction History</h5>
                <p className="card-text">View your past land purchases.</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <FaUser className="card-icon mb-3 text-primary" size={24} />
                <h5 className="card-title">Profile Settings</h5>
                <p className="card-text">Manage your account information.</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <FaCreditCard className="card-icon mb-3 text-primary" size={24} />
                <h5 className="card-title">Pending Payments</h5>
                <p className="card-text">
                  Complete payments for approved land requests.
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  {pendingPayments.length > 0 && (
                    <span className="badge bg-danger">
                      {pendingPayments.length} pending
                    </span>
                  )}
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={refreshDashboard}
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Add this inside the row of cards */}
          <div className="col-md-6 col-lg-3">
            <Link to={`/owned-lands/${userId}`} className="text-decoration-none">
              <div className="card h-100">
                <div className="card-body text-center">
                  <FaHome className="card-icon mb-3 text-primary" size={24} />
                  <h5 className="card-title">Your Lands</h5>
                  <p className="card-text">View your owned properties and their details.</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default BuyerDashboard;
