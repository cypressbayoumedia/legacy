export interface Match {
    id: string;
    similarity: number;
    userId: string;
    aiProfile: {
        generatedBio: string;
        keyTraits: string[];
        communicationStyle: string;
    };
    profilePictureUrl?: string;
    compatibilityScore: number;
    _distance?: number;
}

export interface MatchResponse {
    matches: Match[];
}
