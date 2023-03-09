import { derived, writable } from 'svelte/store';
import translations from '$src/translations';

import type { Writable } from 'svelte/store';

type TranslationVar = {
	[key: string]: string;
};
type ValidLocale = keyof typeof translations;
// Assume all locales implement a subset
type ValidKey = Partial<keyof typeof translations.en>;

export const locale: Writable<ValidLocale> = writable('en');
export const locales = Object.keys(translations);

function translate(locale: ValidLocale, key: ValidKey, vars: TranslationVar) {
	// Let's throw some errors if we're trying to use keys/locales that don't exist.
	// We could improve this by using Typescript and/or fallback values.
	if (!key) throw new Error('no key provided to $t()');
	if (!locale) throw new Error(`no translation for key "${key}"`);

	// Grab the translation from the translations object.
	let text = translations[locale][key];

	// Return the key if we can't find the text
	if (!text) return key;

	// Replace any passed in variables in the translation string.
	Object.keys(vars).map((k) => {
		const regex = new RegExp(`{{${k}}}`, 'g');
		text = text.replace(regex, vars[k]);
	});

	return text;
}

export const t = derived(
	locale,
	($locale) =>
		(key: ValidKey, vars = {}) =>
			translate($locale, key, vars)
);
