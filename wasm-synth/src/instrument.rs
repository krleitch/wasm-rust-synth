pub mod note;
pub mod envelope;
pub mod oscillator;

pub struct OscillatorEnvelopePair {
    pub envelope: envelope::EnvelopeADSR,
    pub oscillators: Vec<oscillator::Oscillator>
}

pub struct Instrument {
    pub name: String,
    pub volume: f32,
    pub iteration: f32,
    pub sample_rate: f32,
    pub frequency_base: f32,
    pub oscillator_envelope_pairs: Vec<OscillatorEnvelopePair>,
    pub notes: Vec<note::Note>,
}

impl Instrument {
    pub fn next_sample(&mut self, buffer_size: usize) -> Vec<f32> {
        let mut buffer = vec![0.0; buffer_size];


        let frequency_power_base = f32::powf(2.0, 1.0 / 12.0);

        let mut notes_to_remove: Vec<f32> = Vec::new();

        // TODO: this is not optimal... fix the envelope setting
        for note in self.notes.iter() {

            for oscillator_envelope in self.oscillator_envelope_pairs.iter_mut() {

                for oscillator in oscillator_envelope.oscillators.iter_mut() {

                    let frequency = self.frequency_base * f32::powf(frequency_power_base, note.id - 69.0);

                    let frames = oscillator.sound(frequency, self.iteration, buffer_size);

                    for i in 0..buffer_size {
                        let amplitude = oscillator_envelope.envelope.get_amplitude(
                            frames[i as usize].x / self.sample_rate,
                            note.on,
                            note.off
                        );
                        buffer[i as usize] += amplitude * frames[i as usize].y;
                        if amplitude == 0.0 && note.off > note.on {
                            notes_to_remove.push(note.id)
                        }
                    }
                }
            }            

        }

        // remove notes that are now dead
        for remove_id in notes_to_remove.iter() {
            self.notes.retain(|x| x.id != *remove_id);
        }
        if self.notes.len() == 0 {
            self.iteration = 0.0;
        }

        self.iteration += 1.0;

        return buffer;
    }

}
