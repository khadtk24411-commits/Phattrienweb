// Mẫu lỗi và giải pháp có sẵn
export const ISSUE_PATTERNS = {
    "man hinh vo": {
        issues: ["màn hình vỡ", "màn hình nứt", "vỡ màn hình", "màn hình bể"],
        solution: "Thay màn hình mới chính hãng",
        severity: "nặng"
    },
    "man hinh den": {
        issues: ["màn hình đen", "tối màn hình", "không sáng", "màn hình tối"],
        solution: "Kiểm tra và thay thế màn hình hoặc nguồn sáng",
        severity: "nặng"
    },
    "pin nhanh het": {
        issues: ["pin nhanh hết", "tụt pin nhanh", "pin chai", "sạc đầy nhanh hết"],
        solution: "Thay pin mới chính hãng",
        severity: "trung bình"
    },
    "khong sac": {
        issues: ["không sạc", "không vào điện", "sạc không lên", "cắm sạc không vào"],
        solution: "Kiểm tra và thay cổng sạc hoặc IC sạc",
        severity: "trung bình"
    },
    "loa roi": {
        issues: ["loa rè", "loa nhỏ", "không có tiếng", "mất tiếng", "loa hỏng"],
        solution: "Thay loa mới",
        severity: "nhẹ"
    },
    "mat nguon": {
        issues: ["không lên nguồn", "chết nguồn", "không bật", "tắt nguồn"],
        solution: "Kiểm tra và sửa chữa mainboard",
        severity: "nặng"
    },
    "nut nguon hong": {
        issues: ["nút nguơn hỏng", "nút nguồn không nhấn được", "kẹt nút nguồn"],
        solution: "Thay nút nguồn mới",
        severity: "nhẹ"
    },
    "mat camera": {
        issues: ["camera mờ", "camera không chụp", "hỏng camera", "mất camera"],
        solution: "Thay camera mới",
        severity: "trung bình"
    },
    "ban phim hong": {
        issues: ["bàn phím hỏng", "phím không nhấn", "kẹt phím", "bàn phím chết"],
        solution: "Vệ sinh hoặc thay bàn phím mới",
        severity: "trung bình"
    },
    "default": {
        issues: [],
        solution: "Kiểm tra tổng thể và báo giá chi tiết",
        severity: "chưa xác định"
    }
};

// Xác định loại thiết bị
export function getDeviceCategory(deviceName) {
    const name = deviceName.toLowerCase();
    if (name.includes("iphone")) return "iphone";
    if (name.includes("samsung")) return "samsung";
    if (name.includes("laptop") || name.includes("dell") || name.includes("hp") || name.includes("lenovo")) return "laptop";
    if (name.includes("tai nghe") || name.includes("airpod")) return "tai nghe";
    return "default";
}

// Tìm mẫu lỗi phù hợp
export function matchIssuePattern(errorDescription) {
    const error = errorDescription.toLowerCase();
    
    for (const [key, pattern] of Object.entries(ISSUE_PATTERNS)) {
        if (key === "default") continue;
        
        for (const keyword of pattern.issues) {
            if (error.includes(keyword)) {
                return {
                    key: key,
                    pattern: pattern
                };
            }
        }
    }
    
    return {
        key: "default",
        pattern: ISSUE_PATTERNS.default
    };
}