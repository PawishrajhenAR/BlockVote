
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();

  // Initialize web3 and load data when component mounts
  useEffect(() => {
    const initWeb3 = async () => {
      // Check if MetaMask is installed
      if (window.ethereum) {
        try {
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
    fetchCandidatesFromSupabase();
    fetchElectionStatus();
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

  // Check if user has voted
  useEffect(() => {
    const checkIfUserHasVoted = async () => {
      if (user && isElectionActive) {
        try {
          const { data } = await supabase
            .from('votes')
            .select('id')
            .eq('voter_id', user.id)
            .single();
          
          setHasVoted(!!data);
        } catch (error) {
          console.error("Error checking if user has voted:", error);
          setHasVoted(false);
        }
      } else {
        setHasVoted(false);
      }
    };

    checkIfUserHasVoted();
  }, [user, isElectionActive]);

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
    } catch (error) {
      console.error("Error in connectWalletInternal:", error);
      throw error;
    }
  };

  const fetchCandidatesFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        throw error;
      }

      // Transform the data to match our Candidate interface
      const candidatesData = data.map(candidate => ({
        id: candidate.id,
        name: candidate.name,
        description: candidate.description || '',
        image: candidate.image_path || '',
        voteCount: candidate.vote_count
      }));

      setCandidates(candidatesData);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load candidates");
    }
  };

  const fetchElectionStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('elections')
        .select('is_active')
        .eq('id', 1) // Assuming we're using a single election record
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No election record yet, create one
          const { error: insertError } = await supabase
            .from('elections')
            .insert({ is_active: false });
          
          if (insertError) {
            throw insertError;
          }
          
          setIsElectionActive(false);
        } else {
          throw error;
        }
      } else if (data) {
        setIsElectionActive(data.is_active);
      }
    } catch (error) {
      console.error("Error fetching election status:", error);
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
    if (!user) {
      toast.error("You must be logged in to add a candidate!");
      return false;
    }

    try {
      // Add candidate to Supabase
      const { data, error } = await supabase
        .from('candidates')
        .insert({
          name: name,
          description: description,
          image_path: image,
          created_by: user.id
        })
        .select();

      if (error) {
        console.error("Error adding candidate to Supabase:", error);
        toast.error("Failed to add candidate to database");
        return false;
      }

      if (data && data.length > 0) {
        // Add the new candidate to the local state
        const newCandidate: Candidate = {
          id: data[0].id,
          name: data[0].name,
          description: data[0].description || '',
          image: data[0].image_path || '',
          voteCount: 0
        };
        
        setCandidates(prev => [...prev, newCandidate]);
        toast.success(`Added candidate: ${name}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast.error("Failed to add candidate");
      return false;
    }
  };

  const removeCandidate = async (id: number): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to remove a candidate!");
      return false;
    }

    if (isElectionActive) {
      toast.error("Cannot remove candidates during an active election!");
      return false;
    }

    try {
      // Remove candidate from Supabase
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error removing candidate from Supabase:", error);
        toast.error("Failed to remove candidate from database");
        return false;
      }

      // Remove from local state if successful
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
    if (!user) {
      toast.error("You must be logged in to start an election!");
      return false;
    }

    try {
      const { error } = await supabase
        .from('elections')
        .update({ is_active: true, started_at: new Date().toISOString() })
        .eq('id', 1);

      if (error) {
        throw error;
      }

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
    if (!user) {
      toast.error("You must be logged in to end an election!");
      return false;
    }

    try {
      const { error } = await supabase
        .from('elections')
        .update({ 
          is_active: false, 
          ended_at: new Date().toISOString() 
        })
        .eq('id', 1);

      if (error) {
        throw error;
      }

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
    if (!user) {
      toast.error("You must be logged in to vote!");
      return false;
    }

    if (!isConnected) {
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
      // Simulate a MetaMask transaction
      
      // Create a simulated transaction
      const tx = {
        to: MOCK_CONTRACT_ADDRESS,
        value: ethers.parseEther("0"), // No ETH sent
        data: contract?.interface.encodeFunctionData("vote", [candidateId]),
        gasLimit: ethers.getBigInt(100000)
      };
      
      // Send the transaction - this will trigger MetaMask
      const txResponse = await signer?.sendTransaction(tx);
      
      // Wait for one confirmation
      toast.info("Confirming your vote on the blockchain...");
      
      if (txResponse) {
        await txResponse.wait(1);
      }
      
      // Record the vote in Supabase
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          voter_id: user.id,
          candidate_id: candidateId
        });

      if (voteError) {
        console.error("Error recording vote in database:", voteError);
        toast.error("Failed to record your vote in the database");
        return false;
      }
      
      // Update the vote count for the candidate
      const { error: updateError } = await supabase
        .from('candidates')
        .update({ vote_count: candidates.find(c => c.id === candidateId)?.voteCount! + 1 })
        .eq('id', candidateId);

      if (updateError) {
        console.error("Error updating candidate vote count:", updateError);
      }
      
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
    await fetchCandidatesFromSupabase();
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
