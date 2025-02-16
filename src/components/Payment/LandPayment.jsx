import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { FaEthereum, FaSpinner } from 'react-icons/fa';

const CHAIN_ID = '0xaa36a7'; // Sepolia chain ID
const DECIMAL_CHAIN_ID = 11155111; // Decimal representation of 0xaa36a7

function LandPayment() {
  const { requestId } = useParams();
  const [buyRequest, setBuyRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [network, setNetwork] = useState(null);
  const [buyerWalletAddress, setBuyerWalletAddress] = useState('');
  const [sellerWalletAddress, setSellerWalletAddress] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkNetwork();
    fetchBuyRequest();
  }, [requestId]);

  const checkNetwork = async () => {
    try {
      const provider = await detectEthereumProvider();
      if (provider) {
        const chainId = await provider.request({ method: 'eth_chainId' });
        const decimalChainId = parseInt(chainId, 16);
        
        if (decimalChainId !== DECIMAL_CHAIN_ID) {
          alert('Please switch to Sepolia testnet in MetaMask');
        }
        setNetwork(chainId);
      }
    } catch (error) {
      console.error('Network check failed:', error);
    }
  };

  const fetchBuyRequest = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/landRoute/buy-request/${requestId}`);
      setBuyRequest(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching buy request:', error);
      setError('Failed to fetch buy request details');
      setIsLoading(false);
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
        throw new Error('Please install MetaMask to connect wallet');
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      setBuyerWalletAddress(accounts[0]);
      setWalletConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet: ' + error.message);
    }
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      
      const provider = await detectEthereumProvider();
      if (!provider) {
        throw new Error('Please install MetaMask to make payment');
      }

      const chainId = await provider.request({ method: 'eth_chainId' });
      
      if (chainId !== CHAIN_ID) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CHAIN_ID }]
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: CHAIN_ID,
                chainName: 'Sepolia',
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
              }]
            });
          } else {
            throw new Error('Failed to switch network: ' + switchError.message);
          }
        }
      }

      // Verify network after switch attempt
      const currentChainId = await provider.request({ method: 'eth_chainId' });
      if (currentChainId !== CHAIN_ID) {
        throw new Error('Network switch failed. Please manually switch to Sepolia in MetaMask.');
      }

      // Rest of your payment code...
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = ethersProvider.getSigner();

      // Convert INR price to ETH
      const priceInEth = convertInrToEth(buyRequest.landId.price);
      const priceInWei = ethers.utils.parseEther(priceInEth.toString());

      // Send transaction
      const tx = await signer.sendTransaction({
        from: buyerWalletAddress,
        to: buyRequest.sellerId.walletAddress || sellerWalletAddress, // Use either stored or entered address
        value: priceInWei,
        gasLimit: 21000, // Standard gas limit for ETH transfers
      });

      console.log('Transaction hash:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      // Record payment in backend
      await axios.post(`http://localhost:4000/landRoute/record-payment`, {
        buyRequestId: buyRequest._id,
        landId: buyRequest.landId._id,
        buyerId: buyRequest.buyerId._id,
        sellerId: buyRequest.sellerId._id,
        amount: buyRequest.landId.price,
        transactionHash: tx.hash,
        network: 'sepolia' // Updated network name
      });

      alert('Test payment successful! Transaction hash: ' + tx.hash);
      navigate('/buyer-dashboard');
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="text-center mt-5"><div className="spinner-border" /></div>;
  if (error) return <div className="alert alert-danger m-3">{error}</div>;
  if (!buyRequest) return <div className="alert alert-warning m-3">Buy request not found</div>;

  return (
    <div className="container mt-4">
      <div className="card shadow">
        {network && network !== CHAIN_ID && (
          <div className="alert alert-warning m-3">
            <strong>Wrong Network:</strong> Please switch to Sepolia testnet in MetaMask.
            <ol className="mb-0 mt-2">
              <li>Opening MetaMask</li>
              <li>Clicking on the network dropdown at the top</li>
              <li>Selecting "Sepolia" from the list or it will be added automatically</li>
            </ol>
          </div>
        )}
        <div className="card-body">
          <h2 className="card-title mb-4">Complete Land Purchase</h2>
          
          <div className="row">
            <div className="col-md-6">
              <h4>Land Details</h4>
              <p><strong>Location:</strong> {buyRequest.landId.location}</p>
              <p><strong>Survey Number:</strong> {buyRequest.landId.surveyNumber}</p>
              <p><strong>Area:</strong> {buyRequest.landId.area} sq ft</p>
              <p>
                <strong>Price:</strong>{' '}
                ₹{buyRequest.landId.price.toLocaleString('en-IN')}{' '}
                <span className="text-muted">
                  ({convertInrToEth(buyRequest.landId.price)} ETH)
                </span>
              </p>
            </div>
            
            <div className="col-md-6">
              <h4>Transaction Details</h4>
              <div className="mb-3">
                <label className="form-label"><strong>Your Wallet Address:</strong></label>
                {walletConnected ? (
                  <div className="d-flex align-items-center">
                    <input
                      type="text"
                      className="form-control"
                      value={buyerWalletAddress}
                      readOnly
                    />
                    <span className="badge bg-success ms-2">Connected</span>
                  </div>
                ) : (
                  <button 
                    className="btn btn-outline-primary"
                    onClick={connectWallet}
                  >
                    <FaEthereum className="me-2" />
                    Connect Wallet
                  </button>
                )}
              </div>
              
              <div className="mb-3">
                <label className="form-label"><strong>Seller Wallet Address:</strong></label>
                <input
                  type="text"
                  className="form-control"
                  value={buyRequest.sellerId.walletAddress || sellerWalletAddress}
                  onChange={(e) => setSellerWalletAddress(e.target.value)}
                  placeholder="Enter seller's wallet address"
                  required
                />
              </div>
              
              <p><strong>Transaction Amount:</strong>{' '}
                {convertInrToEth(buyRequest.landId.price)} ETH
              </p>
            </div>
          </div>

          <div className="mt-4">
            <button 
              className="btn btn-primary"
              onClick={connectWallet}
              disabled={walletConnected}
            >
              {walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
            </button>
          </div>

          <div className="mt-4">
            <button 
              className="btn btn-primary"
              onClick={handlePayment}
              disabled={isProcessing || !walletConnected || !(buyRequest.sellerId.walletAddress || sellerWalletAddress)}
            >
              {isProcessing ? (
                <>
                  <FaSpinner className="spinner me-2" />
                  Processing...
                </>
              ) : (
                <>
                  <FaEthereum className="me-2" />
                  Pay with MetaMask
                </>
              )}
            </button>
            {!walletConnected && (
              <div className="text-danger mt-2">
                Please connect your wallet first
              </div>
            )}
            {!(buyRequest.sellerId.walletAddress || sellerWalletAddress) && (
              <div className="text-danger mt-2">
                Seller wallet address is required
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandPayment;