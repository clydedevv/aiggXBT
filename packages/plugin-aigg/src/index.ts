import { Plugin } from "@elizaos/core";
import { analyzeMarket } from "./actions/analyzeMarket";

export const aiggPlugin: Plugin = {
    name: "plugin-aigg",
    description: "AIGG Insights API integration for market analysis", 
    actions: [analyzeMarket],
    evaluators: []
};

export default aiggPlugin;