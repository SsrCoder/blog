import { defineEcConfig } from 'astro-expressive-code'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'
import { pluginFullscreen } from 'expressive-code-fullscreen'

export default defineEcConfig({
	plugins: [
		pluginLineNumbers(), // https://expressive-code.com/plugins/line-numbers/
		pluginFullscreen(), // https://frostybee.github.io/expressive-code-fullscreen/configuration/
	],
})
