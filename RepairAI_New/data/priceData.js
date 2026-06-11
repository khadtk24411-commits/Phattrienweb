// Bảng giá sửa chữa theo thiết bị và lỗi
export const PRICE_LIST = {
    // Điện thoại iPhone
    "iphone:man hinh vo": 1200000,
    "iphone:man hinh den": 1500000,
    "iphone:man hinh cam ung loi": 1300000,
    "iphone:pin nhanh het": 500000,
    "iphone:khong sac": 400000,
    "iphone:loa roi": 350000,
    "iphone:mat nguon": 800000,
    "iphone:mat camera": 600000,
    "iphone:nut nguon hong": 300000,
    "iphone:vo nhieu": 800000,
    
    // Điện thoại Samsung
    "samsung:man hinh vo": 1100000,
    "samsung:man hinh den": 1300000,
    "samsung:pin nhanh het": 450000,
    "samsung:khong sac": 400000,
    "samsung:loa roi": 300000,
    "samsung:mat nguon": 700000,
    
    // Laptop
    "laptop:man hinh vo": 1800000,
    "laptop:man hinh nhoa": 1500000,
    "laptop:ban phim hong": 400000,
    "laptop:pin nhanh het": 700000,
    "laptop:khong len nguon": 500000,
    "laptop:mat nguon": 600000,
    "laptop:loa roi": 350000,
    
    // Tai nghe
    "tai nghe:khong len nguon": 200000,
    "tai nghe:mat tieng trai": 150000,
    "tai nghe:loi ket noi": 100000,
    
    // Mặc định
    "default": 500000
};

// Thời gian sửa chữa (ngày)
export const REPAIR_TIME = {
    "iphone": 2,
    "samsung": 2,
    "laptop": 3,
    "tai nghe": 1,
    "default": 2
};

// Bảo hành (tháng)
export const WARRANTY = {
    "iphone": 6,
    "samsung": 6,
    "laptop": 3,
    "tai nghe": 3,
    "default": 6
};
