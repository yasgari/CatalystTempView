import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSwitchSchema, insertTemperatureReadingSchema } from "@shared/schema";
import { catalystCenterAPI } from "./catalyst-center-api";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all switches
  app.get("/api/switches", async (req, res) => {
    try {
      const switches = await storage.getSwitches();
      
      // Add temperature readings to historical data for each switch
      for (const switchData of switches) {
        await storage.updateSwitchTemperature(switchData.id, switchData.currentTemperature);
      }
      
      res.json(switches);
    } catch (error) {
      console.error("Error fetching switches:", error);
      res.status(500).json({ message: "Failed to fetch switches" });
    }
  });

  // Get single switch
  app.get("/api/switches/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const switchData = await storage.getSwitch(id);
      
      if (!switchData) {
        return res.status(404).json({ message: "Switch not found" });
      }
      
      res.json(switchData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch switch" });
    }
  });

  // Create new switch
  app.post("/api/switches", async (req, res) => {
    try {
      const validatedData = insertSwitchSchema.parse(req.body);
      const newSwitch = await storage.createSwitch(validatedData);
      res.status(201).json(newSwitch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid switch data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create switch" });
    }
  });

  // Update switch temperature
  app.patch("/api/switches/:id/temperature", async (req, res) => {
    try {
      const { id } = req.params;
      const { temperature } = req.body;
      
      if (typeof temperature !== 'number') {
        return res.status(400).json({ message: "Temperature must be a number" });
      }
      
      const updatedSwitch = await storage.updateSwitchTemperature(id, temperature);
      
      if (!updatedSwitch) {
        return res.status(404).json({ message: "Switch not found" });
      }
      
      res.json(updatedSwitch);
    } catch (error) {
      res.status(500).json({ message: "Failed to update switch temperature" });
    }
  });

  // Get temperature readings
  app.get("/api/temperature-readings", async (req, res) => {
    try {
      const { switchId, limit } = req.query;
      const readings = await storage.getTemperatureReadings(
        switchId as string, 
        limit ? parseInt(limit as string) : undefined
      );
      res.json(readings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch temperature readings" });
    }
  });

  // Create temperature reading
  app.post("/api/temperature-readings", async (req, res) => {
    try {
      const validatedData = insertTemperatureReadingSchema.parse(req.body);
      const newReading = await storage.createTemperatureReading(validatedData);
      res.status(201).json(newReading);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid temperature reading data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create temperature reading" });
    }
  });

  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Get temperature distribution
  app.get("/api/dashboard/temperature-distribution", async (req, res) => {
    try {
      const distribution = await storage.getTemperatureDistribution();
      res.json(distribution);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch temperature distribution" });
    }
  });

  // Get temperature trends
  app.get("/api/dashboard/temperature-trends", async (req, res) => {
    try {
      const { hours = 24 } = req.query;
      const trends = await storage.getTemperatureTrends(parseInt(hours as string));
      res.json(trends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch temperature trends" });
    }
  });

  // Refresh all switch data from Catalyst Center
  app.post("/api/dashboard/refresh", async (req, res) => {
    try {
      // Try to refresh from Catalyst Center first
      const refreshResult = await catalystCenterAPI.refreshDeviceData();
      
      if (refreshResult.success) {
        const stats = await storage.getDashboardStats();
        res.json({ 
          message: refreshResult.message, 
          stats,
          source: "catalyst-center" 
        });
      } else {
        // Fallback to mock data refresh
        const switches = await storage.getSwitches();
        
        for (const switchData of switches) {
          const variation = (Math.random() - 0.5) * 4; // ±2°C variation
          const newTemp = Math.max(20, Math.min(80, switchData.currentTemperature + variation));
          await storage.updateSwitchTemperature(switchData.id, newTemp);
        }
        
        const stats = await storage.getDashboardStats();
        res.json({ 
          message: "Data refreshed using mock data (Catalyst Center unavailable)", 
          stats,
          source: "mock-data",
          catalystCenterError: refreshResult.message
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to refresh data" });
    }
  });

  // Test Catalyst Center connection
  app.get("/api/catalyst-center/status", async (req, res) => {
    try {
      const result = await catalystCenterAPI.refreshDeviceData();
      res.json({
        connected: result.success,
        message: result.message,
        switchCount: result.switchCount,
        dataSource: result.success ? "catalyst-center" : "mock-data"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.json({
        connected: false,
        message: `Connection failed: ${errorMessage}`,
        switchCount: 0,
        dataSource: "mock-data"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
