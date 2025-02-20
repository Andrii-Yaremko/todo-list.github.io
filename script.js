const Task = (text) => ({
    id: Math.random(),
    text,
    completed: false,
    timestamp: Date.now()
});

const TaskState = {
    tasks: [],
    subscribers: [],

    init() {
        this.loadTasks();
    },

    subscribe(callback) {
        this.subscribers.push(callback);
    },

    notify() {
        this.subscribers.forEach(callback => callback(this.tasks));
        this.saveTasks();
    },

    addTask(text) {
        if (text.trim() !== "") {
            this.tasks.push(Task(text));
            this.notify();
        }
    },

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.notify();
    },

    toggleTask(id) {
        this.tasks = this.tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        this.notify();
    },

    clearCompletedTasks() {
        this.tasks = this.tasks.filter(task => !task.completed);
        this.notify();
    },

    loadTasks() {
        const selectedTab = this.getSelectedTab();
        this.tasks = JSON.parse(localStorage.getItem(selectedTab)) || [];
        this.tasks.sort((a, b) => b.timestamp - a.timestamp);
        this.notify();
    },

    saveTasks() {
        const selectedTab = this.getSelectedTab();
        localStorage.setItem(selectedTab, JSON.stringify(this.tasks));
    },

    getSelectedTab() {
        return JSON.parse(localStorage.getItem("selectedTab")) || "personal";
    }
};

const tasksRefresh = (tasks) => {
    const taskBlock = document.querySelector(".task-block");
    taskBlock.innerHTML = "";

    tasks.forEach((task) => {
        const newTask = document.createElement("div");
        newTask.classList.add("task-container");

        newTask.innerHTML = `
            <div class="task">
                <div class="task-info">
                    <label class="task-checkbox">
                        <input type="checkbox" class=${task.completed ? "checked" : ""} >
                        <span class="checkmark" onclick="TaskState.toggleTask(${task.id})"></span>
                    </label>
                    <div class="task-text ${task.completed && "completed"}">${task.text}</div>
                </div>
                <div class="task-delete" onclick="TaskState.deleteTask(${task.id})">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g opacity="0.3">
                            <path d="M8 25.333C8 26.8 9.2 28 10.667 28H21.333C22.8 28 24 26.8 24 25.333V9.333H8V25.333ZM10.667 12H21.333V25.333H10.667V12ZM20.667 5.333L19.333 4H12.667L11.333 5.333H6.667V8H25.333V5.333H20.667Z"
                                fill="#B30B04"/>
                        </g>
                    </svg>
                </div>
            </div>
            <div class="slider"></div>
        `;

        taskBlock.appendChild(newTask);
    });
};

const toggleTaskType = (tabToSelect) => {
    document.getElementById("personal").className = tabToSelect === "personal" ? "tabs-block active" : "tabs-block";
    document.getElementById("professional").className = tabToSelect === "professional" ? "tabs-block active" : "tabs-block";

    localStorage.setItem("selectedTab", JSON.stringify(tabToSelect));
    TaskState.loadTasks();
};

function initializeTab() {
    const selectedTab = JSON.parse(localStorage.getItem("selectedTab")) || "personal";
    toggleTaskType(selectedTab);
}

const taskInput = document.querySelector(".add-task-input");
const addButton = document.querySelector(".add-task-button");
const clearCompletedTasksBlock = document.querySelector(".clear-tasks-button");
const personalTab = document.getElementById("personal");
const professionalTab = document.getElementById("professional");

addButton.addEventListener("click", () => {
    TaskState.addTask(taskInput.value);
    taskInput.value = "";
});

clearCompletedTasksBlock.addEventListener("click", () => TaskState.clearCompletedTasks());

personalTab.addEventListener("click", () => toggleTaskType("personal"));
professionalTab.addEventListener("click", () => toggleTaskType("professional"));

TaskState.subscribe(tasksRefresh);
TaskState.init();
initializeTab();
