import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Network, RefreshCw, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ConnectionStatus from "@/components/dashboard/connection-status";
import type { DashboardStats } from "@shared/schema";

interface HeaderProps {
  stats?: DashboardStats;
}

export default function Header({ stats }: HeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const refreshMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/dashboard/refresh"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/switches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/temperature-distribution"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/temperature-trends"] });
      toast({
        title: "Data Refreshed",
        description: "Temperature data has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh temperature data. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsRefreshing(false);
    },
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshMutation.mutate();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface shadow-sm border-b border-border">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Network className="text-primary text-2xl h-8 w-8" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">Cisco Catalyst Center</h1>
                <p className="text-sm text-muted-foreground">Temperature Monitoring Dashboard</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ConnectionStatus />
            
            <Button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-primary hover:bg-primary/90"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
