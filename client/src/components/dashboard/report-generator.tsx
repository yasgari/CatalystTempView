import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileText, Download, Calendar, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Switch } from "@shared/schema";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface ReportGeneratorProps {
  switches: Switch[];
}

export default function ReportGenerator({ switches }: ReportGeneratorProps) {
  const [reportType, setReportType] = useState("summary");
  const [selectedSite, setSelectedSite] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const sites = Array.from(new Set(switches.map(s => s.site)));

  const { data: temperatureReadings = [] } = useQuery({
    queryKey: ["/api/temperature-readings"],
    enabled: false // Only fetch when generating detailed report
  });

  const generatePDFReport = async () => {
    setIsGenerating(true);
    
    try {
      // Filter switches based on selected site
      const filteredSwitches = selectedSite === "all" 
        ? switches 
        : switches.filter(s => s.site === selectedSite);

      // Fetch detailed temperature readings if needed
      let detailedReadings: any[] = [];
      if (reportType === "detailed") {
        try {
          detailedReadings = await apiRequest("GET", "/api/temperature-readings") as any[];
          console.log(`Fetched ${detailedReadings.length} temperature readings for detailed report`);
        } catch (error) {
          console.warn("Failed to fetch detailed readings:", error);
          detailedReadings = [];
        }
      }

      // Create PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("Cisco Catalyst Center", margin, 30);
      doc.setFontSize(16);
      doc.text("Temperature Monitoring Report", margin, 45);
      
      // Report info
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const currentDate = new Date().toLocaleDateString();
      const currentTime = new Date().toLocaleTimeString();
      doc.text(`Generated: ${currentDate} ${currentTime}`, margin, 55);
      doc.text(`Report Type: ${reportType === "summary" ? "Summary" : "Detailed"}`, margin, 62);
      doc.text(`Site Filter: ${selectedSite === "all" ? "All Sites" : selectedSite.toUpperCase()}`, margin, 69);
      doc.text(`Total Switches: ${filteredSwitches.length}`, margin, 76);

      // Summary statistics using actual temperature data
      const normalCount = filteredSwitches.filter(s => s.currentTemperature >= 20 && s.currentTemperature <= 45).length;
      const warningCount = filteredSwitches.filter(s => s.currentTemperature > 45 && s.currentTemperature <= 60).length;
      const criticalCount = filteredSwitches.filter(s => s.currentTemperature > 60).length;
      const avgTemp = filteredSwitches.reduce((sum, s) => sum + s.currentTemperature, 0) / filteredSwitches.length;
      
      // Temperature statistics
      const maxTemp = Math.max(...filteredSwitches.map(s => s.currentTemperature));
      const minTemp = Math.min(...filteredSwitches.map(s => s.currentTemperature));
      const hottestSwitch = filteredSwitches.find(s => s.currentTemperature === maxTemp);
      const coolestSwitch = filteredSwitches.find(s => s.currentTemperature === minTemp);

      // Add summary table
      doc.autoTable({
        startY: 85,
        head: [['Status', 'Count', 'Percentage']],
        body: [
          ['Normal (20-45°C)', normalCount.toString(), `${((normalCount/filteredSwitches.length)*100).toFixed(1)}%`],
          ['Warning (45-60°C)', warningCount.toString(), `${((warningCount/filteredSwitches.length)*100).toFixed(1)}%`],
          ['Critical (>60°C)', criticalCount.toString(), `${((criticalCount/filteredSwitches.length)*100).toFixed(1)}%`],
          ['Average Temperature', `${avgTemp.toFixed(1)}°C`, '-'],
          ['Highest Temperature', `${maxTemp.toFixed(1)}°C`, hottestSwitch?.name || 'N/A'],
          ['Lowest Temperature', `${minTemp.toFixed(1)}°C`, coolestSwitch?.name || 'N/A']
        ],
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 }
      });

      // Switch details table
      const switchTableData = filteredSwitches.map(switchItem => {
        const status = switchItem.currentTemperature >= 20 && switchItem.currentTemperature <= 45 ? 'Normal' :
                      switchItem.currentTemperature > 45 && switchItem.currentTemperature <= 60 ? 'Warning' : 'Critical';
        
        return [
          switchItem.name,
          switchItem.model,
          switchItem.location,
          switchItem.site.toUpperCase(),
          `${switchItem.currentTemperature.toFixed(1)}°C`,
          status,
          switchItem.isOnline ? 'Online' : 'Offline',
          new Date(switchItem.lastUpdate || new Date()).toLocaleDateString()
        ];
      });

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Switch Name', 'Model', 'Location', 'Site', 'Temperature', 'Status', 'Online', 'Last Update']],
        body: switchTableData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        columnStyles: {
          4: { halign: 'center' }, // Temperature
          5: { halign: 'center' }, // Status
          6: { halign: 'center' }, // Online
          7: { halign: 'center' }  // Last Update
        }
      });

      // Add detailed readings if requested
      if (reportType === "detailed" && detailedReadings.length > 0) {
        // Group readings by switch
        const readingsBySwitch = detailedReadings.reduce((acc: any, reading: any) => {
          const switchData = filteredSwitches.find(s => s.id === reading.switchId);
          if (switchData) {
            if (!acc[switchData.name]) acc[switchData.name] = [];
            acc[switchData.name].push(reading);
          }
          return acc;
        }, {});

        // Add readings for each switch
        Object.entries(readingsBySwitch).forEach(([switchName, readings]: [string, any]) => {
          if (doc.lastAutoTable.finalY > 250) {
            doc.addPage();
          }

          doc.setFontSize(12);
          doc.setTextColor(40, 40, 40);
          doc.text(`Temperature History: ${switchName}`, margin, doc.lastAutoTable.finalY + 30);

          const readingData = (readings as any[])
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10) // Last 10 readings
            .map(reading => [
              new Date(reading.timestamp).toLocaleDateString(),
              new Date(reading.timestamp).toLocaleTimeString(),
              `${reading.temperature.toFixed(1)}°C`
            ]);

          doc.autoTable({
            startY: doc.lastAutoTable.finalY + 35,
            head: [['Date', 'Time', 'Temperature']],
            body: readingData,
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [52, 152, 219], textColor: 255 }
          });
        });
      }

      // Footer
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 40, doc.internal.pageSize.height - 10);
        doc.text('Cisco Catalyst Center Temperature Report', margin, doc.internal.pageSize.height - 10);
      }

      // Download the PDF
      const fileName = `cisco-temperature-report-${selectedSite}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "Report Generated",
        description: `PDF report has been downloaded as ${fileName}`,
      });

    } catch (error) {
      console.error("Report generation error:", error);
      toast({
        title: "Report Generation Failed",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center">
          <FileText className="h-5 w-5 mr-2 text-primary" />
          Generate Temperature Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Report Type */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary Report</SelectItem>
                <SelectItem value="detailed">Detailed Report with History</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Site Filter */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Site</Label>
            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger>
                <SelectValue />
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
        </div>

        {/* Report Info */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Building2 className="h-4 w-4 mr-1" />
              <span>
                {selectedSite === "all" ? `${switches.length} switches` : 
                 `${switches.filter(s => s.site === selectedSite).length} switches`}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>As of {new Date().toLocaleDateString()}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {reportType === "summary" 
              ? "Includes current temperature status and switch inventory overview"
              : "Includes current status plus historical temperature readings for each switch"}
          </p>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generatePDFReport}
          disabled={isGenerating}
          className="w-full bg-primary hover:bg-primary/90"
        >
          <Download className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating Report...' : 'Generate PDF Report'}
        </Button>
      </CardContent>
    </Card>
  );
}