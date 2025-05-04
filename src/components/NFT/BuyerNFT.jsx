import React, { useState, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { FaMapMarkerAlt, FaCheckCircle, FaSpinner, FaExternalLinkAlt } from "react-icons/fa";
import TestLandNFT from "../NFT/TestLandNFT.json";

const PINATA_API_KEY = "";
const PINATA_API_SECRET = "";
const CONTRACT_ADDRESS = "";
const MINT_PRICE = "0.00001"; // ETH

const BuyerNFTLands = () => {
  const userId = sessionStorage.getItem("userId");
  const [lands, setLands] = useState([]);
  const [mintingId, setMintingId] = useState(null);
  const [mintStatus, setMintStatus] = useState("");
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [network, setNetwork] = useState("");
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchOwnedLands();
      fetchUserDetails();
      checkNetwork();
    }
  }, [userId]);

  const checkNetwork = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        setNetwork(network.name);
      } catch (err) {
        console.error("Error checking network:", err);
        setNetwork("unknown");
      }
    }
  };

  const fetchUserDetails = async () => {
    try {
      // Using the correct endpoint for fetching buyer details
      const response = await axios.get(`http://localhost:4000/buyerRouter/get-user/${userId}`);
      setUserDetails(response.data);
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("Failed to fetch user details.");
    }
  };

  const fetchOwnedLands = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/landRoute/owned-lands/${userId}`);
      const data = Array.isArray(res.data) ? res.data : [];
      
      // Sort lands to put non-minted lands first
      const sortedLands = data.sort((a, b) => {
        const aHasNFT = a.nftDetails?.tokenId;
        const bHasNFT = b.nftDetails?.tokenId;
        return aHasNFT && !bHasNFT ? 1 : !aHasNFT && bHasNFT ? -1 : 0;
      });
      
      setLands(sortedLands);
    } catch (err) {
      console.error("Error fetching lands:", err);
      setError("Failed to fetch lands.");
      setLands([]); // fallback to empty array
    }
  };

  const uploadToPinata = async (land) => {
    try {
      if (!userDetails) {
        throw new Error("User details not available. Please try again.");
      }
      
      setMintStatus("Uploading image to IPFS...");

      const imageUrl = land.imageUrl || "https://images.unsplash.com/photo-1506744038136-46273834b3fb";
      const imageRes = await fetch(imageUrl);
      const imageBlob = await imageRes.blob();

      const formData = new FormData();
      formData.append("file", imageBlob, "land.png");

      const imageUploadRes = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxContentLength: "Infinity",
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_API_SECRET,
          },
        }
      );
      const imageHash = imageUploadRes.data.IpfsHash;

      // Include owner details in metadata
      const metadata = {
        name: `Land #${land.surveyNumber}`,
        description: `Location: ${land.location}`,
        image: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
        attributes: [
          { trait_type: "Survey Number", value: land.surveyNumber },
          { trait_type: "Location", value: land.location },
          { trait_type: "Area", value: `${land.area} sq ft` },
          { trait_type: "Owner ID", value: userId },
        ],
        owner: {
          name: userDetails.name || "",
          mobile: userDetails.mobile || "",
          govtId: userDetails.governmentId || userDetails.govtId || "",
          email: userDetails.email || ""
        }
      };

      setMintStatus("Uploading metadata to IPFS...");
      const metadataUploadRes = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
          headers: {
            "Content-Type": "application/json",
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_API_SECRET,
          },
        }
      );
      const metadataHash = metadataUploadRes.data.IpfsHash;

      return `https://gateway.pinata.cloud/ipfs/${metadataHash}`;
    } catch (err) {
      console.error("Pinata upload error:", err);
      throw new Error("Failed to upload to IPFS: " + err.message);
    }
  };

  const mintNFT = async (land) => {
    setMintingId(land._id);
    setMintStatus("Starting minting process...");
    setError("");
    setTxHash("");

    try {
      // Validate contract ABI
      if (!TestLandNFT) {
        throw new Error("Contract ABI not found. Check your TestLandNFT.json file.");
      }

      const ipfsUrl = await uploadToPinata(land);

      if (!window.ethereum) throw new Error("MetaMask not installed");
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      setMintStatus("Minting NFT...");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, TestLandNFT, signer);
      const tx = await contract.mintLand(ipfsUrl, {
        value: ethers.utils.parseEther(MINT_PRICE),
      });

      setTxHash(tx.hash);
      setMintStatus("Waiting for confirmation...");
      const receipt = await tx.wait();
      
      // Get the token ID from the event logs
      let tokenId = null;
      if (receipt && receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === "Transfer") {
              tokenId = parsedLog.args.tokenId.toString();
              break;
            }
          } catch (e) {
            // Skip logs that can't be parsed
            continue;
          }
        }
      }
      
      // Update the backend with NFT details
      if (tokenId) {
        await axios.post(`http://localhost:4000/landRoute/update-nft/${land._id}`, {
          tokenId,
          transactionHash: tx.hash,
          network: network || "sepolia",
          metadata: {
            name: `Land #${land.surveyNumber}`,
            description: `Location: ${land.location}`,
            imageUrl: ipfsUrl,
            owner: {
              name: userDetails.name || "",
              mobile: userDetails.mobile || "",
              govtId: userDetails.governmentId || userDetails.govtId || "",
              email: userDetails.email || ""
            }
          }
        });
      }

      setMintStatus("✅ NFT Minted Successfully!");
      setTimeout(() => {
        setMintingId(null);
        setMintStatus("");
      }, 3000);

      // Refresh the lands list to update the UI
      fetchOwnedLands();
    } catch (err) {
      console.error("Minting error:", err);
      setError(
        err.message && err.message.includes("user rejected")
          ? "Transaction canceled"
          : `Minting failed: ${err.message}`
      );
      setMintingId(null);
    } finally {
      if (!mintStatus.includes("Success")) {
        setTimeout(() => {
          setMintingId(null);
        }, 3000);
      }
    }
  };

  // Defensive rendering to handle potential null/undefined issues
  const renderLands = () => {
    if (!lands || !Array.isArray(lands) || lands.length === 0) {
      return (
        <div className="col">
          <div className="alert alert-warning">No lands found.</div>
        </div>
      );
    }

    return lands.map((land) => {
      // Improve minting status check
      const isMinted = Boolean(land.nftDetails?.tokenId) || land.status === 'minted';
      const isMinting = mintingId === land._id;
      
      return (
        <div key={land._id} className="col">
          <div className={`card h-100 shadow-sm ${isMinted ? 'border-success' : ''}`}>
            <img
              src={land.imageUrl || "https://images.unsplash.com/photo-1506744038136-46273834b3fb"}
              className="card-img-top"
              alt="Land"
              style={{ height: "180px", objectFit: "cover" }}
            />
            <div className="card-body">
              <h5 className="card-title">
                <FaMapMarkerAlt className="me-2 text-danger" />
                {land.location}
              </h5>
              <p className="card-text">
                <strong>Survey #:</strong> {land.surveyNumber}
                <br />
                <strong>Area:</strong> {land.area} sq ft
              </p>

              {isMinted ? (
                <div className="alert alert-success p-2 text-center mb-0">
                  <FaCheckCircle className="me-1" />
                  Minted (Token #{land.nftDetails?.tokenId})
                  {land.nftDetails?.transactionHash && (
                    <div className="mt-1">
                      <a
                        href={`https://${network === "homestead" ? "" : `${network || "sepolia"}.`}etherscan.io/tx/${land.nftDetails.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="small text-success"
                      >
                        View on Etherscan <FaExternalLinkAlt size={10} />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="btn btn-primary w-100"
                  disabled={isMinting || isMinted}
                  onClick={() => mintNFT(land)}
                >
                  {isMinting ? (
                    <>
                      <FaSpinner className="fa-spin me-2" />
                      {mintStatus.split("...")[0]}...
                    </>
                  ) : (
                    `Mint NFT (${MINT_PRICE} ETH)`
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="container py-4">
      {error && (
        <div className="alert alert-danger">
          {error}
          <button type="button" className="btn-close" onClick={() => setError("")} />
        </div>
      )}

      {mintStatus && (
        <div className="alert alert-info d-flex align-items-center">
          {!mintStatus.includes("✅") && (
            <FaSpinner className="fa-spin me-2" />
          )}
          <div>
            {mintStatus}
            {txHash && (
              <div className="mt-1">
                <a
                  href={`https://${network === "homestead" ? "" : `${network || "sepolia"}.`}etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="small text-info"
                >
                  View on Etherscan <FaExternalLinkAlt size={10} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {renderLands()}
      </div>
    </div>
  );
};

export default BuyerNFTLands;

