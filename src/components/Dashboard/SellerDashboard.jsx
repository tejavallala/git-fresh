import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaCog,
  FaSignOutAlt,
  FaLandmark,
  FaHistory,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function SellerDashboard() {
  const navigate = useNavigate();
  const { userId } = useParams();

  const handleLogout = () => {
    navigate("/");
  };
  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-warning">
        <div className="container">
        <h3> welcome to selling the land </h3> 
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
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/sell-land">
                  <FaLandmark className="me-1" /> sell Land
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/seller-transaction-history">
                  <FaHistory className="me-1" /> Transaction History
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to={`/profiles/${userId}`}>
                  <FaUser className="me-1" /> Profile
                </Link>
              </li>
              <li className="nav-item">
                <button className="nav-link" onClick={handleLogout}>
                  <FaSignOutAlt className="me-1" /> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <h1 style={{ textAlign: "center" }} className="mt-5">
        Seller  Privileges
      </h1>
      <div className="container mt-5 d-flex justify-content-center align-items-center">
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card text-center">
              <div className="card-body">
                <FaLandmark className="card-icon mb-3" />
                <h5 className="card-title">Sell Land</h5>
                <p className="card-text">
                  Explore and purchase available land properties.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="card text-center">
              <div className="card-body">
                <FaHistory className="card-icon mb-3" />
                <h5 className="card-title">Transaction History</h5>
                <p className="card-text">
                  View all your past land transactions and payments.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="card text-center">
              <div className="card-body">
                <FaUser className="card-icon mb-3" />
                <h5 className="card-title">Profile</h5>
                <p className="card-text">
                  Manage your personal information and settings.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="card text-center">
              <div className="card-body">
                <FaCog className="card-icon mb-3" />
                <h5 className="card-title">Settings</h5>
                <p className="card-text">
                  Configure application settings and preferences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SellerDashboard;
