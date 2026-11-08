# ModelPort image-generated UI icons

`modelport-icons.webp` is an optimized transparent raster atlas generated from a text prompt. It contains 40 icons in an 8-column, 5-row grid. The original generated PNG was converted to WebP without changing its layout or alpha background. The UI loads the single shared image through `app/ui-icons.tsx` and CSS; navigation, actions and statistics use this asset. Provider brands now load separate SVG files from `providers/`.

Generation: built-in image generation, transparent background.

Prompt brief: Create one production UI icon sprite atlas for a premium dark AI API gateway dashboard. Exactly 8 equal columns and 5 equal rows, 40 icons. Luminous pale mint and ice-blue glass-metal, crisp readable silhouettes, subtle bevels and restrained highlights, transparent margins, no grid, no labels or text. Each icon is centered in its equal-sized cell and remains readable at 24px.

Grid, left to right:

1. Waveform, dashboard, layers, key, gauge, document, chat, wallet.
2. Shield, code, activity, cube, sparkle, lightning, settings, search.
3. Send, plus, check, copy, external link, down chevron, right chevron, right arrow.
4. Northeast arrow, southeast arrow, more, close, help, clock, credit card, abstract OpenAI provider emblem.
5. MiniMax, GLM, DeepSeek, Qwen, Moonshot, Anthropic abstract provider emblems, user, network.

The old provider illustrations in atlas cells 31–37 are no longer displayed. Brand marks are distributed by [Lobe Icons](https://github.com/lobehub/lobe-icons) under MIT; see `providers/README.md` and `providers/LICENSE`.
