/*
 * Pulsating Heart Display
 * http://www.happyworm.com
 *
 * Copyright (c) 2014 Happyworm Ltd
 * Licensed under the MIT license.
 * http://opensource.org/licenses/MIT
 *
 * Author: Mark J Panaghiston
 * Version: 0.0.1
 * Date: 10th May 2014
 */

(function(PM) {

	var DEBUG = false;

	var Heart = function(options) {
		this.init(options);
	};

	if(typeof PM === 'undefined') {
		window.Heart = Heart; // 
	} else {
		PM.Heart = function(options) {
			return new Heart(options); // 
		};
	}

	Heart.prototype = {
		init: function(options) {
			// The default options
			this.options = {
				id: '', // The id for broadcasts
				target: null, // Selector of element or the element itself
				width: 500,
				height: 500,
				size: 200,
				bloat: 0.25,
				color: '#DA755C',
				audioEnabled: false,
				audio: {
					mp3: 'assets/audio/heart/heartbeat.mp3',
					ogg: 'assets/audio/heart/heartbeat.ogg'
				}
			};
			// Read in instancing options.
			for(var option in options) {
				if(options.hasOwnProperty(option)) {
					this.options[option] = options[option];
				}
			}
			this.target = typeof this.options.target === 'string' ? document.querySelector(this.options.target) : this.options.target;

			this.heartrate = this._heartrate = 60;
			this.rotation = Math.PI * (135/180);
			this.beatTime = 0; // A time reference to the start of the beat
			this.enabled = false;

			// Setup the canvas context
			this.canvas = document.createElement("canvas");
			this.canvas.setAttribute("width", this.options.width);
			this.canvas.setAttribute("height", this.options.height);
			this.ctx = this.canvas.getContext("2d");
			this.target.appendChild(this.canvas);

			if(this.options.audioEnabled) {
				this.audio = document.createElement("audio");
				this.audio.controls = true;
				this.source = {
					mp3: document.createElement("source"),
					ogg: document.createElement("source")
				};
				this.source.mp3.src = this.options.audio.mp3;
				this.source.mp3.setAttribute('type', 'audio/mpeg');
				this.source.ogg.src = this.options.audio.ogg;
				this.source.ogg.setAttribute('type', 'audio/ogg');

				this.audio.appendChild(this.source.mp3);
				this.audio.appendChild(this.source.ogg);

				this.target.appendChild(this.audio);
			}

			this.center = {
				x: this.options.width / 2,
				y: this.options.height / 2
			};

			// Set the center as the origin
			this.ctx.translate(
				this.center.x,
				this.center.y
			);

			this.setSize(this.options.size);
			this.pulse();
		},
		setSize: function(size) {
			if(typeof size !== 'undefined') {
				this.size = size;
				this.radius = size / 2;
			}
		},
		draw: function(size) {
			this.setSize(size);
			if(this.ctx) {
				// Clear the canvas
				this.ctx.clearRect(-this.center.x, -this.center.y, this.options.width, this.options.height);

				// Set the fill style
				this.ctx.fillStyle = this.options.color;
				this.ctx.strokeStyle = this.options.color;

				// Rotate the heart so it looks correct
				this.ctx.rotate(this.rotation);

				// Draw the heart
				this.ctx.beginPath();
				this.ctx.moveTo(-this.radius, -this.radius);
				this.ctx.lineTo(this.radius, -this.radius);
				this.ctx.lineTo(this.radius, this.radius);
				this.ctx.arc(
					0,
					this.radius,
					this.radius,
					0,
					Math.PI
				);
				this.ctx.arc(
					-this.radius,
					0,
					this.radius,
					Math.PI / 2,
					3 * Math.PI / 2
				);
				this.ctx.closePath();
				this.ctx.fill();
				this.ctx.stroke();

				// Rotate back to cancel out the rotation for the next draw()
				this.ctx.rotate(-this.rotation);
			}
		},
		pulse: function(rate) {
			if(typeof rate !== 'undefined') {
				this.heartrate = rate;
			}
			if(!this.enabled) {
				this.beatTime = new Date().getTime() / 1000;
				this._heartrate = this.heartrate;
				this._beat();
				this.enabled = true;
			}
		},
		_beat: function() {
			var self = this;
			this._beatId = requestAnimationFrame(function(t) {
				self._beat();

				var now = new Date().getTime() / 1000;
				var time = (now - self.beatTime);
				var omegaT = time * self._heartrate / 60;
				var pump = -Math.cos( 2 * Math.PI * omegaT );

				if(omegaT > 1) {
					// Have completed 1 cycle
					self.beatTime = now;
					self._heartrate = self.heartrate;

					if(self.options.audioEnabled) {
						self.audio.currentTime = 0;
						self.audio.playbackRate = self.heartrate / 60;
						self.audio.play();
					}
				}

				if(DEBUG) console.log('this.beatTime: ' + self.beatTime + ' | now: ' + now + ' | time: ' + time + ' | pump: ' + pump + ' | t: ' + t);
				self.draw(self.options.size * (1 + (pump * self.options.bloat)));
			});
		},
		kill: function() {
			cancelAnimationFrame(this._beatId);
			this.enabled = false;
		}
	}
}(window.PM));
