import type { Plugin } from "@elizaos/core";
import { analyzeMarket } from "./actions/analyzeMarket";
import { elizaLogger } from "@elizaos/core";

export const aiggPlugin: Plugin = {
    name: "aigg",
    description: "AIGG market analysis plugin for prediction markets",
    actions: [analyzeMarket]
};

// Add debug logging
elizaLogger.info("Registering AIGG plugin actions:", {
    actions: [analyzeMarket.name]
});

export default aiggPlugin;