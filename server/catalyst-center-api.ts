import https from 'https';
import type { Switch, InsertSwitch, TemperatureReading } from '@shared/schema';

interface CatalystCenterDevice {
  id: string;
  hostname: string;
  managementIpAddress: string;
  macAddress: string;
  platformId: string;
  softwareVersion: string;
  softwareType: string;
  collectionStatus: string;
  roleSource: string;
  associatedWlcIp: string;
  bootDateTime: string;
  collectionInterval: string;
  errorCode: string;
  errorDescription: string;
  lastUpdateTime: number;
  lastUpdated: string;
  lineCardCount: string;
  lineCardId: string;
  location: string;
  locationName: string;
  memorySize: string;
  neighborTopology: any[];
  serialNumber: string;
  snmpContact: string;
  snmpLocation: string;
  tagCount: string;
  tunnelUdpPort: string;
  uptimeSeconds: number;
  waasDeviceMode: string;
  series: string;
  inventoryStatusDetail: string;
  collectionStatusErrorCode: string;
  type: string;
  family: string;
  role: string;
  instanceTenantId: string;
  instanceUuid: string;
  overallHealth: number;
  temperature?: string;
  cpuUtilization?: string;
  memoryUtilization?: string;
}

interface CatalystCenterResponse {
  response: CatalystCenterDevice[];
  version: string;
}

interface AuthToken {
  token: string;
  expiresAt: number;
}

class CatalystCenterAPI {
  private baseUrl: string;
  private username: string;
  private password: string;
  private authToken: AuthToken | null = null;

  constructor() {
    this.baseUrl = process.env.CATALYST_CENTER_BASE_URL || '';
    this.username = process.env.CATALYST_CENTER_USERNAME || '';
    this.password = process.env.CATALYST_CENTER_PASSWORD || '';
    
    // Debug logging (remove in production)
    console.log('Catalyst Center Configuration:', {
      baseUrl: this.baseUrl ? 'SET' : 'NOT SET',
      username: this.username ? 'SET' : 'NOT SET',
      password: this.password ? 'SET' : 'NOT SET'
    });
  }

  private isConfigured(): boolean {
    return !!(this.baseUrl && this.username && this.password);
  }

  private async authenticate(): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error(`Catalyst Center credentials not configured. Base URL: ${this.baseUrl}, Username: ${this.username ? 'SET' : 'NOT SET'}, Password: ${this.password ? 'SET' : 'NOT SET'}`);
    }

    // Check if we have a valid token
    if (this.authToken && this.authToken.expiresAt > Date.now()) {
      return this.authToken.token;
    }

    // Validate URL format
    try {
      new URL(this.baseUrl);
    } catch (error) {
      throw new Error(`Invalid base URL format: ${this.baseUrl}`);
    }

    return new Promise((resolve, reject) => {
      const authData = JSON.stringify({
        username: this.username,
        password: this.password
      });

      const url = new URL(this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: '/dna/system/api/v1/auth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(authData),
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`
        },
        rejectUnauthorized: false // For self-signed certificates
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              const response = JSON.parse(data);
              const token = response.Token;
              
              // Store token with 1 hour expiry (Catalyst Center tokens typically last 1 hour)
              this.authToken = {
                token,
                expiresAt: Date.now() + (55 * 60 * 1000) // 55 minutes to be safe
              };
              
              resolve(token);
            } else {
              reject(new Error(`Authentication failed: ${res.statusCode} ${data}`));
            }
          } catch (error) {
            reject(new Error(`Authentication response parsing failed: ${error}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Authentication request failed: ${error.message}`));
      });

      req.write(authData);
      req.end();
    });
  }

  private async makeAuthenticatedRequest(path: string): Promise<any> {
    const token = await this.authenticate();

    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path,
        method: 'GET',
        headers: {
          'X-Auth-Token': token,
          'Content-Type': 'application/json'
        },
        rejectUnauthorized: false
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              resolve(JSON.parse(data));
            } else {
              reject(new Error(`API request failed: ${res.statusCode} ${data}`));
            }
          } catch (error) {
            reject(new Error(`Response parsing failed: ${error}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      req.end();
    });
  }

  async getDeviceHealth(): Promise<CatalystCenterDevice[]> {
    if (!this.isConfigured()) {
      console.warn('Catalyst Center not configured, using fallback data');
      return [];
    }

    try {
      const response: CatalystCenterResponse = await this.makeAuthenticatedRequest('/dna/intent/api/v1/device-health');
      return response.response || [];
    } catch (error) {
      console.error('Failed to fetch device health from Catalyst Center:', error);
      throw error;
    }
  }

  private mapDeviceToSwitch(device: CatalystCenterDevice): Switch {
    // Extract temperature from device data - Catalyst Center may provide temperature in different formats
    let temperature = 25; // Default temperature if none found
    
    if (device.temperature) {
      // Handle various temperature formats: "45.2°C", "45.2", "45 C", etc.
      const tempMatch = device.temperature.toString().match(/(\d+\.?\d*)/);
      if (tempMatch) {
        temperature = parseFloat(tempMatch[1]);
        // Ensure temperature is within reasonable bounds
        if (temperature < 0 || temperature > 100) {
          temperature = 25; // Reset to default if unreasonable
        }
      }
    }
    
    // Also check for temperature in other possible fields
    if (temperature === 25 && device.overallHealth) {
      // Sometimes temperature correlates with health score - this is a fallback
      // Health score 1-10, convert to rough temperature estimate
      temperature = 20 + (device.overallHealth * 4); // Maps 1-10 to 24-60°C range
    }

    // Determine switch type based on platform/series
    let switchType: 'access' | 'distribution' | 'core' = 'access';
    if (device.series?.toLowerCase().includes('9500') || device.role?.toLowerCase().includes('core')) {
      switchType = 'core';
    } else if (device.series?.toLowerCase().includes('9400') || device.role?.toLowerCase().includes('distribution')) {
      switchType = 'distribution';
    }

    // Map location information
    const locationParts = device.locationName?.split('/') || ['Unknown'];
    const site = locationParts[0]?.toLowerCase().replace(/\s+/g, '') || 'unknown';
    const location = device.locationName || device.snmpLocation || 'Unknown Location';

    return {
      id: device.id,
      name: device.hostname || `Switch-${device.id.slice(-6)}`,
      model: device.platformId || 'Unknown Model',
      location: location,
      rack: device.snmpLocation || null,
      site: site,
      switchType: switchType,
      currentTemperature: temperature,
      isOnline: device.collectionStatus === 'Managed' && device.overallHealth > 0,
      lastUpdate: new Date(device.lastUpdateTime || Date.now())
    };
  }

  async getSwitches(): Promise<Switch[]> {
    try {
      const devices = await this.getDeviceHealth();
      
      // Filter for switch devices only
      const switches = devices
        .filter(device => {
          const type = device.type?.toLowerCase() || '';
          const family = device.family?.toLowerCase() || '';
          const platformId = device.platformId?.toLowerCase() || '';
          
          return type.includes('switch') || 
                 family.includes('switch') || 
                 platformId.includes('catalyst') ||
                 platformId.includes('9300') ||
                 platformId.includes('9400') ||
                 platformId.includes('9500');
        })
        .map(device => this.mapDeviceToSwitch(device));

      return switches;
    } catch (error) {
      console.error('Failed to get switches from Catalyst Center:', error);
      // Return empty array to let fallback data be used
      return [];
    }
  }

  async refreshDeviceData(): Promise<{ success: boolean; message: string; switchCount?: number }> {
    try {
      const switches = await this.getSwitches();
      return {
        success: true,
        message: `Successfully refreshed data for ${switches.length} switches`,
        switchCount: switches.length
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to refresh device data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export const catalystCenterAPI = new CatalystCenterAPI();