// polyfill for text encoder and decoder since the audio thread doesn't have one
import '$audio/text_encoder.js';
import init, { SynthManager } from '$wasm/wasm_synth.js';

declare const sampleRate: number; // provided by audio context
declare const currentTime: number; // provided by audio context

export default class SynthProcessor extends AudioWorkletProcessor {
	index: number;
	isSilent: boolean;
	// envelope?: EnvelopeADSR;
	// playingNotes: Array<Note> = [];
	frequencyBase = 220;
	frequencyPowerBase = 2 ** (1 / 12);
	synthManager?: SynthManager;

	static get parameterDescriptors() {
		return [
			{
				name: 'sampleRate',
				defaultValue: 48000
			},
			{
				name: 'frequency',
				defaultValue: 440
			},
			{
				name: 'type',
				defaultValue: 0
			}
		];
	}

	constructor() {
		super();

		this.index = 0;
		this.isSilent = true;
		this.port.onmessage = (event) => this.onmessage(event.data);
	}

	// Gets time in seconds since the processor started
	getTime() {
		return this.index / sampleRate;
	}

	// TODO: time in ms
	onmessage(event: SynthProcessorEvent) {
		switch (event.type) {
			case 'send-wasm-module': {
				init(WebAssembly.compile(event.wasmBytes)).then(() => {
					this.port.postMessage({ type: 'wasm-module-loaded' });
				});
				break;
			}
			case 'init-synth': {
				this.synthManager = new SynthManager(sampleRate);
				break;
			}
			case 'note-on': {
				if (this.synthManager) {
					this.synthManager.note_on(event.note.id, 'sin_synth');
				}
				break;
			}
			case 'note-off': {
				// const note = this.playingNotes.find((note) => note.id === event.note.id);
				// if (note) {
				// 	note.off = (this.index / sampleRate) * 1000;
				// }
				if (this.synthManager) {
					this.synthManager.note_off(event.note.id, 'sin_synth');
				}
				break;
			}
			default: {
				throw ((x: never) => x)(event); // Exhaustive check
			}
		}
	}

	process(
		_inputs: Float32Array[][],
		outputs: Float32Array[][],
		_parameters: Record<string, Float32Array>
	) {
		// if (this.isSilent) return true;
		//
		// 	if (this.playingNotes.length === 0) {
		// 		this.isSilent = true;
		// 		this.port.postMessage({ type: 'silence' });
		// 	}

		// Returning true tells the Audio system to keep going.
		// NOTE: We only use a single channel to generate our sounds, will be up-mixed to stereo.
		const outputChannel = outputs[0][0];
		if (this.synthManager) {
			const sample = this.synthManager.next_sample(outputChannel.length);
			for (let i = 0; i < sample.length; i++) {
				outputChannel[i] = sample[i];
			}
		}
		return true;
	}
}

registerProcessor('SynthProcessor', SynthProcessor);
