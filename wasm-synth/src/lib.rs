mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, wasm-synth!");
}

#[wasm_bindgen]
pub fn make_noise(frequency: f32, time: f32) -> f32 {
    return 0.5 * (frequency * 2.0 * std::f32::consts::PI * time).sin(); 
}
