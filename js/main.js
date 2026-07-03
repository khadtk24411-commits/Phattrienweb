/**
 * Main JavaScript - Quản lý tất cả trang
 * Tự động tải dữ liệu và cập nhật lên server
 */

// ==================== CẤU HÌNH ====================
// API_BASE đã được định nghĩa trong data-loader.js
let currentPage = '';

// ==================== XÁC ĐỊNH TRANG HIỆN TẠI ====================
function getCurrentPage() {
    const path = window.location.pathname;
    const fileName = path.split('/').pop();
    return fileName.replace('.html', '');
}

// ==================== LOAD DỮ LIỆU THEO TRANG ====================
document.addEventListener('DOMContentLoaded', function() {
    currentPage = getCurrentPage();
    console.log('📄 Current page:', currentPage);
    
    // Load dữ liệu tương ứng
    loadPageData(currentPage);
});

async function loadPageData(page) {
    try {
        switch(page) {
            case 'dashboard_admin':
                await loadDashboard();
                break;
            case 'manage_users':
                await loadUsers();
                break;
            case 'manage_marketplace':
                await loadProducts();
                break;
            case 'manage_paymentshipping':
                await loadOrders();
                break;
            case 'manage_report':
                await loadComplaints();
                break;
            case 'green_coin':
                await loadGreenCoins();
                break;
            case 'green_dashboard':
                await loadGreenDashboard();
                break;
            case 'quotation_list':
                await loadQuotations();
                break;
            case 'repair_orders':
                await loadRepairOrders();
                break;
            case 'store_profile':
                await loadStoreProfile();
                break;
            case 'chat_list':
                await loadChatList();
                break;
            case 'order_details':
                await loadOrderDetails();
                break;
            case 'quotation':
                await loadQuotationDetail();
                break;
            default:
                console.log('⏭️ No specific loader for:', page);
        }
    } catch (error) {
        console.error('❌ Error loading page:', error);
        showNotification('Lỗi tải dữ liệu', 'error');
    }
}

// ==================== HÀM HIỂN THỊ THÔNG BÁO ====================
function showNotification(message, type = 'success') {
    const noti = document.createElement('div');
    noti.className = `notification ${type}`;
    noti.textContent = message;
    noti.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 9999;
        background: ${type === 'success' ? '#00852f' : type === 'error' ? '#dc3545' : '#17a2b8'};
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(noti);
    setTimeout(() => noti.remove(), 3000);
}

// ==================== HÀM GỌI API ====================
async function callAPI(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (data) options.body = JSON.stringify(data);
        
        const response = await fetch(`${API_BASE}/${endpoint}`, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`❌ API Error: ${endpoint}`, error);
        throw error;
    }
}

// ==================== 1. DASHBOARD ADMIN ====================
async function loadDashboard() {
    try {
        const stats = await callAPI('dashboard/stats');
        console.log('📊 Dashboard stats:', stats);
        
        updateElement('txtPost', stats.totalProducts?.toLocaleString() || '0');
        updateElement('txtCoin', stats.totalOrders?.toLocaleString() || '0');
        updateElement('txtRepair', stats.totalRepairOrders?.toLocaleString() || '0');
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ==================== 2. QUẢN LÝ NGƯỜI DÙNG ====================
async function loadUsers() {
    try {
        const customers = await callAPI('users/customers');
        const stores = await callAPI('users/repairstores');
        
        const totalUsers = (customers?.length || 0) + (stores?.length || 0);
        updateElement('txtTotalUsers', totalUsers.toLocaleString());
        
        const tbody = document.querySelector('#tblUsers tbody');
        if (tbody) {
            const allUsers = [
                ...(customers || []).map(c => ({ ...c, role: 'Người dùng', type: 'customer' })),
                ...(stores || []).map(s => ({ ...s, role: 'Cửa hàng sửa chữa', type: 'store' }))
            ];
            
            if (allUsers.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:20px;">Không có người dùng</td></tr>`;
                return;
            }
            
            tbody.innerHTML = allUsers.map(user => `
                <tr>
                    <td>${user.customerID || user.storeID || 'N/A'}</td>
                    <td>${user.fullName || user.storeName || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${user.phoneNumber || 'N/A'}</td>
                    <td>${user.role || 'N/A'}</td>
                    <td><span class="badge ${user.status === 'Bị khóa' ? 'danger-bg' : 'success-bg'}">${user.status === 'Bị khóa' ? 'Bị khóa' : 'Hoạt động'}</span></td>
                    <td>${user.joinDate || 'N/A'}</td>
                    <td><button class="action-btn"><i class="fa-solid fa-ellipsis"></i></button></td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// ==================== 3. QUẢN LÝ SẢN PHẨM ====================
async function loadProducts() {
    try {
        const products = await callAPI('products');
        console.log('📦 Products loaded');
        
        // Đếm tổng sản phẩm
        let totalProducts = 0;
        for (const category of products || []) {
            if (category.Products) {
                totalProducts += category.Products.length;
            }
        }
        
        updateElement('txtTotalPost', totalProducts.toLocaleString());
        
        const tbody = document.querySelector('#tblMarketplace tbody');
        if (tbody) {
            // Lấy 5 sản phẩm đầu tiên
            const sampleProducts = [];
            for (const category of products || []) {
                if (category.Products) {
                    for (const product of category.Products) {
                        if (sampleProducts.length < 5) {
                            sampleProducts.push({ ...product, category: category.CateName });
                        }
                    }
                }
            }
            
            if (sampleProducts.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px;">Không có sản phẩm</td></tr>`;
                return;
            }
            
            tbody.innerHTML = sampleProducts.map((p, i) => `
                <tr>
                    <td>PST-${String(i+1).padStart(4,'0')}</td>
                    <td>
                        <div class="product-cell">
                            <img src="${p.img || '../images/default.png'}" style="width:40px;height:40px;object-fit:cover;">
                            <div><strong>${p.title || 'N/A'}</strong><p>SL: ${p.quantity || 0}</p></div>
                        </div>
                    </td>
                    <td>${p.sellerid || 'N/A'}</td>
                    <td>${p.category || 'N/A'}</td>
                    <td>${p.fromPrice || 'N/A'}</td>
                    <td><span class="badge ${p.quantity > 0 ? 'success-bg' : 'warning-bg'}">${p.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}</span></td>
                    <td>${new Date().toLocaleDateString()}</td>
                    <td><button class="action-btn"><i class="fa-solid fa-ellipsis"></i></button></td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// ==================== 4. QUẢN LÝ ĐƠN HÀNG ====================
async function loadOrders() {
    try {
        const orders = await callAPI('orders');
        console.log('📦 Orders loaded:', orders?.length || 0);
        
        updateElement('txtTotalOrder', orders?.length || 0);
        
        const tbody = document.querySelector('#tblOrders tbody');
        if (tbody) {
            if (!orders || orders.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px;">Không có đơn hàng</td></tr>`;
                return;
            }
            
            tbody.innerHTML = orders.map(order => `
                <tr>
                    <td>${order.orderID || 'N/A'}</td>
                    <td>${order.customerID || 'N/A'}</td>
                    <td>${order.products?.length || 0} sản phẩm</td>
                    <td>${order.total || 'N/A'}</td>
                    <td><span class="badge ${getStatusClass(order.status)}">${order.status || 'Pending'}</span></td>
                    <td>${order.orderDate || 'N/A'}</td>
                    <td>
                        <select onchange="updateOrderStatus('${order.orderID}', this.value)">
                            ${['Pending','Paid','In Transit','Delivered','Cancelled'].map(s => 
                                `<option value="${s}" ${s === order.status ? 'selected' : ''}>${s}</option>`
                            ).join('')}
                        </select>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Cập nhật trạng thái đơn hàng
window.updateOrderStatus = async function(orderId, status) {
    try {
        const result = await callAPI(`orders/${orderId}/status`, 'PUT', { status });
        if (result) {
            showNotification('Cập nhật trạng thái thành công!', 'success');
            setTimeout(() => loadOrders(), 500);
        }
    } catch (error) {
        showNotification('Lỗi cập nhật trạng thái', 'error');
    }
};

// ==================== 5. QUẢN LÝ KHIẾU NẠI ====================
async function loadComplaints() {
    try {
        const complaints = await callAPI('complaints');
        console.log('📋 Complaints loaded:', complaints?.length || 0);
        
        updateElement('txtComplaint', complaints?.length || 0);
        
        const tbody = document.querySelector('#tblComplaint tbody');
        if (tbody) {
            if (!complaints || complaints.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;">Không có khiếu nại</td></tr>`;
                return;
            }
            
            tbody.innerHTML = complaints.map(c => `
                <tr>
                    <td>${c.complaintID || 'N/A'}</td>
                    <td>${c.customerID || 'N/A'}</td>
                    <td>${c.reason || 'N/A'}</td>
                    <td>${c.date || 'N/A'}</td>
                    <td><span class="badge ${getStatusClass(c.status)}">${c.status || 'Pending'}</span></td>
                    <td>
                        <select onchange="updateComplaintStatus('${c.complaintID}', this.value)">
                            ${['Pending','In Progress','Resolved','Rejected'].map(s => 
                                `<option value="${s}" ${s === c.status ? 'selected' : ''}>${s}</option>`
                            ).join('')}
                        </select>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading complaints:', error);
    }
}

window.updateComplaintStatus = async function(complaintId, status) {
    try {
        const result = await callAPI(`complaints/${complaintId}/status`, 'PUT', { status });
        if (result) {
            showNotification('Cập nhật khiếu nại thành công!', 'success');
            setTimeout(() => loadComplaints(), 500);
        }
    } catch (error) {
        showNotification('Lỗi cập nhật khiếu nại', 'error');
    }
};

// ==================== 6. GREEN COINS ====================
async function loadGreenCoins() {
    try {
        const customerId = localStorage.getItem('customerId') || 'CM000001';
        const customer = await callAPI(`users/customer/${customerId}`);
        const coins = await callAPI(`greencoins/customer/${customerId}`);
        
        // Cập nhật số dư
        updateElement('coinValue', customer?.greenCoins || 0);
        updateElement('moneyValue', ((customer?.greenCoins || 0) * 1000).toLocaleString());
        
        const tbody = document.querySelector('#historyTable');
        if (tbody) {
            if (!coins || coins.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:20px;">Chưa có giao dịch</td></tr>`;
                return;
            }
            
            tbody.innerHTML = coins.map(c => `
                <tr>
                    <td>${c.action || 'Giao dịch'}</td>
                    <td>${c.orderID || 'N/A'}</td>
                    <td style="color:#00852f;font-weight:bold;">+${c.greenCoins || 0}</td>
                    <td>${c.date || 'N/A'}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading green coins:', error);
    }
}

// ==================== 7. GREEN DASHBOARD ====================
async function loadGreenDashboard() {
    try {
        const customerId = localStorage.getItem('customerId') || 'CM000001';
        const stats = await callAPI('dashboard/stats');
        
        // Cập nhật các card (chỉ là dữ liệu demo)
        const cards = document.querySelectorAll('.card-number');
        if (cards.length >= 4) {
            cards[0].textContent = Math.round(stats.totalProducts * 0.02) || 12;
            cards[1].textContent = stats.totalOrders || 24;
            cards[2].textContent = Math.round(stats.totalOrders * 0.05) || 30;
            cards[3].textContent = Math.round(stats.totalProducts * 0.1) || 362;
        }
    } catch (error) {
        console.error('Error loading green dashboard:', error);
    }
}

// ==================== 8. DANH SÁCH BÁO GIÁ ====================
async function loadQuotations() {
    try {
        const requests = await callAPI('processrequests');
        const repairRequests = (requests || []).filter(r => r.requestType === 'Repair');
        
        const tbody = document.querySelector('.table-card tbody');
        if (tbody) {
            if (repairRequests.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;">Không có yêu cầu sửa chữa</td></tr>`;
                return;
            }
            
            const statusMap = { 'Pending': 'wait', 'Processed': 'wait', 'Sent': 'sent', 'Agreed': 'done' };
            const statusText = { 'Pending': 'Chờ báo giá', 'Processed': 'Chờ báo giá', 'Sent': 'Đã gửi báo giá', 'Agreed': 'Đã đồng ý' };
            
            tbody.innerHTML = repairRequests.map(r => `
                <tr>
                    <td>${r.requestID || 'N/A'}</td>
                    <td>
                        <div class="device">
                            <div class="device-img"><i class="fa-solid fa-${getDeviceIcon(r.productName)}"></i></div>
                            <div>${r.productName || 'N/A'}</div>
                        </div>
                    </td>
                    <td>${r.customerID || 'N/A'}</td>
                    <td>${r.condition || 'N/A'}</td>
                    <td>${r.orderDate || 'N/A'}</td>
                    <td><span class="status ${statusMap[r.status] || 'wait'}">${statusText[r.status] || r.status}</span></td>
                    <td>
                        ${r.status === 'Pending' || r.status === 'Processed' ? 
                            `<a href="quotation.html?id=${r.requestID}"><button class="btn-quote">Báo giá</button></a>` :
                            `<button class="btn-quote" onclick="alert('Xem báo giá ${r.requestID}')">Xem</button>`
                        }
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading quotations:', error);
    }
}

// ==================== 9. ĐƠN SỬA CHỮA ====================
async function loadRepairOrders() {
    try {
        const storeId = localStorage.getItem('storeId') || 'BR000001';
        const orders = await callAPI(`repairorders/store/${storeId}`);
        
        const stats = document.querySelectorAll('.stat-value');
        if (stats.length >= 4) {
            stats[0].textContent = orders?.length || 0;
            stats[1].textContent = (orders || []).filter(o => o.status === 'In Progress').length || 0;
            stats[2].textContent = (orders || []).filter(o => o.status === 'Waiting').length || 0;
            stats[3].textContent = (orders || []).filter(o => o.status === 'Completed' || o.status === 'Delivered').length || 0;
        }
        
        const tbody = document.querySelector('.table-card tbody');
        if (tbody) {
            if (!orders || orders.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;">Không có đơn sửa chữa</td></tr>`;
                return;
            }
            
            const statusMap = { 'Pending': 'waiting', 'In Progress': 'repairing', 'Waiting': 'wait', 'Completed': 'done', 'Delivered': 'done' };
            const statusText = { 'Pending': 'Chờ xử lý', 'In Progress': 'Đang sửa', 'Waiting': 'Chờ nhận máy', 'Completed': 'Hoàn tất', 'Delivered': 'Đã giao' };
            
            tbody.innerHTML = orders.map(o => `
                <tr>
                    <td>${o.repairOrderID || 'N/A'}</td>
                    <td>
                        <div class="device">
                            <div class="device-img"><i class="fa-solid fa-${getDeviceIcon(o.productName)}"></i></div>
                            <div>${o.productName || 'N/A'}</div>
                        </div>
                    </td>
                    <td>${o.customerID || 'N/A'}</td>
                    <td>${o.finalCost || 'Chờ báo giá'}</td>
                    <td><span class="badge ${statusMap[o.status] || 'waiting'}">${statusText[o.status] || o.status}</span></td>
                    <td>${o.orderDate || o.pickupDate || 'N/A'}</td>
                    <td><a href="order_details.html?id=${o.repairOrderID}"><button class="btn-view">Chi tiết</button></a></td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading repair orders:', error);
    }
}

// ==================== 10. HỒ SƠ CỬA HÀNG ====================
async function loadStoreProfile() {
    try {
        const storeId = localStorage.getItem('storeId') || 'BR000001';
        const store = await callAPI(`users/repairstore/${storeId}`);
        
        if (store) {
            const nameEl = document.querySelector('.store-name');
            if (nameEl) nameEl.innerHTML = `${store.storeName || 'FastFix'} <span class="verified">Đã xác thực</span>`;
            
            const labels = document.querySelectorAll('.label');
            const values = document.querySelectorAll('.value');
            
            const fieldMap = {
                'Tên cửa hàng': store.storeName,
                'Người đại diện': store.legalRep,
                'Số điện thoại': store.phoneNumber,
                'Email': store.email,
                'Địa chỉ': store.address,
                'Giờ hoạt động': '08:00 - 20:00',
                'Mô tả cửa hàng': 'Chúng tôi cung cấp dịch vụ sửa chữa uy tín và chất lượng.'
            };
            
            labels.forEach((label, i) => {
                const key = label.textContent.trim();
                if (fieldMap[key] && values[i]) {
                    values[i].textContent = fieldMap[key] || 'N/A';
                }
            });
        }
    } catch (error) {
        console.error('Error loading store profile:', error);
    }
}

// ==================== 11. DANH SÁCH CHAT ====================
async function loadChatList() {
    try {
        const chats = await callAPI('chats');
        const customers = await callAPI('users/customers');
        
        const container = document.querySelector('.chat-container');
        if (container && chats && chats.length > 0) {
            const customerMap = {};
            (customers || []).forEach(c => customerMap[c.customerID] = c);
            
            container.innerHTML = chats.map(chat => {
                const participant = chat.participants?.find(p => p.startsWith('CM'));
                const customer = customerMap[participant];
                const initial = customer?.fullName?.charAt(0) || '?';
                
                return `
                <div class="customer-item">
                    <div class="avatar-wrapper">
                        <div class="customer-avatar">${initial}</div>
                    </div>
                    <div class="customer-info">
                        <div class="customer-name">${customer?.fullName || participant || 'Unknown'}</div>
                        <div class="last-message">Chat ID: ${chat.chatID}</div>
                    </div>
                    <div class="chat-meta">
                        <div class="chat-time">${new Date().toLocaleTimeString()}</div>
                    </div>
                </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading chat list:', error);
    }
}

// ==================== 12. CHI TIẾT ĐƠN HÀNG ====================
async function loadOrderDetails() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('id') || 'RP000001';
        
        const orders = await callAPI('repairorders');
        const order = (orders || []).find(o => o.repairOrderID === orderId);
        
        if (order) {
            const statusBadge = document.querySelector('.status-badge');
            if (statusBadge) {
                const statusMap = { 'Pending': 'Chờ báo giá', 'In Progress': 'Đang sửa', 'Waiting': 'Chờ nhận máy', 'Completed': 'Hoàn tất' };
                statusBadge.textContent = statusMap[order.status] || order.status;
            }
            
            // Cập nhật thông tin thiết bị
            const deviceName = document.querySelector('.device-info h3');
            if (deviceName) {
                const requests = await callAPI('processrequests');
                const request = (requests || []).find(r => r.requestID === order.requestID);
                deviceName.textContent = request?.productName || 'N/A';
            }
        }
    } catch (error) {
        console.error('Error loading order details:', error);
    }
}

// ==================== 13. CHI TIẾT BÁO GIÁ ====================
async function loadQuotationDetail() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const requestId = urlParams.get('id') || 'RQ000001';
        
        const requests = await callAPI('processrequests');
        const request = (requests || []).find(r => r.requestID === requestId);
        const assessments = await callAPI('aiassessments');
        const assessment = (assessments || []).find(a => a.requestID === requestId);
        
        if (request) {
            const deviceName = document.querySelector('.device-detail h4');
            if (deviceName) deviceName.textContent = request.productName || 'N/A';
        }
        
        if (assessment) {
            const aiBox = document.querySelector('.ai-box');
            if (aiBox) {
                const paragraphs = aiBox.querySelectorAll('p');
                if (paragraphs.length >= 2) {
                    paragraphs[0].textContent = assessment.recommendedAction || 'Đang phân tích...';
                    paragraphs[1].textContent = `Chi phí sửa chữa dự kiến: ${assessment.estimatedRepairCost || 'N/A'}`;
                }
            }
        }
    } catch (error) {
        console.error('Error loading quotation detail:', error);
    }
}

// ==================== HELPER FUNCTIONS ====================
function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function getStatusClass(status) {
    const map = {
        'Pending': 'warning-bg',
        'In Progress': 'info-bg',
        'Processed': 'info-bg',
        'Delivered': 'success-bg',
        'Paid': 'success-bg',
        'Resolved': 'success-bg',
        'Completed': 'success-bg',
        'Cancelled': 'danger-bg',
        'Rejected': 'danger-bg'
    };
    return map[status] || 'warning-bg';
}

function getDeviceIcon(productName) {
    const name = (productName || '').toLowerCase();
    if (name.includes('iphone') || name.includes('samsung') || name.includes('điện thoại')) return 'mobile-screen';
    if (name.includes('laptop') || name.includes('macbook')) return 'laptop';
    if (name.includes('ipad') || name.includes('tablet')) return 'tablet-screen-button';
    return 'microchip';
}

// ==================== TỰ ĐỘNG REFRESH ====================
// Refresh dữ liệu mỗi 30 giây
setInterval(() => {
    if (currentPage) {
        loadPageData(currentPage);
    }
}, 30000);

// Hàm refresh thủ công
window.refreshData = function() {
    loadPageData(currentPage);
    showNotification('Đã làm mới dữ liệu!', 'success');
};

console.log('✅ Main.js loaded successfully!');