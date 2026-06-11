// Mẫu lỗi và giải pháp có sẵn (mở rộng)
export const ISSUE_PATTERNS = {
    // Lỗi màn hình
    "man hinh vo": {
        issues: ["màn hình vỡ", "màn hình nứt", "vỡ màn hình", "màn hình bể", "bể màn hình", "nứt màn hình", "vỡ kính"],
        solution: "Thay màn hình mới chính hãng, kiểm tra cảm ứng",
        severity: "nặng"
    },
    "man hinh den": {
        issues: ["màn hình đen", "tối màn hình", "không sáng", "màn hình tối", "mất hình"],
        solution: "Kiểm tra và thay thế màn hình hoặc nguồn sáng",
        severity: "nặng"
    },
    "man hinh cam ung loi": {
        issues: ["cảm ứng loạn", "cảm ứng chậm", "chạm không chuẩn", "cảm ứng không nhạy"],
        solution: "Vệ sinh hoặc thay mặt kính cảm ứng",
        severity: "trung bình"
    },
    
    // Lỗi pin
    "pin nhanh het": {
        issues: ["pin nhanh hết", "tụt pin nhanh", "pin chai", "sạc đầy nhanh hết", "pin yếu"],
        solution: "Thay pin mới chính hãng, dung lượng cao",
        severity: "trung bình"
    },
    "khong sac": {
        issues: ["không sạc", "không vào điện", "sạc không lên", "cắm sạc không vào", "không nhận sạc"],
        solution: "Kiểm tra và thay cổng sạc hoặc IC sạc",
        severity: "trung bình"
    },
    
    // Lỗi âm thanh
    "loa roi": {
        issues: ["loa rè", "loa nhỏ", "không có tiếng", "mất tiếng", "loa hỏng", "âm thanh rè"],
        solution: "Thay loa mới hoặc vệ sinh loa",
        severity: "nhẹ"
    },
    
    // Lỗi nguồn
    "mat nguon": {
        issues: ["không lên nguồn", "chết nguồn", "không bật", "tắt nguồn", "không khởi động"],
        solution: "Kiểm tra và sửa chữa mainboard",
        severity: "nặng"
    },
    
    // Lỗi camera
    "mat camera": {
        issues: ["camera mờ", "camera không chụp", "hỏng camera", "mất camera", "camera bị mờ"],
        solution: "Thay camera mới hoặc vệ sinh camera",
        severity: "trung bình"
    },
    
    // Lỗi thân máy
    "vo canh": {
        issues: ["xước thân máy", "trầy xước", "xước mặt lưng", "trầy nhẹ", "trầy cạnh"],
        solution: "Đánh bóng hoặc thay vỏ mới nếu khách yêu cầu",
        severity: "nhẹ"
    },
    
    // Lỗi nút
    "nut hong": {
        issues: ["nút nguồn hỏng", "nút âm lượng hỏng", "kẹt nút", "nút không nhấn được"],
        solution: "Thay cụm nút mới",
        severity: "nhẹ"
    },
    
    // Mặc định
    "default": {
        issues: [],
        solution: "Kiểm tra tổng thể và báo giá chi tiết",
        severity: "chưa xác định"
    }
};

// Xác định loại thiết bị (mở rộng)
export function getDeviceCategory(deviceName) {
    const name = deviceName.toLowerCase();
    if (name.includes("iphone")) return "iphone";
    if (name.includes("samsung") || name.includes("galaxy")) return "samsung";
    if (name.includes("oppo") || name.includes("vivo") || name.includes("xiaomi")) return "xiaomi";
    if (name.includes("laptop") || name.includes("dell") || name.includes("hp") || name.includes("lenovo") || name.includes("asus") || name.includes("macbook")) return "laptop";
    if (name.includes("tai nghe") || name.includes("airpod") || name.includes("earphone")) return "tai nghe";
    if (name.includes("ipad") || name.includes("tablet")) return "tablet";
    return "default";
}

// Tìm mẫu lỗi phù hợp (nâng cao)
export function matchIssuePattern(errorDescription) {
    const error = errorDescription.toLowerCase();
    const matchedIssues = [];
    
    // Tìm tất cả lỗi phù hợp
    for (const [key, pattern] of Object.entries(ISSUE_PATTERNS)) {
        if (key === "default") continue;
        
        for (const keyword of pattern.issues) {
            if (error.includes(keyword)) {
                matchedIssues.push({
                    key: key,
                    pattern: pattern,
                    keyword: keyword
                });
                break; // Chỉ lấy 1 keyword mỗi pattern
            }
        }
    }
    
    // Nếu có nhiều lỗi, trả về lỗi đầu tiên và thêm note
    if (matchedIssues.length > 0) {
        const mainIssue = matchedIssues[0];
        const additionalIssues = matchedIssues.slice(1);
        
        return {
            key: mainIssue.key,
            pattern: mainIssue.pattern,
            additional: additionalIssues.map(i => i.key),
            hasMultiple: additionalIssues.length > 0
        };
    }
    
    return {
        key: "default",
        pattern: ISSUE_PATTERNS.default,
        additional: [],
        hasMultiple: false
    };
}
