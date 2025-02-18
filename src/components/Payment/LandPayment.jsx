import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { FaEthereum, FaSpinner, FaCheckCircle } from "react-icons/fa";
import Confetti from 'react-confetti';
import '../CSS/LandPayment.css';

const CHAIN_ID = "0xaa36a7"; // Sepolia chain ID
const DECIMAL_CHAIN_ID = 11155111; // Decimal representation of 0xaa36a7

function LandPayment() {
  const { requestId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [network, setNetwork] = useState(null);
  const [buyerWalletAddress, setBuyerWalletAddress] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [buyerDetails, setBuyerDetails] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingPayments();
    fetchBuyerDetails();
    checkNetwork();
  }, []);

  useEffect(() => {
    checkNetwork();
    // Remove fetchBuyRequest function and its useEffect
  }, [requestId]);

  const checkNetwork = async () => {
    try {
      const provider = await detectEthereumProvider();
      if (provider) {
        const chainId = await provider.request({ method: "eth_chainId" });
        const decimalChainId = parseInt(chainId, 16);

        if (decimalChainId !== DECIMAL_CHAIN_ID) {
          alert("Please switch to Sepolia testnet in MetaMask");
        }
        setNetwork(chainId);
      }
    } catch (error) {
      console.error("Network check failed:", error);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      console.log("Fetching payments for user:", userId);

      const response = await axios.get(
        `http://localhost:4000/landRoute/pending-payments/${userId}`
      );

      console.log(
        "Full pending payments response:",
        JSON.stringify(response.data, null, 2)
      );
      setPendingPayments(response.data);
    } catch (error) {
      console.error("Error fetching pending payments:", error);
    }
  };

  const fetchBuyerDetails = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      const response = await axios.get(
        `http://localhost:4000/landRoute/user/${userId}`
      );
      setBuyerDetails(response.data);
    } catch (error) {
      console.error("Error fetching buyer details:", error);
    }
  };

  const convertInrToEth = (inrAmount) => {
    // Current rate: 1 ETH = ₹250,000 (approximately)
    const ethRate = 250000;
    return (inrAmount / ethRate).toFixed(8);
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask to connect wallet");
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setBuyerWalletAddress(accounts[0]);
      setWalletConnected(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet: " + error.message);
    }
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      const provider = await detectEthereumProvider();
      if (!provider) {
        throw new Error("Please install MetaMask to make payment");
      }

      const chainId = await provider.request({ method: "eth_chainId" });

      if (chainId !== CHAIN_ID) {
        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: CHAIN_ID }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: CHAIN_ID,
                  chainName: "Sepolia",
                  nativeCurrency: {
                    name: "Sepolia ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: ["https://rpc.sepolia.org"],
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            });
          } else {
            throw new Error("Failed to switch network: " + switchError.message);
          }
        }
      }

      // Verify network after switch attempt
      const currentChainId = await provider.request({ method: "eth_chainId" });
      if (currentChainId !== CHAIN_ID) {
        throw new Error(
          "Network switch failed. Please manually switch to Sepolia in MetaMask."
        );
      }

      // Rest of your payment code...
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = ethersProvider.getSigner();

      // Convert INR price to ETH
      const priceInEth = convertInrToEth(selectedPayment.landId.price);
      const priceInWei = ethers.utils.parseEther(priceInEth.toString());

      // Send transaction
      const tx = await signer.sendTransaction({
        from: buyerWalletAddress,
        to: selectedPayment.landId.walletAddress, // Updated to use direct wallet address
        value: priceInWei,
        gasLimit: 21000,
      });

      console.log("Transaction hash:", tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      // Record payment in backend
      const paymentData = {
        buyRequestId: selectedPayment._id,
        landId: selectedPayment.landId._id,
        buyerId: sessionStorage.getItem("userId"), // Get buyerId from session
        sellerId: selectedPayment.landId.userId._id, // Get sellerId from land's userId
        amount: selectedPayment.landId.price,
        transactionHash: tx.hash,
        network: "sepolia",
      };

      console.log("Sending payment data:", paymentData); // Debug log

      await axios.post(
        "http://localhost:4000/landRoute/record-payment",
        paymentData
      );

      setTransactionHash(tx.hash);
      setShowSuccess(true);
      
      setTimeout(() => {
        const userId = sessionStorage.getItem("userId");
        navigate(`/buyer-dashboard/${userId}`);
      }, 5000); // Redirect after 5 seconds

    } catch (error) {
      console.error("Payment error:", error);
      console.error("Payment details:", {
        buyerId: sessionStorage.getItem("userId"),
        sellerId: selectedPayment?.landId?.userId?._id,
        landId: selectedPayment?.landId?._id,
        sellerWallet: selectedPayment?.landId?.userId?.walletAddress,
      });
      alert("Payment failed: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const setSelectedPaymentWithLog = (payment) => {
    console.log(
      "Selected payment full details:",
      JSON.stringify(
        {
          payment: payment,
          landDetails: payment.landId,
          sellerDetails: payment.landId.userId,
          sellerWallet: payment.landId.userId?.walletAddress,
        },
        null,
        2
      )
    );
    setSelectedPayment(payment);
  };

  if (!isLoading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" />
      </div>
    );

  return (
    <div className="container mt-4">
      {showSuccess ? (
        <>
          <Confetti 
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
          />
          <div className="payment-success">
            <div className="success-icon">
              <FaCheckCircle />
            </div>
            <h2 className="success-text mb-3">Payment Successful!</h2>
            <p className="success-text mb-4">
              Your land purchase transaction has been completed successfully.
            </p>
            <div className="transaction-hash">
              <small>Transaction Hash:</small><br />
              <span>{transactionHash}</span>
            </div>
            <p className="mt-4 success-text">
              Redirecting to dashboard<span className="loading-dots"></span>
            </p>
          </div>
        </>
      ) : (
        !selectedPayment ? (
          <>
            <h2 className="mb-4">Pending Payments</h2>
            <div className="row">
              {pendingPayments.map((payment) => (
                <div key={payment._id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100 payment-card">
                    <div className="card-body">
                      <h5 className="card-title d-flex align-items-center">
                        <FaEthereum className="eth-icon me-2 text-primary" />
                        {payment.landId.location}
                      </h5>
                      <div className="payment-status mb-3">
                        <span className="badge bg-info">Pending Payment</span>
                      </div>
                      <p className="card-text">
                        <strong>Survey Number:</strong> {payment.landId.surveyNumber}<br />
                        <strong>Area:</strong> {payment.landId.area} sq ft<br />
                        <strong>Price:</strong> 
                        <span className="text-primary fw-bold">
                          ₹{payment.landId.price.toLocaleString("en-IN")}
                        </span><br />
                        <strong>ETH:</strong> 
                        <span className="text-success fw-bold">
                          {convertInrToEth(payment.landId.price)}
                        </span>
                      </p>
                      <button
                        className="btn btn-primary w-100 position-relative overflow-hidden"
                        onClick={() => setSelectedPaymentWithLog(payment)}
                      >
                        <FaEthereum className="eth-icon me-2" />
                        Proceed to Payment
                        <div className="ripple"></div>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              className="btn btn-outline-secondary mb-4"
              onClick={() => setSelectedPayment(null)}
            >
              ← Back to Pending Payments
            </button>

            <div className="card shadow">
              {network && network !== CHAIN_ID && (
                <div className="alert alert-warning m-3">
                  <strong>Wrong Network:</strong> Please switch to Sepolia testnet
                  in MetaMask.
                  <ol className="mb-0 mt-2">
                    <li>Opening MetaMask</li>
                    <li>Clicking on the network dropdown at the top</li>
                    <li>
                      Selecting "Sepolia" from the list or it will be added
                      automatically
                    </li>
                  </ol>
                </div>
              )}
              <div className="card-body">
                <h2 className="card-title mb-4">Complete Land Purchase</h2>

                <div className="row">
                  {/* Land Details Column */}
                  <div className="col-md-4">
                    <h4 className="border-bottom pb-2 mb-3">Land Details</h4>
                    <p>
                      <strong>Location:</strong> {selectedPayment.landId.location}
                    </p>
                    <p>
                      <strong>Survey Number:</strong>{" "}
                      {selectedPayment.landId.surveyNumber}
                    </p>
                    <p>
                      <strong>Area:</strong> {selectedPayment.landId.area} sq ft
                    </p>
                    <p>
                      <strong>Price:</strong> ₹
                      {selectedPayment.landId.price.toLocaleString("en-IN")}{" "}
                      <span className="text-muted">
                        ({convertInrToEth(selectedPayment.landId.price)} ETH)
                      </span>
                    </p>
                  </div>

                  {/* Buyer Details Column */}
                  <div className="col-md-4">
                    <h4 className="border-bottom pb-2 mb-3">Buyer Details</h4>
                    {buyerDetails ? (
                      <>
                        <p>
                          <strong>Name:</strong> {buyerDetails.name}
                        </p>
                        <p>
                          <strong>Email:</strong> {buyerDetails.email}
                        </p>
                        <p>
                          <strong>Phone:</strong> {buyerDetails.phoneNumber}
                        </p>
                        <div className="mb-3">
                          <label className="form-label">
                            <strong>Wallet Address:</strong>
                          </label>
                          {walletConnected ? (
                            <div className="d-flex align-items-center">
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={buyerWalletAddress}
                                readOnly
                              />
                              <span className="badge bg-success ms-2">
                                Connected
                              </span>
                            </div>
                          ) : (
                            <button
                              className="btn btn-outline-primary btn-sm w-100"
                              onClick={connectWallet}
                            >
                              <FaEthereum className="me-2" />
                              Connect Wallet
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="alert alert-info">
                        Loading buyer details...
                      </div>
                    )}
                  </div>

                  {/* Seller Details Column */}
                  <div className="col-md-4">
                    <h4 className="border-bottom pb-2 mb-3">Seller Details</h4>
                    {selectedPayment?.landId ? (
                      <>
                        <p>
                          <strong>Name:</strong> {selectedPayment.landId.name}
                        </p>
                        <p>
                          <strong>Email:</strong> {selectedPayment.landId.email}
                        </p>
                        <p>
                          <strong>Phone:</strong>{" "}
                          {selectedPayment.landId.phoneNumber}
                        </p>
                        <div className="mb-3">
                          <label className="form-label">
                            <strong>Seller Wallet:</strong>
                          </label>
                          <div className="d-flex align-items-center">
                            <input
                              type="text"
                              className="form-control form-control-sm bg-light"
                              value={
                                selectedPayment.landId.walletAddress ||
                                "No wallet address available"
                              }
                              readOnly
                              style={{ backgroundColor: "#e9ecef" }}
                            />
                            {selectedPayment.landId.walletAddress && (
                              <span className="badge bg-info ms-2">Verified</span>
                            )}
                          </div>
                          <small className="text-muted">
                            Auto-fetched from seller's profile
                          </small>
                        </div>
                      </>
                    ) : (
                      <div className="alert alert-warning">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Seller details not available
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Button Section */}
                <div className="mt-4 text-center">
                  <button
                    className={`btn btn-primary btn-lg ${isProcessing ? 'payment-status' : ''} ${walletConnected ? 'glow-effect' : ''}`}
                    onClick={handlePayment}
                    disabled={isProcessing || !walletConnected}
                  >
                    {isProcessing ? (
                      <>
                        <FaSpinner className="spinner me-2" />
                        <span className="processing-text">Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <FaEthereum className="eth-icon me-2" />
                        Pay {convertInrToEth(selectedPayment.landId.price)} ETH
                      </>
                    )}
                  </button>
                  {!walletConnected && (
                    <div className="text-danger mt-2 animate__animated animate__headShake">
                      Please connect your wallet to proceed with payment
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}

export default LandPayment;
