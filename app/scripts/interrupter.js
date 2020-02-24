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
    this._startDelay = 10000;
    this._delayIncrement = 3000;
    this._restoreState();
    this._computeQuestions();
    this._calculateTimeout();
    this._questionsShown = false;
    this.requiredAnswers = requiredAnswers;
    this.maxQuestions = 5;
    this._submitButton = $('#submitButton');
    this._nextButton = $('#nextButton');
    this._nextButton.click(() => this._startQuestions());
    this._questionStreak = 0; //TODO: read from localStorage
    this._setQuestionTimeout();
  }

  _restoreState() {
    const questionsAnswered = localStorage.getItem('questionsAnswered');
    this._questionsAnswered = questionsAnswered ? JSON.parse(questionsAnswered) : [];
    
    const nextQuestionsStart = localStorage.getItem('nextQuestionsStart');
    this._nextQuestionsStart = nextQuestionsStart && new Date(nextQuestionsStart);

    const questionsActive = localStorage.getItem('questionsActive');
    this._questionsActive = JSON.parse(questionsActive) || false;

    const answeredInSession = localStorage.getItem('answeredInSession');
    this.nAnsweredCorrectly = answeredInSession ? JSON.parse(answeredInSession) : 0;

    const currentDelay = localStorage.getItem('currentDelay');
    this._currentDelay = currentDelay ? JSON.parse(currentDelay) : this._startDelay;
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
      console.log(this._nextQuestionsStart);
      this.interval = this._nextQuestionsStart - Date.now();
      console.log(this.interval);
    } else {
      // Not set yet
      // compute diff 0-2 mins, add to currentDate + 4 mins
      const diff = this._getDiff(4, 6); // 4 to 6 mins
      const questionStart = new Date(Date.now() + diff);
      console.log(questionStart.toString());
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

  _shouldExitQuestions() {
    return this.nAnsweredCorrectly >= this.requiredAnswers || this._questionStreak >= this.maxQuestions || !this.questions.length;
  }

  _startQuestions() {
    if (this._shouldExitQuestions()) {
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
      this._questionStreak = 0;
      this._currentDelay = 10000;
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
        if (correct) {
          this.nAnsweredCorrectly += 1;
          this._questionsAnswered.push(id);
          this._setState({
            questionsAnswered: this._questionsAnswered,
            answeredInSession: this.nAnsweredCorrectly,
          });
          this._computeQuestions();
        }
        this._questionStreak += 1;
        this._processAnswer(correct);
      });
    }
  }

  _processAnswer(correct) {
    this._submitButton.hide();
    this._nextButton.show();
    if (!correct) {
      $('#delayContainer').show();
      this._nextButton.prop('disabled', true);
      let delay = this._currentDelay;
      this._currentDelay += this._delayIncrement;
      $('#delayContainer').html(this._formatMilliseconds(delay));
      const int = setInterval(() => {
        delay -= 1000;
        if (delay === 0) {
          clearInterval(int);
          this._nextButton.prop('disabled', false);
        }
        $('#delayContainer').html(this._formatMilliseconds(delay));
      }, 1000);
    }
    
    const buttonText = this._shouldExitQuestions() ? 'Exit' : 'Next';
    this._nextButton.html(buttonText);

    // append correct or wrong
    if (correct) {
      $('#questionContainer').append('<div>That\'s right 🎉</div>');
    } else {
      $('#questionContainer').append('<div>Oh no! That\'s not right 😿</div>');
    }
  }

  _formatMilliseconds(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }

  _showQuestion() {
    return new Promise((resolve, reject) => {
      const question = this._getNextQuestion();
      $('#delayContainer').hide();
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
    // option inputs are 0 indexed
    // answers are 1 indexed
    if (selected === (answer - 1)) {
      resolve({ id: question.id, correct: true });
    } else {
      resolve({ id: question.id, correct: false });
    }
  }

  _getNextQuestion() {
    // Pick an unanswered question at random
    const questionIndex = Math.floor(Math.random() * this.questions.length);
    return this.questions[questionIndex];
  }

}

module.exports = Interrupter;

// Start this 5 minutes after name has been filled in. 4-6 minutes randomly
// new Interrupter(2000, 2);

// Time bound to end of previous round

// Every wrong answer adds delay on next button