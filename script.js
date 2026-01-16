/*
    script.js - application client logic

    Overview:
    - Defines keys and mock data used for localStorage-backed persistence.
    - Provides a small "db" wrapper around localStorage for get/set/init.
    - Implements simple auth helpers (local-only) and UI helpers (sidebar, tables, modals).
    - Contains an "api" layer that uses a configurable API base with localStorage fallback.
    - Adds simple filtering and stats update helpers for pages (attendance, tasks, employees).

    Use this file to understand how the UI is populated and where to hook real back-end calls.
*/

// Global State Management & Utilities
const DATA_KEYS = {
    EMPLOYEES: 'smartoffice_employees',
    ATTENDANCE: 'smartoffice_attendance',
    LEAVES: 'smartoffice_leaves',
    TASKS: 'smartoffice_tasks',
    DOCUMENTS: 'smartoffice_documents',
    FINANCES: 'smartoffice_finances',
    CURRENT_USER: 'smartoffice_current_user'
};

// Mock data used to seed localStorage on first-run or when data needs refreshing.
// Replace or remove when integrating a real backend.
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
        { id: 2, title: 'Payroll Processing', assignedTo: 'Theophilus Tettey Charwetey Martey', assignedToId: 'CSC/22/01/0217', dueDate: '2023-10-28', status: 'Pending Acceptance', priority: 'Medium' },
        { id: 3, title: 'Recruitment Drive', assignedTo: 'Ellis Fafali Gbewordo', assignedToId: 'CSC/22/01/0349', dueDate: '2023-11-05', status: 'Completed', priority: 'High' },
        { id: 4, title: 'Fix Server Issue', assignedTo: 'Michelle Nana Akua Arhin', assignedToId: 'CSC/22/01/1073', dueDate: '2023-10-29', status: 'To Do', priority: 'High' }
    ],
    documents: [
        { id: '1', fileName: 'Employee-Handbook.pdf', category: 'Policies', description: 'Company employee handbook and guidelines', visibility: 'Company', uploadedBy: 'Admin User', uploadDate: '2023-10-01', size: '3.2 MB' },
        { id: '2', fileName: 'Q3-Financial-Report.pdf', category: 'Finance', description: 'Q3 2023 financial performance report', visibility: 'Private', uploadedBy: 'Admin User', uploadDate: '2023-10-15', size: '5.1 MB' },
        { id: '3', fileName: 'Project-Charter.docx', category: 'Projects', description: 'New project initiative charter and scope', visibility: 'Department', uploadedBy: 'Ellis Fafali Gbewordo', uploadDate: '2023-10-20', size: '1.8 MB' }
    ],
    finances: [
        { id: '1', date: '2023-10-15', category: 'Salaries', department: 'IT', description: 'October payroll processing', amount: '15000', status: 'Approved', submittedBy: 'Admin User', versionHistory: [] },
        { id: '2', date: '2023-10-18', category: 'Equipment', department: 'IT', description: 'Laptop purchases for new hires', amount: '3500', status: 'Pending', submittedBy: 'Michelle Nana Akua Arhin', versionHistory: [] },
        { id: '3', date: '2023-10-20', category: 'Training', department: 'HR', description: 'Professional development courses', amount: '2500', status: 'Approved', submittedBy: 'Ellis Fafali Gbewordo', versionHistory: [] }
    ]
};

// Simple data access layer wrapping localStorage. This keeps persistence logic centralized.
// - get(key): returns parsed JSON array (or [] if missing)
// - set(key, data): stringifies and stores data
// - init(): seeds mock data when storage is empty or incompatible
const db = {
    get: (key) => JSON.parse(localStorage.getItem(key)) || [],
    set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
    init: () => {
        // If no employees exist (or the shape is old) seed mock data.
        const currentEmployees = JSON.parse(localStorage.getItem(DATA_KEYS.EMPLOYEES) || '[]');
        const needsUpdate = !currentEmployees.length || (currentEmployees[0] && !currentEmployees[0].id.startsWith('CSC'));

        if (needsUpdate) {
            console.log('Refreshing mock data...');
            db.set(DATA_KEYS.EMPLOYEES, MOCK_DATA.employees);
            db.set(DATA_KEYS.ATTENDANCE, MOCK_DATA.attendance);
            db.set(DATA_KEYS.LEAVES, MOCK_DATA.leaves);
            db.set(DATA_KEYS.TASKS, MOCK_DATA.tasks);
            db.set(DATA_KEYS.DOCUMENTS, MOCK_DATA.documents);
        }
    }
};

// Authentication & session helpers (client-side demo only)
// NOTE: This is a simple localStorage-based auth purely for demo/testing.
// Replace with secure backend auth before deploying to production.
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
        // Clear session and return to login page
        localStorage.removeItem(DATA_KEYS.CURRENT_USER);
        window.location.href = 'index.html';
    },

    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem(DATA_KEYS.CURRENT_USER));
    },

    // checkAuth: ensures a user is logged in and optionally enforces role-based access
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

// UI helper utilities
// - setupSidebar(): wire sidebar toggle and active link highlighting
// - toggleModal(): show/hide modal elements
// - renderTable(): lightweight table renderer used across pages
// - updateUserInfo(): reflect current user in header/avatar
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

    // renderTable: populates a <table> body using a simple column spec
    // parameters:
    //  - tableId: id attribute of the table element
    //  - data: array of objects to render
    //  - columns: [{ key, render? }] where render is an optional function to format cell
    //  - actionsCallback: optional function(item) returning HTML for actions cell
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

    // updateUserInfo: fills header name/avatar and applies sidebar variant for employees
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

// Config for optional server sync. If `CONFIG.API_BASE` is set, `api` will attempt network calls.
const CONFIG = {
    API_BASE: localStorage.getItem('smartoffice_api_base') || ''
};

// safeFetch: wrapper around fetch that returns `null` on error. Useful for optional remote API.
async function safeFetch(url, options = {}) {
    try {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (e) {
        return null;
    }
}

// Auto-assign task to employee in department with least active tasks
function autoAssignTask(department) {
    const employees = db.get(DATA_KEYS.EMPLOYEES).filter(e => e.dept === department);
    const tasks = db.get(DATA_KEYS.TASKS);
    
    // Count active tasks per employee (not completed)
    const taskCounts = {};
    employees.forEach(emp => {
        taskCounts[emp.id] = tasks.filter(t => t.assignedToId === emp.id && t.status !== 'Completed').length;
    });
    
    // Find employee with least tasks
    let minTasks = Infinity;
    let selectedEmployee = null;
    employees.forEach(emp => {
        if (taskCounts[emp.id] < minTasks) {
            minTasks = taskCounts[emp.id];
            selectedEmployee = emp;
        }
    });
    
    return selectedEmployee;
}

// `api` data service: attempts to use a remote API (if configured) and otherwise falls back
// to localStorage via the `db` wrapper. It centralizes CRUD operations for tasks and leaves.
const api = {
    getTasks: async (userId = null) => {
        if (CONFIG.API_BASE) {
            const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
            const data = await safeFetch(`${CONFIG.API_BASE}/tasks${qs}`);
            if (data) return data;
        }
        const tasks = db.get(DATA_KEYS.TASKS);
        if (userId) return tasks.filter(t => t.assignedToId === userId);
        return tasks;
    },
    
    saveTask: async (task) => {
        if (CONFIG.API_BASE) {
            if (task.id) {
                const updated = await safeFetch(`${CONFIG.API_BASE}/tasks/${task.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(task)
                });
                if (updated) return updated;
            } else {
                const created = await safeFetch(`${CONFIG.API_BASE}/tasks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(task)
                });
                if (created) return created;
            }
        }
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
        return task;
    },

    deleteTask: async (id) => {
        if (CONFIG.API_BASE) {
            const ok = await safeFetch(`${CONFIG.API_BASE}/tasks/${id}`, { method: 'DELETE' });
            if (ok !== null) return true;
        }
        let tasks = db.get(DATA_KEYS.TASKS);
        tasks = tasks.filter(t => t.id !== id);
        db.set(DATA_KEYS.TASKS, tasks);
        return true;
    },

    updateTaskStatus: async (id, status) => {
        if (CONFIG.API_BASE) {
            const updated = await safeFetch(`${CONFIG.API_BASE}/tasks/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (updated) return updated;
        }
        let tasks = db.get(DATA_KEYS.TASKS);
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.status = status;
            db.set(DATA_KEYS.TASKS, tasks);
            return task;
        }
        return null;
    },

    acceptTask: async (id) => {
        return await api.updateTaskStatus(id, 'To Do');
    },

    declineTask: async (id) => {
        // First, set to Declined
        await api.updateTaskStatus(id, 'Declined');
        // Then, reassign to next available
        const tasks = db.get(DATA_KEYS.TASKS);
        const task = tasks.find(t => t.id === id);
        if (task) {
            const employees = db.get(DATA_KEYS.EMPLOYEES);
            const emp = employees.find(e => e.id === task.assignedToId);
            if (emp) {
                const newAssignee = autoAssignTask(emp.dept);
                if (newAssignee && newAssignee.id !== task.assignedToId) {
                    task.assignedToId = newAssignee.id;
                    task.assignedTo = newAssignee.name;
                    task.status = 'Pending Acceptance';
                    db.set(DATA_KEYS.TASKS, tasks);
                    return task;
                }
            }
        }
        return null;
    },

    getLeaves: async (userId = null) => {
        if (CONFIG.API_BASE) {
            const qs = userId ? `?employeeId=${encodeURIComponent(userId)}` : '';
            const data = await safeFetch(`${CONFIG.API_BASE}/leaves${qs}`);
            if (data) return data;
        }
        const leaves = db.get(DATA_KEYS.LEAVES);
        if (userId) return leaves.filter(l => l.employeeId === userId);
        return leaves;
    },

    applyLeave: async (leave) => {
        if (CONFIG.API_BASE) {
            const created = await safeFetch(`${CONFIG.API_BASE}/leaves`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leave)
            });
            if (created) return created;
        }
        let leaves = db.get(DATA_KEYS.LEAVES);
        leave.id = Date.now();
        leave.status = 'Pending';
        leaves.push(leave);
        db.set(DATA_KEYS.LEAVES, leaves);
        return leave;
    },

    updateLeaveStatus: async (id, status) => {
        if (CONFIG.API_BASE) {
            const updated = await safeFetch(`${CONFIG.API_BASE}/leaves/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (updated) return updated;
        }
        let leaves = db.get(DATA_KEYS.LEAVES);
        const leave = leaves.find(l => l.id === id);
        if (leave) {
            leave.status = status;
            db.set(DATA_KEYS.LEAVES, leaves);
            return leave;
        }
        return null;
    }
};

// Page-specific filter and stats helpers
// These functions read from `db` and update the UI (table + stat cards)
function filterAttendance() {
    const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const attendance = db.get(DATA_KEYS.ATTENDANCE);
    const filtered = attendance.filter(record =>
        record.name.toLowerCase().includes(searchInput) ||
        record.employeeId.toLowerCase().includes(searchInput) ||
        record.status.toLowerCase().includes(searchInput)
    );
    
    updateAttendanceStats(filtered);
    const columns = [
        { key: 'date' },
        { key: 'name' },
        { key: 'status' },
        { key: 'timeIn' },
        { key: 'timeOut' }
    ];
    
    ui.renderTable('attendanceTable', filtered, columns, (item) => {
        return `<button class="btn btn-sm btn-warning" onclick="editAttendance('${item.date}', '${item.employeeId}')"><i class="fas fa-edit"></i> Edit</button>`;
    });
    
    const noResults = document.getElementById('noResults');
    if (filtered.length === 0) {
        document.getElementById('attendanceTable').style.display = 'none';
        if (noResults) noResults.style.display = 'flex';
    } else {
        document.getElementById('attendanceTable').style.display = 'table';
        if (noResults) noResults.style.display = 'none';
    }
}

function updateAttendanceStats(attendance) {
    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const absentCount = attendance.filter(a => a.status === 'Absent').length;
    const lateCount = attendance.filter(a => a.status === 'Late').length;
    
    const presentEl = document.getElementById('presentCount');
    const absentEl = document.getElementById('absentCount');
    const lateEl = document.getElementById('lateCount');
    const countEl = document.getElementById('recordCount');
    
    if (presentEl) presentEl.textContent = presentCount;
    if (absentEl) absentEl.textContent = absentCount;
    if (lateEl) lateEl.textContent = lateCount;
    if (countEl) countEl.textContent = `${attendance.length} record${attendance.length !== 1 ? 's' : ''}`;
}

function filterTasks() {
    const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const tasks = db.get(DATA_KEYS.TASKS);
    const filtered = tasks.filter(task =>
        task.title.toLowerCase().includes(searchInput) ||
        task.assignedTo.toLowerCase().includes(searchInput) ||
        task.priority.toLowerCase().includes(searchInput) ||
        task.status.toLowerCase().includes(searchInput)
    );
    
    updateTaskStats(filtered);
    const columns = [
        { key: 'title' },
        { key: 'assignedTo' },
        { key: 'dueDate' },
        { key: 'priority', render: (val) => `<span class="badge badge-${val.toLowerCase()}">${val}</span>` },
        { key: 'status', render: (val) => `<span class="badge badge-${val.toLowerCase().replace(' ', '')}">${val}</span>` }
    ];
    
    ui.renderTable('tasksTable', filtered, columns, (item) => {
        return `<button class="btn btn-sm btn-warning" onclick="editTask(${item.id})"><i class="fas fa-edit"></i> Edit</button>`;
    });
    
    const noResults = document.getElementById('noResults');
    if (filtered.length === 0) {
        document.getElementById('tasksTable').style.display = 'none';
        if (noResults) noResults.style.display = 'flex';
    } else {
        document.getElementById('tasksTable').style.display = 'table';
        if (noResults) noResults.style.display = 'none';
    }
}

function updateTaskStats(tasks) {
    const totalCount = tasks.length;
    const completedCount = tasks.filter(t => t.status === 'Completed').length;
    const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
    
    const totalEl = document.getElementById('totalTasks');
    const completedEl = document.getElementById('completedTasks');
    const inProgressEl = document.getElementById('inProgressTasks');
    const countEl = document.getElementById('taskCount');
    
    if (totalEl) totalEl.textContent = totalCount;
    if (completedEl) completedEl.textContent = completedCount;
    if (inProgressEl) inProgressEl.textContent = inProgressCount;
    if (countEl) countEl.textContent = `${totalCount} task${totalCount !== 1 ? 's' : ''}`;
}

// Initialize: seed data and wire up common UI behavior on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    db.init();            // ensure mock data is present
    ui.setupSidebar();    // sidebar toggling & active link
    ui.updateUserInfo();  // populate header with current user info
});
