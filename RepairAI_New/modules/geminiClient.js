// Module này gọi Gemini API khi cần (nếu có API key)
// Hiện tại có thể bỏ qua, dùng engine nội bộ

import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;
let model = null;

export function initGemini(apiKey) {
    if (apiKey && apiKey !== "your_api_key_here") {
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        return true;
    }
    return false;
}

export async function enhanceWithAI(deviceName, errorDescription, localResult) {
    if (!model) return localResult;
    
    try {
        const prompt = `Hãy phân tích thêm về lỗi này: ${deviceName} - ${errorDescription}. Chỉ cần bổ sung gợi ý ngắn gọn trong 1-2 câu.`;
        
        const result = await model.generateContent(prompt);
        const aiSuggestion = result.response.text();
        
        return {
            ...localResult,
            ai_suggestion: aiSuggestion
        };
    } catch (error) {
        console.error("Gemini error:", error);
        return localResult;
    }
}