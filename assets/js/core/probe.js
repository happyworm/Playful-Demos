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
				context: null,
				input: null, // The Node to connect to the input. Usually an AudioNode, but can be any object. [Rule: It must have the connect() method.]
				output: null,
				fftSize: 512,
				scriptSize: 512,
				onaudioprocess: null
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

				// setup an analyzer
				this.inputNode = this.analyser = this.context.createAnalyser();
				this.analyser.smoothingTimeConstant = 0.99; // 0.3;
				this.analyser.fftSize = this.options.fftSize;

				// analyser.maxDecibels = -20;
				// analyser.minDecibels = -60;

				if(typeof this.options.onaudioprocess === 'function') {
					this.scriptNode.onaudioprocess = function(event) {
						self.options.onaudioprocess.call(self, event);
					};
				}

				// Connect the audio map
				if(this.options.input) {
					this.options.input.connect(this.analyser);
				}
				this.analyser.connect(this.scriptNode);
				if(this.options.output) {
					this.scriptNode.connect(this.options.output);
				} else {
					// This map must go somewhere. Connect to the destination.
					this.scriptNode.connect(this.context.destination);
				}
			}
		}
	}
}(window.PM));
