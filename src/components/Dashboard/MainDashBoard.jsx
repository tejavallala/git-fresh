import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import '../CSS/metamask.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [loginRole, setLoginRole] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    location: "",
    userType: "",
    governmentId: "",
    governmentIdImage: null,
  });
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [adminWalletAddress, setAdminWalletAddress] = useState("");

  useEffect(() => {
    // Clear admin session when visiting the main dashboard
    sessionStorage.removeItem('adminAddress');
  }, []);

  const handleInitialRoleSelect = (role) => {
    setSelectedRole(role);
    setShowRegistration(true);
    setFormData((prev) => ({ ...prev, userType: role }));
  };

  const handleLoginRoleSelect = (role) => {
    setLoginRole(role);
    setShowLoginForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      governmentIdImage: e.target.files[0],
    }));
  };

  

  const handleAdminMetaMaskLogin = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask to login as admin");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const address = accounts[0];
      setAdminWalletAddress(address);

      const adminWallets = ["0x37622b2e2714ee440a7672e7d83802196530b2bc"];

      if (adminWallets.includes(address.toLowerCase())) {
        sessionStorage.setItem("adminAddress", address);
        navigate("/admin-dashboard");
      } else {
        alert("This wallet is not authorized as admin");
        sessionStorage.removeItem("adminAddress"); // Clear any existing admin session
      }
    } catch (error) {
      console.error("MetaMask login error:", error);
      alert("Failed to connect to MetaMask");
      sessionStorage.removeItem("adminAddress"); // Clear any existing admin session
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (loginRole === "admin") {
        handleAdminMetaMaskLogin();
        return;
      }

      const endpoint =
        loginRole === "seller"
          ? "http://localhost:4000/sellerRouter/login"
          : "http://localhost:4000/buyerRouter/login";

      const response = await axios.post(endpoint, {
        email: loginData.email,
        password: loginData.password,
      });

      alert(response.data.message);

      const userId = response.data.userId;
      const email=response.data.email; // Add this line

      sessionStorage.setItem("userId", userId);
      sessionStorage.setItem("userEmail", email); // Add this line

      // Navigate to the Buyer Dashboard with the userId in the URL (fix space issue here)
      if (loginRole === "seller") {
        navigate(`/seller-dashboard/${userId}`);
      } else if (loginRole === "buyer") {
        navigate(`/buyer-dashboard/${userId}`); // Removed space here
      }else if(loginRole==="admin"){
        navigate("/admin-dashboard")
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("Login failed. Please try again.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      const endpoint =
        formData.userType === "seller"
          ? "http://localhost:4000/sellerRouter/create-user"
          : formData.userType === "buyer"
          ? "http://localhost:4000/buyerRouter/create-user"
          : formData.userType === "admin"
          ? "http://localhost:4000/adminRoute/create-user"
          : null;
          
      if (!endpoint) {
        throw new Error("Invalid user type selected");
      }

      const response = await axios.post(endpoint, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Form submitted successfully:", response.data);
      alert("Registration successful!");
      // Clear form after successful registration
      setFormData({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        location: "",
        userType: "",
        governmentId: "",
        governmentIdImage: null,
      });
      setShowRegistration(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error.message || "Registration failed. Please try again.");
    }
  };

  

  const renderLoginForm = () => {
    if (loginRole === "admin") {
      return (
        <div className="text-center">
          <h2 className="mb-4">Admin Login</h2>
          <p className="mb-4">Connect with MetaMask to access admin panel</p>
          <button
            className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={handleAdminMetaMaskLogin}
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
              alt="MetaMask"
              style={{ width: "24px", height: "24px" }}
            />
            Connect MetaMask
          </button>
          <button
            type="button"
            className="btn btn-secondary mt-3 w-100"
            onClick={() => setShowLoginForm(false)}
          >
            Back
          </button>
        </div>
      );
    }

    return (
      <>
        <h2 className="text-center mb-4">Login Form</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email*
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password*
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />
          </div>
          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary">
              Login
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowLoginForm(false)}
            >
              Back
            </button>
          </div>
        </form>
      </>
    );
  };

  return (
    <div
      style={{
        backgroundImage: `url("https://cms.ezylegal.in/wp-content/uploads/2022/10/registration-land-details.webp")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "2rem",
        padding: "2rem",
      }}
    >
      {/* Login Card */}
      <div
        className="card p-4"
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "10px",
        }}
      >
        {!showLoginForm ? (
          <div className="text-center">
            <h2 className="mb-4">Login</h2>
            <h4 className="mb-4">Welcome Back!</h4>
            <div className="mb-3">
              <label className="form-label">Select Role</label>
              <select
                className="form-select mb-3"
                value={loginRole}
                onChange={(e) => setLoginRole(e.target.value)}
              >
                <option value="">Select Role</option>
                <option value="seller">Seller</option>
                <option value="buyer">Buyer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              className="btn btn-primary w-100"
              onClick={() =>
                loginRole
                  ? handleLoginRoleSelect(loginRole)
                  : alert("Please select a role")
              }
            >
              Login
            </button>
          </div>
        ) : (
          renderLoginForm()
        )}
      </div>
      <div
        className="card p-4"
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "10px",
        }}
      >
        {!showRegistration ? (
          <div className="text-center">
            <h2 className="mb-4">Register</h2>
            <h4 className="mb-4">Join the Digital Era!</h4>
            <div className="mb-3">
              <label className="form-label">Select Role</label>
              <select
                className="form-select mb-3"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">Select Role</option>
                <option value="seller">Seller</option>
                <option value="buyer">Buyer</option>
              </select>
            </div>
            <button
              className="btn btn-primary w-100"
              onClick={() =>
                selectedRole
                  ? handleInitialRoleSelect(selectedRole)
                  : alert("Please select a role")
              }
            >
              Register
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-center mb-4">Registration Form</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Name*
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email*
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password*
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="phoneNumber" className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="form-control"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="location" className="form-label">
                  Location
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="governmentId" className="form-label">
                  Government ID
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="governmentId"
                  name="governmentId"
                  value={formData.governmentId}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="governmentIdImage" className="form-label">
                  Government ID Image
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="governmentIdImage"
                  name="governmentIdImage"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary">
                  Register
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRegistration(false)}
                >
                  Back
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
