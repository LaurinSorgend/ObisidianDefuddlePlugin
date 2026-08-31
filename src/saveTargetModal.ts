import { App, Modal, Setting } from 'obsidian';

export type SaveTarget = 'note' | 'cursor';

export class SaveTargetModal extends Modal {
	private onChoose: (target: SaveTarget) => void;
	private title: string;

	constructor(app: App, title: string, onChoose: (target: SaveTarget) => void) {
		super(app);
		this.title = title;
		this.onChoose = onChoose;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl('h2', { text: 'Save parsed content' });
		contentEl.createEl('p', { text: this.title });

		new Setting(contentEl)
			.addButton((button) =>
				button
					.setButtonText('New note')
					.setCta()
					.onClick(() => this.choose('note')),
			)
			.addButton((button) =>
				button.setButtonText('Insert at cursor').onClick(() => this.choose('cursor')),
			);
	}

	private choose(target: SaveTarget): void {
		this.close();
		this.onChoose(target);
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
