// Global State Management & Utilities

const DATA_KEYS = {
    EMPLOYEES: 'smartoffice_employees',
    ATTENDANCE: 'smartoffice_attendance',
    LEAVES: 'smartoffice_leaves',
    TASKS: 'smartoffice_tasks',
    CURRENT_USER: 'smartoffice_current_user'
};

// Mock Data for Initialization
const MOCK_DATA = {
    employees: [
        { id: 'CSC/22/01/0011', name: 'Kwesi Essel Turkson', dept: 'IT', position: 'Developer', email: 'kwesi.turkson@smartoffice.com', phone: '123-456-7890', role: 'employee' },
        { id: 'CSC/22/01/0349', name: 'Ellis Fafali Gbewordo', dept: 'HR', position: 'Manager', email: 'ellis.gbewordo@smartoffice.com', phone: '098-765-4321', role: 'employee' },
        { id: 'CSC/22/01/0217', name: 'Theophilus Tettey Charwetey Martey', dept: 'Finance', position: 'Analyst', email: 'theophilus.martey@smartoffice.com', phone: '555-555-5555', role: 'employee' },
        { id: 'CSC/22/01/1883', name: 'Selasi Ahiaku', dept: 'Marketing', position: 'Lead', email: 'selasi.ahiaku@smartoffice.com', phone: '111-222-3333', role: 'employee' },
        { id: 'CSC/22/01/1073', name: 'Michelle Nana Akua Arhin', dept: 'IT', position: 'SysAdmin', email: 'michelle.arhin@smartoffice.com', phone: '444-444-4444', role: 'employee' }
    ],
    attendance: [
        { date: '2023-10-25', employeeId: 'CSC/22/01/0011', name: 'Kwesi Essel Turkson', status: 'Present', timeIn: '09:00', timeOut: '17:00' },
        { date: '2023-10-25', employeeId: 'CSC/22/01/0349', name: 'Ellis Fafali Gbewordo', status: 'Present', timeIn: '08:55', timeOut: '17:10' },
        { date: '2023-10-25', employeeId: 'CSC/22/01/0217', name: 'Theophilus Tettey Charwetey Martey', status: 'Absent', timeIn: '-', timeOut: '-' }
    ],
    leaves: [
        { id: 1, employeeId: 'CSC/22/01/0011', name: 'Kwesi Essel Turkson', type: 'Sick Leave', startDate: '2023-11-01', endDate: '2023-11-02', status: 'Approved' },
        { id: 2, employeeId: 'CSC/22/01/0217', name: 'Theophilus Tettey Charwetey Martey', type: 'Vacation', startDate: '2023-12-15', endDate: '2023-12-20', status: 'Pending' }
    ],
    tasks: [
        { id: 1, title: 'Update Website', assignedTo: 'Kwesi Essel Turkson', assignedToId: 'CSC/22/01/0011', dueDate: '2023-10-30', status: 'In Progress', priority: 'High' },
        { id: 2, title: 'Payroll Processing', assignedTo: 'Theophilus Tettey Charwetey Martey', assignedToId: 'CSC/22/01/0217', dueDate: '2023-10-28', status: 'Pending', priority: 'Medium' },
        { id: 3, title: 'Recruitment Drive', assignedTo: 'Ellis Fafali Gbewordo', assignedToId: 'CSC/22/01/0349', dueDate: '2023-11-05', status: 'Completed', priority: 'High' },
        { id: 4, title: 'Fix Server Issue', assignedTo: 'Michelle Nana Akua Arhin', assignedToId: 'CSC/22/01/1073', dueDate: '2023-10-29', status: 'To Do', priority: 'High' }
    ]
};

// Data Access Layer
const db = {
    get: (key) => JSON.parse(localStorage.getItem(key)) || [],
    set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
    init: () => {
        // Force update employees if needed (simple check if data is old/empty)
        // Or if the first employee doesn't match our new structure (ID starting with CSC)
        const currentEmployees = JSON.parse(localStorage.getItem(DATA_KEYS.EMPLOYEES) || '[]');
        const needsUpdate = !currentEmployees.length || (currentEmployees[0] && !currentEmployees[0].id.startsWith('CSC'));

        if (needsUpdate) {
            console.log('Refreshing mock data...');
            db.set(DATA_KEYS.EMPLOYEES, MOCK_DATA.employees);
            db.set(DATA_KEYS.ATTENDANCE, MOCK_DATA.attendance);
            db.set(DATA_KEYS.LEAVES, MOCK_DATA.leaves);
            db.set(DATA_KEYS.TASKS, MOCK_DATA.tasks);
        }
    }
};

// Authentication & Session
const auth = {
    // TODO: Replace with Firebase/Backend Auth
    login: (username, password, role) => {
        if (role === 'admin') {
            if (username === 'admin' && password === 'admin123') {
                const user = { id: 'admin', name: 'Admin User', role: 'admin', email: 'admin@smartoffice.com' };
                localStorage.setItem(DATA_KEYS.CURRENT_USER, JSON.stringify(user));
                return { success: true, redirect: 'admin-dashboard.html' };
            }
        } else if (role === 'employee') {
            const employees = db.get(DATA_KEYS.EMPLOYEES);
            
            // Login with Email or ID (Index Number)
            const employee = employees.find(e => e.email === username || e.id === username);
            
            if (employee) {
                // Password check: Last 4 digits of ID
                const expectedPassword = employee.id.slice(-4);
                
                if (password === expectedPassword) {
                    const user = { ...employee, role: 'employee' };
                    localStorage.setItem(DATA_KEYS.CURRENT_USER, JSON.stringify(user));
                    return { success: true, redirect: 'employee-dashboard.html' };
                }
            }
        }
        return { success: false, message: 'Invalid credentials' };
    },

    logout: () => {
        localStorage.removeItem(DATA_KEYS.CURRENT_USER);
        window.location.href = 'index.html';
    },

    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem(DATA_KEYS.CURRENT_USER));
    },

    checkAuth: (requiredRole) => {
        const user = auth.getCurrentUser();
        const currentPage = window.location.pathname.split('/').pop();
        const isLoginPage = currentPage === 'index.html' || currentPage === '' || currentPage === '/';

        if (!user) {
            if (!isLoginPage) window.location.href = 'index.html';
            return;
        }

        if (isLoginPage) {
            if (user.role === 'admin') window.location.href = 'admin-dashboard.html';
            if (user.role === 'employee') window.location.href = 'employee-dashboard.html';
            return;
        }

        // Role protection
        if (requiredRole && user.role !== requiredRole) {
            alert('Unauthorized access');
            auth.logout();
        }
    }
};

// UI Helpers
const ui = {
    setupSidebar: () => {
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                sidebar && 
                sidebar.classList.contains('active') && 
                !sidebar.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });

        // Highlight active link
        const currentPage = window.location.pathname.split('/').pop();
        const links = document.querySelectorAll('.sidebar-menu a');
        links.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    },

    toggleModal: (modalId, show = true) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.toggle('active', show);
        }
    },

    renderTable: (tableId, data, columns, actionsCallback) => {
        const tbody = document.querySelector(`#${tableId} tbody`);
        if (!tbody) return;

        tbody.innerHTML = '';
        
        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${columns.length + (actionsCallback ? 1 : 0)}" style="text-align:center;">No data found</td></tr>`;
            return;
        }

        data.forEach(item => {
            const tr = document.createElement('tr');
            
            columns.forEach(col => {
                const td = document.createElement('td');
                if (col.render) {
                    td.innerHTML = col.render(item[col.key], item);
                } else {
                    td.textContent = item[col.key] || '-';
                }
                tr.appendChild(td);
            });

            if (actionsCallback) {
                const td = document.createElement('td');
                td.innerHTML = actionsCallback(item);
                tr.appendChild(td);
            }

            tbody.appendChild(tr);
        });
    },

    updateUserInfo: () => {
        const user = auth.getCurrentUser();
        if (user) {
            const nameEl = document.querySelector('.user-info span');
            const imgEl = document.querySelector('.user-info img');
            if (nameEl) nameEl.textContent = user.name;
            if (imgEl) imgEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=${user.role === 'admin' ? '0D8ABC' : '20c997'}&color=fff`;
            
            // Add employee class to sidebar if employee
            if (user.role === 'employee') {
                document.querySelector('.sidebar')?.classList.add('employee-sidebar');
            }
        }
    }
};

// Data Service for Tasks/Leaves (API Simulation)
const api = {
    // TODO: Replace with real API calls
    getTasks: (userId = null) => {
        const tasks = db.get(DATA_KEYS.TASKS);
        if (userId) {
            return tasks.filter(t => t.assignedToId === userId);
        }
        return tasks;
    },
    
    saveTask: (task) => {
        let tasks = db.get(DATA_KEYS.TASKS);
        if (task.id) {
            const index = tasks.findIndex(t => t.id === task.id);
            if (index !== -1) tasks[index] = task;
        } else {
            task.id = Date.now();
            task.status = 'To Do';
            tasks.push(task);
        }
        db.set(DATA_KEYS.TASKS, tasks);
    },

    deleteTask: (id) => {
        let tasks = db.get(DATA_KEYS.TASKS);
        tasks = tasks.filter(t => t.id !== id);
        db.set(DATA_KEYS.TASKS, tasks);
    },

    updateTaskStatus: (id, status) => {
        let tasks = db.get(DATA_KEYS.TASKS);
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.status = status;
            db.set(DATA_KEYS.TASKS, tasks);
        }
    },

    getLeaves: (userId = null) => {
        const leaves = db.get(DATA_KEYS.LEAVES);
        if (userId) {
            return leaves.filter(l => l.employeeId === userId);
        }
        return leaves;
    },

    applyLeave: (leave) => {
        let leaves = db.get(DATA_KEYS.LEAVES);
        leave.id = Date.now();
        leave.status = 'Pending';
        leaves.push(leave);
        db.set(DATA_KEYS.LEAVES, leaves);
    },

    updateLeaveStatus: (id, status) => {
        let leaves = db.get(DATA_KEYS.LEAVES);
        const leave = leaves.find(l => l.id === id);
        if (leave) {
            leave.status = status;
            db.set(DATA_KEYS.LEAVES, leaves);
        }
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    db.init();
    ui.setupSidebar();
    ui.updateUserInfo();
});
