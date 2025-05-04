import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Landmark,
  UserCheck,
  ShoppingCart,
  RefreshCw,
  Clock,
  Wallet,
  LogOut,
  Database,
  Users,
  DollarSign,
  BarChart2,
  Percent,
  Menu,
  Home,
  Settings
} from "lucide-react";
import "../CSS/landInspectorDashboard.css";

const LandInspectorDashboard = () => {
  const [loginTime, setLoginTime] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [counts, setCounts] = useState({
    pendingLands: 0,
    pendingUsers: 0,
    pendingPurchases: 0,
    pendingTransfers: 0
  });
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalLands: 0,
    totalValue: 0,
    verificationRate: 0,
    recentTransactions: [],
    monthlyStats: []
  });
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const address = sessionStorage.getItem("adminAddress") || "0x8f5a2B5C0Bd2B5C0Bd2B5C0Bd2B5C0Bd2B5C0Bd";
    const storedLoginTime = sessionStorage.getItem("loginTime");

    if (!storedLoginTime) {
      const currentTime = new Date().toLocaleTimeString();
      sessionStorage.setItem("loginTime", currentTime);
      setLoginTime(currentTime);
    } else {
      setLoginTime(storedLoginTime);
    }

    setWalletAddress(address);

    // Check for mobile view
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsExpanded(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [navigate]);

  const fetchDashboardStatistics = async () => {
    try {
      const res = await axios.get('http://localhost:4000/landRoute/dashboard-statistics');
      
      setStatistics({
        totalUsers: res.data.totalUsers,
        totalLands: res.data.totalLands,
        totalValue: res.data.totalValue,
        verificationRate: res.data.verificationRate,
        recentTransactions: res.data.recentTransactions,
        monthlyStats: res.data.monthlyStats
      });

      // Update pending counts
      setCounts({
        pendingLands: res.data.pendingVerifications.lands,
        pendingUsers: res.data.pendingVerifications.users,
        pendingPurchases: res.data.pendingVerifications.purchases,
        pendingTransfers: res.data.pendingVerifications.transfers
      });
    } catch (err) {
      console.error("Error fetching dashboard statistics:", err);
    }
  };

  useEffect(() => {
    fetchDashboardStatistics();
    
    // Refresh every 30 seconds
    const intervalId = setInterval(fetchDashboardStatistics, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAddress");
    sessionStorage.removeItem("loginTime");
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const renderTransactions = () => (
    <div className="transaction-list">
      <div className="transaction-headers">
        <span>ID</span>
        <span>Type</span>
        <span>Amount</span>
        <span>Status</span>
        <span>Buyer</span>
        <span>Seller</span>
      </div>
      {statistics.recentTransactions.map((tx) => (
        <div className="transaction-item" key={tx.id}>
          <span className="transaction-id">{tx.id.substring(0, 8)}</span>
          <span className="transaction-type">{tx.type}</span>
          <span className="transaction-amount">₹{tx.amount.toLocaleString()}</span>
          <span className={`transaction-status ${tx.status.toLowerCase()}`}>
            {tx.status}
          </span>
          <span className="transaction-buyer">{tx.buyerName}</span>
          <span className="transaction-seller">{tx.sellerName}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button 
          className="mobile-toggle-btn"
          onClick={toggleSidebar}
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isExpanded ? "expanded" : "collapsed"}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            
            {isExpanded && <h3>Land Registry</h3>}
          </div>
          {!isMobile && (
            <button className="toggle-btn" onClick={toggleSidebar}>
              <Menu size={20} />
            </button>
          )}
        </div>

        <div className="sidebar-menu">
          <div className="menu-section">
            <span className="menu-label">{isExpanded && "MAIN"}</span>
            <ul className="nav-links">
              <li className={location.pathname === "/admin-dashboard" ? "active" : ""}>
                <Link to="/admin-dashboard">
                  <Home size={20} />
                  {isExpanded && <span>Dashboard</span>}
                </Link>
              </li>
            </ul>
          </div>

          <div className="menu-section">
            <span className="menu-label">{isExpanded && "VERIFICATION"}</span>
            <ul className="nav-links">
              <li className={location.pathname === "/verify-land" ? "active" : ""}>
                <Link to="/verify-land">
                  <Landmark size={20} />
                  {isExpanded && (
                    <>
                      <span>Verify Land</span>
                      {counts.pendingLands > 0 && (
                        <span className="badge pulse">{counts.pendingLands}</span>
                      )}
                    </>
                  )}
                </Link>
              </li>
              <li className={location.pathname === "/verify-user" ? "active" : ""}>
                <Link to="/verify-user">
                  <UserCheck size={20} />
                  {isExpanded && (
                    <>
                      <span>Verify Users</span>
                      {counts.pendingUsers > 0 && (
                        <span className="badge pulse">{counts.pendingUsers}</span>
                      )}
                    </>
                  )}
                </Link>
              </li>
              <li className={location.pathname === "/verify-purchases" ? "active" : ""}>
                <Link to="/verify-purchases">
                  <ShoppingCart size={20} />
                  {isExpanded && (
                    <>
                      <span>Verify Purchases</span>
                      {counts.pendingPurchases > 0 && (
                        <span className="badge pulse">{counts.pendingPurchases}</span>
                      )}
                    </>
                  )}
                </Link>
              </li>
              <li className={location.pathname === "/transfer-ownership" ? "active" : ""}>
                <Link to="/transfer-ownership">
                  <RefreshCw size={20} />
                  {isExpanded && (
                    <>
                      <span>Transfer Ownership</span>
                      {counts.pendingTransfers > 0 && (
                        <span className="badge pulse">{counts.pendingTransfers}</span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            </ul>
          </div>

          <div className="menu-section">
            <span className="menu-label">{isExpanded && "FINANCE"}</span>
            <ul className="nav-links">
              <li className={location.pathname === "/escrow-payments" ? "active" : ""}>
                <Link to="/escrow-payments">
                  <Wallet size={20} />
                  {isExpanded && (
                    <>
                      <span>Escrow Payments</span>
                      {counts.pendingPayments > 0 && (
                        <span className="badge pulse">{counts.pendingPayments}</span>
                      )}
                    </>
                  )}
                </Link>
              </li>
              <li className={location.pathname === "/transfer-history" ? "active" : ""}>
                <Link to="/transfer-history">
                  <Database size={20} />
                  {isExpanded && <span>Transfer History</span>}
                </Link>
              </li>
            </ul>
          </div>

          <div className="menu-section">
            <span className="menu-label">{isExpanded && "SETTINGS"}</span>
            <ul className="nav-links">
              <li className={location.pathname === "/history" ? "active" : ""}>
                <Link to="/history">
                  <Settings size={20} />
                  {isExpanded && <span>EC DOWNLOAD</span>}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="sidebar-footer">
          {isExpanded ? (
            <div className="user-info">
              <div className="login-time">
                <Clock size={16} />
                <span>{loginTime}</span>
              </div>
              <div className="wallet-address">
                <Wallet size={16} />
                <span>{walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}</span>
              </div>
              <button
                onClick={handleLogout}
                className="logout-btn"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="logout-btn-icon"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${!isExpanded ? "expanded" : ""}`}>
        <div className="dashboard-header">
          <h1>Land Inspector Dashboard</h1>
          <div className="date-display">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>

        <div className="stats-overview">
          <div className="stats-card">
            <div className="stats-icon users-icon">
              <Users size={24} />
            </div>
            <div className="stats-info">
              <h3>{statistics.totalUsers.toLocaleString()}</h3>
              <p>Total Users</p>
            </div>
            <div className="stats-progress" style={{ width: `${Math.min(statistics.totalUsers / 2000 * 100, 100)}%` }}></div>
          </div>

          <div className="stats-card">
            <div className="stats-icon lands-icon">
              <Landmark size={24} />
            </div>
            <div className="stats-info">
              <h3>{statistics.totalLands.toLocaleString()}</h3>
              <p>Total Lands</p>
            </div>
            <div className="stats-progress" style={{ width: `${Math.min(statistics.totalLands / 1000 * 100, 100)}%` }}></div>
          </div>

          <div className="stats-card">
            <div className="stats-icon value-icon">
              <DollarSign size={24} />
            </div>
            <div className="stats-info">
              <h3>₹{(statistics.totalValue / 10000000).toFixed(2)}Cr</h3>
              <p>Total Value</p>
            </div>
            <div className="stats-progress" style={{ width: `${Math.min(statistics.totalValue / 50000000 * 100, 100)}%` }}></div>
          </div>

          <div className="stats-card">
            <div className="stats-icon rate-icon">
              <Percent size={24} />
            </div>
            <div className="stats-info">
              <h3>{statistics.verificationRate}%</h3>
              <p>Verification Rate</p>
            </div>
            <div className="stats-progress" style={{ width: `${statistics.verificationRate}%` }}></div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Pending Verifications Summary */}
          <div className="verification-summary">
            <div className="card-header">
              <h2>Pending Verifications</h2>
              <div className="card-actions">
                <button className="refresh-btn" onClick={fetchDashboardStatistics}>
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
            <div className="verification-grid">
              <div className="verification-item">
                <div className="verification-icon users-bg">
                  <UserCheck size={24} />
                </div>
                <div className="verification-details">
                  <h3>{counts.pendingUsers}</h3>
                  <p>Users</p>
                </div>
                {counts.pendingUsers > 0 && (
                  <Link to="/verify-user" className="action-link">
                    Verify Now
                  </Link>
                )}
              </div>

              <div className="verification-item">
                <div className="verification-icon lands-bg">
                  <Landmark size={24} />
                </div>
                <div className="verification-details">
                  <h3>{counts.pendingLands}</h3>
                  <p>Lands</p>
                </div>
                {counts.pendingLands > 0 && (
                  <Link to="/verify-land" className="action-link">
                    Verify Now
                  </Link>
                )}
              </div>

              <div className="verification-item">
                <div className="verification-icon purchases-bg">
                  <ShoppingCart size={24} />
                </div>
                <div className="verification-details">
                  <h3>{counts.pendingPurchases}</h3>
                  <p>Purchases</p>
                </div>
                {counts.pendingPurchases > 0 && (
                  <Link to="/verify-purchases" className="action-link">
                    Verify Now
                  </Link>
                )}
              </div>

              <div className="verification-item">
                <div className="verification-icon transfers-bg">
                  <RefreshCw size={24} />
                </div>
                <div className="verification-details">
                  <h3>{counts.pendingTransfers}</h3>
                  <p>Transfers</p>
                </div>
                {counts.pendingTransfers > 0 && (
                  <Link to="/transfer-ownership" className="action-link">
                    Verify Now
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="transactions">
            <div className="card-header">
              <h2>Recent Transactions</h2>
              <div className="card-actions">
                <Link to="/transfer-history" className="view-all">
                  View All
                </Link>
              </div>
            </div>
            {renderTransactions()}
          </div>
        </div>

        {/* Activity Chart - Placeholder for an actual chart that would be implemented */}
        <div className="activity-chart">
          <div className="card-header">
            <h2>Monthly Activity</h2>
            <div className="card-actions">
              <select className="period-selector">
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>Last Year</option>
              </select>
            </div>
          </div>
          <div className="chart-placeholder">
            <BarChart2 size={48} />
            <p>Chart data visualization would appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandInspectorDashboard;