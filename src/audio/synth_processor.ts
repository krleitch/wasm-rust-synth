// polyfill for text encoder and decoder since the audio thread doesn't have one
import '$audio/text_encoder.js';
import init, { SynthManager } from '$wasm/wasm_synth.js';

declare const sampleRate: number; // provided by audio context

export default class SynthProcessor extends AudioWorkletProcessor {
	synthManager?: SynthManager;
	// isSilent = true;

	constructor() {
		super();
		this.port.onmessage = (event) => this.onmessage(event.data);
	}

	onmessage(event: SynthProcessorEvent) {
		switch (event.type) {
			case 'send-wasm-module': {
				init(WebAssembly.compile(event.wasmBytes)).then(() => {
					this.port.postMessage({ type: 'wasm-module-loaded' });
				});
				break;
			}
			case 'init-synth': {
				this.synthManager = new SynthManager(sampleRate, 128);
				break;
			}
			case 'note-on': {
				if (this.synthManager) {
					// this.isSilent = false;
					this.synthManager.note_on(event.note.id, event.note.instrumentName);
				}
				break;
			}
			case 'note-off': {
				if (this.synthManager) {
					this.synthManager.note_off(event.note.id, event.note.instrumentName);
				}
				break;
			}
			case 'get-instruments': {
				if (this.synthManager) {
					const instruments = this.synthManager.get_instruments();
					this.port.postMessage({ type: 'instrument-list-loaded', instruments });
				}
				break;
			}
			default: {
				throw ((x: never) => x)(event); // Exhaustive check
			}
		}
	}

	process(_inputs: Float32Array[][], outputs: Float32Array[][]) {
		// Check if silent
		// if (this.isSilent) return true;

		// We only use a single channel to generate our sounds, will be up-mixed to stereo.
		const outputChannel = outputs[0][0];
		if (this.synthManager) {
			const sample = this.synthManager.next_sample(outputChannel.length);
			for (let i = 0; i < sample.length; i++) {
				outputChannel[i] = sample[i];
			}

			// If everything is zero we are silent
			// if (sample.filter((x) => x !== 0).length === 0) {
			// this.isSilent = true;
			// this.port.postMessage({ type: 'disconnect' });
			// }
		}

		// Returning true tells the audio system to keep going.
		return true;
	}
}

registerProcessor('SynthProcessor', SynthProcessor);
