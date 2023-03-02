// polyfill for text encoder and decoder since the audio thread doesn't have one
import '$audio/text_encoder.js';
import init, { make_noise, EnvelopeADSR } from '$wasm/wasm_synth.js';

declare const sampleRate: number; // provided by audio context
declare const currentTime: number; // provided by audio context

export default class SynthProcessor extends AudioWorkletProcessor {
	index: number;
	isSilent: boolean;
	envelope?: EnvelopeADSR;
	playingNotes: Array<Note> = [];
	frequencyBase = 220;
	frequencyPowerBase = 2 ** (1 / 12);

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
				this.envelope = new EnvelopeADSR();
				break;
			}
			case 'note-on': {
				const note = this.playingNotes.find((note) => note.id === event.note.id);
				if (!note) {
					// note does not exist
					this.playingNotes.push({
						id: event.note.id,
						on: (this.index / sampleRate) * 1000,
						off: 0.0,
						active: true,
						channel: 1
					});
				} else {
					// update the existing note
					note.on = (this.index / sampleRate) * 1000;
					note.off = 0.0;
					note.active = true;
				}
				this.isSilent = false;
				break;
			}
			case 'note-off': {
				const note = this.playingNotes.find((note) => note.id === event.note.id);
				if (note) {
					note.off = (this.index / sampleRate) * 1000;
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
		if (this.isSilent) return true;
		const output = outputs[0];

		output.forEach((channel) => {
			const notesToRemove: number[] = [];

			for (let i = 0; i < channel.length; i++) {
				let value = 0;
				for (const note of this.playingNotes) {
					const amplitude = this.envelope
						? this.envelope.get_amplitude((this.index / sampleRate) * 1000, note.on, note.off)
						: 0;

					const frequency = this.frequencyBase * this.frequencyPowerBase ** (note.id % 12);

					if (amplitude === 0 && note.off > note.on) {
						notesToRemove.push(note.id);
					}

					value += make_noise(amplitude, frequency, this.index / sampleRate);
				}

				channel[i] = value;
				this.index++;
			}

			this.playingNotes = this.playingNotes.filter((note) => !notesToRemove.includes(note.id));

			if (this.playingNotes.length === 0) {
				this.isSilent = true;
				this.port.postMessage({ type: 'silence' });
			}
		});

		// Returning true tells the Audio system to keep going.
		return true;
	}
}

registerProcessor('SynthProcessor', SynthProcessor);
