pub enum Waveform {
    SINE
}

pub struct SamplePoint {
    pub x: f32,
    pub y: f32
}

pub struct Oscillator {
    pub volume: f32,
    pub waveform: Waveform,
    pub sample_rate: u32,
}

fn frequency_constant(frequency: f32) -> f32 {
    return 2.0 * std::f32::consts::PI * frequency;
}

impl Oscillator {
    pub fn sound(&mut self, frequency: f32, iteration: u32, buffer_size: u32) -> Vec<SamplePoint> {
        let mut buffer = Vec::with_capacity(buffer_size as usize);
        let f = frequency_constant(frequency);

        for i in 0..buffer_size {
            
            let n = (i + (iteration * buffer_size)) as f32;
            let x = f * (n / self.sample_rate as f32);

            let y;
            match self.waveform {
                Waveform::SINE => {
                    y = x.sin(); 
                }
            }
            buffer.push(SamplePoint { x: n, y: y * self.volume });
        }

        return buffer;
    }
}

