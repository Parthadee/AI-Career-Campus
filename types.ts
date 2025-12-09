export enum UserStage {
  POST_12TH = 'POST_12TH',
  GRADUATE = 'GRADUATE',
}

export interface UserProfile {
  name: string;
  stage: UserStage;
  academicBackground: string; // e.g., "PCM", "Commerce", "B.Tech in CS"
  grades: string; // e.g., "85%", "3.5 GPA"
  interests: string[];
  skills: string[];
  preferredWorkEnvironment?: string; // Remote, Hybrid, On-site
}

export interface RoadmapStep {
  title: string;
  description: string;
  duration: string;
}

export interface CareerOption {
  id: string;
  title: string;
  matchScore: number; // 0-100
  description: string;
  salaryRange: {
    min: string;
    max: string;
    currency: string;
  };
  marketDemand: 'High' | 'Medium' | 'Low';
  growthTrend: string; // e.g., "+15% YoY"
  requiredSkills: string[];
  roadmap: RoadmapStep[];
  pros: string[];
  cons: string[];
}

export interface RecommendationResponse {
  analysis: string;
  careers: CareerOption[];
}

export interface AtsAnalysis {
  score: number;
  summary: string;
  missingKeywords: string[];
  formattingIssues: string[];
  suggestions: string[];
  countrySpecificAdvice: string;
}