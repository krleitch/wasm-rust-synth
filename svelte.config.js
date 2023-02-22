import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		// path aliases, npm run dev to generate in tsconfig
		alias: {
			$components: 'src/components',
			$audio: 'src/audio',
			$wasm: 'src/wasm'
		}
	}
};

export default config;
