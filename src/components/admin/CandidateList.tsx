
import { Card, CardContent } from "@/components/ui/card";
import { User, Award, Users } from "lucide-react";

interface Candidate {
  id: number;
  name: string;
  voteCount: number;
}

interface CandidateListProps {
  candidates: Candidate[];
}

export function CandidateList({ candidates }: CandidateListProps) {
  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Users className="h-12 w-12 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium">No candidates yet</h3>
        <p className="text-muted-foreground">Add candidates to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {candidates.map((candidate) => (
        <Card key={candidate.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center p-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium">{candidate.name}</h3>
                <p className="text-sm text-muted-foreground">Candidate #{candidate.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Award className="h-4 w-4 mr-1" />
                  <span>{candidate.voteCount} votes</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
