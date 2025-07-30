import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Clock } from "lucide-react";
import type { Switch, TemperatureStatus } from "@shared/schema";

interface TemperatureCardsProps {
  switches: Switch[];
}

function getTemperatureStatus(temperature: number): TemperatureStatus {
  if (temperature >= 20 && temperature <= 45) return 'normal';
  if (temperature > 45 && temperature <= 60) return 'warning';
  return 'critical';
}

function getStatusColor(status: TemperatureStatus) {
  switch (status) {
    case 'normal': return 'text-success bg-success/10 border-success/20';
    case 'warning': return 'text-warning bg-warning/10 border-warning/20';
    case 'critical': return 'text-destructive bg-destructive/10 border-destructive/20';
  }
}

function getThermometerIcon(status: TemperatureStatus) {
  return <Thermometer className={`h-6 w-6 ${status === 'normal' ? 'text-success' : status === 'warning' ? 'text-warning' : 'text-destructive'}`} />;
}

function formatLastUpdate(date: Date | string | null): string {
  if (!date) return 'Never';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return '30 sec ago';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  return dateObj.toLocaleDateString();
}

export default function TemperatureCards({ switches }: TemperatureCardsProps) {
  // Show top 4 switches (prioritize critical/warning)
  const sortedSwitches = [...switches]
    .sort((a, b) => {
      const statusOrder = { critical: 3, warning: 2, normal: 1 };
      const aStatus = getTemperatureStatus(a.currentTemperature);
      const bStatus = getTemperatureStatus(b.currentTemperature);
      
      if (statusOrder[aStatus] !== statusOrder[bStatus]) {
        return statusOrder[bStatus] - statusOrder[aStatus];
      }
      
      return b.currentTemperature - a.currentTemperature;
    })
    .slice(0, 4);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {sortedSwitches.map((switchItem) => {
        const status = getTemperatureStatus(switchItem.currentTemperature);
        
        return (
          <Card key={switchItem.id} className="bg-surface border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${status === 'normal' ? 'bg-success/10' : status === 'warning' ? 'bg-warning/10' : 'bg-destructive/10'}`}>
                  {getThermometerIcon(status)}
                </div>
                <Badge className={getStatusColor(status)}>
                  {status === 'normal' ? 'Normal' : status === 'warning' ? 'Warning' : 'Critical'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <p className="text-2xl font-bold text-foreground">
                  {switchItem.currentTemperature.toFixed(1)}°C
                </p>
                <p className="text-sm font-medium text-foreground">{switchItem.name}</p>
                <p className="text-xs text-muted-foreground">{switchItem.location}</p>
              </div>
              
              <div className="mt-4 flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatLastUpdate(switchItem.lastUpdate)}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
