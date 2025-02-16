export interface Market {
    market_id: string;
    question: string;
    description: string;
    volume_24h: number;
    active: boolean;
    end_date: string;
    outcomes: string[];
    outcome_prices: string[];
    last_updated: string;
}

export interface MarketAnalysis {
    market: {
        id: string;
        question: string;
        description: string;
        outcomes: string[];
        prices: string[];
        volume: number;
        end_date: string;
    };
    analysis: {
        current_probability: number;
        trend: string;
        volume_analysis: string;
        key_factors: string[];
        confidence_score: number;
    };
    recommendation: {
        action: string;
        reasoning: string;
        risk_level: string;
    };
} 