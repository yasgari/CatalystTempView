import { type Switch, type InsertSwitch, type TemperatureReading, type InsertTemperatureReading, type DashboardStats, type TemperatureDistribution, type TrendDataPoint } from "@shared/schema";
import { randomUUID } from "crypto";
import { catalystCenterAPI } from "./catalyst-center-api";

export interface IStorage {
  // Switch operations
  getSwitches(): Promise<Switch[]>;
  getSwitch(id: string): Promise<Switch | undefined>;
  createSwitch(switchData: InsertSwitch): Promise<Switch>;
  updateSwitchTemperature(id: string, temperature: number): Promise<Switch | undefined>;
  
  // Temperature reading operations
  getTemperatureReadings(switchId?: string, limit?: number): Promise<TemperatureReading[]>;
  createTemperatureReading(reading: InsertTemperatureReading): Promise<TemperatureReading>;
  
  // Dashboard data
  getDashboardStats(): Promise<DashboardStats>;
  getTemperatureDistribution(): Promise<TemperatureDistribution>;
  getTemperatureTrends(hours: number): Promise<TrendDataPoint[]>;
}

export class MemStorage implements IStorage {
  private switches: Map<string, Switch>;
  private temperatureReadings: Map<string, TemperatureReading>;

  constructor() {
    this.switches = new Map();
    this.temperatureReadings = new Map();
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with realistic switch data
    const mockSwitches: (InsertSwitch & { id: string })[] = [
      {
        id: "sw-hq-001",
        name: "SW-HQ-001",
        model: "Catalyst 9300-48T",
        location: "Building A, Floor 2",
        rack: "Rack 4, U12" as string,
        site: "hq",
        switchType: "access",
        currentTemperature: 38.2,
        isOnline: true,
      },
      {
        id: "sw-dc-005",
        name: "SW-DC-005",
        model: "Catalyst 9500-48Y4C",
        location: "Data Center",
        rack: "Rack 12, U18" as string,
        site: "datacenter",
        switchType: "core",
        currentTemperature: 52.8,
        isOnline: true,
      },
      {
        id: "sw-br1-003",
        name: "SW-BR1-003",
        model: "Catalyst 9300-24T",
        location: "Branch 1",
        rack: "Server Room, Wall Mount" as string,
        site: "branch1",
        switchType: "access",
        currentTemperature: 67.1,
        isOnline: true,
      },
      {
        id: "sw-hq-012",
        name: "SW-HQ-012",
        model: "Catalyst 9300-48T",
        location: "Building B, Floor 1",
        rack: "Rack 8, U6" as string,
        site: "hq",
        switchType: "access",
        currentTemperature: 34.5,
        isOnline: true,
      },
      // Add more switches for demo
      ...Array.from({ length: 20 }, (_, i) => ({
        id: `sw-auto-${i + 5}`,
        name: `SW-AUTO-${String(i + 5).padStart(3, '0')}`,
        model: i % 3 === 0 ? "Catalyst 9300-24T" : i % 3 === 1 ? "Catalyst 9300-48T" : "Catalyst 9500-48Y4C",
        location: `Building ${String.fromCharCode(65 + (i % 4))}, Floor ${(i % 3) + 1}`,
        rack: `Rack ${i % 10 + 1}, U${(i % 20) + 1}`,
        site: ["hq", "branch1", "branch2", "datacenter"][i % 4],
        switchType: ["access", "distribution", "core"][i % 3],
        currentTemperature: 25 + Math.random() * 45, // 25-70°C range
        isOnline: Math.random() > 0.1, // 90% online
      })),
    ];

    mockSwitches.forEach(switchData => {
      const switchWithTimestamp: Switch = {
        ...switchData,
        lastUpdate: new Date(),
      };
      this.switches.set(switchData.id, switchWithTimestamp);
    });

    // Generate historical temperature readings
    this.generateHistoricalData();
  }

  private generateHistoricalData() {
    const now = new Date();
    const switches = Array.from(this.switches.values());
    
    switches.forEach(switchItem => {
      // Generate 24 hours of data points (every hour)
      for (let i = 24; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        const baseTemp = switchItem.currentTemperature;
        const variation = (Math.random() - 0.5) * 10; // ±5°C variation
        const temperature = Math.max(20, Math.min(80, baseTemp + variation));
        
        const reading: TemperatureReading = {
          id: randomUUID(),
          switchId: switchItem.id,
          temperature,
          timestamp,
        };
        
        this.temperatureReadings.set(reading.id, reading);
      }
    });
  }

  async getSwitches(): Promise<Switch[]> {
    try {
      // Try to get real data from Catalyst Center first
      const realSwitches = await catalystCenterAPI.getSwitches();
      if (realSwitches.length > 0) {
        // Update our local storage with real data
        this.switches.clear();
        realSwitches.forEach(switchData => {
          this.switches.set(switchData.id, switchData);
        });
        return realSwitches;
      }
    } catch (error) {
      console.warn('Using fallback mock data due to Catalyst Center API error:', error);
    }
    
    // Fallback to mock data if Catalyst Center is not available
    return Array.from(this.switches.values());
  }

  async getSwitch(id: string): Promise<Switch | undefined> {
    return this.switches.get(id);
  }

  async createSwitch(switchData: InsertSwitch): Promise<Switch> {
    const id = randomUUID();
    const newSwitch: Switch = {
      ...switchData,
      id,
      lastUpdate: new Date(),
    };
    this.switches.set(id, newSwitch);
    return newSwitch;
  }

  async updateSwitchTemperature(id: string, temperature: number): Promise<Switch | undefined> {
    const existingSwitch = this.switches.get(id);
    if (!existingSwitch) return undefined;

    const updatedSwitch: Switch = {
      ...existingSwitch,
      currentTemperature: temperature,
      lastUpdate: new Date(),
    };
    
    this.switches.set(id, updatedSwitch);
    
    // Also create a temperature reading
    await this.createTemperatureReading({
      switchId: id,
      temperature,
    });
    
    return updatedSwitch;
  }

  async getTemperatureReadings(switchId?: string, limit?: number): Promise<TemperatureReading[]> {
    let readings = Array.from(this.temperatureReadings.values());
    
    if (switchId) {
      readings = readings.filter(r => r.switchId === switchId);
    }
    
    readings.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
    
    if (limit) {
      readings = readings.slice(0, limit);
    }
    
    return readings;
  }

  async createTemperatureReading(reading: InsertTemperatureReading): Promise<TemperatureReading> {
    const id = randomUUID();
    const newReading: TemperatureReading = {
      ...reading,
      id,
      timestamp: new Date(),
    };
    this.temperatureReadings.set(id, newReading);
    return newReading;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const switches = Array.from(this.switches.values());
    const totalSwitches = switches.length;
    const onlineSwitches = switches.filter(s => s.isOnline).length;
    const alertCount = switches.filter(s => s.currentTemperature > 45).length;
    const avgTemperature = switches.reduce((sum, s) => sum + s.currentTemperature, 0) / totalSwitches;

    return {
      totalSwitches,
      onlineSwitches,
      alertCount,
      avgTemperature: Math.round(avgTemperature * 10) / 10,
    };
  }

  async getTemperatureDistribution(): Promise<TemperatureDistribution> {
    const switches = Array.from(this.switches.values()).filter(s => s.isOnline);
    
    const normal = switches.filter(s => s.currentTemperature >= 20 && s.currentTemperature <= 45).length;
    const warning = switches.filter(s => s.currentTemperature > 45 && s.currentTemperature <= 60).length;
    const critical = switches.filter(s => s.currentTemperature > 60).length;

    return { normal, warning, critical };
  }

  async getTemperatureTrends(hours: number): Promise<TrendDataPoint[]> {
    const now = new Date();
    const switches = Array.from(this.switches.values()).slice(0, 5); // Top 5 switches for trends
    const dataPoints: TrendDataPoint[] = [];

    for (let i = hours; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const dataPoint: TrendDataPoint = {
        timestamp: timestamp.toISOString(),
      };

      switches.forEach(switchItem => {
        const readings = Array.from(this.temperatureReadings.values())
          .filter(r => r.switchId === switchItem.id)
          .filter(r => Math.abs((r.timestamp?.getTime() || 0) - timestamp.getTime()) < 30 * 60 * 1000) // Within 30 minutes
          .sort((a, b) => Math.abs((a.timestamp?.getTime() || 0) - timestamp.getTime()) - Math.abs((b.timestamp?.getTime() || 0) - timestamp.getTime()));

        if (readings.length > 0) {
          dataPoint[switchItem.name] = Math.round(readings[0].temperature * 10) / 10;
        }
      });

      dataPoints.push(dataPoint);
    }

    return dataPoints;
  }
}

export const storage = new MemStorage();
