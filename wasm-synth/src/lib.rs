mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;


#[wasm_bindgen]
pub struct EnvelopeADSR {
    attack_time: f32,
    decay_time: f32,
    release_time: f32,

    sustain_amplitude: f32,
    start_amplitude: f32,

    max_time: Option<f32>
}

#[wasm_bindgen]
impl EnvelopeADSR {

    #[wasm_bindgen(constructor)]
    pub fn new() -> EnvelopeADSR {
        EnvelopeADSR {
            attack_time: 100.0,
            decay_time: 10.0,
            start_amplitude: 1.0,
            sustain_amplitude: 0.8,
            release_time: 200.0,
            max_time: Option::None
        }
    }

    pub fn get_amplitude(&self, time: f32, time_on: f32, time_off: f32) -> f32 {
        let mut amplitude = 0.0;
        let mut release_amplitude = 0.0;

        if time_on > time_off { // note is on
            let lifetime = time - time_on;
            // attack
            if lifetime <= self.attack_time {
                amplitude = (lifetime / self.attack_time) * self.start_amplitude;
            }
            // decay
            if lifetime > self.attack_time && lifetime <= (self.attack_time + self.decay_time) {
                amplitude = ((lifetime - self.attack_time) / self.decay_time) * (self.sustain_amplitude - self.start_amplitude) + self.start_amplitude;
            }
            // sustain
            if lifetime > (self.attack_time + self.decay_time) {
                amplitude = self.sustain_amplitude;
            }
            // max time
            if let Some(max_time_val) = self.max_time {
                if lifetime > max_time_val {
                    amplitude = 0.0;
                }
            }
        } else { // note is off
            let lifetime = time_off - time_on;
            // attack
            if lifetime <= self.attack_time {
                release_amplitude = (lifetime / self.attack_time) * self.start_amplitude;
            }
            // decay
            if lifetime > self.attack_time && lifetime <= (self.attack_time + self.decay_time) {
                release_amplitude = ((lifetime - self.attack_time) / self.decay_time) * (self.sustain_amplitude - self.start_amplitude) + self.start_amplitude;
            }
            // sustain
            if lifetime > (self.attack_time + self.decay_time) {
                release_amplitude = self.sustain_amplitude;
            }
            // release
            amplitude = ((time - time_off) / self.release_time) * (0.0 - release_amplitude) + release_amplitude;
            // max time
            if let Some(max_time_val) = self.max_time {
                if lifetime > max_time_val {
                    amplitude = 0.0;
                }
            }
        }
        if amplitude < 0.0001 {
            amplitude = 0.0;
        }
        return amplitude;
    }
}

#[wasm_bindgen]
pub fn make_noise(amplitude: f32, frequency: f32, time: f32) -> f32 {
    return amplitude * (frequency * 2.0 * std::f32::consts::PI * time).sin(); 
}
