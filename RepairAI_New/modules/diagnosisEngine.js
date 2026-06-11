import { PRICE_LIST, REPAIR_TIME, WARRANTY } from "../data/priceData.js";
import { CENTER_INFO, RESELL_PERCENT } from "../data/centerData.js";
import { getDeviceCategory, matchIssuePattern, ISSUE_PATTERNS } from "../data/issuePatterns.js";

// Hàm chính: Chẩn đoán và đề xuất
export function diagnoseDevice(deviceName, errorDescription) {
    // Xác định loại thiết bị
    const category = getDeviceCategory(deviceName);
    
    // Tìm mẫu lỗi phù hợp
    const matchedIssue = matchIssuePattern(errorDescription);
    
    // Tính giá sửa
    let repairCost = getRepairPrice(category, matchedIssue.key, errorDescription);
    
    // Xác định có sửa được không
    const canRepair = checkRepairability(deviceName, matchedIssue.key);
    
    // Giải pháp sửa chữa
    const repairSolution = getRepairSolution(matchedIssue.key, deviceName);
    
    // Thời gian sửa
    const repairTimeDays = REPAIR_TIME[category] || REPAIR_TIME.default;
    
    // Bảo hành
    const warrantyMonths = WARRANTY[category] || WARRANTY.default;
    
    // Giá bán lại sau sửa
    const resellPrice = calculateResellPrice(deviceName, category, repairCost);
    
    // Đánh giá mức độ nghiêm trọng
    const severity = matchedIssue.pattern.severity;
    
    // Kết quả trả về
    const result = {
        device_model: deviceName,
        device_category: category,
        detected_issues: extractIssues(errorDescription, matchedIssue.key),
        severity: severity,
        can_repair: canRepair,
        repair_solution: repairSolution,
        repair_cost: repairCost,
        repair_time_days: repairTimeDays,
        warranty_months: warrantyMonths,
        resell_price_after_repair: resellPrice,
        center_info: CENTER_INFO,
        recommendation: getRecommendation(canRepair, severity, repairCost)
    };
    
    // Nếu không sửa được
    if (!canRepair) {
        result.if_cannot_repair = {
            reason: "Thiết bị hư hỏng nặng, phụ tùng không còn sản xuất",
            ewaste_solution: "Thu gom và tái chế rác điện tử theo quy định",
            recycle_value: Math.floor(repairCost * 0.2)
        };
    }
    
    return result;
}

// Lấy giá sửa chữa
function getRepairPrice(category, issueKey, errorDescription) {
    // Tìm giá chính xác
    let key = `${category}:${issueKey}`;
    if (PRICE_LIST[key]) {
        return PRICE_LIST[key];
    }
    
    // Tìm theo từ khóa trong mô tả lỗi
    const error = errorDescription.toLowerCase();
    for (const [patternKey, price] of Object.entries(PRICE_LIST)) {
        const [patternCategory, patternIssue] = patternKey.split(":");
        if (patternCategory === category && error.includes(patternIssue)) {
            return price;
        }
    }
    
    // Giá mặc định
    return PRICE_LIST.default;
}

// Kiểm tra khả năng sửa chữa
function checkRepairability(deviceName, issueKey) {
    // Các trường hợp không thể sửa
    const notRepairable = ["chay main", "ngam nuoc nang", "chip xu ly hong"];
    
    for (const keyword of notRepairable) {
        if (deviceName.toLowerCase().includes(keyword)) {
            return false;
        }
    }
    
    return true;
}

// Lấy giải pháp sửa chữa
function getRepairSolution(issueKey, deviceName) {
    const pattern = ISSUE_PATTERNS[issueKey];
    if (pattern) {
        return pattern.solution;
    }
    return "Kiểm tra và tư vấn chi tiết sau khi nhận máy";
}

// Tính giá bán lại
function calculateResellPrice(deviceName, category, repairCost) {
    // Giả sử giá thiết bị mới ~ repairCost * 5
    const newDevicePrice = repairCost * 5;
    const percent = RESELL_PERCENT[category] || RESELL_PERCENT.default;
    return Math.floor(newDevicePrice * percent);
}

// Trích xuất các lỗi từ mô tả
function extractIssues(errorDescription, matchedKey) {
    const issues = [];
    
    // Thêm lỗi chính
    if (matchedKey !== "default") {
        issues.push(ISSUE_PATTERNS[matchedKey].issues[0]);
    }
    
    // Tìm thêm lỗi khác trong mô tả
    const error = errorDescription.toLowerCase();
    for (const [key, pattern] of Object.entries(ISSUE_PATTERNS)) {
        if (key !== matchedKey && key !== "default") {
            for (const keyword of pattern.issues) {
                if (error.includes(keyword) && !issues.includes(keyword)) {
                    issues.push(keyword);
                    break;
                }
            }
        }
    }
    
    if (issues.length === 0) {
        issues.push("Lỗi không xác định, cần kiểm tra thực tế");
    }
    
    return issues;
}

// Đưa ra khuyến nghị
function getRecommendation(canRepair, severity, repairCost) {
    if (!canRepair) {
        return "❌ Không thể sửa chữa, nên tái chế";
    }
    
    if (severity === "nặng") {
        if (repairCost > 1000000) {
            return "⚠️ Chi phí sửa cao, cân nhắc mua máy mới";
        }
        return "🔧 Cần sửa ngay để tránh hư hỏng nặng hơn";
    }
    
    if (severity === "trung bình") {
        return "✅ Có thể sửa, nên sửa sớm để đảm bảo hoạt động tốt";
    }
    
    return "✅ Sửa nhẹ, có thể sửa ngay hoặc sử dụng thêm";
}