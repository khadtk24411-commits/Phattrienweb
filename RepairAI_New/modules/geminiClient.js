import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

let genAI = null;
let model = null;

/**
 * Khởi tạo Gemini
 */
export function initGemini() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        console.log('🔑 Kiểm tra API Key...');

        if (!apiKey) {
            console.error('❌ GEMINI_API_KEY không tồn tại');
            return false;
        }

        if (apiKey.length < 20) {
            console.error('❌ API Key không hợp lệ');
            return false;
        }

        genAI = new GoogleGenerativeAI(apiKey);

        // QUAN TRỌNG: gán vào biến global
        model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-lite',
            generationConfig: {
                temperature: 0.4,
                responseMimeType: 'application/json'
            }
        });

        console.log('✅ Gemini AI đã sẵn sàng');
        return true;

    } catch (error) {
        console.error('❌ Lỗi khởi tạo Gemini:', error);
        model = null;
        return false;
    }
}

/**
 * Phân tích lỗi bằng AI
 */
export async function analyzeWithAI(deviceName, errorDescription) {

    try {

        if (!model) {
            console.log('🔄 Khởi tạo Gemini...');

            const success = initGemini();

            if (!success || !model) {
                console.log('⚠️ Không thể khởi tạo Gemini');
                return null;
            }
        }

        const prompt = `
	Bạn là chuyên gia sửa chữa điện tử.

	Thiết bị: ${deviceName}

	Mô tả lỗi: ${errorDescription}

	Trả về JSON:
	
 	 "device_model": "",
 	 "detected_issues": [],
  	"severity": "",
  	"repair_solution": "",
  	"repair_cost_estimate": 0,
  	"repair_time_days": 0,
  	"can_repair": true,
  	"recommendation": ""
	}
	`;

        console.log('📤 Gửi request tới Gemini...');

        const result = await model.generateContent(prompt);

        const response = await result.response;

        const text = response.text();

        console.log('📥 Gemini response:');
        console.log(text);

        const data = JSON.parse(text);

        console.log('✅ Parse JSON thành công');

        return data;

    } catch (error) {

        console.error('❌ Gemini error:', error);

        return null;
    }
}

/**
 * Kiểm tra trạng thái Gemini
 */
export function isGeminiReady() {
    return model !== null;
}

/**
 * Khởi tạo khi load file
 */
initGemini();

console.log('✅ geminiClient.js đã load xong');
