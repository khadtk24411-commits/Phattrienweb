const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Serve static files
app.use(express.static(__dirname));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/dataset', express.static(path.join(__dirname, 'dataset')));
app.use('/images', express.static(path.join(__dirname, 'images')));

console.log('✅ Server starting...');
console.log(`📁 Current directory: ${__dirname}`);

// ==================== UTILITY FUNCTIONS ====================

const datasetDir = path.join(__dirname, 'datasets');

// Tạo thư mục dataset nếu chưa có
if (!fs.existsSync(datasetDir)) {
    console.log('📁 Creating dataset directory...');
    fs.mkdirSync(datasetDir, { recursive: true });
}

// Đọc file JSON
function readDataFile(filename) {
    try {
        const filePath = path.join(datasetDir, filename);
        console.log(`📖 Đang đọc: ${filename} từ ${filePath}`);
        
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️ Không tìm thấy file: ${filename}`);
            fs.writeFileSync(filePath, JSON.stringify([], null, 4));
            return [];
        }
        
        let data = fs.readFileSync(filePath, 'utf8');
        console.log(`📄 Dung lượng file: ${data.length} bytes`);
        console.log(`📄 10 ký tự đầu: ${JSON.stringify(data.substring(0, 10))}`);
        
        // Loại bỏ BOM (các cách khác nhau)
        // Cách 1: Xóa ký tự FEFF
        data = data.replace(/^\uFEFF/, '');
        
        // Cách 2: Xóa ký tự ﻿
        data = data.replace(/^\ufeff/, '');
        
        // Cách 3: Xóa tất cả ký tự không phải JSON ở đầu
        data = data.replace(/^[\s\ufeff]*/, '');
        
        console.log(`📄 Sau khi xử lý BOM: ${JSON.stringify(data.substring(0, 10))}`);
        
        const parsed = JSON.parse(data);
        console.log(`✅ Đã parse ${filename}: ${Array.isArray(parsed) ? parsed.length : 'object'} items`);
        return parsed;
    } catch (error) {
        console.error(`❌ Lỗi đọc ${filename}:`, error.message);
        console.error(`❌ Lỗi tại vị trí: ${error.message.match(/position (\d+)/)?.[1]}`);
        return [];
    }
}
// Ghi file JSON
function writeDataFile(filename, data) {
    try {
        const filePath = path.join(datasetDir, filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
        return true;
    } catch (error) {
        console.error(`❌ Error writing ${filename}:`, error.message);
        return false;
    }
}

// Tạo ID tự động
function generateID(prefix, data) {
    if (!data || data.length === 0) {
        return `${prefix}000001`;
    }
    const lastItem = data[data.length - 1];
    const keys = ['id', 'orderID', 'customerID', 'productID', 'repairOrderID', 'requestID', 'resellOrderID', 'recycleOrderID', 'cartID', 'paymentID', 'transactionID', 'reviewID', 'complaintID', 'chatID', 'messageID', 'notificationID', 'assessmentID'];
    let lastId = '';
    for (const key of keys) {
        if (lastItem[key]) {
            lastId = lastItem[key];
            break;
        }
    }
    const match = lastId.match(/\d+$/);
    const num = match ? parseInt(match[0]) : 0;
    return `${prefix}${String(num + 1).padStart(6, '0')}`;
}

// Hàm đếm sản phẩm đệ quy - XỬ LÝ ĐÚNG CẤU TRÚC LỒNG NHAU
function countProductsRecursive(items) {
    let count = 0;
    if (!items || !Array.isArray(items)) return count;
    
    for (const item of items) {
        // Nếu item có id -> là sản phẩm
        if (item.id) {
            count++;
        }
        // Nếu item có Products (chứa danh sách con) -> đệ quy
        if (item.Products && Array.isArray(item.Products)) {
            count += countProductsRecursive(item.Products);
        }
    }
    return count;
}

// Hàm lấy tất cả sản phẩm từ cấu trúc lồng nhau
function getAllProductsRecursive(items, categoryName = '') {
    const result = [];
    if (!items || !Array.isArray(items)) return result;
    
    for (const item of items) {
        if (item.id) {
            result.push({
                ...item,
                category: categoryName || item.category || 'Khác'
            });
        }
        if (item.Products && Array.isArray(item.Products)) {
            const subCategoryName = item.TypeName || item.CateName || categoryName;
            const subProducts = getAllProductsRecursive(item.Products, subCategoryName);
            result.push(...subProducts);
        }
    }
    return result;
}

// Cập nhật Green Coins cho khách hàng
function updateCustomerGreenCoins(customerId, coinsToAdd) {
    const users = readDataFile('users.json');
    let customers = [];
    for (const item of users) {
        if (item.customers) {
            customers = item.customers;
            break;
        }
    }
    const customer = customers.find(c => c.customerID === customerId);
    if (customer) {
        customer.greenCoins = (customer.greenCoins || 0) + coinsToAdd;
        for (let i = 0; i < users.length; i++) {
            if (users[i].customers) {
                users[i].customers = customers;
                break;
            }
        }
        return writeDataFile('users.json', users);
    }
    return false;
}

// ==================== API ROUTES ====================

console.log('📦 Setting up API routes...');

// ===== USERS =====
app.get('/api/users', (req, res) => {
    const users = readDataFile('users.json');
    res.json(users);
});

app.get('/api/users/customers', (req, res) => {
    const users = readDataFile('users.json');
    let customers = [];
    for (const item of users) {
        if (item.customers) {
            customers = item.customers;
            break;
        }
    }
    res.json(customers);
});

app.get('/api/users/customer/:id', (req, res) => {
    const users = readDataFile('users.json');
    let customers = [];
    for (const item of users) {
        if (item.customers) {
            customers = item.customers;
            break;
        }
    }
    const customer = customers.find(c => c.customerID === req.params.id);
    if (customer) {
        res.json(customer);
    } else {
        res.status(404).json({ error: 'Customer not found' });
    }
});

app.post('/api/users/customer', (req, res) => {
    const users = readDataFile('users.json');
    let customers = [];
    let userIndex = -1;
    for (let i = 0; i < users.length; i++) {
        if (users[i].customers) {
            customers = users[i].customers;
            userIndex = i;
            break;
        }
    }
    
    const newCustomer = {
        customerID: generateID('CM', customers),
        ...req.body,
        joinDate: req.body.joinDate || new Date().toISOString().split('T')[0],
        greenCoins: req.body.greenCoins || 0,
        isVerifiedVNU: req.body.isVerifiedVNU || false
    };
    customers.push(newCustomer);
    
    if (userIndex === -1) {
        users.push({ customers });
    } else {
        users[userIndex].customers = customers;
    }
    
    if (writeDataFile('users.json', users)) {
        res.status(201).json(newCustomer);
    } else {
        res.status(500).json({ error: 'Failed to save customer' });
    }
});

app.put('/api/users/customer/:id', (req, res) => {
    const users = readDataFile('users.json');
    let customers = [];
    let userIndex = -1;
    for (let i = 0; i < users.length; i++) {
        if (users[i].customers) {
            customers = users[i].customers;
            userIndex = i;
            break;
        }
    }
    
    const index = customers.findIndex(c => c.customerID === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Customer not found' });
    }
    
    customers[index] = { ...customers[index], ...req.body };
    users[userIndex].customers = customers;
    
    if (writeDataFile('users.json', users)) {
        res.json(customers[index]);
    } else {
        res.status(500).json({ error: 'Failed to update customer' });
    }
});

app.get('/api/users/repairstores', (req, res) => {
    const users = readDataFile('users.json');
    let stores = [];
    for (const item of users) {
        if (item.repairstores) {
            stores = item.repairstores;
            break;
        }
    }
    res.json(stores);
});

app.get('/api/users/repairstore/:id', (req, res) => {
    const users = readDataFile('users.json');
    let stores = [];
    for (const item of users) {
        if (item.repairstores) {
            stores = item.repairstores;
            break;
        }
    }
    const store = stores.find(s => s.storeID === req.params.id);
    if (store) {
        res.json(store);
    } else {
        res.status(404).json({ error: 'Store not found' });
    }
});

app.put('/api/users/repairstore/:id', (req, res) => {
    const users = readDataFile('users.json');
    let stores = [];
    let userIndex = -1;
    for (let i = 0; i < users.length; i++) {
        if (users[i].repairstores) {
            stores = users[i].repairstores;
            userIndex = i;
            break;
        }
    }
    
    const index = stores.findIndex(s => s.storeID === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Store not found' });
    }
    
    stores[index] = { ...stores[index], ...req.body };
    users[userIndex].repairstores = stores;
    
    if (writeDataFile('users.json', users)) {
        res.json(stores[index]);
    } else {
        res.status(500).json({ error: 'Failed to update store' });
    }
});

// ===== ADMINS =====
app.get('/api/admins', (req, res) => {
    const admins = readDataFile('admins.json');
    res.json(admins);
});

app.post('/api/admins/login', (req, res) => {
    const admins = readDataFile('admins.json');
    const { userName, passwords } = req.body;
    const admin = admins.find(a => a.userName === userName && a.passwords === passwords);
    if (admin) {
        res.json({ success: true, admin });
    } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
});

// ===== PRODUCTS =====
app.get('/api/products', (req, res) => {
    const products = readDataFile('products.json');
    res.json(products);
});

app.get('/api/products/all', (req, res) => {
    const products = readDataFile('products.json');
    const allProducts = [];
    for (const category of products) {
        const categoryName = category.CateName || 'Khác';
        const categoryProducts = getAllProductsRecursive(category.Products || [], categoryName);
        allProducts.push(...categoryProducts);
    }
    res.json(allProducts);
});

app.get('/api/products/:id', (req, res) => {
    const products = readDataFile('products.json');
    let found = null;
    for (const category of products) {
        for (const product of category.Products || []) {
            if (product.id === req.params.id) {
                found = { ...product, category: category.CateName };
                break;
            }
        }
        if (found) break;
        if (category.Products && Array.isArray(category.Products)) {
            for (const subCat of category.Products) {
                if (subCat.Products && Array.isArray(subCat.Products)) {
                    for (const product of subCat.Products) {
                        if (product.id === req.params.id) {
                            found = { ...product, category: subCat.TypeName || category.CateName };
                            break;
                        }
                    }
                }
                if (found) break;
            }
        }
    }
    if (found) {
        res.json(found);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

app.get('/api/products/category/:cateId', (req, res) => {
    const products = readDataFile('products.json');
    const category = products.find(c => c.CateID === req.params.cateId);
    if (category) {
        res.json(category);
    } else {
        res.status(404).json({ error: 'Category not found' });
    }
});

// ===== ORDERS =====
app.get('/api/orders', (req, res) => {
    const orders = readDataFile('orders.json');
    res.json(orders);
});

app.get('/api/orders/customer/:customerId', (req, res) => {
    const orders = readDataFile('orders.json');
    const customerOrders = orders.filter(o => o.customerID === req.params.customerId);
    res.json(customerOrders);
});

app.post('/api/orders', (req, res) => {
    const orders = readDataFile('orders.json');
    const newOrder = {
        orderID: generateID('OD', orders),
        ...req.body,
        orderDate: new Date().toISOString().split('T')[0],
        status: req.body.status || 'Pending'
    };
    orders.push(newOrder);
    if (writeDataFile('orders.json', orders)) {
        res.status(201).json(newOrder);
    } else {
        res.status(500).json({ error: 'Failed to save order' });
    }
});

app.put('/api/orders/:id/status', (req, res) => {
    const orders = readDataFile('orders.json');
    const index = orders.findIndex(o => o.orderID === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Order not found' });
    }
    orders[index].status = req.body.status;
    if (writeDataFile('orders.json', orders)) {
        res.json(orders[index]);
    } else {
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// ===== CART =====
app.get('/api/cart/:customerId', (req, res) => {
    const carts = readDataFile('cart.json');
    const cart = carts.find(c => c.customerID === req.params.customerId);
    res.json(cart || { cartID: null, customerID: req.params.customerId, products: [] });
});

app.post('/api/cart', (req, res) => {
    const carts = readDataFile('cart.json');
    const { customerID, products } = req.body;
    let cart = carts.find(c => c.customerID === customerID);
    
    if (cart) {
        cart.products = products || [];
    } else {
        cart = {
            cartID: generateID('CT', carts),
            customerID,
            products: products || []
        };
        carts.push(cart);
    }
    
    if (writeDataFile('cart.json', carts)) {
        res.json(cart);
    } else {
        res.status(500).json({ error: 'Failed to save cart' });
    }
});

// ===== PAYMENTS =====
app.get('/api/payments', (req, res) => {
    const payments = readDataFile('payments.json');
    res.json(payments);
});

app.post('/api/payments', (req, res) => {
    const payments = readDataFile('payments.json');
    const newPayment = {
        paymentID: generateID('PM', payments),
        ...req.body,
        status: req.body.status || 'Pending'
    };
    payments.push(newPayment);
    if (writeDataFile('payments.json', payments)) {
        res.status(201).json(newPayment);
    } else {
        res.status(500).json({ error: 'Failed to save payment' });
    }
});

// ===== GREEN COINS =====
app.get('/api/greencoins', (req, res) => {
    const coins = readDataFile('greenCoins.json');
    res.json(coins);
});

app.get('/api/greencoins/customer/:customerId', (req, res) => {
    const coins = readDataFile('greenCoins.json');
    const allOrders = readDataFile('orders.json');
    const repairOrders = readDataFile('repairOrders.json');
    const resellOrders = readDataFile('resellOrders.json');
    const recycleOrders = readDataFile('recycleOders.json');
    
    const orderIds = [
        ...allOrders.filter(o => o.customerID === req.params.customerId).map(o => o.orderID),
        ...repairOrders.filter(o => o.customerID === req.params.customerId).map(o => o.repairOrderID),
        ...resellOrders.filter(o => o.customerID === req.params.customerId).map(o => o.resellOrderID),
        ...recycleOrders.filter(o => o.customerID === req.params.customerId).map(o => o.recycleOrderID)
    ];
    
    const customerCoins = coins.filter(c => orderIds.includes(c.orderID));
    res.json(customerCoins);
});

app.post('/api/greencoins', (req, res) => {
    const coins = readDataFile('greenCoins.json');
    const newCoin = {
        transactionID: generateID('TS', coins),
        ...req.body,
        date: new Date().toISOString().split('T')[0]
    };
    coins.push(newCoin);
    
    if (req.body.customerID) {
        updateCustomerGreenCoins(req.body.customerID, req.body.greenCoins || 0);
    }
    
    if (writeDataFile('greenCoins.json', coins)) {
        res.status(201).json(newCoin);
    } else {
        res.status(500).json({ error: 'Failed to save transaction' });
    }
});

// ===== PROCESS REQUESTS =====
app.get('/api/processrequests', (req, res) => {
    const requests = readDataFile('processRequests.json');
    res.json(requests);
});

app.get('/api/processrequests/customer/:customerId', (req, res) => {
    const requests = readDataFile('processRequests.json');
    const customerRequests = requests.filter(r => r.customerID === req.params.customerId);
    res.json(customerRequests);
});

app.post('/api/processrequests', (req, res) => {
    const requests = readDataFile('processRequests.json');
    const newRequest = {
        requestID: generateID('RQ', requests),
        ...req.body,
        status: req.body.status || 'Pending'
    };
    requests.push(newRequest);
    if (writeDataFile('processRequests.json', requests)) {
        res.status(201).json(newRequest);
    } else {
        res.status(500).json({ error: 'Failed to save request' });
    }
});

app.put('/api/processrequests/:id/status', (req, res) => {
    const requests = readDataFile('processRequests.json');
    const index = requests.findIndex(r => r.requestID === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Request not found' });
    }
    requests[index].status = req.body.status;
    if (writeDataFile('processRequests.json', requests)) {
        res.json(requests[index]);
    } else {
        res.status(500).json({ error: 'Failed to update request' });
    }
});

// ===== AI ASSESSMENTS =====
app.get('/api/aiassessments', (req, res) => {
    const assessments = readDataFile('AI_assessments.json');
    res.json(assessments);
});

app.get('/api/aiassessments/request/:requestId', (req, res) => {
    const assessments = readDataFile('AI_assessments.json');
    const assessment = assessments.find(a => a.requestID === req.params.requestId);
    res.json(assessment || null);
});

app.post('/api/aiassessments', (req, res) => {
    const assessments = readDataFile('AI_assessments.json');
    const newAssessment = {
        assessmentID: generateID('AI', assessments),
        ...req.body
    };
    assessments.push(newAssessment);
    if (writeDataFile('AI_assessments.json', assessments)) {
        res.status(201).json(newAssessment);
    } else {
        res.status(500).json({ error: 'Failed to save assessment' });
    }
});

// ===== REPAIR ORDERS =====
app.get('/api/repairorders', (req, res) => {
    const orders = readDataFile('repairOrders.json');
    res.json(orders);
});

app.get('/api/repairorders/store/:storeId', (req, res) => {
    const orders = readDataFile('repairOrders.json');
    const storeOrders = orders.filter(o => o.storeID === req.params.storeId);
    res.json(storeOrders);
});

app.post('/api/repairorders', (req, res) => {
    const orders = readDataFile('repairOrders.json');
    const newOrder = {
        repairOrderID: generateID('RP', orders),
        ...req.body,
        orderDate: new Date().toISOString().split('T')[0],
        status: req.body.status || 'Pending'
    };
    orders.push(newOrder);
    if (writeDataFile('repairOrders.json', orders)) {
        res.status(201).json(newOrder);
    } else {
        res.status(500).json({ error: 'Failed to save repair order' });
    }
});

app.put('/api/repairorders/:id/status', (req, res) => {
    const orders = readDataFile('repairOrders.json');
    const index = orders.findIndex(o => o.repairOrderID === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Repair order not found' });
    }
    orders[index].status = req.body.status;
    if (writeDataFile('repairOrders.json', orders)) {
        res.json(orders[index]);
    } else {
        res.status(500).json({ error: 'Failed to update repair order' });
    }
});

// ===== RESELL ORDERS =====
app.get('/api/resellorders', (req, res) => {
    const orders = readDataFile('resellOrders.json');
    res.json(orders);
});

app.post('/api/resellorders', (req, res) => {
    const orders = readDataFile('resellOrders.json');
    const newOrder = {
        resellOrderID: generateID('RS', orders),
        ...req.body,
        orderDate: new Date().toISOString().split('T')[0],
        status: req.body.status || 'Pending'
    };
    orders.push(newOrder);
    if (writeDataFile('resellOrders.json', orders)) {
        res.status(201).json(newOrder);
    } else {
        res.status(500).json({ error: 'Failed to save resell order' });
    }
});

// ===== RECYCLE ORDERS =====
app.get('/api/recycleorders', (req, res) => {
    const orders = readDataFile('recycleOders.json');
    res.json(orders);
});

app.post('/api/recycleorders', (req, res) => {
    const orders = readDataFile('recycleOders.json');
    const newOrder = {
        recycleOrderID: generateID('RC', orders),
        ...req.body,
        orderDate: new Date().toISOString().split('T')[0],
        status: req.body.status || 'Pending'
    };
    orders.push(newOrder);
    if (writeDataFile('recycleOders.json', orders)) {
        res.status(201).json(newOrder);
    } else {
        res.status(500).json({ error: 'Failed to save recycle order' });
    }
});

// ===== REVIEWS =====
app.get('/api/reviews', (req, res) => {
    const reviews = readDataFile('reviews.json');
    res.json(reviews);
});

app.get('/api/reviews/product/:productId', (req, res) => {
    const reviews = readDataFile('reviews.json');
    const productReviews = reviews.filter(r => r.productID === req.params.productId);
    res.json(productReviews);
});

app.get('/api/reviews/customer/:customerId', (req, res) => {
    const reviews = readDataFile('reviews.json');
    const customerReviews = reviews.filter(r => r.buyerID === req.params.customerId);
    res.json(customerReviews);
});

app.post('/api/reviews', (req, res) => {
    const reviews = readDataFile('reviews.json');
    const newReview = {
        reviewID: generateID('RV', reviews),
        ...req.body,
        date: new Date().toISOString().split('T')[0]
    };
    reviews.push(newReview);
    if (writeDataFile('reviews.json', reviews)) {
        res.status(201).json(newReview);
    } else {
        res.status(500).json({ error: 'Failed to save review' });
    }
});

// ===== COMPLAINTS =====
app.get('/api/complaints', (req, res) => {
    const complaints = readDataFile('complaints.json');
    res.json(complaints);
});

app.get('/api/complaints/customer/:customerId', (req, res) => {
    const complaints = readDataFile('complaints.json');
    const customerComplaints = complaints.filter(c => c.customerID === req.params.customerId);
    res.json(customerComplaints);
});

app.post('/api/complaints', (req, res) => {
    const complaints = readDataFile('complaints.json');
    const newComplaint = {
        complaintID: generateID('CP', complaints),
        ...req.body,
        date: new Date().toISOString().split('T')[0],
        status: req.body.status || 'Pending'
    };
    complaints.push(newComplaint);
    if (writeDataFile('complaints.json', complaints)) {
        res.status(201).json(newComplaint);
    } else {
        res.status(500).json({ error: 'Failed to save complaint' });
    }
});

app.put('/api/complaints/:id/status', (req, res) => {
    const complaints = readDataFile('complaints.json');
    const index = complaints.findIndex(c => c.complaintID === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Complaint not found' });
    }
    complaints[index].status = req.body.status;
    if (writeDataFile('complaints.json', complaints)) {
        res.json(complaints[index]);
    } else {
        res.status(500).json({ error: 'Failed to update complaint' });
    }
});

// ===== CHATS & MESSAGES =====
app.get('/api/chats', (req, res) => {
    const chats = readDataFile('chats.json');
    res.json(chats);
});

app.get('/api/chats/user/:userId', (req, res) => {
    const chats = readDataFile('chats.json');
    const userChats = chats.filter(c => c.participants && c.participants.includes(req.params.userId));
    res.json(userChats);
});

app.post('/api/chats', (req, res) => {
    const chats = readDataFile('chats.json');
    const newChat = {
        chatID: generateID('CHAT', chats),
        ...req.body
    };
    chats.push(newChat);
    if (writeDataFile('chats.json', chats)) {
        res.status(201).json(newChat);
    } else {
        res.status(500).json({ error: 'Failed to create chat' });
    }
});

app.get('/api/messages/chat/:chatId', (req, res) => {
    const messages = readDataFile('messages.json');
    const chatMessages = messages.filter(m => m.chatID === req.params.chatId);
    res.json(chatMessages);
});

app.post('/api/messages', (req, res) => {
    const messages = readDataFile('messages.json');
    const newMessage = {
        messageID: generateID('MS', messages),
        ...req.body,
        timestamp: new Date().toISOString()
    };
    messages.push(newMessage);
    if (writeDataFile('messages.json', messages)) {
        res.status(201).json(newMessage);
    } else {
        res.status(500).json({ error: 'Failed to save message' });
    }
});

// ===== NOTIFICATIONS =====
app.get('/api/notifications', (req, res) => {
    const notifications = readDataFile('notifications.json');
    res.json(notifications);
});

app.get('/api/notifications/customer/:customerId', (req, res) => {
    const notifications = readDataFile('notifications.json');
    const customerNotifs = notifications.filter(n => n.customerID === req.params.customerId);
    res.json(customerNotifs);
});

app.post('/api/notifications', (req, res) => {
    const notifications = readDataFile('notifications.json');
    const newNotif = {
        notificationID: generateID('NT', notifications),
        ...req.body,
        isRead: false
    };
    notifications.push(newNotif);
    if (writeDataFile('notifications.json', notifications)) {
        res.status(201).json(newNotif);
    } else {
        res.status(500).json({ error: 'Failed to save notification' });
    }
});

app.put('/api/notifications/:id/read', (req, res) => {
    const notifications = readDataFile('notifications.json');
    const index = notifications.findIndex(n => n.notificationID === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Notification not found' });
    }
    notifications[index].isRead = true;
    if (writeDataFile('notifications.json', notifications)) {
        res.json(notifications[index]);
    } else {
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// ===== DASHBOARD STATS =====
app.get('/api/dashboard/stats', (req, res) => {
    try {
        const orders = readDataFile('orders.json');
        const products = readDataFile('products.json');
        const users = readDataFile('users.json');
        const complaints = readDataFile('complaints.json');
        const greenCoins = readDataFile('greenCoins.json');
        const repairOrders = readDataFile('repairOrders.json');
        const resellOrders = readDataFile('resellOrders.json');
        const recycleOrders = readDataFile('recycleOders.json');
        
        // ===== ĐẾM SẢN PHẨM ĐỆ QUY =====
        let totalProducts = 0;
        for (const category of products) {
            if (category.Products && Array.isArray(category.Products)) {
                totalProducts += countProductsRecursive(category.Products);
            }
        }
        
        console.log(`📊 Total products counted: ${totalProducts}`);
        
        let customers = [];
        let stores = [];
        for (const item of users) {
            if (item.customers) customers = item.customers;
            if (item.repairstores) stores = item.repairstores;
        }
        
        const revenue = orders.reduce((sum, o) => {
            const total = parseFloat(String(o.total || '0').replace(/[^0-9.]/g, ''));
            return sum + (isNaN(total) ? 0 : total);
        }, 0);
        
        res.json({
            totalProducts,
            totalOrders: orders.length,
            totalCustomers: customers.length,
            totalStores: stores.length,
            totalComplaints: complaints.length,
            pendingComplaints: complaints.filter(c => c.status === 'Pending').length,
            totalGreenCoins: greenCoins.reduce((sum, c) => sum + (c.greenCoins || 0), 0),
            totalRepairOrders: repairOrders.length,
            totalResellOrders: resellOrders.length,
            totalRecycleOrders: recycleOrders.length,
            revenue: revenue
        });
    } catch (error) {
        console.error('❌ Error in dashboard stats:', error);
        res.status(500).json({ 
            totalProducts: 0,
            totalOrders: 0,
            totalCustomers: 0,
            totalStores: 0,
            totalComplaints: 0,
            pendingComplaints: 0,
            totalGreenCoins: 0,
            totalRepairOrders: 0,
            totalResellOrders: 0,
            totalRecycleOrders: 0,
            revenue: 0,
            error: error.message
        });
    }
});

// ===== SEARCH =====
app.get('/api/search', (req, res) => {
    const query = req.query.q?.toLowerCase() || '';
    if (!query || query.length < 2) {
        return res.json({ products: [], customers: [], orders: [] });
    }
    
    try {
        const products = readDataFile('products.json');
        const users = readDataFile('users.json');
        const orders = readDataFile('orders.json');
        
        // Search products - sử dụng hàm đệ quy
        const matchedProducts = [];
        for (const category of products) {
            const categoryName = category.CateName || 'Khác';
            const allCategoryProducts = getAllProductsRecursive(category.Products || [], categoryName);
            
            for (const product of allCategoryProducts) {
                if (product.title?.toLowerCase().includes(query) || 
                    product.id?.toLowerCase().includes(query)) {
                    matchedProducts.push(product);
                }
            }
        }
        
        let customers = [];
        for (const item of users) {
            if (item.customers) customers = item.customers;
        }
        const matchedCustomers = customers.filter(c => 
            c.fullName?.toLowerCase().includes(query) || 
            c.email?.toLowerCase().includes(query) ||
            c.customerID?.toLowerCase().includes(query)
        );
        
        const matchedOrders = orders.filter(o => 
            o.orderID?.toLowerCase().includes(query) ||
            o.customerID?.toLowerCase().includes(query)
        );
        
        res.json({
            products: matchedProducts.slice(0, 20),
            customers: matchedCustomers.slice(0, 10),
            orders: matchedOrders.slice(0, 10)
        });
    } catch (error) {
        console.error('❌ Error in search:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== TEST =====
app.get('/api/test', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running!',
        timestamp: new Date().toISOString()
    });
});

// ===== DEBUG PRODUCTS =====
app.get('/api/debug-products', (req, res) => {
    try {
        const products = readDataFile('products.json');
        let totalProducts = 0;
        for (const category of products) {
            if (category.Products && Array.isArray(category.Products)) {
                totalProducts += countProductsRecursive(category.Products);
            }
        }
        res.json({
            success: true,
            categories: products.length,
            totalProducts: totalProducts,
            firstCategory: products[0]?.CateName || 'N/A',
            sample: products[0]?.Products?.[0] || null
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});
// ===== CART =====
// Lấy tất cả giỏ hàng
app.get('/api/cart', (req, res) => {
    const carts = readDataFile('cart.json');
    console.log('📦 Cart data:', carts.length, 'items');
    res.json(carts);
});

// Lấy giỏ hàng theo customerID
app.get('/api/cart/:customerId', (req, res) => {
    const carts = readDataFile('cart.json');
    const cart = carts.find(c => c.customerID === req.params.customerId);
    if (cart) {
        res.json(cart);
    } else {
        res.status(404).json({ error: 'Cart not found' });
    }
});

// Tạo/Cập nhật giỏ hàng
app.post('/api/cart', (req, res) => {
    const carts = readDataFile('cart.json');
    const { customerID, products } = req.body;
    let cart = carts.find(c => c.customerID === customerID);
    
    if (cart) {
        cart.products = products || [];
    } else {
        cart = {
            cartID: generateID('CT', carts),
            customerID,
            products: products || []
        };
        carts.push(cart);
    }
    
    if (writeDataFile('cart.json', carts)) {
        res.json(cart);
    } else {
        res.status(500).json({ error: 'Failed to save cart' });
    }
});

// ===== MESSAGES =====
// Lấy tất cả tin nhắn
app.get('/api/messages', (req, res) => {
    const messages = readDataFile('messages.json');
    console.log('💬 Messages data:', messages.length, 'items');
    res.json(messages);
});

// Lấy tin nhắn theo chatID
app.get('/api/messages/chat/:chatId', (req, res) => {
    const messages = readDataFile('messages.json');
    const chatMessages = messages.filter(m => m.chatID === req.params.chatId);
    res.json(chatMessages);
});

// Gửi tin nhắn mới
app.post('/api/messages', (req, res) => {
    const messages = readDataFile('messages.json');
    const newMessage = {
        messageID: generateID('MS', messages),
        ...req.body,
        timestamp: new Date().toISOString()
    };
    messages.push(newMessage);
    if (writeDataFile('messages.json', messages)) {
        res.status(201).json(newMessage);
    } else {
        res.status(500).json({ error: 'Failed to save message' });
    }
});

// ===== AI ASSESSMENTS =====
// Lấy tất cả đánh giá AI
app.get('/api/aiassessments', (req, res) => {
    const assessments = readDataFile('AI_assessments.json');
    res.json(assessments);
});

// Lấy theo requestID
app.get('/api/aiassessments/request/:requestId', (req, res) => {
    const assessments = readDataFile('AI_assessments.json');
    const assessment = assessments.find(a => a.requestID === req.params.requestId);
    res.json(assessment || null);
});


// ===== PROCESS REQUESTS =====
// Lấy tất cả yêu cầu xử lý
app.get('/api/processrequests', (req, res) => {
    const requests = readDataFile('processRequests.json');
    res.json(requests);
});

// Lấy theo customerID
app.get('/api/processrequests/customer/:customerId', (req, res) => {
    const requests = readDataFile('processRequests.json');
    const customerRequests = requests.filter(r => r.customerID === req.params.customerId);
    res.json(customerRequests);
});
// ===== TEST ĐỌC FILE PRODUCTS.JSON TRỰC TIẾP =====
app.get('/api/test-read-products', (req, res) => {
    try {
        const filePath = path.join(datasetDir, 'products.json');
        console.log('🔍 Đang kiểm tra file tại:', filePath);
        
        // Kiểm tra file tồn tại
        const exists = fs.existsSync(filePath);
        console.log('📁 File exists:', exists);
        
        if (!exists) {
            return res.json({
                success: false,
                error: 'File not found',
                path: filePath,
                datasetDir: datasetDir
            });
        }
        
        // Đọc file raw
        const raw = fs.readFileSync(filePath, 'utf8');
        console.log('📄 File size:', raw.length, 'bytes');
        console.log('📄 First 200 chars:', raw.substring(0, 200));
        
        // Parse JSON
        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch (parseError) {
            return res.json({
                success: false,
                error: 'JSON parse error',
                message: parseError.message,
                raw: raw.substring(0, 500)
            });
        }
        
        res.json({
            success: true,
            filePath: filePath,
            fileSize: raw.length,
            isArray: Array.isArray(parsed),
            length: parsed.length,
            firstCategory: parsed.length > 0 ? parsed[0].CateName : 'empty',
            totalCategories: parsed.length,
            sample: parsed.length > 0 ? parsed[0] : null
        });
    } catch (error) {
        console.error('❌ Test read error:', error);
        res.json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});
// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`\n🚀 ECOcycle Server is running on http://localhost:${PORT}`);
    console.log(`📁 Dataset directory: ${datasetDir}`);
    console.log(`\n📋 Available APIs:\n`);
    console.log(`   GET  /api/test - Test server`);
    console.log(`   GET  /api/debug-products - Debug products`);
    console.log(`   GET  /api/dashboard/stats - Dashboard stats`);
    console.log(`\n✅ Server ready!\n`);
});