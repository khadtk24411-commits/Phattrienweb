// Import dữ liệu
import { PRICE_LIST, REPAIR_TIME, WARRANTY } from "../data/priceData.js";
import { CENTER_INFO, RESELL_PERCENT } from "../data/centerData.js";
import { getDeviceCategory, matchIssuePattern, ISSUE_PATTERNS } from "../data/issuePatterns.js";
import { analyzeWithAI } from "./geminiClient.js";

// Hàm chính: Chẩn đoán và đề xuất (bắt buộc phải async để gọi AI)
export async function diagnoseDevice(deviceName, errorDescription) {
    console.log(`\n🔧 Đang chẩn đoán: ${deviceName}`);
    console.log(`📝 Mô tả lỗi: ${errorDescription}`);
    
    // Xác định loại thiết bị
    const category = getDeviceCategory(deviceName);
    console.log(`📱 Loại thiết bị: ${category}`);
    
    // Gọi AI để phân tích
    console.log('🤖 Đang gọi Gemini AI phân tích...');
    const aiResult = await analyzeWithAI(deviceName, errorDescription);
    
    let result;
    
    if (aiResult && aiResult.device_model) {
        // Dùng kết quả từ AI
        console.log('✅ Dùng kết quả từ AI');
        
        let repairCost = aiResult.repair_cost_estimate || 500000;
        
        // Kiểm tra trong bảng giá
        const error = errorDescription.toLowerCase();
        for (const [patternKey, price] of Object.entries(PRICE_LIST)) {
            const [patternCategory, patternIssue] = patternKey.split(":");
            if (patternCategory === category && error.includes(patternIssue)) {
                repairCost = price;
                break;
            }
        }
        
        // Xử lý đặc biệt cho bể màn hình
        if (error.includes("bể màn hình") || error.includes("vỡ màn hình")) {
            if (category === "iphone") repairCost = 1200000;
            else if (category === "samsung") repairCost = 1100000;
            else repairCost = 1000000;
        }
        
        result = {
            device_model: aiResult.device_model || deviceName,
            device_category: category,
            detected_issues: aiResult.detected_issues || ["Đang phân tích..."],
            severity: aiResult.severity || "trung bình",
            can_repair: aiResult.can_repair !== false,
            repair_solution: aiResult.repair_solution || "Kiểm tra thực tế",
            repair_cost: repairCost,
            repair_time_days: aiResult.repair_time_days || REPAIR_TIME[category] || 2,
            warranty_months: WARRANTY[category] || 6,
            resell_price_after_repair: Math.floor(repairCost * 5 * 0.6),
            center_info: CENTER_INFO,
            recommendation: aiResult.recommendation || "Mang máy đến trung tâm để được kiểm tra miễn phí",
            ai_used: true
        };
    } else {
        // Fallback: dùng logic thủ công khi AI lỗi
        console.log('⚠️ Dùng logic thủ công (AI không khả dụng)');
        
        let repairCost = 500000;
        const error = errorDescription.toLowerCase();
        
        // Xử lý bể màn hình
        if (error.includes("bể màn hình") || error.includes("vỡ màn hình")) {
            if (category === "iphone") repairCost = 1200000;
            else if (category === "samsung") repairCost = 1100000;
            else repairCost = 1000000;
        }
        // Xử lý pin
        else if (error.includes("pin") && (error.includes("yếu") || error.includes("nhanh hết"))) {
            repairCost = 450000;
        }
        
        const issues = [];
        if (error.includes("bể màn hình") || error.includes("vỡ màn hình")) issues.push("Màn hình bị bể/vỡ");
        if (error.includes("trầy") || error.includes("xước")) issues.push("Vỏ máy trầy xước");
        if (error.includes("pin") && (error.includes("75") || error.includes("%"))) {
            issues.push("Pin còn 75% (có thể cần thay nếu tụt nhanh)");
        }
        if (issues.length === 0) issues.push("Cần kiểm tra thực tế");
        
        result = {
            device_model: deviceName,
            device_category: category,
            detected_issues: issues,
            severity: "trung bình",
            can_repair: true,
            repair_solution: issues.length > 1 ? "Thay màn hình mới, vệ sinh máy, kiểm tra pin" : "Thay màn hình mới, vệ sinh máy",
            repair_cost: repairCost,
            repair_time_days: REPAIR_TIME[category] || 2,
            warranty_months: WARRANTY[category] || 6,
            resell_price_after_repair: Math.floor(repairCost * 5 * 0.6),
            center_info: CENTER_INFO,
            recommendation: "Mang máy đến trung tâm để được kiểm tra miễn phí và báo giá chính xác",
            ai_used: false
        };
    }
    
    console.log(`💰 Giá sửa: ${result.repair_cost.toLocaleString('vi-VN')}đ`);
    console.log(`🤖 Sử dụng AI: ${result.ai_used ? 'CÓ' : 'KHÔNG'}`);
    
    return result;
}
