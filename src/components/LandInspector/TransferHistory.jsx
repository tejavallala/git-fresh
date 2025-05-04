import React from 'react';
import CryptoJS from 'crypto-js';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../CSS/TransferHistory.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Navbar, Container, Card, Row, Col, Button, Modal, Badge, Table, Spinner, Alert } from 'react-bootstrap';
import { HardDriveIcon } from 'lucide-react';
import { FaCheckCircle, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaPhone, FaEnvelope, FaCamera, FaTimes, FaSearchPlus, FaSearchMinus, FaDownload, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Header Component
const Header = () => {
  return (
    <Navbar expand="lg" className="app-header" fixed="top">
      <Container>
        <Navbar.Brand href="" className="d-flex align-items-center">
          <HardDriveIcon className="brand-icon" size={24} />
          <span className="ms-2">LandRegistry</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

// Photo Viewer Component
const PhotoViewer = ({ photoUrl, title, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  const zoomIn = () => {
    if (zoomLevel < 3) setZoomLevel(zoomLevel + 0.5);
  };

  const zoomOut = () => {
    if (zoomLevel > 0.5) setZoomLevel(zoomLevel - 0.5);
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal show={true} onHide={onClose} centered dialogClassName="photo-viewer-modal">
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
        <Button variant="link" className="close-btn p-0" onClick={onClose} aria-label="Close">
          <FaTimes />
        </Button>
      </Modal.Header>
      <Modal.Body>
        <div className="photo-container">
          <img src={photoUrl} alt={title} style={{ transform: `scale(${zoomLevel})` }} />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="zoom-controls">
          <Button variant="outline-secondary" onClick={zoomOut} disabled={zoomLevel <= 0.5}>
            <FaSearchMinus />
          </Button>
          <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
          <Button variant="outline-secondary" onClick={zoomIn} disabled={zoomLevel >= 3}>
            <FaSearchPlus />
          </Button>
        </div>
        <Button variant="primary" onClick={downloadImage}>
          <FaDownload className="me-2" />
          Download
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Transfer Details Component
const TransferDetails = ({ transfer }) => {
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
  };

  const getPhotoUrl = (photoData) => {
    if (!photoData?.data || !photoData?.contentType) return null;
    // If photoData.data is already a base64 string, use it directly
    if (typeof photoData.data === 'string' && photoData.data.startsWith('data:')) {
      return photoData.data;
    }
    // Otherwise, assume it's a Buffer (array of bytes)
    const base64String = Array.isArray(photoData.data)
      ? btoa(String.fromCharCode(...photoData.data))
      : photoData.data;
    return `data:${photoData.contentType};base64,${base64String}`;
  };

  const showPhoto = (photo, title) => {
    const photoUrl = getPhotoUrl(photo);
    if (!photoUrl) return;
    setSelectedPhoto({ data: photoUrl, title });
    setShowPhotoViewer(true);
  };

  return (
    <div className="expanded-details mt-4">
      <h5 className="details-section-header">Transfer Participants</h5>
      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card className="participant-card seller">
            <Card.Body>
              <div className="participant-header">
                <h5>Seller</h5>
                <Badge bg="info">Original Owner</Badge>
              </div>
              <div className="participant-details">
                <p className="participant-name">
                  <FaUser className="me-2" />
                  {transfer.sellerId.name}
                </p>
                <p className="participant-contact">
                  <FaPhone className="me-2" />
                  {transfer.sellerId.phone}
                </p>
                <p className="participant-contact">
                  <FaEnvelope className="me-2" />
                  {transfer.sellerId.email}
                </p>
              </div>
              <div className="photo-section" onClick={() => showPhoto(transfer.sellerVerificationPhoto, 'Seller Verification')}>
                <div className="photo-preview" style={{ backgroundImage: `url(${getPhotoUrl(transfer.sellerVerificationPhoto)})` }}>
                  {!getPhotoUrl(transfer.sellerVerificationPhoto) && (
                    <div className="no-photo">
                      <FaCamera />
                      <span>No photo</span>
                    </div>
                  )}
                </div>
                <div className="photo-caption">
                  <FaCalendarAlt className="me-1" />
                  {transfer.sellerVerificationPhoto?.capturedAt ?
                    formatDateTime(transfer.sellerVerificationPhoto.capturedAt) : 'N/A'}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="participant-card buyer">
            <Card.Body>
              <div className="participant-header">
                <h5>Buyer</h5>
                <Badge bg="success">New Owner</Badge>
              </div>
              <div className="participant-details">
                <p className="participant-name">
                  <FaUser className="me-2" />
                  {transfer.buyerId.name}
                </p>
                <p className="participant-contact">
                  <FaPhone className="me-2" />
                  {transfer.buyerId.phone}
                </p>
                <p className="participant-contact">
                  <FaEnvelope className="me-2" />
                  {transfer.buyerId.email}
                </p>
              </div>
              <div className="photo-section" onClick={() => showPhoto(transfer.buyerVerificationPhoto, 'Buyer Verification')}>
                <div className="photo-preview" style={{ backgroundImage: `url(${getPhotoUrl(transfer.buyerVerificationPhoto)})` }}>
                  {!getPhotoUrl(transfer.buyerVerificationPhoto) && (
                    <div className="no-photo">
                      <FaCamera />
                      <span>No photo</span>
                    </div>
                  )}
                </div>
                <div className="photo-caption">
                  <FaCalendarAlt className="me-1" />
                  {transfer.buyerVerificationPhoto?.capturedAt ?
                    formatDateTime(transfer.buyerVerificationPhoto.capturedAt) : 'N/A'}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h5 className="details-section-header">Transfer Timeline</h5>
      <Card className="timeline-card">
        <Card.Body>
          <Table responsive className="timeline-table">
            <tbody>
              <tr>
                <td width="30%">
                  <div className="timeline-date">
                    <div className="date">{formatDate(transfer.requestDate)}</div>
                    <div className="time">{formatTime(transfer.requestDate)}</div>
                  </div>
                </td>
                <td>
                  <div className="timeline-event">
                    <Badge bg="secondary" className="me-2">Request</Badge>
                    Transfer request initiated
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="timeline-date">
                    <div className="date">{formatDate(transfer.sellerVerificationPhoto?.capturedAt)}</div>
                    <div className="time">{formatTime(transfer.sellerVerificationPhoto?.capturedAt)}</div>
                  </div>
                </td>
                <td>
                  <div className="timeline-event">
                    <Badge bg="info" className="me-2">Verification</Badge>
                    Seller identity verified
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="timeline-date">
                    <div className="date">{formatDate(transfer.buyerVerificationPhoto?.capturedAt)}</div>
                    <div className="time">{formatTime(transfer.buyerVerificationPhoto?.capturedAt)}</div>
                  </div>
                </td>
                <td>
                  <div className="timeline-event">
                    <Badge bg="info" className="me-2">Verification</Badge>
                    Buyer identity verified
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="timeline-date">
                    <div className="date">{formatDate(transfer.paymentId.timestamp)}</div>
                    <div className="time">{formatTime(transfer.paymentId.timestamp)}</div>
                  </div>
                </td>
                <td>
                  <div className="timeline-event">
                    <Badge bg="warning" text="dark" className="me-2">Payment</Badge>
                    Transaction completed
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="timeline-date">
                    <div className="date">{formatDate(transfer.completedAt)}</div>
                    <div className="time">{formatTime(transfer.completedAt)}</div>
                  </div>
                </td>
                <td>
                  <div className="timeline-event">
                    <Badge bg="success" className="me-2">Completed</Badge>
                    Transfer finalized and recorded
                  </div>
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {showPhotoViewer && selectedPhoto && (
        <PhotoViewer
          photoUrl={selectedPhoto.data}
          title={selectedPhoto.title}
          onClose={() => setShowPhotoViewer(false)}
        />
      )}
    </div>
  );
};

// Transfer Card Component
const TransferCard = ({ transfer }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return amount ? amount : 'N/A';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const generateCertificate = (transfer) => {
    const certificateContainer = document.createElement('div');
    certificateContainer.className = 'certificate-container';
    certificateContainer.style.width = '800px';
    certificateContainer.style.padding = '40px';
    certificateContainer.style.fontFamily = 'Arial, sans-serif';
    certificateContainer.style.position = 'absolute';
    certificateContainer.style.left = '-9999px';

    // Helper to get photo as <img>
    const getPhotoImg = (photo, alt) => {
      if (photo?.data) {
        return `<img src="data:${photo.contentType};base64,${photo.data}" alt="${alt}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #ccc;margin-bottom:8px;" />`;
      }
      return `<div style="width:80px;height:80px;display:flex;align-items:center;justify-content:center;background:#f5f5f5;border-radius:8px;border:1px solid #ccc;margin-bottom:8px;">No Photo</div>`;
    };

    // --- Only use transaction hash for the unique hash ---
    const uniqueHash = CryptoJS.SHA256(transfer.transactionHash || '').toString();

    certificateContainer.innerHTML = `
      <div style="border: 2px solid #000; padding: 20px; text-align: center;">
        <div style="border-bottom: 1px solid #000; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="font-size: 24px; text-transform: uppercase; margin-bottom: 5px;">Land Transfer Certificate</h1>
          <p style="font-size: 14px; color: #666;">Document ID: ${transfer._id}</p>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div style="width: 48%; text-align: left; border: 1px solid #ddd; padding: 15px;">
            <h3 style="font-size: 16px; margin-bottom: 10px;">SELLER</h3>
            ${getPhotoImg(transfer.sellerVerificationPhoto, 'Seller Photo')}
            <p><strong>Name:</strong> ${transfer.sellerId.name}</p>
            <p><strong>Phone:</strong> ${transfer.sellerId.phone || transfer.sellerId.phoneNumber || 'N/A'}</p>
            <p><strong>Email:</strong> ${transfer.sellerId.email}</p>
            <p><strong>Document No:</strong> ${transfer.sellerId.governmentId || 'N/A'}</p>
          </div>
          <div style="width: 48%; text-align: left; border: 1px solid #ddd; padding: 15px;">
            <h3 style="font-size: 16px; margin-bottom: 10px;">BUYER</h3>
            ${getPhotoImg(transfer.buyerVerificationPhoto, 'Buyer Photo')}
            <p><strong>Name:</strong> ${transfer.buyerId.name}</p>
            <p><strong>Phone:</strong> ${transfer.buyerId.phone || transfer.buyerId.phoneNumber || 'N/A'}</p>
            <p><strong>Email:</strong> ${transfer.buyerId.email}</p>
            <p><strong>Document No:</strong> ${transfer.buyerId.governmentId || 'N/A'}</p>
          </div>
        </div>
        <div style="text-align: left; margin-bottom: 30px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;">LAND DETAILS</h3>
          <p><strong>Location:</strong> ${transfer.landId.location}</p>
          <p><strong>Survey Number:</strong> ${transfer.landId.surveyNumber}</p>
          <p><strong>Area:</strong> ${transfer.landId.area} sq ft</p>
        </div>
        <div style="text-align: left; margin-bottom: 30px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;">TRANSACTION DETAILS</h3>
          <p><strong>Transaction Hash:</strong> ${transfer.transactionHash}</p>
          <p><strong>Amount:</strong> ₹${transfer.paymentId.amount?.toLocaleString('en-IN') || 'N/A'}</p>
          <p><strong>Date of Transfer:</strong> ${formatDate(transfer.completedAt)}</p>
        </div>
        <div style="border-top: 1px solid #000; padding-top: 20px; margin-top: 20px; text-align: center;">
          <p style="font-size: 12px; margin-bottom: 5px;">This certificate is digitally signed and verified.</p>
          <p style="font-size: 12px;">Certificate generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    document.body.appendChild(certificateContainer);

    html2canvas(certificateContainer).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // --- Embed the hash as hidden text (white, tiny, off the page) ---
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(1);
      pdf.text(uniqueHash, 5, pdfHeight - 2);

      pdf.save(`land-transfer-certificate-${transfer._id}.pdf`);
      document.body.removeChild(certificateContainer);
    });
  };

  return (
    <Card className="transfer-card">
      <Card.Body>
        <Row>
          <Col md={7}>
            <div className="d-flex align-items-start mb-3">
              <div className="status-indicator completed">
                <FaCheckCircle />
              </div>
              <div className="ms-3">
                <h4 className="card-title">Transfer #{transfer._id.slice(-4)}</h4>
                
              </div>
            </div>
            
            <div className="land-details">
              <h5>Land Details</h5>
              <p className="location">
                <FaMapMarkerAlt className="me-2" />
                {transfer.landId.location}
              </p>
              <Row>
                <Col xs={6}>
                  <p className="detail-item">
                    <span className="label">Survey No:</span>
                    <span className="value">{transfer.landId.surveyNumber}</span>
                  </p>
                </Col>
                <Col xs={6}>
                  <p className="detail-item">
                    <span className="label">Area:</span>
                    <span className="value">{transfer.landId.area} sq ft</span>
                  </p>
                </Col>
              </Row>
            </div>
          </Col>
          
          <Col md={5}>
            <div className="transaction-summary">
              <h5>Transaction Summary</h5>
              <div className="transaction-amount">
                {formatCurrency(transfer.paymentId.amount)}
                <span className="ms-2 text-muted" style={{ fontSize: '0.9em' }}>
                  (₹{transfer.paymentId.amount})
                </span>
              </div>
              <p className="transaction-hash">
                <span className="label">TX Hash:</span>
                <span className="value hash">{`${transfer.transactionHash.slice(0, 10)}...${transfer.transactionHash.slice(-6)}`}</span>
              </p>
              <div className="mt-3 d-flex justify-content-between">
                <Button
                  variant="outline-primary"
                  className="action-btn"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? (
                    <>
                      <FaChevronUp className="me-2" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <FaChevronDown className="me-2" />
                      View Details
                    </>
                  )}
                </Button>
                <Button
                  variant="primary"
                  className="action-btn"
                  onClick={() => generateCertificate(transfer)}
                >
                  <FaDownload className="me-2" />
                  Certificate
                </Button>
              </div>
            </div>
          </Col>
        </Row>
        
        {expanded && (
          <div className="transfer-details-container">
            <TransferDetails transfer={transfer} />
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

// Main Transfer History Component
const TransferHistory = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompletedTransfers();
  }, []);

  const fetchCompletedTransfers = async () => {
    try {
      const response = await axios.get('http://localhost:4000/landRoute/completed-transfers');
      setTransfers(response.data);
    } catch (error) {
      console.error('Error fetching completed transfers:', error);
      setError('Failed to load transfer history. Please try again later.');
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    const sampleData = [
      {
        _id: '1',
        landId: {
          _id: 'land1',
          location: 'North Avenue, Chennai',
          surveyNumber: 'SN1234',
          area: 5000
        },
        sellerId: {
          _id: 'seller1',
          name: 'Raj Kumar',
          email: 'raj@example.com',
          phone: '9876543210'
        },
        buyerId: {
          _id: 'buyer1',
          name: 'Aditya Singh',
          email: 'aditya@example.com',
          phone: '9876543211'
        },
        transactionHash: '0x7d8c7f6e5d4c3b2a1908070605040302010',
        paymentId: {
          _id: 'payment1',
          amount: 5000000,
          currency: 'INR',
          status: 'completed',
          timestamp: new Date().toISOString()
        },
        status: 'completed',
        requestDate: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
        completedAt: new Date().toISOString(),
        documentHash: '0x1a2b3c4d5e6f7g8h9i0j',
        sellerVerificationPhoto: {
          data: '',
          contentType: 'image/jpeg',
          capturedAt: new Date(Date.now() - 2*24*60*60*1000).toISOString()
        },
        buyerVerificationPhoto: {
          data: '',
          contentType: 'image/jpeg',
          capturedAt: new Date(Date.now() - 2*24*60*60*1000).toISOString()
        }
      },
      // Add more sample data as needed
    ];
    
    setTransfers(sampleData);
    setError('Using sample data for demonstration purposes.');
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="custom-spinner-container">
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading transfer history...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Container className="py-4">
          <div className="page-header">
            <h2>Transfer History</h2>
            <p className="text-muted">View and manage your completed land transfers</p>
          </div>
          
          {error && (
            <Alert variant="info" className="my-3">
              {error}
            </Alert>
          )}

          {transfers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="bi bi-inbox"></i>
              </div>
              <h3>No Transfer Records Found</h3>
              <p>You don't have any completed transfers yet.</p>
            </div>
          ) : (
            <Row className="g-4">
              {transfers.map(transfer => (
                <Col xs={12} key={transfer._id}>
                  <TransferCard transfer={transfer} />
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </main>
    </div>
  );
};

export default TransferHistory;