import React, { useState } from 'react';
import axios from 'axios';
import { Download, Search } from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import '../CSS/LandHistory.css';

const LandHistory = () => {
  const [landId, setLandId] = useState('');
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLandHistory = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:4000/landRoute/land-history/${landId}`);
      setHistory(response.data);
    } catch (err) {
      setError('Failed to fetch land history. Please check the Land ID.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Land Ownership History', 105, 15, { align: 'center' });
      
      // Add land details
      doc.setFontSize(16);
      doc.text('Land Details', 14, 30);
      doc.setFontSize(12);
      doc.text(`Survey Number: ${history.surveyNumber}`, 14, 40);
      doc.text(`Location: ${history.location}`, 14, 47);
      doc.text(`Area: ${history.area} sq ft`, 14, 54);

      // Previous owners table
      doc.setFontSize(16);
      doc.text('Previous Owners', 14, 140);

      const tableData = history.previousOwners.map(owner => [
        owner.name,
        new Date(owner.from).toLocaleDateString(),
        new Date(owner.to).toLocaleDateString(),
        `₹${owner.transferPrice?.toLocaleString() || 'N/A'}`
      ]);

      // Using autoTable directly
      autoTable(doc, {
        startY: 150,
        head: [['Name', 'From', 'To', 'Transfer Price']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 10 }
      });

      // Add verification status if exists
      const finalY = doc.lastAutoTable.finalY || 150;
      if (history.verificationStatus) {
        doc.setFontSize(12);
        doc.text(`Verification Status: ${history.verificationStatus}`, 14, finalY + 20);
        if (history.verificationDate) {
          doc.text(`Verified On: ${new Date(history.verificationDate).toLocaleDateString()}`, 14, finalY + 27);
        }
      }

      // Save the PDF
      doc.save(`land-history-${history.surveyNumber || 'download'}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center mb-5">
        <div className="col-md-8 text-center">
          <h2 className="display-4 mb-3">Land Ownership History</h2>
          <p className="lead text-muted">Track the complete ownership timeline of any land</p>
        </div>
      </div>

      <div className="row justify-content-center mb-4">
        <div className="col-md-6">
          <form onSubmit={fetchLandHistory} className="search-form">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Land ID"
                value={landId}
                onChange={(e) => setLandId(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                ) : (
                  <Search size={20} />
                )}
                <span className="ms-2">Search</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      {history && (
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Land Details</h5>
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={generatePDF}
                  disabled={!history}
                >
                  <Download size={16} className="me-2" />
                  Download PDF
                </button>
              </div>
              <div className="card-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="text-muted">Current Owner</h6>
                    <p className="mb-1"><strong>Name:</strong> {history.currentOwner.name}</p>
                    <p className="mb-1"><strong>Since:</strong> {new Date(history.currentOwner.since).toLocaleDateString()}</p>
                    <p className="mb-1"><strong>Contact:</strong> {history.currentOwner.contact}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted">Land Information</h6>
                    <p className="mb-1"><strong>Survey Number:</strong> {history.surveyNumber}</p>
                    <p className="mb-1"><strong>Location:</strong> {history.location}</p>
                    <p className="mb-1"><strong>Area:</strong> {history.area} sq ft</p>
                  </div>
                </div>

                <h6 className="text-muted mb-3">Previous Owners</h6>
                <div className="timeline">
                  {history.previousOwners.map((owner, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h6>{owner.name}</h6>
                        <p className="text-muted mb-1">
                          {new Date(owner.from).toLocaleDateString()} - {new Date(owner.to).toLocaleDateString()}
                        </p>
                        <p className="small mb-0">Transfer Price: ₹{owner.transferPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandHistory;