$ = require('jquery');
require('jquery-modal');

const { questions } = require('../assets/questions');

$.modal.defaults = {
  showClose: false,        // Shows a (X) icon/link in the top-right corner
};

class Interrupter {
  // keeps track of answered questions, pops correctly questions out, selects from remaining at random
  // Shows correct or wrong
  constructor(requiredAnswers, maxQuestions) {
    console.log('Interrupter');
    this._restoreState();
    this._computeQuestions();
    this._calculateTimeout();
    this._questionsShown = false;
    this.requiredAnswers = requiredAnswers;
    this._submitButton = $('#submitButton');
    this._nextButton = $('#nextButton');
    this._nextButton.click(() => this._startQuestions());
    this._setQuestionTimeout();
  }

  _restoreState() {
    const questionsAnswered = localStorage.getItem('questionsAnswered');
    this._questionsAnswered = questionsAnswered ? JSON.parse(questionsAnswered) : [];
    
    const nextQuestionsStart = localStorage.getItem('nextQuestionsStart');
    this._nextQuestionsStart = nextQuestionsStart && new Date();

    const questionsActive = localStorage.getItem('questionsActive');
    this._questionsActive = JSON.parse(questionsActive) || false;

    const answeredInSession = localStorage.getItem('answeredInSession');
    this.nAnsweredCorrectly = answeredInSession ? JSON.parse(answeredInSession) : 0;
  }

  _setState({
    questionsAnswered,
    nextQuestionsStart,
    questionsActive,
    answeredInSession,
  }, clearValues) {
    if (questionsAnswered) {
      const questionsAnswered = this._questionsAnswered || [];
      localStorage.setItem('questionsAnswered', JSON.stringify(questionsAnswered));
      this._computeQuestions();
    }
    if (answeredInSession != null) {
      localStorage.setItem('answeredInSession', answeredInSession);
    }
    if (nextQuestionsStart) {
      localStorage.setItem('nextQuestionsStart', nextQuestionsStart.toString());
    } else if (clearValues) {
      localStorage.removeItem('nextQuestionsStart');
    }
    if (questionsActive != null) {
      localStorage.setItem('questionsActive', questionsActive);
    } else if (clearValues) {
      localStorage.removeItem('questionsActive');
    }
  }

  _computeQuestions() {
    this.questions = questions.filter(question => !this._questionsAnswered.find(answeredId => answeredId === question.id));
  }

  _calculateTimeout() {
    if (this._questionsActive) {
      this.interval = 0;
    } else if (this._nextQuestionsStart) {
      this.interval = this._nextQuestionsStart - new Date();
    } else {
      // Not set yet
      const currentDate = new Date();
      // compute diff 0-2 mins, add to currentDate + 4 mins
      const diff = this._getDiff(4, 6); // 4 to 6 mins
      const questionStart = currentDate + diff;
      console.log({ questionStart });
      this._nextQuestionsStart = questionStart;
      this._setState({ nextQuestionsStart : questionStart });
      this.interval = diff;
    }
    
  }

  // Gets the difference in milliseconds given the min and max diff in minutes
  _getDiff(min, max) {
    return Math.ceil((Math.random() * (max - min) + min)  * 60000);
  }

 _setQuestionTimeout() {
    setTimeout(() => {
      this._startQuestions();
    }, this.interval);
  }

  _startQuestions() {
    if (this.nAnsweredCorrectly >= this.requiredAnswers) {
      $.modal.close();
      this._setState({
        questionsActive: false,
        answeredInSession: 0,
      }, true);
      // setup for next round
      this._questionsShown = false;
      this._questionsActive = false;
      this._calculateTimeout();
      this.nAnsweredCorrectly = 0;
      this._setQuestionTimeout();
    } else {
      if (!this._questionsShown) {
        $('#questionModal').modal();
        this._questionsShown = true;
        this._questionsActive = true;
        this._nextQuestionsStart = undefined;
        this._setState({
          questionsActive: true,
        }, true);
      }
      this._showQuestion().then(({ correct, id }) => {
        this.nAnsweredCorrectly += correct ? 1 : 0;
        this._questionsAnswered.push(id);
        this._setState({
          questionsAnswered: this._questionsAnswered,
          answeredInSession: this.nAnsweredCorrectly,
        });
        this._computeQuestions();
        this._processAnswer(correct);
      });
    }
  }

  _processAnswer(correct) {
    this._submitButton.hide();
    this._nextButton.show();
    const buttonText = this.nAnsweredCorrectly >= this.requiredAnswers ? 'Exit' : 'Next';
    this._nextButton.html(buttonText);

    // append correct or wrong
    if (correct) {
      $('#questionContainer').append('<div>That\'s right 🎉</div>');
    } else {
      $('#questionContainer').append('<div>Oh no! That\'s not right 😿</div>');
    }
  }

  _showQuestion() {
    return new Promise((resolve, reject) => {
      const question = this._getNextQuestion();
      this._nextButton.hide();
      const optionContainerDiv = $('<div class="option"></div>');
      question.options.forEach((option, i) => {
        optionContainerDiv.append(
        `
        <input type="radio" id="${question.id}_${i}" value="${i}" name="${question.id}">
        <label for="${question.id}_${i}">${option}</label><br>
      `)});
      this._submitButton.unbind();
      this._submitButton.click(() => {
        this._checkAnswer(question, resolve);
      });
      this._submitButton.show();
      $('#questionContainer').empty();
      $('#questionContainer').append(`<div class="question">${question.question}</div>`);
      $('#questionContainer').append(optionContainerDiv);
    });
  }

  _checkAnswer(question, resolve) {
    const options = $('#questionContainer input');
    const { answer } = question;
    let selected;
    for (let i = 0; i < options.length; i++) {
      selected = options[i].checked ? i : selected;
    }
    if (selected === answer) {
      resolve({ id: question.id, correct: true });
    } else {
      resolve({ id: question.id, correct: false });
    }
  }

  _getNextQuestion() {
    // Pick an unanswered question at random
    const questionIndex = Math.floor(Math.random() * this._questionsAnswered.length);
    return this.questions[questionIndex];
  }

}

module.exports = Interrupter;

// Start this 5 minutes after name has been filled in. 4-6 minutes randomly
// new Interrupter(2000, 2);

// Time bound to end of previous round

// Every wrong answer adds delay on next button