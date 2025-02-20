import { elizaLogger } from "@elizaos/core";
import type { Market, MarketAnalysis } from "../types";
import { getConfig } from "../environment";

export class AIGGService {
    private static instance: AIGGService | null = null;
    private baseUrl: string;

    private constructor() {
        const config = getConfig();
        this.baseUrl = config.AIGG_API_URL;
    }

    static getInstance(): AIGGService {
        if (!this.instance) {
            this.instance = new AIGGService();
        }
        return this.instance;
    }

    async getMarket(marketId: string): Promise<Market> {
        try {
            elizaLogger.info(`Fetching market ${marketId} from API`);
            const response = await fetch(`${this.baseUrl}/markets/${marketId}`);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const market = await response.json();
            elizaLogger.info(`Successfully retrieved market data for ${marketId}`, { market });
            return market;
        } catch (error) {
            elizaLogger.error(`Error fetching market ${marketId}:`, error);
            throw error;
        }
    }

    async getMarketAnalysis(marketId: string): Promise<MarketAnalysis> {
        try {
            elizaLogger.info(`Fetching market analysis for ${marketId}`);
            const response = await fetch(`${this.baseUrl}/markets/${marketId}/analysis`);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const analysis = await response.json();
            elizaLogger.info(`Successfully retrieved market analysis for ${marketId}`, { analysis });
            return analysis;
        } catch (error) {
            elizaLogger.error(`Error fetching market analysis ${marketId}:`, error);
            throw error;
        }
    }
} 