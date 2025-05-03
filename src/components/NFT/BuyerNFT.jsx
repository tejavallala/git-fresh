import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NFTStorage, File } from 'nft.storage';
import { ethers } from 'ethers';
import { FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import TestLandNFT from '../NFT/TestLandNFT.json';

// Use only the part after the dot from your API key
const NFT_STORAGE_TOKEN = '990731559c054ad986bd40cca4753bb3';

const CONTRACT_ADDRESS = '0xd9145CCE52D386f254917e481eB44e9943F39138';

const CONTRACT_ABI = [
  "function mintLand(string memory uri) public payable returns (uint256)"
];

const BuyerNFTLands = () => {
  const userId = sessionStorage.getItem('userId');
  const [lands, setLands] = useState([]);
  const [mintingId, setMintingId] = useState(null);
  const [mintStatus, setMintStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) fetchOwnedLands();
  }, [userId]);

  const fetchOwnedLands = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/landRoute/owned-lands/${userId}`);
      setLands(res.data);
    } catch (err) {
      setError('Failed to fetch lands');
    }
  };

  // Modify the test function to properly test the connection
  const testNFTStorage = async () => {
    try {
      const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });
      // Test with a small blob upload
      const testBlob = new Blob(['Connection test']);
      const cid = await client.storeBlob(testBlob);
      console.log('NFT.Storage connection successful - CID:', cid);
      return true;
    } catch (err) {
      console.error('NFT.Storage connection failed:', err.message);
      return false;
    }
  };

  // Update the mintNFT function to check connection first
  const mintNFT = async (land) => {
    setMintingId(land._id);
    setMintStatus('Checking NFT.Storage connection...');
    setError('');
    
    try {
      // Test connection before proceeding
      const isConnected = await testNFTStorage();
      if (!isConnected) {
        throw new Error('Failed to connect to NFT.Storage');
      }

      setMintStatus('Uploading metadata to NFT.Storage...');
      const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });
      const metadata = await client.store({
        name: `Land: ${land.surveyNumber}`,
        description: `Survey No: ${land.surveyNumber}, Location: ${land.location}, Area: ${land.area} sq ft`,
        image: await fetch('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80')
          .then(r => r.blob())
          .then(blob => new File([blob], 'land.png', { type: 'image/png' })),
        properties: {
          location: land.location,
          surveyNumber: land.surveyNumber,
          area: land.area
        }
      });

      setMintStatus('Connecting to wallet...');
      if (!window.ethereum) throw new Error('MetaMask not detected');

      // 2. Connect to wallet and contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, TestLandNFT, signer);

      setMintStatus('Minting NFT...');
      // 3. Mint NFT to current user
      const tx = await contract.mintLand(metadata.url, { value: ethers.utils.parseEther("0.01") });
      await tx.wait();

      setMintStatus('✅ NFT minted successfully!');
      fetchOwnedLands();
    } catch (err) {
      console.error(err);
      setError('❌ Error minting NFT');
      setMintStatus('');
    } finally {
      setMintingId(null);
    }
  };

  // Call it when component mounts
  useEffect(() => {
    testNFTStorage();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Your Owned Lands (NFT Minting)</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {lands.length === 0 ? (
        <div className="alert alert-info">You don't own any lands yet.</div>
      ) : (
        <div className="row g-4">
          {lands.map((land) => (
            <div key={land._id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <FaMapMarkerAlt className="me-2 text-primary" />
                    {land.location}
                  </h5>
                  <p><strong>Survey Number:</strong> {land.surveyNumber}</p>
                  <p><strong>Area:</strong> {land.area} sq ft</p>
                  {land.nftDetails?.tokenId ? (
                    <div className="alert alert-success mt-2">
                      <FaCheckCircle className="me-1" />
                      NFT Minted (Token ID: {land.nftDetails.tokenId})
                    </div>
                  ) : (
                    <button
                      className="btn btn-success w-100"
                      disabled={mintingId === land._id}
                      onClick={() => mintNFT(land)}
                    >
                      {mintingId === land._id ? (mintStatus || 'Minting...') : 'Mint NFT'}
                    </button>
                  )}
                  {mintingId === land._id && mintStatus && (
                    <div className="mt-2 text-info">{mintStatus}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerNFTLands;