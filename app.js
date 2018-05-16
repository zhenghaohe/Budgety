// BUDGET CONTROLLER
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round(this.value / totalIncome * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    data.totals[type] = data.allItems[type].reduce((sum,ele) => sum + ele.value, 0);
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem(type, des, val) {
      var newItem, ID;

      //create IDs
      if (data.allItems[type].length) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else{
        ID = 0;
      }
      //create new items
      if (type === 'exp') {
        newItem = new Expense(ID, des, val)
      } else if (type === 'inc') {
        newItem = new Expense(ID, des, val)
      }
      //push it into the data structure
      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem(type, id) {
      var ids, index;

      ids = data.allItems[type].map((ele)=>ele.id); // get the array of IDs
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget() {
      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      // calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      // calculate the percentage of income that we spent
      if (data.totals.inc>0) {
        data.percentage = parseInt(data.totals.exp / data.totals.inc * 100);
      } else {
        data.percentage = -1;
      }
    },

    getBudget() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    calculatePercentages() {
      data.allItems.exp.forEach((ele)=>ele.calcPercentage(data.totals.inc));
    },

    getPercentages() {
      var allPerc = data.allItems.exp.map((ele)=>ele.getPercentage()); // get all the percentages
      return allPerc;
    },

    testing() {
      console.log(data);
    }
  }
})();

// UI CONTROLLER
var UIController = (function() {
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn:'.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dataLabel: '.budget__title--month'
  }

  var formatNumber = function(num,type) {
    var numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.')
    int = numSplit[0]; //integer part
    dec = numSplit[1];//decimal part
    if (int.length>3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];
    sign = type === 'exp' ? '-' : '+';
    console.log(sign);

    return sign + ' ' + int + '.' + dec;
  };

  return {
    getInput() {
      return{
        type : document.querySelector(DOMstrings.inputType).value,
        description : document.querySelector(DOMstrings.inputDescription).value,
        value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    displayMonth() {
      var now, year, month, months;

      months = ['Jan','Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();

      document.querySelector(DOMstrings.dataLabel).textContent = months[month] + ' ' + year;


    },

    getDOMStrings() {
      return DOMstrings;
    },

    displayPercentages(percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      var nodeListForEach = function(list,callback){
        for (var i = 0; i < list.length; i++) {
          callback(list[i],i);
        }
      };

      nodeListForEach(fields, function(list,index) {
        if (percentages[index]>0) {
          list.textContent = percentages[index] + '%';
        } else {
          list.textContent = '---'
        }
      });
    },

    addListItem(obj,type) {
      var html, newHtml, element;

      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else {
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }
      //replace the placeholder text with actual data
      newHtml = html.replace('%id%',obj.id);
      newHtml = newHtml.replace('%description%',obj.description);
      newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));
      //insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
    },

    deleteListItem(id) {
      var el = document.getElementById(id);

      el.parentNode.removeChild(el);

    },

    clearFields() {
      var fileds, filedsArr;


      fileds = document.querySelectorAll(DOMstrings.inputDescription + ', '+DOMstrings.inputValue);
      filedsArr = Array.prototype.slice.call(fileds); // change the list to array
      filedsArr.forEach((ele) => ele.value = '');
      filedsArr[0].focus();
    },

    displayBudget(obj) {
      var type;
      type = obj.budget >= 0 ? 'inc' : 'exp';
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else{
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';

      }
    }


  }})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl,UICtrl){

  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMStrings();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
    // document.addEventListener('keypress',ctrlAddItem);
  };

  var updateBudget = function() {
    var budget;
    //Calculate the budget
    budgetCtrl.calculateBudget();
    budget = budgetCtrl.getBudget();
    //Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentage = function() {
    budgetCtrl.calculatePercentages();
    var percentages = budgetCtrl.getPercentages();
    UICtrl.displayPercentages(percentages);
  }

  var ctrlAddItem = function() {
    var input, newItem
    //Get the filled input data
    input = UICtrl.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //Add the item to the budget CONTROLLER
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      //Add the item to the UI
      UICtrl.addListItem(newItem, input.type);
      //clear the fileds
      UICtrl.clearFields();
      //Calculate the budget
      updateBudget();

      updatePercentage();

    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);
      //delete the item from the UI
      UICtrl.deleteListItem(itemID);
      //update and show the new budget
      updateBudget();
      //update the percentages
    }
  };

  return {
    init() {
      console.log('App started');
      setupEventListeners();
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
    }
  }
})(budgetController,UIController);

controller.init();
