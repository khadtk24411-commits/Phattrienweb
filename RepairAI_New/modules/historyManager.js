// Lưu lịch sử vào localStorage
export function saveHistory(record) {
    let history = JSON.parse(localStorage.getItem('repair_history') || '[]');
    
    record.id = Date.now();
    record.date = new Date().toISOString();
    
    history.unshift(record);
    
    // Chỉ giữ 100 record gần nhất
    if (history.length > 100) history = history.slice(0, 100);
    
    localStorage.setItem('repair_history', JSON.stringify(history));
    return record.id;
}

// Lấy lịch sử theo số điện thoại
export function getHistoryByPhone(phone) {
    const history = JSON.parse(localStorage.getItem('repair_history') || '[]');
    return history.filter(record => record.customer_phone === phone);
}

// Lấy lịch sử theo thiết bị
export function getHistoryByDevice(deviceName) {
    const history = JSON.parse(localStorage.getItem('repair_history') || '[]');
    return history.filter(record => record.device_name?.toLowerCase().includes(deviceName.toLowerCase()));
}

// Xóa lịch sử
export function clearHistory() {
    localStorage.removeItem('repair_history');
}

// Thống kê
export function getStatistics() {
    const history = JSON.parse(localStorage.getItem('repair_history') || '[]');
    
    const repairableCount = history.filter(r => r.can_repair === true).length;
    const totalRepairCost = history.reduce((sum, r) => sum + (r.repair_cost || 0), 0);
    
    return {
        total: history.length,
        repairable: repairableCount,
        notRepairable: history.length - repairableCount,
        avgRepairCost: history.length > 0 ? Math.floor(totalRepairCost / history.length) : 0,
        last30Days: history.filter(r => {
            const date = new Date(r.date);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return date >= thirtyDaysAgo;
        }).length
    };
}