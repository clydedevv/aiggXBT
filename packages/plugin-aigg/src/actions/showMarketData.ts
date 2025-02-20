import { Action, elizaLogger, IAgentRuntime, Memory, State, HandlerCallback, Content } from "@elizaos/core";

interface MarketState extends State {
    lastAction?: string;
    currentMarketId?: string;
    marketData?: {
        analysisText: string;
        content: {
            success: boolean;
            data: {
                marketId: string;
                analysis: {
                    question: string;
                    probability: number;
                    volume24h: number;
                    outcomes: string[];
                    prices: string[];
                    endDate: string;
                    lastUpdated: string;
                };
            };
        };
    };
}

export const showMarketData: Action = {
    name: "show_market_data",
    description: "Shows detailed market data for a previously analyzed market",
    similes: [
        "show me the data",
        "show the data",
        "show market data",
        "display data",
        "show numbers",
        "show stats",
        "show breakdown",
        "give me the data",
        "what are the numbers",
        "what's the data",
        "what are the stats",
        "numbers",
        "data",
        "stats"
    ],
    examples: [[
        {
            user: "user",
            content: {
                text: "show me the numbers"
            }
        },
        {
            user: "assistant",
            content: {
                text: "Here's the market data...",
                data: {
                    analysis: {
                        question: "Will X happen?",
                        probability: 65.5,
                        volume24h: 10000,
                        outcomes: ["Yes", "No"],
                        prices: ["0.655", "0.345"],
                        endDate: "2024-12-31",
                        lastUpdated: "2024-03-20"
                    }
                }
            }
        }
    ]],
    
    validate: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<boolean> => {
        const marketState = state as MarketState;
        const text = message.content.text.toLowerCase();
        
        // Simplified trigger check
        const hasTrigger = text.includes("numbers") || 
                          text.includes("data") || 
                          text.includes("stats");

        // Add more detailed logging
        elizaLogger.info("Validating show_market_data:", {
            text,
            hasTrigger,
            hasMarketData: !!marketState?.marketData,
            marketState: marketState ? JSON.stringify(marketState) : 'no state'
        });

        return hasTrigger && !!marketState?.marketData;
    },

    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        options?: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        const marketState = state as MarketState;
        
        if (!marketState?.marketData) {
            return {
                text: "I need you to analyze a market first before I can show you the numbers. Try 'analyze market <ID>' first.",
                content: { success: false }
            };
        }

        // Simplified, direct data display
        const market = marketState.marketData;
        return {
            text: `Raw Market Data:
Question: ${market.content.data.analysis.question}
Probability: ${market.content.data.analysis.probability.toFixed(1)}%
Volume (24h): $${market.content.data.analysis.volume24h.toLocaleString()}
Outcomes: ${market.content.data.analysis.outcomes.join(" vs ")}
Prices: ${market.content.data.analysis.prices.join(" vs ")}
Last Updated: ${new Date(market.content.data.analysis.lastUpdated).toLocaleString()}
End Date: ${new Date(market.content.data.analysis.endDate).toLocaleString()}`,
            content: { success: true, data: market.content.data }
        };
    }
}; 