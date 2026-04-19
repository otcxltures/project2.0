// Get all the elements I need from HTML
var budgetForm = document.getElementById("budgetForm");
var expenseForm = document.getElementById("expenseForm");

var budgetInput = document.getElementById("budgetInput");
var descInput = document.getElementById("descInput");
var amountInput = document.getElementById("amountInput");
var categoryInput = document.getElementById("categoryInput");

var budgetTotal = document.getElementById("budgetTotal");
var budgetSpent = document.getElementById("budgetSpent");
var budgetLeft = document.getElementById("budgetLeft");
var alertBox = document.getElementById("alertBox");
var progressBar = document.getElementById("progressBar");
var expenseTable = document.getElementById("expenseTable");

// Variables to store the data
var budget = 0;
var expenses = [];

// Load any saved data when page starts
function loadData() {
    var savedBudget = localStorage.getItem("pesapal_budget");
    var savedExpenses = localStorage.getItem("pesapal_expenses");
    
    if (savedBudget) {
        budget = parseFloat(savedBudget);
    }
    
    if (savedExpenses) {
        expenses = JSON.parse(savedExpenses);
    }
}

// Save data to browser so it doesn't disappear on refresh
function saveData() {
    localStorage.setItem("pesapal_budget", budget);
    localStorage.setItem("pesapal_expenses", JSON.stringify(expenses));
}

// Format numbers as money with commas
function formatMoney(amount) {
    return "KSH " + amount.toLocaleString("en-US");
}

// Update all the numbers and colors on screen
function updateDisplay() {
    var totalSpent = 0;
    for (var i = 0; i < expenses.length; i++) {
        totalSpent += expenses[i].amount;
    }
    
    var remaining = budget - totalSpent;
    if (remaining < 0) remaining = 0;
    
    // Update the text
    budgetTotal.innerHTML = formatMoney(budget);
    budgetSpent.innerHTML = formatMoney(totalSpent);
    budgetLeft.innerHTML = formatMoney(remaining);
    
    // Update progress bar
    var percent = 0;
    if (budget > 0) {
        percent = (totalSpent / budget) * 100;
        if (percent > 100) percent = 100;
    }
    progressBar.style.width = percent + "%";
    
    // Change color based on usage
    if (percent >= 100) {
        progressBar.style.background = "linear-gradient(90deg, #e74c3c, #c0392b)";
    } else if (percent >= 85) {
        progressBar.style.background = "linear-gradient(90deg, #f39c12, #e67e22)";
    } else {
        progressBar.style.background = "linear-gradient(90deg, #8eea9f, #5b7fff)";
    }
    
    // Show appropriate message
    if (budget === 0) {
        alertBox.className = "alert alert-info";
        alertBox.innerHTML = "Set a budget to start tracking your spending.";
    } else if (totalSpent === 0) {
        alertBox.className = "alert alert-info";
        alertBox.innerHTML = "Add your first expense to see your totals.";
    } else if (totalSpent >= budget) {
        alertBox.className = "alert alert-error";
        alertBox.innerHTML = "⚠️ You have exceeded your budget!";
    } else if (totalSpent >= budget * 0.85) {
        alertBox.className = "alert alert-warning";
        alertBox.innerHTML = "⚠️ Warning: You are close to your budget limit.";
    } else {
        alertBox.className = "alert alert-info";
        alertBox.innerHTML = "✓ Your spending is on track. Keep it up!";
    }
}

// Show expenses in the table
function showExpenses() {
    if (expenses.length === 0) {
        expenseTable.innerHTML = '<tr><td colspan="4" class="empty-message">No expenses recorded yet</td></tr>';
        return;
    }
    
    var html = "";
    // Show newest first by looping backwards
    for (var i = expenses.length - 1; i >= 0; i--) {
        var item = expenses[i];
        var date = new Date(item.date).toLocaleDateString("en-GB");
        
        html += "<tr>";
        html += "<td>" + date + "</td>";
        html += "<td>" + item.description + "</td>";
        html += "<td>" + item.category + "</td>";
        html += "<td><strong>" + formatMoney(item.amount) + "</strong></td>";
        html += "</tr>";
    }
    
    expenseTable.innerHTML = html;
}

// When user sets budget
budgetForm.onsubmit = function(e) {
    e.preventDefault();
    
    var value = parseFloat(budgetInput.value);
    
    if (value > 0) {
        budget = value;
        budgetInput.value = "";
        saveData();
        updateDisplay();
        alert("Budget set to " + formatMoney(budget));
    }
};

// When user adds expense
expenseForm.onsubmit = function(e) {
    e.preventDefault();
    
    var desc = descInput.value.trim();
    var amt = parseFloat(amountInput.value);
    var cat = categoryInput.value;
    
    if (desc && amt > 0) {
        var newExpense = {
            date: Date.now(),
            description: desc,
            amount: amt,
            category: cat
        };
        
        expenses.push(newExpense);
        
        // Clear form
        descInput.value = "";
        amountInput.value = "";
        categoryInput.value = "Food";
        
        saveData();
        updateDisplay();
        showExpenses();
    }
};

// Start the app
loadData();
updateDisplay();
showExpenses();