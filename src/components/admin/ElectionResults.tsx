
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowDown, ArrowUp, Award } from "lucide-react";

interface Candidate {
  id: number;
  name: string;
  voteCount: number;
}

interface ElectionResultsProps {
  candidates: Candidate[];
  isActive: boolean;
}

export function ElectionResults({ candidates, isActive }: ElectionResultsProps) {
  const [sortedCandidates, setSortedCandidates] = useState<Candidate[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const total = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);
    setTotalVotes(total);

    const sorted = [...candidates].sort((a, b) => {
      return sortDirection === "desc" 
        ? b.voteCount - a.voteCount 
        : a.voteCount - b.voteCount;
    });
    
    setSortedCandidates(sorted);
  }, [candidates, sortDirection]);

  const toggleSort = () => {
    setSortDirection(sortDirection === "desc" ? "asc" : "desc");
  };

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Award className="h-12 w-12 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium">No results yet</h3>
        <p className="text-muted-foreground">Add candidates to see results</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">Results</h3>
          <p className="text-sm text-muted-foreground">
            {isActive ? "Live results" : "Final results"}
          </p>
        </div>
        <div className="flex items-center">
          <button
            onClick={toggleSort}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sort by votes {sortDirection === "desc" ? <ArrowDown className="ml-1 h-3 w-3" /> : <ArrowUp className="ml-1 h-3 w-3" />}
          </button>
        </div>
      </div>

      {sortedCandidates.map((candidate) => {
        const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
        
        return (
          <Card key={candidate.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="font-medium">{candidate.name}</span>
                  {sortedCandidates[0].id === candidate.id && totalVotes > 0 && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      <Award className="h-3 w-3 mr-1" />
                      Leading
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium">
                  {candidate.voteCount} votes ({percentage.toFixed(1)}%)
                </div>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
                indicatorClassName={
                  sortedCandidates[0].id === candidate.id && totalVotes > 0
                    ? "bg-blockchain-accent"
                    : undefined
                }
              />
            </CardContent>
          </Card>
        );
      })}

      <div className="text-center text-sm text-muted-foreground mt-4">
        Total votes: {totalVotes}
      </div>
    </div>
  );
}
