
import { GoogleGenAI, Type } from "@google/genai";
import { Competitor, SeoAnalysisResults } from "../types";

const API_KEY = process.env.API_KEY || "";

export const geminiService = {
  async discoverCompetitors(url: string): Promise<Competitor[]> {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Identify the top 3 direct organic search competitors for the website: ${url}. Return their names and primary URLs.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              url: { type: Type.STRING }
            },
            required: ["name", "url"]
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || "[]");
    } catch (e) {
      console.error("Failed to parse competitors", e);
      return [];
    }
  },

  async performDeepAudit(brandUrl: string, competitors: Competitor[]): Promise<SeoAnalysisResults> {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const competitorUrls = competitors.map(c => c.url).join(", ");
    
    const prompt = `
      Act as a Senior SEO Strategist. Perform a deep comparative analysis between the brand site "${brandUrl}" and its competitors: ${competitorUrls}.
      
      Tasks:
      1. Calculate Market Alignment Score (0-100) for each: Semantic overlap with ${brandUrl}.
      2. Calculate SEO Authority Power (0-100) for each: Composite of simulated DA, backlinks, and tech health.
      3. Identify Content Gaps: Topics competitors cover that the brand doesn't.
      4. Generate 10-15 high-value Keyword Suggestions. Filter: only suggest keywords where Keyword Difficulty (KD) is lower than the brand's Authority Power. 
      5. Rank keywords by "Likelihood to Rank" (The Sweet Spot where Vol is high but KD is manageable).
      6. Provide 3 technical quick-wins for ${brandUrl}.
      7. Provide Content Briefs (H1, 3 H2s) for the top 3 gap keywords.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            metrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  url: { type: Type.STRING },
                  name: { type: Type.STRING },
                  marketAlignment: { type: Type.NUMBER },
                  seoAuthority: { type: Type.NUMBER },
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["url", "name", "marketAlignment", "seoAuthority"]
              }
            },
            contentGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywordSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  difficulty: { type: Type.NUMBER },
                  volume: { type: Type.STRING },
                  likelihoodToRank: { type: Type.NUMBER },
                  relevance: { type: Type.STRING }
                },
                required: ["keyword", "difficulty", "volume", "likelihoodToRank"]
              }
            },
            technicalWins: { type: Type.ARRAY, items: { type: Type.STRING } },
            contentBriefs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  h1: { type: Type.STRING },
                  h2s: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          },
          required: ["metrics", "contentGaps", "keywordSuggestions", "technicalWins", "contentBriefs"]
        }
      }
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Analysis data parse error", e);
      throw new Error("Failed to process SEO data.");
    }
  }
};
