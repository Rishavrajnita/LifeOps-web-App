// === Smooth Scroll Navigation ===

document.querySelectorAll('.nav-tile').forEach(tile => {
  tile.addEventListener('click', () => {
    const targetId = tile.getAttribute('data-target');
    const section = document.getElementById(targetId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// === Task Manager ===
const taskInput = document.getElementById('newTaskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  updateDashboardTasksCount();
}

function updateDashboardTasksCount() {
  const todayTasks = tasks.filter(t => !t.archived && !t.completed);
  document.getElementById('todaysTasksCount').textContent = `${todayTasks.length} task${todayTasks.length !== 1 ? 's' : ''}`;
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.filter(t => !t.archived).forEach(task => {
    const li = document.createElement('li');
    li.textContent = task.text;
    if (task.completed) li.classList.add('completed');

    // Task buttons container
    const btnsDiv = document.createElement('div');

    // Complete toggle button
    const completeBtn = document.createElement('button');
    completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
    completeBtn.style.marginRight = '8px';
    completeBtn.addEventListener('click', () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.style.marginRight = '8px';
    editBtn.addEventListener('click', () => {
      const newText = prompt('Edit task:', task.text);
      if (newText !== null && newText.trim() !== '') {
        task.text = newText.trim();
        saveTasks();
        renderTasks();
      }
    });

    // Archive button
    const archiveBtn = document.createElement('button');
    archiveBtn.textContent = 'Archive';
    archiveBtn.addEventListener('click', () => {
      task.archived = true;
      saveTasks();
      renderTasks();
    });

    [completeBtn, editBtn, archiveBtn].forEach(b => {
      b.style.cursor = 'pointer';
      b.style.borderRadius = '8px';
      b.style.padding = '4px 8px';
      b.style.border = 'none';
      b.style.background = '#764ba2';
      b.style.color = 'white';
      b.style.fontWeight = '600';
      b.addEventListener('mouseenter', () => b.style.background = '#5a3580');
      b.addEventListener('mouseleave', () => b.style.background = '#764ba2');
    });

    btnsDiv.append(completeBtn, editBtn, archiveBtn);
    li.appendChild(btnsDiv);

    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';

    taskList.appendChild(li);
  });
  updateDashboardTasksCount();
}

addTaskBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  if (text) {
    tasks.push({ text, completed: false, archived: false });
    taskInput.value = '';
    saveTasks();
    renderTasks();
  }
});

taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTaskBtn.click();
});

renderTasks();

// === Budget Tracker ===
const budgetDescInput = document.getElementById('budgetDescription');
const budgetAmountInput = document.getElementById('budgetAmount');
const budgetTypeSelect = document.getElementById('budgetType');
const addBudgetEntryBtn = document.getElementById('addBudgetEntryBtn');
const budgetEntriesList = document.getElementById('budgetEntriesList');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const budgetBalanceEl = document.getElementById('budgetBalance');

let budgetEntries = JSON.parse(localStorage.getItem('budgetEntries') || '[]');

function saveBudgetEntries() {
  localStorage.setItem('budgetEntries', JSON.stringify(budgetEntries));
  updateBudgetSummary();
  renderBudgetEntries();
  updateBudgetChart();
  updateDashboardMoneySpent();
}

function updateDashboardMoneySpent() {
  const todayExpenses = budgetEntries
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
  document.getElementById('moneySpentToday').textContent = `$${todayExpenses.toFixed(2)}`;
}

function updateBudgetSummary() {
  const income = budgetEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const expense = budgetEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  totalIncomeEl.textContent = income.toFixed(2);
  totalExpenseEl.textContent = expense.toFixed(2);
  budgetBalanceEl.textContent = (income - expense).toFixed(2);
}

function renderBudgetEntries() {
  budgetEntriesList.innerHTML = '';
  budgetEntries.forEach((entry, i) => {
    const li = document.createElement('li');
    li.textContent = `${entry.description} — ${entry.type === 'income' ? '+' : '-'}$${entry.amount.toFixed(2)}`;

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.style.marginLeft = '10px';
    delBtn.style.cursor = 'pointer';
    delBtn.style.border = 'none';
    delBtn.style.background = 'transparent';
    delBtn.style.color = '#e94e77';
    delBtn.style.fontWeight = '700';
    delBtn.style.fontSize = '1.2rem';
    delBtn.addEventListener('click', () => {
      budgetEntries.splice(i, 1);
      saveBudgetEntries();
    });

    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';

    li.appendChild(delBtn);
    budgetEntriesList.appendChild(li);
  });
}

// Chart.js setup for budget pie chart
let budgetChart;
function updateBudgetChart() {
  const income = budgetEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const expense = budgetEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);

  const ctx = document.getElementById('budgetChart').getContext('2d');
  if (budgetChart) budgetChart.destroy();

  budgetChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        data: [income, expense],
        backgroundColor: ['#6aabe9', '#e94e77'],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: '#fff' }
        }
      }
    }
  });
}

addBudgetEntryBtn.addEventListener('click', () => {
  const desc = budgetDescInput.value.trim();
  const amount = parseFloat(budgetAmountInput.value);
  const type = budgetTypeSelect.value;
  if (desc && !isNaN(amount) && amount > 0) {
    budgetEntries.push({ description: desc, amount, type });
    budgetDescInput.value = '';
    budgetAmountInput.value = '';
    saveBudgetEntries();
  } else {
    alert('Please enter a valid description and amount.');
  }
});

budgetDescInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addBudgetEntryBtn.click();
});
budgetAmountInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addBudgetEntryBtn.click();
});

saveBudgetEntries();

// === Health Tracker ===
const stepsInput = document.getElementById('stepsInput');
const waterInput = document.getElementById('waterInput');
const sleepInput = document.getElementById('sleepInput');
const saveHealthDataBtn = document.getElementById('saveHealthDataBtn');

function saveHealthData() {
  const steps = parseInt(stepsInput.value) || 0;
  const water = parseInt(waterInput.value) || 0;
  const sleep = parseFloat(sleepInput.value) || 0;

  const healthData = { steps, water, sleep };
  localStorage.setItem('healthData', JSON.stringify(healthData));
  renderHealthData();
}

function renderHealthData() {
  const healthData = JSON.parse(localStorage.getItem('healthData') || '{}');
  document.getElementById('stepsToday').textContent = healthData.steps || 0;
  document.getElementById('waterToday').textContent = healthData.water || 0;
  document.getElementById('sleepLastNight').textContent = healthData.sleep || 0;
  // Update dashboard water intake too
  document.getElementById('waterIntakeToday').textContent = `${healthData.water || 0} glasses`;
}

saveHealthDataBtn.addEventListener('click', () => {
  saveHealthData();
});

renderHealthData();

// === Focus Timer (Pomodoro style) ===
const timerLabel = document.getElementById('timerLabel');
const timerDisplay = document.getElementById('timer');
const startTimerBtn = document.getElementById('startTimerBtn');
const pauseTimerBtn = document.getElementById('pauseTimerBtn');
const resetTimerBtn = document.getElementById('resetTimerBtn');
const sessionLog = document.getElementById('sessionLog');

let pomodoroDuration = 25 * 60; // 25 minutes
let breakDuration = 5 * 60; // 5 minutes break
let timer = pomodoroDuration;
let timerInterval = null;
let isRunning = false;
let onBreak = false;
let sessionsCompleted = 0;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(timer);
  timerLabel.textContent = onBreak ? 'Break Time' : 'Pomodoro Timer';
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  timerInterval = setInterval(() => {
    timer--;
    updateTimerDisplay();
    if (timer <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      if (!onBreak) {
        sessionsCompleted++;
        sessionLog.textContent = `Pomodoro session completed! Sessions done: ${sessionsCompleted}`;
        onBreak = true;
        timer = breakDuration;
      } else {
        sessionLog.textContent = 'Break ended. Ready for next session.';
        onBreak = false;
        timer = pomodoroDuration;
      }
      updateTimerDisplay();
      startTimer();
    }
  }, 1000);
}

function pauseTimer() {
  if (!isRunning) return;
  clearInterval(timerInterval);
  isRunning = false;
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  onBreak = false;
  timer = pomodoroDuration;
  sessionsCompleted = 0;
  sessionLog.textContent = '';
  updateTimerDisplay();
}

startTimerBtn.addEventListener('click', startTimer);
pauseTimerBtn.addEventListener('click', pauseTimer);
resetTimerBtn.addEventListener('click', resetTimer);

updateTimerDisplay();

// === Settings ===
const darkModeToggle = document.getElementById('darkModeToggle');
const clearDataBtn = document.getElementById('clearDataBtn');

function setDarkMode(enabled) {
  if (enabled) {
    document.body.style.background = '#121212';
    document.body.style.color = '#eee';
  } else {
    document.body.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
    document.body.style.color = '#eee';
  }
  localStorage.setItem('darkMode', enabled ? 'true' : 'false');
}

darkModeToggle.addEventListener('change', () => {
  setDarkMode(darkModeToggle.checked);
});

clearDataBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
    localStorage.clear();
    location.reload();
  }
});

// Initialize dark mode from storage
const savedDarkMode = localStorage.getItem('darkMode') === 'true';
darkModeToggle.checked = savedDarkMode;
setDarkMode(savedDarkMode);


// === Sections Initialization ===
const navTiles = document.querySelectorAll('.nav-tile');
navTiles.forEach(tile =>
  tile.addEventListener('click', () =>
    document.getElementById(tile.dataset.target)
            .scrollIntoView({ behavior: 'smooth' })
  )
);

// ... [previous modules: Task, Budget, Health, Timer, Settings] ...

// --- 7. Smart Grocery Manager ---
const groItemInput = document.getElementById('groceryItemInput');
const addGroBtn = document.getElementById('addGroceryBtn');
const groceryListDiv = document.getElementById('groceryListDiv');
let groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];

function saveGrocery() {
  localStorage.setItem('groceryList', JSON.stringify(groceryList));
  drawGrocery();
}

function drawGrocery() {
  groceryListDiv.innerHTML = groceryList.length
    ? groceryList.map((item, idx) => `
        <div class="grocery-item">
          <span style="text-decoration:${item.acquired ? 'line-through' : 'none'}">
            ${item.name}
          </span>
          <button onclick="toggleAcquire(${idx})">
            ${item.acquired ? 'Undo' : 'Got'}
          </button>
          <button onclick="removeGrocery(${idx})">Delete</button>
        </div>`).join('')
    : '<p>No items yet.</p>';
}

function toggleAcquire(idx) {
  groceryList[idx].acquired = !groceryList[idx].acquired;
  saveGrocery();
}

function removeGrocery(idx) {
  groceryList.splice(idx, 1);
  saveGrocery();
}

addGroBtn.addEventListener('click', () => {
  const name = groItemInput.value.trim();
  if (name) {
    groceryList.push({ name, acquired: false });
    groItemInput.value = '';
    saveGrocery();
  }
});
window.toggleAcquire = toggleAcquire;
window.removeGrocery = removeGrocery;
drawGrocery();

// --- 8. Subscription Manager ---
const subNameInput = document.getElementById('subNameInput');
const subAmountInput = document.getElementById('subAmountInput');
const addSubBtn = document.getElementById('addSubBtn');
const subListDiv = document.getElementById('subListDiv');
let subscriptions = JSON.parse(localStorage.getItem('subscriptions')) || [];

function saveSubs() {
  localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  drawSubs();
}

function drawSubs() {
  subListDiv.innerHTML = subscriptions.length
    ? subscriptions.map((s, i) => `
        <div class="sub-item">
          <span>${s.name} — $${s.amount.toFixed(2)}</span>
          <button onclick="removeSub(${i})">Remove</button>
        </div>`).join('')
    : '<p>No subscriptions yet.</p>';
}

function removeSub(i) {
  subscriptions.splice(i, 1);
  saveSubs();
}

addSubBtn.addEventListener('click', () => {
  const name = subNameInput.value.trim();
  const amt = parseFloat(subAmountInput.value);
  if (name && !isNaN(amt) && amt > 0) {
    subscriptions.push({ name, amount: amt });
    subNameInput.value = subAmountInput.value = '';
    saveSubs();
  }
});
window.removeSub = removeSub;
drawSubs();

// --- 9. Plant Care Tracker ---
const plantNameInput = document.getElementById('plantNameInput');
const plantDateInput = document.getElementById('plantDateInput');
const addPlantBtn = document.getElementById('addPlantBtn');
const plantListDiv = document.getElementById('plantListDiv');
let plantLog = JSON.parse(localStorage.getItem('plantLog')) || [];

function savePlants() {
  localStorage.setItem('plantLog', JSON.stringify(plantLog));
  drawPlants();
}

function drawPlants() {
  plantListDiv.innerHTML = plantLog.length
    ? plantLog.map((p, i) => `
        <div class="plant-item">
          <span>${p.name} — Last watered on ${new Date(p.date).toLocaleDateString()}</span>
          <button onclick="removePlant(${i})">Remove</button>
        </div>`).join('')
    : '<p>No plants tracked yet.</p>';
}

function removePlant(i) {
  plantLog.splice(i, 1);
  savePlants();
}

addPlantBtn.addEventListener('click', () => {
  const name = plantNameInput.value.trim();
  const date = plantDateInput.value;
  if (name && date) {
    plantLog.push({ name, date });
    plantNameInput.value = plantDateInput.value = '';
    savePlants();
  }
});
window.removePlant = removePlant;
drawPlants();

// --- 10. Borrowed/Lent Item Tracker ---
const blNameInput = document.getElementById('blNameInput');
const blPersonInput = document.getElementById('blPersonInput');
const blTypeSelect = document.getElementById('blTypeSelect');
const addBlBtn = document.getElementById('addBlBtn');
const blListDiv = document.getElementById('blListDiv');
let blList = JSON.parse(localStorage.getItem('blList')) || [];

function saveBL() {
  localStorage.setItem('blList', JSON.stringify(blList));
  drawBL();
}

function drawBL() {
  blListDiv.innerHTML = blList.length
    ? blList.map((item, i) => `
        <div class="bl-item">
          <span>${item.name} — ${item.type} with ${item.person}</span>
          <button onclick="removeBL(${i})">Remove</button>
        </div>`).join('')
    : '<p>No tracked items yet.</p>';
}

function removeBL(i) {
  blList.splice(i, 1);
  saveBL();
}

addBlBtn.addEventListener('click', () => {
  const name = blNameInput.value.trim();
  const person = blPersonInput.value.trim();
  const type = blTypeSelect.value;
  if (name && person && type) {
    blList.push({ name, person, type });
    blNameInput.value = blPersonInput.value = '';
    saveBL();
  }
});
window.removeBL = removeBL;
drawBL();
