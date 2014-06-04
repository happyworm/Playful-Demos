/*
 * Story Telling Output
 * http://www.happyworm.com
 *
 * Copyright (c) 2014 Happyworm Ltd
 * Licensed under the MIT license.
 * http://opensource.org/licenses/MIT
 *
 * Author: Mark J Panaghiston
 * Version: 0.1.0
 * Date: 6th May 2014
 */

(function(PM) {

	var DEBUG = false;

	var Story = function(options) {
		this.init(options);
	};

	if(typeof PM === 'undefined') {
		window.Story = Story; // 
	} else {
		PM.Story = function(options) {
			return new Story(options); // 
		};
	}

	Story.prototype = {
		init: function(options) {
			// The default options
			this.options = {
				wrapper: {
					id: 'story'
				},
				track: { // This object acts as the main track reference. Properties in this object create tracks.
					// story: [],
					// bgm: [],
					// sfx: []
				},
				audioType: {
					mp3: 'audio/mpeg'
				},
				context: null
			};
			// Read in instancing options.
			for(var option in options) {
				if(options.hasOwnProperty(option)) {
					this.options[option] = options[option];
				}
			}
			// The Web Audio API context
			this.context = PM && PM.context ? PM.context : this.options.context;
			// Properties to hold track information
			this.audio = {};
			this.index = {};
			this.status = {};
			this.waapi = {};
			this.gain = {};
			// Init tracks
			this.initTracks();

		},
		initTracks: function() {
			var self = this;
			var ended = function(track) {
				return function() {
					if(DEBUG) console.log('ended: ' + track);
					self.nextAudio(track);
				}
			};
			var play = function(track) {
				return function() {
					if(DEBUG) console.log('play: ' + track);
					self.status[track].paused = false;
				}
			};
			var pause = function(track) {
				return function() {
					if(DEBUG) console.log('pause: ' + track);
					self.status[track].paused = true;
				}
			};
			// for(var track in this.audio) {
			for(var track in this.options.track) {
				if(this.options.track.hasOwnProperty(track)) {
					if(DEBUG) console.log('initTracks: ' + track);

					// Create the audio tracks.
					this.audio[track] = document.createElement('audio');
					// Audio track index
					this.index[track] = 0;
					// Status
					this.status[track] = {
						paused: true
					};
					// The Web Audio API source
					if(this.context) {
						this.waapi[track] = this.context.createMediaElementSource(this.audio[track]);
						this.gain[track] = this.context.createGain();
						this.waapi[track].connect(this.gain[track]);
						this.gain[track].connect(this.context.destination);
					}

					// Created event handlers for the track
					this.audio[track].addEventListener('ended', (function() {
						return ended(track);
					}()), false);
					this.audio[track].addEventListener('play', (function() {
						return play(track);
					}()), false);
					this.audio[track].addEventListener('pause', (function() {
						return pause(track);
					}()), false);

					// Setup the first piece on each track
					this.setTrack(track);
				}
			}
		},
		resetTrack: function(track) {
			if(typeof track === 'string') {
				if(this.audio[track]) {
					if(DEBUG) console.log('resetTrack: ' + track);
					this.setTrack(track);
				}
			} else {
				for(track in this.audio) {
					if(this.audio.hasOwnProperty(track)) {
						if(DEBUG) console.log('resetTrack: ' + track);
						this.setTrack(track);
					}
				}
			}
		},
		setTrack: function(track, list) {
			if(typeof list === 'undefined') {
				list = this.options.track[track];
			} else {
				this.options.track[track] = list;
			}
			// Setup the track
			this.index[track] = 0;
			this.setAudio(track, list[0]);
			if(DEBUG) console.log('setTrack: ' + track);
		},
		nextAudio: function(track) {
			if(typeof track === 'string') {
				if(this.audio[track]) {
					if(this.options.track[track].length > 1) {
						this.index[track]++;
						this.index[track] = this.index[track] < this.options.track[track].length ? this.index[track] : 0;
						this.setAudio(track, this.options.track[track][this.index[track]]);
					}
					this.play(track);
					if(DEBUG) console.log('nextAudio: ' + track + '[' + this.index[track] + ']');
				}
			} else {
				for(track in this.audio) {
					if(this.audio.hasOwnProperty(track)) {
						this.nextAudio(track);
					}
				}
			}
		},
		previousAudio: function(track) {
			if(typeof track === 'string') {
				if(this.audio[track]) {
					if(this.options.track[track].length > 1) {
						this.index[track]--;
						this.index[track] = this.index[track] < 0 ? this.options.track[track].length - 1 : this.index[track];
						this.setAudio(track, this.options.track[track][this.index[track]]);
					}
					this.play(track);
					if(DEBUG) console.log('previousAudio: ' + track + '[' + this.index[track] + ']');
				}
			} else {
				for(track in this.audio) {
					if(this.audio.hasOwnProperty(track)) {
						this.previousAudio(track);
					}
				}
			}
		},
		setAudio: function(track, audio) {
			// track: (String) To indicate the story or bgm
			// audio: (Object) The media object

			var format, source, url;

			this.empty(this.audio[track]);

			for(format in audio) {
				if(audio.hasOwnProperty(format)) {
					url = audio[format];
					if(this.options.audioType[format] && url) {
						source = document.createElement('source');
						source.setAttribute('type', this.options.audioType[format]);
						source.setAttribute('src', url);
						this.audio[track].appendChild(source);
					}
				}
			}
			this.audio[track].load();
			this.gain[track].gain.value = typeof audio.vol === 'number' ? audio.vol : 1;
			if(DEBUG) console.log('setAudio: ' + track + ' | audio = %o', audio);
		},
		play: function(track) {
			if(typeof track === 'string') {
				if(this.audio[track]) {
					this.audio[track].play();
				}
			} else {
				for(track in this.audio) {
					if(this.audio.hasOwnProperty(track)) {
						this.audio[track].play();
					}
				}
			}
		},
		pause: function(track) {
			if(typeof track === 'string') {
				if(this.audio[track]) {
					this.audio[track].pause();
				}
			} else {
				for(track in this.audio) {
					if(this.audio.hasOwnProperty(track)) {
						this.audio[track].pause();
					}
				}
			}
		},
		// Be aware of cross-browser differences when changing media and when media ends.
		// Some will reset the playbackRate to the defaultPlaybackRate
		// Here I am changing both to help minimize variation.
		playbackRate: function(pbr, track) {
			if(typeof track === 'string') {
				if(this.audio[track]) {
					this.audio[track].playbackRate = pbr;
					this.audio[track].defaultPlaybackRate = pbr;
				}
			} else {
				for(track in this.audio) {
					if(this.audio.hasOwnProperty(track)) {
						this.audio[track].playbackRate = pbr;
						this.audio[track].defaultPlaybackRate = pbr;
					}
				}
			}
		},
		// To connect the audio to the Web Audio API
		connect: function(output, track) {
			if(typeof track === 'string') {
				if(this.audio[track]) {
					// Connect the Web Audio API source
					if(this.context) {
						this.waapi[track].connect(output);
					}
					if(DEBUG) console.log('connect: ' + track);
				}
			} else {
				for(track in this.audio) {
					if(this.audio.hasOwnProperty(track)) {
						this.connect(output, track);
					}
				}
			}
		},
		empty: function(el) {
			// Empties the element... Possibly better than el.innerHTML = '';
			while(el && el.firstChild) {
				el.removeChild(el.firstChild);
			}
		}
	}
}(window.PM));
