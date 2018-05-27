// retrieve the DOM elements needed
const {
  addType,
  addDescription,
  addValue,
  addButton,
  budgetContainer,
  budgetIncomeList,
  budgetExpensesList,
  budgetValue,
  budgetIncomeValue,
  budgetExpensesValue,
  budgetExpensesPercentage,
  monthLabel,
} = new Proxy({}, { get(_, id) { return document.getElementById(id); } });

// BUDGET CONTROLLER
const budgetController = (() => {
  class Expense {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    }
    calcPercentage(totalIncome) {
      if (totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
      } else {
        this.percentage = -1;
      }
    }
    getPercentage() {
      return this.percentage;
    }
  }

  class Income {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    }
  }

  const data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  const calculateTotal = type => {
    data.totals[type] = data.allItems[type].reduce((sum, e) => sum + e.value, 0);
  };

  return {
    addItem(type, des, val) {
      let newItem, id;

      // Create new ID
      if (data.allItems[type].length) {
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        id = 0;
      }
      //[1 2 3 4 5], next ID = 6
      //[1 2 4 6 8], next ID = 9
      // ID = last ID + 1

      // Create new item based on 'inc' or 'exp' type
      if (type === 'exp') {
        newItem = new Expense(id, des, val);
      } else if (type === 'inc') {
        newItem = new Expense(id, des, val);
      }
      data.allItems[type].push(newItem);

      return newItem;
    },
    deleteItem(type, id) {
      for (let i = 0; i < data.allItems[type].length; i++) {
        if (data.allItems[type][i].id === id) {
          data.allItems[type].splice(i, 1);
        }
      }
    },
    calculateBudget() {
      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      // Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      // calculate the percentage of income that spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentages() {
      data.allItems.exp.forEach(e => e.calcPercentage(data.totals.inc));
    },
    getPercentages() {
      const allPerc = data.allItems.exp.map(e => e.getPercentage());
      return allPerc;
    },
    getBudget() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },
  };
})();

// UI CONTROLLER
const UIController = (() => {
  const formatNumber = (num,type) => {
    /*
        + or - before number
        exactly 2 decimal points
        comma separating the thousands

        2310.4567 -> + 2,310.46
        2000 -> + 2,000.00
        */
    num = Math.abs(num);
    num = num.toFixed(2);
    let [int, dec] = num.split('.');
    if (int.length > 3) {
      int = `${int.substr(0, int.length - 3)},${int.slice(int.length - 3)}`;
    }

    return `${type === 'exp' ? '-' : '+'} ${int}.${dec}`;
  };

  return {
    getInput() {
      return {
        type: addType.value,
        description: addDescription.value,
        value: parseFloat(addValue.value),
      };
    },
    addListItem(obj, type) {
      let newHtml, element;

      // Create HTML string with placeholder text
      if (type === 'inc') {
        element = budgetIncomeList;
        newHtml = `
            <div class="item clearfix" id="inc-${obj.id}">
              <div class="item__description">${obj.description}</div>
              <div class="right clearfix">
                <div class="item__value">${formatNumber(obj.value, type)}</div>
                <div class="item__delete">
                  <button class="item__delete--btn">
                    <i class="ion-ios-close-outline"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
      } else if (type === 'exp') {
        element = budgetExpensesList;
        newHtml = `
          <div class="item clearfix" id="exp-${obj.id}">
            <div class="item__description">${obj.description}</div>
            <div class="right clearfix">
              <div class="item__value">${formatNumber(obj.value, type)}</div>
              <div class="item__percentage"></div>
              <div class="item__delete">
                <button class="item__delete--btn">
                  <i class="ion-ios-close-outline"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }
      // Insert the HTML into the DOM
      element.insertAdjacentHTML('beforeend', newHtml);
    },
    deleteListItem(id) {
      const e = document.getElementById(id);
      e.parentNode.removeChild(e);
    },
    clearFields() {
      const fields = [addDescription, addValue];
      fields.forEach(field => {field.value = ''});
      fields[0].focus();
    },
    displayBudget(obj) {
      const type = obj.budget >= 0 ? 'inc' : 'exp';
      budgetValue.textContent = `${formatNumber(obj.budget, type)}`;
      budgetIncomeValue.textContent = `${formatNumber(obj.totalInc, 'inc')}`;
      budgetExpensesValue.textContent = `${formatNumber(obj.totalExp, 'exp')}`
      if (obj.percentage > 0) {
        budgetExpensesPercentage.textContent = `${obj.percentage}%`;
      } else {
        budgetExpensesPercentage.textContent = '---';
      }
    },
    displayPercentages(percentages) {
      const expensesPercentageLabel = document.getElementsByClassName('item__percentage');
      const fields = [...expensesPercentageLabel];

      fields.forEach((currentField, index) => {
        if (percentages[index] > 0) {
          currentField.textContent = `${percentages[index]} %`;
        } else {
          currentField.textContent = '---';
        }
      });
    },
    displayMonth() {
      const now = new Date();
      const month = now.toLocaleString('en-us', {
        month: 'long',
      });
      const year = now.getFullYear();

      monthLabel.textContent = `${month}, ${year}`;
    },
    changedType() {
      const fields = [addType, addDescription, addValue];

      fields.forEach(currentField => currentField.classList.toggle('alert-focus'));
      addButton.classList.toggle('alert');
    },
  };
})();

// GLOBAL APP CONTROLLER
const AppController = ((budgetCtrl, UICtrl) => {
  const updateBudget = () => {
    budgetCtrl.calculateBudget();
    const budget = budgetCtrl.getBudget();
    UIController.displayBudget(budget);
  };
  const updatePercentages = () => {
    budgetCtrl.calculatePercentages();
    const percentages = budgetCtrl.getPercentages();
    UIController.displayPercentages(percentages);
  };
  const ctrlAddItem = () => {
    const input = UICtrl.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      const newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      UICtrl.addListItem(newItem, input.type);
      UICtrl.clearFields();
      updateBudget();
      updatePercentages();
    }
  };
  const ctrlDeleteItem = e => {
    const itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      const splitID = itemID.split('-');
      const type = splitID[0];
      const id = parseInt(splitID[1]);
      budgetCtrl.deleteItem(type, id);
      UICtrl.deleteListItem(itemID);
      updateBudget();
      updatePercentages();
    }
  };
  const setupEventListeners = () => {
    addButton.addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', e => {
      if (e.keyCode === 13) ctrlAddItem();
    });
    budgetContainer.addEventListener('click', ctrlDeleteItem);
    addType.addEventListener('change', UICtrl.changedType);
  };

  return {
    init() {
      setupEventListeners();
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
    },
  };
})(budgetController, UIController);

AppController.init();
