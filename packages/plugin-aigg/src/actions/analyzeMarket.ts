import { Action, elizaLogger, IAgentRuntime, Memory, State, HandlerCallback, Content } from "@elizaos/core";
import { AIGGClient } from "../client";

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
    name: "analyze_market",
    description: "Analyze market trends, patterns and provide insights",
    similes: [
        "analyze market",
        "check market",
        "market analysis",
        "evaluate market",
        "what do you think about market",
        "assess market"
    ],
    examples: [[
        {
            user: "user",
            content: {
                text: "analyze market 523138"
            }
        },
        {
            user: "assistant",
            content: {
                text: "Let me analyze that market for you...",
                data: {
                    analysis: {
                        question: "Will X happen?",
                        probability: 65.5,
                        volume24h: 10000,
                        outcomes: ["Yes", "No"],
                        prices: ["0.655", "0.345"],
                        esndDate: "2024-12-31",
                        lastUpdated: "2024-03-20"
                    }
                }
            }
        }
    ]],

    validate: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<boolean> => {
        try {
            // Check if this is a follow-up question about market data
            if (state?.lastAction === "analyze_market" && 
                state?.marketData && 
                (message.content.text.toLowerCase().includes("numbers") || 
                 message.content.text.toLowerCase().includes("data") ||
                 message.content.text.toLowerCase().includes("give me"))) {
                elizaLogger.info("Validating follow-up question with state:", {
                    lastAction: state.lastAction,
                    hasMarketData: !!state.marketData
                });
                return true;
            }

            // Original market ID validation
            const hasMarketKeyword = message.content.text.toLowerCase().includes("market");
            const hasMarketId = /market.*?(\d+)/i.test(message.content.text);
            
            elizaLogger.info("Validating market request:", {
                hasMarketKeyword,
                hasMarketId
            });
            
            return hasMarketKeyword && hasMarketId;
        } catch (error) {
            elizaLogger.error("Validation error:", error);
            return false;
        }
    },

    handler: async (
        runtime: IAgentRuntime, 
        message: Memory, 
        state?: State,
        options?: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        try {
            const client = new AIGGClient();
            
            const marketIdMatch = message.content.text.match(/market.*?(\d+)/i);
            if (!marketIdMatch) {
                throw new ValidationError("No valid market ID found in request");
            }

            const marketId = marketIdMatch[1];
            elizaLogger.info(`Fetching market ${marketId} from API`);
            
            const market = await client.getMarket(marketId);
            elizaLogger.info(`Successfully retrieved market data for ${marketId}`, { market });

            if (!market || typeof market !== 'object') {
                throw new APIError(`Failed to fetch market data for ID ${marketId}`);
            }

            // Safely parse JSON strings with error handling
            const outcomes = typeof market.outcomes === 'string' ? JSON.parse(market.outcomes) : market.outcomes;
            const prices = typeof market.outcome_prices === 'string' ? JSON.parse(market.outcome_prices) : market.outcome_prices;

            const probability = parseFloat(prices[0]) * 100;
            const analysisText = `Eyy, here's what I got on market #${marketId} 🤌

${market.question}

Current Action:
- ${outcomes[0]}: ${probability.toFixed(1)}%
- ${outcomes[1]}: ${(100 - probability).toFixed(1)}%

24h Volume: $${market.volume_24h.toLocaleString()}
End Date: ${new Date(market.end_date).toLocaleDateString()}

Quick Take: ${market.description.split('\n')[0]}

Need any specific angles on these numbers, paisan? 🤌`;

            // Simplified state storage
            if (state) {
                elizaLogger.info("Storing market data in state", {
                    marketId,
                    marketData: {
                        question: market.question,
                        probability,
                        volume24h: market.volume_24h,
                        outcomes,
                        prices,
                        endDate: market.end_date,
                        lastUpdated: market.last_updated
                    }
                });
                
                state.lastAction = "analyze_market";
                state.currentMarketId = marketId;
                state.marketData = {
                    question: market.question,
                    probability,
                    volume24h: market.volume_24h,
                    outcomes,
                    prices,
                    endDate: market.end_date,
                    lastUpdated: market.last_updated
                };
            }

            return {
                text: analysisText,
                content: {
                    success: true,
                    data: {
                        marketId,
                        analysis: {
                            question: market.question,
                            probability,
                            volume24h: market.volume_24h,
                            outcomes,
                            prices,
                            endDate: market.end_date,
                            lastUpdated: market.last_updated
                        }
                    }
                }
            };

        } catch (error) {
            elizaLogger.error("Error in analyzeMarket action:", {
                error: error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : undefined
            });

            return {
                text: "Ay, hit a snag pulling that market data. Give me another shot with the ID.",
                content: {
                    success: false,
                    error: {
                        code: "MARKET_ANALYSIS_ERROR",
                        message: error instanceof Error ? error.message : "Unknown error occurred"
                    }
                }
            };
        }
    }
}; 