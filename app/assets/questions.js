const questions = [
  {
    id: 1,
    question: `What will be in the console when running the script in Node?
      <pre>
      const fs = require('fs')

      setTimeout(() => console.log('timeout out'))
      setImmediate(() => console.log('immediate out'))
      
      fs.readFile('./events.js', (err, data) => {
        console.log('fs')
        process.nextTick(() => console.log('next in'))
        setTimeout(() => console.log('timeout in'))
        setImmediate(() => console.log('immediate in'))
      })
      
      const next = () => {
        console.log('next')
        process.nextTick(next)
      }
      
      process.nextTick(next)
    </pre>`,
    options: [
      `
      timeout out
      immediate out
      next
      fs
      next in
      immediate in
      timeout in
      `,
      `
      timeout out
      immediate out
      next
      next
      next
      next
      next
      next
      ...
      `,
      `
      next
      immediate out
      timeout out
      fs
      next in
      immediate in
      timeout in
      `,
      `
      next
      next
      next
      next
      next
      next
      ...
      `,
    ],
    answer: 4
  }, 
  {
    id: 2,
    question: 'What would be the result of the following expression <i>(1 < 2 < 3) < (3 > 2 > 1)</i>?',
    options: [
      'true',
      'false',
      'error'
    ],
    answer: 1
  },
  {
    id: 3,
    question: 'What will happen if you try to install and use npm package called "fs"?',
    options: [
      'Error, the package already exists as a built-in',
      'Nothing will be installed',
      'The package will be installed, but can not be used',
      'No problem, fs package can be installed and used normally'
    ],
    answer: 2
  },
  {
    id: 4,
    question: 'Are setTimeout and setInterval functions part of JavaScript?',
    options: [
      'Both yes',
      'setTimeout - yes, setInterval - no',
      'Both no'
    ],
    answer: 2
  },
  {
    id: 5,
    question: 'As a JavaScript interpreter, compile the following expression - console.log.call.call.call.call.call.apply(a => a, "What is gonna be printed in the console?".split(" "))?',
    options: [
      'Error',
      'undefined',
      '"is"',
      '"console?"'
    ],
    answer: 2
  },
  {
    id: 6,
    question: 'As a JavaScript interpreter, compile the following expression - "b" + "a" + +"a"  + "a"?',
    options: [
      'baaa',
      'baa',
      'baNaNa',
      'ba1a',
      'batruea'
    ],
    answer: 3
  },
  {
    id: 7,
    question: 'Which expression will remove all digits from a string?',
    options: [
      'str.replace(/\b/g, "")',
      'str.replace(/\d/g, "")',
      'str.replace(/\d/gm, "")',
      'str.replace(/[^0-9]/gm, "")'
    ],
    answer: 2
  },
  {
    id: 8,
    question: 'How to send instant event from one tab to another without a server and additional helpers?',
    options: [
      'xhr',
      'Cookie',
      'jQuery.sendEvent',
      'localStorage'
    ],
    answer: 4
  },
  {
    id: 9,
    question: 'What is the third argument in the addEventListener function of the EventTarget class?',
    options: [
      'Nothing',
      'options (capture phase)',
      'Callback function',
      'Event type'
    ],
    answer: 2
  },
  // {
  //   id: 10,
  //   question: 'Which function is slower - http://output.jsbin.com/feloni/3/quiet ? Use DevTools in a separate window to analyze',
  //   options: [
  //     'onSortOne',
  //     'onSortTwo',
  //     'equal'
  //   ],
  //   answer: 1
  // },
  {
    id: 11,
    question: 'What are the difference between setTimeout and setInterval in browser and in Node.js?',
    options: [
      'It doesn\' exist in Node.js',
      'In Node.js both return an object',
      'setInterval doesn\' exist in Node.js',
      'In Node.js timeouts can\'t be cancelled'
    ],
    answer: 2
  },
  {
    id: 12,
    question: 'Remember best parts of JavaScript, what is `typeof NaN`?',
    options: [
      '"number"',
      '"object"',
      'NaN',
      '"undefined"'
    ],
    answer: 1
  },
  {
    id: 13,
    question: 'Is this experssion valid in JavaScript `$: document.title = title`?',
    options: [
      'Yes',
      'No',
      'Only with jQuery'
    ],
    answer: 1
  },
  {
    id: 14,
    question: `What the following code will output?
      <pre>
      try { 
        new Promise(() => {
          throw new Error('test') 
        })

        console.log('no error')
      } catch(e) { 
        console.log('error')
      }
      </pre>
    `,
    options: [
      'no error',
      'error',
      `no error \n Uncaught (in promise) Error: test`,
      'Uncaught (in promise) Error: test'
    ],
    answer: 3
  },
  {
    id: 15,
    question: `What will the following code output?
    <pre>
      function a() {
        const b = () => console.log(arguments);
        b(2)
      }
      
      a(1)
    </pre>
    `,
    options: [
      '1',
      '2',
      'Error',
    ],
    answer: 1
  },
  {
    id: 16,
    question: 'How to remove all items from a JavaScript array?',
    options: [
      'arr.length = 0',
      'delete arr.length',
      'arr.slice(0, 0)'
    ],
    answer: 1
  },
  {
    id: 17,
    question: 'Which of the following storages are not available in browsers?',
    options: [
      'localStorage',
      'sessionStorage',
      'couchDB',
      'indexedDB'
    ],
    answer: 3
  },
  {
    id: 18,
    question: 'Which states can a Promise take?',
    options: [
      'fulfilled, rejected, cancelled',
      'pending, fulfilled, rejected',
      'cancelled, pending, fulfilled, rejected'
    ],
    answer: 2
  },
  // {
  //   id: 19,
  //   question: 'Which of the following ways of loading a script will block the page rendering?',
  //   options: [
  //     '<script async>',
  //     '<script defer>',
  //     '<script>',
  //     '<script type="module">',
  //   ],
  //   answer: 3
  // },
  {
    id: 20,
    question: 'Choose an incorrect CSS selector or a general answer',
    options: [
      '.my-class.other-class',
      'div > a',
      'input[disabled]',
      'All correct',
      'All incorrect'
    ],
    answer: 4
  },
  {
    id: 21,
    question: 'What will be the context of a twice bounded function - fn.bind(1)(2)?',
    options: [
      '1',
      '2',
      'undefined',
      'null',
      'Error, code will not compile'
    ],
    answer: 1
  },
  {
    id: 22,
    question: 'Choose an incorrect CSS selector or a general answer',
    options: [
      '#my-id.other-class',
      'div ~ a',
      'a[href]',
      '#my-id#other-id',
      'All correct'
    ],
    answer: 5
  },
  {
    id: 23,
    question: 'JavaScript hasn\'t always been called that. What other name has it been released as?',
    options: [
      'Latte',
      'BScript',
      'SpiderMonkey',
      'Mocha'
    ],
    answer: 4
  },
  {
    id: 24,
    question: 'null is an object. Yes or no?',
    options: [
      'Yes',
      'No'
    ],
    answer: 1
  },
  {
    id: 25,
    question: 'Which of the  following is not a reserved keyword in JavaScript?',
    options: [
      'default',
      'throw',
      'finally',
      'undefined'
    ],
    answer: 4
  }
];

module.exports = { questions };