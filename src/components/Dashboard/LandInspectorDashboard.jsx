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
  FaHistory,
  FaUsers,
  FaRupeeSign,
  FaChartLine,
  FaPercentage,
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
    pendingPayments: 0,
  });
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalLands: 0,
    totalValue: 0,
    monthlyTransactions: 0,
    verificationRate: 0,
    pendingPayments: 0,
    recentTransactions: [],
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
        "http://localhost:4000/landRoute/pending-counts"
      );
      setCounts(response.data);
    } catch (error) {
      console.error("Error fetching pending counts:", error);
    }
  };

  const fetchDashboardStatistics = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/landRoute/dashboard-statistics"
      );
      setStatistics(response.data);
    } catch (error) {
      console.error("Error fetching dashboard statistics:", error);
    }
  };

  useEffect(() => {
    fetchPendingCounts();
    fetchDashboardStatistics();
    // Set up interval to refresh counts and statistics
    const intervalCounts = setInterval(fetchPendingCounts, 30000); // Refresh every 30 seconds
    const intervalStats = setInterval(fetchDashboardStatistics, 60000); // Refresh every minute
    return () => {
      clearInterval(intervalCounts);
      clearInterval(intervalStats);
    };
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
                    location.pathname === "/escrow-payments" ? "active" : ""
                  }`}
                  to="/escrow-payments"
                >
                  <FaWallet className="me-2" />
                  Escrow Payments
                  {counts.pendingPayments > 0 && (
                    <span className="badge bg-danger ms-2 pulse">
                      {counts.pendingPayments}
                    </span>
                  )}
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link px-3 d-flex align-items-center ${
                    location.pathname === "/transfer-history" ? "active" : ""
                  }`}
                  to="/transfer-history"
                >
                  <FaHistory className="me-2" />
                  Transfer History
                </Link>
              </li>
            </ul>

            <div className="d-flex align-items-center text-light">
              <div className="me-4 d-flex align-items-center">
                <FaClock className="me-2" />
                <small>Login: {loginTime}</small>
              </div>
              <div className="me-4 d-flex align-items-center">
                <FaWallet className="me-2" />
                <small
                  className="text-truncate"
                  style={{ maxWidth: "150px" }}
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
        <div className="row g-4">
          {/* Statistics Cards */}
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Total Users</h6>
                    <h3 className="mb-0">{statistics.totalUsers}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <FaUsers className="text-primary fs-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Total Lands</h6>
                    <h3 className="mb-0">{statistics.totalLands}</h3>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <FaLandmark className="text-success fs-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Total Value</h6>
                    <h3 className="mb-0">
                      <FaRupeeSign className="fs-5" />
                      {new Intl.NumberFormat("en-IN").format(
                        statistics.totalValue
                      )}
                    </h3>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded">
                    <FaChartLine className="text-warning fs-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Verification Rate</h6>
                    <h3 className="mb-0">{statistics.verificationRate}%</h3>
                  </div>
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <FaPercentage className="text-info fs-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Verifications Summary */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">Pending Verifications</h5>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                        <FaUserCheck className="text-primary" />
                      </div>
                      <div>
                        <h6 className="mb-0">Users</h6>
                        <h4 className="mb-0">{counts.pendingUsers}</h4>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                        <FaLandmark className="text-success" />
                      </div>
                      <div>
                        <h6 className="mb-0">Lands</h6>
                        <h4 className="mb-0">{counts.pendingLands}</h4>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                        <FaShoppingCart className="text-warning" />
                      </div>
                      <div>
                        <h6 className="mb-0">Purchases</h6>
                        <h4 className="mb-0">{counts.pendingPurchases}</h4>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <div className="bg-danger bg-opacity-10 p-3 rounded me-3">
                        <FaExchangeAlt className="text-danger" />
                      </div>
                      <div>
                        <h6 className="mb-0">Transfers</h6>
                        <h4 className="mb-0">{counts.pendingTransfers}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">Recent Transactions</h5>
                <div className="table-responsive" style={{ maxHeight: "300px" }}>
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistics.recentTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>#{transaction.id}</td>
                          <td>{transaction.type}</td>
                          <td>
                            ₹
                            {new Intl.NumberFormat("en-IN").format(
                              transaction.amount
                            )}
                          </td>
                          <td>
                            <span
                              className={`badge bg-${
                                transaction.status === "Completed"
                                  ? "success"
                                  : "warning"
                              }`}
                            >
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandInspectorDashboard;
