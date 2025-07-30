import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { AlertCircle, CheckCircle, Wifi, WifiOff } from "lucide-react";

interface ConnectionStatusResponse {
  connected: boolean;
  message: string;
  switchCount?: number;
}

export default function ConnectionStatus() {
  const { data: status, isLoading } = useQuery<ConnectionStatusResponse>({
    queryKey: ["/api/catalyst-center/status"],
    refetchInterval: 30000, // Check every 30 seconds
    retry: false
  });

  if (isLoading) {
    return (
      <Badge variant="secondary" className="bg-muted/10 text-muted-foreground border-muted/20">
        <div className="w-2 h-2 bg-muted-foreground rounded-full mr-2 animate-pulse" />
        Checking...
      </Badge>
    );
  }

  if (!status) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
            <AlertCircle className="w-3 h-3 mr-2" />
            Status Unknown
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Unable to check Catalyst Center connection</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (status.connected) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
            <CheckCircle className="w-3 h-3 mr-2" />
            Catalyst Center
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Connected to Catalyst Center</p>
          <p>{status.message}</p>
          {status.switchCount !== undefined && (
            <p>{status.switchCount} devices found</p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
          <WifiOff className="w-3 h-3 mr-2" />
          Mock Data
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>Using mock data - Catalyst Center unavailable</p>
        <p className="text-xs text-muted-foreground">{status.message}</p>
      </TooltipContent>
    </Tooltip>
  );
}