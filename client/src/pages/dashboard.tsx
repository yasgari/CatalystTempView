import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import TemperatureCards from "@/components/dashboard/temperature-cards";
import TemperatureCharts from "@/components/dashboard/temperature-charts";
import SwitchTable from "@/components/dashboard/switch-table";
import ReportGenerator from "@/components/dashboard/report-generator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import type { Switch, DashboardStats } from "@shared/schema";

export default function Dashboard() {
  const [filters, setFilters] = useState({
    site: "",
    switchType: "",
    showNormal: true,
    showWarning: true,
    showCritical: true,
  });

  const { data: switches = [], isLoading: switchesLoading } = useQuery<Switch[]>({
    queryKey: ["/api/switches"]
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"]
  });

  // Filter switches based on current filters
  const filteredSwitches = switches.filter(switchItem => {
    if (filters.site && filters.site !== "all" && switchItem.site !== filters.site) return false;
    if (filters.switchType && filters.switchType !== "all" && switchItem.switchType !== filters.switchType) return false;
    
    const temp = switchItem.currentTemperature;
    const isNormal = temp >= 20 && temp <= 45;
    const isWarning = temp > 45 && temp <= 60;
    const isCritical = temp > 60;
    
    if (isNormal && !filters.showNormal) return false;
    if (isWarning && !filters.showWarning) return false;
    if (isCritical && !filters.showCritical) return false;
    
    return true;
  });

  const alertCount = switches.filter(s => s.currentTemperature > 45).length;
  const hasAlerts = alertCount > 0;

  if (switchesLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading temperature data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header stats={stats} />
      
      <div className="flex pt-16">
        <Sidebar 
          filters={filters}
          onFiltersChange={setFilters}
          stats={stats}
          switches={switches}
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {hasAlerts && (
              <Alert className="border-destructive/50 bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  <span className="font-semibold">Temperature Alerts Active</span>
                  <br />
                  {alertCount} switches are running above normal temperature thresholds
                </AlertDescription>
              </Alert>
            )}

            <TemperatureCards switches={filteredSwitches} />
            
            <TemperatureCharts />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SwitchTable switches={filteredSwitches} />
              </div>
              <div>
                <ReportGenerator switches={switches} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
