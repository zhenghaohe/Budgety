// Retrive elements from DOM tree
const getDestructuredElementsByIds = (document) => {
  return new Proxy({}, { get: (_, id) => document.getElementById(id) });
};

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
} = getDestructuredElementsByIds(document);

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

  const calculateTotal = (type) => {
    data.totals[type] = data.allItems[type].reduce((sum, e) => sum + e.value, 0);
  };

  return {
    addItem(type, des, val) {
      let newItem, id;

      if (data.allItems[type].length) {
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        id = 0;
      }

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
      calculateTotal('exp');
      calculateTotal('inc');
      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.in > 0) {
        data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentages() {
      data.allItems.exp.forEach((ele) => ele.calcPercentage(data.totals.inc));
    },
    getPercentages() {
      const allPerc = data.allItems.exp.map( (ele) => ele.getPercentage());
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

const UIController = (() => {
  const formatNumber = (num,type) => {
    num = Math.abs(num);
    num = num.toFixed(2);
    let [int, dec] = num.split('.');
    if (int.length>3) {
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
      element.insertAdjacentHTML('beforeend', newHtml);
    },
    deleteListItem(id) {
      const e = document.getElementById(id);
      e.parentNode.removeChild(e);
    },
    clearFields() {
      const fields = [addDescription, addValue];
      fields.forEach((field)=> field.value = '');
      fields[0].focus();
    },
    displayBudget(obj) {
      let type;
      type = obj.budget >= 0 ? 'inc' : 'exp';
        budgetValue.textContent = `${formatNumber(obj.budget, type)}`;
      budgetIncomeValue.textContent = `${formatNumber(obj.totalInc, 'inc')}`;
        budgetExpensesValue.textContent = `${formatNumber(obj.totalExp, 'exp')}`
        if (obj.percentage > 0) {
          budgetExpensesPercentage.textContent = `${obj.percentage}%`;
        } else{
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

      fields.forEach((currentField) => {
        currentField.classList.toggle('alert-focus');
      });
      addButton.classList.toggle('alert');
    },
  };
})();

const AppController = ((budgetCtrl, UICtrl) =>{
  const setupEventListeners = () => {
    addButton.addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', (e) => {
      if (e.keyCode === 13) ctrlAddItem();
    });
    budgetContainer.addEventListener('click', ctrlDeleteItem);
    addType.addEventListener('change', UICtrl.changedType);
  };
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
  const ctrlDeleteItem = (e) => {
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
