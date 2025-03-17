import type { Plugin } from "@elizaos/core";
import { getInsights } from "./actions/getInsights";
export * as actions from "./actions";

export const insightsPlugin: Plugin = {
    name: "insights",
    description: "Plugin for getting AI-powered insights and analysis on topics",
    actions: [getInsights],
};

// Also export the class for direct usage
export class PluginInsights implements Plugin {
    name = "insights";
    description = "Plugin for getting AI-powered insights and analysis on topics";
    actions = [getInsights];
} 