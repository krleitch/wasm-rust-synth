export default class SynthNode extends AudioWorkletNode {
	/**
	 * Initialize the Audio processor by sending the fetched WebAssembly module to
	 * the processor worklet.
	 *
	 * @param {ArrayBuffer} wasmBytes Sequence of bytes representing the entire
	 * WASM module
	 */
	init(wasmBytes: ArrayBuffer) {
		// Listen to messages sent from the audio processor.
		this.port.onmessage = (event) => this.onmessage(event.data);

		this.port.postMessage({
			type: 'send-wasm-module',
			wasmBytes
		});
	}

	onmessage(event: SynthNodeEvent) {
		switch (event.type) {
			case 'wasm-module-loaded':
				this.port.postMessage({
					type: 'init-synth'
				});
				break;
			case 'silence':
				this.disconnect();
				break;
			default:
				throw ((x: never) => x)(event); // Exhaustive check
		}
	}
}
