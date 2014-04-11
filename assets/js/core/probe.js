/*
 * Probe Node
 * http://www.happyworm.com
 *
 * Copyright (c) 2014 Happyworm Ltd
 * Licensed under the MIT license.
 * http://opensource.org/licenses/MIT
 *
 * Author: Mark J Panaghiston
 * Version: 0.0.1
 * Date: 10th April 2014
 */

(function(PM) {

	var DEBUG = true;

	var Probe = function(options) {
		this.init(options);
	};

	if(typeof PM === 'undefined') {
		window.Probe = Probe; // 
	} else {
		PM.Probe = function(options) {
			return new Probe(options); // 
		};
	}

	Probe.prototype = {
		init: function(options) {
			var self = this;
			// The default options
			this.options = {
				fftSize: 512,
				scriptSize: 512,
				onaudioprocess: null,
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

			// Create the audio map
			if(this.context) {

				this.scriptNode = this.context.createScriptProcessor(this.options.scriptSize, 1, 1);
				// connect to destination, else it isn't called
				this.scriptNode.connect(this.context.destination);

				// setup an analyzer
				this.analyser = this.context.createAnalyser();
				this.analyser.smoothingTimeConstant = 0.99; // 0.3;
				this.analyser.fftSize = this.options.fftSize;

				// analyser.maxDecibels = -20;
				// analyser.minDecibels = -60;

				// connect up the nodes
				// microphone.connect(analyser);
				this.analyser.connect(this.scriptNode);

				if(typeof this.options.onaudioprocess === 'function') {
					this.scriptNode.onaudioprocess = function(event) {
						self.options.onaudioprocess.call(self, event);
					};
				}
			}
		}
	}
}(window.PM));
