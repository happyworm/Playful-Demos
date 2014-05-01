/*
 * Voice Activity Detection (VAD) Library
 * http://www.happyworm.com
 *
 * Copyright (c) 2014 Happyworm Ltd
 * Licensed under the MIT license.
 * http://opensource.org/licenses/MIT
 *
 * Author: Mark J Panaghiston
 * Version: 0.0.2
 * Date: 1st May 2014
 */

// var Vad =
(function(PM) {

	var DEBUG = true;

	var Vad = function(options) {
		this.init(options);
	};

	if(typeof PM === 'undefined') {
		window.Vad = Vad; // 
	} else {
		PM.Vad = function(options) {
			return new Vad(options); // 
		};
	}

	Vad.prototype = {
		init: function(options) {
			// The default options
			this.options = {
				id: '', // The id of messages being broadcast.
				probe: null, // A Probe instance.
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

			// Calculate time relationships
			this.hertzPerBin = this.context.sampleRate / this.options.probe.options.fftSize;
			this.iterationFrequency = this.context.sampleRate / this.options.probe.options.scriptSize;
			this.iterationPeriod = 1 / this.iterationFrequency;

			if(DEBUG) console.log(
				'Vad[' + this.options.id + ']' +
				' | sampleRate: ' + this.context.sampleRate +
				' | hertzPerBin: ' + this.hertzPerBin +
				' | iterationFrequency: ' + this.iterationFrequency +
				' | iterationPeriod: ' + this.iterationPeriod
			);

			this.combFilter = [];
			for(var i = 0, iLen = this.options.probe.options.fftSize / 2; i < iLen; i++) {
				if(i * this.hertzPerBin < 200) {
					this.combFilter[i] = 0;
				} else if(i * this.hertzPerBin < 2000) {
					this.combFilter[i] = 1;
				} else {
					this.combFilter[i] = 0;
				}
			}

			this.ready = {};

			// Energy detector props
			this.energy_offset = 1e-8;
			this.energy_threshold_ratio = 2; // 10; // Must be greater than 1
			// this.energy_threshold = this.energy_offset * this.energy_threshold_ratio;

			this.energy_threshold_pos = this.energy_offset * this.energy_threshold_ratio;
			this.energy_threshold_neg = this.energy_offset - (this.energy_offset / this.energy_threshold_ratio);

			this.voiceTrend = 0;
			this.voiceTrendMax = 10;
			this.voiceTrendMin = -10;
			this.voiceTrendStart = 5;
			this.voiceTrendEnd = -5;

			// Setup local storage of the Linear FFT data
			this.floatFrequencyDataLinear = new Float32Array(this.options.probe.floatFrequencyData.length);

			// log stuff
			this.logging = false;
			this.log_i = 0;
			this.log_limit = 100;
		},
		triggerLog: function(limit) {
			this.logging = true;
			this.log_i = 0;
			this.log_limit = typeof limit === 'number' ? limit : this.log_limit;
		},
		log: function(msg) {
			if(this.logging && this.log_i < this.log_limit) {
				this.log_i++;
				console.log(msg);
			} else {
				this.logging = false;
			}
		},
		update: function() {
			// Update the local version of the Linear FFT
			var fft = this.options.probe.floatFrequencyData;
			for(var i = 0, iLen = fft.length; i < iLen; i++) {
				this.floatFrequencyDataLinear[i] = Math.pow(10, fft[i] / 10);
			}
			this.ready = {};
		},
		getEnergy: function() {

			if(this.ready.energy) {
				return this.energy;
			}

			var energy = 0;
			var fft = this.floatFrequencyDataLinear;

			for(var i = 0, iLen = fft.length; i < iLen; i++) {
				energy += this.combFilter[i] * fft[i] * fft[i];
			}

			this.energy = energy;

			return energy;
		},
		// No longer used
		getSFM: function() {

			var geometric = 0;
			var arithmetic = 0;

			var fft = this.floatFrequencyDataLinear;

			for(var i = 0, iLen = fft.length; i < iLen; i++) {
				// this.log("fft[" + i + "]: " + fft[i]);
				geometric += Math.log(fft[i]);
				arithmetic += fft[i];
			}

			geometric = Math.exp(geometric / fft.length);
			arithmetic = arithmetic / fft.length;

			var SF = geometric / arithmetic;
			var SFM = 10 * Math.log(SF) / Math.log(10);

			this.log(
				"geometric: " + geometric +
				" | arithmetic: " + arithmetic +
				" | SF: " + SF +
				" | SFM: " + SFM +
				" | fft.length: " + fft.length
			);

			return SFM;
		},
		monitor: function() {
			var self = this;
			var energy = this.getEnergy();
			var signal = energy - this.energy_offset;
			// var detection = energy - this.energy_threshold;

			// Think the pos and neg offsets need to be different... pos is twice offset, but neg is half offset... That sort of thing.

			if(signal > this.energy_threshold_pos) {
				this.voiceTrend = (this.voiceTrend + 1 > this.voiceTrendMax) ? this.voiceTrendMax : this.voiceTrend + 1;
			} else if(signal < -this.energy_threshold_neg) {
				this.voiceTrend = (this.voiceTrend - 1 < this.voiceTrendMin) ? this.voiceTrendMin : this.voiceTrend - 1;
			} else {
				// voiceTrend needs to get smaller... ?
				if(this.voiceTrend > 0) {
					this.voiceTrend--;
				} else if(this.voiceTrend < 0) {
					this.voiceTrend++;
				}
			}

			var start = false, end = false;
			if(this.voiceTrend > this.voiceTrendStart) {
				// Start of speech detected
				start = true;
			} else if(this.voiceTrend < this.voiceTrendEnd) {
				// End of speech detected
				end = true;
			}

			// var integration = energy / 0.000001; // The divisor should be the time period... And we could apply a multiplier, but the time should be proportional to the anaylyer
			// var integration = detection / 100; // The divisor should be the time period... And we could apply a multiplier, but the time should be proportional to the anaylyer
			var integration = signal / 100; // The divisor should be the time period... And we could apply a multiplier, but the time should be proportional to the anaylyer

			// Idea?: The integration is affected by the voiceTrend magnitude? - Not sure. Not doing atm.

			if(integration > 0) {
				this.energy_offset += integration;
			} else {
				this.energy_offset += integration * 10;
			}
			this.energy_offset = this.energy_offset < 0 ? 0 : this.energy_offset;
			// this.energy_threshold = this.energy_offset * this.energy_threshold_ratio;
			this.energy_threshold_pos = this.energy_offset * this.energy_threshold_ratio;
			this.energy_threshold_neg = this.energy_offset - (this.energy_offset / this.energy_threshold_ratio);

			if(start) {
				// Broadcast the message
				if(PM) {
					PM.broadcast("energy_jump", {
						id: self.options.id,
						target: self,
						voiceTrend: self.voiceTrend,
						msg: 'Generated by: Vad'
					});
				}
			}

			if(end) {
				// Broadcast the message
				if(PM) {
					PM.broadcast("energy_fall", {
						id: self.options.id,
						target: self,
						voiceTrend: self.voiceTrend,
						msg: 'Generated by: Vad'
					});
				}
			}

			this.log(
				'e: ' + energy +
				' | e_of: ' + this.energy_offset +
				' | e_th: ' + this.energy_threshold +
				' | signal: ' + signal +
				' | int: ' + integration +
				' | voiceTrend: ' + this.voiceTrend +
				' | start: ' + start +
				' | end: ' + end
			);

			return signal;
		}
	};
	return Vad;
}(window.PM));
