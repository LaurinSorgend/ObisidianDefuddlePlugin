import { App, Modal, Setting } from 'obsidian';

function looksLikeUrl(value: string): boolean {
	try {
		const parsed = new URL(value);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

export class UrlInputModal extends Modal {
	private onSubmit: (url: string) => void;
	private value = '';
	private errorEl!: HTMLElement;

	constructor(app: App, onSubmit: (url: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	async onOpen(): Promise<void> {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl('h2', { text: 'Parse URL with defuddle' });

		try {
			const clipboard = await navigator.clipboard.readText();
			if (looksLikeUrl(clipboard.trim())) {
				this.value = clipboard.trim();
			}
		} catch {
			// Clipboard access denied or unavailable; leave the field empty.
		}

		let inputEl: HTMLInputElement;

		new Setting(contentEl).setName('URL').addText((text) => {
			inputEl = text.inputEl;
			text.setPlaceholder('HTTPS://example.com/article').setValue(this.value);
			text.onChange((value) => {
				this.value = value;
			});
			text.inputEl.addEventListener('keydown', (evt: KeyboardEvent) => {
				if (evt.key === 'Enter') {
					evt.preventDefault();
					this.submit();
				}
			});
		});

		new Setting(contentEl).addButton((button) =>
			button
				.setButtonText('Parse')
				.setCta()
				.onClick(() => this.submit()),
		);

		this.errorEl = contentEl.createEl('p', {
			text: '',
			cls: 'defuddle-url-modal-error',
		});

		window.setTimeout(() => inputEl?.focus(), 0);
	}

	private submit(): void {
		const trimmed = this.value.trim();
		if (!looksLikeUrl(trimmed)) {
			this.errorEl.setText('Enter a valid HTTP(s) URL.');
			return;
		}
		this.close();
		this.onSubmit(trimmed);
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
