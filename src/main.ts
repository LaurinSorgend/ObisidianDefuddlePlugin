import {
	Editor,
	MarkdownView,
	Notice,
	Plugin,
	requestUrl,
	stringifyYaml,
} from 'obsidian';
import Defuddle from 'defuddle/full';
import type { DefuddleResponse } from 'defuddle/full';
import { DEFAULT_SETTINGS, DefuddlePluginSettings, DefuddleSettingTab } from './settings';
import { UrlInputModal } from './urlModal';
import { SaveTargetModal, SaveTarget } from './saveTargetModal';
import { createObsidianFetch } from './obsidianFetch';
import { ensureFolder, sanitizeFilename, uniqueNotePath } from './noteUtils';

export default class DefuddlePlugin extends Plugin {
	settings!: DefuddlePluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'parse-url',
			name: 'Parse URL',
			callback: () => {
				new UrlInputModal(this.app, (url) => void this.parseUrl(url)).open();
			},
		});

		this.addSettingTab(new DefuddleSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<DefuddlePluginSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private async parseUrl(url: string): Promise<void> {
		const notice = new Notice('Fetching page…', 0);

		let html: string;
		try {
			const response = await requestUrl({ url, throw: false });
			if (response.status < 200 || response.status >= 300) {
				notice.hide();
				new Notice(`Defuddle: failed to fetch page (HTTP ${response.status}).`);
				return;
			}
			html = response.text;
		} catch (error) {
			notice.hide();
			new Notice(`Defuddle: failed to fetch page (${(error as Error).message}).`);
			return;
		}

		let result: DefuddleResponse;
		try {
			notice.setMessage('Parsing content…');
			const doc = new DOMParser().parseFromString(html, 'text/html');
			result = await new Defuddle(doc, {
				url,
				markdown: true,
				fetch: createObsidianFetch(),
			}).parseAsync();
		} catch (error) {
			notice.hide();
			new Notice(`Defuddle: failed to parse page (${(error as Error).message}).`);
			return;
		} finally {
			notice.hide();
		}

		if (!result.content || !result.content.trim()) {
			new Notice('Defuddle: no article content found on that page.');
			return;
		}

		const target = await this.resolveSaveTarget(result.title || url);
		if (!target) {
			return;
		}

		if (target === 'cursor') {
			this.insertAtCursor(result.content);
		} else {
			await this.createNote(url, result);
		}
	}

	private resolveSaveTarget(title: string): Promise<SaveTarget | null> {
		if (this.settings.saveMode !== 'ask') {
			return Promise.resolve(this.settings.saveMode);
		}
		return new Promise((resolve) => {
			new SaveTargetModal(this.app, title, (target) => resolve(target)).open();
		});
	}

	private insertAtCursor(content: string): void {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) {
			new Notice('Defuddle: open a note first to insert content at the Cursor.');
			return;
		}
		const editor: Editor = view.editor;
		editor.replaceSelection(content);
		new Notice('Defuddle: content inserted.');
	}

	private async createNote(url: string, result: DefuddleResponse): Promise<void> {
		const frontmatterFields: Record<string, string> = {
			title: result.title || url,
			source: url,
		};
		if (result.author) frontmatterFields.author = result.author;
		if (result.published) frontmatterFields.published = result.published;
		if (result.description) frontmatterFields.description = result.description;

		const frontmatter = stringifyYaml(frontmatterFields);
		const noteContent = `---\n${frontmatter}---\n\n${result.content}\n`;

		const folder = this.settings.noteFolder;
		await ensureFolder(this.app.vault, folder);
		const baseName = sanitizeFilename(result.title || url);
		const path = await uniqueNotePath(this.app.vault, folder, baseName);

		const file = await this.app.vault.create(path, noteContent);
		await this.app.workspace.getLeaf(true).openFile(file);
		new Notice(`Defuddle: created "${file.basename}".`);
	}
}
