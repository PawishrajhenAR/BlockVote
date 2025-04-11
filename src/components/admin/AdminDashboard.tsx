
import { useState } from "react";
import { useBlockchain } from "@/context/BlockchainContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, PlusCircle, PlayCircle, StopCircle } from "lucide-react";
import { CandidateList } from "@/components/admin/CandidateList";
import { ElectionResults } from "@/components/admin/ElectionResults";
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
  const [newCandidateName, setNewCandidateName] = useState("");
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [isChangingElectionState, setIsChangingElectionState] = useState(false);
  
  const {
    candidates,
    isElectionActive,
    startElection,
    endElection,
    addCandidate,
  } = useBlockchain();

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidateName.trim()) return;
    
    setIsAddingCandidate(true);
    try {
      const success = await addCandidate(newCandidateName.trim());
      if (success) {
        setNewCandidateName("");
      }
    } finally {
      setIsAddingCandidate(false);
    }
  };

  const handleElectionStateChange = async () => {
    setIsChangingElectionState(true);
    try {
      if (isElectionActive) {
        await endElection();
      } else {
        await startElection();
      }
    } finally {
      setIsChangingElectionState(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage election candidates and monitor voting progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isElectionActive ? "default" : "secondary"} className="px-3 py-1">
            {isElectionActive ? (
              <span className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Election Active
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-400"></span>
                </span>
                Election Inactive
              </span>
            )}
          </Badge>

          <Button 
            onClick={handleElectionStateChange}
            variant={isElectionActive ? "destructive" : "default"}
            disabled={isChangingElectionState || candidates.length === 0}
            className="flex items-center gap-1"
          >
            {isElectionActive ? (
              <>
                <StopCircle className="h-4 w-4 mr-1" />
                End Election
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-1" />
                Start Election
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Add Candidate</CardTitle>
            <CardDescription>Add new candidates to the election</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Candidate Name"
                  value={newCandidateName}
                  onChange={(e) => setNewCandidateName(e.target.value)}
                  disabled={isAddingCandidate || isElectionActive}
                />
              </div>
              <Button
                type="submit"
                variant="default"
                className="w-full"
                disabled={!newCandidateName.trim() || isAddingCandidate || isElectionActive}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Candidate
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <div className="flex items-center text-sm text-muted-foreground">
              {isElectionActive ? (
                <AlertCircle className="mr-1 h-4 w-4 text-amber-500" />
              ) : (
                <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
              )}
              <span>
                {isElectionActive
                  ? "Cannot add candidates during active election"
                  : "Ready to add candidates"}
              </span>
            </div>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <Tabs defaultValue="candidates">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Election Management</CardTitle>
                <TabsList>
                  <TabsTrigger value="candidates">Candidates</TabsTrigger>
                  <TabsTrigger value="results">Results</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>
                Manage candidates and view voting results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TabsContent value="candidates" className="mt-0">
                <CandidateList candidates={candidates} />
              </TabsContent>
              <TabsContent value="results" className="mt-0">
                <ElectionResults candidates={candidates} isActive={isElectionActive} />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
