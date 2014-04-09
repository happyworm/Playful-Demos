/*
 * Story Telling Output
 * http://www.happyworm.com
 *
 * Copyright (c) 2014 Happyworm Ltd
 * Licensed under the MIT license.
 * http://opensource.org/licenses/MIT
 *
 * Author: Mark J Panaghiston
 * Version: 0.0.1
 * Date: 8th April 2014
 */

(function(PM) {

	var DEBUG = true;

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
				story: [],
				bgm: [],
				audioType: {
					mp3: 'audio/mpeg'
				}
			};
			// Read in instancing options.
			for(var option in options) {
				if(options.hasOwnProperty(option)) {
					this.options[option] = options[option];
				}
			}
			// Create the audio tracks
			this.audio = {
				story: document.createElement('audio'),
				bgm: document.createElement('audio')
			};
			// Audio track index
			this.index = {
				story: 0,
				bgm: 0
			};
			// Status
			this.status = {
				story: {
					paused: true
				},
				bgm: {
					paused: true
				}
			};
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
			for(var track in this.audio) {
				if(this.audio.hasOwnProperty(track)) {
					if(DEBUG) console.log('initTracks: ' + track);
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
				list = this.options[track];
			} else {
				this.options[track] = list;
			}
			// Setup the track
			this.index[track] = 0;
			this.setAudio(track, list[0]);
			if(DEBUG) console.log('setTrack: ' + track);
		},
		nextAudio: function(track) {
			if(typeof track === 'string') {
				if(this.audio[track]) {
					this.index[track]++;
					this.index[track] = this.index[track] < this.options[track].length ? this.index[track] : 0;
					this.setAudio(track, this.options[track][this.index[track]]);
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
			this.audio[track].volume = typeof audio.vol === 'number' ? audio.vol : 1;
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
		empty: function(el) {
			// Empties the element... Possibly better than el.innerHTML = '';
			while(el && el.firstChild) {
				el.removeChild(el.firstChild);
			}
		}
	}
}(window.PM));
