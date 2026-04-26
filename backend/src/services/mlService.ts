/**
 * ML Service Integration
 * Communicates with Python ML microservice for AI-powered threat detection
 */
import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env.js';

interface MLPrediction {
  is_threat: boolean;
  confidence: number;
  threat_probability: number;
  safe_probability: number;
  ml_score: number;
  features_analyzed: number;
  model_version: string;
}

interface MLFeatures {
  url_length: number;
  domain_length: number;
  has_ip_address: boolean;
  has_at_symbol: boolean;
  has_double_slash: boolean;
  num_subdomains: number;
  num_dots: number;
  num_hyphens: number;
  num_underscores: number;
  num_digits: number;
  num_special_chars: number;
  entropy: number;
  suspicious_tld: boolean;
  url_shortener: boolean;
  [key: string]: any;
}

interface MLAnalysisResponse {
  success: boolean;
  prediction: MLPrediction;
  features: MLFeatures;
  risk_factors: string[];
  confidence_factors: string[];
  feature_importance?: Array<{ feature: string; importance: number }> | null;
}

class MLService {
  private client: AxiosInstance;
  private isAvailable: boolean = false;
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 60000; // 1 minute
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private coldStartTimeout: number = 60000; // 60 seconds for cold start
  private isWarmingUp: boolean = false;

  constructor() {
    const mlServiceUrl = config.mlServiceUrl || 'http://localhost:5000';
    
    this.client = axios.create({
      baseURL: mlServiceUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Initial health check
    this.checkHealth();
    
    // Start keep-alive mechanism (ping every 10 minutes to prevent sleep)
    this.startKeepAlive();
  }

  /**
   * Check if ML service is available
   * @param allowColdStart - If true, waits longer for service to wake up from sleep
   */
  async checkHealth(allowColdStart: boolean = false): Promise<boolean> {
    const now = Date.now();
    
    // Use cached result if recent (unless we're explicitly checking for cold start)
    if (!allowColdStart && now - this.lastHealthCheck < this.healthCheckInterval) {
      return this.isAvailable;
    }

    try {
      const timeout = allowColdStart ? this.coldStartTimeout : 5000;
      const response = await this.client.get('/health', { timeout });
      const data = response.data as { status?: string; model_loaded?: boolean } | undefined;
      this.isAvailable =
        data?.status === 'healthy' && data?.model_loaded === true;
      this.lastHealthCheck = now;
      this.isWarmingUp = false;
      
      if (this.isAvailable) {
        console.log('✓ ML Service is available');
      } else {
        console.warn('⚠ ML Service is degraded (model not loaded)');
      }
      
      return this.isAvailable;
    } catch (error: any) {
      // If this was a timeout and we haven't tried cold start yet, mark as warming up
      if (!allowColdStart && (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT')) {
        console.log('⏳ ML Service may be sleeping (cold start), will retry with extended timeout...');
        this.isWarmingUp = true;
      }
      
      this.isAvailable = false;
      this.lastHealthCheck = now;
      
      if (!allowColdStart) {
        console.warn('⚠ ML Service is unavailable, using fallback detection');
      }
      
      return false;
    }
  }

  /**
   * Analyze URL using ML model
   */
  async analyzeUrl(url: string, engineeredFeatures?: Record<string, any>): Promise<MLAnalysisResponse | null> {
    try {
      // Check if service is available (quick check first)
      let available = await this.checkHealth();
      
      // If service appears down but might be warming up, try with cold start timeout
      if (!available && this.isWarmingUp) {
        console.log('⏳ Attempting to wake up ML service (this may take 30-60 seconds)...');
        available = await this.checkHealth(true);
      }
      
      if (!available) {
        return null;
      }

      const payload: any = { url };
      if (engineeredFeatures) payload.engineered_features = engineeredFeatures;

      // Use extended timeout for first request after cold start
      const timeout = this.isWarmingUp ? this.coldStartTimeout : 30000;
      const response = await this.client.post<MLAnalysisResponse>(
        '/api/ml/analyze-url',
        payload,
        { timeout }
      );

      if (response.data.success) {
        console.log(`ML Analysis: ${url} - Threat: ${response.data.prediction.is_threat}, Confidence: ${response.data.prediction.confidence}`);
        this.isWarmingUp = false; // Service is now warm
        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error('ML Service error:', error.message);
      this.isWarmingUp = false;
      return null;
    }
  }

  /**
   * Analyze content using ML model
   */
  async analyzeContent(content: string, url?: string): Promise<MLAnalysisResponse | null> {
    try {
      // Check if service is available (quick check first)
      let available = await this.checkHealth();
      
      // If service appears down but might be warming up, try with cold start timeout
      if (!available && this.isWarmingUp) {
        console.log('⏳ Attempting to wake up ML service (this may take 30-60 seconds)...');
        available = await this.checkHealth(true);
      }
      
      if (!available) {
        return null;
      }

      // Use extended timeout for first request after cold start
      const timeout = this.isWarmingUp ? this.coldStartTimeout : 30000;
      const response = await this.client.post<MLAnalysisResponse>(
        '/api/ml/analyze-content',
        { content, url },
        { timeout }
      );

      if (response.data.success) {
        this.isWarmingUp = false; // Service is now warm
        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error('ML Service error:', error.message);
      this.isWarmingUp = false;
      return null;
    }
  }

  /**
   * Get ML model information
   */
  async getModelInfo(): Promise<any> {
    try {
      const response = await this.client.get('/api/ml/model-info');
      return response.data;
    } catch (error) {
      console.error('Error fetching ML model info:', error);
      return null;
    }
  }

  /**
   * Check if ML service is currently available
   */
  isServiceAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Start keep-alive mechanism to prevent service from sleeping
   * Pings the service every 10 minutes (Render free tier sleeps after 15 min inactivity)
   */
  private startKeepAlive(): void {
    // Only enable keep-alive in production
    if (config.nodeEnv !== 'production') {
      console.log('ℹ Keep-alive disabled in development mode');
      return;
    }

    // Ping every 10 minutes (600000 ms)
    this.keepAliveInterval = setInterval(async () => {
      try {
        await this.client.get('/health', { timeout: 5000 });
        console.log('💓 Keep-alive ping sent to ML service');
      } catch (error) {
        console.warn('⚠ Keep-alive ping failed (service may be down)');
      }
    }, 600000); // 10 minutes

    console.log('✓ ML Service keep-alive started (ping every 10 minutes)');
  }

  /**
   * Stop keep-alive mechanism (cleanup)
   */
  stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
      console.log('✓ ML Service keep-alive stopped');
    }
  }
}

export const mlService = new MLService();
