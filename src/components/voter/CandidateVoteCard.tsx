
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserRound, Vote, Wallet, AlertTriangle } from "lucide-react";
import { useBlockchain } from "@/context/BlockchainContext";

interface Candidate {
  id: number;
  name: string;
  description: string;
  image: string;
  voteCount: number;
}

interface CandidateVoteCardProps {
  candidate: Candidate;
  onVote: (candidateId: number) => Promise<void>;
  disabled: boolean;
  hasVoted: boolean;
}

export function CandidateVoteCard({ 
  candidate, 
  onVote, 
  disabled,
  hasVoted
}: CandidateVoteCardProps) {
  const { isVoting } = useBlockchain();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleVote = async () => {
    setIsConfirming(true);
    try {
      await onVote(candidate.id);
    } finally {
      setIsConfirming(false);
    }
  };

  // Determine button text based on state
  const getButtonContent = () => {
    if (isConfirming) {
      return <>Please confirm in MetaMask...</>;
    }
    if (isVoting) {
      return <>Confirming on blockchain...</>;
    }
    if (hasVoted) {
      return (
        <>
          <Vote className="mr-1 h-4 w-4" />
          Voted
        </>
      );
    }
    return (
      <>
        <Wallet className="mr-1 h-4 w-4" />
        Vote with MetaMask
      </>
    );
  };

  return (
    <Card className="overflow-hidden border border-muted">
      <CardContent className="p-0">
        <div className="flex items-start p-4">
          <div className="h-16 w-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
            {candidate.image ? (
              <img 
                src={candidate.image} 
                alt={candidate.name} 
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Candidate';
                }}
              />
            ) : (
              <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                <UserRound className="h-8 w-8 text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium">{candidate.name}</h3>
            <p className="text-sm text-muted-foreground mb-1">Candidate #{candidate.id}</p>
            <p className="text-sm">{candidate.description}</p>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={handleVote}
            disabled={disabled || isConfirming || isVoting}
            className={`
              ${hasVoted ? "bg-green-600 hover:bg-green-700" : ""}
              ${isConfirming || isVoting ? "animate-pulse" : ""}
              ml-4
            `}
          >
            {getButtonContent()}
          </Button>
        </div>
        
        {isConfirming && (
          <div className="p-3 bg-amber-50 text-amber-800 border-t border-amber-200 flex items-center text-sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Please confirm the transaction in your MetaMask wallet to cast your vote
          </div>
        )}
      </CardContent>
    </Card>
  );
}
