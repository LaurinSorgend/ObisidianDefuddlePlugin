import { App, PluginSettingTab, Setting, SettingDefinitionItem } from 'obsidian';
import DefuddlePlugin from './main';

export type SaveMode = 'note' | 'cursor' | 'ask';

export interface DefuddlePluginSettings {
	saveMode: SaveMode;
	noteFolder: string;
}

export const DEFAULT_SETTINGS: DefuddlePluginSettings = {
	saveMode: 'note',
	noteFolder: '',
};

const SAVE_MODE_OPTIONS: Record<SaveMode, string> = {
	note: 'New note',
	cursor: 'Cursor position in active note',
	ask: 'Ask each time',
};

const SAVE_MODE_DESC = 'Where parsed articles are saved after running "defuddle: Parse URL".';
const NOTE_FOLDER_DESC = 'Folder for new notes created from parsed urls. Leave empty for the vault root.';

export class DefuddleSettingTab extends PluginSettingTab {
	plugin: DefuddlePlugin;

	constructor(app: App, plugin: DefuddlePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: 'Save parsed content to',
				desc: SAVE_MODE_DESC,
				control: {
					type: 'dropdown',
					key: 'saveMode',
					options: SAVE_MODE_OPTIONS,
					defaultValue: DEFAULT_SETTINGS.saveMode,
				},
			},
			{
				name: 'New note folder',
				desc: NOTE_FOLDER_DESC,
				aliases: ['clippings', 'destination'],
				control: {
					type: 'folder',
					key: 'noteFolder',
					placeholder: 'Clippings',
					defaultValue: DEFAULT_SETTINGS.noteFolder,
					includeRoot: true,
				},
			},
		];
	}

	/** Fallback rendering for Obsidian versions older than 1.13.0. */
	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Save parsed content to')
			.setDesc(SAVE_MODE_DESC)
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(SAVE_MODE_OPTIONS)
					.setValue(this.plugin.settings.saveMode)
					.onChange(async (value) => {
						this.plugin.settings.saveMode = value as SaveMode;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('New note folder')
			.setDesc(NOTE_FOLDER_DESC)
			.addText((text) =>
				text
					.setPlaceholder('Clippings')
					.setValue(this.plugin.settings.noteFolder)
					.onChange(async (value) => {
						this.plugin.settings.noteFolder = value.trim();
						await this.plugin.saveSettings();
					}),
			);
	}
}
