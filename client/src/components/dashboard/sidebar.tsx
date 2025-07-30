import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Switch, DashboardStats } from "@shared/schema";

interface SidebarProps {
  filters: {
    site: string;
    switchType: string;
    showNormal: boolean;
    showWarning: boolean;
    showCritical: boolean;
  };
  onFiltersChange: (filters: any) => void;
  stats?: DashboardStats;
  switches: Switch[];
}

export default function Sidebar({ filters, onFiltersChange, stats, switches }: SidebarProps) {
  const sites = Array.from(new Set(switches.map(s => s.site)));
  const switchTypes = Array.from(new Set(switches.map(s => s.switchType)));

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <aside className="w-64 bg-surface shadow-sm border-r border-border overflow-y-auto">
      <div className="p-6">
        <div className="space-y-6">
          {/* Filters Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Filters</h3>
            
            {/* Site Filter */}
            <div className="mb-4">
              <Label className="text-sm font-medium text-foreground mb-2 block">Site</Label>
              <Select value={filters.site || "all"} onValueChange={(value) => updateFilter('site', value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  {sites.map(site => (
                    <SelectItem key={site} value={site}>
                      {site === 'hq' ? 'Headquarters' : 
                       site === 'branch1' ? 'Branch Office 1' : 
                       site === 'branch2' ? 'Branch Office 2' : 
                       site === 'datacenter' ? 'Data Center' : site}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Switch Type Filter */}
            <div className="mb-4">
              <Label className="text-sm font-medium text-foreground mb-2 block">Switch Type</Label>
              <Select value={filters.switchType || "all"} onValueChange={(value) => updateFilter('switchType', value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {switchTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type === 'access' ? 'Access Switches' : 
                       type === 'distribution' ? 'Distribution Switches' : 
                       type === 'core' ? 'Core Switches' : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Temperature Range Filter */}
            <div className="mb-4">
              <Label className="text-sm font-medium text-foreground mb-2 block">Temperature Status</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showNormal"
                    checked={filters.showNormal}
                    onCheckedChange={(checked) => updateFilter('showNormal', checked)}
                  />
                  <Label htmlFor="showNormal" className="text-sm text-muted-foreground">
                    Normal (20-45°C)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showWarning"
                    checked={filters.showWarning}
                    onCheckedChange={(checked) => updateFilter('showWarning', checked)}
                  />
                  <Label htmlFor="showWarning" className="text-sm text-muted-foreground">
                    Warning (45-60°C)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showCritical"
                    checked={filters.showCritical}
                    onCheckedChange={(checked) => updateFilter('showCritical', checked)}
                  />
                  <Label htmlFor="showCritical" className="text-sm text-muted-foreground">
                    Critical ({'>'}60°C)
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {stats && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Switches</span>
                  <span className="font-semibold text-foreground">{stats.totalSwitches}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Online</span>
                  <span className="font-semibold text-success">{stats.onlineSwitches}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Alerts</span>
                  <span className="font-semibold text-destructive">{stats.alertCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Temp</span>
                  <span className="font-semibold text-foreground">{stats.avgTemperature}°C</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
