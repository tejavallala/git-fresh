import React, { useState } from "react";

const SellerForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    location: "",
    price: "",
    surveyNumber: "",
    area: "",
    landImages: null,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prevData) => ({ ...prevData, landImages: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    try {
      const response = await fetch("http://localhost:4000/api/seller/submit-land", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        setMessage("Land details submitted successfully!");
        setFormData({
          name: "",
          phoneNumber: "",
          location: "",
          price: "",
          surveyNumber: "",
          area: "",
          landImages: null,
        });
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message}`);
      }
    } catch (error) {
      setMessage("An error occurred while submitting the form.");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Submit Land Details</h2>
      {message && <p className="alert alert-info">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
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
          <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
          <input
            type="text"
            className="form-control"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="location" className="form-label">Location</label>
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
          <label htmlFor="price" className="form-label">Price</label>
          <input
            type="number"
            className="form-control"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="surveyNumber" className="form-label">Survey Number</label>
          <input
            type="text"
            className="form-control"
            id="surveyNumber"
            name="surveyNumber"
            value={formData.surveyNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="area" className="form-label">Area (sqft)</label>
          <input
            type="number"
            className="form-control"
            id="area"
            name="area"
            value={formData.area}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="landImages" className="form-label">Upload Land Image</label>
          <input
            type="file"
            className="form-control"
            id="landImages"
            name="landImages"
            onChange={handleFileChange}
            accept="image/*"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default SellerForm;
