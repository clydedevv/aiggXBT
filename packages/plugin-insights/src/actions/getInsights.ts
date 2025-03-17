import type {
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    Action,
} from "@elizaos/core";
import { InsightsService } from "../services/InsightsService";

/**
 * Action to get insights and analysis on a specific topic.
 *
 * @param runtime - The agent runtime.
 * @param message - The user message containing the topic to analyze.
 * @param _state - The current agent state (not used in this action).
 * @param options - Action options, including max_loops for deeper analysis.
 * @param callback - Callback function to send the analysis response.
 * @returns A promise that resolves to true if the action was successful, false otherwise.
 */
export const getInsights: Action = {
    name: "GET_INSIGHTS",
    similes: [
        "ANALYZE_TOPIC",
        "GET_ANALYSIS",
        "RESEARCH_TOPIC",
        "INVESTIGATE_ISSUE",
        "EXPLORE_SUBJECT",
        "PROVIDE_INSIGHTS",
        "GATHER_INFORMATION",
        "LOOK_INTO_THIS",
        "DELVE_DEEPER",
        "STUDY_MATTER",
    ],
    validate: async (_runtime: IAgentRuntime, message: Memory) => {
        return !!message.content?.text;
    },
    description: "Get insights and analysis on a specific topic. Useful for understanding complex issues or getting up-to-date information on current events.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        _state: State,
        options: { [key: string]: unknown },
        callback: HandlerCallback
    ): Promise<boolean> => {
        const service = InsightsService.getInstance();

        // Get max_loops from options or default to 1
        const maxLoops = (options.max_loops as number) || 1;

        try {
            const result = await service.getInsights(message.content.text, maxLoops);

            // Format the response with both analysis and sources
            const formattedResponse = `
Analysis: ${result.analysis}

Sources:
${result.sources.map(source => `- ${source}`).join('\n')}
            `.trim();

            callback({
                text: formattedResponse,
            });

            return true;
        } catch (error) {
            callback({
                text: `Failed to get insights: ${error.message}`,
            });
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "What are the trends in AI development?" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Let me analyze that topic for you",
                    action: "GET_INSIGHTS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Can you analyze the crypto market?" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll get some insights on that",
                    action: "GET_INSIGHTS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Will Trump meet Putin in his first 100 days of office?" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Let me investigate the likelihood of that meeting.",
                    action: "GET_INSIGHTS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "What's the latest on the Epstein client list?" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I can analyze the information available on that.",
                    action: "GET_INSIGHTS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "What's happening with the economy right now?" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll get you some insights on the current economic situation.",
                    action: "GET_INSIGHTS",
                },
            },
        ],
    ] as ActionExample[][],
};