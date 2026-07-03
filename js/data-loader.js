/**
 * ECOcycle Data Loader - Client-side API wrapper
 * Dựa trên cấu trúc dữ liệu JSON thực tế
 */

const API_BASE = 'http://localhost:3000/api';

// ==================== USERS ====================
async function getUsers() {
    try {
        const response = await fetch(`${API_BASE}/users`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

async function getCustomers() {
    try {
        const response = await fetch(`${API_BASE}/users/customers`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
}

async function getCustomer(id) {
    try {
        const response = await fetch(`${API_BASE}/users/customer/${id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching customer ${id}:`, error);
        return null;
    }
}

async function createCustomer(data) {
    try {
        const response = await fetch(`${API_BASE}/users/customer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error creating customer:', error);
        return null;
    }
}

async function updateCustomer(id, data) {
    try {
        const response = await fetch(`${API_BASE}/users/customer/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error updating customer ${id}:`, error);
        return null;
    }
}

async function getRepairStores() {
    try {
        const response = await fetch(`${API_BASE}/users/repairstores`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching repair stores:', error);
        return [];
    }
}

async function getRepairStore(id) {
    try {
        const response = await fetch(`${API_BASE}/users/repairstore/${id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching repair store ${id}:`, error);
        return null;
    }
}

// ==================== ADMINS ====================
async function getAdmins() {
    try {
        const response = await fetch(`${API_BASE}/admins`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching admins:', error);
        return [];
    }
}

async function loginAdmin(username, password) {
    try {
        const response = await fetch(`${API_BASE}/admins/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName: username, passwords: password })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error logging in:', error);
        return { success: false, error: error.message };
    }
}

// ==================== PRODUCTS ====================
async function getProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

async function getProduct(id) {
    try {
        const response = await fetch(`${API_BASE}/products/${id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
    }
}

async function getProductsByCategory(categoryId) {
    try {
        const response = await fetch(`${API_BASE}/products/category/${categoryId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching products by category ${categoryId}:`, error);
        return null;
    }
}

// ==================== ORDERS ====================
async function getOrders() {
    try {
        const response = await fetch(`${API_BASE}/orders`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}

async function getOrdersByCustomer(customerId) {
    try {
        const response = await fetch(`${API_BASE}/orders/customer/${customerId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching orders for customer ${customerId}:`, error);
        return [];
    }
}

async function createOrder(data) {
    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error creating order:', error);
        return null;
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error updating order ${orderId}:`, error);
        return null;
    }
}

// ==================== CART ====================
async function getCart(customerId) {
    try {
        const response = await fetch(`${API_BASE}/cart/${customerId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching cart for customer ${customerId}:`, error);
        return { cartID: null, customerID: customerId, products: [] };
    }
}

async function updateCart(customerId, products) {
    try {
        const response = await fetch(`${API_BASE}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerID: customerId, products })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error updating cart:', error);
        return null;
    }
}

// ==================== PAYMENTS ====================
async function getPayments() {
    try {
        const response = await fetch(`${API_BASE}/payments`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching payments:', error);
        return [];
    }
}

async function createPayment(data) {
    try {
        const response = await fetch(`${API_BASE}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error creating payment:', error);
        return null;
    }
}

// ==================== GREEN COINS ====================
async function getGreenCoins() {
    try {
        const response = await fetch(`${API_BASE}/greencoins`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching green coins:', error);
        return [];
    }
}

async function getGreenCoinsByCustomer(customerId) {
    try {
        const response = await fetch(`${API_BASE}/greencoins/customer/${customerId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching green coins for customer ${customerId}:`, error);
        return [];
    }
}

async function createGreenCoinTransaction(data) {
    try {
        const response = await fetch(`${API_BASE}/greencoins`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error creating green coin transaction:', error);
        return null;
    }
}

// ==================== PROCESS REQUESTS ====================
async function getProcessRequests() {
    try {
        const response = await fetch(`${API_BASE}/processrequests`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching process requests:', error);
        return [];
    }
}

async function getProcessRequestsByCustomer(customerId) {
    try {
        const response = await fetch(`${API_BASE}/processrequests/customer/${customerId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching process requests for customer ${customerId}:`, error);
        return [];
    }
}

async function createProcessRequest(data) {
    try {
        const response = await fetch(`${API_BASE}/processrequests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error creating process request:', error);
        return null;
    }
}

async function updateProcessRequestStatus(id, status) {
    try {
        const response = await fetch(`${API_BASE}/processrequests/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error updating request ${id}:`, error);
        return null;
    }
}

// ==================== AI ASSESSMENTS ====================
async function getAIAssessments() {
    try {
        const response = await fetch(`${API_BASE}/aiassessments`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching AI assessments:', error);
        return [];
    }
}

async function getAIAssessmentByRequest(requestId) {
    try {
        const response = await fetch(`${API_BASE}/aiassessments/request/${requestId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching AI assessment for request ${requestId}:`, error);
        return null;
    }
}

async function createAIAssessment(data) {
    try {
        const response = await fetch(`${API_BASE}/aiassessments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error creating AI assessment:', error);
        return null;
    }
}

// ==================== REPAIR ORDERS ====================
async function getRepairOrders() {
    try {
        const response = await fetch(`${API_BASE}/repairorders`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching repair orders:', error);
        return [];
    }
}

async function getRepairOrdersByStore(storeId) {
    try {
        const response = await fetch(`${API_BASE}/repairorders/store/${storeId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching repair orders for store ${storeId}:`, error);
        return [];
    }
}

async function createRepairOrder(data) {
    try {
        const response = await fetch(`${API_BASE}/repairorders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error creating repair order:', error);
        return null;
    }
}

async function updateRepairOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${API_BASE}/repairorders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error updating repair order ${orderId}:`, error);
        return null;
    }
}

// ==================== RESELL ORDERS ====================
async function getResellOrders() {
    try {
        const response = await fetch(`${API_BASE}/resellorders`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching resell orders:', error);
        return [];
    }
}

async function createResellOrder(data) {
    try {
        const response = await fetch(`${API_BASE}/resellorders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error creating resell order:', error);
        return null;
    }
}

// ==================== RECYCLE ORDERS ====================
async function getRecycleOrders() {
    try {
        const response = await fetch(`${API_BASE}/recycleorders`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching recycle orders:', error);
        return [];
    }
}

async function createRecycleOrder(data) {
    try {
        const response = await fetch(`${API_BASE}/recycleorders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error creating recycle order:', error);
        return null;
    }
}

// ==================== REVIEWS ====================
async function getReviews() {
    try {
        const response = await fetch(`${API_BASE}/reviews`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
}

async function getReviewsByProduct(productId) {
    try {
        const response = await fetch(`${API_BASE}/reviews/product/${productId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching reviews for product ${productId}:`, error);
        return [];
    }
}

async function getReviewsByCustomer(customerId) {
    try {
        const response = await fetch(`${API_BASE}/reviews/customer/${customerId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching reviews for customer ${customerId}:`, error);
        return [];
    }
}

async function createReview(data) {
    try {
        const response = await fetch(`${API_BASE}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error creating review:', error);
        return null;
    }
}

// ==================== COMPLAINTS ====================
async function getComplaints() {
    try {
        const response = await fetch(`${API_BASE}/complaints`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching complaints:', error);
        return [];
    }
}

async function getComplaintsByCustomer(customerId) {
    try {
        const response = await fetch(`${API_BASE}/complaints/customer/${customerId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching complaints for customer ${customerId}:`, error);
        return [];
    }
}

async function createComplaint(data) {
    try {
        const response = await fetch(`${API_BASE}/complaints`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error creating complaint:', error);
        return null;
    }
}

async function updateComplaintStatus(id, status) {
    try {
        const response = await fetch(`${API_BASE}/complaints/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error updating complaint ${id}:`, error);
        return null;
    }
}

// ==================== CHATS & MESSAGES ====================
async function getChats() {
    try {
        const response = await fetch(`${API_BASE}/chats`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching chats:', error);
        return [];
    }
}

async function getChatsByUser(userId) {
    try {
        const response = await fetch(`${API_BASE}/chats/user/${userId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching chats for user ${userId}:`, error);
        return [];
    }
}

async function createChat(data) {
    try {
        const response = await fetch(`${API_BASE}/chats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error creating chat:', error);
        return null;
    }
}

async function getMessages(chatId) {
    try {
        const response = await fetch(`${API_BASE}/messages/chat/${chatId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching messages for chat ${chatId}:`, error);
        return [];
    }
}

async function sendMessage(data) {
    try {
        const response = await fetch(`${API_BASE}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error sending message:', error);
        return null;
    }
}

// ==================== NOTIFICATIONS ====================
async function getNotifications() {
    try {
        const response = await fetch(`${API_BASE}/notifications`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

async function getNotificationsByCustomer(customerId) {
    try {
        const response = await fetch(`${API_BASE}/notifications/customer/${customerId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching notifications for customer ${customerId}:`, error);
        return [];
    }
}

async function createNotification(data) {
    try {
        const response = await fetch(`${API_BASE}/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

async function markNotificationRead(notificationId) {
    try {
        const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error marking notification ${notificationId} as read:`, error);
        return null;
    }
}

// ==================== DASHBOARD ====================
async function getDashboardStats() {
    try {
        const response = await fetch(`${API_BASE}/dashboard/stats`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            totalProducts: 0,
            totalOrders: 0,
            totalCustomers: 0,
            totalStores: 0,
            totalComplaints: 0,
            pendingComplaints: 0,
            totalGreenCoins: 0,
            totalRepairOrders: 0,
            revenue: 0
        };
    }
}

// ==================== SEARCH ====================
async function search(query) {
    try {
        const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error(`Error searching for ${query}:`, error);
        return { products: [], customers: [], orders: [] };
    }
}

// ==================== EXPORT ====================
if (typeof window !== 'undefined') {
    window.ECOcycleAPI = {
        // Users
        getUsers, getCustomers, getCustomer, createCustomer, updateCustomer,
        getRepairStores, getRepairStore,
        // Admins
        getAdmins, loginAdmin,
        // Products
        getProducts, getProduct, getProductsByCategory,
        // Orders
        getOrders, getOrdersByCustomer, createOrder, updateOrderStatus,
        // Cart
        getCart, updateCart,
        // Payments
        getPayments, createPayment,
        // Green Coins
        getGreenCoins, getGreenCoinsByCustomer, createGreenCoinTransaction,
        // Process Requests
        getProcessRequests, getProcessRequestsByCustomer, createProcessRequest, updateProcessRequestStatus,
        // AI Assessments
        getAIAssessments, getAIAssessmentByRequest, createAIAssessment,
        // Service Orders
        getRepairOrders, getRepairOrdersByStore, createRepairOrder, updateRepairOrderStatus,
        getResellOrders, createResellOrder,
        getRecycleOrders, createRecycleOrder,
        // Reviews
        getReviews, getReviewsByProduct, getReviewsByCustomer, createReview,
        // Complaints
        getComplaints, getComplaintsByCustomer, createComplaint, updateComplaintStatus,
        // Chats & Messages
        getChats, getChatsByUser, createChat, getMessages, sendMessage,
        // Notifications
        getNotifications, getNotificationsByCustomer, createNotification, markNotificationRead,
        // Dashboard & Search
        getDashboardStats, search
    };
    console.log('✅ ECOcycleAPI loaded successfully!');
}