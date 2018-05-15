// BUDGET CONTROLLER
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    data.totals[type] = data.allItems[type].reduce((sum,ele) => sum + ele.value, 0);
  }

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

    calculateBudget() {
      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      // calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      // calculate the percentage of income that we spent
      data.percentage = parseInt(data.totals.exp / data.totals.inc * 100);
    },

    getBudget() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
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
    expensesContainer: '.expenses__list'
  }
  return {
    getInput() {
      return{
        type : document.querySelector(DOMstrings.inputType).value,
        description : document.querySelector(DOMstrings.inputDescription).value,
        value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    getDOMStrings() {
      return DOMstrings;
    },

    addListItem(obj,type) {
      var html, newHtml, element;

      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = `<div class="item clearfix" id="income-%id%">
            <div class="item__description">%description%</div>
            <div class="right clearfix">
                <div class="item__value">%value%</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>`
      } else {
        element = DOMstrings.expensesContainer;
        html = `<div class="item clearfix" id="expense-%id%">
            <div class="item__description">%description%</div>
            <div class="right clearfix">
                <div class="item__value">%value%</div>
                <div class="item__percentage">21%</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>`
      }
      //replace the placeholder text with actual data
      newHtml = html.replace('%id%',obj.id);
      newHtml = newHtml.replace('%description%',obj.description);
      newHtml = newHtml.replace('%value%',obj.value);
      //insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
    },

    clearFields() {
      var fileds, filedsArr;

      fileds = document.querySelectorAll(DOMstrings.inputDescription + ', '+DOMstrings.inputValue);
      filedsArr = Array.prototype.slice.call(fileds); // change the list to array
      filedsArr.forEach((ele) => ele.value = '');
      filedsArr[0].focus();
    }


  }})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl,UICtrl){

  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMStrings();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    // document.addEventListener('keypress',ctrlAddItem);
  }
  var updateBudget = function() {
    var budget;
    //Calculate the budget
    budgetCtrl.calculateBudget();
    budget = budgetCtrl.getBudget();
    //Display the budget on the UI
    console.log(budget);
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
    }
  }
  return {
    init() {
      console.log('App started');
      setupEventListeners();
    }
  }
})(budgetController,UIController);

controller.init();
