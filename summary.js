// Summary page script - shows charts and breakdowns

var summaryBudget = document.getElementById("summaryBudget");
var summarySpent = document.getElementById("summarySpent");
var summaryLeft = document.getElementById("summaryLeft");
var categoryChart = document.getElementById("categoryChart");
var dailyChart = document.getElementById("dailyChart");
var allExpensesTable = document.getElementById("allExpensesTable");

var budget = 0;
var expenses = [];

// Load data from storage
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

// Format money
function formatMoney(amount) {
    return "KSH " + amount.toLocaleString("en-US");
}

// Calculate totals
function updateSummary() {
    var totalSpent = 0;
    for (var i = 0; i < expenses.length; i++) {
        totalSpent += expenses[i].amount;
    }
    
    var remaining = budget - totalSpent;
    if (remaining < 0) remaining = 0;
    
    summaryBudget.innerHTML = formatMoney(budget);
    summarySpent.innerHTML = formatMoney(totalSpent);
    summaryLeft.innerHTML = formatMoney(remaining);
}

// Create simple bar chart for categories
function showCategoryChart() {
    if (expenses.length === 0) {
        categoryChart.innerHTML = '<p class="empty-message">No expenses to show</p>';
        return;
    }
    
    // Calculate totals per category
    var categories = {};
    for (var i = 0; i < expenses.length; i++) {
        var cat = expenses[i].category;
        if (!categories[cat]) {
            categories[cat] = 0;
        }
        categories[cat] += expenses[i].amount;
    }
    
    // Find max for scaling
    var maxAmount = 0;
    for (var cat in categories) {
        if (categories[cat] > maxAmount) {
            maxAmount = categories[cat];
        }
    }
    
    // Build chart HTML
    var html = '<div style="margin-top: 15px;">';
    
    for (var cat in categories) {
        var amount = categories[cat];
        var percent = (amount / maxAmount) * 100;
        var color = getCategoryColor(cat);
        
        html += '<div style="margin-bottom: 15px;">';
        html += '<div style="display: flex; justify-content: space-between; margin-bottom: 5px;">';
        html += '<span style="font-weight: 500;">' + cat + '</span>';
        html += '<span style="color: #555;">' + formatMoney(amount) + '</span>';
        html += '</div>';
        html += '<div style="width: 100%; height: 25px; background: #e1e8ed; border-radius: 12px; overflow: hidden;">';
        html += '<div style="width: ' + percent + '%; height: 100%; background: ' + color + '; border-radius: 12px; transition: width 0.5s ease;"></div>';
        html += '</div>';
        html += '</div>';
    }
    
    html += '</div>';
    categoryChart.innerHTML = html;
}

// Get color for category (I hardcoded these)
function getCategoryColor(cat) {
    var colors = {
        "Food": "#e74c3c",
        "Transport": "#3498db",
        "Books": "#9b59b6",
        "Entertainment": "#f39c12",
        "Other": "#95a5a6"
    };
    return colors[cat] || "#5b7fff";
}

// Show recent activity list
function showDailyChart() {
    if (expenses.length === 0) {
        dailyChart.innerHTML = '<p class="empty-message">No expenses to show</p>';
        return;
    }
    
    // Sort by date (newest first)
    var sorted = expenses.slice().sort(function(a, b) {
        return b.date - a.date;
    });
    
    // Show last 7 expenses
    var recent = sorted.slice(0, 7);
    
    var html = '<div style="margin-top: 15px;">';
    
    for (var i = 0; i < recent.length; i++) {
        var item = recent[i];
        var date = new Date(item.date).toLocaleDateString("en-GB");
        
        html += '<div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e1e8ed;">';
        html += '<div>';
        html += '<div style="font-weight: 500;">' + item.description + '</div>';
        html += '<div style="font-size: 12px; color: #888;">' + date + ' • ' + item.category + '</div>';
        html += '</div>';
        html += '<div style="font-weight: bold; color: #e74c3c;">-' + formatMoney(item.amount) + '</div>';
        html += '</div>';
    }
    
    html += '</div>';
    dailyChart.innerHTML = html;
}

// Show all expenses in table
function showAllExpenses() {
    if (expenses.length === 0) {
        allExpensesTable.innerHTML = '<tr><td colspan="4" class="empty-message">No expenses recorded yet</td></tr>';
        return;
    }
    
    // Sort newest first
    var sorted = expenses.slice().sort(function(a, b) {
        return b.date - a.date;
    });
    
    var html = "";
    for (var i = 0; i < sorted.length; i++) {
        var item = sorted[i];
        var date = new Date(item.date).toLocaleDateString("en-GB");
        
        html += "<tr>";
        html += "<td>" + date + "</td>";
        html += "<td>" + item.description + "</td>";
        html += "<td><span style='background: " + getCategoryColor(item.category) + "; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px;'>" + item.category + "</span></td>";
        html += "<td><strong>" + formatMoney(item.amount) + "</strong></td>";
        html += "</tr>";
    }
    
    allExpensesTable.innerHTML = html;
}

// Start everything
loadData();
updateSummary();
showCategoryChart();
showDailyChart();
showAllExpenses();