import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaClock, FaWallet, FaSignOutAlt } from 'react-icons/fa';
import '../CSS/landInspectorDashboard.css';

const LandInspectorDashboard = () => {
  const [loginTime, setLoginTime] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const address = sessionStorage.getItem('adminAddress');
    const storedLoginTime = sessionStorage.getItem('loginTime');
    
    if (!address) {
      navigate('/');
      return;
    }

    if (!storedLoginTime) {
      const currentTime = new Date().toLocaleTimeString();
      sessionStorage.setItem('loginTime', currentTime);
      setLoginTime(currentTime);
    } else {
      setLoginTime(storedLoginTime);
    }

    setWalletAddress(address);
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAddress');
    sessionStorage.removeItem('loginTime');
    navigate('/');
  };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
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
                <Link className="nav-link px-3" to="/verify-land">
                  Verify Land
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3" to="/verify-user">
                  Verify User
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3" to="/verify-purchases">
                  Verify Purchases
                </Link>
              </li>
            </ul>

            <ul className="navbar-nav align-items-center">
              <li className="nav-item">
                <div className="d-flex align-items-center text-light px-3">
                  <FaClock className="me-2" />
                  <span className="small" data-bs-toggle="tooltip" data-bs-placement="bottom" title={`Logged in at: ${loginTime}`}>
                    {loginTime}
                  </span>
                </div>
              </li>
              
              <li className="nav-item">
                <div className="d-flex align-items-center text-light px-3 border-start border-light border-opacity-25">
                  <FaWallet className="me-2" />
                  <span className="small">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </div>
              </li>

              <li className="nav-item">
                <button 
                  className="btn btn-link text-light text-decoration-none px-3 border-start border-light border-opacity-25" 
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="me-2" />
                  <span className="small">Logout</span>
                </button>
              </li>
            </ul>
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