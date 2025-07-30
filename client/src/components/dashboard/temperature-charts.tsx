import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState } from "react";
import { BarChart3 } from "lucide-react";
import type { TemperatureDistribution, TrendDataPoint } from "@shared/schema";

export default function TemperatureCharts() {
  const [timeRange, setTimeRange] = useState("24");

  const { data: trends = [] } = useQuery<TrendDataPoint[]>({
    queryKey: ["/api/dashboard/temperature-trends", { hours: timeRange }]
  });

  const { data: distribution } = useQuery<TemperatureDistribution>({
    queryKey: ["/api/dashboard/temperature-distribution"]
  });

  // Format trend data for chart
  const chartData = trends.map(point => {
    const date = new Date(point.timestamp);
    return {
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      ...Object.fromEntries(
        Object.entries(point)
          .filter(([key]) => key !== 'timestamp')
          .map(([key, value]) => [key, typeof value === 'number' ? Math.round(value * 10) / 10 : value])
      )
    };
  });

  // Get switch names for legend (exclude timestamp)
  const switchNames = trends.length > 0 
    ? Object.keys(trends[0]).filter(key => key !== 'timestamp')
    : [];

  // Colors for line chart
  const colors = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', '#8B5CF6', '#06B6D4'];

  // Distribution chart data
  const distributionData = distribution ? [
    { name: 'Normal (20-45°C)', value: distribution.normal, color: 'hsl(var(--success))' },
    { name: 'Warning (45-60°C)', value: distribution.warning, color: 'hsl(var(--warning))' },
    { name: 'Critical (>60°C)', value: distribution.critical, color: 'hsl(var(--destructive))' },
  ] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Temperature Trend Chart */}
      <Card className="bg-surface border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">Temperature Trends</CardTitle>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last Hour</SelectItem>
                <SelectItem value="6">Last 6 Hours</SelectItem>
                <SelectItem value="24">Last 24 Hours</SelectItem>
                <SelectItem value="168">Last 7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  domain={[20, 80]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
                {switchNames.slice(0, 5).map((switchName, index) => (
                  <Line
                    key={switchName}
                    type="monotone"
                    dataKey={switchName}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Temperature Distribution */}
      <Card className="bg-surface border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">Temperature Distribution</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>Current Status</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
