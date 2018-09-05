const buttons = document.getElementsByClassName('button');
const display = document.getElementById('display-text');
const start = document.getElementById('start');
const strict = document.getElementById('strict');
const reset = document.getElementById('reset');
const center = document.getElementById('center');

var sounds = {
  0: new Howl({
    src: [
      'https://res.cloudinary.com/baumzeit/video/upload/v1523711744/04-58692__arioke__kalimba-lam10-c4-nail-med.mp3'
    ]
  }),
  1: new Howl({
    src: [
      'https://res.cloudinary.com/baumzeit/video/upload/v1523711743/03-58684__arioke__kalimba-lam06-f3-nail-med.mp3'
    ]
  }),
  2: new Howl({
    src: [
      'https://res.cloudinary.com/baumzeit/video/upload/v1523711744/01-58680__arioke__kalimba-lam04-d3-nail-med.mp3'
    ]
  }),
  3: new Howl({
    src: [
      'https://res.cloudinary.com/baumzeit/video/upload/v1523711744/02-58682__arioke__kalimba-lam05-e3-nail-med.mp3'
    ]
  })
};

const simon = {
  ready: true,
  sequence: [],
  stepCount: 0,
  position: 0,
  strictMode: false,
  speedChangeSteps: [7, 14],
  intervals: [900, 700, 400],
  activeInterval: 0,
  waitBeforePlay: 1800,
  showErrorDuration: 1800,
  waitAfterWin: 5000,

  start: function() {
    view.hideStart();
    this.ready = false;
    this.addStep();
    this.readyPlay();
  },
  restart: function() {
    this.resetGame();
    this.start();
  },
  check: function(btn) {
    return btn === this.sequence[this.position];
  },
  accept: function() {
    if (this.position < this.sequence.length - 1) {
      this.position++;
    } else if (this.stepCount === 20) {
      setTimeout(this.win.bind(this), 800);
    } else {
      this.addStep();
      this.readyPlay();
    }
  },
  addStep: function() {
    let newStep = Math.floor(Math.random() * 4);
    this.sequence.push(newStep);
    this.stepCount++;
  },
  readyPlay: function() {
    view.print(this.stepCount); // print inside this method in order to overwrite error text
    this.resetPosition();
    this.allowInput(false);
    this.updateIntervalForCurrentStep();
    setTimeout(this.playback.bind(this), this.waitBeforePlay);
  },
  playback: function() {
    if (this.position > this.sequence.length - 1) {
      this.readyListen();
      return;
    }
    let btnNumber = this.sequence[this.position];
    view.highlightColor(btnNumber);
    sounds[btnNumber].play(); // ------ audio ---------
    this.position++;
    setTimeout(this.playback.bind(this), this.activeInterval);
  },
  readyListen: function() {
    this.resetPosition();
    this.allowInput(true);
  },
  error: function() {
    if (this.strictMode) {
      this.allowInput(false);
      view.print('X');
      setTimeout(this.restart.bind(this), this.showErrorDuration);
    } else {
      this.allowInput(false);
      view.print('X');
      this.resetPosition();
      setTimeout(this.readyPlay.bind(this), this.showErrorDuration);
    }
  },
  win: function() {
    view.print('♥');
    view.centerAnimation();
    this.playMelody();
    setTimeout(this.resetGame.bind(this), this.waitAfterWin);
  },
  playMelody: function() {
    this.resetPosition();
    this.sequence = [0, 2, 0, 3, 0, 1, 0, 3, 2, 0, 2, 3, 0, 2, 1, 3, 2];
    this.activeInterval = 200;
    this.playback();
  },
  updateIntervalForCurrentStep: function() {
    let value = 0;
    if (this.stepCount > this.speedChangeSteps[1]) {
      value = this.intervals[2];
    }
    if (this.stepCount > this.speedChangeSteps[0]) {
      value = this.intervals[1];
    } else {
      value = this.intervals[0];
    }
    this.activeInterval = value;
  },
  resetGame: function() {
    this.stepCount = 0;
    this.sequence = [];
    this.interval = 0;
    this.allowInput(false);
    this.resetPosition();
    view.print('');
    view.showStart();
    this.ready = true;
  },
  resetPosition: function() {
    this.position = 0;
  },
  allowInput: function(allowed) {
    let value = 'auto';
    if (!allowed) {
      value = 'none';
    }
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].style.pointerEvents = value;
    }
  }
};

const handler = {
  waitForClickEffect: 600,
  colorClick: function(e) {
    let btn = Number(e.target.dataset.value);
    view.colorClickEffect(e.target);
    sounds[btn].play(); // ------ audio ---------
    setTimeout(function() {
      if (simon.check(btn)) {
        simon.accept();
      } else {
        simon.error();
      }
    }, this.waitForClickEffect);
  },
  startClick: function() {
    if (simon.ready) {
      simon.start();
      view.hideStart();
    }
  },
  toggleStrict: function() {
    simon.strictMode = !simon.strictMode;
    view.toggleStrictHighlight();
  },
  resetGame: function() {
    simon.resetGame();
  }
};

const view = {
  print: function(value) {
    display.innerHTML = value;
  },
  colorClickEffect: function(btn) {
    this.removeAnimationClasses(btn);
    btn.classList.add('selected');
  },
  highlightColor: function(num) {
    let btn = buttons[num];
    this.removeAnimationClasses(btn);
    btn.classList.add('highlighted');
  },
  centerAnimation: function() {
    center.classList.remove('center-animation');
    void center.offsetWidth;
    center.classList.add('center-animation');
  },
  removeAnimationClasses: function(btn) {
    btn.classList.remove('selected');
    btn.classList.remove('highlighted');
    void btn.offsetWidth;
  },
  hideStart: function() {
    start.classList.add('faded');
  },
  showStart: function() {
    start.classList.remove('faded');
  },
  toggleStrictHighlight: function() {
    strict.classList.toggle('strict-selected');
    strict.classList.toggle('enabled');
    setTimeout(function() {
      strict.classList.toggle('enabled');
    }, 800);
  }
};

for (let i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', handler.colorClick);
}
start.addEventListener('click', handler.startClick);
strict.addEventListener('click', handler.toggleStrict);
reset.addEventListener('click', handler.resetGame);

simon.resetGame();
