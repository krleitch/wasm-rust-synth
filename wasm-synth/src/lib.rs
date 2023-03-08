mod utils;
mod instrument;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn make_noise(amplitude: f32, frequency: f32, time: f32) -> f32 {
    return amplitude * (frequency * 2.0 * std::f32::consts::PI * time).sin(); 
}

#[wasm_bindgen]
pub struct SynthManager {
    sample_rate: u32,
    buffer_size: u32,
    instruments: Vec<instrument::Instrument>,
}

#[wasm_bindgen]
impl SynthManager {

    #[wasm_bindgen(constructor)]
    pub fn new(sample_rate: u32) -> SynthManager {
        let mut synth_manager = SynthManager {
            sample_rate,
            instruments: Vec::new(),
            buffer_size: 128
        };

        // create a simple sin waveform instrument
        let env_sin_synth = instrument::envelope::EnvelopeADSR {
            attack_time: 0.1,
            decay_time: 0.1,
            start_amplitude: 1.0,
            sustain_amplitude: 0.8,
            release_time: 0.2,
            max_time: Option::None
        };

        let osc_sin_synth = instrument::oscillator::Oscillator {
            volume: 0.6,
            waveform: instrument::oscillator::Waveform::SINE,
            sample_rate,
        };

        let osc_env_pair = instrument::OscillatorEnvelopePair {
            oscillators: Vec::from([osc_sin_synth]),
            envelope: env_sin_synth
        };

        let instr_sin_synth = instrument::Instrument {
            name: String::from("sin_synth"),
            volume: 1.0,
            oscillator_envelope_pairs: Vec::from([osc_env_pair]),
            notes: Vec::new(),
            iteration: 0,
            sample_rate,
            frequency_base: 220.0,
        };
    
        synth_manager.instruments.push(instr_sin_synth);
        return synth_manager;
    }

    #[wasm_bindgen]
    pub fn note_on(&mut self, note_id: u32, instrument_name: &str) {
        for instrument in self.instruments.iter_mut() {

            if instrument_name == instrument.name {
                // Check if we just need to update existing note
                if let Some(note) = instrument.notes.iter_mut().find(|x| x.id == note_id) {
                    note.on = (instrument.iteration as f32 * self.buffer_size as f32) / self.sample_rate as f32;
                } else {
                    // Create the note if it doesnt exist
                    instrument.notes.push(instrument::note::Note {
                        id: note_id,
                        on: ((instrument.iteration as f32 * self.buffer_size as f32) / self.sample_rate as f32),
                        off: 0.0,
                        active: true,
                        instrument_name: String::from(instrument_name)
                    });
                }
            }
        }
    } 

    #[wasm_bindgen]
    pub fn note_off(&mut self, note_id: u32, instrument_name: &str) {
        for instrument in self.instruments.iter_mut() {
            if instrument_name == instrument.name {
                if let Some(note) = instrument.notes.iter_mut().find(|x| x.id == note_id) {
                    note.off = (instrument.iteration as f32 * self.buffer_size as f32) / self.sample_rate as f32;
                }
            }
        }
    } 
   
    #[wasm_bindgen]
    pub fn next_sample(&mut self, buffer_size: u32) -> Vec<f32> {
        let mut buffer = vec![0.0; buffer_size as usize];

        for instrument in self.instruments.iter_mut() {
            let samples = instrument.next_sample(buffer_size);
            for i in 0..buffer_size {
                buffer[i as usize] += samples[i as usize];
            }
        }

        return buffer;
    } 
}
