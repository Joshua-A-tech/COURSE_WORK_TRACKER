// Coursework Tracker - JavaScript Functionality

// Task Storage
let tasks = [];
let currentFilter = "all";

// DOM Elements
const tasksContainer = document.getElementById("tasksContainer");
const emptyState = document.getElementById("emptyState");
const totalTasksDisplay = document.getElementById("totalTasksDisplay");
const statTotal = document.getElementById("statTotal");
const statCompleted = document.getElementById("statCompleted");
const statPending = document.getElementById("statPending");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const taskForm = document.getElementById("taskForm");
const formError = document.getElementById("formError");
const darkModeToggle = document.getElementById("darkModeToggleBtn");

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
    loadFromLocalStorage();
    setupEventListeners();
    setupFilterButtons();
    renderTasksAndSummary();
    checkDeadlines();
    // Check deadlines every minute
    setInterval(checkDeadlines, 60000);
});

// Setup Event Listeners
function setupEventListeners() {
    taskForm.addEventListener("submit", handleAddTask);
    darkModeToggle.addEventListener("click", toggleDarkMode);
}

// Setup Filter Buttons
function setupFilterButtons() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.getAttribute("data-filter");
            renderTasksAndSummary();
        });
    });
}

// Handle Add Task
function handleAddTask(e) {
    e.preventDefault();
    
    const course = document.getElementById("courseName").value.trim();
    const title = document.getElementById("assignmentTitle").value.trim();
    const deadline = document.getElementById("deadlineDate").value;
    const priority = document.getElementById("prioritySelect").value;
    
    // Validation
    if (!course || !title || !deadline) {
        showError("All fields are required!");
        return false;
    }
    
    // Check if deadline is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(deadline);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showError("Deadline cannot be in the past!");
        return false;
    }
    
    // Add new task
    const newTask = {
        id: Date.now(),
        course: course,
        title: title,
        deadline: deadline,
        priority: priority,
        status: "Pending",
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveToLocalStorage();
    renderTasksAndSummary();
    
    // Reset form
    taskForm.reset();
    hideError();
    
    // Show success message
    showSuccess("Task added successfully!");
}

// Show Error Message
function showError(message) {
    formError.textContent = message;
    formError.classList.remove("d-none");
    setTimeout(() => {
        formError.classList.add("d-none");
    }, 3000);
}

// Hide Error Message
function hideError() {
    formError.classList.add("d-none");
}

// Show Success Message (using Bootstrap toast or alert)
function showSuccess(message) {
    const successDiv = document.createElement("div");
    successDiv.className = "alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3";
    successDiv.style.zIndex = "9999";
    successDiv.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(successDiv);
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Mark Task as Completed
function markTaskCompleted(id) {
    const task = tasks.find(t => t.id === id);
    if (task && task.status !== "Completed") {
        task.status = "Completed";
        saveToLocalStorage();
        renderTasksAndSummary();
        showSuccess("Task marked as completed! 🎉");
    }
}

// Delete Task
function deleteTask(id) {
    if (confirm("Are you sure you want to delete this task?")) {
        tasks = tasks.filter(task => task.id !== id);
        saveToLocalStorage();
        renderTasksAndSummary();
        showSuccess("Task deleted successfully!");
    }
}

// Check if Task is Overdue
function isOverdue(deadlineStr, status) {
    if (status === "Completed") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(deadlineStr);
    deadline.setHours(0, 0, 0, 0);
    return deadline < today;
}

// Check if Deadline is Within 24 Hours
function isWithin24Hours(deadlineStr, status) {
    if (status === "Completed") return false;
    const now = new Date();
    const deadline = new Date(deadlineStr);
    const diffHours = (deadline - now) / (1000 * 60 * 60);
    return diffHours <= 24 && diffHours >= 0;
}

// Check Deadlines and Show Alerts
function checkDeadlines() {
    const now = new Date();
    tasks.forEach(task => {
        if (task.status !== "Completed") {
            const deadline = new Date(task.deadline);
            const diffHours = (deadline - now) / (1000 * 60 * 60);
            
            if (diffHours <= 24 && diffHours > 0 && !task.alertShown) {
                task.alertShown = true;
                showNotification(`⚠️ Reminder: "${task.title}" is due within 24 hours!`, "warning");
            } else if (diffHours <= 0 && !task.overdueAlertShown) {
                task.overdueAlertShown = true;
                showNotification(`🔴 Overdue: "${task.title}" has passed its deadline!`, "danger");
            }
        }
    });
}

// Show Notification
function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = "9999";
    notification.innerHTML = `
        <i class="fas fa-bell me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Render Tasks and Update Summary
function renderTasksAndSummary() {
    // Update Statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "Completed").length;
    const pendingTasks = totalTasks - completedTasks;
    const percentCompleted = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    
    // Update UI
    statTotal.textContent = totalTasks;
    statCompleted.textContent = completedTasks;
    statPending.textContent = pendingTasks;
    totalTasksDisplay.innerHTML = `<i class="fas fa-list me-1"></i>Total: ${totalTasks}`;
    progressPercent.textContent = `${percentCompleted}%`;
    progressFill.style.width = `${percentCompleted}%`;
    progressFill.textContent = `${percentCompleted}%`;
    
    // Filter Tasks
    let filteredTasks = [...tasks];
    switch(currentFilter) {
        case "Pending":
            filteredTasks = tasks.filter(t => t.status === "Pending");
            break;
        case "Completed":
            filteredTasks = tasks.filter(t => t.status === "Completed");
            break;
        case "High":
            filteredTasks = tasks.filter(t => t.priority === "High");
            break;
        case "Medium":
            filteredTasks = tasks.filter(t => t.priority === "Medium");
            break;
        case "Low":
            filteredTasks = tasks.filter(t => t.priority === "Low");
            break;
        default:
            filteredTasks = [...tasks];
    }
    
    // Show/Hide Empty State
    if (filteredTasks.length === 0) {
        tasksContainer.classList.add("d-none");
        emptyState.classList.remove("d-none");
    } else {
        tasksContainer.classList.remove("d-none");
        emptyState.classList.add("d-none");
        renderTaskCards(filteredTasks);
    }
}

// Render Task Cards
function renderTaskCards(filteredTasks) {
    tasksContainer.innerHTML = filteredTasks.map(task => {
        const overdue = isOverdue(task.deadline, task.status);
        const within24 = !overdue && isWithin24Hours(task.deadline, task.status);
        const priorityClass = getPriorityClass(task.priority);
        const statusClass = task.status === "Completed" ? "status-completed" : "status-pending";
        const statusIcon = task.status === "Completed" ? "fa-check-circle" : "fa-hourglass-half";
        
        // Deadline warning text
        let warningText = "";
        if (overdue && task.status !== "Completed") {
            warningText = '<span class="badge bg-danger ms-2"><i class="fas fa-exclamation-triangle"></i> OVERDUE</span>';
        } else if (within24 && task.status !== "Completed") {
            warningText = '<span class="badge bg-warning ms-2"><i class="fas fa-clock"></i> <24h left</span>';
        }
        
        return `
            <div class="col-md-6 col-lg-4">
                <div class="card task-card ${priorityClass} ${overdue ? 'overdue' : ''} ${within24 ? 'warning-24h' : ''}" data-task-id="${task.id}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-subtitle text-muted mb-1">
                                <i class="fas fa-book me-1"></i>${escapeHtml(task.course)}
                            </h6>
                            <span class="priority-badge priority-${task.priority.toLowerCase()}-badge">
                                <i class="fas fa-flag me-1"></i>${task.priority}
                            </span>
                        </div>
                        <h5 class="card-title fw-bold mb-2">
                            ${escapeHtml(task.title)}
                            ${warningText}
                        </h5>
                        
                        <div class="mb-2">
                            <i class="fas fa-calendar-alt me-1 text-muted"></i>
                            <small class="text-muted">Due: ${formatDate(task.deadline)}</small>
                        </div>
                        
                        <div class="mb-3">
                            <span class="status-badge ${statusClass}">
                                <i class="fas ${statusIcon} me-1"></i>${task.status}
                            </span>
                        </div>
                        
                        <div class="d-flex gap-2">
                            ${task.status !== "Completed" ? `
                                <button onclick="markTaskCompleted(${task.id})" class="btn btn-success btn-sm flex-grow-1">
                                    <i class="fas fa-check me-1"></i>Complete
                                </button>
                            ` : ''}
                            <button onclick="deleteTask(${task.id})" class="btn btn-danger btn-sm flex-grow-1">
                                <i class="fas fa-trash me-1"></i>Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Get Priority Class for Card8
function getPriorityClass(priority) {
    switch(priority) {
        case "High": return "priority-high";
        case "Medium": return "priority-medium";
        case "Low": return "priority-low";
        default: return "";
    }
}

// Format Date for Display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Escape HTML to Prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Save Tasks to LocalStorage
function saveToLocalStorage() {
    localStorage.setItem("coursework_tasks", JSON.stringify(tasks));
}

// Load Tasks from LocalStorage
function loadFromLocalStorage() {
    const stored = localStorage.getItem("coursework_tasks");
    if (stored) {
        try {
            tasks = JSON.parse(stored);
        } catch(e) {
            tasks = [];
        }
    }
    
    // Add sample tasks if empty
    if (tasks.length === 0) {
        addSampleTasks();
    }
}

// Add Sample Tasks
function addSampleTasks() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 3);
    
    tasks = [
        {
            id: Date.now() + 1,
            course: "Web Development",
            title: "React Final Project",
            deadline: tomorrow.toISOString().split('T')[0],
            priority: "High",
            status: "Pending",
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 2,
            course: "Data Structures",
            title: "Algorithm Analysis",
            deadline: nextWeek.toISOString().split('T')[0],
            priority: "Medium",
            status: "Pending",
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 3,
            course: "Database Systems",
            title: "SQL Assignment",
            deadline: lastWeek.toISOString().split('T')[0],
            priority: "Low",
            status: "Completed",
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 4,
            course: "Software Development",
            title: "System Development life cycle",
            deadline: lastWeek.toISOString().split('T')[0],
            priority: "Low",
            status: "PENDING",
            createdAt: new Date().toISOString()
        } 
    ];
    saveToLocalStorage();
}

// Toggle Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const isDarkMode = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDarkMode);
    
    const icon = darkModeToggle.querySelector("i");
    if (isDarkMode) {
        icon.className = "fas fa-sun";
        darkModeToggle.innerHTML = '<i class="fas fa-sun me-1"></i> Light Mode';
    } else {
        icon.className = "fas fa-moon";
        darkModeToggle.innerHTML = '<i class="fas fa-moon me-1"></i> Dark Mode';
    }
}

// Load Dark Mode Preference
function loadDarkModePreference() {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    if (isDarkMode) {
        document.body.classList.add("dark-mode");
        darkModeToggle.innerHTML = '<i class="fas fa-sun me-1"></i> Light Mode';
    }
}2

// Make functions globally available
window.markTaskCompleted = markTaskCompleted;
window.deleteTask = deleteTask;

// Initialize dark mode on load
loadDarkModePreference();