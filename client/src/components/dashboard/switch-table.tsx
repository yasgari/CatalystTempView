import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Download, Eye, TrendingUp, Settings, Network, ChevronLeft, ChevronRight } from "lucide-react";
import type { Switch, TemperatureStatus } from "@shared/schema";

interface SwitchTableProps {
  switches: Switch[];
}

function getTemperatureStatus(temperature: number): TemperatureStatus {
  if (temperature >= 20 && temperature <= 45) return 'normal';
  if (temperature > 45 && temperature <= 60) return 'warning';
  return 'critical';
}

function getStatusBadge(status: TemperatureStatus) {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  switch (status) {
    case 'normal':
      return (
        <Badge className={`${baseClasses} bg-success/10 text-success border-success/20`}>
          <div className="w-1.5 h-1.5 bg-success rounded-full mr-1" />
          Normal
        </Badge>
      );
    case 'warning':
      return (
        <Badge className={`${baseClasses} bg-warning/10 text-warning border-warning/20`}>
          <div className="w-1.5 h-1.5 bg-warning rounded-full mr-1" />
          Warning
        </Badge>
      );
    case 'critical':
      return (
        <Badge className={`${baseClasses} bg-destructive/10 text-destructive border-destructive/20`}>
          <div className="w-1.5 h-1.5 bg-destructive rounded-full mr-1" />
          Critical
        </Badge>
      );
  }
}

function getTemperatureProgress(temperature: number): number {
  return Math.min(100, Math.max(0, ((temperature - 20) / 60) * 100));
}

function formatLastUpdate(date: Date | string | null): string {
  if (!date) return 'Never';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return '30 seconds ago';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  return dateObj.toLocaleDateString();
}

export default function SwitchTable({ switches }: SwitchTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter switches based on search query
  const filteredSwitches = switches.filter(switchItem =>
    switchItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    switchItem.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    switchItem.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredSwitches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSwitches = filteredSwitches.slice(startIndex, endIndex);

  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Switch Inventory</h3>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search switches..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="ghost" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-medium text-muted-foreground">Switch</TableHead>
                <TableHead className="font-medium text-muted-foreground">Location</TableHead>
                <TableHead className="font-medium text-muted-foreground">Temperature</TableHead>
                <TableHead className="font-medium text-muted-foreground">Status</TableHead>
                <TableHead className="font-medium text-muted-foreground">Last Update</TableHead>
                <TableHead className="font-medium text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentSwitches.map((switchItem) => {
                const status = getTemperatureStatus(switchItem.currentTemperature);
                const progress = getTemperatureProgress(switchItem.currentTemperature);
                
                return (
                  <TableRow key={switchItem.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Network className="text-primary h-5 w-5" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">{switchItem.name}</div>
                          <div className="text-sm text-muted-foreground">{switchItem.model}</div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm text-foreground">{switchItem.location}</div>
                      <div className="text-sm text-muted-foreground">{switchItem.rack}</div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm font-semibold text-foreground mb-1">
                        {switchItem.currentTemperature.toFixed(1)}°C
                      </div>
                      <Progress 
                        value={progress} 
                        className="w-full h-2"
                        aria-label={`Temperature: ${switchItem.currentTemperature.toFixed(1)}°C`}
                      />
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(status)}
                    </TableCell>
                    
                    <TableCell className="text-sm text-muted-foreground">
                      {formatLastUpdate(switchItem.lastUpdate)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                          <TrendingUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredSwitches.length)} of {filteredSwitches.length} results
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
