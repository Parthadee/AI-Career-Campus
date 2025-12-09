import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, UserStage, RecommendationResponse, AtsAnalysis } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set it in the environment.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCareerPaths = async (profile: UserProfile): Promise<RecommendationResponse> => {
  const ai = getAiClient();

  const systemInstruction = `
    You are an expert career counselor and labor market analyst specializing in the Indian Job Market and Global Trends (2024-2025).
    Your goal is to provide highly personalized, data-driven career advice for students and job seekers from ALL backgrounds (Science, Commerce, Arts, Humanities, Vocational).
    
    The user is either:
    1. A student who just finished 12th grade (Post 12th). They need advice on Majors, Degrees, and long-term career paths.
    2. A Graduate/Job Seeker. They need advice on specific Job Roles, Upskilling, and immediate career pivoting.

    Context & Constraints:
    - Primary Market: India and Global.
    - Currency: ALWAYS use INR (₹) for salary ranges. If a role is international (e.g., remote US job), convert the salary estimate to INR. DO NOT use the '$' symbol.
    - Salaries: Be realistic for the Indian market context (e.g., Entry level B.Tech vs B.A.).
    - Diversity: Suggest paths relevant to their specific academic stream (e.g., if Arts, suggest Journalism, Design, Policy, etc., not just Tech).
  `;

  const userContext = `
    User Profile:
    - Name: ${profile.name}
    - Stage: ${profile.stage === UserStage.POST_12TH ? "Finished 12th Grade (High School)" : "Graduate / Job Seeker"}
    - Academic Background: ${profile.academicBackground}
    - Grades/Performance: ${profile.grades}
    - Interests: ${profile.interests.join(", ")}
    - Skills: ${profile.skills.join(", ")}
    - Work Environment Preference: ${profile.preferredWorkEnvironment || "Any"}
  `;

  const prompt = `
    Based on the profile below, analyze their potential and suggest 4 distinct career paths.
    
    1. "Safe/Traditional": A steady path with good job security in India.
    2. "Ambitious/High Growth": High paying, trending, competitive (e.g., AI, Fintech, Specialized Law).
    3. "Creative/Alternative": Non-traditional or passion-based.
    4. "Global/Remote Friendly": A path that allows working for international clients or migration.
    
    ${userContext}
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      analysis: {
        type: Type.STRING,
        description: "A brief, encouraging analysis of the user's profile and why these paths were chosen.",
      },
      careers: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING, description: "Job Title or Career Path Name" },
            matchScore: { type: Type.INTEGER, description: "Match percentage 0-100" },
            description: { type: Type.STRING, description: "Why this fits the user" },
            salaryRange: {
              type: Type.OBJECT,
              properties: {
                min: { type: Type.STRING },
                max: { type: Type.STRING },
                currency: { type: Type.STRING, description: "Currency symbol, MUST be '₹'" },
              },
              required: ["min", "max", "currency"],
            },
            marketDemand: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            growthTrend: { type: Type.STRING, description: "e.g., '+22% growth expected'" },
            requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            roadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  duration: { type: Type.STRING },
                },
              },
              description: "3-5 step execution plan",
            },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["id", "title", "matchScore", "description", "salaryRange", "marketDemand", "growthTrend", "requiredSkills", "roadmap", "pros", "cons"],
        },
      },
    },
    required: ["analysis", "careers"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as RecommendationResponse;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate recommendations. Please check your API key and try again.");
  }
};

export const generateResumeDraft = async (profile: UserProfile): Promise<string> => {
  const ai = getAiClient();

  const prompt = `
    Create a professional, ATS-friendly Resume/CV structure in Markdown format for the following user.
    Context: They are looking for opportunities in the Indian and Global market.
    
    Profile:
    - Name: ${profile.name}
    - Stage: ${profile.stage}
    - Academics: ${profile.academicBackground} (${profile.grades})
    - Skills: ${profile.skills.join(", ")}
    - Interests: ${profile.interests.join(", ")}
    
    Instructions:
    - Use standard ATS headings (Summary, Education, Skills, Projects/Experience).
    - Write a compelling Professional Summary.
    - If they are a student (Post 12th), focus on Education, key coursework, and extra-curriculars.
    - If they are a graduate, include placeholder sections for "Experience" with tips on what to write.
    - Format neatly with Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Could not generate resume.";
  } catch (error) {
    console.error("Resume Generation Error:", error);
    throw new Error("Failed to generate resume.");
  }
};

export const analyzeResumeATS = async (resumeText: string, country: string): Promise<AtsAnalysis> => {
  const ai = getAiClient();

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.INTEGER, description: "ATS Score 0-100" },
      summary: { type: Type.STRING, description: "Short summary of the audit" },
      missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      formattingIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
      suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
      countrySpecificAdvice: { type: Type.STRING, description: "Advice specific to the selected country's norms" },
    },
    required: ["score", "summary", "missingKeywords", "formattingIssues", "suggestions", "countrySpecificAdvice"],
  };

  const prompt = `
    Act as an advanced Application Tracking System (ATS) and Recruiter for ${country}.
    Analyze the following resume text.
    
    Criteria:
    - Keyword density and relevance (General professional standards).
    - Formatting and Readability (Structure).
    - Impact verbs and quantification.
    - Specific norms for ${country} (e.g., Photo usage, personal details, length).
    
    Resume Text:
    "${resumeText.slice(0, 5000)}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AtsAnalysis;
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("ATS Analysis Error:", error);
    throw new Error("Failed to analyze resume.");
  }
};