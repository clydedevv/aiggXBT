import { elizaLogger } from "@elizaos/core";
import type { Market, MarketAnalysis } from "./types";
import { getConfig } from "./environment";

export class AIGGClient {
    private baseUrl: string;

    constructor() {
        const config = getConfig();
        this.baseUrl = config.AIGG_API_URL;
    }

    async getMarkets(params: { 
        active?: boolean; 
        include_closed?: boolean; 
        limit?: number; 
    }): Promise<Market[]> {
        try {
            const queryParams = new URLSearchParams();
            if (params.active !== undefined) queryParams.append("active", params.active.toString());
            if (params.include_closed !== undefined) queryParams.append("include_closed", params.include_closed.toString());
            if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());

            const response = await fetch(`${this.baseUrl}/markets?${queryParams}`);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            elizaLogger.error("Error fetching markets:", error);
            throw error;
        }
    }

    async getMarket(marketId: string): Promise<Market> {
        try {
            const response = await fetch(`${this.baseUrl}/markets/${marketId}`);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            elizaLogger.error(`Error fetching market ${marketId}:`, error);
            throw error;
        }
    }
} 