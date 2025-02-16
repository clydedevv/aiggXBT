import { Action, elizaLogger, IAgentRuntime, Memory, State, HandlerCallback, Content } from "@elizaos/core";

interface MarketState extends State {
    lastAction?: string;
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
    description: "Display raw market data and statistics",
    similes: [
        "show the numbers",
        "give me the data",
        "what are the numbers",
        "show me the stats",
        "display market data",
        "raw data",
        "show me the data",
        "show data",
        "data for",
        "numbers for",
        "break down the numbers",
        "break down the exact numbers",
        "exact numbers"
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
        const marketState = state as MarketState;  // Type assertion if needed
        const text = message.content.text.toLowerCase();
        const hasDataRequest = text.includes("numbers") || 
                             text.includes("data") || 
                             text.includes("stats") ||
                             text.includes("break down");
        
        elizaLogger.info("Validating show_market_data request:", {
            text,
            hasDataRequest,
            lastAction: marketState?.lastAction,
            hasMarketData: !!marketState?.marketData
        });

        return hasDataRequest && marketState?.lastAction === "analyze_market" && !!marketState?.marketData;
    },

    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,  // Note: using State instead of MarketState
        options?: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        const marketState = state as MarketState;  // Type assertion if needed
        
        if (!marketState?.marketData) {
            return {
                text: "Ay, I need you to analyze a market first before I can show you the numbers. Try 'analyze market <ID>' first.",
                content: { success: false }
            };
        }

        const market = marketState.marketData;
        return {
            text: `Market #${marketState.currentMarketId} Raw Data:

Question: ${market.content.data.analysis.question}

Current Prices:
- ${market.content.data.analysis.outcomes[0]}: ${market.content.data.analysis.probability.toFixed(1)}%
- ${market.content.data.analysis.outcomes[1]}: ${(100 - market.content.data.analysis.probability).toFixed(1)}%

24h Volume: $${market.content.data.analysis.volume24h.toLocaleString()}
Last Updated: ${new Date(market.content.data.analysis.lastUpdated).toLocaleString()}
End Date: ${new Date(market.content.data.analysis.endDate).toLocaleString()}`,
            content: { success: true, data: market.content.data }
        };
    }
}; 