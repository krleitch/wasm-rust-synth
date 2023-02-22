// polyfill for text encoder and decoder since the audio thread doesn't have one
import '$audio/text_encoder.js';
import init, { make_noise } from '$wasm/wasm_synth.js';

export default class SynthProcessor extends AudioWorkletProcessor {
	index: number;

	static get parameterDescriptors() {
		return [
			{
				name: 'sampleRate',
				defaultValue: 48000
			},
			{
				name: 'frequency',
				defaultValue: 220
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
		this.port.onmessage = (event) => this.onmessage(event.data);
	}

	onmessage(event: SynthProcessorEvent) {
		switch (event.type) {
			case 'send-wasm-module':
				try {
					init(WebAssembly.compile(event.wasmBytes)).then(() => {
						this.port.postMessage({ type: 'wasm-module-loaded' });
					});
				} catch (e) {
					console.log(e);
				}
				break;
			case 'init-generator':
				break;
			default:
				throw ((x: never) => x)(event); // Exhaustive check
		}
	}

	process(
		_inputs: Float32Array[][],
		outputs: Float32Array[][],
		parameters: Record<string, Float32Array>
	) {
		// ignore inputs

		outputs[0].forEach((channel) => {
			for (let i = 0; i < channel.length; i++) {
				// channel is a buffer
				channel[i] = make_noise(parameters.frequency[0], this.index / parameters.sampleRate[0]);
				this.index++;
			}
		});

		// Returning true tells the Audio system to keep going.
		return true;
	}
}

registerProcessor('SynthProcessor', SynthProcessor);
