function StateManager() {
  this._states = {};
  this._current_state = null;
  this._start_state = null;
  this._interval_period = 15*1000;
}

StateManager.prototype.add_state = function(state_name, transition_sound) {
  this._states[state_name] = {
    transition_sound: transition_sound,
    trans_probs: {}
  };
};

StateManager.prototype.set_start_state = function(state_name) {
  this._start_state = state_name;
}

StateManager.prototype.add_transition_prob = function(from_state, to_state, transition_prob) {
  this._states[from_state].trans_probs[to_state] = transition_prob;
};

StateManager.prototype.start = function() {
  this._switch_state(this._start_state);

  var self = this;
  this._interval_id = setInterval(function() {
    self._step();
  }, this._interval_period);
};

StateManager.prototype.stop = function() {
  clearInterval(this._interval_id);
}

StateManager.prototype.restart = function() {
  this.stop();
  this.start();
}

StateManager.prototype._load_audio = function() {
  for(var state in this._states) {
    var sound = this._states[state].transition_sound;
  }
}

StateManager.prototype._choose_next_state = function(possible_next_states) {
  var rand = Math.random();

  var cum_prob = 0;
  for(var candidate in possible_next_states) {
    cum_prob += possible_next_states[candidate];
    if(rand < cum_prob) {
      return candidate;
    }
  }

  // Couldn't find next state
  console.log(["Couldn't find next state", rand, cum_prob, possible_next_states]);
  return Object.keys(possible_next_states)[0];
}

StateManager.prototype._step = function() {
  var possible_next_states = this._states[this._current_state].trans_probs;

  if(typeof possible_next_states[this._current_state] === 'undefined') {
    var prob_sum = Object.keys(possible_next_states).map(function(state) {
      return possible_next_states[state];
    }).reduce(function(prev, current) {
      return prev + current;
    });
    possible_next_states[this._current_state] = 1 - prob_sum;
  }

  var next_state = this._choose_next_state(possible_next_states);
  this._switch_state(next_state);
}

StateManager.prototype._switch_state = function(new_state) {
  if(this._current_state === new_state) {
    return;
  }

  this._current_state = new_state;
  var transition_sound = this._states[this._current_state].transition_sound;
  
  document.querySelector('#current_state').innerHTML = this._current_state;
  var player = document.querySelector('#transition_player');
  player.src = transition_sound;
  player.play();
}

StateManager.prototype.set_interval_period = function(new_period) {
  this._interval_period = new_period * 1000;
  this.restart();
}

StateManager.prototype.get_interval_period = function() {
  return this._interval_period / 1000;
}


function create_state_manager() {
  var sm = new StateManager();

  // Original audio source: freesound.org
  // Counting:      82986__corsica-s__countdown.wav
  // Shot:          47252__nthompson__rocketexpl.wav
  // Brake screech: 71741__audible-edge__nissan-maxima-handbrake-turn-04-25-2009.wav
  sm.add_state('1', 'audio/count_1.mp3');
  sm.add_state('2', 'audio/count_2.mp3');
  sm.add_state('3', 'audio/count_3.mp3');
  sm.add_state('4', 'audio/count_4.mp3');
  sm.add_state('5', 'audio/count_5.mp3');
  sm.add_state('6', 'audio/count_6.mp3');
  sm.add_state('7', 'audio/count_7.mp3');
  sm.add_state('8', 'audio/count_8.mp3');
  sm.add_state('9', 'audio/count_9.mp3');
  sm.add_state('10', 'audio/count_10.mp3');
  sm.add_state('attack',  'audio/shot.mp3');
  sm.add_state('recover', 'audio/brake_screech.mp3');
  sm.set_start_state('1');

  for(var i = 2; i < 7; i++) {
    sm.add_transition_prob(i.toString(), (i + 1).toString(), 0.8);
    sm.add_transition_prob(i.toString(), (i - 1).toString(), 0.1);
  }

  for(var i = 1; i <= 10; i++) {
    sm.add_transition_prob(i.toString(), 'attack', 0.08);
  }
  sm.add_transition_prob('attack', 'recover', 0.5);
  sm.add_transition_prob('recover', '3', 0.5);
  sm.add_transition_prob('recover', '4', 0.5);

  sm.add_transition_prob('1', '2', 0.9);
  sm.add_transition_prob('7', '6', 0.05);
  sm.add_transition_prob('7', '8', 0.1);
  sm.add_transition_prob('7', '9', 0.05);
  sm.add_transition_prob('8', '9', 0.1);
  sm.add_transition_prob('8', '7', 0.1);
  sm.add_transition_prob('9', '4', 0.3);
  sm.add_transition_prob('10', '3', 0.5);

  return sm;
}

function fetch_int_value(elem) {
  return parseInt(elem.value, 10);
}

function run() {
  var sm = create_state_manager();

  document.querySelector('#start').addEventListener('click', function() {
    document.querySelector('#transition_player').load();
    sm.start('1');
  });

  document.querySelector('#stop').addEventListener('click', function() {
    sm.stop();
  });

  var period_selector = document.querySelector('#interval_period');
  period_selector.value = sm.get_interval_period();
  period_selector.addEventListener('change', function(evt) {
    var new_period = fetch_int_value(evt.target);
    sm.set_interval_period(new_period);
  });

  document.querySelector('#music_player').src = PRIVATE_URLS.di_fm_electro_house;
}

run();
