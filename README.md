# Defuddle Web Clipper

An [Obsidian](https://obsidian.md/) plugin that uses [Defuddle](https://github.com/kepano/defuddle) to parse a URL into clean, readable markdown, then saves it as a new note or inserts it at the cursor.

## Features

- Fetches a web page and strips ads, navigation, and other clutter, leaving just the article content.
- Converts the extracted content to markdown.
- Saves the result as a new note with frontmatter (`title`, `source`, `author`, `published`, `description` when available), or inserts it directly at the cursor in the active note.
- Optionally asks each time where to save the content.

For more detail on what gets extracted and how, check out [Defuddle](https://github.com/kepano/defuddle), the extraction library this plugin is built on.

## Usage

1. Run the **Parse URL with defuddle** command (`Ctrl/Cmd+P` → "Parse URL").
2. Enter (or paste, it's pre-filled from your clipboard when it looks like a URL) the URL of the article you want to clip.
3. The plugin fetches the page, extracts the article content, and either creates a new note or inserts the content at your cursor, depending on your settings.

## Settings

- **Save parsed content to** — choose whether parsed articles become a new note, are inserted at the cursor in the active note, or you're asked each time.
- **New note folder** — the vault folder new notes are created in. Leave empty to use the vault root.

## Installation

### From the Community Plugins directory

Once published, search for "Defuddle Web Clipper" in Obsidian's Community Plugins browser and install it from there.

### Manually

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/LaurinSorgend/ObisidianDefuddlePlugin/releases).
2. Copy them into `<your-vault>/.obsidian/plugins/defuddle-clipper/`.
3. Reload Obsidian and enable "Defuddle Web Clipper" in Settings → Community plugins.

## License

Released under the [0BSD license](./LICENSE).
