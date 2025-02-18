import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaSignOutAlt,
  FaLandmark,
  FaHistory,
  FaUser,
  FaExclamationCircle,
  FaCheckCircle,
  FaLock,
  FaList,
  FaHome,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SellerDashboard.css";

function SellerDashboard() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [verificationStatus, setVerificationStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sellerData, setSellerData] = useState(null);

  useEffect(() => {
    fetchSellerData();
  }, [userId]);

  const fetchSellerData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/sellerRouter/get-user/${userId}`
      );
      setSellerData(response.data);
      setVerificationStatus(response.data.isVerified || false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching seller data:", error);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("userId");
    navigate("/");
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
          <span>Verified Seller</span>
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
          <h3>Welcome {sellerData?.name}</h3>
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
                  <Link className="nav-link" to="/sell-land">
                    <FaLandmark className="me-1" /> Sell Land
                  </Link>
                ) : (
                  <span
                    className="nav-link text-muted"
                    style={{ cursor: "not-allowed" }}
                  >
                    <FaLock className="me-1" /> Sell Land
                  </span>
                )}
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/seller-transaction-history">
                  <FaHistory className="me-1" /> Transaction History
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to={`/your-lands/${userId}`}>
                  <FaList className="me-1" /> Your Lands
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to={`/profiles/${userId}`}>
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

        <h1 className="text-center mb-5">Seller Dashboard</h1>

        <div className="row justify-content-center g-4">
          <div className="col-md-6 col-lg-4">
            <div
              className={`card h-100 ${!verificationStatus ? "disabled" : ""}`}
            >
              <div className="card-body text-center">
                <FaLandmark className="card-icon mb-3 text-primary" size={24} />
                <h5 className="card-title">Sell Land</h5>
                <p className="card-text">
                  List and manage your land properties for sale.
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

          <div className="col-md-6 col-lg-4">
            <div className="card h-100">
              <div className="card-body text-center">
                <FaHistory className="card-icon mb-3 text-primary" size={24} />
                <h5 className="card-title">Transaction History</h5>
                <p className="card-text">
                  View your past land sale transactions.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="card h-100">
              <div className="card-body text-center">
                <FaUser className="card-icon mb-3 text-primary" size={24} />
                <h5 className="card-title">Profile Settings</h5>
                <p className="card-text">Manage your account information.</p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-4">
                  
                        <div className="card h-100">
                          <div className="card-body text-center">
                            <FaHome className="card-icon mb-3 text-primary" size={24} />
                            <h5 className="card-title">Your Lands</h5>
                            <p className="card-text">View your owned properties and their details.</p>
                          </div>
                        </div>
                    
                    </div>
        </div>
      </div>
    </>
  );
}

export default SellerDashboard;
