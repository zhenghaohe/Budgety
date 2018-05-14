// BUDGET CONTROLLER
var budgetController = (function() {
  //
})();


// UI CONTROLLER
var UIController = (function() {
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn:'.add__btn'
  }
  return {
    getInput() {
      return{
        type : document.querySelector(DOMstrings.inputType).value, //will be either 'inc' or 'exp'
        description : document.querySelector(DOMstrings.inputDescription).value,
        value : document.querySelector(DOMstrings.inputValue).value
      };
    },
    getDOMStrings() {
      return DOMstrings;
    }
  }})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl,UICtrl){
  var DOM = UICtrl.getDOMStrings();
  var ctrlAddItem = function() {
    //Get the filled input data
    var input = UICtrl.getInput();
    console.log(input);
    //Add the item to the budget CONTROLLER

    //Add the item to the UI

    //Calculate the budget

    //Display the budget on the UI
  }

  document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

  document.addEventListener('keypress',ctrlAddItem);

})(budgetController,UIController);
