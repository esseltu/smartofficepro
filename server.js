/*
  server.js - Minimal demo API for SmartOffice Pro

  Overview:
  - Provides a lightweight Express server that persists data to `data.json`.
  - Endpoints implemented: /health, /employees, /tasks (GET/POST/PUT/PATCH/DELETE),
    /leaves (GET/POST/PATCH)
  - Intended for local development and prototyping. Not production-ready.

  Run locally:
    npm install
    node server.js

  Notes:
  - Data is seeded on first run into `data.json`.
  - Use `CONFIG.API_BASE` in the frontend to point to this server when available.
*/

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_PATH = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

function readData() {
  if (!fs.existsSync(DATA_PATH)) {
    const seed = {
      employees: [
        { id: 'CSC/22/01/0011', name: 'Kwesi Essel Turkson', dept: 'IT', position: 'Developer', email: 'kwesi.turkson@smartoffice.com', phone: '123-456-7890', role: 'employee' },
        { id: 'CSC/22/01/0349', name: 'Ellis Fafali Gbewordo', dept: 'HR', position: 'Manager', email: 'ellis.gbewordo@smartoffice.com', phone: '098-765-4321', role: 'employee' },
        { id: 'CSC/22/01/0217', name: 'Theophilus Tettey Charwetey Martey', dept: 'Finance', position: 'Analyst', email: 'theophilus.martey@smartoffice.com', phone: '555-555-5555', role: 'employee' },
        { id: 'CSC/22/01/1883', name: 'Selasi Ahiaku', dept: 'Marketing', position: 'Lead', email: 'selasi.ahiaku@smartoffice.com', phone: '111-222-3333', role: 'employee' },
        { id: 'CSC/22/01/1073', name: 'Michelle Nana Akua Arhin', dept: 'IT', position: 'SysAdmin', email: 'michelle.arhin@smartoffice.com', phone: '444-444-4444', role: 'employee' }
      ],
      attendance: [
        { id: 1, date: '2023-10-25', employeeId: 'CSC/22/01/0011', name: 'Kwesi Essel Turkson', status: 'Present', timeIn: '09:00', timeOut: '17:00' },
        { id: 2, date: '2023-10-25', employeeId: 'CSC/22/01/0349', name: 'Ellis Fafali Gbewordo', status: 'Present', timeIn: '08:55', timeOut: '17:10' },
        { id: 3, date: '2023-10-25', employeeId: 'CSC/22/01/0217', name: 'Theophilus Tettey Charwetey Martey', status: 'Absent', timeIn: '-', timeOut: '-' }
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
    fs.writeFileSync(DATA_PATH, JSON.stringify(seed, null, 2));
    return seed;
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Employees
app.get('/employees', (req, res) => {
  const data = readData();
  res.json(data.employees);
});

// Tasks
app.get('/tasks', (req, res) => {
  const data = readData();
  const { userId } = req.query;
  let tasks = data.tasks;
  if (userId) tasks = tasks.filter(t => t.assignedToId === userId);
  res.json(tasks);
});

app.post('/tasks', (req, res) => {
  const data = readData();
  const task = req.body;
  task.id = Date.now();
  if (!task.status) task.status = 'To Do';
  data.tasks.push(task);
  writeData(data);
  res.status(201).json(task);
});

app.put('/tasks/:id', (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id, 10);
  const idx = data.tasks.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.tasks[idx] = { ...data.tasks[idx], ...req.body, id };
  writeData(data);
  res.json(data.tasks[idx]);
});

app.patch('/tasks/:id/status', (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id, 10);
  const task = data.tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ error: 'Not found' });
  task.status = req.body.status;
  writeData(data);
  res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id, 10);
  data.tasks = data.tasks.filter(t => t.id !== id);
  writeData(data);
  res.status(204).end();
});

// Leaves
app.get('/leaves', (req, res) => {
  const data = readData();
  const { employeeId } = req.query;
  let leaves = data.leaves;
  if (employeeId) leaves = leaves.filter(l => l.employeeId === employeeId);
  res.json(leaves);
});

app.post('/leaves', (req, res) => {
  const data = readData();
  const leave = req.body;
  leave.id = Date.now();
  leave.status = 'Pending';
  data.leaves.push(leave);
  writeData(data);
  res.status(201).json(leave);
});

app.patch('/leaves/:id/status', (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id, 10);
  const leave = data.leaves.find(l => l.id === id);
  if (!leave) return res.status(404).json({ error: 'Not found' });
  leave.status = req.body.status;
  writeData(data);
  res.json(leave);
});

app.listen(PORT, () => {
  console.log(`SmartOffice Pro API running on http://localhost:${PORT}`);
});
