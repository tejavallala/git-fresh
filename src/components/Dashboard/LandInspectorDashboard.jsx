import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaUserCheck,
  FaLandmark,
  FaShoppingCart,
  FaExchangeAlt,
  FaClock,
  FaWallet,
  FaSignOutAlt,
  FaHistory, // Add this
} from "react-icons/fa";
import axios from "axios";
import "../CSS/landInspectorDashboard.css";

const LandInspectorDashboard = () => {
  const [loginTime, setLoginTime] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [counts, setCounts] = useState({
    pendingLands: 0,
    pendingUsers: 0,
    pendingPurchases: 0,
    pendingTransfers: 0,
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const address = sessionStorage.getItem("adminAddress");
    const storedLoginTime = sessionStorage.getItem("loginTime");

    if (!address) {
      navigate("/");
      return;
    }

    if (!storedLoginTime) {
      const currentTime = new Date().toLocaleTimeString();
      sessionStorage.setItem("loginTime", currentTime);
      setLoginTime(currentTime);
    } else {
      setLoginTime(storedLoginTime);
    }

    setWalletAddress(address);
  }, [navigate]);

  const fetchPendingCounts = async () => {
    try {
      const response = await axios.get(
        "https://git-back-k93u.onrender.com/landRoute/pending-counts"
      );
      setCounts(response.data);
    } catch (error) {
      console.error("Error fetching pending counts:", error);
    }
  };

  useEffect(() => {
    fetchPendingCounts();
    // Set up interval to refresh counts
    const interval = setInterval(fetchPendingCounts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAddress");
    sessionStorage.removeItem("loginTime");
    navigate("/");
  };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm land-inspector-nav">
        <div className="container-fluid px-4">
          <Link className="navbar-brand fw-bold" to="/">
            Land Inspector Portal
          </Link>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link
                  className="nav-link px-3 d-flex align-items-center"
                  to="/verify-land"
                >
                  <FaLandmark className="me-2" />
                  Verify Land
                  {counts.pendingLands > 0 && (
                    <span className="badge bg-danger ms-2 pulse">
                      {counts.pendingLands}
                    </span>
                  )}
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link px-3 d-flex align-items-center"
                  to="/verify-user"
                >
                  <FaUserCheck className="me-2" />
                  Verify User
                  {counts.pendingUsers > 0 && (
                    <span className="badge bg-danger ms-2 pulse">
                      {counts.pendingUsers}
                    </span>
                  )}
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link px-3 d-flex align-items-center"
                  to="/verify-purchases"
                >
                  <FaShoppingCart className="me-2" />
                  Verify Purchases
                  {counts.pendingPurchases > 0 && (
                    <span className="badge bg-danger ms-2 pulse">
                      {counts.pendingPurchases}
                    </span>
                  )}
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link px-3 d-flex align-items-center"
                  to="/transfer-ownership"
                >
                  <FaExchangeAlt className="me-2" />
                  Transfer Ownership
                  {counts.pendingTransfers > 0 && (
                    <span className="badge bg-danger ms-2 pulse">
                      {counts.pendingTransfers}
                    </span>
                  )}
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link px-3 d-flex align-items-center ${
                    location.pathname === '/transfer-history' ? 'active' : ''
                  }`}
                  to="/transfer-history"
                >
                  <FaHistory className="me-2" />
                  Transfer History
                </Link>
              </li>
            </ul>
            <li className="nav-item">
                <Link
                  className="nav-link px-3 d-flex align-items-center"
                  to="/mobile-fingerprint"
                >
                  <FaLandmark className="me-2" />
                  mobile fingerprint
                
                </Link>
              </li>

            <div className="d-flex align-items-center text-light">
              <div className="me-4 d-flex align-items-center">
                <FaClock className="me-2" />
                <small>Login: {loginTime}</small>
              </div>
              <div className="me-4 d-flex align-items-center">
                <FaWallet className="me-2" />
                <small 
                  className="text-truncate" 
                  style={{ maxWidth: '150px' }}
                  data-tooltip={walletAddress}
                >
                  {walletAddress}
                </small>
              </div>
              <button 
                onClick={handleLogout}
                className="btn btn-outline-light btn-sm d-flex align-items-center"
              >
                <FaSignOutAlt className="me-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-fluid p-4">
        {/* Your dashboard content goes here */}
      </div>
    </div>
  );
};

export default LandInspectorDashboard;
