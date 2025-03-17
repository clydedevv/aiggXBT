import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getInsights } from '../../src/actions/getInsights';
import { InsightsService } from '../../src/services/InsightsService';

vi.mock('../../src/services/InsightsService', () => ({
    InsightsService: {
        getInstance: vi.fn(() => ({
            getInsights: vi.fn().mockResolvedValue({
                analysis: "Sample analysis",
                sources: ["source1", "source2"]
            })
        }))
    }
}));

describe('getInsights Action', () => {
    const mockRuntime = {
        getSetting: vi.fn(),
        getState: vi.fn(),
        setState: vi.fn(),
    };

    const mockMessage = {
        content: {
            text: 'Analyze AI trends',
            type: 'GET_INSIGHTS'
        }
    };

    const mockState = {};
    const mockCallback = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('validate', () => {
        it('should validate successfully with text content', async () => {
            const result = await getInsights.validate(mockRuntime, mockMessage);
            expect(result).toBe(true);
        });

        it('should fail validation without text content', async () => {
            const result = await getInsights.validate(mockRuntime, { content: {} });
            expect(result).toBe(false);
        });
    });

    describe('handler', () => {
        it('should get insights and call callback with formatted response', async () => {
            const result = await getInsights.handler(
                mockRuntime,
                mockMessage,
                mockState,
                { max_loops: 1 },
                mockCallback
            );

            expect(InsightsService.getInstance).toHaveBeenCalled();
            expect(mockCallback).toHaveBeenCalledWith({
                text: expect.stringContaining("Sample analysis")
            });
            expect(result).toBe(true);
        });
    });
}); 