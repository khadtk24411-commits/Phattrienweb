import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { diagnoseDevice } from './modules/diagnosisEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/api/evaluate', async (req, res) => {
    const { deviceName, errorDescription, customerName, customerPhone } = req.body;
    
    console.log('\n🔧 ====== YÊU CẦU MỚI ======');
    console.log(`📱 Thiết bị: ${deviceName}`);
    console.log(`📝 Mô tả: ${errorDescription}`);
    
    try {
        const result = await diagnoseDevice(deviceName, errorDescription);
        
        // Thêm thông tin khách hàng
        result.customer_name = customerName || '';
        result.customer_phone = customerPhone || '';
        
        console.log('📤 Trả kết quả:', JSON.stringify(result, null, 2));
        
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('❌ Lỗi:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running!', time: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
