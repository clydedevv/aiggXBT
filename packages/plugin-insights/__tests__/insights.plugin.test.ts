import { describe, it, expect, vi } from "vitest";
import { insightsPlugin } from "../src/index";
import { InsightsService } from "../src/services/InsightsService";

vi.mock('../src/services/InsightsService', () => ({
    InsightsService: {
        getInstance: vi.fn(() => ({
            getInsights: vi.fn().mockResolvedValue({
                analysis: "Test analysis",
                sources: ["source1", "source2"]
            })
        }))
    }
}));

describe("InsightsPlugin", () => {
    it("should have the correct name and description", () => {
        expect(insightsPlugin.name).toBe("insights");
        expect(insightsPlugin.description).toContain("AI-powered insights");
    });

    it("should have the getInsights action", () => {
        expect(insightsPlugin.actions).toHaveLength(1);
        expect(insightsPlugin.actions[0].name).toBe("GET_INSIGHTS");
    });
}); 