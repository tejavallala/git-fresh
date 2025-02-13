import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaWallet, FaRupeeSign } from "react-icons/fa";

const AddLand = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [userData, setUserData] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    walletAddress: "",
    location: "",
    price: "",
    surveyNumber: "",
    area: "",
  });

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask to connect your wallet");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setWalletAddress(accounts[0]);
      setFormData((prev) => ({ ...prev, walletAddress: accounts[0] }));
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet");
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = sessionStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      const formDataToSend = new FormData();
      formDataToSend.append("userId", userId);

      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      selectedImages.forEach((image) => {
        formDataToSend.append("landImages", image);
      });

      const response = await axios.post(
        "http://localhost:4000/landRoute/create-land",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Land details submitted successfully!");
      navigate("/seller-dashboard");
    } catch (error) {
      console.error("Error submitting land details:", error);
      alert("Failed to submit land details: " + error.message);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = sessionStorage.getItem("userId");
        if (!userId) {
          navigate("/");
          return;
        }

        const response = await axios.get(
          `http://localhost:4000/sellerRouter/get-user/${userId}`
        );
        setUserData(response.data);
        setFormData((prev) => ({
          ...prev,
          name: response.data.name,
          phoneNumber: response.data.phoneNumber || "",
          email: response.data.email || "", // Add email here
        }));
      } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Failed to load user data");
        navigate("/");
      }
    };

    fetchUserData();
  }, [navigate]);

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Add Land Details</h2>

              <form onSubmit={handleSubmit} className="needs-validation">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={formData.name}
                      readOnly
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control bg-light"
                      value={formData.phoneNumber}
                      readOnly
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control bg-light"
                      value={formData.email}
                      readOnly
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Wallet Address</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={walletAddress}
                        readOnly
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={connectWallet}
                      >
                        <FaWallet className="me-2" />
                        Connect Wallet
                      </button>
                    </div>
                  </div>

                  <div className="col-md-6 position-relative">
                    <label className="form-label">Location*</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      placeholder="Enter location"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Price (₹)*</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaRupeeSign />
                      </span>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Survey Number*</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.surveyNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          surveyNumber: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Area (sq. ft)*</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.area}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          area: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Land Images* (Max 5)</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      required
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <button type="submit" className="btn btn-primary w-100">
                      Submit Land Details
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLand;
