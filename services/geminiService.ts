import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeDashboardData = async (dataSummary: string): Promise<string> => {
  try {
    const model = 'gemini-3.5-flash';
    const prompt = `
      You are a senior marketing strategist and CRM expert at Hanwha Vision (한화비전), a leading global video surveillance and AI analytics supplier.
      Analyze the following Hanwha Vision CRM lead funnel summarized metrics:
      
      Context summary:
      ${dataSummary}
      
      Provide a highly professional executive summary in Korean (3 sentences max) with the following structure:
      1. Core Finding: Performance evaluation of the overall lead funnel status, conversion rate trends, and region/country dominance.
      2. Recommendation: Practical B2B sales recommendation (e.g., suggestions for optimizing MQL/SQL progression or product-centric bundling like Wave VMS + AI NVR).
      3. Focus Area: Specific alarm or guidance about dropped leads or price resistance in specific segments.
      
      Keep the tone formal, insightful, and strictly focused on enterprise B2B CCTV and CCTV security systems.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "분석 결과를 불러올 수 없습니다.";
  } catch (error) {
    console.error("Hanwha Vision Gemini analysis failed:", error);
    return "AI 분석을 로드하는 도중 오류가 발생했습니다. 설정된 Gemini API 키를 확인해주세요.";
  }
};

export const generateCreativeVisualDescription = async (dataSummary: string): Promise<string> => {
   try {
    const model = 'gemini-3.5-flash';
    const prompt = `
      Context: Hanwha Vision CRM high-value profiling dashboard visualization.
      Data Summary: ${dataSummary}
      
      Suggest a short, clean, professional dashboard design or widget enhancement idea for Hanwha Vision (under 30 words, in Korean).
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "AI CCTV 고품격 보안 관제 모니터링.";
  } catch (error) {
    return "스마트 공공 안전 통합 대시보드 인터페이스 제안.";
  }
};
