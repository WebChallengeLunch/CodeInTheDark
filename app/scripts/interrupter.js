$ = require('jquery');
require('jquery-modal');

const { questions } = require('../assets/questions');

$.modal.defaults = {
  showClose: false,        // Shows a (X) icon/link in the top-right corner
};

class Interrupter {
  // has the app set as a property
  // Uses the time property of the app
  // Shows time lost
  // will do on setInterval
  // keeps track of answered questions, pops correctly questions out, selects from remaining at random
  // Shows correct or wrong
  // number of questions in a row, shown
  constructor(interval, requiredAnswers) {
    console.log('Interrupter');
    this.interval = interval; // no default value
    // this.questions = JSON.parse(questions);
    this.questions = [...questions];
    this.requiredAnswers = requiredAnswers;
    this.nAnsweredCorrectly = 0;
    console.log(questions);
    this._setQuestionTimeout();
  }

 _setQuestionTimeout() {
    setTimeout(() => {
      this._questionsShown = false;
      this._startQuestions();
    }, this.interval);
  }

  _startQuestions() {
    // show dialog, needs a submit button
    // on submit check answer
    if (this.nAnsweredCorrectly >= this.requiredAnswers) {
      $.modal.close();
    } else {
      if (!this._questionsShown) {
        $('#questionModal').modal();
        this._questionsShown = true;
      }
      this._showQuestion().then(answeredCorrectly => {
        this.nAnsweredCorrectly += answeredCorrectly ? 1 : 0;
        this._processAnswer(answeredCorrectly);
      });
    }
  }

  _processAnswer(correct) {
    $('#submitButton').hide();
    $('#nextButton').show();
    // append next button
    const buttonText = this.nAnsweredCorrectly >= this.requiredAnswers ? 'Exit' : 'Next';
    // const [ nextButton ] = $(`<button class="right">Next</button>`);
    const nextButton = $('#nextButton');
    nextButton.html(buttonText);
    nextButton.click(() => this._startQuestions());
    

    // append correct or wrong
    if (correct) {
      $('#questionContainer').append('<div>That\'s right 🎉</div>');
    } else {
      $('#questionContainer').append('<div>Oh no! That\'s not right 😿</div>');
    }
    // $('#questionModal').append(nextButton);
    // this._startQuestions();
  }

  _showQuestion() {
    return new Promise((resolve, reject) => {
      const question = this._getNextQuestion();
      $('#nextButton').hide();
      const optionContainerDiv = $('<div class="option"></div>');
      question.options.forEach((option, i) => {
        optionContainerDiv.append(
        `
        <input type="radio" id="${question.id}_${i}" value="${i}" name="${question.id}">
        <label for="${question.id}_${i}">${option}</label><br>
      `)});
      $('#submitButton').click(() => {
        this._checkAnswer(question, resolve);
      });
      $('#submitButton').show();
      $('#questionContainer').empty();
      $('#questionContainer').append(`<div class="question">${question.question}</div>`);
      $('#questionContainer').append(optionContainerDiv);
    });
  }

  _checkAnswer(question, resolve) {
    const options = $('#questionContainer input');
    const { answer } = question;
    let selected = 0;
    for (let i = 0; i < options.length; i++) {
      selected = options[i].checked ? i : selected;
    }
    if (selected === answer) {
      resolve(true);
    } else {
      resolve(false);
    }
  }

  _getNextQuestion() {
    // pick an unanswered one at random
    return this.questions.shift();
  }

}

// Start this 5 minutes after name has been filled in. 4-6 minutes randomly
new Interrupter(2000, 2);

// Time bound to end of previous round

// Every wrong answer adds delay on next button