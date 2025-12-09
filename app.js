// Campus Merch Hub - Complete Application
// Combined into a single file for deployment

// ============================================
// MAIN APPLICATION CLASS
// ============================================

class CampusMerchHub {
    constructor() {
        this.viewMode = 'admin';
        this.adminPage = 'dashboard';
        this.userPage = 'catalog';
        this.currentUser = {
            name: 'Admin User',
            role: 'admin',
            department: null
        };
        this.cartItemCount = 3;
        this.isMobileMenuOpen = false;
        
        // Initialize modules
        this.modules = {
            pageLayout: new PageLayout(this),
            productManagement: new ProductManagement(this),
            departments: new Departments(this),
            merchRelease: new MerchRelease(this),
            communityApproval: new CommunityApproval(this),
            adminDashboard: new AdminDashboard(this),
            orderManagement: new OrderManagement(this),
            userVerification: new UserVerification(this)
        };
    }
    
    // App state methods
    getViewMode() { return this.viewMode; }
    setViewMode(mode) { 
        this.viewMode = mode; 
        this.render(); 
    }
    
    getAdminPage() { return this.adminPage; }
    setAdminPage(page) { 
        this.adminPage = page; 
        this.render(); 
    }
    
    
    getCurrentUser() { return this.currentUser; }

    isAssignedAdmin() { return this.currentUser.role === 'assigned-admin'; }
    getAdminDepartment() { return this.currentUser.department; }
    
    // Check if any dialog is currently open
    isAnyDialogOpen() {
        return (
            this.modules.productManagement?.showAddProductDialog ||
            this.modules.productManagement?.showEditProductDialog ||
            this.modules.productManagement?.showViewProductDialog ||
            this.modules.productManagement?.showPaymentSettingsDialog ||
            this.modules.productManagement?.showDeleteConfirmDialog ||
            this.modules.adminDashboard?.showModal ||
            this.modules.orderManagement?.showOrderDetailDialog ||
            this.modules.orderManagement?.showReceiptDialog ||
            this.modules.orderManagement?.showAddEventDialog ||
            this.modules.orderManagement?.showExportDialog ||
            this.modules.departments?.showModal ||
            this.modules.merchRelease?.showVerificationDialog ||
            this.modules.communityApproval?.showModal ||
            this.modules.userVerification?.showModal ||
            false
        );
    }
    
    // Render with dialog check
    renderSafe() {
        if (!this.isAnyDialogOpen()) {
            this.render();
        }
    }
    
    // Render the entire application
    render() {
        const container = document.getElementById('app');
        if (!container) return;
        
        container.innerHTML = this.modules.pageLayout.render();
        this.attachEventListeners();
        
        // Setup event listeners for admin dashboard if it's the current page
        if (this.getViewMode() === 'admin' && this.getAdminPage() === 'dashboard') {
            setTimeout(() => {
                this.modules.adminDashboard.setupEventListeners();
            }, 0);
        }
    }
    
    attachEventListeners() {
        // Event delegation for navigation
        document.addEventListener('click', (e) => {
            // View mode toggles
            if (e.target.closest('[data-action="setViewMode"]')) {
                const btn = e.target.closest('[data-action="setViewMode"]');
                this.setViewMode(btn.dataset.mode);
            }
            
            // Admin page navigation
            if (e.target.closest('[data-action="setAdminPage"]')) {
                const btn = e.target.closest('[data-action="setAdminPage"]');
                this.setAdminPage(btn.dataset.page);
            }
            
            // Logout
            if (e.target.closest('[data-action="logout"]')) {
                if (confirm('Are you sure you want to logout?')) {
                    alert('Logged out successfully');
                }
            }
            
            // Mobile menu
            if (e.target.closest('[data-action="openMobileMenu"]')) {
                this.isMobileMenuOpen = true;
                this.modules.pageLayout.updateMobileSheet();
            }
            
            if (e.target.closest('[data-action="closeMobileMenu"]')) {
                this.isMobileMenuOpen = false;
                this.modules.pageLayout.updateMobileSheet();
            }
            
            // Metric card clicks - navigate to corresponding pages
            if (e.target.closest('[data-navigate-to]')) {
                const card = e.target.closest('[data-navigate-to]');
                const page = card.getAttribute('data-navigate-to');
                this.setAdminPage(page);
            }
        });
    }
}

// ============================================
// PAGE LAYOUT MODULE
// ============================================

class PageLayout {
    constructor(app) {
        this.app = app;
        
        this.adminPages = [
            { id: 'dashboard', label: 'Dashboard', icon: 'chart-pie' },
            { id: 'products', label: 'Product Management', icon: 'box' },
            { id: 'orders', label: 'Order Management', icon: 'shopping-bag' },
            { id: 'community', label: 'Community Approval', icon: 'check-square' },
            { id: 'release', label: 'Merch Release', icon: 'qrcode' },
            { id: 'departments', label: 'Departments', icon: 'building' },
        ];

        // this.userPages = [
        //     { id: 'catalog', label: 'Shop Merch', icon: 'store' },
        //     { id: 'cart', label: 'Shopping Cart', icon: 'shopping-cart' },
        //     { id: 'design-lab', label: 'Design Lab', icon: 'palette' },
        //     { id: 'connect', label: 'Campus Connect', icon: 'users' },
        //     { id: 'profile', label: 'My Profile', icon: 'user-circle' },
        // ];

        // Add User Verification for super admin only
        if (this.app.getCurrentUser().role !== 'assigned-admin') {
            this.adminPages.push({ id: 'verification', label: 'User Verification', icon: 'user-check' });
        }
    }

    render() {
        return `
            <div class="min-h-screen bg-gray-50">
                ${this.renderHeader()}
                
                <!-- Mobile Menu Button -->
                <div class="mobile-only">
                    <button class="mobile-menu-btn btn btn-default" data-action="openMobileMenu">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>

                <!-- Mobile Navigation Sheet -->
                <div id="mobile-sheet" class="mobile-sheet ${this.app.isMobileMenuOpen ? 'open' : ''}">
                    <div class="mobile-sheet-content">
                        <div class="mobile-sheet-header">
                            <h2>Navigation</h2>
                            <button class="close-btn" data-action="closeMobileMenu">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="mobile-sheet-body">
                            ${this.app.getViewMode() === 'admin' ? this.renderAdminNavigation() : this.renderUserNavigation()}
                        </div>
                    </div>
                </div>

                <div class="flex">
                    ${this.renderSidebar()}
                    
                    <!-- Main Content -->
                    <main class="main-content">
                        <div id="page-content" class="animate-fade-in">
                            ${this.getPageContent()}
                        </div>
                    </main>
                </div>
            </div>
        `;
    }

    renderHeader() {
        return `
            <header class="sticky-header">
                <div class="container mx-auto px-4 py-3 lg:py-4">
                    <div class="flex items-center justify-between">
                        <!-- Logo and Title -->
                        <div class="header-logo">
                            <div class="logo-icon gradient-bg">
                                <i class="fas fa-box text-yellow-300 text-lg"></i>
                            </div>
                            <div class="logo-text">
                                <h1>Campus Merch Hub</h1>
                                <p class="hidden sm:block">Your Official Campus Store</p>
                            </div>
                        </div>

                        <!-- Desktop Actions -->
                        <div class="hidden-mobile items-center gap-4">
                            <div class="text-right">
                                <p class="text-sm text-gray-600">Welcome,</p>
                                <p class="text-sm text-[#B43A4E]">${this.app.getCurrentUser().name}</p>
                            </div>


                            <button class="btn btn-ghost" data-action="logout">
                                <i class="fas fa-sign-out-alt"></i>
                                
                            </button>
                        </div>

                        <!-- Mobile Actions -->
                        <div class="flex lg:hidden items-center gap-2">


                            <button class="btn btn-ghost btn-sm" data-action="logout">
                                <i class="fas fa-sign-out-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        `;
    }

    renderSidebar() {
        if (this.app.getViewMode() === 'admin') {
            return `
                <aside class="sidebar hidden-mobile">
                    ${this.renderAdminNavigation()}
                </aside>
            `;
        } else {
            return `
                <aside class="sidebar hidden-mobile">
                    ${this.renderUserNavigation()}
                </aside>
            `;
        }
    }

    renderAdminNavigation() {
        return `
            <nav class="space-y-2">
                ${this.adminPages.map(page => {
                    const isActive = this.app.getAdminPage() === page.id;
                    return `
                        <button class="nav-item ${isActive ? 'active' : ''}" data-action="setAdminPage" data-page="${page.id}">
                            <i class="fas fa-${page.icon} icon"></i>
                            ${page.label}
                        </button>
                    `;
                }).join('')}
            </nav>
        `;
    }

    renderUserNavigation() {
        // Minimal user navigation to avoid runtime errors if user view is selected
        return `
            <nav class="space-y-2">
                <button class="nav-item" data-action="setViewMode" data-mode="user">
                    <i class="fas fa-store icon"></i>
                    Shop
                </button>
                <button class="nav-item" data-action="setViewMode" data-mode="user">
                    <i class="fas fa-shopping-cart icon"></i>
                    Cart
                </button>
                <button class="nav-item" data-action="setViewMode" data-mode="user">
                    <i class="fas fa-user icon"></i>
                    Profile
                </button>
            </nav>
        `;
    }


    getPageContent() {
        if (this.app.getViewMode() === 'admin') {
            switch(this.app.getAdminPage()) {
                case 'dashboard':
                    return this.app.modules.adminDashboard.render();
                case 'products':
                    return this.app.modules.productManagement.render();
                case 'orders':
                    return this.app.modules.orderManagement.render();
                case 'departments':
                    return this.app.modules.departments.render();
                case 'release':
                    return this.app.modules.merchRelease.render();
                case 'community':
                    return this.app.modules.communityApproval.render();
                case 'verification':
                    return this.app.modules.userVerification.render();
                default:
                    return '<div class="p-6"><h2>Page Not Found</h2></div>';
            }
        } else {
            return '<div class="p-6"><h2>User Interface Coming Soon</h2></div>';
        }
    }

    updateMobileSheet() {
        const sheet = document.getElementById('mobile-sheet');
        if (sheet) {
            if (this.app.isMobileMenuOpen) {
                sheet.classList.remove('hidden');
                sheet.classList.add('open');
            } else {
                sheet.classList.remove('open');
                setTimeout(() => {
                    sheet.classList.add('hidden');
                }, 300);
            }
        }
    }
}

// ============================================
// MOCK DATA (FIXED SYNTAX ERROR)
// ============================================

const mockData = {
    products: [
        {
            id: '1',
            name: 'University T-Shirt',
            category: 'Apparel',
            price: 25.99,
            stock: 100,
            description: 'Comfortable cotton t-shirt with university logo',
            images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
            limitedPerStudent: true,
            maxQuantityPerStudent: 2,
            isPreOrder: false,
            allowedBuyers: { type: 'all_courses' }
        },
        {
            id: '2',
            name: 'Engineering Hoodie',
            category: 'Apparel',
            price: 45.99,
            stock: 50,
            description: 'Warm hoodie for engineering students',
            images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400'],
            image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
            limitedPerStudent: false,
            isPreOrder: true,
            preOrderReleaseDate: '2024-12-01',
            allowedBuyers: { type: 'department', department: 'Engineering' }
        }
    ],
    orders: [
        { 
            id: 'ORD001', 
            userName: 'John Doe', 
            total: 1500, 
            status: 'completed',
            department: 'CAS',
            course: 'Computer Science',
            yearLevel: '3rd Year',
            event: 'Intramurals 2025',
            userType: 'student'
        },
        { 
            id: 'ORD002', 
            userName: 'Jane Smith', 
            total: 2300, 
            status: 'processing',
            department: 'CBA',
            course: 'Marketing',
            yearLevel: '4th Year',
            event: 'Foundation Week',
            userType: 'student'
        }
    ],
    eventSalesYearly: {
        "Intramurals 2025": { Jan: 3200, Feb: 4100, Mar: 3900, Apr: 4500, May: 4800, Jun: 5200 },
        "Foundation Week": { Jan: 2800, Feb: 3500, Mar: 3200, Apr: 3800, May: 4200, Jun: 4600 }
    },
    departmentHierarchy: {
        "College of Engineering": {
            total: 11050,
            courses: {
                "Computer Engineering": [
                    { level: "1st Year", sales: 1200 },
                    { level: "2nd Year", sales: 1800 },
                    { level: "3rd Year", sales: 2500 },
                    { level: "4th Year", sales: 2200 },
                    { level: "Alumni", sales: 1500 },
                    { level: "Faculty", sales: 1850 }
                ]
            }
        }
    },
    categoryData: [
        { category: "Apparel", sales: 45 },
        { category: "Accessories", sales: 30 },
        { category: "Custom", sales: 25 }
    ]
};

// ============================================
// ADMIN DASHBOARD MODULE (UPDATED WITH HOVER EFFECTS)
// ============================================

class AdminDashboard {
    constructor(app) {
        this.app = app;
        this.selectedEvent = 'Intramurals 2025';
        this.events = [
            'Intramurals 2025',
            'Foundation Week',
            'Graduation 2025',
            'Freshman Orientation',
            'Homecoming 2024',
            'All Events Overview'
        ];
        
        // Mock data for different events
        this.eventData = {
            'Intramurals 2025': {
                totalRevenue: 25430,
                totalOrders: 156,
                activeUsers: 1243,
                products: 89,
                verifications: 8,
                pendingOrders: 12,
                processingOrders: 24,
                revenueChange: '+12%',
                usersChange: '+8%'
            },
            'Foundation Week': {
                totalRevenue: 18750,
                totalOrders: 98,
                activeUsers: 845,
                products: 76,
                verifications: 5,
                pendingOrders: 8,
                processingOrders: 15,
                revenueChange: '+9%',
                usersChange: '+5%'
            },
            'Graduation 2025': {
                totalRevenue: 32500,
                totalOrders: 210,
                activeUsers: 1560,
                products: 102,
                verifications: 12,
                pendingOrders: 18,
                processingOrders: 32,
                revenueChange: '+15%',
                usersChange: '+12%'
            },
            'Freshman Orientation': {
                totalRevenue: 12900,
                totalOrders: 78,
                activeUsers: 620,
                products: 54,
                verifications: 3,
                pendingOrders: 6,
                processingOrders: 12,
                revenueChange: '+6%',
                usersChange: '+4%'
            },
            'Homecoming 2024': {
                totalRevenue: 28900,
                totalOrders: 185,
                activeUsers: 1420,
                products: 95,
                verifications: 9,
                pendingOrders: 15,
                processingOrders: 28,
                revenueChange: '+14%',
                usersChange: '+10%'
            },
            'All Events Overview': {
                totalRevenue: 118480,
                totalOrders: 727,
                activeUsers: 5688,
                products: 416,
                verifications: 37,
                pendingOrders: 59,
                processingOrders: 111,
                revenueChange: '+11%',
                usersChange: '+8%'
            }
        };
        
        // For searchable dropdown
        this.searchInput = '';
        this.filteredEvents = [...this.events];
        this.dropdownOpen = false;
    }

        render() {
        const data = this.eventData[this.selectedEvent] || this.eventData['Intramurals 2025'];
        
        return `
            <div class="admin-dashboard-container">
                <!-- Dashboard Header -->
                <div class="dashboard-header">
                    <div class="dashboard-title">
                        <h1>Admin Dashboard</h1>
                        <p>Overview for ${this.selectedEvent}</p>
                    </div>
                    <div class="event-selector">
                        <div class="searchable-dropdown">
                            <div class="flex items-center">
                                <i class="fas fa-search text-gray-400 ml-3"></i>
                                <input type="text" 
                                       placeholder="Search events..." 
                                       value="${this.searchInput}"
                                       class="w-full py-2 px-3 text-sm focus:outline-none event-search-input"
                                       id="event-search-input">
                                <button class="p-2 text-gray-400 hover:text-gray-600" onclick="app.modules.adminDashboard.toggleDropdown()">
                                    <i class="fas fa-chevron-${this.dropdownOpen ? 'up' : 'down'}"></i>
                                </button>
                            </div>
                            
                            <!-- Dropdown options -->
                            <div class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg ${this.dropdownOpen ? '' : 'hidden'}" 
                                 id="event-dropdown">
                                ${this.filteredEvents.map(event => `
                                    <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${this.selectedEvent === event ? 'bg-gray-100 font-medium' : ''}"
                                         onclick="app.modules.adminDashboard.selectEvent('${event}')">
                                        ${event}
                                    </div>
                                `).join('')}
                                ${this.filteredEvents.length === 0 ? `
                                    <div class="px-4 py-3 text-sm text-gray-500">
                                        No events found
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Metric Cards Grid - Perfect 5-column layout with hover effects -->
                <div class="metric-cards-grid">
                    <!-- Total Revenue - FIXED TO FIT CARD -->
                    <div class="metric-card admin-card hover:bg-[#fff8f9] transition-all duration-200 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                         onclick="app.setAdminPage('orders')">
                        <div class="metric-card-content">
                            <div class="metric-card-top">
                                <div class="metric-info">
                                    <span class="metric-label">Total Revenue</span>
                                    <h3 class="metric-value revenue-value">₱${data.totalRevenue.toLocaleString()}</h3>
                                    <div class="metric-change change-positive">
                                        <i class="fas fa-arrow-up"></i>
                                        ${data.revenueChange} from last month
                                    </div>
                                </div>
                                <div class="metric-icon-container icon-bg-primary">
                                    <i class="fas fa-dollar-sign metric-icon icon-primary"></i>
                                </div>
                            </div>
                            <div class="metric-card-bottom">
                                <div class="metric-navigation">
                                    <i class="fas fa-external-link-alt"></i>
                                    Click to view orders
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Total Orders -->
                    <div class="metric-card admin-card hover:bg-[#fff8f9] transition-all duration-200 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                         onclick="app.setAdminPage('orders')">
                        <div class="metric-card-content">
                            <div class="metric-card-top">
                                <div class="metric-info">
                                    <span class="metric-label">Total Orders</span>
                                    <h3 class="metric-value">${data.totalOrders}</h3>
                                    <div class="status-indicators">
                                        <span class="status-indicator status-pending">
                                            Pending: ${data.pendingOrders}
                                        </span>
                                        <span class="status-indicator status-processing">
                                            Processing: ${data.processingOrders}
                                        </span>
                                    </div>
                                </div>
                                <div class="metric-icon-container icon-bg-secondary">
                                    <i class="fas fa-shopping-bag metric-icon icon-secondary"></i>
                                </div>
                            </div>
                            <div class="metric-card-bottom">
                                <div class="metric-navigation">
                                    <i class="fas fa-external-link-alt"></i>
                                    Click to view orders
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Active Users -->
                    <div class="metric-card admin-card hover:bg-[#fff8f9] transition-all duration-200 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                         onclick="app.setAdminPage('departments')">
                        <div class="metric-card-content">
                            <div class="metric-card-top">
                                <div class="metric-info">
                                    <span class="metric-label">Active Users</span>
                                    <h3 class="metric-value">${data.activeUsers.toLocaleString()}</h3>
                                    <div class="metric-change change-positive">
                                        <i class="fas fa-arrow-up"></i>
                                        ${data.usersChange} from last month
                                    </div>
                                </div>
                                <div class="metric-icon-container icon-bg-primary">
                                    <i class="fas fa-users metric-icon icon-primary"></i>
                                </div>
                            </div>
                            <div class="metric-card-bottom">
                                <div class="metric-navigation">
                                    <i class="fas fa-external-link-alt"></i>
                                    Click to view departments
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Products -->
                    <div class="metric-card admin-card hover:bg-[#fff8f9] transition-all duration-200 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                         onclick="app.setAdminPage('products')">
                        <div class="metric-card-content">
                            <div class="metric-card-top">
                                <div class="metric-info">
                                    <span class="metric-label">Products</span>
                                    <h3 class="metric-value">${data.products}</h3>
                                    <div class="mt-2 text-xs text-gray-500">
                                        23 Pre-order items
                                    </div>
                                </div>
                                <div class="metric-icon-container icon-bg-secondary">
                                    <i class="fas fa-box metric-icon icon-secondary"></i>
                                </div>
                            </div>
                            <div class="metric-card-bottom">
                                <div class="metric-navigation">
                                    <i class="fas fa-external-link-alt"></i>
                                    Click to manage products
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Verification -->
                    <div class="metric-card admin-card hover:bg-[#fff8f9] transition-all duration-200 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                         onclick="app.setAdminPage('verification')">
                        <div class="metric-card-content">
                            <div class="metric-card-top">
                                <div class="metric-info">
                                    <span class="metric-label">Verifications</span>
                                    <h3 class="metric-value">${data.verifications}</h3>
                                    <div class="mt-2 text-xs font-medium text-amber-600">
                                        <i class="fas fa-clock mr-1"></i>
                                        Pending review
                                    </div>
                                </div>
                                <div class="metric-icon-container icon-bg-primary">
                                    <i class="fas fa-user-check metric-icon icon-primary"></i>
                                </div>
                            </div>
                            <div class="metric-card-bottom">
                                <div class="metric-navigation">
                                    <i class="fas fa-external-link-alt"></i>
                                    Click to review verifications
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="charts-grid">
                    <!-- Monthly Sales Trend -->
                    <div class="chart-container admin-card hover:border-burgundy transition-all duration-200">
                        <div class="chart-header">
                            <div>
                                <h4 class="chart-title">Monthly Sales Trend</h4>
                                <p class="chart-subtitle">${this.selectedEvent}</p>
                            </div>
                            <i class="fas fa-chart-line text-xl text-burgundy"></i>
                        </div>
                        <div class="chart-placeholder">
                            <div class="w-16 h-16 bg-gradient-to-r from-burgundy to-orange rounded-full flex items-center justify-center mx-auto mb-3">
                                <i class="fas fa-chart-line text-white text-xl"></i>
                            </div>
                            <p class="text-gray-700 font-medium mb-1">Sales Trend for ${this.selectedEvent}</p>
                            <p class="text-gray-500 text-sm">Chart visualization would appear here</p>
                            <div class="mt-4 grid grid-cols-3 gap-2 text-xs">
                                <div class="bg-gray-50 p-2 rounded">
                                    <p class="text-gray-600">Jan</p>
                                    <p class="font-semibold">₱${(data.totalRevenue * 0.08).toLocaleString()}</p>
                                </div>
                                <div class="bg-gray-50 p-2 rounded">
                                    <p class="text-gray-600">Feb</p>
                                    <p class="font-semibold">₱${(data.totalRevenue * 0.12).toLocaleString()}</p>
                                </div>
                                <div class="bg-gray-50 p-2 rounded">
                                    <p class="text-gray-600">Mar</p>
                                    <p class="font-semibold">₱${(data.totalRevenue * 0.15).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sales by Category -->
                    <div class="chart-container admin-card hover:border-orange transition-all duration-200">
                        <div class="chart-header">
                            <div>
                                <h4 class="chart-title">Sales by Category</h4>
                                <p class="chart-subtitle">${this.selectedEvent}</p>
                            </div>
                            <i class="fas fa-chart-pie text-xl text-orange"></i>
                        </div>
                        <div class="chart-placeholder">
                            <div class="w-16 h-16 bg-gradient-to-r from-orange to-burgundy rounded-full flex items-center justify-center mx-auto mb-3">
                                <i class="fas fa-chart-pie text-white text-xl"></i>
                            </div>
                            <p class="text-gray-700 font-medium mb-1">Category Breakdown</p>
                            <p class="text-gray-500 text-sm">Pie chart visualization</p>
                            <div class="mt-4 flex flex-col gap-2">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <div class="w-3 h-3 bg-burgundy rounded-full mr-2"></div>
                                        <span class="text-sm">Apparel: 45%</span>
                                    </div>
                                    <span class="text-sm font-semibold">₱${(data.totalRevenue * 0.45).toLocaleString()}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <div class="w-3 h-3 bg-orange rounded-full mr-2"></div>
                                        <span class="text-sm">Accessories: 30%</span>
                                    </div>
                                    <span class="text-sm font-semibold">₱${(data.totalRevenue * 0.30).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Department Sales Chart -->
                <div class="chart-container department-sales-chart admin-card hover:border-burgundy transition-all duration-200">
                    <div class="chart-header">
                        <div>
                            <h4 class="chart-title">Department Sales Breakdown</h4>
                            <p class="chart-subtitle">${this.selectedEvent}</p>
                        </div>
                        <i class="fas fa-university text-xl text-burgundy"></i>
                    </div>
                    <div class="chart-placeholder">
                        <div class="w-16 h-16 bg-gradient-to-r from-burgundy to-navy rounded-full flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-university text-white text-xl"></i>
                        </div>
                        <p class="text-gray-700 font-medium mb-1">Department Performance</p>
                        <p class="text-gray-500 text-sm">Bar chart visualization</p>
                        <div class="mt-4 space-y-3">
                            <div class="flex items-center justify-between">
                                <span class="text-sm">College of Engineering</span>
                                <div class="w-48 bg-gray-200 rounded-full h-2.5">
                                    <div class="bg-burgundy h-2.5 rounded-full" style="width: 85%"></div>
                                </div>
                                <span class="text-sm font-semibold ml-2">₱${(data.totalRevenue * 0.35).toLocaleString()}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-sm">College of Business Admin</span>
                                <div class="w-48 bg-gray-200 rounded-full h-2.5">
                                    <div class="bg-orange h-2.5 rounded-full" style="width: 65%"></div>
                                </div>
                                <span class="text-sm font-semibold ml-2">₱${(data.totalRevenue * 0.28).toLocaleString()}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-sm">College of Arts & Sciences</span>
                                <div class="w-48 bg-gray-200 rounded-full h-2.5">
                                    <div class="bg-navy h-2.5 rounded-full" style="width: 45%"></div>
                                </div>
                                <span class="text-sm font-semibold ml-2">₱${(data.totalRevenue * 0.22).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Add event listener method
    setupEventListeners() {
        // Setup search input event listener
        const searchInput = document.querySelector('.event-search-input');
        if (searchInput) {
            // Remove any existing listeners
            const newSearchInput = searchInput.cloneNode(true);
            searchInput.parentNode.replaceChild(newSearchInput, searchInput);
            
            // Add new listeners
            newSearchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
            
            newSearchInput.addEventListener('focus', () => {
                this.dropdownOpen = true;
                this.updateDropdown();
            });
        }
        
        // Close dropdown when clicking outside
        // Use a stored handler so we can remove the same reference later and avoid duplicates
        if (this._clickHandler) {
            document.removeEventListener('click', this._clickHandler);
        }

        this._clickHandler = (e) => {
            if (!e.target.closest('.searchable-dropdown')) {
                this.dropdownOpen = false;
                this.updateDropdown();
            }
        };

        document.addEventListener('click', this._clickHandler);
    }

    handleSearchInput(value) {
        this.searchInput = value;
        this.filteredEvents = this.events.filter(event => 
            event.toLowerCase().includes(value.toLowerCase())
        );
        this.updateDropdown();
    }

    toggleDropdown() {
        this.dropdownOpen = !this.dropdownOpen;
        this.updateDropdown();
    }

    updateDropdown() {
        const dropdown = document.getElementById('event-dropdown');
        const chevron = document.querySelector('.searchable-dropdown button i');
        
        if (dropdown) {
            if (this.dropdownOpen) {
                dropdown.classList.remove('hidden');
                if (chevron) {
                    chevron.className = 'fas fa-chevron-up';
                }
                
                // Update dropdown content
                dropdown.innerHTML = `
                    ${this.filteredEvents.map(event => `
                        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${this.selectedEvent === event ? 'bg-gray-100 font-medium' : ''}"
                             onclick="app.modules.adminDashboard.selectEvent('${event}')">
                            ${event}
                        </div>
                    `).join('')}
                    ${this.filteredEvents.length === 0 ? `
                        <div class="px-4 py-3 text-sm text-gray-500">
                            No events found
                        </div>
                    ` : ''}
                `;
            } else {
                dropdown.classList.add('hidden');
                if (chevron) {
                    chevron.className = 'fas fa-chevron-down';
                }
            }
        }
    }

    selectEvent(event) {
        this.selectedEvent = event;
        this.searchInput = '';
        this.filteredEvents = [...this.events];
        this.dropdownOpen = false;
        this.app.render(); // Only full render when event changes
    }

    changeEvent(event) {
        this.selectedEvent = event;
        this.app.render();
    }
}

// ============================================
// PRODUCT MANAGEMENT MODULE (COMPLETE WITH ALL FEATURES)
// ============================================

class ProductManagement {
    constructor(app) {
        this.app = app;
        this.products = [...mockData.products];
        this.searchTerm = '';
        this.categoryFilter = 'all';
        this.selectedProduct = null;
        this.showAddProductDialog = false;
        this.showEditProductDialog = false;
        this.showDeleteConfirmDialog = false;
        this.showPaymentSettingsDialog = false;
        this.showViewProductDialog = false;
        this.editingProductId = null; // when set, Add dialog works in Edit mode
        
        // New product form data
        this.newProduct = {
            name: '',
            category: 'Apparel',
            price: 0,
            stock: 0,
            description: '',
            images: [],
            image: '',
            limitedPerStudent: false,
            maxQuantityPerStudent: 2,
            isPreOrder: false,
            preOrderReleaseDate: '',
            allowedBuyers: {
                type: 'all_departments', // all_departments, by_department, alumni, faculty
                departments: [],
                courses: [],
                includeAlumni: true,
                includeFaculty: true
            }
        };
        
        // Departments and courses data
        this.departments = [
            {
                id: 'CAS',
                name: 'College of Arts & Sciences',
                courses: ['Psychology', 'Biology', 'Chemistry', 'Mathematics']
            },
            {
                id: 'CBA',
                name: 'College of Business Admin',
                courses: ['Marketing', 'Finance', 'Management', 'Accounting']
            },
            {
                id: 'CCS',
                name: 'College of Computer Studies',
                courses: ['Computer Science', 'Information Technology', 'Software Engineering']
            },
            {
                id: 'COE',
                name: 'College of Engineering',
                courses: ['Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering']
            }
        ];
        
        // Payment settings with fixed layout
        this.paymentSettings = {
            methods: [
                {
                    id: '1',
                    name: 'GCash',
                    enabled: true,
                    accountNumber: '09123456789',
                    accountName: 'Campus Merch Hub',
                    qrCode: '',
                    instructions: 'Send payment to this GCash number'
                },
                {
                    id: '2',
                    name: 'BPI Bank Transfer',
                    enabled: true,
                    accountNumber: '1234567890',
                    accountName: 'Campus Merch Hub',
                    qrCode: '',
                    instructions: 'Send payment to this bank account'
                },
                {
                    id: '3',
                    name: 'Cash on Delivery',
                    enabled: true,
                    instructions: 'Pay when you receive the merchandise'
                }
            ]
        };
        
        // Add new payment method form
        this.newPaymentMethod = {
            name: '',
            type: 'digital_wallet',
            accountNumber: '',
            accountName: '',
            instructions: ''
        };
    }

    render() {
        const filteredProducts = this.products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchesCategory = this.categoryFilter === 'all' || product.category === this.categoryFilter;
            return matchesSearch && matchesCategory;
        });

        return `
            <div class="product-management p-4 lg:p-6 space-y-4 lg:space-y-6 pb-20 lg:pb-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-xl lg:text-3xl">Product Management</h2>
                        <p class="text-gray-600 text-sm lg:text-base">Manage your merchandise inventory</p>
                    </div>

                    <div class="flex flex-wrap gap-2 lg:gap-3">
                        <!-- Payment Settings Button -->
                        <button class="btn btn-outline gap-2 flex-1 sm:flex-none btn-sm payment-settings-btn"
                                onclick="app.modules.productManagement.openPaymentSettings()">
                            <i class="fas fa-credit-card"></i>
                            <span class="hidden sm:inline">Payment Settings</span>
                        </button>

                        <!-- Export Button -->
                        <button class="btn btn-outline gap-2 flex-1 sm:flex-none btn-sm export-btn"
                                onclick="app.modules.productManagement.exportProducts()">
                            <i class="fas fa-download"></i>
                            <span class="hidden sm:inline">Export</span>
                        </button>

                        <!-- Add Product Button -->
                        <button class="btn btn-primary gap-2 add-product-btn"
                                onclick="app.modules.productManagement.openAddProductDialog()">
                            <i class="fas fa-plus"></i>
                            Add Product
                        </button>
                    </div>
                </div>

                <!-- Filters -->
                <div class="card p-4">
                    <div class="flex gap-4">
                        <div class="flex-1 relative">
                            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input type="text" placeholder="Search products..." class="input pl-10 search-input" 
                                   value="${this.searchTerm}"
                                   oninput="app.modules.productManagement.handleSearch(this.value)">
                        </div>
                        <select class="select category-filter w-48" 
                                onchange="app.modules.productManagement.handleCategoryFilter(this.value)">
                            <option value="all" ${this.categoryFilter === 'all' ? 'selected' : ''}>All Categories</option>
                            <option value="Apparel" ${this.categoryFilter === 'Apparel' ? 'selected' : ''}>Apparel</option>
                            <option value="Accessories" ${this.categoryFilter === 'Accessories' ? 'selected' : ''}>Accessories</option>
                            <option value="Custom" ${this.categoryFilter === 'Custom' ? 'selected' : ''}>Custom</option>
                        </select>
                    </div>
                </div>

                <!-- Product List -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${filteredProducts.length > 0 ? 
                        filteredProducts.map(product => this.renderProductCard(product)).join('') :
                        '<div class="col-span-3 text-center py-8 text-gray-500"><p>No products found</p></div>'
                    }
                </div>

                <!-- Dialogs -->
                ${this.showAddProductDialog ? this.renderAddProductDialog() : ''}
                ${this.showEditProductDialog ? this.renderEditProductDialog() : ''}
                ${this.showViewProductDialog ? this.renderViewProductDialog() : ''}
                ${this.showDeleteConfirmDialog ? this.renderDeleteConfirmDialog() : ''}
                ${this.showPaymentSettingsDialog ? this.renderPaymentSettingsDialog() : ''}
            </div>
        `;
    }

    renderProductCard(product) {
        // Get buyer restrictions text
        let buyerText = '';
        if (product.allowedBuyers) {
            switch(product.allowedBuyers.type) {
                case 'all_departments':
                    buyerText = 'All Departments';
                    break;
                case 'by_department':
                    buyerText = `${product.allowedBuyers.departments?.length || 0} Departments`;
                    break;
                case 'alumni':
                    buyerText = 'Alumni Only';
                    break;
                case 'faculty':
                    buyerText = 'Faculty Only';
                    break;
                default:
                    buyerText = 'All Users';
            }
        }

        return `
            <div class="product-card bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div class="relative">
                    <img src="${product.image}" 
                         alt="${product.name}" 
                         class="product-main-image w-full h-48 object-cover cursor-pointer"
                         onclick="app.modules.productManagement.viewProduct('${product.id}')">
                    ${product.images && product.images.length > 1 ? `
                        <div class="product-image-badge absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                            +${product.images.length - 1}
                        </div>
                    ` : ''}
                </div>
                
                <div class="p-4">
                    <h3 class="product-name text-lg font-semibold text-gray-900 mb-1 cursor-pointer hover:text-burgundy"
                        onclick="app.modules.productManagement.viewProduct('${product.id}')">
                        ${product.name}
                    </h3>
                    <p class="product-description text-gray-600 text-sm mb-3">${product.description}</p>
                    
                    <div class="product-tags flex flex-wrap gap-2 mb-4">
                        <span class="badge badge-outline">${product.category}</span>
                        ${product.isPreOrder ? `
                            <span class="badge badge-warning">Pre-Order</span>
                        ` : `
                            <span class="badge ${product.stock > 0 ? 'badge-primary' : 'badge-destructive'}">
                                ${product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
                            </span>
                        `}
                        ${product.limitedPerStudent ? `
                            <span class="badge badge-limited">Limited: ${product.maxQuantityPerStudent} per student</span>
                        ` : ''}
                        <span class="badge badge-outline text-xs">${buyerText}</span>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <p class="product-price text-xl font-bold text-burgundy">₱${product.price.toFixed(2)}</p>
                        <div class="flex gap-2">
                            <button class="btn btn-outline btn-sm view-product-btn"
                                    onclick="app.modules.productManagement.viewProduct('${product.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline btn-sm edit-product-btn"
                                    onclick="app.modules.productManagement.editProduct('${product.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline btn-sm delete-product-btn text-red-600"
                                    onclick="app.modules.productManagement.confirmDeleteProduct('${product.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

        // Update the renderAddProductDialog method to use compact spacing:

        renderAddProductDialog() {
        return `
            <div class="dialog-overlay">
                <div class="dialog-content max-w-5xl">
                    <div class="dialog-header">
                        <h2>${this.editingProductId ? 'Edit Product' : 'Add New Product'}</h2>
                        <p>${this.editingProductId ? 'Update the product details.' : 'Fill in the details for the new merchandise'}</p>
                        <button onclick="app.modules.productManagement.closeAddProductDialog()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="dialog-body">
                        <form onsubmit="event.preventDefault(); app.modules.productManagement.saveAddOrEditProduct()" id="add-product-form">
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <!-- Left Column: Basic Info & Images -->
                                <div class="space-y-4">
                                    <!-- Basic Information -->
                                    <div class="form-section">
                                        <h3 class="section-title">
                                            <i class="fas fa-box"></i>
                                            Product Details
                                        </h3>
                                        <div class="space-y-3">
                                            <div>
                                                <label class="form-label">Product Name *</label>
                                                <input type="text" 
                                                    class="form-input"
                                                    placeholder="e.g., University Hoodie"
                                                    value="${this.newProduct.name}"
                                                    oninput="app.modules.productManagement.updateNewProductField('name', this.value)"
                                                    required>
                                            </div>
                                            
                                            <div>
                                                <label class="form-label">Description *</label>
                                                <textarea class="form-input"
                                                        rows="3"
                                                        placeholder="Describe the product..."
                                                        oninput="app.modules.productManagement.updateNewProductField('description', this.value)">${this.newProduct.description}</textarea>
                                            </div>
                                            
                                            <div class="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label class="form-label">Category *</label>
                                                    <select class="form-input"
                                                            onchange="app.modules.productManagement.updateNewProductField('category', this.value)">
                                                        <option value="Apparel" ${this.newProduct.category === 'Apparel' ? 'selected' : ''}>Apparel</option>
                                                        <option value="Accessories" ${this.newProduct.category === 'Accessories' ? 'selected' : ''}>Accessories</option>
                                                        <option value="Custom" ${this.newProduct.category === 'Custom' ? 'selected' : ''}>Custom</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label class="form-label">Stock *</label>
                                                    <input type="number" 
                                                        min="0"
                                                        class="form-input"
                                                        placeholder="0"
                                                        value="${this.newProduct.stock}"
                                                        oninput="app.modules.productManagement.updateNewProductField('stock', this.value)"
                                                        required>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Product Images -->
                                    <div class="form-section">
                                        <h3 class="section-title">
                                            <i class="fas fa-images"></i>
                                            Product Images *
                                        </h3>
                                        <div class="image-upload-area"
                                            onclick="document.getElementById('product-images-input').click()">
                                            <i class="fas fa-cloud-upload-alt"></i>
                                            <p>Click or drag images here</p>
                                            <span class="text-xs">JPG, PNG up to 5MB each</span>
                                            <input type="file" 
                                                id="product-images-input"
                                                class="hidden"
                                                multiple
                                                accept="image/*"
                                                onchange="app.modules.productManagement.handleImageUpload(this.files)">
                                        </div>
                                        
                                        ${this.newProduct.images.length > 0 ? `
                                            <div class="mt-3">
                                                <div class="flex justify-between items-center mb-2">
                                                    <p class="text-sm font-medium">Uploaded Images</p>
                                                    <span class="text-xs text-gray-500">Drag to reorder</span>
                                                </div>
                                                <div class="image-preview-grid">
                                                    ${this.newProduct.images.map((img, index) => `
                                                        <div class="image-preview-item" data-index="${index}">
                                                            <img src="${img}" class="preview-image">
                                                            <div class="image-actions">
                                                                <button type="button" class="btn-remove"
                                                                        onclick="app.modules.productManagement.removeImage(${index})">
                                                                    <i class="fas fa-trash"></i>
                                                                </button>
                                                                ${index === 0 ? `
                                                                    <span class="badge-main">Main</span>
                                                                ` : `
                                                                    <button type="button" class="btn-set-main"
                                                                            onclick="app.modules.productManagement.setAsMainImage(${index})">
                                                                        Set Main
                                                                    </button>
                                                                `}
                                                            </div>
                                                            <span class="image-number">${index + 1}</span>
                                                        </div>
                                                    `).join('')}
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                                
                                <!-- Right Column: Pricing & Settings -->
                                <div class="space-y-4">
                                    <!-- Pricing -->
                                    <div class="form-section">
                                        <h3 class="section-title">
                                            <i class="fas fa-money-bill"></i>
                                            Pricing
                                        </h3>
                                        <div class="relative">
                                            <label class="form-label">Price (₱) *</label>
                                            <div class="price-input-group">
                                                <div class="price-prefix">
                                                    <i class="fas fa-peso-sign"></i>
                                                </div>
                                                <input type="number" 
                                                    step="0.01"
                                                    min="0"
                                                    class="form-input price-input"
                                                    placeholder="0.00"
                                                    value="${this.newProduct.price}"
                                                    oninput="app.modules.productManagement.updateNewProductField('price', this.value)"
                                                    required>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Pre-order Setting -->
                                    <div class="form-section">
                                        <h3 class="section-title">
                                            <i class="fas fa-calendar-alt"></i>
                                            Pre-order
                                        </h3>
                                        <div class="space-y-3">
                                            <div class="flex items-center justify-between">
                                                <div>
                                                    <p class="font-medium">Enable Pre-order</p>
                                                    <p class="text-xs text-gray-500">Allow customers to order before release</p>
                                                </div>
                                                <label class="toggle-switch">
                                                    <input type="checkbox" 
                                                        ${this.newProduct.isPreOrder ? 'checked' : ''}
                                                        onchange="app.modules.productManagement.togglePreOrder(this.checked)">
                                                    <span class="toggle-slider"></span>
                                                </label>
                                            </div>
                                            
                                            <div id="preorder-release-row" class="mt-2 ${this.newProduct.isPreOrder ? '' : 'hidden'}">
                                                <label class="form-label">Release Date *</label>
                                                <input type="date" 
                                                    id="preorder-release-input"
                                                    class="form-input"
                                                    value="${this.newProduct.preOrderReleaseDate}"
                                                    oninput="app.modules.productManagement.updateNewProductField('preOrderReleaseDate', this.value)"
                                                    ${this.newProduct.isPreOrder ? 'required' : ''}>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Purchase Limit -->
                                    <div class="form-section">
                                        <h3 class="section-title">
                                            <i class="fas fa-lock"></i>
                                            Purchase Limit
                                        </h3>
                                        <div class="space-y-3">
                                            <div class="flex items-center justify-between">
                                                <div>
                                                    <p class="font-medium">Limit per Student</p>
                                                    <p class="text-xs text-gray-500">Set maximum quantity per student</p>
                                                </div>
                                                <label class="toggle-switch">
                                                    <input type="checkbox" 
                                                        ${this.newProduct.limitedPerStudent ? 'checked' : ''}
                                                        onchange="app.modules.productManagement.togglePurchaseLimit(this.checked)">
                                                    <span class="toggle-slider"></span>
                                                </label>
                                            </div>
                                            
                                            <div id="max-qty-row" class="mt-2 ${this.newProduct.limitedPerStudent ? '' : 'hidden'}">
                                                <label class="form-label">Max Quantity per Student</label>
                                                <div class="flex items-center gap-2">
                                                    <button type="button" 
                                                            class="quantity-btn"
                                                            onclick="app.modules.productManagement.adjustMaxQuantity(-1)">
                                                        <i class="fas fa-minus"></i>
                                                    </button>
                                                    <input type="number" 
                                                        id="max-qty-input"
                                                        min="1"
                                                        class="form-input text-center"
                                                        value="${this.newProduct.maxQuantityPerStudent}"
                                                        oninput="app.modules.productManagement.updateNewProductField('maxQuantityPerStudent', this.value)">
                                                    <button type="button" 
                                                            class="quantity-btn"
                                                            onclick="app.modules.productManagement.adjustMaxQuantity(1)">
                                                        <i class="fas fa-plus"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Fixed Who Can Buy Section -->
                                    <div class="form-section">
                                        <h3 class="section-title">
                                            <i class="fas fa-users"></i>
                                            Who Can Buy *
                                        </h3>
                                        <div class="space-y-2">
                                            <!-- All Departments -->
                                            <label class="buyer-option ${this.newProduct.allowedBuyers.type === 'all_departments' ? 'selected' : ''}">
                                                <input type="radio" 
                                                    name="allowedBuyersType" 
                                                    value="all_departments"
                                                    ${this.newProduct.allowedBuyers.type === 'all_departments' ? 'checked' : ''}
                                                    onchange="app.modules.productManagement.handleAllowedBuyersChange('all_departments')">
                                                <div class="option-content">
                                                    <div class="option-icon">
                                                        <i class="fas fa-globe"></i>
                                                    </div>
                                                    <div class="option-text">
                                                        <span class="option-title">All Departments</span>
                                                        <span class="option-description">Available to all students</span>
                                                    </div>
                                                </div>
                                            </label>
                                            
                                            <!-- By Department -->
                                            <label class="buyer-option ${this.newProduct.allowedBuyers.type === 'by_department' ? 'selected' : ''}">
                                                <input type="radio" 
                                                    name="allowedBuyersType" 
                                                    value="by_department"
                                                    ${this.newProduct.allowedBuyers.type === 'by_department' ? 'checked' : ''}
                                                    onchange="app.modules.productManagement.handleAllowedBuyersChange('by_department')">
                                                <div class="option-content">
                                                    <div class="option-icon">
                                                        <i class="fas fa-university"></i>
                                                    </div>
                                                    <div class="option-text">
                                                        <span class="option-title">Specific Departments</span>
                                                        <span class="option-description">Select specific departments</span>
                                                    </div>
                                                </div>
                                            </label>
                                            
                                            <div id="department-selection-section" class="department-selection-section ${this.newProduct.allowedBuyers.type === 'by_department' ? '' : 'hidden'}">
                                                <div class="mb-3">
                                                    <label class="form-label">Department *</label>
                                                    <select id="department-select" class="form-input"
                                                            onchange="app.modules.productManagement.handleDepartmentSelect(this.value)">
                                                        <option value="">Select department</option>
                                                        ${this.departments.map(dept => `
                                                            <option value="${dept.id}" ${this.newProduct.allowedBuyers.departments.includes(dept.id) ? 'selected' : ''}>
                                                                ${dept.name}
                                                            </option>
                                                        `).join('')}
                                                    </select>
                                                </div>

                                                <div id="courses-selection" class="${this.newProduct.allowedBuyers.departments.length > 0 ? '' : 'hidden'}">
                                                    <label class="form-label">Courses (Optional)</label>
                                                    <div class="courses-selection-list">
                                                        ${this.getDepartmentCourses(this.newProduct.allowedBuyers.departments[0]).map(course => `
                                                            <label class="course-option">
                                                                <input type="checkbox" 
                                                                    value="${course}"
                                                                    ${this.newProduct.allowedBuyers.courses.includes(course) ? 'checked' : ''}
                                                                    onchange="app.modules.productManagement.handleCourseCheckbox('${course}', this.checked)">
                                                                <span class="course-label">${course}</span>
                                                            </label>
                                                        `).join('')}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <!-- Alumni Only -->
                                            <label class="buyer-option ${this.newProduct.allowedBuyers.type === 'alumni' ? 'selected' : ''}">
                                                <input type="radio" 
                                                    name="allowedBuyersType" 
                                                    value="alumni"
                                                    ${this.newProduct.allowedBuyers.type === 'alumni' ? 'checked' : ''}
                                                    onchange="app.modules.productManagement.handleAllowedBuyersChange('alumni')">
                                                <div class="option-content">
                                                    <div class="option-icon">
                                                        <i class="fas fa-graduation-cap"></i>
                                                    </div>
                                                    <div class="option-text">
                                                        <span class="option-title">Alumni Only</span>
                                                        <span class="option-description">For alumni members only</span>
                                                    </div>
                                                </div>
                                            </label>
                                            
                                            <!-- Faculty Only -->
                                            <label class="buyer-option ${this.newProduct.allowedBuyers.type === 'faculty' ? 'selected' : ''}">
                                                <input type="radio" 
                                                    name="allowedBuyersType" 
                                                    value="faculty"
                                                    ${this.newProduct.allowedBuyers.type === 'faculty' ? 'checked' : ''}
                                                    onchange="app.modules.productManagement.handleAllowedBuyersChange('faculty')">
                                                <div class="option-content">
                                                    <div class="option-icon">
                                                        <i class="fas fa-chalkboard-teacher"></i>
                                                    </div>
                                                    <div class="option-text">
                                                        <span class="option-title">Faculty Only</span>
                                                        <span class="option-description">For faculty members only</span>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <!-- Dialog Footer -->
                    <div class="dialog-footer">
                        <div class="text-xs text-gray-500">
                            <i class="fas fa-asterisk text-red-500"></i>
                            Required fields
                        </div>
                        <div class="flex gap-3">
                            <button type="button"
                                    class="btn btn-outline"
                                    onclick="app.modules.productManagement.closeAddProductDialog()">
                                Cancel
                            </button>
                            ${this.editingProductId ? `
                                <button type="submit" form="add-product-form" class="btn btn-primary" ${!this.isFormValid() ? 'disabled' : ''}>
                                    <i class="fas fa-save mr-2"></i>
                                    Save Changes
                                </button>
                            ` : `
                                <button type="submit" form="add-product-form" class="btn btn-primary" ${!this.isFormValid() ? 'disabled' : ''}>
                                    <i class="fas fa-plus mr-2"></i>
                                    Add Product
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Add these methods to ProductManagement class:

    handleAllowedBuyersChange(type) {
        this.newProduct.allowedBuyers.type = type;
        
        // Reset department/course selections if not "by_department"
        if (type !== 'by_department') {
            this.newProduct.allowedBuyers.departments = [];
            this.newProduct.allowedBuyers.courses = [];
        }
        // Update visibility of department selection (no full re-render)
        try {
            const deptSection = document.getElementById('department-selection-section');
            if (deptSection) deptSection.classList.toggle('hidden', type !== 'by_department');

            const coursesSection = document.getElementById('courses-selection');
            if (coursesSection) coursesSection.classList.toggle('hidden', true);

            const deptSelect = document.getElementById('department-select');
            if (deptSelect) deptSelect.value = '';
        } catch (err) {
            // ignore DOM errors when dialog not mounted
        }
        // Update visual 'selected' class for buyer-option labels in Add dialog
        try {
            document.querySelectorAll('[name="allowedBuyersType"]').forEach(inp => {
                const lbl = inp.closest('label');
                if (lbl) lbl.classList.toggle('selected', inp.value === type && inp.checked);
            });
        } catch (err) {}
    }

    handleDepartmentSelect(deptId) {
        if (deptId && this.newProduct.allowedBuyers.type === 'by_department') {
            // Allow multiple departments if needed, but for now single selection
            this.newProduct.allowedBuyers.departments = [deptId];
            this.newProduct.allowedBuyers.courses = []; // Reset courses when department changes
        } else if (!deptId) {
            this.newProduct.allowedBuyers.departments = [];
            this.newProduct.allowedBuyers.courses = [];
        }

        // Update courses list & visibility without a full re-render
        try {
            const coursesSection = document.getElementById('courses-selection');
            if (!coursesSection) return;
            const dept = this.newProduct.allowedBuyers.departments[0];
            if (!dept) {
                coursesSection.classList.add('hidden');
                const listEmpty = coursesSection.querySelector('.courses-selection-list');
                if (listEmpty) listEmpty.innerHTML = '';
                return;
            }

            const courses = this.getDepartmentCourses(dept) || [];
            coursesSection.classList.toggle('hidden', courses.length === 0);
            const html = courses.map(course => `
                <label class="course-option">
                    <input type="checkbox" 
                        value="${course}"
                        ${this.newProduct.allowedBuyers.courses.includes(course) ? 'checked' : ''}
                        onchange="app.modules.productManagement.handleCourseCheckbox('${course}', this.checked)">
                    <span class="course-label">${course}</span>
                </label>
            `).join('');
            const list = coursesSection.querySelector('.courses-selection-list');
            if (list) list.innerHTML = html;
        } catch (err) {
            // ignore DOM errors when dialog not mounted
        }
    }

    handleCourseCheckbox(course, isChecked) {
        if (this.newProduct.allowedBuyers.type === 'by_department') {
            if (isChecked) {
                if (!this.newProduct.allowedBuyers.courses.includes(course)) {
                    this.newProduct.allowedBuyers.courses.push(course);
                }
            } else {
                const index = this.newProduct.allowedBuyers.courses.indexOf(course);
                if (index > -1) {
                    this.newProduct.allowedBuyers.courses.splice(index, 1);
                }
            }
        }
        
        // No need to re-render here as checkbox state is handled by browser
        // But we can re-render if there are visual changes needed
    }

    // Add this helper method for form validation
    isFormValid() {
        const basicValid = this.newProduct.name && 
                        this.newProduct.description && 
                        this.newProduct.price > 0 && 
                        this.newProduct.stock >= 0 && 
                        this.newProduct.images.length > 0;
        
        // Check pre-order validation
        const preOrderValid = !this.newProduct.isPreOrder || this.newProduct.preOrderReleaseDate;
        
        // Check who can buy validation
        let whoCanBuyValid = true;
        if (this.newProduct.allowedBuyers.type === 'by_department') {
            whoCanBuyValid = this.newProduct.allowedBuyers.departments.length > 0;
        }
        
        return basicValid && preOrderValid && whoCanBuyValid;
    }

        // Add these methods to ProductManagement class:
        togglePreOrder(checked) {
            this.newProduct.isPreOrder = checked;
            if (checked && !this.newProduct.preOrderReleaseDate) {
                // Set default to tomorrow
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                this.newProduct.preOrderReleaseDate = tomorrow.toISOString().split('T')[0];
            }
            // Toggle the release date row visibility without re-render
            try {
                const row = document.getElementById('preorder-release-row');
                if (row) row.classList.toggle('hidden', !checked);
                const input = document.getElementById('preorder-release-input');
                if (input) input.value = this.newProduct.preOrderReleaseDate || '';
            } catch (err) {
                // ignore when dialog not present
            }
        }

        togglePurchaseLimit(checked) {
            this.newProduct.limitedPerStudent = checked;
            if (checked && !this.newProduct.maxQuantityPerStudent) {
                this.newProduct.maxQuantityPerStudent = 2;
            }
            // Toggle max quantity input visibility without full re-render
            try {
                const row = document.getElementById('max-qty-row');
                if (row) row.classList.toggle('hidden', !checked);
                const input = document.getElementById('max-qty-input');
                if (input) input.value = this.newProduct.maxQuantityPerStudent;
            } catch (err) {
                // ignore when dialog not present
            }
        }

        adjustMaxQuantity(change) {
            const newValue = parseInt(this.newProduct.maxQuantityPerStudent) + change;
            if (newValue >= 1) {
                this.newProduct.maxQuantityPerStudent = newValue;
                // Update input in-place if present
                try {
                    const input = document.getElementById('max-qty-input');
                    if (input) input.value = this.newProduct.maxQuantityPerStudent;
                } catch (err) {}
            }
        }

        setAsMainImage(index) {
            if (index > 0 && this.newProduct.images[index]) {
                const images = [...this.newProduct.images];
                const [movedImage] = images.splice(index, 1);
                images.unshift(movedImage);
                this.newProduct.images = images;
                this.newProduct.image = movedImage;
                // Avoid re-render; the image order will be saved when the user submits
            }
        }

        isFormValid() {
            return this.newProduct.name && 
                this.newProduct.description && 
                this.newProduct.price > 0 && 
                this.newProduct.stock >= 0 && 
                this.newProduct.images.length > 0 &&
                (!this.newProduct.isPreOrder || this.newProduct.preOrderReleaseDate);
        }

        // Add these new methods to the ProductManagement class:

        // togglePreOrder(checked) {
        //     this.newProduct.isPreOrder = checked;
        //     if (checked && !this.newProduct.preOrderReleaseDate) {
        //         // Set default release date to 7 days from now
        //         const date = new Date();
        //         date.setDate(date.getDate() + 7);
        //         this.newProduct.preOrderReleaseDate = date.toISOString().split('T')[0];
        //     }
        //     this.app.render();
        // }

        // togglePurchaseLimit(checked) {
        //     this.newProduct.limitedPerStudent = checked;
        //     if (checked && !this.newProduct.maxQuantityPerStudent) {
        //         this.newProduct.maxQuantityPerStudent = 2;
        //     }
        //     this.app.render();
        // }

        // adjustMaxQuantity(change) {
        //     const newValue = parseInt(this.newProduct.maxQuantityPerStudent) + change;
        //     if (newValue >= 1) {
        //         this.newProduct.maxQuantityPerStudent = newValue;
        //         this.app.render();
        //     }
        // }

        // setAsMainImage(index) {
        //     if (index > 0) {
        //         const images = [...this.newProduct.images];
        //         const mainImage = images.splice(index, 1)[0];
        //         images.unshift(mainImage);
        //         this.newProduct.images = images;
        //         this.newProduct.image = mainImage;
        //         this.app.render();
        //     }
        // }

        // Drag and drop functionality for image reordering
        handleDragStart(e) {
            e.dataTransfer.setData('text/plain', e.target.dataset.index);
            e.target.classList.add('dragging');
        }

        handleDragOver(e) {
            e.preventDefault();
            e.currentTarget.classList.add('drag-over');
        }

        handleDrop(e) {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = parseInt(e.currentTarget.dataset.index);
            
            if (fromIndex !== toIndex) {
                const images = [...this.newProduct.images];
                const [movedImage] = images.splice(fromIndex, 1);
                images.splice(toIndex, 0, movedImage);
                this.newProduct.images = images;
                if (fromIndex === 0 || toIndex === 0) {
                    this.newProduct.image = images[0];
                }
                this.app.render();
            }
            
            e.currentTarget.classList.remove('drag-over');
        }

        handleDragEnd(e) {
            e.target.classList.remove('dragging');
            document.querySelectorAll('.image-preview-item').forEach(item => {
                item.classList.remove('drag-over');
            });
        }

        isFormValid() {
            return this.newProduct.name && 
                this.newProduct.description && 
                this.newProduct.price > 0 && 
                this.newProduct.stock >= 0 && 
                this.newProduct.images.length > 0 &&
                (!this.newProduct.isPreOrder || this.newProduct.preOrderReleaseDate);
        }

    // Add this helper method to get allowed buyers text
    getAllowedBuyersText() {
        switch(this.newProduct.allowedBuyers.type) {
            case 'all_departments':
                return 'All Departments';
            case 'by_department':
                return this.newProduct.allowedBuyers.departments.length > 0 
                    ? 'Selected Departments'
                    : 'No department selected';
            case 'alumni':
                return 'Alumni Only';
            case 'faculty':
                return 'Faculty Only';
            default:
                return 'All Users';
        }
    }
    
    // Return products filtered by current search and category settings
    getFilteredProducts() {
        return this.products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchesCategory = this.categoryFilter === 'all' || product.category === this.categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }
    

    renderViewProductDialog() {
        if (!this.selectedProduct) return '';
        const product = this.selectedProduct;
        
        // Get buyer restrictions text
        let buyerText = '';
        if (product.allowedBuyers) {
            switch(product.allowedBuyers.type) {
                case 'all_departments':
                    buyerText = 'Available to all departments';
                    break;
                case 'by_department':
                    buyerText = `Available to ${product.allowedBuyers.departments?.join(', ')} departments`;
                    if (product.allowedBuyers.courses?.length > 0) {
                        buyerText += ` (Courses: ${product.allowedBuyers.courses.join(', ')})`;
                    }
                    break;
                case 'alumni':
                    buyerText = 'Available to alumni only';
                    break;
                case 'faculty':
                    buyerText = 'Available to faculty only';
                    break;
                default:
                    buyerText = 'Available to all users';
            }
        }

        return `
            <div class="dialog-overlay">
                <div class="dialog-content max-w-5xl">
                    <div class="dialog-header">
                        <h2>${product.name}</h2>
                        <p>Product Details</p>
                        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                                onclick="app.modules.productManagement.closeViewProductDialog()">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="dialog-body">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <!-- Product Images Gallery -->
                            <div>
                                <div class="mb-4">
                                    <div class="relative">
                                        <img src="${product.image}" 
                                             alt="${product.name}" 
                                             class="w-full h-64 object-cover rounded-lg shadow-sm"
                                             id="main-product-image">
                                        ${product.images && product.images.length > 1 ? `
                                            <div class="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                                1/${product.images.length}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                                
                                <!-- Thumbnail Gallery -->
                                ${product.images && product.images.length > 1 ? `
                                    <div class="grid grid-cols-4 gap-2">
                                        ${product.images.map((img, index) => `
                                            <img src="${img}" 
                                                 class="w-full h-20 object-cover rounded border cursor-pointer hover:border-burgundy transition-colors ${index === 0 ? 'border-2 border-burgundy' : 'border-gray-200'}"
                                                 onclick="app.modules.productManagement.changeMainImage('${img}', ${index})">
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                            
                            <!-- Product Details -->
                            <div class="space-y-6">
                                <div>
                                    <h3 class="text-2xl font-bold text-burgundy mb-2">₱${product.price.toFixed(2)}</h3>
                                    <div class="flex items-center gap-2 flex-wrap mb-4">
                                        <span class="badge badge-outline">${product.category}</span>
                                        ${product.isPreOrder ? `
                                            <span class="badge badge-warning">Pre-Order</span>
                                        ` : `
                                            <span class="badge ${product.stock > 0 ? 'badge-primary' : 'badge-destructive'}">
                                                ${product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
                                            </span>
                                        `}
                                        ${product.limitedPerStudent ? `
                                            <span class="badge badge-limited">Limited: ${product.maxQuantityPerStudent} per student</span>
                                        ` : ''}
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 class="text-sm font-medium text-gray-700 mb-1">Description</h4>
                                    <p class="text-gray-600">${product.description}</p>
                                </div>
                                
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 class="text-sm font-medium text-gray-700 mb-1">Status</h4>
                                        <p class="text-gray-600">${product.stock > 0 ? 'Available' : 'Out of Stock'}</p>
                                    </div>
                                    <div>
                                        <h4 class="text-sm font-medium text-gray-700 mb-1">Purchase Limit</h4>
                                        <p class="text-gray-600">${product.limitedPerStudent ? `${product.maxQuantityPerStudent} per student` : 'No limit'}</p>
                                    </div>
                                    <div>
                                        <h4 class="text-sm font-medium text-gray-700 mb-1">Availability</h4>
                                        <p class="text-gray-600">${buyerText}</p>
                                    </div>
                                </div>
                                
                                ${product.isPreOrder ? `
                                    <div>
                                        <h4 class="text-sm font-medium text-gray-700 mb-1">Pre-order Release Date</h4>
                                        <p class="text-gray-600">${product.preOrderReleaseDate}</p>
                                    </div>
                                ` : ''}
                                
                                <div class="pt-6 border-t">
                                    <div class="flex gap-3">
                                        <button class="btn btn-outline flex-1 gap-2"
                                                onclick="app.modules.productManagement.editProduct('${product.id}')">
                                            <i class="fas fa-edit"></i>
                                            Edit Product
                                        </button>
                                        <button class="btn btn-destructive flex-1 gap-2"
                                                onclick="app.modules.productManagement.confirmDeleteProduct('${product.id}')">
                                            <i class="fas fa-trash"></i>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderEditProductDialog() {
        if (!this.selectedProduct) return '';
        const product = this.selectedProduct;
        
        const selectedDeptId = product.allowedBuyers?.departments?.[0] || '';
        const selectedCourses = product.allowedBuyers?.courses || [];
        
        return `
            <div class="dialog-overlay">
                <div class="dialog-content max-w-4xl">
                    <div class="dialog-header">
                        <h2>Edit Product</h2>
                        <p>Update product details</p>
                        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                                onclick="app.modules.productManagement.closeEditProductDialog()">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="dialog-body">
                        <form onsubmit="event.preventDefault(); app.modules.productManagement.saveEditedProduct()">
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <!-- Left Column: Basic Information -->
                                <div class="space-y-4">
                                    <!-- Product Name -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                        <input type="text" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                                               value="${product.name}"
                                               oninput="app.modules.productManagement.updateProductField('name', this.value)"
                                               required>
                                    </div>
                                    
                                    <!-- Category and Price -->
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                            <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                                                    onchange="app.modules.productManagement.updateProductField('category', this.value)">
                                                <option value="Apparel" ${product.category === 'Apparel' ? 'selected' : ''}>Apparel</option>
                                                <option value="Accessories" ${product.category === 'Accessories' ? 'selected' : ''}>Accessories</option>
                                                <option value="Custom" ${product.category === 'Custom' ? 'selected' : ''}>Custom</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Price (₱) *</label>
                                            <input type="number" 
                                                   step="0.01"
                                                   min="0"
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                                                   value="${product.price}"
                                                   oninput="app.modules.productManagement.updateProductField('price', this.value)"
                                                   required>
                                        </div>
                                    </div>
                                    
                                    <!-- Stock and Pre-order -->
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                                            <input type="number" 
                                                   min="0"
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                                                   value="${product.stock}"
                                                   oninput="app.modules.productManagement.updateProductField('stock', this.value)"
                                                   required>
                                        </div>
                                        <div>
                                            <label class="flex items-center space-x-2">
                                                <input type="checkbox" 
                                                       class="rounded border-gray-300 text-burgundy focus:ring-burgundy"
                                                       ${product.isPreOrder ? 'checked' : ''}
                                                       onchange="app.modules.productManagement.updateProductField('isPreOrder', this.checked)">
                                                <span class="text-sm font-medium text-gray-700">Pre-order Item</span>
                                            </label>
                                            <div id="edit-preorder-release-row" class="mt-2 ${product.isPreOrder ? '' : 'hidden'}">
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Release Date</label>
                                                <input id="edit-preorder-release-input" type="date" 
                                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                                                       value="${product.preOrderReleaseDate || ''}"
                                                       oninput="app.modules.productManagement.updateProductField('preOrderReleaseDate', this.value)">
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Description -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                        <textarea class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                                                  rows="3"
                                                  oninput="app.modules.productManagement.updateProductField('description', this.value)">${product.description}</textarea>
                                    </div>
                                    
                                    <!-- Limited Purchase -->
                                    <div>
                                        <label class="flex items-center space-x-2">
                                            <input type="checkbox" 
                                                   class="rounded border-gray-300 text-burgundy focus:ring-burgundy"
                                                   ${product.limitedPerStudent ? 'checked' : ''}
                                                   onchange="app.modules.productManagement.updateProductField('limitedPerStudent', this.checked)">
                                            <span class="text-sm font-medium text-gray-700">Limit purchase per student</span>
                                        </label>
                                        <div id="edit-max-qty-row" class="mt-2 ${product.limitedPerStudent ? '' : 'hidden'}">
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Max Quantity per Student</label>
                                            <input id="edit-max-qty-input" type="number" 
                                                   min="1"
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                                                   value="${product.maxQuantityPerStudent}"
                                                   oninput="app.modules.productManagement.updateProductField('maxQuantityPerStudent', this.value)">
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Right Column: Who Can Buy -->
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Who Can Buy *</label>
                                        <div class="space-y-3">
                                            <!-- All Departments -->
                                            <label class="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input type="radio" 
                                                       name="editAllowedBuyers" 
                                                       value="all_departments"
                                                       class="mt-1 text-burgundy focus:ring-burgundy"
                                                       ${product.allowedBuyers?.type === 'all_departments' ? 'checked' : ''}
                                                       onchange="app.modules.productManagement.updateProductAllowedBuyers('type', 'all_departments')">
                                                <div class="flex-1">
                                                    <span class="font-medium text-gray-900">All Departments</span>
                                                    <p class="text-sm text-gray-500 mt-1">Available to all students from any department</p>
                                                </div>
                                            </label>
                                            
                                            <!-- By Department -->
                                            <label class="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input type="radio" 
                                                       name="editAllowedBuyers" 
                                                       value="by_department"
                                                       class="mt-1 text-burgundy focus:ring-burgundy"
                                                       ${product.allowedBuyers?.type === 'by_department' ? 'checked' : ''}
                                                       onchange="app.modules.productManagement.updateProductAllowedBuyers('type', 'by_department')">
                                                <div class="flex-1">
                                                    <span class="font-medium text-gray-900">By Department & Course</span>
                                                    <p class="text-sm text-gray-500 mt-1">Select specific departments and courses</p>
                                                    
                                                    ${product.allowedBuyers?.type === 'by_department' ? `
                                                        <div id="edit-department-section" class="mt-2 space-y-2">
                                                            <select id="edit-department-select" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                                    onchange="app.modules.productManagement.handleEditDepartmentSelect(this.value)">
                                                                <option value="">Select Department</option>
                                                                ${this.departments.map(dept => `
                                                                    <option value="${dept.id}" ${selectedDeptId === dept.id ? 'selected' : ''}>${dept.name}</option>
                                                                `).join('')}
                                                            </select>

                                                            <div id="edit-courses-selection" class="${selectedDeptId ? '' : 'hidden'}">
                                                                <p class="text-sm font-medium text-gray-700 mb-1">Select Courses:</p>
                                                                <div class="space-y-1 edit-courses-list">
                                                                    ${this.getDepartmentCourses(selectedDeptId).map(course => `
                                                                        <label class="flex items-center space-x-2">
                                                                            <input type="checkbox" 
                                                                                   value="${course}"
                                                                                   class="rounded border-gray-300 text-burgundy focus:ring-burgundy"
                                                                                   ${selectedCourses.includes(course) ? 'checked' : ''}
                                                                                   onchange="app.modules.productManagement.handleEditCourseSelect('${course}', this.checked)">
                                                                            <span class="text-sm">${course}</span>
                                                                        </label>
                                                                    `).join('')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ` : ''}
                                                </div>
                                            </label>
                                            
                                            <!-- Alumni Only -->
                                            <label class="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input type="radio" 
                                                       name="editAllowedBuyers" 
                                                       value="alumni"
                                                       class="mt-1 text-burgundy focus:ring-burgundy"
                                                       ${product.allowedBuyers?.type === 'alumni' ? 'checked' : ''}
                                                       onchange="app.modules.productManagement.updateProductAllowedBuyers('type', 'alumni')">
                                                <div class="flex-1">
                                                    <span class="font-medium text-gray-900">Alumni Only</span>
                                                    <p class="text-sm text-gray-500 mt-1">Available only to alumni members</p>
                                                </div>
                                            </label>
                                            
                                            <!-- Faculty Only -->
                                            <label class="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input type="radio" 
                                                       name="editAllowedBuyers" 
                                                       value="faculty"
                                                       class="mt-1 text-burgundy focus:ring-burgundy"
                                                       ${product.allowedBuyers?.type === 'faculty' ? 'checked' : ''}
                                                       onchange="app.modules.productManagement.updateProductAllowedBuyers('type', 'faculty')">
                                                <div class="flex-1">
                                                    <span class="font-medium text-gray-900">Faculty Only</span>
                                                    <p class="text-sm text-gray-500 mt-1">Available only to faculty members</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Form Actions -->
                            <div class="flex justify-end gap-3 pt-6 border-t mt-6">
                                <button type="button"
                                        class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                        onclick="app.modules.productManagement.closeEditProductDialog()">
                                    Cancel
                                </button>
                                <button type="submit"
                                        class="px-6 py-2 bg-burgundy text-white rounded-md hover:bg-burgundy/90 transition-colors shadow-sm">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    // In the ProductManagement class, update the renderPaymentSettingsDialog method:

    renderPaymentSettingsDialog() {
        return `
            <div class="dialog-overlay">
                <div class="dialog-content max-w-3xl" style="height: 85vh; display: flex; flex-direction: column;">
                    <div class="dialog-header" style="flex-shrink: 0;">
                        <h2>Payment Settings</h2>
                        <p>Manage payment methods for customers</p>
                        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                                onclick="app.modules.productManagement.closePaymentSettingsDialog()">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="dialog-body" style="flex: 1; overflow-y: auto; padding: 1.5rem;">
                        <div class="space-y-6">
                            <!-- Current Payment Methods -->
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                                <div class="space-y-4 add-payment-method-form" id="payment-methods-list">
                                    ${this.paymentSettings.methods.map(method => `
                                        <div class="payment-method-card border border-gray-200 rounded-lg p-4 hover:border-burgundy transition-colors">
                                            <div class="flex items-center justify-between mb-3">
                                                <div class="flex items-center gap-3">
                                                    <div class="w-10 h-10 rounded-lg ${method.name.includes('GCash') ? 'bg-green-100' : method.name.includes('BPI') ? 'bg-blue-100' : 'bg-yellow-100'} flex items-center justify-center">
                                                        <i class="fas ${method.name.includes('GCash') ? 'fa-mobile-alt text-green-600' : method.name.includes('BPI') ? 'fa-university text-blue-600' : 'fa-money-bill-wave text-yellow-600'}"></i>
                                                    </div>
                                                    <div>
                                                        <h4 class="font-semibold text-gray-900">${method.name}</h4>
                                                        <p class="text-sm text-gray-500">${method.instructions}</p>
                                                    </div>
                                                </div>
                                                <div class="flex items-center gap-3">
                                                    <!-- Active Button with Indicator -->
                                                    <div class="flex flex-col items-center">
                                                        <span class="text-xs ${method.enabled ? 'text-green-600' : 'text-gray-400'} mb-1">
                                                            ${method.enabled ? 'Active' : 'Inactive'}
                                                        </span>
                                                        <label class="switch">
                                                            <input type="checkbox" 
                                                                ${method.enabled ? 'checked' : ''}
                                                                onchange="app.modules.productManagement.togglePaymentMethod('${method.id}', this.checked)">
                                                            <span class="switch-slider"></span>
                                                        </label>
                                                    </div>
                                                    <button class="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                                                            onclick="app.modules.productManagement.removePaymentMethod('${method.id}')">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            ${method.accountNumber ? `
                                                <div class="bg-gray-50 rounded p-3">
                                                    <div class="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <p class="text-xs text-gray-500">Account Number</p>
                                                            <p class="font-medium">${method.accountNumber}</p>
                                                        </div>
                                                        <div>
                                                            <p class="text-xs text-gray-500">Account Name</p>
                                                            <p class="font-medium">${method.accountName}</p>
                                                        </div>
                                                    </div>
                                                    ${method.qrCode ? `
                                                        <div class="mt-3">
                                                            <p class="text-xs text-gray-500 mb-2">QR Code</p>
                                                            <div class="flex items-center gap-3">
                                                                <img src="${method.qrCode}" class="w-24 h-24 border rounded">
                                                                <button class="text-red-600 text-sm px-3 py-1 rounded border border-red-200 hover:bg-red-50"
                                                                        onclick="app.modules.productManagement.removeQrCode('${method.id}')">
                                                                    Remove QR
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ` : `
                                                        <div class="mt-3">
                                                            <label class="block">
                                                                <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-burgundy hover:bg-gray-50 transition-colors">
                                                                    <i class="fas fa-upload text-gray-400 mb-2"></i>
                                                                    <p class="text-sm text-gray-600">Upload QR Code</p>
                                                                    <p class="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                                                                    <input type="file" 
                                                                        class="hidden"
                                                                        accept="image/*"
                                                                        onchange="app.modules.productManagement.uploadMethodQrCode('${method.id}', this.files)">
                                                                </div>
                                                            </label>
                                                        </div>
                                                    `}
                                                </div>
                                            ` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <!-- Add New Payment Method -->
                            <div class="border-t pt-6 add-payment-method">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">Add New Payment Method</h3>
                                <div class="space-y-4 add-payment-method-form">
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Method Name *</label>
                                            <input type="text" 
                                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                                                placeholder="e.g., PayMaya, BDO"
                                                value="${this.newPaymentMethod.name}"
                                                oninput="app.modules.productManagement.updateNewPaymentField('name', this.value)">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                                            <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                                                    onchange="app.modules.productManagement.updateNewPaymentField('type', this.value)">
                                                <option value="digital_wallet">Digital Wallet</option>
                                                <option value="bank_transfer">Bank Transfer</option>
                                                <option value="cash">Cash</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    ${this.newPaymentMethod.type !== 'cash' ? `
                                        <div class="grid grid-cols-2 gap-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                                <input type="text" 
                                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                                                    placeholder="e.g., 09123456789"
                                                    value="${this.newPaymentMethod.accountNumber}"
                                                    oninput="app.modules.productManagement.updateNewPaymentField('accountNumber', this.value)">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                                                <input type="text" 
                                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                                                    placeholder="e.g., Campus Merch Hub"
                                                    value="${this.newPaymentMethod.accountName}"
                                                    oninput="app.modules.productManagement.updateNewPaymentField('accountName', this.value)">
                                            </div>
                                        </div>
                                    ` : ''}
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Instructions *</label>
                                        <textarea class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                                                rows="2"
                                                placeholder="Payment instructions for customers"
                                                oninput="app.modules.productManagement.updateNewPaymentField('instructions', this.value)">${this.newPaymentMethod.instructions}</textarea>
                                    </div>
                                    
                                
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Dialog Actions -->
                    

                    <div class="border-t p-4 flex justify-between items-center" style="flex-shrink: 0;">
    
                        <!-- LEFT SIDE: Close -->
                        <button class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                                onclick="app.modules.productManagement.closePaymentSettingsDialog()">
                            Close
                        </button>

                        <!-- RIGHT SIDE: Add Payment Method -->
                        <button class="px-4 py-2 bg-burgundy text-white rounded-md hover:bg-burgundy/90 transition-colors font-medium"
                                onclick="app.modules.productManagement.addPaymentMethod()">
                            <i class="fas fa-plus mr-2"></i>
                            Add Payment Method
                        </button>

                    </div>

                </div>
            </div>
        `;
    }

    renderDeleteConfirmDialog() {
        if (!this.selectedProduct) return '';
        const product = this.selectedProduct;
        
        return `
            <div class="dialog-overlay">
                <div class="dialog-content max-w-md">
                    <div class="dialog-header">
                        <h2>Delete Product</h2>
                        <p>Are you sure you want to delete this product?</p>
                        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                                onclick="app.modules.productManagement.closeDeleteConfirmDialog()">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="dialog-body">
                        <div class="text-center p-4">
                            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">${product.name}</h3>
                            <p class="text-gray-600 mb-4">This action cannot be undone. All product data will be permanently deleted.</p>
                            
                            <div class="flex justify-center gap-3">
                                <button class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                        onclick="app.modules.productManagement.closeDeleteConfirmDialog()">
                                    Cancel
                                </button>
                                <button class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        onclick="app.modules.productManagement.deleteProduct()">
                                    Delete Product
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== HELPER METHODS =====
    
    getDepartmentCourses(deptId) {
        const dept = this.departments.find(d => d.id === deptId);
        return dept ? dept.courses : [];
    }

    // ===== EVENT HANDLERS =====
    
    handleSearch(value) {
        this.searchTerm = value;
        this.app.render();
    }

    handleCategoryFilter(value) {
        this.categoryFilter = value;
        this.app.render();
    }

    // Product CRUD Operations
    openAddProductDialog() {
        this.showAddProductDialog = true;
        this.newProduct = {
            name: '',
            category: 'Apparel',
            price: 0,
            stock: 0,
            description: '',
            images: [],
            image: '',
            limitedPerStudent: false,
            maxQuantityPerStudent: 2,
            isPreOrder: false,
            preOrderReleaseDate: '',
            allowedBuyers: {
                type: 'all_departments',
                departments: [],
                courses: [],
                includeAlumni: true,
                includeFaculty: true
            }
        };
        this.editingProductId = null;
        this.app.render();
        // focus first input after render
        setTimeout(() => {
            const el = document.querySelector('#add-product-form .form-input');
            if (el) el.focus();
        }, 20);
    }

    closeAddProductDialog() {
        this.showAddProductDialog = false;
        this.editingProductId = null;
        this.app.render();
    }

    updateNewProductField(field, value) {
        this.newProduct[field] = value;
    }

    updateAllowedBuyers(field, value) {
        if (field === 'type') {
            this.newProduct.allowedBuyers.type = value;
            if (value === 'by_department') {
                this.newProduct.allowedBuyers.departments = [];
                this.newProduct.allowedBuyers.courses = [];
            }
        }
    }

    handleDepartmentSelect(deptId) {
        if (deptId && !this.newProduct.allowedBuyers.departments.includes(deptId)) {
            this.newProduct.allowedBuyers.departments = [deptId];
            this.newProduct.allowedBuyers.courses = [];
        }
    }

    handleCourseSelect(course, checked) {
        if (checked) {
            this.newProduct.allowedBuyers.courses.push(course);
        } else {
            const index = this.newProduct.allowedBuyers.courses.indexOf(course);
            if (index > -1) {
                this.newProduct.allowedBuyers.courses.splice(index, 1);
            }
        }
    }

    handleImageUpload(files) {
        // Validate file types and sizes
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        const validFiles = Array.from(files).filter(file => {
            return validTypes.includes(file.type) && file.size <= maxSize;
        });
        
        if (validFiles.length === 0) {
            this.showToast('Please upload valid images (JPG, PNG, GIF up to 5MB)', 'error');
            return;
        }
        
        // Show loading state
        this.isUploading = true;
        // Do not trigger a full re-render here to avoid dialog DOM refresh/focus loss.
        // We'll render once uploads complete below.
        
        // Process files with progress
        validFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onloadstart = () => {
                // Could show individual progress here
            };
            reader.onload = (e) => {
                this.newProduct.images.push(e.target.result);
                if (!this.newProduct.image) {
                    this.newProduct.image = e.target.result;
                }
                
                if (index === validFiles.length - 1) {
                    this.isUploading = false;
                    this.showToast(`${validFiles.length} image(s) uploaded successfully`, 'success');
                    this.app.render();
                }
            };
            reader.onerror = () => {
                this.showToast(`Failed to upload ${file.name}`, 'error');
            };
            reader.readAsDataURL(file);
        });
    }

    removeImage(index) {
        this.newProduct.images.splice(index, 1);
        if (index === 0 && this.newProduct.images.length > 0) {
            this.newProduct.image = this.newProduct.images[0];
        }
    }

    saveNewProduct() {
        // Validate required fields
        if (!this.newProduct.name || !this.newProduct.price || !this.newProduct.stock || !this.newProduct.description) {
            alert('Please fill in all required fields');
            return;
        }
        
        if (this.newProduct.images.length === 0) {
            alert('Please upload at least one product image');
            return;
        }

        // Add new product to the list
        const newProduct = {
            ...this.newProduct,
            id: 'PROD' + Date.now(),
            price: parseFloat(this.newProduct.price),
            stock: parseInt(this.newProduct.stock),
            images: [...this.newProduct.images]
        };
        
        this.products.push(newProduct);
        this.showAddProductDialog = false;
        this.showToast('Product added successfully!', 'success');
        this.app.render();
    }

    // Unified save for Add or Edit (when editingProductId is set)
    saveAddOrEditProduct() {
        // Validate required fields
        if (!this.newProduct.name || !this.newProduct.price || !this.newProduct.stock || !this.newProduct.description) {
            alert('Please fill in all required fields');
            return;
        }

        if (this.newProduct.images.length === 0) {
            alert('Please upload at least one product image');
            return;
        }

        if (this.editingProductId) {
            // Update existing product
            const idx = this.products.findIndex(p => p.id === this.editingProductId);
            if (idx !== -1) {
                const updated = {
                    ...this.products[idx],
                    ...this.newProduct,
                    price: parseFloat(this.newProduct.price),
                    stock: parseInt(this.newProduct.stock, 10),
                    images: [...this.newProduct.images]
                };
                this.products[idx] = updated;
                this.showToast('Product updated successfully!', 'success');
            }
        } else {
            // Add new product
            const newProduct = {
                ...this.newProduct,
                id: 'PROD' + Date.now(),
                price: parseFloat(this.newProduct.price),
                stock: parseInt(this.newProduct.stock, 10),
                images: [...this.newProduct.images]
            };
            this.products.push(newProduct);
            this.showToast('Product added successfully!', 'success');
        }

        // Clear edit state and close dialog
        this.editingProductId = null;
        this.showAddProductDialog = false;
        this.app.render();
    }

    viewProduct(productId) {
        this.selectedProduct = this.products.find(p => p.id === productId);
        this.showViewProductDialog = true;
        this.app.render();
    }

    closeViewProductDialog() {
        this.showViewProductDialog = false;
        this.selectedProduct = null;
        this.app.render();
    }

    changeMainImage(imgUrl, index) {
        if (this.selectedProduct) {
            // Update the view's main image directly to avoid full re-render
            this.selectedProduct.image = imgUrl;
            const mainEl = document.getElementById('main-product-image');
            if (mainEl) mainEl.src = imgUrl;
            // Update internal images order (non-destructive) but avoid re-render
            try {
                const images = [...this.selectedProduct.images];
                images.splice(index, 1);
                images.unshift(imgUrl);
                this.selectedProduct.images = images;
            } catch (err) {
                // ignore ordering error
            }
        }
    }

    editProduct(productId) {
        // Reuse the Add Product dialog for editing: populate newProduct and open Add dialog in edit mode
        const prod = this.products.find(p => p.id === productId);
        if (!prod) return;
        this.selectedProduct = prod;
        // Clone product into newProduct shape
        this.newProduct = JSON.parse(JSON.stringify(prod));
        if (!this.newProduct.allowedBuyers) {
            this.newProduct.allowedBuyers = {
                type: 'all_departments',
                departments: [],
                courses: [],
                includeAlumni: true,
                includeFaculty: true
            };
        }
        this.editingProductId = productId;
        this.showViewProductDialog = false;
        this.showEditProductDialog = false;
        this.showAddProductDialog = true;
        this.app.render();
        setTimeout(() => {
            const el = document.querySelector('#add-product-form .form-input');
            if (el) el.focus();
        }, 20);
    }

    closeEditProductDialog() {
        this.showEditProductDialog = false;
        this.selectedProduct = null;
        this.app.render();
    }

    updateProductField(field, value) {
        if (this.selectedProduct) {
            this.selectedProduct[field] = value;
            // Avoid full re-render on edit input changes. Update dependent DOM if present.
            try {
                if (field === 'isPreOrder') {
                    const row = document.getElementById('edit-preorder-release-row');
                    if (row) row.classList.toggle('hidden', !value);
                    const input = document.getElementById('edit-preorder-release-input');
                    if (input) input.value = this.selectedProduct.preOrderReleaseDate || '';
                }

                if (field === 'preOrderReleaseDate') {
                    const input = document.getElementById('edit-preorder-release-input');
                    if (input) input.value = value;
                }

                if (field === 'limitedPerStudent') {
                    const row = document.getElementById('edit-max-qty-row');
                    if (row) row.classList.toggle('hidden', !value);
                }

                if (field === 'maxQuantityPerStudent') {
                    const input = document.getElementById('edit-max-qty-input');
                    if (input) input.value = value;
                }
            } catch (err) {
                // ignore when dialog not mounted
            }
        }
    }

    updateProductAllowedBuyers(field, value) {
        if (this.selectedProduct) {
            if (!this.selectedProduct.allowedBuyers) {
                this.selectedProduct.allowedBuyers = {
                    type: 'all_departments',
                    departments: [],
                    courses: [],
                    includeAlumni: true,
                    includeFaculty: true
                };
            }
            
            if (field === 'type') {
                this.selectedProduct.allowedBuyers.type = value;
                if (value === 'by_department') {
                    this.selectedProduct.allowedBuyers.departments = [];
                    this.selectedProduct.allowedBuyers.courses = [];
                }
            }

            // Update edit dialog DOM visibility for department section
            try {
                const deptSection = document.getElementById('edit-department-section');
                if (deptSection) deptSection.classList.toggle('hidden', value !== 'by_department');

                const coursesSection = document.getElementById('edit-courses-selection');
                if (coursesSection) coursesSection.classList.add('hidden');

                const deptSelect = document.getElementById('edit-department-select');
                if (deptSelect) deptSelect.value = '';
            } catch (err) {
                // ignore when dialog not mounted
            }

            // Update visual 'selected' class for edit buyer labels
            try {
                document.querySelectorAll('[name="editAllowedBuyers"]').forEach(inp => {
                    const lbl = inp.closest('label');
                    if (lbl) lbl.classList.toggle('selected', inp.value === value && inp.checked);
                });
            } catch (err) {}
        }
    }

    handleEditDepartmentSelect(deptId) {
        if (this.selectedProduct && this.selectedProduct.allowedBuyers) {
            if (deptId && !this.selectedProduct.allowedBuyers.departments.includes(deptId)) {
                this.selectedProduct.allowedBuyers.departments = [deptId];
                this.selectedProduct.allowedBuyers.courses = [];
            }
            // Update courses list in edit dialog without full re-render
            try {
                const coursesSection = document.getElementById('edit-courses-selection');
                const list = coursesSection ? coursesSection.querySelector('.edit-courses-list') : null;
                const dept = this.selectedProduct.allowedBuyers.departments[0];
                if (!coursesSection || !list) return;
                if (!dept) {
                    coursesSection.classList.add('hidden');
                    list.innerHTML = '';
                    return;
                }
                const courses = this.getDepartmentCourses(dept) || [];
                coursesSection.classList.toggle('hidden', courses.length === 0);
                const html = courses.map(course => `
                    <label class="flex items-center space-x-2">
                        <input type="checkbox" 
                               value="${course}"
                               class="rounded border-gray-300 text-burgundy focus:ring-burgundy"
                               ${this.selectedProduct.allowedBuyers.courses.includes(course) ? 'checked' : ''}
                               onchange="app.modules.productManagement.handleEditCourseSelect('${course}', this.checked)">
                        <span class="text-sm">${course}</span>
                    </label>
                `).join('');
                list.innerHTML = html;
            } catch (err) {
                // ignore DOM errors when dialog not mounted
            }
        }
    }

    handleEditCourseSelect(course, checked) {
        if (this.selectedProduct && this.selectedProduct.allowedBuyers) {
            if (checked) {
                this.selectedProduct.allowedBuyers.courses.push(course);
            } else {
                const index = this.selectedProduct.allowedBuyers.courses.indexOf(course);
                if (index > -1) {
                    this.selectedProduct.allowedBuyers.courses.splice(index, 1);
                }
            }
            // No full re-render — checkbox state is already updated by the browser
        }
    }

    saveEditedProduct() {
        // Validate required fields
        if (!this.selectedProduct.name || !this.selectedProduct.price || !this.selectedProduct.stock || !this.selectedProduct.description) {
            alert('Please fill in all required fields');
            return;
        }

        // Update product in the list
        const index = this.products.findIndex(p => p.id === this.selectedProduct.id);
        if (index !== -1) {
            this.products[index] = { ...this.selectedProduct };
            this.showEditProductDialog = false;
            this.selectedProduct = null;
            this.showToast('Product updated successfully!', 'success');
            this.app.render();
        }
    }

    confirmDeleteProduct(productId) {
        this.selectedProduct = this.products.find(p => p.id === productId);
        this.showDeleteConfirmDialog = true;
        this.app.render();
    }

    closeDeleteConfirmDialog() {
        this.showDeleteConfirmDialog = false;
        this.selectedProduct = null;
        this.app.render();
    }

    deleteProduct() {
        const index = this.products.findIndex(p => p.id === this.selectedProduct.id);
        if (index !== -1) {
            this.products.splice(index, 1);
            this.showDeleteConfirmDialog = false;
            this.selectedProduct = null;
            this.showToast('Product deleted successfully!', 'success');
            this.app.render();
        }
    }

    // Payment Settings
    openPaymentSettings() {
        this.showPaymentSettingsDialog = true;
        this.newPaymentMethod = {
            name: '',
            type: 'digital_wallet',
            accountNumber: '',
            accountName: '',
            instructions: ''
        };
        this.app.render();
    }

    closePaymentSettingsDialog() {
        this.showPaymentSettingsDialog = false;
        this.app.render();
    }

    updateNewPaymentField(field, value) {
        this.newPaymentMethod[field] = value;

    }

    addPaymentMethod() {
        if (!this.newPaymentMethod.name || !this.newPaymentMethod.instructions) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        const newMethod = {
            ...this.newPaymentMethod,
            id: 'PM' + Date.now(),
            enabled: true,
            qrCode: ''
        };

        this.paymentSettings.methods.push(newMethod);
        
        // Reset form
        this.newPaymentMethod = {
            name: '',
            type: 'digital_wallet',
            accountNumber: '',
            accountName: '',
            instructions: ''
        };
        
        this.showToast('Payment method added successfully!', 'success');
        this.app.render();
    }

    // Add this method to the ProductManagement class to handle payment method toggling:

    togglePaymentMethod(methodId, enabled) {
        const method = this.paymentSettings.methods.find(m => m.id === methodId);
        if (method) {
            method.enabled = enabled;
            this.showToast(`Payment method ${method.name} ${enabled ? 'activated' : 'deactivated'}`, 'success');
            this.app.render();
        }
    }

    // Add this method to the ProductManagement class for better button feedback:

    addPaymentMethod() {
        if (!this.newPaymentMethod.name || !this.newPaymentMethod.instructions) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        const newMethod = {
            ...this.newPaymentMethod,
            id: 'PM' + Date.now(),
            enabled: true,
            qrCode: ''
        };

        this.paymentSettings.methods.push(newMethod);
        
        // Reset form
        this.newPaymentMethod = {
            name: '',
            type: 'digital_wallet',
            accountNumber: '',
            accountName: '',
            instructions: ''
        };
        
        this.showToast('Payment method added successfully!', 'success');
        this.app.render();
    }

    // Add this method to the CampusMerchHub class for global button handling:

    attachEventListeners() {
        // ... existing code ...

        // Add button click feedback
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn:not(:disabled)')) {
                const btn = e.target.closest('.btn');
                btn.classList.add('active');
                setTimeout(() => {
                    btn.classList.remove('active');
                }, 150);
            }
        });
    }

    removePaymentMethod(methodId) {
        if (confirm('Are you sure you want to remove this payment method?')) {
            const index = this.paymentSettings.methods.findIndex(m => m.id === methodId);
            if (index !== -1) {
                this.paymentSettings.methods.splice(index, 1);
                this.showToast('Payment method removed!', 'success');
                this.app.render();
            }
        }
    }

    uploadMethodQrCode(methodId, files) {
        if (files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const method = this.paymentSettings.methods.find(m => m.id === methodId);
                if (method) {
                    method.qrCode = e.target.result;
                    this.showToast('QR code uploaded!', 'success');
                    this.app.render();
                }
            };
            reader.readAsDataURL(files[0]);
        }
    }

    removeQrCode(methodId) {
        const method = this.paymentSettings.methods.find(m => m.id === methodId);
        if (method) {
            method.qrCode = '';
            this.showToast('QR code removed!', 'success');
            this.app.render();
        }
    }

    // Export functionality
    exportProducts() {
        const productsToExport = this.getFilteredProducts();
        
        // Show format selection
        const format = prompt('Select export format: CSV or JSON', 'CSV');
        
        if (!format) return;
        
        if (format.toUpperCase() === 'CSV') {
            this.exportToCSV(productsToExport);
        } else if (format.toUpperCase() === 'JSON') {
            this.exportToJSON(productsToExport);
        } else {
            this.showToast('Invalid format selected', 'error');
        }
    }

    exportToCSV(products) {
        const headers = ['ID', 'Name', 'Category', 'Price', 'Stock', 'Description', 'Status', 'Created'];
        
        const csvRows = [
            headers.join(','),
            ...products.map(product => [
                product.id,
                `"${product.name.replace(/"/g, '""')}"`,
                product.category,
                product.price,
                product.stock,
                `"${product.description.replace(/"/g, '""')}"`,
                product.isPreOrder ? 'Pre-order' : (product.stock > 0 ? 'In Stock' : 'Out of Stock'),
                new Date().toISOString().split('T')[0]
            ].join(','))
        ];
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        this.downloadFile(blob, `products_${new Date().toISOString().split('T')[0]}.csv`);
    }

    exportToJSON(products) {
        const jsonContent = JSON.stringify(products, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        this.downloadFile(blob, `products_${new Date().toISOString().split('T')[0]}.json`);
    }

    downloadFile(blob, filename) {
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showToast(`Exported ${filename} successfully`, 'success');
    }

    // Toast notification
    showToast(message, type = 'success') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-slide-in`;
        toast.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// ============================================
// ORDER MANAGEMENT MODULE (FINAL VERSION - UPDATED)
// ============================================

class OrderManagement {
    constructor(app) {
        this.app = app;
        this.orders = [...mockData.orders];
        this.searchTerm = '';
        this.statusFilter = 'all';
        this.eventFilter = 'all';
        this.departmentFilter = 'all';
        this.viewMode = 'categorized';
        
        // Events data with date (no status)
        this.events = [
            { 
                id: '1',
                name: 'Intramurals 2025', 
                description: 'University-wide event',
                startDate: '2025-03-15'
            },
            { 
                id: '2',
                name: 'Foundation Week', 
                description: 'Campus anniversary celebration',
                startDate: '2025-04-10'
            },
            { 
                id: '3',
                name: 'Graduation 2025', 
                description: 'Graduation ceremony',
                startDate: '2025-05-25'
            },
            { 
                id: '4',
                name: 'Freshman Orientation', 
                description: 'New student orientation',
                startDate: '2025-06-15'
            }
        ];
        
        // Add more mock orders with student numbers
        this.orders.push(
            { 
                id: 'ORD003', 
                userName: 'Mike Johnson', 
                studentNumber: '2021-00123',
                total: 1800, 
                status: 'pending',
                department: 'College of Engineering',
                course: 'Computer Engineering',
                yearLevel: '2nd Year',
                event: 'Intramurals 2025',
                userType: 'student',
                paymentMethod: 'Cash',
                referenceNumber: '',
                referencePhoto: ''
            },
            { 
                id: 'ORD004', 
                userName: 'Sarah Williams', 
                studentNumber: '2020-00456',
                total: 3200, 
                status: 'pending',
                department: 'College of Arts & Sciences',
                course: 'Biology',
                yearLevel: '3rd Year',
                event: 'Foundation Week',
                userType: 'student',
                paymentMethod: 'GCash',
                referenceNumber: 'GC-789123456',
                referencePhoto: 'receipt_ord004.jpg'
            },
            { 
                id: 'ORD005', 
                userName: 'Robert Chen', 
                studentNumber: '2019-00789',
                total: 1500, 
                status: 'processing',
                department: 'College of Business Admin',
                course: 'Accounting',
                yearLevel: '4th Year',
                event: 'Graduation 2025',
                userType: 'student',
                paymentMethod: 'Bank Transfer',
                referenceNumber: 'BPI-2025-001234',
                referencePhoto: 'bank_receipt_ord005.jpg'
            },
            { 
                id: 'ORD006', 
                userName: 'Emily Davis', 
                studentNumber: '2022-00234',
                total: 2500, 
                status: 'completed',
                department: 'College of Engineering',
                course: 'Electrical Engineering',
                yearLevel: '1st Year',
                event: 'Intramurals 2025',
                userType: 'student',
                paymentMethod: 'Cash',
                referenceNumber: '',
                referencePhoto: ''
            },
            { 
                id: 'ORD007', 
                userName: 'Professor James Wilson', 
                studentNumber: '', // Faculty no student number
                total: 3500, 
                status: 'pending',
                department: 'College of Arts & Sciences',
                course: 'Faculty Purchase',
                yearLevel: 'Faculty',
                event: 'Foundation Week',
                userType: 'faculty',
                paymentMethod: 'Credit Card',
                referenceNumber: 'CC-4567-8901-2345',
                referencePhoto: 'creditcard_receipt_ord007.jpg'
            },
            { 
                id: 'ORD008', 
                userName: 'John Smith', 
                studentNumber: '2019-00987',
                total: 2200, 
                status: 'completed',
                department: 'College of Computer Studies',
                course: 'Computer Science',
                yearLevel: '4th Year',
                event: 'General Event',
                userType: 'student',
                paymentMethod: 'PayMaya',
                referenceNumber: 'PM-2025-567890',
                referencePhoto: 'paymaya_receipt_ord008.jpg'
            },
            { 
                id: 'ORD009', 
                userName: 'Lisa Garcia', 
                studentNumber: '2020-00567',
                total: 1800, 
                status: 'pending',
                department: 'College of Engineering',
                course: 'Mechanical Engineering',
                yearLevel: '3rd Year',
                event: 'Intramurals 2025',
                userType: 'student',
                paymentMethod: 'GCash',
                referenceNumber: 'GC-987654321',
                referencePhoto: 'gcash_receipt_ord009.jpg'
            }
        );
        
        // Add student number to existing mock data orders
        this.orders.forEach((order, index) => {
            if (!order.studentNumber && order.userType === 'student') {
                order.studentNumber = `202${Math.floor(Math.random() * 5)}-00${index + 100}`;
            }
        });
        
        // New event form (no status field)
        this.newEvent = {
            name: '',
            description: '',
            startDate: ''
        };
        
        // UI state
        this.openAddEvent = false;
        this.selectedOrder = null;
        this.showOrderDetailDialog = false;
        this.showReceiptDialog = false;
        this.expandedEvents = {};
        
        // Export selection
        this.selectedForExport = {};
        this.selectAllForExport = false;
        this.showExportDialog = false;
        this.exportFormat = 'csv';
        this.exportEventFilter = 'all';
    }

    render() {
        const filteredOrders = this.getFilteredOrders();
        const groupedOrders = this.groupOrdersByEvent(filteredOrders);

        return `
            <div class="product-management p-4 lg:p-6 space-y-4 pb-20 lg:pb-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 class="text-xl lg:text-3xl">Order Management</h2>
                        <p class="text-gray-600 text-sm lg:text-base">Track and manage customer orders</p>
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <!-- View Mode Selector -->
                        <select class="select w-40 bg-white border-gray-300 text-sm py-1" 
                                onchange="app.modules.orderManagement.handleViewModeChange(event)">
                            <option value="categorized" ${this.viewMode === 'categorized' ? 'selected' : ''}>Categorized View</option>
                            <option value="table" ${this.viewMode === 'table' ? 'selected' : ''}>Table View</option>
                        </select>

                        <!-- Add Event Button -->
                        <button class="btn btn-outline gap-1 flex-1 sm:flex-none btn-sm py-1"
                                onclick="app.modules.orderManagement.openAddEventDialog()">
                            <i class="fas fa-plus"></i>
                            <span class="hidden sm:inline">Add Event</span>
                        </button>

                        <!-- Export Report Button -->
                        <button class="btn btn-primary gap-1 flex-1 sm:flex-none btn-sm py-1"
                                onclick="app.modules.orderManagement.openExportDialog()">
                            <i class="fas fa-download"></i>
                            <span class="hidden sm:inline">Export</span>
                        </button>
                    </div>
                </div>

                <!-- Filters -->
                <div class="card p-3">
                    <div class="flex flex-col sm:flex-row gap-3">
                        <div class="flex-1 relative">
                            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                            <input type="text" 
                                   placeholder="Search by Order ID, Customer, or Student Number..." 
                                   class="input pl-9 w-full py-1 text-sm"
                                   value="${this.searchTerm}"
                                   oninput="app.modules.orderManagement.handleSearch(event)">
                        </div>
                        
                        <select class="select w-36 bg-white border-gray-300 py-1 text-sm" 
                                onchange="app.modules.orderManagement.handleStatusFilter(event)">
                            <option value="all" ${this.statusFilter === 'all' ? 'selected' : ''}>All Status</option>
                            <option value="pending" ${this.statusFilter === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="processing" ${this.statusFilter === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="completed" ${this.statusFilter === 'completed' ? 'selected' : ''}>Completed</option>
                        </select>
                        
                        <!-- Event Dropdown -->
                        <select class="select w-40 bg-white border-gray-300 py-1 text-sm" 
                                onchange="app.modules.orderManagement.handleEventFilter(event)">
                            <option value="all" ${this.eventFilter === 'all' ? 'selected' : ''}>All Events</option>
                            ${this.events.map(event => `
                                <option value="${event.name}" ${this.eventFilter === event.name ? 'selected' : ''}>
                                    ${event.name}
                                </option>
                            `).join('')}
                            <option value="General Event" ${this.eventFilter === 'General Event' ? 'selected' : ''}>General Event</option>
                        </select>
                        
                        <!-- Department Dropdown -->
                        <select class="select w-44 bg-white border-gray-300 py-1 text-sm" 
                                onchange="app.modules.orderManagement.handleDepartmentFilter(event)">
                            <option value="all" ${this.departmentFilter === 'all' ? 'selected' : ''}>All Departments</option>
                            <option value="College of Arts & Sciences" ${this.departmentFilter === 'College of Arts & Sciences' ? 'selected' : ''}>College of Arts & Sciences</option>
                            <option value="College of Business Admin" ${this.departmentFilter === 'College of Business Admin' ? 'selected' : ''}>College of Business Admin</option>
                            <option value="College of Computer Studies" ${this.departmentFilter === 'College of Computer Studies' ? 'selected' : ''}>College of Computer Studies</option>
                            <option value="College of Engineering" ${this.departmentFilter === 'College of Engineering' ? 'selected' : ''}>College of Engineering</option>
                        </select>
                    </div>
                </div>

                <!-- Content Area -->
                <div id="order-content">
                    ${this.viewMode === 'categorized' ? 
                        this.renderCategorizedView(filteredOrders, groupedOrders) : 
                        this.renderTableView(filteredOrders)
                    }
                </div>

                <!-- Add Event Dialog -->
                ${this.openAddEvent ? this.renderAddEventDialog() : ''}
                
                <!-- Export Dialog -->
                ${this.showExportDialog ? this.renderExportDialog(filteredOrders) : ''}
                
                <!-- Order Detail Dialog -->
                ${this.showOrderDetailDialog && this.selectedOrder ? this.renderOrderDetailDialog() : ''}
                
                <!-- Receipt Dialog -->
                ${this.showReceiptDialog && this.selectedOrder ? this.renderReceiptDialog() : ''}
            </div>
        `;
    }

    getFilteredOrders() {
        return this.orders.filter(order => {
            const matchesSearch = 
                order.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                order.userName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                (order.studentNumber && order.studentNumber.toLowerCase().includes(this.searchTerm.toLowerCase()));
            
            const matchesStatus = this.statusFilter === 'all' || order.status === this.statusFilter;
            
            const matchesEvent = this.eventFilter === 'all' || 
                                (order.event || 'General Event') === this.eventFilter;
            
            const matchesDepartment = this.departmentFilter === 'all' || order.department === this.departmentFilter;
            
            // Department filtering for assigned admins
            let matchesAdminDepartment = true;
            if (this.app.isAssignedAdmin() && this.app.getAdminDepartment()) {
                matchesAdminDepartment = order.department === this.app.getAdminDepartment();
            }
            
            return matchesSearch && matchesStatus && matchesEvent && matchesDepartment && matchesAdminDepartment;
        });
    }

    groupOrdersByEvent(orders) {
        const grouped = {};
        
        orders.forEach(order => {
            const event = order.event || 'General Event';
            if (!grouped[event]) {
                grouped[event] = [];
            }
            grouped[event].push(order);
        });

        return grouped;
    }

    renderCategorizedView(filteredOrders, groupedOrders) {
        if (Object.keys(groupedOrders).length === 0) {
            return `
                <div class="text-center py-6 text-gray-500">
                    <i class="fas fa-clipboard-list text-xl mb-2 text-gray-300"></i>
                    <p>No orders found</p>
                </div>
            `;
        }

        // Get all events including General Event
        const allEvents = [...this.events.map(e => e.name), 'General Event'];
        
        return allEvents.map(eventName => {
            const orders = groupedOrders[eventName] || [];
            
            if (orders.length === 0 && !this.expandedEvents[eventName]) {
                return '';
            }

            const total = orders.length;
            const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);
            const pending = orders.filter(o => o.status === 'pending').length;
            const processing = orders.filter(o => o.status === 'processing').length;
            const completed = orders.filter(o => o.status === 'completed').length;
            const isExpanded = this.expandedEvents[eventName];
            
            // Get event details if it's a defined event
            const eventDetails = this.events.find(e => e.name === eventName);

            return `
                <div class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow mb-3">
                    <!-- Event Header -->
                    <div class="p-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                         onclick="app.modules.orderManagement.toggleEventExpansion('${eventName}')">
                        <div class="flex flex-col w-full text-left">
                            <div class="flex items-center justify-between">
                                <h3 class="text-base font-semibold text-gray-900">${eventName}</h3>
                                <div class="flex items-center gap-2">
                                    <span class="badge badge-secondary text-xs">${total} orders</span>
                                    <i class="fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-400 text-sm"></i>
                                </div>
                            </div>
                            <div class="flex flex-wrap gap-3 mt-1 text-xs text-gray-600">
                                <span>Total: <span class="font-medium text-gray-800">₱${totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></span>
                                ${pending > 0 ? `<span>Pending: <span class="font-medium text-amber-600">${pending}</span></span>` : ''}
                                ${processing > 0 ? `<span>Processing: <span class="font-medium text-blue-600">${processing}</span></span>` : ''}
                                ${completed > 0 ? `<span>Completed: <span class="font-medium text-green-600">${completed}</span></span>` : ''}
                            </div>
                            ${eventDetails && eventDetails.startDate ? `
                                <div class="flex gap-2 mt-1 text-xs text-gray-500">
                                    <span class="flex items-center gap-1">
                                        <i class="fas fa-calendar text-xs"></i>
                                        ${new Date(eventDetails.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Event Content - Show all orders inside the event -->
                    ${isExpanded ? `
                        <div class="p-4">
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student No.</th>
                                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year Level</th>
                                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-200">
                                        ${orders.map(order => `
                                            <tr class="hover:bg-gray-50">
                                                <td class="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">${order.id}</td>
                                                <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-900">${order.userName}</td>
                                                <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-600 font-mono">${order.studentNumber || 'N/A'}</td>
                                                <td class="px-3 py-2 whitespace-nowrap text-xs">
                                                    <span class="badge ${order.paymentMethod === 'Cash' ? 'badge-outline' : order.paymentMethod === 'GCash' ? 'badge-success' : order.paymentMethod === 'Bank Transfer' ? 'badge-primary' : 'badge-secondary'} text-xs">
                                                        ${order.paymentMethod || 'Not set'}
                                                    </span>
                                                </td>
                                                <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                                    ${order.referenceNumber ? `
                                                        <div class="flex items-center gap-1">
                                                            <span>${order.referenceNumber}</span>
                                                            ${order.referencePhoto ? `
                                                                <button class="text-blue-600 hover:text-blue-800"
                                                                        onclick="app.modules.orderManagement.viewReceipt('${order.id}')">
                                                                    <i class="fas fa-image text-xs"></i>
                                                                </button>
                                                            ` : ''}
                                                        </div>
                                                    ` : '-'}
                                                </td>
                                                <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-500">${order.department}</td>
                                                <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-500">${order.course}</td>
                                                <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-500">${order.yearLevel}</td>
                                                <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-semibold">₱${order.total.toFixed(2)}</td>
                                                <td class="px-3 py-2 whitespace-nowrap">
                                                    <span class="badge ${this.getStatusBadgeClass(order.status)} text-xs">
                                                        ${order.status}
                                                    </span>
                                                </td>
                                                <td class="px-3 py-2 whitespace-nowrap text-xs font-medium">
                                                    <button class="text-burgundy hover:text-burgundy-dark mr-2"
                                                            onclick="app.modules.orderManagement.viewOrderDetails('${order.id}')">
                                                        <i class="fas fa-eye text-xs"></i>
                                                    </button>
                                                    ${order.status === 'pending' ? `
                                                        <button class="text-yellow-600 hover:text-yellow-800"
                                                                onclick="app.modules.orderManagement.confirmPayment('${order.id}')"
                                                                title="Confirm Payment">
                                                            <i class="fas fa-check-circle text-xs"></i>
                                                        </button>
                                                    ` : ''}
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    getStatusBadgeClass(status) {
        switch(status) {
            case 'completed': return 'badge-primary';
            case 'processing': return 'badge-secondary';
            default: return 'badge-outline';
        }
    }

    renderTableView(orders) {
        if (orders.length === 0) {
            return `
                <div class="text-center py-6 text-gray-500">
                    <i class="fas fa-clipboard-list text-xl mb-2 text-gray-300"></i>
                    <p>No orders found</p>
                </div>
            `;
        }

        return `
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student No.</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${orders.map(order => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900">${order.id}</td>
                                    <td class="px-4 py-2 whitespace-nowrap text-xs text-gray-900">${order.userName}</td>
                                    <td class="px-4 py-2 whitespace-nowrap text-xs text-gray-600 font-mono">${order.studentNumber || 'N/A'}</td>
                                    <td class="px-4 py-2 whitespace-nowrap text-xs">
                                        <span class="badge ${order.paymentMethod === 'Cash' ? 'badge-outline' : order.paymentMethod === 'GCash' ? 'badge-success' : order.paymentMethod === 'Bank Transfer' ? 'badge-primary' : 'badge-secondary'} text-xs">
                                            ${order.paymentMethod || 'Not set'}
                                        </span>
                                    </td>
                                    <td class="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                                        ${order.referenceNumber ? `
                                            <div class="flex items-center gap-1">
                                                <span>${order.referenceNumber}</span>
                                                ${order.referencePhoto ? `
                                                    <button class="text-blue-600 hover:text-blue-800"
                                                            onclick="app.modules.orderManagement.viewReceipt('${order.id}')">
                                                        <i class="fas fa-image text-xs"></i>
                                                    </button>
                                                ` : ''}
                                            </div>
                                        ` : '-'}
                                    </td>
                                    <td class="px-4 py-2 whitespace-nowrap text-xs text-gray-500">${order.department}</td>
                                    <td class="px-4 py-2 whitespace-nowrap text-xs text-gray-500">${order.event || 'General Event'}</td>
                                    <td class="px-4 py-2 whitespace-nowrap text-xs text-gray-900 font-semibold">₱${order.total.toFixed(2)}</td>
                                    <td class="px-4 py-2 whitespace-nowrap">
                                        <span class="badge ${this.getStatusBadgeClass(order.status)} text-xs">
                                            ${order.status}
                                        </span>
                                    </td>
                                    <td class="px-4 py-2 whitespace-nowrap text-xs font-medium">
                                        <button class="text-burgundy hover:text-burgundy-dark mr-2"
                                                onclick="app.modules.orderManagement.viewOrderDetails('${order.id}')">
                                            <i class="fas fa-eye text-xs"></i>
                                        </button>
                                        ${order.status === 'pending' ? `
                                            <button class="text-yellow-600 hover:text-yellow-800"
                                                    onclick="app.modules.orderManagement.confirmPayment('${order.id}')"
                                                    title="Confirm Payment">
                                                <i class="fas fa-check-circle text-xs"></i>
                                            </button>
                                        ` : ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderAddEventDialog() {
        return `
            <div class="dialog-overlay" onclick="app.modules.orderManagement.closeAddEventDialog()">
                <div class="dialog-content max-w-sm" onclick="event.stopPropagation()">
                    <div class="dialog-header p-4">
                        <h2 class="text-lg font-semibold">Create New Event</h2>
                        <p class="text-sm text-gray-600">Add a new event for merch orders</p>
                        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                                onclick="app.modules.orderManagement.closeAddEventDialog()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="dialog-body p-4">
                        <div class="space-y-3">
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">Event Name *</label>
                                <input type="text" 
                                       placeholder="Event Name" 
                                       class="input w-full text-sm py-1"
                                       value="${this.newEvent.name}"
                                       oninput="app.modules.orderManagement.updateNewEventField('name', this.value)"
                                       required>
                            </div>
                            
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">Description (optional)</label>
                                <input type="text" 
                                       placeholder="Description (optional)" 
                                       class="input w-full text-sm py-1"
                                       value="${this.newEvent.description}"
                                       oninput="app.modules.orderManagement.updateNewEventField('description', this.value)">
                            </div>

                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">Start Date *</label>
                                <input type="date" 
                                       class="input w-full text-sm py-1"
                                       value="${this.newEvent.startDate}"
                                       oninput="app.modules.orderManagement.updateNewEventField('startDate', this.value)"
                                       required>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dialog-footer p-4 border-t">
                        <div class="flex gap-2">
                            <button class="btn btn-outline flex-1 text-sm py-1"
                                    onclick="app.modules.orderManagement.closeAddEventDialog()">
                                Cancel
                            </button>
                            <button class="btn btn-primary flex-1 text-sm py-1"
                                    onclick="app.modules.orderManagement.createNewEvent()"
                                    ${!this.newEvent.name || !this.newEvent.startDate ? 'disabled' : ''}>
                                Create Event
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderExportDialog(orders) {
        const selectedCount = Object.values(this.selectedForExport).filter(Boolean).length;
        const totalSelected = selectedCount > 0 ? selectedCount : orders.length;
        
        return `
            <div class="dialog-overlay" onclick="app.modules.orderManagement.closeExportDialog()">
                <div class="dialog-content max-w-sm" onclick="event.stopPropagation()">
                    <div class="dialog-header p-4">
                        <h2 class="text-lg font-semibold">Export Orders</h2>
                        <p class="text-sm text-gray-600">Export ${totalSelected} selected orders</p>
                        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                                onclick="app.modules.orderManagement.closeExportDialog()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="dialog-body p-4">
                        <div class="space-y-4">
                            <!-- Export Format Selection (Minimized) -->
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-2">Export Format</label>
                                <div class="flex gap-2">
                                    <label class="flex-1 border rounded p-2 text-center cursor-pointer hover:bg-gray-50 ${this.exportFormat === 'csv' ? 'border-burgundy bg-burgundy/5' : ''}">
                                        <input type="radio" 
                                               name="exportFormat" 
                                               value="csv" 
                                               class="hidden"
                                               ${this.exportFormat === 'csv' ? 'checked' : ''}
                                               onchange="app.modules.orderManagement.handleExportFormatChange('csv')">
                                        <div class="text-xs font-medium">CSV</div>
                                    </label>
                                    <label class="flex-1 border rounded p-2 text-center cursor-pointer hover:bg-gray-50 ${this.exportFormat === 'excel' ? 'border-burgundy bg-burgundy/5' : ''}">
                                        <input type="radio" 
                                               name="exportFormat" 
                                               value="excel" 
                                               class="hidden"
                                               ${this.exportFormat === 'excel' ? 'checked' : ''}
                                               onchange="app.modules.orderManagement.handleExportFormatChange('excel')">
                                        <div class="text-xs font-medium">Excel</div>
                                    </label>
                                </div>
                            </div>

                            <!-- Event Filter for Export -->
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">Export Orders From Event</label>
                                <select class="select w-full text-sm py-1"
                                        onchange="app.modules.orderManagement.handleExportEventFilterChange(this.value)">
                                    <option value="all" ${this.exportEventFilter === 'all' ? 'selected' : ''}>All Events</option>
                                    ${this.events.map(event => `
                                        <option value="${event.name}" ${this.exportEventFilter === event.name ? 'selected' : ''}>
                                            ${event.name}
                                        </option>
                                    `).join('')}
                                    <option value="General Event" ${this.exportEventFilter === 'General Event' ? 'selected' : ''}>General Event</option>
                                </select>
                            </div>

                            <!-- Export Options -->
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">Include in Export</label>
                                <div class="space-y-1">
                                    <label class="flex items-center text-xs">
                                        <input type="checkbox" 
                                               class="h-3 w-3 text-burgundy focus:ring-burgundy border-gray-300 rounded mr-2"
                                               checked>
                                        <span class="text-gray-700">Order details</span>
                                    </label>
                                    <label class="flex items-center text-xs">
                                        <input type="checkbox" 
                                               class="h-3 w-3 text-burgundy focus:ring-burgundy border-gray-300 rounded mr-2"
                                               checked>
                                        <span class="text-gray-700">Payment information</span>
                                    </label>
                                    <label class="flex items-center text-xs">
                                        <input type="checkbox" 
                                               class="h-3 w-3 text-burgundy focus:ring-burgundy border-gray-300 rounded mr-2"
                                               checked>
                                        <span class="text-gray-700">Customer information</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dialog-footer p-4 border-t">
                        <div class="flex gap-2">
                            <button class="btn btn-outline flex-1 text-sm py-1"
                                    onclick="app.modules.orderManagement.closeExportDialog()">
                                Cancel
                            </button>
                            <button class="btn btn-primary flex-1 text-sm py-1"
                                    onclick="app.modules.orderManagement.downloadExport()">
                                <i class="fas fa-download mr-1 text-xs"></i>
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderOrderDetailDialog() {
        const order = this.selectedOrder;
        const formattedDate = order.createdAt ? 
            new Date(order.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric'
            }) : 'Date not available';
        
        return `
            <div class="dialog-overlay" onclick="app.modules.orderManagement.closeOrderDetailDialog()">
                <div class="dialog-content max-w-lg" onclick="event.stopPropagation()">
                    <div class="dialog-header p-4">
                        <h2 class="text-lg font-semibold">Order Details</h2>
                        <p class="text-sm text-gray-600">${order.id} • ${formattedDate}</p>
                        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                                onclick="app.modules.orderManagement.closeOrderDetailDialog()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="dialog-body p-4">
                        <div class="grid grid-cols-1 gap-4">
                            <!-- Customer Information -->
                            <div class="bg-gray-50 rounded p-3">
                                <h3 class="text-sm font-medium text-gray-900 mb-2">Customer Information</h3>
                                <div class="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <p class="text-gray-600">Name</p>
                                        <p class="font-medium">${order.userName}</p>
                                    </div>
                                    <div>
                                        <p class="text-gray-600">Student Number</p>
                                        <p class="font-medium font-mono">${order.studentNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p class="text-gray-600">User Type</p>
                                        <p class="font-medium">${order.userType || 'Student'}</p>
                                    </div>
                                    <div>
                                        <p class="text-gray-600">Department</p>
                                        <p class="font-medium">${order.department || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p class="text-gray-600">Course</p>
                                        <p class="font-medium">${order.course || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p class="text-gray-600">Year Level</p>
                                        <p class="font-medium">${order.yearLevel || 'Not specified'}</p>
                                    </div>
                                    <div class="col-span-2">
                                        <p class="text-gray-600">Event</p>
                                        <p class="font-medium">${order.event || 'General Event'}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Payment Information -->
                            <div class="bg-gray-50 rounded p-3">
                                <h3 class="text-sm font-medium text-gray-900 mb-2">Payment Information</h3>
                                <div class="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <p class="text-gray-600">Payment Method</p>
                                        <p class="font-medium">${order.paymentMethod || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p class="text-gray-600">Reference Number</p>
                                        <p class="font-medium">${order.referenceNumber || 'N/A'}</p>
                                    </div>
                                    ${order.referencePhoto ? `
                                        <div class="col-span-2">
                                            <p class="text-gray-600 mb-1">Payment Receipt</p>
                                            <button class="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                                    onclick="app.modules.orderManagement.viewReceipt('${order.id}')">
                                                <i class="fas fa-image text-xs"></i>
                                                <span class="text-xs">View Receipt</span>
                                            </button>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>

                            <!-- Order Status & Summary -->
                            <div class="bg-gray-50 rounded p-3">
                                <h3 class="text-sm font-medium text-gray-900 mb-2">Order Summary</h3>
                                <div class="grid grid-cols-2 gap-3 text-xs mb-3">
                                    <div>
                                        <p class="text-gray-600">Order Status</p>
                                        <span class="badge ${this.getStatusBadgeClass(order.status)} text-xs">
                                            ${order.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p class="text-gray-600">Order Date</p>
                                        <p class="font-medium">${formattedDate}</p>
                                    </div>
                                </div>
                                <div class="space-y-2 text-xs">
                                    <div class="flex justify-between pt-2 text-sm font-bold">
                                        <span>Total Amount</span>
                                        <span>₱${order.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dialog-footer p-4 border-t">
                        <div class="flex gap-2">
                            <button class="btn btn-outline flex-1 text-sm py-1"
                                    onclick="app.modules.orderManagement.closeOrderDetailDialog()">
                                Close
                            </button>
                            ${order.status === 'pending' ? `
                                <button class="btn bg-yellow-600 hover:bg-yellow-700 text-white flex-1 text-sm py-1"
                                        onclick="app.modules.orderManagement.confirmPayment('${order.id}')">
                                    <i class="fas fa-check-circle mr-1 text-xs"></i>
                                    Confirm Payment
                                </button>
                            ` : ''}
                            ${order.referencePhoto ? `
                                <button class="btn btn-primary flex-1 text-sm py-1"
                                        onclick="app.modules.orderManagement.viewReceipt('${order.id}')">
                                    <i class="fas fa-image mr-1 text-xs"></i>
                                    View Receipt
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderReceiptDialog() {
        const order = this.selectedOrder;
        if (!order || !order.referencePhoto) return '';
        
        return `
            <div class="dialog-overlay" onclick="app.modules.orderManagement.closeReceiptDialog()">
                <div class="dialog-content max-w-2xl" onclick="event.stopPropagation()">
                    <div class="dialog-header p-4">
                        <h2 class="text-lg font-semibold">Payment Receipt</h2>
                        <p class="text-sm text-gray-600">Order: ${order.id} • ${order.userName}</p>
                        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                                onclick="app.modules.orderManagement.closeReceiptDialog()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="dialog-body p-4">
                        <div class="space-y-4">
                            <!-- Receipt Image -->
                            <div class="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                                <div class="text-center">
                                    <i class="fas fa-receipt text-4xl text-gray-400 mb-2"></i>
                                    <p class="text-sm text-gray-600">Receipt Image: ${order.referencePhoto}</p>
                                    <p class="text-xs text-gray-500 mt-2">(In a real app, this would display the uploaded receipt image)</p>
                                </div>
                            </div>
                            
                            <!-- Receipt Details -->
                            <div class="bg-gray-50 rounded p-4">
                                <h3 class="text-sm font-medium text-gray-900 mb-3">Receipt Details</h3>
                                <div class="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <p class="text-gray-600">Reference Number</p>
                                        <p class="font-medium">${order.referenceNumber}</p>
                                    </div>
                                    <div>
                                        <p class="text-gray-600">Payment Method</p>
                                        <p class="font-medium">${order.paymentMethod}</p>
                                    </div>
                                    <div>
                                        <p class="text-gray-600">Amount</p>
                                        <p class="font-medium">₱${order.total.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p class="text-gray-600">Customer</p>
                                        <p class="font-medium">${order.userName}</p>
                                    </div>
                                    <div>
                                        <p class="text-gray-600">Student Number</p>
                                        <p class="font-medium font-mono">${order.studentNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p class="text-gray-600">Order ID</p>
                                        <p class="font-medium">${order.id}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Action Buttons -->
                            <div class="flex gap-2 pt-2">
                                ${order.status === 'pending' ? `
                                    <button class="btn bg-yellow-600 hover:bg-yellow-700 text-white flex-1 text-sm py-1"
                                            onclick="app.modules.orderManagement.confirmPayment('${order.id}')">
                                        <i class="fas fa-check-circle mr-1 text-xs"></i>
                                        Confirm Payment is Valid
                                    </button>
                                ` : ''}
                                <button class="btn btn-outline flex-1 text-sm py-1"
                                        onclick="app.modules.orderManagement.closeReceiptDialog()">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ========== EVENT HANDLERS ==========

    handleSearch(event) {
        this.searchTerm = event.target.value;
        this.app.render();
    }

    handleStatusFilter(event) {
        this.statusFilter = event.target.value;
        this.app.render();
    }

    handleEventFilter(event) {
        this.eventFilter = event.target.value;
        this.app.render();
    }

    handleDepartmentFilter(event) {
        this.departmentFilter = event.target.value;
        this.app.render();
    }

    handleViewModeChange(event) {
        this.viewMode = event.target.value;
        this.app.render();
    }

    handleExportFormatChange(format) {
        this.exportFormat = format;
    }

    handleExportEventFilterChange(value) {
        this.exportEventFilter = value;
    }

    toggleEventExpansion(eventName) {
        this.expandedEvents[eventName] = !this.expandedEvents[eventName];
        this.app.render();
    }

    openAddEventDialog() {
        this.openAddEvent = true;
        this.app.render();
    }

    closeAddEventDialog() {
        this.openAddEvent = false;
        this.newEvent = {
            name: '',
            description: '',
            startDate: ''
        };
        this.app.render();
    }

    updateNewEventField(field, value) {
        this.newEvent[field] = value;
    }

    createNewEvent() {
        if (!this.newEvent.name || !this.newEvent.startDate) {
            alert('Please fill in all required fields');
            return;
        }

        // Check if event with same name already exists
        if (this.events.some(e => e.name === this.newEvent.name)) {
            alert('An event with this name already exists');
            return;
        }

        const newEvent = {
            id: Date.now().toString(),
            ...this.newEvent
        };

        this.events.push(newEvent);
        
        // Show success message
        alert(`Event "${newEvent.name}" created successfully`);
        
        this.closeAddEventDialog();
    }

    viewOrderDetails(orderId) {
        this.selectedOrder = this.orders.find(o => o.id === orderId);
        this.showOrderDetailDialog = true;
        this.app.render();
    }

    closeOrderDetailDialog() {
        this.selectedOrder = null;
        this.showOrderDetailDialog = false;
        this.app.render();
    }

    viewReceipt(orderId) {
        this.selectedOrder = this.orders.find(o => o.id === orderId);
        if (this.selectedOrder && this.selectedOrder.referencePhoto) {
            this.showReceiptDialog = true;
            this.app.render();
        } else {
            alert('No receipt available for this order');
        }
    }

    closeReceiptDialog() {
        this.showReceiptDialog = false;
        this.app.render();
    }

    confirmPayment(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            // Confirm with admin
            if (confirm(`Confirm payment for order ${orderId}?\nAmount: ₱${order.total.toFixed(2)}\nCustomer: ${order.userName}\nStudent No: ${order.studentNumber || 'N/A'}`)) {
                order.status = 'processing';
                alert(`Payment confirmed for order ${orderId}. Status changed to processing.`);
                
                // Update UI
                this.app.render();
            }
        }
    }

    openExportDialog() {
        this.showExportDialog = true;
        this.app.render();
    }

    closeExportDialog() {
        this.showExportDialog = false;
        this.app.render();
    }

    downloadExport() {
        // Get orders based on export event filter
        let exportOrders = this.orders;
        
        if (this.exportEventFilter !== 'all') {
            exportOrders = exportOrders.filter(order => 
                (order.event || 'General Event') === this.exportEventFilter
            );
        }
        
        // Apply current filters
        exportOrders = exportOrders.filter(order => {
            const matchesSearch = 
                order.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                order.userName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                (order.studentNumber && order.studentNumber.toLowerCase().includes(this.searchTerm.toLowerCase()));
            
            const matchesStatus = this.statusFilter === 'all' || order.status === this.statusFilter;
            
            const matchesEvent = this.eventFilter === 'all' || 
                                (order.event || 'General Event') === this.eventFilter;
            
            return matchesSearch && matchesStatus && matchesEvent;
        });
        
        // Get selected orders (if any)
        const selectedOrders = exportOrders.filter(order => 
            this.selectAllForExport || this.selectedForExport[order.id]
        );
        
        if (selectedOrders.length === 0) {
            alert('No orders selected for export');
            return;
        }

        // Create CSV content with all order details including student number
        const headers = [
            'Order ID', 
            'Customer',
            'Student Number',
            'Payment Method', 
            'Reference Number', 
            'Department', 
            'Course', 
            'Year Level', 
            'Event', 
            'Total', 
            'Status'
        ];
        
        const csvContent = [
            headers.join(','),
            ...selectedOrders.map(order => [
                order.id,
                order.userName,
                order.studentNumber || '',
                order.paymentMethod || '',
                order.referenceNumber || '',
                order.department,
                order.course,
                order.yearLevel,
                order.event || 'General Event',
                order.total.toFixed(2),
                order.status
            ].join(','))
        ].join('\n');
        
        // Create and download file
        const fileExtension = this.exportFormat === 'excel' ? 'xlsx' : 'csv';
        const mimeType = this.exportFormat === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv';
        
        const blob = new Blob([csvContent], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_export_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert(`${selectedOrders.length} order(s) exported as ${this.exportFormat.toUpperCase()}`);
        this.closeExportDialog();
    }

    // Toast notification
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg`;
        toast.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// ============================================
// DEPARTMENTS MODULE (WITHOUT STATS CARDS)
// ============================================

class Departments {
    constructor(app) {
        this.app = app;
        this.searchTerm = '';
        this.selectedRole = 'all';
        this.expandedDepartments = new Set();
        this.showAddModal = false;
        this.showEditModal = false;
        this.showDeleteModal = false;
        this.selectedDepartment = null;
        
        // Form state
        this.newDepartment = {
            name: '',
            description: '',
            courses: [],
            logoUrl: '',
            assignedAdmin: {
                name: '',
                email: '',
                password: ''
            }
        };
        
        this.editDepartment = {
            name: '',
            description: '',
            courses: [],
            logoUrl: ''
        };
        
        // Current user state
        this.currentUser = this.app.getCurrentUser();
        this.isAssignedAdmin = this.currentUser.role === 'assigned-admin';
        this.userDepartment = this.currentUser.department;

        // Mock data
        this.departmentsData = [
            { 
                id: 'D001', 
                name: 'College of Engineering', 
                description: 'Offering engineering programs with modern facilities and industry partnerships.',
                courses: ['Computer Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering'],
                logo: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=400&fit=crop',
                studentCount: 1250,
                facultyCount: 45,
                adminCount: 3,
                assignedAdmin: {
                    id: 'A001',
                    name: 'Dr. Michael Rodriguez',
                    email: 'm.rodriguez@university.edu',
                    password: 'engadmin2024'
                },
                createdDate: '2023-01-15',
                lastUpdated: '2024-11-25'
            },
            { 
                id: 'D002', 
                name: 'College of Business Administration', 
                description: 'Developing future business leaders through innovative programs and real-world experience.',
                courses: ['Business Management', 'Accounting', 'Marketing', 'Finance', 'Entrepreneurship'],
                logo: 'https://images.unsplash.com/photo-1551836026-d5c2c5af78e4?w=400&h=400&fit=crop',
                studentCount: 980,
                facultyCount: 38,
                adminCount: 2,
                assignedAdmin: {
                    id: 'A002',
                    name: 'Prof. Lisa Thompson',
                    email: 'l.thompson@university.edu',
                    password: 'businessadmin2024'
                },
                createdDate: '2023-02-10',
                lastUpdated: '2024-11-20'
            },
            { 
                id: 'D003', 
                name: 'College of Arts and Sciences', 
                description: 'Fostering critical thinking and creativity across diverse disciplines.',
                courses: ['Psychology', 'Biology', 'Chemistry', 'Mathematics', 'English', 'History', 'Political Science'],
                logo: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=400&fit=crop',
                studentCount: 2100,
                facultyCount: 78,
                adminCount: 4,
                assignedAdmin: null,
                createdDate: '2023-01-05',
                lastUpdated: '2024-11-22'
            }
        ];

        // User data
        this.mockUsers = [
            // College of Engineering Users
            { 
                id: 'U001', 
                name: 'John Martinez', 
                email: 'john.martinez@university.edu', 
                studentId: '2021-00123', 
                role: 'student', 
                department: 'College of Engineering', 
                course: 'Computer Engineering', 
                yearLevel: '3rd Year', 
                totalPurchases: 5, 
                joinDate: '2024-01-15', 
                isActive: true, 
                lastYearLevelUpdate: '2024-08-15'
            },
            { 
                id: 'U002', 
                name: 'Sarah Chen', 
                email: 'sarah.chen@university.edu', 
                studentId: '2022-00456', 
                role: 'student', 
                department: 'College of Engineering', 
                course: 'Electrical Engineering', 
                yearLevel: '2nd Year', 
                totalPurchases: 3, 
                joinDate: '2024-02-10', 
                isActive: true, 
                lastYearLevelUpdate: '2023-09-10'
            },
            { 
                id: 'U003', 
                name: 'Dr. Michael Rodriguez', 
                email: 'm.rodriguez@university.edu', 
                role: 'assigned_admin', 
                department: 'College of Engineering', 
                totalPurchases: 0, 
                joinDate: '2023-07-01', 
                isActive: true
            },
            { 
                id: 'U004', 
                name: 'Prof. James Wilson', 
                email: 'j.wilson@university.edu', 
                role: 'faculty', 
                department: 'College of Engineering', 
                totalPurchases: 2, 
                joinDate: '2023-08-15', 
                isActive: true
            },
            // College of Business Admin Users
            { 
                id: 'U005', 
                name: 'Lisa Tan', 
                email: 'lisa.tan@university.edu', 
                studentId: '2021-01234', 
                role: 'student', 
                department: 'College of Business Administration', 
                course: 'Business Management', 
                yearLevel: '3rd Year', 
                totalPurchases: 7, 
                joinDate: '2024-01-20', 
                isActive: true, 
                lastYearLevelUpdate: '2023-08-05'
            },
            { 
                id: 'U006', 
                name: 'Prof. Lisa Thompson', 
                email: 'l.thompson@university.edu', 
                role: 'assigned_admin', 
                department: 'College of Business Administration', 
                totalPurchases: 0, 
                joinDate: '2023-07-15', 
                isActive: true
            },
            { 
                id: 'U007', 
                name: 'Dr. Amanda Cruz', 
                email: 'a.cruz@university.edu', 
                role: 'faculty', 
                department: 'College of Business Administration', 
                totalPurchases: 2, 
                joinDate: '2023-06-01', 
                isActive: true
            },
            // College of Arts and Sciences Users
            { 
                id: 'U008', 
                name: 'Daniel Park', 
                email: 'daniel.park@university.edu', 
                studentId: '2021-02345', 
                role: 'student', 
                department: 'College of Arts and Sciences', 
                course: 'Psychology', 
                yearLevel: '3rd Year', 
                totalPurchases: 6, 
                joinDate: '2024-01-08', 
                isActive: true, 
                lastYearLevelUpdate: '2024-08-01'
            },
            { 
                id: 'U009', 
                name: 'Dr. Mark Santos', 
                email: 'm.santos@university.edu', 
                role: 'faculty', 
                department: 'College of Arts and Sciences', 
                totalPurchases: 5, 
                joinDate: '2022-07-01', 
                isActive: true
            },
            // Add admin users
            { 
                id: 'U010', 
                name: 'System Admin', 
                email: 'admin@university.edu', 
                role: 'admin', 
                department: 'Administration', 
                totalPurchases: 0, 
                joinDate: '2023-01-01', 
                isActive: true
            }
        ];
    }

    render() {
        const filteredUsers = this.getFilteredUsers();
        const visibleDepartments = this.getVisibleDepartments();

        return `
            <div class="departments-container p-4 lg:p-6 space-y-6">
                <!-- Header -->
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">Departments & Users</h2>
                        <p class="text-gray-600 mt-1">
                            ${this.isAssignedAdmin ? 
                                `Managing ${this.userDepartment}` : 
                                'Manage all university departments and users'}
                        </p>
                    </div>
                    
                    ${!this.isAssignedAdmin ? `
                        <button class="btn btn-primary gap-2 add-department-btn" 
                                onclick="app.modules.departments.openAddModal()">
                            <i class="fas fa-plus"></i>
                            <span class="hidden sm:inline">Add Department</span>
                        </button>
                    ` : ''}
                </div>

                <!-- Year Level Update Reminder -->
                ${this.renderYearLevelReminder()}

                <!-- Search and Filters -->
                ${!this.isAssignedAdmin ? this.renderFilters() : this.renderAssignedAdminHeader()}

                <!-- Departments List -->
                <div class="space-y-4">
                    ${visibleDepartments.length > 0 ? 
                        visibleDepartments.map(dept => this.renderDepartmentCard(dept, filteredUsers)).join('') :
                        this.renderEmptyState()
                    }
                </div>

                <!-- Modals -->
                ${this.showAddModal ? this.renderAddModal() : ''}
                ${this.showEditModal && this.selectedDepartment ? this.renderEditModal() : ''}
                ${this.showDeleteModal && this.selectedDepartment ? this.renderDeleteModal() : ''}
            </div>
        `;
    }

    getFilteredUsers() {
        return this.mockUsers.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                                 user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                                 (user.studentId && user.studentId.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
                                 user.department.toLowerCase().includes(this.searchTerm.toLowerCase());
            
            const matchesRole = this.selectedRole === 'all' || user.role === this.selectedRole;
            
            // For assigned admins, only show users from their department
            const matchesDepartment = !this.isAssignedAdmin || user.department === this.userDepartment;
            
            return matchesSearch && matchesRole && matchesDepartment;
        });
    }

    getVisibleDepartments() {
        if (this.isAssignedAdmin) {
            return this.departmentsData.filter(dept => dept.name === this.userDepartment);
        }
        return this.departmentsData.filter(dept => {
            const matchesSearch = this.searchTerm === '' || 
                                 dept.name.toLowerCase().includes(this.searchTerm.toLowerCase());
            return matchesSearch;
        });
    }

    renderYearLevelReminder() {
        const needsUpdate = this.mockUsers.filter(u => this.needsYearLevelUpdate(u)).length;
        
        if (needsUpdate === 0) return '';
        
        return `
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                    <div class="flex-shrink-0">
                        <i class="fas fa-exclamation-triangle text-amber-600 text-lg"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="text-sm font-semibold text-amber-900">Year Level Update Required</h4>
                        <p class="text-sm text-amber-800 mt-1">
                            ${needsUpdate} student${needsUpdate > 1 ? 's' : ''} need${needsUpdate === 1 ? 's' : ''} to update their year level 
                            for the current academic year. Remind students to update their information.
                        </p>
                    </div>
                    <button class="btn btn-sm btn-ghost text-amber-700 hover:text-amber-900" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderFilters() {
        return `
            <div class="bg-white rounded-lg border border-gray-200 p-4">
                <div class="flex flex-col lg:flex-row gap-4">
                    <!-- Search Input -->
                    <div class="flex-1">
                        <div class="relative">
                            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input type="text" 
                                   placeholder="Search users by name, email, ID, or department..." 
                                   value="${this.searchTerm}"
                                   oninput="app.modules.departments.handleSearch(event.target.value)"
                                   class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-transparent">
                        </div>
                    </div>
                    
                    <!-- Role Filter Buttons -->
                    <div class="flex flex-wrap gap-2">
                        <button class="px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                      ${this.selectedRole === 'all' ? 
                                        'bg-burgundy text-white' : 
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                                onclick="app.modules.departments.handleRoleFilter('all')">
                            All
                        </button>
                        <button class="px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                      ${this.selectedRole === 'student' ? 
                                        'bg-burgundy text-white' : 
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                                onclick="app.modules.departments.handleRoleFilter('student')">
                            Students
                        </button>
                        <button class="px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                      ${this.selectedRole === 'admin' ? 
                                        'bg-burgundy text-white' : 
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                                onclick="app.modules.departments.handleRoleFilter('admin')">
                            Admins
                        </button>
                        <button class="px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                      ${this.selectedRole === 'assigned_admin' ? 
                                        'bg-burgundy text-white' : 
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                                onclick="app.modules.departments.handleRoleFilter('assigned_admin')">
                            Dept Admins
                        </button>
                        <button class="px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                      ${this.selectedRole === 'faculty' ? 
                                        'bg-burgundy text-white' : 
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                                onclick="app.modules.departments.handleRoleFilter('faculty')">
                            Faculty
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderAssignedAdminHeader() {
        return `
            <div class="bg-white rounded-lg border border-gray-200 p-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-burgundy/10 rounded-lg flex items-center justify-center">
                            <i class="fas fa-user-shield text-burgundy"></i>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900">${this.userDepartment}</h3>
                            <p class="text-sm text-gray-600">Assigned Admin Dashboard</p>
                        </div>
                    </div>
                    <div class="text-sm text-gray-600">
                        <i class="fas fa-users mr-1"></i>
                        ${this.mockUsers.filter(u => u.department === this.userDepartment).length} users
                    </div>
                </div>
            </div>
        `;
    }

    renderDepartmentCard(department, filteredUsers) {
        const isExpanded = this.expandedDepartments.has(department.id);
        const deptUsers = filteredUsers.filter(u => u.department === department.name);
        const userStats = this.getDepartmentUserStats(deptUsers);
        
        return `
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                <!-- Department Header -->
                <div class="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                     onclick="app.modules.departments.toggleDepartment('${department.id}')">
                    <div class="flex items-start justify-between">
                        <div class="flex items-start gap-4 flex-1">
                            <!-- Logo -->
                            <div class="flex-shrink-0">
                                ${department.logo ? `
                                    <img src="${department.logo}" alt="${department.name}" 
                                         class="w-16 h-16 rounded-lg object-cover border border-gray-200">
                                ` : `
                                    <div class="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border border-gray-200 flex items-center justify-center">
                                        <i class="fas fa-university text-gray-400 text-2xl"></i>
                                    </div>
                                `}
                            </div>
                            
                            <!-- Department Info -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-2">
                                    <h3 class="text-lg font-semibold text-gray-900 truncate">${department.name}</h3>
                                    ${this.isAssignedAdmin && department.name === this.userDepartment ? `
                                        <span class="px-2 py-1 bg-burgundy/10 text-burgundy text-xs font-medium rounded-full">
                                            <i class="fas fa-user-shield mr-1"></i>Your Department
                                        </span>
                                    ` : ''}
                                </div>
                                
                                <!-- Quick Stats -->
                                <div class="flex flex-wrap gap-4 text-sm">
                                    <div class="flex items-center gap-2 text-gray-600">
                                        <i class="fas fa-users"></i>
                                        <span>${department.studentCount || 0} students</span>
                                    </div>
                                    <div class="flex items-center gap-2 text-gray-600">
                                        <i class="fas fa-chalkboard-teacher"></i>
                                        <span>${department.facultyCount || 0} faculty</span>
                                    </div>
                                    <div class="flex items-center gap-2 text-gray-600">
                                        <i class="fas fa-book"></i>
                                        <span>${department.courses.length} courses</span>
                                    </div>
                                    ${department.assignedAdmin ? `
                                        <div class="flex items-center gap-2 text-purple-600">
                                            <i class="fas fa-user-shield"></i>
                                            <span>Has Admin</span>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Actions and Expand Button -->
                        <div class="flex items-center gap-2 ml-4">
                            ${!this.isAssignedAdmin ? `
                                <button class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-burgundy rounded-full hover:bg-gray-100"
                                        onclick="event.stopPropagation(); app.modules.departments.openEditModal('${department.id}')"
                                        title="Edit Department">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                                        onclick="event.stopPropagation(); app.modules.departments.openDeleteModal('${department.id}')"
                                        title="Delete Department">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                            <i class="fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-400 ml-2"></i>
                        </div>
                    </div>
                </div>
                
                <!-- Expanded Content -->
                ${isExpanded ? this.renderExpandedContent(department, deptUsers, userStats) : ''}
            </div>
        `;
    }

    renderExpandedContent(department, deptUsers, userStats) {
        return `
            <div class="border-t border-gray-200">
                <!-- Department Details -->
                <div class="p-6">
                    <!-- Courses Section -->
                    <div class="mb-6">
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">Courses Offered</h4>
                            <span class="text-sm text-gray-600">${department.courses.length} programs</span>
                        </div>
                        
                        <div class="flex flex-wrap gap-2">
                            ${department.courses.map(course => `
                                <span class="px-3 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200">
                                    <i class="fas fa-book-open mr-2 text-gray-400"></i>
                                    ${course}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Assigned Admin Section -->
                    ${department.assignedAdmin ? `
                        <div class="mb-6">
                            <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Assigned Admin</h4>
                            <div class="bg-purple-50 rounded-lg border border-purple-200 p-4">
                                <!-- Admin Info Row -->
                                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <!-- Name -->
                                    <div class="space-y-1">
                                        <p class="text-xs font-medium text-purple-700">Name</p>
                                        <p class="text-sm text-gray-900 font-medium">${department.assignedAdmin.name}</p>
                                    </div>
                                    
                                    <!-- Email -->
                                    <div class="space-y-1">
                                        <p class="text-xs font-medium text-purple-700">Email</p>
                                        <p class="text-sm text-gray-900">${department.assignedAdmin.email}</p>
                                    </div>
                                    
                                    <!-- Password -->
                                    <div class="space-y-1">
                                        <p class="text-xs font-medium text-purple-700">Password</p>
                                        <div class="flex items-center gap-2">
                                            <span class="text-sm text-gray-900 font-mono">${'•'.repeat(department.assignedAdmin.password.length)}</span>
                                            <button class="text-xs text-purple-600 hover:text-purple-800 hover:underline" onclick="app.modules.departments.resetAdminPassword('${department.id}')">
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <!-- Status -->
                                    <div class="space-y-1">
                                        <p class="text-xs font-medium text-purple-700">Status</p>
                                        <div class="flex items-center gap-2">
                                            <span class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                <i class="fas fa-circle text-green-500 text-xs"></i>
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Admin Actions -->
                                <div class="flex flex-col sm:flex-row gap-2 pt-3 border-t border-purple-200">
                                    <button class="flex-1 py-2.5 bg-white text-purple-700 text-sm font-medium rounded border border-purple-200 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                                            onclick="alert('Email sent to ${department.assignedAdmin.email}')">
                                        <i class="fas fa-envelope"></i>
                                        <span>Send Email</span>
                                    </button>
                                    <button class="flex-1 py-2.5 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                            onclick="app.modules.departments.viewAdminDetails('${department.id}')">
                                        <i class="fas fa-eye"></i>
                                        <span>View Details</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ` : `
                        <div class="mb-6">
                            <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Assigned Admin</h4>
                            <div class="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center">
                                <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <i class="fas fa-user-plus text-gray-400"></i>
                                </div>
                                <h4 class="text-sm font-semibold text-gray-900 mb-1">No Assigned Admin</h4>
                                <p class="text-xs text-gray-600 mb-3">This department doesn't have an assigned admin</p>
                                <button class="w-full py-2 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                                        onclick="app.modules.departments.assignAdmin('${department.id}')">
                                    <i class="fas fa-user-plus mr-2"></i>Assign Admin
                                </button>
                            </div>
                        </div>
                    `}
                </div>
                
                <!-- Users Section -->
                <div class="border-t border-gray-200 p-6">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h4 class="text-lg font-semibold text-gray-900">Department Users</h4>
                            <p class="text-sm text-gray-600 mt-1">All users associated with ${department.name}</p>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex items-center gap-2 text-sm text-gray-600">
                                <div class="flex items-center gap-1">
                                    <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    <span>${userStats.students} students</span>
                                </div>
                                <div class="flex items-center gap-1">
                                    <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                                    <span>${userStats.admins} admins</span>
                                </div>
                                <div class="flex items-center gap-1">
                                    <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                                    <span>${userStats.faculty} faculty</span>
                                </div>
                            </div>
                            <button class="btn btn-outline btn-sm gap-1"
                                    onclick="app.modules.departments.exportUsers('${department.id}')">
                                <i class="fas fa-download"></i>
                                Export
                            </button>
                        </div>
                    </div>
                    
                    ${deptUsers.length > 0 ? `
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr class="bg-gray-50">
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year Level</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    ${deptUsers.map(user => this.renderUserRow(user)).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="text-center py-12">
                            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-users text-gray-400 text-2xl"></i>
                            </div>
                            <h4 class="text-lg font-semibold text-gray-900 mb-2">No Users Found</h4>
                            <p class="text-gray-600 max-w-md mx-auto">
                                There are no users currently assigned to this department. 
                                Users will appear here when they're added or assigned to this department.
                            </p>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    renderUserRow(user) {
        const roleBadge = {
            student: { class: 'bg-blue-100 text-blue-800', icon: 'fa-graduation-cap', label: 'Student' },
            faculty: { class: 'bg-green-100 text-green-800', icon: 'fa-chalkboard-teacher', label: 'Faculty' },
            admin: { class: 'bg-purple-100 text-purple-800', icon: 'fa-user-shield', label: 'Admin' },
            assigned_admin: { class: 'bg-indigo-100 text-indigo-800', icon: 'fa-user-tie', label: 'Dept Admin' }
        }[user.role] || { class: 'bg-gray-100 text-gray-800', icon: 'fa-user', label: user.role };
        
        const statusBadge = user.isActive ? 
            'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
        
        const needsUpdate = this.needsYearLevelUpdate(user);
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 text-sm font-medium">
                            ${user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <p class="font-medium text-gray-900">${user.name}</p>
                            <p class="text-xs text-gray-500">${user.email}</p>
                            ${user.studentId ? `<p class="text-xs text-gray-500">${user.studentId}</p>` : ''}
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge.class}">
                        <i class="fas ${roleBadge.icon}"></i>
                        ${roleBadge.label}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">
                    ${user.course || '-'}
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-900">${user.yearLevel || '-'}</span>
                        ${needsUpdate ? `
                            <span class="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                                <i class="fas fa-exclamation-triangle mr-1"></i>Update
                            </span>
                        ` : ''}
                    </div>
                </td>
                <td class="px-4 py-3">
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge}">
                        ${user.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                        <button class="text-gray-400 hover:text-burgundy" title="View Profile" onclick="app.modules.departments.viewUserProfile('${user.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="text-gray-400 hover:text-blue-600" title="Edit User" onclick="app.modules.departments.editUser('${user.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-gray-400 hover:text-red-600" title="Remove from Department" onclick="app.modules.departments.removeUserFromDept('${user.id}', '${user.department}')">
                            <i class="fas fa-user-minus"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    renderEmptyState() {
        return `
            <div class="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-university text-gray-400 text-2xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">No Departments Found</h3>
                <p class="text-gray-600 mb-6">${this.searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first department'}</p>
                ${!this.isAssignedAdmin ? `
                    <button class="btn btn-primary gap-2" onclick="app.modules.departments.openAddModal()">
                        <i class="fas fa-plus"></i>
                        Add Department
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderAddModal() {
        return `
            <div class="modal-overlay active" onclick="app.modules.departments.closeModal()">
                <div class="modal-content max-w-2xl" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3 class="modal-title">Add New Department</h3>
                        <p class="modal-subtitle">Create a new department with courses and assigned admin</p>
                        <button class="modal-close" onclick="app.modules.departments.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <form id="addDepartmentForm" onsubmit="event.preventDefault(); app.modules.departments.handleAddDepartment()">
                            <div class="space-y-6">
                                <!-- Basic Information -->
                                <div class="space-y-4">
                                    <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">Basic Information</h4>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="form-label">Department Name *</label>
                                            <input type="text" 
                                                   class="form-input"
                                                   placeholder="e.g., College of Engineering"
                                                   value="${this.newDepartment.name}"
                                                   oninput="app.modules.departments.updateNewDepartmentField('name', this.value)"
                                                   required>
                                        </div>
                                        <div>
                                            <label class="form-label">Logo URL (Optional)</label>
                                            <input type="text" 
                                                   class="form-input"
                                                   placeholder="https://example.com/logo.jpg"
                                                   value="${this.newDepartment.logoUrl}"
                                                   oninput="app.modules.departments.updateNewDepartmentField('logoUrl', this.value)">
                                        </div>
                                    </div>
                                    <div>
                                        <label class="form-label">Description (Optional)</label>
                                        <textarea class="form-input" 
                                                  rows="3"
                                                  placeholder="Describe the department..."
                                                  oninput="app.modules.departments.updateNewDepartmentField('description', this.value)">${this.newDepartment.description}</textarea>
                                    </div>
                                </div>
                                
                                <!-- Courses -->
                                <div class="space-y-4">
                                    <div class="flex items-center justify-between">
                                        <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">Courses Offered</h4>
                                        <button type="button" 
                                                class="text-sm text-burgundy hover:text-burgundy-dark font-medium"
                                                onclick="app.modules.departments.addCourse()">
                                            <i class="fas fa-plus mr-1"></i> Add Course
                                        </button>
                                    </div>
                                    <div id="courses-list" class="space-y-2">
                                        ${this.newDepartment.courses.map((course, index) => `
                                            <div class="flex items-center gap-2">
                                                <input type="text"
                                                       class="form-input flex-1"
                                                       placeholder="Course name"
                                                       value="${course}"
                                                       oninput="app.modules.departments.updateCourse(index, this.value)">
                                                <button type="button"
                                                        class="text-red-600 hover:text-red-800 p-2"
                                                        onclick="app.modules.departments.removeCourse(${index})">
                                                    <i class="fas fa-times"></i>
                                                </button>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                <!-- Assigned Admin -->
                                <div class="space-y-4">
                                    <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">Assigned Admin (Optional)</h4>
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label class="form-label">Admin Name</label>
                                            <input type="text" 
                                                   class="form-input"
                                                   placeholder="Full name"
                                                   value="${this.newDepartment.assignedAdmin.name}"
                                                   oninput="app.modules.departments.updateNewAdminField('name', this.value)">
                                        </div>
                                        <div>
                                            <label class="form-label">Email</label>
                                            <input type="email" 
                                                   class="form-input"
                                                   placeholder="admin@university.edu"
                                                   value="${this.newDepartment.assignedAdmin.email}"
                                                   oninput="app.modules.departments.updateNewAdminField('email', this.value)">
                                        </div>
                                        <div>
                                            <label class="form-label">Password</label>
                                            <input type="password" 
                                                   class="form-input"
                                                   placeholder="••••••••"
                                                   value="${this.newDepartment.assignedAdmin.password}"
                                                   oninput="app.modules.departments.updateNewAdminField('password', this.value)">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" 
                                class="btn btn-secondary"
                                onclick="app.modules.departments.closeModal()">
                            Cancel
                        </button>
                        <button type="submit" 
                                form="addDepartmentForm"
                                class="btn btn-primary"
                                ${!this.newDepartment.name ? 'disabled' : ''}>
                            <i class="fas fa-plus mr-2"></i>
                            Add Department
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderEditModal() {
        const dept = this.selectedDepartment;
        if (!dept) return '';
        
        return `
            <div class="modal-overlay active" onclick="app.modules.departments.closeModal()">
                <div class="modal-content max-w-2xl" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3 class="modal-title">Edit Department</h3>
                        <p class="modal-subtitle">Update ${dept.name} information</p>
                        <button class="modal-close" onclick="app.modules.departments.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <form id="editDepartmentForm" onsubmit="event.preventDefault(); app.modules.departments.handleEditDepartment()">
                            <div class="space-y-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="form-label">Department Name *</label>
                                        <input type="text" 
                                               class="form-input"
                                               value="${dept.name}"
                                               oninput="app.modules.departments.updateEditDepartmentField('name', this.value)"
                                               required>
                                    </div>
                                    <div>
                                        <label class="form-label">Logo URL</label>
                                        <input type="text" 
                                               class="form-input"
                                               value="${dept.logo || ''}"
                                               oninput="app.modules.departments.updateEditDepartmentField('logo', this.value)">
                                    </div>
                                </div>
                                <div>
                                    <label class="form-label">Description (Optional)</label>
                                    <textarea class="form-input" 
                                              rows="3"
                                              oninput="app.modules.departments.updateEditDepartmentField('description', this.value)">${dept.description}</textarea>
                                </div>
                                
                                <div class="space-y-4">
                                    <div class="flex items-center justify-between">
                                        <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">Courses Offered</h4>
                                        <button type="button" 
                                                class="text-sm text-burgundy hover:text-burgundy-dark font-medium"
                                                onclick="app.modules.departments.addEditCourse()">
                                            <i class="fas fa-plus mr-1"></i> Add Course
                                        </button>
                                    </div>
                                    <div class="space-y-2">
                                        ${(dept.courses || []).map((course, index) => `
                                            <div class="flex items-center gap-2">
                                                <input type="text"
                                                       class="form-input flex-1"
                                                       value="${course}"
                                                       oninput="app.modules.departments.updateEditCourse(index, this.value)">
                                                <button type="button"
                                                        class="text-red-600 hover:text-red-800 p-2"
                                                        onclick="app.modules.departments.removeEditCourse(${index})">
                                                    <i class="fas fa-times"></i>
                                                </button>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" 
                                class="btn btn-secondary"
                                onclick="app.modules.departments.closeModal()">
                            Cancel
                        </button>
                        <button type="submit" 
                                form="editDepartmentForm"
                                class="btn btn-primary">
                            <i class="fas fa-save mr-2"></i>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderDeleteModal() {
        const dept = this.selectedDepartment;
        if (!dept) return '';
        
        return `
            <div class="modal-overlay active" onclick="app.modules.departments.closeModal()">
                <div class="modal-content max-w-md" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3 class="modal-title text-red-600">Delete Department</h3>
                        <p class="modal-subtitle">This action cannot be undone</p>
                        <button class="modal-close" onclick="app.modules.departments.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="text-center py-4">
                            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                            </div>
                            <h4 class="text-lg font-semibold text-gray-900 mb-2">Delete "${dept.name}"?</h4>
                            <p class="text-gray-600 mb-4">
                                This will permanently delete the department and all associated data. 
                                ${dept.assignedAdmin ? 'The assigned admin will also be removed.' : ''}
                            </p>
                            
                            <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-left mb-6">
                                <p class="text-sm font-medium text-red-800 mb-2">What will be deleted:</p>
                                <ul class="space-y-1 text-sm text-red-700">
                                    <li class="flex items-center gap-2">
                                        <i class="fas fa-times-circle text-xs"></i>
                                        <span>Department information and settings</span>
                                    </li>
                                    <li class="flex items-center gap-2">
                                        <i class="fas fa-times-circle text-xs"></i>
                                        <span>${dept.courses.length} course programs</span>
                                    </li>
                                    <li class="flex items-center gap-2">
                                        <i class="fas fa-times-circle text-xs"></i>
                                        <span>Department statistics and records</span>
                                    </li>
                                </ul>
                            </div>
                            
                            <div class="flex gap-3 justify-center">
                                <button type="button" 
                                        class="btn btn-secondary"
                                        onclick="app.modules.departments.closeModal()">
                                    Cancel
                                </button>
                                <button type="button" 
                                        class="btn btn-danger"
                                        onclick="app.modules.departments.handleDeleteDepartment()">
                                    <i class="fas fa-trash mr-2"></i>
                                    Delete Department
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ========== HELPER METHODS ==========

    getDepartmentUserStats(users) {
        return {
            total: users.length,
            students: users.filter(u => u.role === 'student').length,
            admins: users.filter(u => u.role === 'admin' || u.role === 'assigned_admin').length,
            faculty: users.filter(u => u.role === 'faculty').length
        };
    }

    needsYearLevelUpdate(user) {
        if (user.role !== 'student' || !user.lastYearLevelUpdate) return false;
        
        const lastUpdate = new Date(user.lastYearLevelUpdate);
        const today = new Date();
        const currentYear = today.getFullYear();
        
        // Academic year starts August 1st
        const currentAcademicYearStart = new Date(currentYear, 7, 1); // August 1st
        const lastAcademicYearStart = new Date(currentYear - 1, 7, 1);
        
        if (today >= currentAcademicYearStart) {
            return lastUpdate < currentAcademicYearStart;
        } else {
            return lastUpdate < lastAcademicYearStart;
        }
    }

    // ========== EVENT HANDLERS ==========

    handleSearch(value) {
        this.searchTerm = value;
        this.app.render();
    }

    handleRoleFilter(role) {
        this.selectedRole = role;
        this.app.render();
    }

    toggleDepartment(deptId) {
        if (this.expandedDepartments.has(deptId)) {
            this.expandedDepartments.delete(deptId);
        } else {
            this.expandedDepartments.add(deptId);
        }
        this.app.render();
    }

    openAddModal() {
        this.showAddModal = true;
        this.newDepartment = {
            name: '',
            description: '',
            courses: [],
            logoUrl: '',
            assignedAdmin: {
                name: '',
                email: '',
                password: ''
            }
        };
        this.app.render();
    }

    openEditModal(deptId) {
        this.selectedDepartment = this.departmentsData.find(d => d.id === deptId);
        if (this.selectedDepartment) {
            this.showEditModal = true;
            this.editDepartment = {
                name: this.selectedDepartment.name,
                description: this.selectedDepartment.description,
                courses: [...this.selectedDepartment.courses],
                logoUrl: this.selectedDepartment.logo || ''
            };
            this.app.render();
        }
    }

    openDeleteModal(deptId) {
        this.selectedDepartment = this.departmentsData.find(d => d.id === deptId);
        if (this.selectedDepartment) {
            this.showDeleteModal = true;
            this.app.render();
        }
    }

    closeModal() {
        this.showAddModal = false;
        this.showEditModal = false;
        this.showDeleteModal = false;
        this.selectedDepartment = null;
        this.app.render();
    }

    updateNewDepartmentField(field, value) {
        this.newDepartment[field] = value;
        this.app.render();
    }

    updateNewAdminField(field, value) {
        this.newDepartment.assignedAdmin[field] = value;
        this.app.render();
    }

    updateEditDepartmentField(field, value) {
        if (this.selectedDepartment) {
            this.selectedDepartment[field] = value;
            this.app.render();
        }
    }

    addCourse() {
        this.newDepartment.courses.push('');
        this.app.render();
    }

    updateCourse(index, value) {
        if (index >= 0 && index < this.newDepartment.courses.length) {
            this.newDepartment.courses[index] = value;
            this.app.render();
        }
    }

    removeCourse(index) {
        if (index >= 0 && index < this.newDepartment.courses.length) {
            this.newDepartment.courses.splice(index, 1);
            this.app.render();
        }
    }

    addEditCourse() {
        if (this.selectedDepartment) {
            if (!this.selectedDepartment.courses) {
                this.selectedDepartment.courses = [];
            }
            this.selectedDepartment.courses.push('');
            this.app.render();
        }
    }

    updateEditCourse(index, value) {
        if (this.selectedDepartment && this.selectedDepartment.courses) {
            if (index >= 0 && index < this.selectedDepartment.courses.length) {
                this.selectedDepartment.courses[index] = value;
                this.app.render();
            }
        }
    }

    removeEditCourse(index) {
        if (this.selectedDepartment && this.selectedDepartment.courses) {
            if (index >= 0 && index < this.selectedDepartment.courses.length) {
                this.selectedDepartment.courses.splice(index, 1);
                this.app.render();
            }
        }
    }

    handleAddDepartment() {
        if (!this.newDepartment.name) {
            this.showToast('Please enter department name', 'error');
            return;
        }

        // Create new department
        const newDept = {
            id: 'D' + Date.now().toString().slice(-6),
            name: this.newDepartment.name,
            description: this.newDepartment.description || '',
            courses: this.newDepartment.courses.filter(c => c.trim() !== ''),
            logo: this.newDepartment.logoUrl || null,
            studentCount: 0,
            facultyCount: 0,
            adminCount: 0,
            assignedAdmin: this.newDepartment.assignedAdmin.name ? {
                id: 'A' + Date.now().toString().slice(-6),
                name: this.newDepartment.assignedAdmin.name,
                email: this.newDepartment.assignedAdmin.email,
                password: this.newDepartment.assignedAdmin.password
            } : null,
            createdDate: new Date().toISOString().split('T')[0],
            lastUpdated: new Date().toISOString().split('T')[0]
        };

        this.departmentsData.push(newDept);
        this.showToast(`Department "${newDept.name}" added successfully!`, 'success');
        this.closeModal();
    }

    handleEditDepartment() {
        if (!this.selectedDepartment.name) {
            this.showToast('Please enter department name', 'error');
            return;
        }

        this.selectedDepartment.lastUpdated = new Date().toISOString().split('T')[0];
        this.showToast(`Department "${this.selectedDepartment.name}" updated successfully!`, 'success');
        this.closeModal();
    }

    handleDeleteDepartment() {
        const index = this.departmentsData.findIndex(d => d.id === this.selectedDepartment.id);
        if (index !== -1) {
            const deletedName = this.departmentsData[index].name;
            this.departmentsData.splice(index, 1);
            this.showToast(`Department "${deletedName}" deleted successfully!`, 'success');
            this.closeModal();
        }
    }

    resetAdminPassword(deptId) {
        const dept = this.departmentsData.find(d => d.id === deptId);
        if (dept && dept.assignedAdmin) {
            const newPassword = prompt(`Reset password for ${dept.assignedAdmin.name}? Enter new password:`);
            if (newPassword) {
                dept.assignedAdmin.password = newPassword;
                this.showToast(`Password reset for ${dept.assignedAdmin.name}`, 'success');
                this.app.render();
            }
        }
    }

    assignAdmin(deptId) {
        const dept = this.departmentsData.find(d => d.id === deptId);
        if (dept) {
            const name = prompt("Enter admin name:");
            const email = prompt("Enter admin email:");
            const password = prompt("Enter admin password:");
            
            if (name && email && password) {
                dept.assignedAdmin = {
                    id: 'A' + Date.now().toString().slice(-6),
                    name: name,
                    email: email,
                    password: password
                };
                dept.adminCount = (dept.adminCount || 0) + 1;
                this.showToast(`Admin assigned to ${dept.name}`, 'success');
                this.app.render();
            }
        }
    }

    exportUsers(deptId) {
        const dept = this.departmentsData.find(d => d.id === deptId);
        const users = this.mockUsers.filter(u => u.department === dept?.name);
        
        if (users.length === 0) {
            this.showToast('No users to export', 'error');
            return;
        }
        
        // Create CSV content
        const headers = ['Name', 'Email', 'Student ID', 'Role', 'Course', 'Year Level', 'Status', 'Join Date'];
        const csvRows = [
            headers.join(','),
            ...users.map(user => [
                `"${user.name}"`,
                `"${user.email}"`,
                user.studentId || 'N/A',
                user.role,
                user.course || 'N/A',
                user.yearLevel || 'N/A',
                user.isActive ? 'Active' : 'Inactive',
                user.joinDate
            ].join(','))
        ];
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dept?.name.replace(/\s+/g, '_')}_users_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showToast(`Exported ${users.length} users from ${dept?.name}`, 'success');
    }

    viewUserProfile(userId) {
        const user = this.mockUsers.find(u => u.id === userId);
        if (user) {
            alert(`Viewing profile for: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}\nDepartment: ${user.department}`);
        }
    }

    editUser(userId) {
        const user = this.mockUsers.find(u => u.id === userId);
        if (user) {
            alert(`Editing user: ${user.name}\nThis would open an edit user modal.`);
        }
    }

    removeUserFromDept(userId, departmentName) {
        if (confirm(`Remove this user from ${departmentName}?`)) {
            const user = this.mockUsers.find(u => u.id === userId);
            if (user) {
                user.department = 'Unassigned';
                this.showToast(`User removed from ${departmentName}`, 'success');
                this.app.render();
            }
        }
    }

    showToast(message, type = 'success') {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} animate-fade-in`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-4', 'transition-all', 'duration-300');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }
}

// ============================================
// MERCH RELEASE MODULE (Complete - React Style)
// ============================================

class MerchRelease {
    constructor(app) {
        this.app = app;
        this.orders = this.getMockOrders();
        this.scanMode = 'manual';
        this.manualCode = '';
        this.studentId = '';
        this.scannedOrder = null;
        this.studentIdVerified = false;
        this.studentIdError = false;
        this.isProcessing = false;
        this.isCameraActive = false;
        this.recentReleases = [];
    }

    getMockOrders() {
        return [
            {
                id: 'ORD-001',
                orderCode: 'MERCH-ORD001-2023001',
                status: 'ready-for-pickup',
                userName: 'John Martinez',
                studentId: 'S024045',
                course: 'Computer Engineering',
                date: '2024-01-15',
                total: 40.00,
                paymentMethod: 'Credit Card',
                remainingBalance: 0,
                items: [
                    { productName: 'Campus T-Shirt', quantity: 1, price: 25.00, size: 'L', color: 'Navy' },
                    { productName: 'Engineering Cap', quantity: 1, price: 15.00 }
                ]
            },
            {
                id: 'ORD-002',
                orderCode: 'MERCH-ORD002-S024045',
                status: 'ready-for-pickup',
                userName: 'Sarah Chen',
                studentId: 'S024045',
                course: 'Electrical Engineering',
                date: '2024-02-10',
                total: 65.00,
                paymentMethod: 'Cash',
                remainingBalance: 0,
                items: [
                    { productName: 'Hoodie', quantity: 1, price: 45.00, size: 'M', color: 'Black' },
                    { productName: 'Notebook', quantity: 2, price: 10.00 }
                ]
            },
            {
                id: 'ORD-003',
                orderCode: 'MERCH-ORD003-2024003',
                status: 'ready-for-pickup',
                userName: 'Michael Reyes',
                studentId: 'S00789',
                course: 'Mechanical Engineering',
                date: '2024-01-20',
                total: 120.00,
                paymentMethod: 'Credit Card',
                remainingBalance: 30.00,
                items: [
                    { productName: 'Varsity Jacket', quantity: 1, price: 80.00, size: 'XL', color: 'Burgundy' },
                    { productName: 'Baseball Cap', quantity: 1, price: 20.00 },
                    { productName: 'Water Bottle', quantity: 1, price: 20.00 }
                ]
            },
            {
                id: 'ORD-004',
                orderCode: 'MERCH-ORD004-2024004',
                status: 'completed',
                userName: 'Lisa Tan',
                studentId: 'S01234',
                course: 'Business Management',
                date: '2024-01-18',
                total: 35.00,
                pickupDate: new Date().toISOString().split('T')[0],
                paymentMethod: 'Cash',
                remainingBalance: 0,
                items: [
                    { productName: 'Polo Shirt', quantity: 1, price: 35.00, size: 'S', color: 'White' }
                ]
            }
        ];
    }

    render() {
        const readyOrders = this.orders.filter(o => o.status === 'ready-for-pickup');
        const completedToday = this.orders.filter(o => 
            o.status === 'completed' && o.pickupDate === new Date().toISOString().split('T')[0]
        );

        return `
            <div class="p-4 lg:p-6 space-y-4 lg:space-y-6 pb-20 lg:pb-6">
                <!-- Header Section -->
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-xl lg:text-3xl font-bold text-gray-900">Merchandise Release Station</h2>
                        <p class="text-gray-600 text-sm lg:text-base">Scan order codes to verify and release purchases</p>
                    </div>
                    <div class="flex gap-2 lg:gap-4">
                        <!-- Ready for Pickup Card -->
                        <div class="bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-red-50 flex items-center justify-center">
                                    <i class="fas fa-box text-[#B43A4E] text-lg lg:text-xl"></i>
                                </div>
                                <div>
                                    <p class="text-xs lg:text-sm text-gray-600">Ready for Pickup</p>
                                    <p class="text-[#B43A4E] text-sm lg:text-base font-bold">${readyOrders.length}</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Released Today Card -->
                        <div class="bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                    <i class="fas fa-check-circle text-green-600 text-lg lg:text-xl"></i>
                                </div>
                                <div>
                                    <p class="text-xs lg:text-sm text-gray-600">Released Today</p>
                                    <p class="text-green-600 text-sm lg:text-base font-bold">${completedToday.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Content Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Scanner Section -->
                    <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-4 lg:p-6 space-y-4 lg:space-y-6">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg lg:text-xl font-semibold text-gray-900">Scan Order</h3>
                            <div class="flex gap-2">
                                <button class="scanner-mode-btn ${this.scanMode === 'camera' ? 'bg-[#B43A4E] text-white' : 'bg-white text-gray-700 border border-gray-300'}" 
                                        onclick="app.modules.merchRelease.setScanMode('camera')">
                                    <i class="fas fa-camera mr-2"></i>
                                    Camera
                                </button>
                                <button class="scanner-mode-btn ${this.scanMode === 'manual' ? 'bg-[#B43A4E] text-white' : 'bg-white text-gray-700 border border-gray-300'}" 
                                        onclick="app.modules.merchRelease.setScanMode('manual')">
                                    <i class="fas fa-keyboard mr-2"></i>
                                    Manual
                                </button>
                            </div>
                        </div>
                        
                        ${this.scanMode === 'camera' ? this.renderCameraScanner() : this.renderManualScanner()}
                    </div>

                    <!-- Orders Ready for Pickup -->
                    <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-4 lg:p-6 space-y-4 lg:space-y-6">
                        <h3 class="text-lg lg:text-xl font-semibold text-gray-900">Ready for Pickup (${readyOrders.length})</h3>
                        
                        <div class="space-y-3 max-h-[500px] overflow-y-auto">
                            ${readyOrders.length === 0 ? this.renderEmptyOrders() : readyOrders.map(order => this.renderOrderCard(order)).join('')}
                        </div>
                    </div>
                </div>

                <!-- Recent Releases Section -->
                ${this.recentReleases.length > 0 ? this.renderRecentReleases() : ''}

                <!-- Verification Dialog -->
                ${this.scannedOrder ? this.renderVerificationDialog() : ''}
            </div>
        `;
    }

    renderCameraScanner() {
        return `
            <div class="space-y-4">
                <!-- Camera Preview -->
                <div class="relative bg-gray-900 rounded-lg overflow-hidden" style="height: 400px;">
                    ${this.isCameraActive ? `
                        <div class="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <div class="text-center">
                                <i class="fas fa-camera text-gray-400 text-4xl mb-4"></i>
                                <p class="text-gray-300">Camera Preview</p>
                            </div>
                        </div>
                    ` : `
                        <div class="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <div class="text-center">
                                <i class="fas fa-video-slash text-gray-400 text-4xl mb-4"></i>
                                <p class="text-gray-300">Camera inactive</p>
                            </div>
                        </div>
                    `}
                    <div class="absolute inset-0 border-4 border-blue-500 border-dashed m-12 rounded-lg pointer-events-none"></div>
                    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                        Position barcode within the frame
                    </div>
                </div>

                <!-- Camera Alert -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                        <i class="fas fa-barcode text-blue-600 mt-0.5"></i>
                        <div>
                            <p class="text-sm text-blue-900">
                                Camera scanning is simulated. Use manual entry below or click "Simulate Scan" to test.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Simulate Scan Button -->
                <button class="w-full bg-[#B43A4E] text-white rounded-lg py-3 px-4 font-medium hover:bg-[#9a3145] transition-colors flex items-center justify-center gap-2" 
                        onclick="app.modules.merchRelease.simulateScan()">
                    <i class="fas fa-barcode"></i>
                    Simulate Scan (ORD-002 with ID S024045)
                </button>
            </div>
        `;
    }

    renderManualScanner() {
        return `
            <div class="space-y-4">
                <!-- Manual Entry Area -->
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 lg:p-8 space-y-4 lg:space-y-6">
                    <div class="text-center">
                        <i class="fas fa-keyboard text-gray-400 text-4xl lg:text-5xl mb-3"></i>
                        <p class="text-gray-600 text-sm lg:text-base">Manual Entry Mode</p>
                    </div>
                    
                    <div class="space-y-4 lg:space-y-6">
                        <!-- Order Code Input -->
                        <div>
                            <label class="block text-sm lg:text-base font-medium text-gray-700 mb-2">Enter Order Code</label>
                            <input type="text" 
                                   id="manual-code"
                                   placeholder="MERCH-ORD001-2023001"
                                   value="${this.manualCode}"
                                   oninput="app.modules.merchRelease.updateManualCode(this.value)"
                                   onkeypress="if(event.key === 'Enter') app.modules.merchRelease.handleManualScan()"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B43A4E] focus:border-transparent uppercase font-mono">
                        </div>

                        <!-- Student ID Input -->
                        <div>
                            <label class="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                                Enter Student/Faculty ID <span class="text-red-500">(Required)</span>
                            </label>
                            <input type="text" 
                                   id="student-id"
                                   placeholder="S024045 or F000001"
                                   value="${this.studentId}"
                                   oninput="app.modules.merchRelease.updateStudentId(this.value)"
                                   onkeypress="if(event.key === 'Enter') app.modules.merchRelease.handleManualScan()"
                                   class="w-full px-4 py-3 border ${this.studentIdError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B43A4E] focus:border-transparent uppercase">
                            ${this.studentIdError ? `
                                <p class="mt-1 text-sm text-red-600">Student ID does not match the order!</p>
                            ` : ''}
                        </div>

                        <!-- Scan Button -->
                        <button class="w-full bg-[#B43A4E] text-white rounded-lg py-3 px-4 font-medium hover:bg-[#9a3145] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                                onclick="app.modules.merchRelease.handleManualScan()" 
                                ${this.isProcessing ? 'disabled' : ''}>
                            ${this.isProcessing ? 
                                '<i class="fas fa-spinner fa-spin mr-2"></i> Scanning...' : 
                                '<i class="fas fa-search mr-2"></i> Scan & Verify'}
                        </button>
                    </div>
                </div>

                <!-- Test Order Alert -->
                <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                        <i class="fas fa-info-circle text-amber-600 mt-0.5"></i>
                        <div>
                            <p class="font-medium text-amber-900">Test Order</p>
                            <p class="text-sm text-amber-800">
                                Code: <strong>MERCH-ORD002-S024045</strong> | ID: <strong>S024045</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderOrderCard(order) {
        return `
            <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                <div class="space-y-3">
                    <!-- Order Header -->
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-hashtag text-gray-400"></i>
                            <span class="font-mono text-sm">${order.orderCode}</span>
                        </div>
                        <span class="px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Ready</span>
                    </div>

                    <!-- Separator -->
                    <div class="h-px bg-gray-200"></div>

                    <!-- Order Details Grid -->
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div class="flex items-center gap-1 text-gray-600">
                            <i class="fas fa-user text-gray-400"></i>
                            <span class="truncate">${order.userName}</span>
                        </div>
                        <div class="flex items-center gap-1 text-gray-600">
                            <i class="fas fa-id-card text-gray-400"></i>
                            <span class="truncate">${order.studentId}</span>
                        </div>
                        <div class="flex items-center gap-1 text-gray-600">
                            <i class="fas fa-box text-gray-400"></i>
                            <span>${order.items.length} item(s)</span>
                        </div>
                        <div class="flex items-center gap-1 text-gray-600">
                            <i class="fas fa-credit-card text-gray-400"></i>
                            <span>₱${order.total.toFixed(2)}</span>
                        </div>
                    </div>

                    <!-- Quick Release Button -->
                    <button class="w-full border border-gray-300 text-gray-700 rounded-lg py-2 px-4 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2" 
                            onclick="app.modules.merchRelease.quickRelease('${order.orderCode}')">
                        <i class="fas fa-barcode"></i>
                        Quick Release
                    </button>
                </div>
            </div>
        `;
    }

    renderEmptyOrders() {
        return `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-box text-gray-300 text-4xl mb-3"></i>
                <p class="text-gray-500">No orders ready for pickup</p>
            </div>
        `;
    }

    renderRecentReleases() {
        return `
            <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-4 lg:p-6 space-y-4 lg:space-y-6">
                <h3 class="text-lg lg:text-xl font-semibold text-gray-900">Recent Releases</h3>
                <div class="space-y-2">
                    ${this.recentReleases.slice(0, 5).map(order => `
                        <div class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div class="flex items-center gap-3">
                                <i class="fas fa-check-circle text-green-600"></i>
                                <div>
                                    <p class="text-sm">
                                        <strong>${order.id}</strong> - ${order.userName}
                                    </p>
                                    <p class="text-xs text-gray-600">
                                        ${order.orderCode} • Student ID verified
                                    </p>
                                </div>
                            </div>
                            <span class="px-2.5 py-0.5 text-xs font-medium bg-white text-green-800 border border-green-300 rounded-full">Released</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderVerificationDialog() {
        const order = this.scannedOrder;
        
        return `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onclick="app.modules.merchRelease.closeVerificationDialog()">
                <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                    <!-- Dialog Header -->
                    <div class="sticky top-0 bg-white border-b border-gray-200 p-4 lg:p-6 flex justify-between items-center">
                        <div class="flex items-center gap-2">
                            ${this.studentIdVerified ? 
                                '<i class="fas fa-check-circle text-green-600 text-lg"></i>' : 
                                '<i class="fas fa-exclamation-circle text-orange-600 text-lg"></i>'}
                            <h3 class="text-lg lg:text-xl font-semibold text-gray-900">Verify Order Details</h3>
                        </div>
                        <button class="text-gray-500 hover:text-gray-700 transition-colors" onclick="app.modules.merchRelease.closeVerificationDialog()">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <!-- Dialog Body -->
                    <div class="p-4 lg:p-6 space-y-4 lg:space-y-6">
                        <!-- Alert -->
                        ${this.studentIdVerified ? this.renderVerifiedAlert() : this.renderVerificationNeededAlert()}

                        <!-- Order Information -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <p class="text-sm text-gray-600">Order Code</p>
                                <p class="font-mono bg-gray-100 px-3 py-2 rounded">${order.orderCode}</p>
                            </div>
                            <div class="space-y-1">
                                <p class="text-sm text-gray-600">Order ID</p>
                                <p class="bg-gray-100 px-3 py-2 rounded">${order.id}</p>
                            </div>
                        </div>

                        <div class="h-px bg-gray-200"></div>

                        <!-- Student ID Verification -->
                        ${!this.studentIdVerified ? this.renderStudentIdVerification() : this.renderVerifiedId()}

                        <div class="h-px bg-gray-200"></div>

                        <!-- Customer Information -->
                        <div class="space-y-3">
                            <h4 class="font-semibold text-gray-900">Customer Information</h4>
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                                <div class="flex items-center gap-2">
                                    <i class="fas fa-user text-gray-400"></i>
                                    <div>
                                        <p class="text-gray-600">Name</p>
                                        <p class="font-medium">${order.userName}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i class="fas fa-id-card text-gray-400"></i>
                                    <div>
                                        <p class="text-gray-600">Student ID</p>
                                        <p class="font-medium">${order.studentId}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i class="fas fa-graduation-cap text-gray-400"></i>
                                    <div>
                                        <p class="text-gray-600">Course</p>
                                        <p>${order.course}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i class="fas fa-calendar text-gray-400"></i>
                                    <div>
                                        <p class="text-gray-600">Order Date</p>
                                        <p>${this.formatDate(order.date)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="h-px bg-gray-200"></div>

                        <!-- Order Items -->
                        <div class="space-y-3">
                            <h4 class="font-semibold text-gray-900">Order Items</h4>
                            <div class="space-y-2">
                                ${order.items.map((item, index) => `
                                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p class="font-medium">${item.productName}</p>
                                            <p class="text-sm text-gray-600">
                                                Qty: ${item.quantity}
                                                ${item.size ? ` • Size: ${item.size}` : ''}
                                                ${item.color ? ` • Color: ${item.color}` : ''}
                                            </p>
                                        </div>
                                        <p class="font-semibold">₱${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="h-px bg-gray-200"></div>

                        <!-- Payment Summary -->
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-600">Payment Method</p>
                                <p>${order.paymentMethod}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-gray-600">Total Amount</p>
                                <p class="text-[#B43A4E] font-bold text-lg">₱${order.total.toFixed(2)}</p>
                            </div>
                        </div>

                        <!-- Balance Warning -->
                        ${order.remainingBalance && order.remainingBalance > 0 ? this.renderBalanceWarning(order) : ''}

                        <!-- Action Buttons -->
                        <div class="flex gap-3 pt-4">
                            <button class="flex-1 border border-gray-300 text-gray-700 rounded-lg py-3 px-4 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2" 
                                    onclick="app.modules.merchRelease.closeVerificationDialog()">
                                <i class="fas fa-times-circle"></i>
                                Cancel
                            </button>
                            <button class="flex-1 bg-[#B43A4E] text-white rounded-lg py-3 px-4 font-medium hover:bg-[#9a3145] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                                    onclick="app.modules.merchRelease.handleReleaseOrder()"
                                    ${!this.studentIdVerified ? 'disabled' : ''}>
                                <i class="fas fa-check-circle"></i>
                                ${this.studentIdVerified ? 'Release Merchandise' : 'Verify Student ID First'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderVerifiedAlert() {
        return `
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                    <i class="fas fa-check-circle text-green-600"></i>
                    <div>
                        <p class="font-medium text-green-900">ID Verified!</p>
                        <p class="text-sm text-green-800">Order is ready for release.</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderVerificationNeededAlert() {
        const alertType = this.studentIdError ? 'red' : 'orange';
        const icon = this.studentIdError ? 'fa-exclamation-triangle' : 'fa-exclamation-circle';
        const title = this.studentIdError ? 'ID Mismatch!' : 'ID Verification Required';
        
        return `
            <div class="bg-${alertType}-50 border border-${alertType}-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                    <i class="fas ${icon} text-${alertType}-600"></i>
                    <div>
                        <p class="font-medium text-${alertType}-900">${title}</p>
                        <p class="text-sm text-${alertType}-800">
                            Please verify the customer's ID (Student/Faculty) before releasing merchandise.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    renderStudentIdVerification() {
        return `
            <div class="space-y-3">
                <h4 class="font-semibold text-gray-900">Student ID Verification</h4>
                <div class="flex gap-2">
                    <div class="flex-1">
                        <input type="text" 
                               id="verify-student-id"
                               placeholder="Enter Student ID to verify"
                               value="${this.studentId}"
                               oninput="app.modules.merchRelease.updateVerificationStudentId(this.value)"
                               onkeypress="if(event.key === 'Enter') app.modules.merchRelease.verifyStudentId()"
                               class="w-full px-4 py-3 border ${this.studentIdError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B43A4E] focus:border-transparent uppercase">
                        <p class="text-xs text-gray-500 mt-1">
                            Expected: ${this.scannedOrder.studentId}
                        </p>
                    </div>
                    <button class="bg-green-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2" 
                            onclick="app.modules.merchRelease.verifyStudentId()">
                        <i class="fas fa-check-circle"></i>
                        Verify
                    </button>
                </div>
            </div>
        `;
    }

    renderVerifiedId() {
        return `
            <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex items-center gap-2 text-green-700">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <p class="font-medium">Student ID Verified</p>
                        <p class="text-sm">${this.scannedOrder.studentId}</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderBalanceWarning(order) {
        return `
            <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                    <i class="fas fa-exclamation-circle text-orange-600"></i>
                    <div>
                        <p class="font-medium text-orange-900">Remaining Balance: ₱${order.remainingBalance.toFixed(2)}</p>
                        <p class="text-sm text-orange-800">
                            Customer must pay remaining balance before releasing merchandise.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showToast(message, type = 'success') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in`;
        toast.style.cssText = type === 'success' 
            ? 'background-color: #10b981; color: white;' 
            : 'background-color: #ef4444; color: white;';
        
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    setScanMode(mode) {
        this.scanMode = mode;
        if (mode === 'camera') {
            this.isCameraActive = true;
        } else {
            this.isCameraActive = false;
        }
        this.app.render();
    }

    updateManualCode(value) {
        this.manualCode = value.toUpperCase();
    }

    updateStudentId(value) {
        this.studentId = value.toUpperCase();
        this.studentIdError = false;
    }

    updateVerificationStudentId(value) {
        this.studentId = value.toUpperCase();
        this.studentIdError = false;
    }

    simulateScan() {
        this.manualCode = 'MERCH-ORD002-S024045';
        this.studentId = 'S024045';
        this.handleManualScan();
    }

    handleManualScan() {
        if (!this.manualCode.trim()) {
            this.showToast('Please enter an order code', 'error');
            return;
        }

        if (!this.studentId.trim()) {
            this.showToast('Please enter a student ID', 'error');
            return;
        }

        this.isProcessing = true;
        this.app.render();

        setTimeout(() => {
            const order = this.orders.find(o => 
                o.orderCode === this.manualCode && o.status === 'ready-for-pickup'
            );
            
            if (order) {
                this.scannedOrder = order;
                
                // Verify student ID immediately
                if (order.studentId === this.studentId) {
                    this.studentIdVerified = true;
                    this.studentIdError = false;
                    this.showToast('Order found and student ID verified!', 'success');
                } else {
                    this.studentIdVerified = false;
                    this.studentIdError = true;
                    this.showToast('Student ID does not match the order!', 'error');
                }
            } else {
                const alreadyReleased = this.orders.find(o => 
                    o.orderCode === this.manualCode && o.status === 'completed'
                );
                
                if (alreadyReleased) {
                    this.showToast('This order has already been released.', 'error');
                } else {
                    this.showToast('Invalid order code or order not ready for pickup.', 'error');
                }
            }
            
            this.isProcessing = false;
            this.manualCode = '';
            this.app.render();
        }, 800);
    }

    quickRelease(orderCode) {
        const order = this.orders.find(o => o.orderCode === orderCode);
        if (order) {
            this.scannedOrder = order;
            this.studentId = '';
            this.studentIdVerified = false;
            this.studentIdError = false;
            this.app.render();
        }
    }

    verifyStudentId() {
        if (!this.scannedOrder || !this.studentId.trim()) {
            this.showToast('Please enter student ID', 'error');
            return;
        }

        if (this.scannedOrder.studentId === this.studentId.toUpperCase()) {
            this.studentIdVerified = true;
            this.studentIdError = false;
            this.showToast('Student ID verified successfully!', 'success');
        } else {
            this.studentIdVerified = false;
            this.studentIdError = true;
            this.showToast(`Student ID mismatch! Expected: ${this.scannedOrder.studentId}`, 'error');
        }
        
        this.app.render();
    }

    handleReleaseOrder() {
        if (!this.scannedOrder) return;

        if (!this.studentIdVerified) {
            this.showToast('Please verify student ID before releasing merchandise', 'error');
            return;
        }

        // Update order status
        this.orders = this.orders.map(o => {
            if (o.id === this.scannedOrder.id) {
                return {
                    ...o,
                    status: 'completed',
                    pickupDate: new Date().toISOString().split('T')[0]
                };
            }
            return o;
        });

        // Add to recent releases
        this.recentReleases = [this.scannedOrder, ...this.recentReleases];

        this.showToast(`Order ${this.scannedOrder.id} released successfully!`, 'success');
        
        // Reset state
        this.scannedOrder = null;
        this.studentId = '';
        this.studentIdVerified = false;
        this.studentIdError = false;
        this.isCameraActive = false;
        
        this.app.render();
    }

    closeVerificationDialog() {
        this.scannedOrder = null;
        this.studentId = '';
        this.studentIdVerified = false;
        this.studentIdError = false;
        this.app.render();
    }
}

// ============================================
// COMMUNITY APPROVAL MODULE (Styled like React)
// ============================================

class CommunityApproval {
    constructor(app) {
        this.app = app;
        this.currentTab = 'designs';
        this.state = {
            designs: [],
            approvedDesigns: [],
            rejectedDesigns: [],
            announcements: [],
            communityVotes: []
        };
        
        // Initialize mock data
        this.initializeMockData();
    }

    initializeMockData() {
        // Mock designs
        this.state.designs = [
            {
                id: 'DES-1',
                name: 'Campus Pride T-Shirt',
                description: 'A vibrant t-shirt design showcasing campus spirit\nEvent Name: Spring Festival 2024\nProduct Type: T-Shirt',
                thumbnail: '',
                productType: 'T-Shirt',
                date: '2024-03-15',
                status: 'pending'
            },
            {
                id: 'DES-2',
                name: 'Graduation Hoodie',
                description: 'Comfortable hoodie for graduating students\nEvent Name: Graduation 2024\nProduct Type: Hoodie',
                thumbnail: '',
                productType: 'Hoodie',
                date: '2024-03-14',
                status: 'pending'
            }
        ];

        // Mock announcements
        this.state.announcements = [
            {
                id: 'ANN-1',
                title: 'New Product Release!',
                message: 'Check out our new line of campus merchandise available now in the store.',
                type: 'release',
                priority: 'medium',
                date: '2024-03-15',
                isActive: true,
                images: [],
                comments: []
            },
            {
                id: 'ANN-2',
                title: 'Important Notice',
                message: 'System maintenance scheduled for this weekend.',
                type: 'general',
                priority: 'high',
                date: '2024-03-14',
                isActive: true,
                images: [],
                comments: []
            }
        ];
    }

    render() {
        return `
            <div class="p-4 lg:p-6 space-y-4 lg:space-y-6 pb-20 lg:pb-6">
                <!-- Header -->
                <div>
                    <h2 class="text-xl lg:text-3xl font-bold text-gray-900">Community & Design Approval</h2>
                    <p class="text-gray-600 text-sm lg:text-base">Review and approve student submissions</p>
                </div>

                <!-- Tabs -->
                <div class="tabs-container">
                    <div class="tabs-list grid grid-cols-3">
                        <button class="tab-trigger ${this.currentTab === 'community-vote' ? 'active' : ''}" 
                                onclick="app.modules.communityApproval.setTab('community-vote')">
                            <span class="hidden lg:inline">Community Vote</span>
                            <span class="lg:hidden">Vote</span>
                            ${this.state.communityVotes.length > 0 ? 
                                `<span class="badge ml-2 bg-[#B43A4E] text-white">${this.state.communityVotes.length}</span>` : ''}
                        </button>
                        <button class="tab-trigger ${this.currentTab === 'designs' ? 'active' : ''}" 
                                onclick="app.modules.communityApproval.setTab('designs')">
                            <span class="hidden lg:inline">Design Submission</span>
                            <span class="lg:hidden">Designs</span>
                            ${this.state.designs.length > 0 ? 
                                `<span class="badge ml-2 bg-[#B43A4E] text-white">${this.state.designs.length}</span>` : ''}
                        </button>
                        <button class="tab-trigger ${this.currentTab === 'announcements' ? 'active' : ''}" 
                                onclick="app.modules.communityApproval.setTab('announcements')">
                            <span class="hidden lg:inline">Announcements</span>
                            <span class="lg:hidden">News</span>
                            ${this.state.announcements.filter(a => a.isActive).length > 0 ? 
                                `<span class="badge ml-2 bg-[#B43A4E] text-white">${this.state.announcements.filter(a => a.isActive).length}</span>` : ''}
                        </button>
                    </div>

                    <!-- Tab Contents -->
                    <div class="tab-contents p-6">
                        ${this.currentTab === 'designs' ? this.renderDesignsTab() :
                          this.currentTab === 'announcements' ? this.renderAnnouncementsTab() :
                          this.renderCommunityVoteTab()}
                    </div>
                </div>
            </div>
        `;
    }

    setTab(tab) {
        this.currentTab = tab;
        this.app.render();
    }

    renderDesignsTab() {
        if (this.state.designs.length === 0 && this.state.approvedDesigns.length === 0 && this.state.rejectedDesigns.length === 0) {
            return `
                <div class="card p-8 text-center border-gray-200">
                    <p class="text-gray-600">No designs to review</p>
                </div>
            `;
        }

        const groupedApproved = this.groupApprovedByEvent();

        return `
            <div class="space-y-6">
                ${this.state.designs.length > 0 ? `
                    <div>
                        <h4 class="mb-2 font-semibold">Pending Designs</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            ${this.state.designs.map(design => `
                                <div class="card p-6 border-[#FF8C00] hover:shadow-lg transition-shadow">
                                    <div class="design-image-container mb-4">
                                        <div class="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
                                            <i class="fas fa-tshirt text-4xl text-gray-400"></i>
                                        </div>
                                    </div>
                                    <h3 class="font-semibold mb-1">${design.name}</h3>
                                    <p class="text-sm text-gray-600">Product: ${design.productType}</p>
                                    <p class="text-sm text-gray-600 mt-2 whitespace-pre-line">${design.description}</p>
                                    <div class="flex gap-3 mt-3">
                                        <button class="btn btn-primary flex-1 gap-2 bg-[#B43A4E] hover:bg-[#8B2E3C] text-white"
                                                onclick="app.modules.communityApproval.handleDesignApproval('${design.id}', true)">
                                            <i class="fas fa-check-circle"></i> Approve
                                        </button>
                                        <button class="btn btn-outline flex-1 gap-2 text-red-600 border-red-300 hover:bg-red-50"
                                                onclick="app.modules.communityApproval.handleDesignApproval('${design.id}', false)">
                                            <i class="fas fa-times-circle"></i> Reject
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${this.state.approvedDesigns.length > 0 ? `
                    <div>
                        <h4 class="mb-2 font-semibold">Approved Designs (Album by Event)</h4>
                        <div class="space-y-6">
                            ${Object.keys(groupedApproved).map(eventName => `
                                <div class="event-group">
                                    <div class="event-header">
                                        <h5 class="event-title">${eventName}</h5>
                                        <span class="badge bg-[#B43A4E] text-white">${groupedApproved[eventName].length} designs</span>
                                    </div>
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        ${groupedApproved[eventName].map(d => `
                                            <div class="card p-2 cursor-pointer border-gray-200 hover:border-[#B43A4E] hover:shadow-md transition-all"
                                                 onclick="app.modules.communityApproval.viewDesign('${d.id}')">
                                                <div class="w-full h-32 bg-gray-100 flex items-center justify-center rounded-md mb-2">
                                                    <i class="fas fa-tshirt text-2xl text-gray-400"></i>
                                                </div>
                                                <p class="text-sm font-medium truncate">${d.name}</p>
                                                <p class="text-xs text-gray-500 truncate">${d.productType}</p>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${this.state.rejectedDesigns.length > 0 ? `
                    <div>
                        <h4 class="mb-2 font-semibold">Rejected Designs</h4>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                            ${this.state.rejectedDesigns.map(d => `
                                <div class="card p-2 opacity-60 border-gray-300">
                                    <div class="w-full h-32 bg-gray-100 flex items-center justify-center rounded-md mb-2">
                                        <i class="fas fa-tshirt text-2xl text-gray-400"></i>
                                    </div>
                                    <p class="text-sm truncate">${d.name}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderAnnouncementsTab() {
        const announcementCount = this.state.announcements.filter(a => a.isActive).length;

        return `
            <div class="space-y-4">
                <div class="flex justify-between items-center mb-4">
                    <p class="text-sm text-gray-600">Create and manage campus announcements</p>
                    <button class="btn btn-primary gap-2" onclick="app.modules.communityApproval.showAnnouncementModal()">
                        <i class="fas fa-plus"></i> New Announcement
                    </button>
                </div>

                ${announcementCount === 0 ? `
                    <div class="card p-8 text-center border-gray-200">
                        <i class="fas fa-bullhorn text-4xl text-gray-400 mx-auto mb-3"></i>
                        <p class="text-gray-600">No announcements yet</p>
                    </div>
                ` : `
                    <div class="space-y-4">
                        ${this.state.announcements.map(announcement => {
                            let gradientClass = '';
                            let priorityBadge = '';
                            
                            switch (announcement.priority) {
                                case 'high':
                                    gradientClass = 'announcement-high bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-[#B43A4E]';
                                    priorityBadge = '<span class="badge bg-[#B43A4E] text-white">High</span>';
                                    break;
                                case 'medium':
                                    gradientClass = 'announcement-medium bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-[#FF8C00]';
                                    priorityBadge = '<span class="badge bg-[#FF8C00] text-white">Medium</span>';
                                    break;
                                default:
                                    gradientClass = 'announcement-low bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-300';
                                    priorityBadge = '<span class="badge bg-gray-600 text-white">Low</span>';
                            }

                            return `
                                <div class="card p-6 ${gradientClass}">
                                    <div class="space-y-3">
                                        <div class="flex items-center gap-2 justify-between w-full">
                                            <div class="flex items-center gap-2">
                                                <h3 class="${announcement.priority === 'high' ? 'text-[#B43A4E]' : ''}">${announcement.title}</h3>
                                                ${priorityBadge}
                                                <span class="badge badge-outline">${announcement.type}</span>
                                            </div>
                                            <div class="flex gap-2">
                                                <button class="btn btn-sm btn-destructive gap-1"
                                                        onclick="app.modules.communityApproval.handleDeleteAnnouncement('${announcement.id}')">
                                                    <i class="fas fa-trash"></i> Delete
                                                </button>
                                                <button class="btn btn-sm btn-outline"
                                                        onclick="app.modules.communityApproval.handleToggleAnnouncement('${announcement.id}')">
                                                    <i class="fas ${announcement.isActive ? 'fa-eye-slash' : 'fa-eye'}"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <p class="text-gray-700">${announcement.message}</p>
                                        <div class="flex items-center gap-4 text-sm text-gray-600">
                                            <div class="flex items-center gap-1">
                                                <i class="fas fa-calendar"></i>
                                                <span>Posted: ${announcement.date}</span>
                                            </div>
                                            <div class="flex items-center gap-1">
                                                <i class="fas fa-comment"></i>
                                                <span>${announcement.comments.length} Comments</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>
        `;
    }

    renderCommunityVoteTab() {
        return `
            <div class="space-y-4">
                <div class="flex justify-end mb-4">
                    <button class="btn btn-primary gap-2" onclick="app.modules.communityApproval.showVoteModal()">
                        <i class="fas fa-plus"></i> New Vote
                    </button>
                </div>

                ${this.state.communityVotes.length === 0 ? `
                    <div class="card p-8 text-center border-gray-200">
                        <p class="text-gray-600">No community votes yet</p>
                    </div>
                ` : `
                    <div class="space-y-4">
                        ${this.state.communityVotes.map(vote => `
                            <div class="card p-6 border-gray-200 hover:border-[#B43A4E] transition-colors">
                                <h3 class="text-lg font-semibold mb-2">${vote.title}</h3>
                                <p class="text-gray-700 mb-4">${vote.description}</p>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    ${vote.designs.map(design => `
                                        <div class="vote-design-card">
                                            <div class="w-full h-32 bg-gray-100 flex items-center justify-center rounded-md mb-2">
                                                <i class="fas fa-tshirt text-2xl text-gray-400"></i>
                                            </div>
                                            <p class="text-sm font-medium">${design.name}</p>
                                            <div class="flex justify-between text-xs text-gray-500 mt-1">
                                                <span>0 votes</span>
                                                <span>0 comments</span>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    }

    // Helper Methods
    groupApprovedByEvent() {
        const groups = {};
        this.state.approvedDesigns.forEach(design => {
            const eventName = this.extractEventFromDescription(design.description) || 'No Event';
            if (!groups[eventName]) groups[eventName] = [];
            groups[eventName].push(design);
        });
        return groups;
    }

    extractEventFromDescription(desc) {
        if (!desc) return null;
        const lines = desc.split(/\r?\n/).map(l => l.trim());
        for (const line of lines) {
            const match = line.match(/^(?:Event Name|Event)\s*[:\-]\s*(.+)$/i);
            if (match && match[1]) return match[1].trim();
        }
        return null;
    }

    // Event Handlers
    handleDesignApproval(designId, approved) {
        const design = this.state.designs.find(d => d.id === designId);
        if (!design) return;

        if (approved) {
            this.state.approvedDesigns.push({ ...design, status: 'approved' });
            this.showToast('Design approved', 'success');
        } else {
            this.state.rejectedDesigns.push({ ...design, status: 'rejected' });
            this.showToast('Design rejected', 'success');
        }

        this.state.designs = this.state.designs.filter(d => d.id !== designId);
        this.app.render();
    }

    handleDeleteAnnouncement(id) {
        this.state.announcements = this.state.announcements.filter(a => a.id !== id);
        this.showToast('Announcement deleted', 'success');
        this.app.render();
    }

    handleToggleAnnouncement(id) {
        const announcement = this.state.announcements.find(a => a.id === id);
        if (announcement) {
            announcement.isActive = !announcement.isActive;
            this.app.render();
        }
    }

    showAnnouncementModal() {
        // Implementation for announcement modal
        console.log('Show announcement modal');
    }

    showVoteModal() {
        // Implementation for vote modal
        console.log('Show vote modal');
    }

    viewDesign(designId) {
        const design = [...this.state.designs, ...this.state.approvedDesigns, ...this.state.rejectedDesigns]
            .find(d => d.id === designId);
        if (design) {
            // Show design viewer modal
            console.log('View design:', design);
        }
    }

    showToast(message, type = 'info') {
        // Toast implementation
        console.log(`${type}: ${message}`);
    }
}

// ============================================
// USER VERIFICATION MODULE (Simplified)
// ============================================

class UserVerification {
    constructor(app) {
        this.app = app;
        this.searchTerm = '';
        this.filterStatus = 'all';
        this.selectedRequest = null;
    }

    render() {
        const requests = [
            {
                id: 'VR001',
                userName: 'John Doe',
                userId: 'S002301',
                requestType: 'department',
                currentValue: 'College of Engineering',
                newValue: 'College of Computer Studies',
                submittedDate: '2024-11-25',
                status: 'pending'
            },
            {
                id: 'VR002',
                userName: 'Jane Smith',
                userId: 'S024045',
                requestType: 'role_to_alumni',
                currentValue: 'Student',
                newValue: 'Alumni',
                submittedDate: '2024-11-24',
                status: 'pending'
            }
        ];

        const filteredRequests = requests.filter(r => {
            const matchesSearch = 
                r.userName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                r.userId.toLowerCase().includes(this.searchTerm.toLowerCase());
            
            const matchesFilter = this.filterStatus === 'all' || r.status === this.filterStatus;
            
            return matchesSearch && matchesFilter;
        });

        return `
            <div class="verification-container p-4 lg:p-6 space-y-6">
                <!-- Header -->
                <div>
                    <h2 class="text-2xl font-bold text-red-700">User Verification</h2>
                    <p class="text-gray-600">Review and approve student verification requests</p>
                </div>

                <!-- Filters and Search -->
                <div class="filters-card">
                    <div class="flex flex-col lg:flex-row gap-4">
                        <div class="search-container">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" 
                                   placeholder="Search by name or user ID..." 
                                   value="${this.searchTerm}"
                                   oninput="app.modules.userVerification.handleSearch(this.value)"
                                   class="search-input">
                        </div>
                        <div class="filter-buttons">
                            <button class="filter-btn ${this.filterStatus === 'all' ? 'active' : ''}" 
                                    onclick="app.modules.userVerification.setFilterStatus('all')">
                                All
                            </button>
                            <button class="filter-btn ${this.filterStatus === 'pending' ? 'active' : ''}" 
                                    onclick="app.modules.userVerification.setFilterStatus('pending')">
                                Pending
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Requests Table -->
                <div class="verification-table-container">
                    <table class="verification-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Request Type</th>
                                <th>Change Details</th>
                                <th>Submitted</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredRequests.map(request => `
                                <tr>
                                    <td>
                                        <div>
                                            <p class="font-medium text-gray-900">${request.userName}</p>
                                            <p class="text-sm text-gray-500 font-mono">${request.userId}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="request-type-badge">
                                            <i class="fas fa-building"></i>
                                            <span>${request.requestType === 'department' ? 'Department Transfer' : 'Role Change'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="change-details">
                                            <div class="flex items-center">
                                                <span class="current-value">${request.currentValue}</span>
                                                <span class="arrow">→</span>
                                                <span class="new-value">${request.newValue}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="text-sm text-gray-600">
                                        ${new Date(request.submittedDate).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span class="status-badge badge-pending">
                                            <i class="fas fa-clock mr-1"></i>
                                            Pending
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn btn-outline btn-sm" 
                                                onclick="app.modules.userVerification.reviewRequest('${request.id}')">
                                            <i class="fas fa-eye mr-2"></i>
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    handleSearch(value) {
        this.searchTerm = value;
        this.app.render();
    }

    setFilterStatus(status) {
        this.filterStatus = status;
        this.app.render();
    }

    reviewRequest(requestId) {
        alert(`Reviewing request ${requestId}`);
    }
}




// ============================================
// ADD GLOBAL HELPER FUNCTIONS (AT THE END)
// ============================================

// Global app reference
let globalApp = null;

// Global functions for button clicks
window.app = {
    setViewMode: function(mode) {
        if (globalApp) globalApp.setViewMode(mode);
    },
    setAdminPage: function(page) {
        if (globalApp) globalApp.setAdminPage(page);
    },
    modules: {}
};

// Initialize app modules proxy
function initializeAppModules(appInstance) {
    window.app.modules = {
        productManagement: {
            openAddProductDialog: function() {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.openAddProductDialog();
                }
            },
            openPaymentSettings: function() {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.openPaymentSettings();
                }
            },
            exportProducts: function() {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.exportProducts();
                }
            },
            handleSearch: function(value) {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.handleSearch(value);
                }
            },
            handleCategoryFilter: function(value) {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.handleCategoryFilter(value);
                }
            },
            viewProduct: function(id) {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.viewProduct(id);
                }
            },
            editProduct: function(id) {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.editProduct(id);
                }
            },
            confirmDeleteProduct: function(id) {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.confirmDeleteProduct(id);
                }
            },
            closeAddProductDialog: function() {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.closeAddProductDialog();
                }
            },
            saveAddOrEditProduct: function() {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.saveAddOrEditProduct();
                }
            },
            updateNewProductField: function(field, value) {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.updateNewProductField(field, value);
                }
            },
            togglePreOrder: function(checked) {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.togglePreOrder(checked);
                }
            },
            togglePurchaseLimit: function(checked) {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.togglePurchaseLimit(checked);
                }
            },
            adjustMaxQuantity: function(change) {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.adjustMaxQuantity(change);
                }
            },
            handleImageUpload: function(files) {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.handleImageUpload(files);
                }
            },
            removeImage: function(index) {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.removeImage(index);
                }
            },
            setAsMainImage: function(index) {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.setAsMainImage(index);
                }
            },
            handleAllowedBuyersChange: function(type) {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.handleAllowedBuyersChange(type);
                }
            },
            handleDepartmentSelect: function(deptId) {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.handleDepartmentSelect(deptId);
                }
            },
            handleCourseCheckbox: function(course, checked) {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.handleCourseCheckbox(course, checked);
                }
            },
            closeViewProductDialog: function() {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.closeViewProductDialog();
                }
            },
            closeEditProductDialog: function() {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.closeEditProductDialog();
                }
            },
            closeDeleteConfirmDialog: function() {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.closeDeleteConfirmDialog();
                }
            },
            deleteProduct: function() {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.deleteProduct();
                }
            },
            closePaymentSettingsDialog: function() {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.closePaymentSettingsDialog();
                }
            },
            updateNewPaymentField: function(field, value) {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.updateNewPaymentField(field, value);
                }
            },
            addPaymentMethod: function() {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.addPaymentMethod();
                }
            },
            togglePaymentMethod: function(methodId, enabled) {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.togglePaymentMethod(methodId, enabled);
                }
            },
            removePaymentMethod: function(methodId) {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.removePaymentMethod(methodId);
                }
            },
            uploadMethodQrCode: function(methodId, files) {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.uploadMethodQrCode(methodId, files);
                }
            },
            removeQrCode: function(methodId) {
                if (appInstance && appInstance.modules.productManagement) {
                    appInstance.modules.productManagement.removeQrCode(methodId);
                }
            }
        },
        adminDashboard: {
            toggleDropdown: function() {
                if (appInstance && appInstance.modules.adminDashboard) {
                    appInstance.modules.adminDashboard.toggleDropdown();
                }
            },
            selectEvent: function(event) {
                if (appInstance && appInstance.modules.adminDashboard) {
                    appInstance.modules.adminDashboard.selectEvent(event);
                }
            }
        },
        orderManagement: {
            handleViewModeChange: function(event) {
                if (appInstance && appInstance.modules.orderManagement) {
                    appInstance.modules.orderManagement.handleViewModeChange(event);
                }
            },
            openAddEventDialog: function() {
                if (appInstance && appInstance.modules.orderManagement) {
                    appInstance.modules.orderManagement.openAddEventDialog();
                }
            },
            openExportDialog: function() {
                if (appInstance && appInstance.modules.orderManagement) {
                    appInstance.modules.orderManagement.openExportDialog();
                }
            },
            handleSearch: function(event) {
                if (appInstance && appInstance.modules.orderManagement) {
                    appInstance.modules.orderManagement.handleSearch(event);
                }
            },
            handleStatusFilter: function(event) {
                if (appInstance && appInstance.modules.orderManagement) {
                    appInstance.modules.orderManagement.handleStatusFilter(event);
                }
            },
            handleEventFilter: function(event) {
                if (appInstance && appInstance.modules.orderManagement) {
                    appInstance.modules.orderManagement.handleEventFilter(event);
                }
            },
            handleDepartmentFilter: function(event) {
                if (appInstance && appInstance.modules.orderManagement) {
                    appInstance.modules.orderManagement.handleDepartmentFilter(event);
                }
            },
            toggleEventExpansion: function(eventName) {
                if (appInstance && appInstance.modules.orderManagement) {
                    appInstance.modules.orderManagement.toggleEventExpansion(eventName);
                }
            },
            viewOrderDetails: function(orderId) {
                if (appInstance && appInstance.modules.orderManagement) {
                    appInstance.modules.orderManagement.viewOrderDetails(orderId);
                }
            },
            viewReceipt: function(orderId) {
                if (appInstance && appInstance.modules.orderManagement) {
                    appInstance.modules.orderManagement.viewReceipt(orderId);
                }
            },
            confirmPayment: function(orderId) {
                if (appInstance && appInstance.modules.orderManagement) {
                    appInstance.modules.orderManagement.confirmPayment(orderId);
                }
            },
            closeAddEventDialog: function() {
                if (appInstance && appInstance.modules.orderManagement) {
                    appInstance.modules.orderManagement.closeAddEventDialog();
                }
            },
            updateNewEventField: function(field, value) {
                if (appInstance && appInstance.modules.orderManagement) {
                    appInstance.modules.orderManagement.updateNewEventField(field, value);
                }
            },
            createNewEvent: function() {
                if (appInstance && appInstance.modules.orderManagement) {
                    appInstance.modules.orderManagement.createNewEvent();
                }
            },
            closeOrderDetailDialog: function() {
                if (appInstance && appInstance.modules.orderManagement) {
                    appInstance.modules.orderManagement.closeOrderDetailDialog();
                }
            },
            closeReceiptDialog: function() {
                if (appInstance && appInstance.modules.orderManagement) {
                    appInstance.modules.orderManagement.closeReceiptDialog();
                }
            },
            closeExportDialog: function() {
                if (appInstance && appInstance.modules.orderManagement) {
                    appInstance.modules.orderManagement.closeExportDialog();
                }
            },
            handleExportFormatChange: function(format) {
                if (appInstance && appInstance.modules.orderManagement) {
                    appInstance.modules.orderManagement.handleExportFormatChange(format);
                }
            },
            handleExportEventFilterChange: function(value) {
                if (appInstance && appInstance.modules.orderManagement) {
                    appInstance.modules.orderManagement.handleExportEventFilterChange(value);
                }
            },
            downloadExport: function() {
                if (appInstance && appInstance.modules.orderManagement) {
                    appInstance.modules.orderManagement.downloadExport();
                }
            }
        },
        departments: {
            handleSearch: function(value) {
                if (appInstance && appInstance.modules.departments) {
                    appInstance.modules.departments.handleSearch(value);
                }
            },
            setRoleFilter: function(role) {
                if (appInstance && appInstance.modules.departments) {
                    appInstance.modules.departments.setRoleFilter(role);
                }
            },
            toggleDepartment: function(deptName) {
                if (appInstance && appInstance.modules.departments) {
                    appInstance.modules.departments.toggleDepartment(deptName);
                }
            }
        },
        merchRelease: {
            updateManualCode: function(value) {
                if (appInstance && appInstance.modules.merchRelease) {
                    appInstance.modules.merchRelease.updateManualCode(value);
                }
            },
            updateStudentId: function(value) {
                if (appInstance && appInstance.modules.merchRelease) {
                    appInstance.modules.merchRelease.updateStudentId(value);
                }
            },
            setScanMode: function(mode) {
                if (appInstance && appInstance.modules.merchRelease) {
                    appInstance.modules.merchRelease.setScanMode(mode);
                }
            },
            handleManualScan: function() {
                if (appInstance && appInstance.modules.merchRelease) {
                    appInstance.modules.merchRelease.handleManualScan();
                }
            },
            closeDialog: function() {
                if (appInstance && appInstance.modules.merchRelease) {
                    appInstance.modules.merchRelease.closeDialog();
                }
            },
            releaseOrder: function() {
                if (appInstance && appInstance.modules.merchRelease) {
                    appInstance.modules.merchRelease.releaseOrder();
                }
            }
        },
        communityApproval: {
            setTab: function(tab) {
                if (appInstance && appInstance.modules.communityApproval) {
                    appInstance.modules.communityApproval.setTab(tab);
                }
            }
        },
        userVerification: {
            handleSearch: function(value) {
                if (appInstance && appInstance.modules.userVerification) {
                    appInstance.modules.userVerification.handleSearch(value);
                }
            },
            setFilterStatus: function(status) {
                if (appInstance && appInstance.modules.userVerification) {
                    appInstance.modules.userVerification.setFilterStatus(status);
                }
            },
            reviewRequest: function(requestId) {
                if (appInstance && appInstance.modules.userVerification) {
                    appInstance.modules.userVerification.reviewRequest(requestId);
                }
            }
        }
    };
}

// ============================================
// APPLICATION INITIALIZATION
// ============================================

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create the app instance
    const appInstance = new CampusMerchHub();
    globalApp = appInstance;
    
    // Initialize the global app modules
    initializeAppModules(appInstance);
    
    // Set the app instance
    window.appInstance = appInstance;
    
    // Initial render
    appInstance.render();
});
