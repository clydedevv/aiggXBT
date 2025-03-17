import { elizaLogger } from "@elizaos/core";

interface InsightsRequest {
    insights_topic: string;
    max_loops?: number;
}

interface InsightsResponse {
    analysis: string;
    sources: string[];
}

export class InsightsService {
    private static instance: InsightsService | null = null;
    private baseUrl: string;

    private constructor() {
        // Default to localhost for development
        this.baseUrl = process.env.INSIGHTS_API_URL || 'http://37.27.54.184:8001';
    }

    static getInstance(): InsightsService {
        if (!this.instance) {
            this.instance = new InsightsService();
        }
        return this.instance;
    }

    async getInsights(topic: string, maxLoops: number = 1): Promise<InsightsResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    insights_topic: topic,
                    max_loops: maxLoops
                } as InsightsRequest)
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            return data as InsightsResponse;

        } catch (error) {
            elizaLogger.error('Error fetching insights:', error);
            throw error;
        }
    }
} 