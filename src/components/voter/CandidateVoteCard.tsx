
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserRound, Vote } from "lucide-react";

interface Candidate {
  id: number;
  name: string;
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
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    setIsVoting(true);
    try {
      await onVote(candidate.id);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card className="overflow-hidden border border-muted">
      <CardContent className="p-0">
        <div className="flex items-center p-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
            <UserRound className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium">{candidate.name}</h3>
            <p className="text-sm text-muted-foreground">Candidate #{candidate.id}</p>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={handleVote}
            disabled={disabled || isVoting}
            className={`
              ${hasVoted ? "bg-green-600 hover:bg-green-700" : ""}
              ${isVoting ? "animate-pulse" : ""}
            `}
          >
            {isVoting ? (
              "Confirming..."
            ) : hasVoted ? (
              <>
                <Vote className="mr-1 h-4 w-4" />
                Voted
              </>
            ) : (
              <>
                <Vote className="mr-1 h-4 w-4" />
                Vote
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
