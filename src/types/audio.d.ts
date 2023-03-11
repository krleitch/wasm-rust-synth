// Processor types

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

// Node types

type SynthAudioWorkletNode = AudioWorkletNode & {
	init: (wasmBytes: ArrayBuffer) => void;
	instruments: string[];
};

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
type GetInstrumentsEvent = {
	type: 'get-instruments';
};
type SynthProcessorEvent =
	| SendWasmModuleEvent
	| InitSynthEvent
	| NoteOnEvent
	| NoteOffEvent
	| GetInstrumentsEvent;

// synth node
type WasmModuleLoadedEvent = {
	type: 'wasm-module-loaded';
};
type InstrumentListEvent = {
	type: 'instrument-list-loaded';
	instruments: string[];
};
type DisconnectEvent = {
	type: 'disconnect';
};
type SynthNodeEvent = WasmModuleLoadedEvent | InstrumentListEvent | DisconnectEvent;

// Data types

type Note = {
	id: number; // midi number
	instrumentName: string;
};
