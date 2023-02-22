// Audio worklet Processor types

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
type InitGeneratorEvent = {
	type: 'init-generator';
};
type SynthProcessorEvent = SendWasmModuleEvent | InitGeneratorEvent;

// synth node
type WasmModuleLoadedEvent = {
	type: 'wasm-module-loaded';
};
type SetFrequencyEvent = {
	type: 'set-frequency';
};
type SynthNodeEvent = WasmModuleLoadedEvent | SetFrequencyEvent;
