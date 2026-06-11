const express = require('express');
const path = require('path');
const { diagnoseDevice } = require('./modules/diagnosisEngine');
const { priceUsedProduct } = require('./modules/pricingEngine');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// API chẩn đoán
app.post('/api/evaluate', (req, res) => {
    const { deviceName, errorDescription, customerName, customerPhone } = req.body;
    
    console.log(`📱 Đang chẩn đoán: ${deviceName} - ${errorDescription}`);
    
    // Gọi engine chẩn đoán
    const result = diagnoseDevice(deviceName, errorDescription);
    
    // Thêm thông tin khách hàng
    result.customer_name = customerName;
    result.customer_phone = customerPhone;
    
    res.json({ success: true, data: result });
});

// API định giá
app.post('/api/price', (req, res) => {
    const { deviceModel, condition } = req.body;
    const result = priceUsedProduct(deviceModel, condition);
    res.json({ success: true, data: result });
});

// API test
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running!', time: new Date().toISOString() });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});