
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';

// Mock contract ABI & address - In a real app, this would be generated from your Solidity contract
const MOCK_CONTRACT_ABI = [
  "function addCandidate(string memory _name, string memory _description) public",
  "function removeCandidate(uint256 _candidateId) public",
  "function startElection() public",
  "function endElection() public",
  "function vote(uint256 _candidateId) public",
  "function getCandidateCount() public view returns (uint256)",
  "function getCandidate(uint256 _candidateId) public view returns (uint256, string memory, string memory, uint256)",
  "function isElectionActive() public view returns (bool)",
  "function hasVoted(address _voter) public view returns (bool)"
];

const MOCK_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

interface Candidate {
  id: number;
  name: string;
  description: string;
  image: string;
  voteCount: number;
}

interface BlockchainContextType {
  isConnected: boolean;
  account: string | null;
  candidates: Candidate[];
  isElectionActive: boolean;
  hasVoted: boolean;
  isVoting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  addCandidate: (name: string, description: string, image: string) => Promise<boolean>;
  removeCandidate: (id: number) => Promise<boolean>;
  startElection: () => Promise<boolean>;
  endElection: () => Promise<boolean>;
  vote: (candidateId: number) => Promise<boolean>;
  refreshCandidates: () => Promise<void>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export const BlockchainProvider = ({ children }: { children: React.ReactNode }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isElectionActive, setIsElectionActive] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // Initialize web3 when component mounts
  useEffect(() => {
    const initWeb3 = async () => {
      // Check if MetaMask is installed
      if (window.ethereum) {
        try {
          // For demo purposes, we'll use empty candidate data
          setCandidates([]);
          setIsElectionActive(false);
          setHasVoted(false);
          
          // Check if user already has connected their wallet
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connectWalletInternal(accounts[0]);
          }
        } catch (error) {
          console.error("Error initializing web3:", error);
        }
      } else {
        console.warn("MetaMask not detected!");
      }
    };

    initWeb3();
  }, []);

  // Add listeners for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountChange);
      window.ethereum.on('chainChanged', () => window.location.reload());

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountChange);
      };
    }
  }, []);

  const handleAccountChange = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected all accounts
      setAccount(null);
      setIsConnected(false);
      toast.info("Wallet disconnected");
    } else {
      connectWalletInternal(accounts[0]);
    }
  };

  const connectWalletInternal = async (accountAddress: string) => {
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);
      setAccount(accountAddress);
      
      const signer = await browserProvider.getSigner();
      setSigner(signer);
      
      // Initialize contract
      const votingContract = new ethers.Contract(
        MOCK_CONTRACT_ADDRESS, 
        MOCK_CONTRACT_ABI, 
        signer
      );
      setContract(votingContract);
      
      setIsConnected(true);
      
      // Simulate checking if the user has voted
      setHasVoted(false);
    } catch (error) {
      console.error("Error in connectWalletInternal:", error);
      throw error;
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is not installed! Please install MetaMask to continue.");
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      
      await connectWalletInternal(account);
      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setContract(null);
    setIsConnected(false);
    toast.info("Wallet disconnected");
  };

  const addCandidate = async (name: string, description: string, image: string): Promise<boolean> => {
    if (!contract || !signer) {
      toast.error("Wallet not connected!");
      return false;
    }

    try {
      // Simulate adding a candidate
      const newId = candidates.length > 0 
        ? Math.max(...candidates.map(c => c.id)) + 1 
        : 1;
        
      setCandidates([...candidates, { 
        id: newId, 
        name, 
        description, 
        image, 
        voteCount: 0 
      }]);
      
      toast.success(`Added candidate: ${name}`);
      return true;
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast.error("Failed to add candidate");
      return false;
    }
  };

  const removeCandidate = async (id: number): Promise<boolean> => {
    if (!contract || !signer) {
      toast.error("Wallet not connected!");
      return false;
    }

    if (isElectionActive) {
      toast.error("Cannot remove candidates during an active election!");
      return false;
    }

    try {
      // Simulate removing a candidate
      setCandidates(candidates.filter(candidate => candidate.id !== id));
      toast.success("Candidate removed successfully");
      return true;
    } catch (error) {
      console.error("Error removing candidate:", error);
      toast.error("Failed to remove candidate");
      return false;
    }
  };

  const startElection = async (): Promise<boolean> => {
    if (!contract || !signer) {
      toast.error("Wallet not connected!");
      return false;
    }

    try {
      // Simulate starting an election
      setIsElectionActive(true);
      toast.success("Election started successfully!");
      return true;
    } catch (error) {
      console.error("Error starting election:", error);
      toast.error("Failed to start election");
      return false;
    }
  };

  const endElection = async (): Promise<boolean> => {
    if (!contract || !signer) {
      toast.error("Wallet not connected!");
      return false;
    }

    try {
      // Simulate ending an election
      setIsElectionActive(false);
      toast.success("Election ended successfully!");
      return true;
    } catch (error) {
      console.error("Error ending election:", error);
      toast.error("Failed to end election");
      return false;
    }
  };

  const vote = async (candidateId: number): Promise<boolean> => {
    if (!contract || !signer) {
      toast.error("Wallet not connected!");
      return false;
    }

    if (!isElectionActive) {
      toast.error("No active election!");
      return false;
    }

    if (hasVoted) {
      toast.error("You have already voted!");
      return false;
    }

    setIsVoting(true);

    try {
      // In a real app, this would be a contract call that costs gas
      // Simulate a MetaMask transaction that might fail
      
      // Create a simulated transaction
      const tx = {
        to: MOCK_CONTRACT_ADDRESS,
        value: ethers.parseEther("0"), // No ETH sent
        data: contract.interface.encodeFunctionData("vote", [candidateId]),
        gasLimit: ethers.getBigInt(100000)
      };
      
      // Send the transaction - this will trigger MetaMask
      const txResponse = await signer.sendTransaction(tx);
      
      // Wait for one confirmation
      toast.info("Confirming your vote on the blockchain...");
      await txResponse.wait(1);
      
      // Update the UI after confirmation
      const updatedCandidates = candidates.map(c =>
        c.id === candidateId ? { ...c, voteCount: c.voteCount + 1 } : c
      );
      
      setCandidates(updatedCandidates);
      setHasVoted(true);
      toast.success("Vote cast successfully and recorded on blockchain!");
      return true;
    } catch (error: any) {
      console.error("Error casting vote:", error);
      if (error.code === 4001) {
        // User rejected the transaction
        toast.error("You rejected the transaction. Your vote was not recorded.");
      } else {
        toast.error("Failed to cast vote. Transaction failed.");
      }
      return false;
    } finally {
      setIsVoting(false);
    }
  };

  const refreshCandidates = async (): Promise<void> => {
    if (!contract) {
      console.warn("Contract not initialized");
      return;
    }

    try {
      // In a real app, we would fetch candidates from the contract
      console.log("Refreshing candidates data...");
    } catch (error) {
      console.error("Error refreshing candidates:", error);
      toast.error("Failed to refresh candidate data");
    }
  };

  return (
    <BlockchainContext.Provider value={{
      isConnected,
      account,
      candidates,
      isElectionActive,
      hasVoted,
      isVoting,
      connectWallet,
      disconnectWallet,
      addCandidate,
      removeCandidate,
      startElection,
      endElection,
      vote,
      refreshCandidates
    }}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};
