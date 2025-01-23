import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from "./components/Dashboard/MainDashBoard";
import SellerDashboard from "./components/Dashboard/SellerDashboard";
import BuyerDashboard from "./components/Dashboard/BuyerDashboard";
import AddLand from "./components/RegistrationPages/AddLand";
import Transaction from "./components/Transactions/BuyerTransactionHistory";
import BuyerProfile from "./components/profiles/BuyerProfile";
import SellerProfile from "./components/profiles/SellerProfile";
import AllLands from "./components/RegistrationPages/AllLands";
import SellerTransaction from "./components/Transactions/SellerTransactionsHistory";

const App = () => {
  return (
    <Router>
        <div className="App">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/seller-dashboard/:userId" element={<SellerDashboard />} />
        <Route path="/buyer-dashboard/:userId" element={<BuyerDashboard />} />
        <Route path="/buy-land"element={<AllLands/>}/>
        <Route path="/transaction-history"element={<Transaction/>}/>
        <Route path="/profile/:userId"element={<BuyerProfile/>}/>
        <Route path="/sell-land"element={<AddLand/>}/>
        <Route path="/seller-transaction-history"element={<SellerTransaction/>}/>
        <Route path="/profiles/:userId"element={<SellerProfile/>}/>
      </Routes>
      </div>
    </Router>
  );
};

export default App;
