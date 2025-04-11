
import { Badge } from "@/components/ui/badge";

interface ElectionStatusProps {
  isActive: boolean;
}

export function ElectionStatus({ isActive }: ElectionStatusProps) {
  return (
    <Badge variant={isActive ? "default" : "secondary"} className="px-3 py-1">
      {isActive ? (
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
  );
}
