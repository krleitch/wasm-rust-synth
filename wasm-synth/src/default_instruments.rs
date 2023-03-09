use crate::instrument;

pub fn create_sin_synth(sample_rate: f32) -> instrument::Instrument {
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
            iteration: 0.0,
            sample_rate,
            frequency_base: 220.0,
        };

        return instr_sin_synth;
}
