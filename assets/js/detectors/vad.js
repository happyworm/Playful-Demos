/*
 * Voice Activity Detection (VAD) Library
 * http://www.happyworm.com
 *
 * Copyright (c) 2014 Happyworm Ltd
 * Licensed under the MIT license.
 * http://opensource.org/licenses/MIT
 *
 * Author: Mark J Panaghiston
 * Version: 0.0.1
 * Date: 15th April 2014
 */

var Vad = (function(PM) {

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

	var Vad = function(options) {
		// The default options
		this.options = {
			probe: null, // A Probe instance.
			pt_E: 40, // Energy_PrimeThresh
			pt_F: 185, // F_PrimeThresh (Hz)
			pt_SF: 5, // SF_PrimeThresh
			// fftSize: 512,
			sampleRate: 48000
		};
		// Read in instancing options.
		for(var option in options) {
			if(options.hasOwnProperty(option)) {
				this.options[option] = options[option];
			}
		}
		// Setup the initial thresholds
		this.t_E = this.options.pt_E;
		this.t_F = this.options.pt_F;
		this.t_SF = this.options.pt_SF;
		// Init the min values
		this.min_E = 0;
		this.min_F = 0;
		this.min_SF = 0;
		// The min value sums
		this.sum_E = 0;
		this.sum_F = 0;
		this.sum_SF = 0;
		// The min value sum length
		this.sum_counts = 30;
		// Counters
		this.silence_count = 0;
		this.speech_count = 0;
		this.initial_count = 0;

		// Energy detector props
		this.energy_threshold = 1e-8;

		// log stuff
		this.logging = false;
		this.log_i = 0;
		this.log_limit = 100;
	};
	Vad.prototype = {
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
		getEnergy: function() {
			// energy = SUM n=-inf->inf |x(n)|^2

			var value, energy = 0;
			var waveform = this.options.probe.byteTimeDomainData;

			for(var i = 0, iLen = waveform.length; i < iLen; i++) {
				value = (waveform[i] - 128) / 128;
				// value = (waveform[i] - 128);
				energy += value * value;
			}

			energy = 255 * energy / (waveform.length + 1);

			return energy;
		},
		getEnergyB: function() {

			var value, energy = 0;
			var fft = this.options.probe.byteFrequencyData;

			for(var i = 0, iLen = fft.length; i < iLen; i++) {
				// value = fft[i] / 255;
				value = Math.pow(10, (fft[i] - 255) / 2550);
				energy += value * value;
			}

			// energy = 255 * energy / (fft.length + 1);

			return energy;
		},
		getEnergyC: function() {

			var value, energy = 0;
			var fft = this.options.probe.floatFrequencyData;

			for(var i = 0, iLen = fft.length; i < iLen; i++) {
				value = Math.pow(10, fft[i] / 10);
				energy += value * value;
			}

			// energy = 255 * energy / (fft.length + 1);

			energy = 255e8 * energy;

			// console.log('energy: ' + energy);

			return energy;
		},
		getEnergyD: function() {

			var value, energy = 0;
			var fft = this.options.probe.floatFrequencyData;

			// approx 200 to 2k

			for(var i = 2, iLen = fft.length; i < 20; i++) {
				value = Math.pow(10, fft[i] / 10);
				energy += value * value;
			}

			// energy = 255 * energy / (fft.length + 1);

			// energy = 255e8 * energy;

			// console.log('energy: ' + energy);

			return energy;
		},
		energyMonitor: function() {
			var energy = this.getEnergyD();
			var detection = energy - this.energy_threshold;
			var detected = false;
			// var integration = energy / 0.000001; // The divisor should be the time period... And we could apply a multiplier, but the time should be proportional to the anaylyer
			var integration = detection / 100; // The divisor should be the time period... And we could apply a multiplier, but the time should be proportional to the anaylyer
			if(detection >= 0) {
				detected = true;
				// this.energy_threshold += integration;
			} else {
				// this.energy_threshold -= integration;
			}
			this.energy_threshold += integration;
			this.energy_threshold = this.energy_threshold < 0 ? 0 : this.energy_threshold;

			if(detected) {
				// We raise an event?
			}

			this.log(
				'e: ' + energy +
				' | e_th: ' + this.energy_threshold +
				' | int: ' + integration +
				' | detection: ' + detection
			);

			return detection;
		},
		getFrequency: function() {
			var dominantBin = 0, maxBin = 0;
			var binHz = this.options.sampleRate / this.options.probe.analyser.fftSize;

			var fft = this.options.probe.byteFrequencyData;

			for(var i = 0, iLen = fft.length; i < iLen; i++) {
				if(fft[i] > maxBin) {
					dominantBin = i;
					maxBin = fft[i];
				}
			}

			var frequency = (dominantBin * binHz) + (binHz / 2);
			// console.log("frequency: " + frequency);
			return frequency;
		},
		getSFM: function() {

			var geometric = 0;
			var arithmetic = 0;

			var bin;
			var empty = 0;

			var fft = this.options.probe.byteFrequencyData;

			for(var i = 0, iLen = fft.length; i < iLen; i++) {
				bin = (fft[i] + 1) / 256; // So it is never zero
				// console.log("fft[" + i + "]: " + fft[i]);
				if(true || fft[i] > 0) {
					// bin = fft[i] / 255;
					// bin = fft[i];
					geometric += Math.log(bin);
					arithmetic += bin;
				} else {
					// empty++;
				}
			}

			var bins = fft.length - empty;

			geometric = Math.exp(geometric / bins);
			arithmetic = arithmetic / bins;

			var SF = geometric / arithmetic;
			var SFM = 10 * Math.log(SF) / Math.log(10);

			if(arithmetic > 0) {
				// console.log("geometric: " + geometric + " | arithmetic: " + arithmetic + " | SF: " + SF + " | SFM: " + SFM);
			}
			return SFM;
		},
		iterate: function() {

			var votes = 0;

			var msg = "";

			// Assuming the first N frames are silence, and use them to work out the minimums.
			if(this.initial_count < this.sum_counts) {
				this.initial_count++;
				this.sum_E += this.getEnergy();
				this.sum_F += this.getFrequency();
				this.sum_SF += this.getSFM();
				return 0; // false; // still initializing.
			} else if(this.initial_count === this.sum_counts) {
				this.initial_count++;
				this.min_E = this.sum_E / this.sum_counts;
				this.min_F = this.sum_F / this.sum_counts;
				this.min_SF = this.sum_SF / this.sum_counts;
				// Set decision threshold.
				this.t_E = this.options.pt_E * Math.log(this.min_E);
			}

			// Collect votes on speech detection
			var energy = this.getEnergy();
			var delta_E = energy - this.min_E;
			if(delta_E >= this.t_E) {
				votes++;
				msg += " E";
			}
			var delta_F = this.getFrequency() - this.min_F;
			if(delta_F >= this.t_F) {
				votes++;
				msg += " F";
			}
			var delta_SF = this.getSFM() - this.min_SF;
			if(delta_SF >= this.t_SF) {
				votes++;
				msg += " SF";
			}

			// Record votes
			if(votes > 1) {
				// speech
				this.silence_count = 0;
				this.speech_count++;
			} else {
				// silence
				this.silence_count++;
				this.speech_count = 0;
				// Update min energy
				this.min_E = ((this.silence_count * this.min_E) + energy) / (this.silence_count + 1);
				this.min_E = this.min_E < 1 ? 1 : this.min_E; // (MJP added) Limit the minimum energy to 1
				this.t_E = this.options.pt_E * Math.log(this.min_E);
			}

			// console.log("votes: " + votes + "(" + msg + ") | speech: " + this.speech_count + " | silence: " + this.silence_count + " | t_E: " + this.t_E + " | dE: " + delta_E + " | E: " + energy + " | t_F: " + this.t_F + " | dF: " + delta_F + " | t_SF: " + this.t_SF + " | dSF: " + delta_SF);

			if(this.speech_count > 5) {
				return 1;
			} else {
				return 0;
			}
		}
	};
	return Vad;
}(window.PM));
