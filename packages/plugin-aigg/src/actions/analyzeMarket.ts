import { Action, elizaLogger, IAgentRuntime, Memory, State, HandlerCallback, Content } from "@elizaos/core";
import { AIGGService } from "../services/AIGGService";

// Custom error types
class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

class APIError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "APIError";
    }
}

interface AnalyzeMarketContent extends Content {
    text: string;
    marketId?: string;
    data?: {
        analysis?: {
            question: string;
            probability: number;
            volume24h: number;
            outcomes: string[];
            prices: string[];
            endDate: string;
            lastUpdated: string;
        };
    };
}

// Add interface for our state data
interface MarketState extends State {
    lastAction?: string;
    currentMarketId?: string;
    marketData?: {
        question: string;
        probability: number;
        volume24h: number;
        outcomes: string[];
        prices: string[];
        endDate: string;
        lastUpdated: string;
    };
}

export const analyzeMarket: Action = {
    name: "ANALYZE_MARKET",
    description: "Analyze market trends and provide insights",
    similes: [
        "analyze market",
        "check market",
        "market analysis",
        "evaluate market",
        "what do you think about market",
        "assess market"
    ],

    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },

    handler: async (
        runtime: IAgentRuntime, 
        message: Memory, 
        state?: State,
        options?: { [key: string]: unknown },
        callback?: HandlerCallback
    ): Promise<boolean> => {
        try {
            const marketIdMatch = message.content.text.match(/market.*?(\d+)/i);
            if (!marketIdMatch) {
                throw new Error("No valid market ID found in request");
            }

            const marketId = marketIdMatch[1];
            const service = AIGGService.getInstance();
            const market = await service.getMarket(marketId);

            // Parse outcomes and prices
            const outcomes = typeof market.outcomes === 'string' ? JSON.parse(market.outcomes) : market.outcomes;
            const prices = typeof market.outcome_prices === 'string' ? JSON.parse(market.outcome_prices) : market.outcome_prices;
            const probability = parseFloat(prices[0]) * 100;

            const analysisText = `Market Analysis for #${marketId}:

${market.question}

Current Probabilities:
- ${outcomes[0]}: ${probability.toFixed(1)}%
- ${outcomes[1]}: ${(100 - probability).toFixed(1)}%

24h Volume: $${market.volume_24h.toLocaleString()}
End Date: ${new Date(market.end_date).toLocaleDateString()}

Description: ${market.description}`;

            if (callback) {
                callback({
                    text: analysisText,
                    marketId,
                    data: {
                        market: {
                            id: marketId,
                            question: market.question,
                            probability,
                            volume24h: market.volume_24h,
                            outcomes,
                            prices,
                            endDate: market.end_date,
                            lastUpdated: market.last_updated
                        }
                    }
                });
            }

            return true;
        } catch (error) {
            elizaLogger.error("Error in analyzeMarket action:", error);
            if (callback) {
                callback({
                    text: "Sorry, I had trouble analyzing that market. Please try again.",
                    error: error instanceof Error ? error.message : "Unknown error"
                });
            }
            return false;
        }
    },

    examples: [[
        {
            user: "user",
            content: { text: "analyze market 523138" }
        },
        {
            user: "assistant",
            content: {
                text: "Let me analyze that market for you...",
                action: "ANALYZE_MARKET"
            }
        }
    ]]
}; 