import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Container, Spinner } from 'react-bootstrap';

const VerifyUser = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, verified: 0, unverified: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sellers');
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    fetchAllUsers();
  }, [activeTab]);
  

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://git-back-k93u.onrender.com/inspectorRoute/all-users/${activeTab}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      const data = await response.json();
      
      if (!data.users) {
        throw new Error('Invalid response format from server');
      }

      setUsers(data.users);
      setStats({
        total: data.total || 0,
        verified: data.verified || 0,
        unverified: data.unverified || 0
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to fetch users. Please try again.');
      setUsers([]);
      setStats({ total: 0, verified: 0, unverified: 0 });
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
      return (
        <Container className="py-5 text-center">
          <div className="custom-spinner-container">
            <Spinner animation="border" variant="primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading verify Users Page ...</p>
          </div>
        </Container>
      );
    }

  const maskDocumentNumber = (number) => {
    if (!number) return '';
    if (number.length < 4) return number;
    return `${number.slice(0, 2)}${'X'.repeat(number.length - 4)}${number.slice(-2)}`;
  };

  const handleVerify = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://git-back-k93u.onrender.com/inspectorRoute/verify-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userType: activeTab === 'sellers' ? 'sellers' : 'buyers'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }

      await fetchAllUsers(); // Refresh the user list
      // Show success message
      const successAlert = document.createElement('div');
      successAlert.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
      successAlert.style.zIndex = '1050';
      successAlert.textContent = 'User verified successfully!';
      document.body.appendChild(successAlert);
      setTimeout(() => successAlert.remove(), 3000);

    } catch (error) {
      console.error('Error verifying user:', error);
      setError(error.message || 'Failed to verify user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowDocument = (document) => {
    setSelectedDocument(document);
    setShowModal(true);
  };

  const filteredUsers = users.filter(user => {
    if (filterStatus === 'verified') return user.isVerified;
    if (filterStatus === 'unverified') return !user.isVerified;
    return true;
  });

  return (
    <div className="container-fluid py-5 bg-light">
      {/* Header Section */}
      <div className="row mb-5">
        <div className="col-12 text-center">
          <h2 className="display-4 mb-3">User Verification Portal</h2>
          <p className="lead text-muted">Manage and verify user accounts</p>
        </div>
      </div>

      {/* User Type Selector */}
      <div className="row justify-content-center mb-5">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <ul className="nav nav-pills nav-fill">
                <li className="nav-item">
                  <button 
                    className={`nav-link rounded-0 py-3 ${activeTab === 'sellers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sellers')}
                  >
                    <i className="bi bi-shop me-2"></i>
                    Sellers
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link rounded-0 py-3 ${activeTab === 'buyers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('buyers')}
                  >
                    <i className="bi bi-people me-2"></i>
                    Buyers
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row justify-content-center mb-5 g-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center p-4">
              <div className="display-4 text-primary mb-2">{stats.total}</div>
              <div className="text-muted small text-uppercase fw-bold">Total Users</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center p-4">
              <div className="display-4 text-success mb-2">{stats.verified}</div>
              <div className="text-muted small text-uppercase fw-bold">Verified</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center p-4">
              <div className="display-4 text-warning mb-2">{stats.unverified}</div>
              <div className="text-muted small text-uppercase fw-bold">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Cards */}
      <div className="row g-4">
        {filteredUsers.map(user => (
          <div key={user._id} className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="mb-1">{user.name}</h5>
                    <p className="text-muted mb-0 small">
                      <i className="bi bi-envelope me-2"></i>{user.email}
                    </p>
                  </div>
                  <span className={`badge ${user.isVerified ? 'bg-success' : 'bg-warning'} rounded-pill px-3 py-2`}>
                    {user.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-telephone text-primary me-2"></i>
                    <span>{user.phoneNumber}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-card-text text-primary me-2"></i>
                    <span>{maskDocumentNumber(user.governmentId)}</span>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => handleShowDocument(user.governmentIdImage)}
                  >
                    <i className="bi bi-eye me-2"></i>View ID
                  </button>
                  {!user.isVerified && (
                    <button 
                      className="btn btn-success"
                      onClick={() => handleVerify(user._id)}
                    >
                      <i className="bi bi-check-circle me-2"></i>Verify User
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Document Modal */}
      <div 
        className={`modal fade ${showModal ? 'show' : ''}`} 
        style={{ display: showModal ? 'block' : 'none' }}
        onClick={(e) => {
          // Close modal when clicking outside
          if (e.target.className.includes('modal fade')) {
            setShowModal(false);
          }
        }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0">
            <div className="modal-header border-bottom bg-light">
              <h5 className="modal-title">Government ID Document</h5>
              <button 
                type="button" 
                className="btn-close"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              />
            </div>
            <div className="modal-body p-0">
              {selectedDocument && (
                <img
                  src={`data:${selectedDocument.contentType};base64,${selectedDocument.data}`}
                  alt="Government ID"
                  className="img-fluid"
                />
              )}
            </div>
            <div className="modal-footer border-top">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
        {showModal && <div className="modal-backdrop fade show" onClick={() => setShowModal(false)}></div>}
      </div>

      
    </div>
  );
};

export default VerifyUser;