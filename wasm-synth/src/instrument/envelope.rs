pub struct EnvelopeADSR {
    pub attack_time: f32,
    pub decay_time: f32,
    pub release_time: f32,

    pub sustain_amplitude: f32,
    pub start_amplitude: f32,

    pub max_time: Option<f32>
}

impl EnvelopeADSR {

    // #[wasm_bindgen(constructor)]
    // pub fn new() -> EnvelopeADSR {
    //     EnvelopeADSR {
    //         attack_time: 0.1,
    //         decay_time: 0.01,
    //         start_amplitude: 1.0,
    //         sustain_amplitude: 0.8,
    //         release_time: 0.2,
    //         max_time: Option::None
    //     }
    // }

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
        if amplitude < 0.001 {
            amplitude = 0.0;
        }
        return amplitude;
    }
}
