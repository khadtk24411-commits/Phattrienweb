import { PRICE_LIST } from "../data/priceData.js";
import { getDeviceCategory } from "../data/issuePatterns.js";

// Định giá sản phẩm cũ
export function priceUsedProduct(deviceModel, condition) {
    const category = getDeviceCategory(deviceModel);
    
    // Giá cơ bản dựa trên giá sửa
    let basePrice = 0;
    for (const [key, price] of Object.entries(PRICE_LIST)) {
        if (key.includes(category) && key !== "default") {
            basePrice = price * 5; // Giả sử giá mới gấp 5 lần giá sửa
            break;
        }
    }
    
    if (basePrice === 0) basePrice = 3000000;
    
    // Điều chỉnh theo tình trạng
    let multiplier = 1;
    switch (condition.toLowerCase()) {
        case "như mới":
            multiplier = 0.9;
            break;
        case "đẹp":
            multiplier = 0.8;
            break;
        case "trầy xước":
            multiplier = 0.7;
            break;
        case "hư hỏng nhẹ":
            multiplier = 0.5;
            break;
        case "hư hỏng nặng":
            multiplier = 0.3;
            break;
        default:
            multiplier = 0.7;
    }
    
    const estimatedPrice = Math.floor(basePrice * multiplier);
    
    return {
        estimated_price: estimatedPrice,
        price_range: {
            min: Math.floor(estimatedPrice * 0.8),
            max: Math.floor(estimatedPrice * 1.2)
        },
        condition_note: getConditionNote(condition),
        device_category: category
    };
}

function getConditionNote(condition) {
    const notes = {
        "như mới": "Thiết bị giống như mới, còn bảo hành",
        "đẹp": "Sử dụng nhẹ nhàng, ít xước",
        "trầy xước": "Có vết trầy nhẹ, hoạt động tốt",
        "hư hỏng nhẹ": "Hư nhẹ, cần sửa ít tiền",
        "hư hỏng nặng": "Hư nhiều, cần sửa nhiều"
    };
    return notes[condition] || "Tình trạng trung bình";
}

// Định giá thiết bị hỏng (thu mua)
export function priceBrokenDevice(deviceModel, repairCost) {
    // Giá thu mua thiết bị hỏng = giá bán lại sau sửa - chi phí sửa
    const sellPrice = repairCost * 5 * 0.6; // 60% giá trị
    return Math.floor(sellPrice - repairCost);
}