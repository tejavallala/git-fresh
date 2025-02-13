import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard/MainDashBoard";
import SellerDashboard from "./components/Dashboard/SellerDashboard";
import BuyerDashboard from "./components/Dashboard/BuyerDashboard";
import AddLand from "./components/RegistrationPages/AddLand";
import Transaction from "./components/Transactions/BuyerTransactionHistory";
import BuyerProfile from "./components/profiles/BuyerProfile";
import SellerProfile from "./components/profiles/SellerProfile";
import SellerTransaction from "./components/Transactions/SellerTransactionsHistory";
import LandInspectorDashboard from "./components/Dashboard/LandInspectorDashboard";
import VerifyUser from "./components/Verifications/VerifyUsers";
import ProtectedRoute from "./components/ProtectedRoute";
import YourLands from "./components/Lands/YourLands";
import VerifyLand from "./components/Verifications/VerifyLand";
import BuyLand from "./components/Lands/BuyLand";

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/seller-dashboard/:userId"
            element={<SellerDashboard />}
          />
          <Route path="/buyer-dashboard/:userId" element={<BuyerDashboard />} />
          <Route path="/transaction-history" element={<Transaction />} />
          <Route path="/profile/:userId" element={<BuyerProfile />} />
          <Route path="/sell-land" element={<AddLand />} />
          <Route path="/buy-land" element={<BuyLand />} />
          <Route
            path="/seller-transaction-history"
            element={<SellerTransaction />}
          />
          <Route path="/profiles/:userId" element={<SellerProfile />} />
          <Route path="/verify-user" element={<VerifyUser />} />
          <Route path="/your-lands/:userId" element={<YourLands />} />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <LandInspectorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verify-land"
            element={
              <ProtectedRoute>
                <VerifyLand />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
