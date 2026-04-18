const budgetForm = document.getElementById('budget-form');
const expenseForm = document.getElementById('expense-form');
const budgetInput = document.getElementById('budget-input');
const expenseDescription = document.getElementById('expense-description');
const expenseAmount = document.getElementById('expense-amount');
const expenseCategory = document.getElementById('expense-category');
const budgetTotal = document.getElementById('budget-total');
const budgetSpent = document.getElementById('budget-spent');
const budgetRemaining = document.getElementById('budget-remaining');
const budgetWarning = document.getElementById('budget-warning');
const expenseTableBody = document.getElementById('expense-table-body');

let budget = 0;
let expenses = [];

function formatCurrency(value) {
  return `KSH ${Number(value).toLocaleString('en-US')}`;
}

function saveData() {
  localStorage.setItem('pesapalBudget', budget);
  localStorage.setItem('pesapalExpenses', JSON.stringify(expenses));
}

function loadData() {
  budget = Number(localStorage.getItem('pesapalBudget') || 0);
  expenses = JSON.parse(localStorage.getItem('pesapalExpenses') || '[]');
}

function updateTotals() {
  const spent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remaining = Math.max(budget - spent, 0);

  budgetTotal.textContent = formatCurrency(budget);
  budgetSpent.textContent = formatCurrency(spent);
  budgetRemaining.textContent = formatCurrency(remaining);

  if (!budget) {
    budgetWarning.textContent = 'Set a budget to start tracking your spending.';
    budgetWarning.className = 'alert info';
    return;
  }

  if (spent === 0) {
    budgetWarning.textContent = 'Add an expense to see your totals.';
    budgetWarning.className = 'alert info';
    return;
  }

  const ratio = spent / budget;
  if (ratio >= 1) {
    budgetWarning.textContent = 'You have exceeded your budget.';
    budgetWarning.className = 'alert error';
  } else if (ratio >= 0.85) {
    budgetWarning.textContent = 'Warning: you are close to your budget limit.';
    budgetWarning.className = 'alert warning';
  } else {
    budgetWarning.textContent = 'Your spending is on track.';
    budgetWarning.className = 'alert info';
  }
}

function renderExpenses() {
  expenseTableBody.innerHTML = '';
  if (!expenses.length) {
    expenseTableBody.innerHTML = '<tr><td colspan="4" class="empty-row">No expenses recorded yet.</td></tr>';
    return;
  }

  expenses.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(item.date).toLocaleDateString()}</td>
      <td>${item.description}</td>
      <td>${item.category}</td>
      <td>${formatCurrency(item.amount)}</td>
    `;
    expenseTableBody.appendChild(row);
  });
}

function refresh() {
  updateTotals();
  renderExpenses();
}

budgetForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = Number(budgetInput.value);
  if (!value || value <= 0) return;
  budget = value;
  budgetInput.value = '';
  saveData();
  refresh();
});

expenseForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const description = expenseDescription.value.trim();
  const amount = Number(expenseAmount.value);
  const category = expenseCategory.value;

  if (!description || !amount || amount <= 0) return;

  expenses.push({
    date: Date.now(),
    description,
    amount,
    category,
  });

  expenseDescription.value = '';
  expenseAmount.value = '';
  expenseCategory.value = 'Food';

  saveData();
  refresh();
});

loadData();
refresh();
