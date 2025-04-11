
import { useBlockchain } from "@/context/BlockchainContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, CheckCircle2, Clock, VoteIcon, Wallet } from "lucide-react";
import { CandidateVoteCard } from "@/components/voter/CandidateVoteCard";
import { ElectionStatus } from "@/components/voter/ElectionStatus";

const VoterDashboard = () => {
  const {
    isConnected,
    connectWallet,
    candidates,
    isElectionActive,
    hasVoted,
    vote,
  } = useBlockchain();

  const handleVote = async (candidateId: number) => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    await vote(candidateId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Voter Dashboard</h1>
          <p className="text-muted-foreground">
            Cast your vote in the blockchain election
          </p>
        </div>
        <ElectionStatus isActive={isElectionActive} />
      </div>

      {!isConnected && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Wallet Not Connected</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Connect your MetaMask wallet to participate in the election</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={connectWallet}
              className="mt-2 sm:mt-0"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isConnected && !isElectionActive && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Election Not Active</AlertTitle>
          <AlertDescription>
            Please wait for the admin to start the election before casting your vote
          </AlertDescription>
        </Alert>
      )}

      {isConnected && isElectionActive && hasVoted && (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Vote Successfully Cast</AlertTitle>
          <AlertDescription>
            Thank you for participating in the election. Your vote has been recorded on the blockchain.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Vote</CardTitle>
            <CardDescription>
              Cast your vote for one of the candidates below
            </CardDescription>
          </CardHeader>
          <CardContent>
            {candidates.length === 0 ? (
              <div className="text-center py-8">
                <VoteIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No candidates available</h3>
                <p className="text-muted-foreground">
                  Please wait for the admin to add candidates
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <CandidateVoteCard
                    key={candidate.id}
                    candidate={candidate}
                    onVote={handleVote}
                    disabled={!isConnected || !isElectionActive || hasVoted}
                    hasVoted={hasVoted}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Voting Requirements</CardTitle>
            <CardDescription>
              Complete these requirements to cast your vote
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                {isConnected ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                )}
                <div>
                  <p className="font-medium">Connect Wallet</p>
                  <p className="text-sm text-muted-foreground">
                    Connect your MetaMask wallet to vote
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                {isElectionActive ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                )}
                <div>
                  <p className="font-medium">Active Election</p>
                  <p className="text-sm text-muted-foreground">
                    Election must be active to vote
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                {candidates.length > 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                )}
                <div>
                  <p className="font-medium">Candidates Available</p>
                  <p className="text-sm text-muted-foreground">
                    At least one candidate must be available
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                {!hasVoted ? (
                  isElectionActive ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                  )
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                )}
                <div>
                  <p className="font-medium">
                    {hasVoted ? "Vote Cast" : "Cast Vote"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {hasVoted
                      ? "You have successfully cast your vote"
                      : "You can vote once during the election"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoterDashboard;
