
// 1. GET HTML ELEMENTS

const taskForm = document.getElementById("taskForm");

const taskNameInput = document.getElementById("taskName");
const taskDateInput = document.getElementById("taskDate");
const taskPriorityInput = document.getElementById("taskPriority");

const tasksContainer = document.getElementById("tasksContainer");

const totalTasksElement = document.getElementById("totalTasks");
const completedTasksElement = document.getElementById("completedTasks");
const pendingTasksElement = document.getElementById("pendingTasks");

const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");
const sortTasks = document.getElementById("sortTasks");

const progressFill = document.getElementById("progressFill");
const progressPercentage = document.getElementById("progressPercentage");

const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEditButton");


// 2. CHECK HTML CONNECTIONS

if (
    !taskForm ||
    !taskNameInput ||
    !taskDateInput ||
    !taskPriorityInput ||
    !tasksContainer ||
    !searchInput ||
    !filterStatus ||
    !sortTasks ||
    !progressFill ||
    !progressPercentage ||
    !submitButton ||
    !cancelEditButton
) {
    console.error("Some HTML elements are missing. Check your HTML IDs.");
}


// 3. TASK ARRAY

let tasks = [];
let editingTaskId = null;


// 4. LOAD SAVED TASKS

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem("studentTasks");
        tasks = savedTasks ? JSON.parse(savedTasks) : [];

        if (!Array.isArray(tasks)) {
            tasks = [];
        }
    } catch (error) {
        console.error("Error loading tasks:", error);
        tasks = [];
    }
}


// 5. SAVE TASKS

function saveTasks() {
    localStorage.setItem("studentTasks", JSON.stringify(tasks));
}


// 6. ADD OR UPDATE TASK

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = taskNameInput.value.trim();
    const date = taskDateInput.value;
    const priority = taskPriorityInput.value;

    if (name === "" || date === "") {
        alert("Please enter a task name and deadline.");
        return;
    }

    if (editingTaskId !== null) {

        const task = tasks.find(function(item) {
            return item.id === editingTaskId;
        });

        if (task) {
            task.name = name;
            task.date = date;
            task.priority = priority;
        }

        editingTaskId = null;
        submitButton.textContent = "+ Add Task";
        cancelEditButton.hidden = true;

    } else {

        const newTask = {
            id: Date.now() + Math.random(),
            name: name,
            date: date,
            priority: priority,
            completed: false
        };

        tasks.push(newTask);
    }

    saveTasks();
    displayTasks();
    taskForm.reset();

});


// 7. DISPLAY TASKS

function displayTasks() {

    tasksContainer.innerHTML = "";

    const searchText = searchInput.value.toLowerCase();
    const selectedStatus = filterStatus.value;
    const selectedSort = sortTasks.value;

    // SEARCH AND FILTER

    let filteredTasks = tasks.filter(function(task) {

        const matchesSearch =
            task.name.toLowerCase().includes(searchText);

        const matchesStatus =
            selectedStatus === "All" ||
            (selectedStatus === "Completed" && task.completed) ||
            (selectedStatus === "Pending" && !task.completed);

        return matchesSearch && matchesStatus;
    });


    // SORT TASKS

    filteredTasks.sort(function(a, b) {

        if (selectedSort === "earliest") {
            return a.date.localeCompare(b.date);
        }

        return b.date.localeCompare(a.date);
    });


    // EMPTY MESSAGE

    if (filteredTasks.length === 0) {

        const message = document.createElement("p");

        message.id = "emptyMessage";

        message.textContent = tasks.length === 0
            ? "No tasks added yet. Start by adding one!"
            : "No matching tasks found.";

        tasksContainer.appendChild(message);

        updateProgress();
        return;
    }


    // TODAY'S DATE

    const today = new Date();

    const todayString =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");


    // CREATE TASK CARDS

    filteredTasks.forEach(function(task) {

        const taskCard = document.createElement("div");
        taskCard.className = "task-card";

        if (!task.completed && task.date < todayString) {
            taskCard.classList.add("overdue");
        }

        if (task.completed) {
            taskCard.classList.add("completed-task");
        }


        // TASK CONTENT

        const taskContent = document.createElement("div");
        taskContent.className = "task-content";

        const taskTitle = document.createElement("h3");
        taskTitle.textContent = task.name;

        const taskDetails = document.createElement("p");
        taskDetails.textContent =
            "Deadline: " + task.date +
            " | Priority: " + task.priority;

        taskContent.appendChild(taskTitle);
        taskContent.appendChild(taskDetails);


        // COMPLETION CHECKBOX

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        const statusLabel = document.createElement("label");
        statusLabel.textContent = " Completed";

        checkbox.addEventListener("change", function() {
            task.completed = checkbox.checked;
            saveTasks();
            displayTasks();
        });


        // EDIT BUTTON

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function() {

            editingTaskId = task.id;

            taskNameInput.value = task.name;
            taskDateInput.value = task.date;
            taskPriorityInput.value = task.priority;

            submitButton.textContent = "Update Task";
            cancelEditButton.hidden = false;

            taskNameInput.focus();
        });


        // DELETE BUTTON

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {

            tasks = tasks.filter(function(item) {
                return item.id !== task.id;
            });

            saveTasks();
            displayTasks();
        });


        // ADD EVERYTHING TO CARD

        taskCard.appendChild(taskContent);
        taskCard.appendChild(checkbox);
        taskCard.appendChild(statusLabel);
        taskCard.appendChild(editButton);
        taskCard.appendChild(deleteButton);

        tasksContainer.appendChild(taskCard);

    });

    updateProgress();
}


// 8. UPDATE PROGRESS

function updateProgress() {

    const total = tasks.length;

    const completed = tasks.filter(function(task) {
        return task.completed === true;
    }).length;

    const pending = total - completed;

    totalTasksElement.textContent = total;
    completedTasksElement.textContent = completed;
    pendingTasksElement.textContent = pending;

    let percentage = 0;

    if (total > 0) {
        percentage = Math.round((completed / total) * 100);
    }

    progressFill.style.width = percentage + "%";

    progressPercentage.textContent =
        percentage + "% Completed";
}


// 9. CANCEL EDITING

cancelEditButton.addEventListener("click", function() {

    editingTaskId = null;

    taskForm.reset();

    submitButton.textContent = "+ Add Task";

    cancelEditButton.hidden = true;

});


// 10. SEARCH

searchInput.addEventListener("input", function() {
    displayTasks();
});


// 11. FILTER

filterStatus.addEventListener("change", function() {
    displayTasks();
});


// 12. SORT

sortTasks.addEventListener("change", function() {
    displayTasks();
});


// 13. START APPLICATION

loadTasks();
displayTasks();

console.log("Student Task Manager is running successfully!");
