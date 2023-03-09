mod utils;
mod instrument;
mod default_instruments;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct SynthManager {
    sample_rate: f32,
    buffer_size: usize,
    instruments: Vec<instrument::Instrument>,
}

#[wasm_bindgen]
impl SynthManager {

    #[wasm_bindgen(constructor)]
    pub fn new(sample_rate: f32, buffer_size: usize) -> SynthManager {
        let mut synth_manager = SynthManager {
            sample_rate,
            buffer_size,
            instruments: Vec::new(),
        };

        // Create the default instruments 
        let sin_synth = default_instruments::create_sin_synth(sample_rate);
        synth_manager.instruments.push(sin_synth);
        return synth_manager;
    }

    #[wasm_bindgen]
    pub fn note_on(&mut self, note_id: f32, instrument_name: &str) {
        for instrument in self.instruments.iter_mut() {

            if instrument_name == instrument.name {
                // Check if we just need to update existing note
                if let Some(note) = instrument.notes.iter_mut().find(|x| x.id == note_id) {
                    note.on = (instrument.iteration * self.buffer_size as f32) / self.sample_rate;
                } else {
                    // Create the note if it doesnt exist
                    instrument.notes.push(instrument::note::Note {
                        id: note_id,
                        on: (instrument.iteration * self.buffer_size as f32) / self.sample_rate,
                        off: 0.0,
                        active: true,
                        instrument_name: String::from(instrument_name)
                    });
                }
            }
        }
    } 

    #[wasm_bindgen]
    pub fn note_off(&mut self, note_id: f32, instrument_name: &str) {
        for instrument in self.instruments.iter_mut() {
            if instrument_name == instrument.name {
                if let Some(note) = instrument.notes.iter_mut().find(|x| x.id == note_id) {
                    note.off = (instrument.iteration * self.buffer_size as f32) / self.sample_rate;
                }
            }
        }
    } 
   
    #[wasm_bindgen]
    pub fn next_sample(&mut self, buffer_size: usize) -> Vec<f32> {
        let mut buffer = vec![0.0; buffer_size];

        for instrument in self.instruments.iter_mut() {
            let samples = instrument.next_sample(buffer_size);
            for i in 0..buffer_size {
                buffer[i] += samples[i];
            }
        }

        return buffer;
    } 
}
