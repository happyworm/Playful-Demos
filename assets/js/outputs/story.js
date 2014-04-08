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
			// Init tracks
			this.setTrack('story');
			this.setTrack('bgm');

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
		},
		start: function() {
			// On the first time we play everything.
			for(var track in this.audio) {
				if(this.audio.hasOwnProperty(track)) {
					this.audio[track].play();
				}
			}
		},
		stop: function() {
			// Pause all tracks
			for(var track in this.audio) {
				if(this.audio.hasOwnProperty(track)) {
					this.audio[track].pause();
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
