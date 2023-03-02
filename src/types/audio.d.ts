// Audio worklet types

interface AudioWorkletProcessor {
	readonly port: MessagePort;
	process(
		inputs: Float32Array[][],
		outputs: Float32Array[][],
		parameters: Record<string, Float32Array>
	): boolean;
}

declare let AudioWorkletProcessor: {
	prototype: AudioWorkletProcessor;
	new (options?: AudioWorkletNodeOptions): AudioWorkletProcessor;
};

declare function registerProcessor(
	name: string,
	processorCtor: (new (options?: AudioWorkletNodeOptions) => AudioWorkletProcessor) & {
		parameterDescriptors?: AudioParamDescriptor[];
	}
): undefined;

// Event types

// synth processor
type SendWasmModuleEvent = {
	type: 'send-wasm-module';
	wasmBytes: ArrayBuffer;
};
type InitSynthEvent = {
	type: 'init-synth';
};
type NoteOnEvent = {
	type: 'note-on';
	note: Note;
};
type NoteOffEvent = {
	type: 'note-off';
	note: Note;
};
type SynthProcessorEvent = SendWasmModuleEvent | InitSynthEvent | NoteOnEvent | NoteOffEvent;

// synth node
type WasmModuleLoadedEvent = {
	type: 'wasm-module-loaded';
};
type DisconnectEvent = {
	type: 'disconnect';
};
type SynthNodeEvent = WasmModuleLoadedEvent | DisconnectEvent;

// My types
type Note = {
	id: number; // midi number
	on: number; // time note was activated
	off: number; // time note was deactivated
	active: boolean;
	channel: number;
};
