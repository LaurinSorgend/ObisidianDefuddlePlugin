import { App, PluginSettingTab, Setting } from 'obsidian';
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

export class DefuddleSettingTab extends PluginSettingTab {
	plugin: DefuddlePlugin;

	constructor(app: App, plugin: DefuddlePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Save parsed content to')
			.setDesc('Where parsed articles are saved after running "Defuddle: Parse URL".')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('note', 'New note')
					.addOption('cursor', 'Cursor position in active note')
					.addOption('ask', 'Ask each time')
					.setValue(this.plugin.settings.saveMode)
					.onChange(async (value) => {
						this.plugin.settings.saveMode = value as SaveMode;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('New note folder')
			.setDesc('Folder for new notes created from parsed URLs. Leave empty for the vault root.')
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
