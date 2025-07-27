import { defineEcConfig } from 'astro-expressive-code'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'

export default defineEcConfig({
	plugins: [
		pluginLineNumbers(), // https://expressive-code.com/plugins/line-numbers/
	],
})
