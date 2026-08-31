import { normalizePath, Vault } from 'obsidian';

const ILLEGAL_FILENAME_CHARS = /[\\/:*?"<>|#^[\]]/g;

/**
 * Turns an arbitrary article title into a safe, cross-platform Obsidian
 * filename (no extension).
 */
export function sanitizeFilename(title: string): string {
	const cleaned = title
		.replace(ILLEGAL_FILENAME_CHARS, '')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/[.\s]+$/, ''); // Windows disallows trailing dots/spaces

	const truncated = cleaned.slice(0, 150).trim();
	return truncated.length > 0 ? truncated : 'Untitled';
}

/**
 * Builds a unique vault path for a new note, appending " (2)", " (3)", etc.
 * on collision.
 */
export async function uniqueNotePath(
	vault: Vault,
	folder: string,
	baseName: string,
): Promise<string> {
	const folderPath = folder.trim();
	let attempt = 0;

	while (true) {
		const suffix = attempt === 0 ? '' : ` (${attempt + 1})`;
		const fileName = `${baseName}${suffix}.md`;
		const path = normalizePath(folderPath ? `${folderPath}/${fileName}` : fileName);

		if (!vault.getAbstractFileByPath(path)) {
			return path;
		}
		attempt++;
	}
}

/**
 * Ensures the given vault folder exists, creating it (and parents) if needed.
 * No-op for the vault root.
 */
export async function ensureFolder(vault: Vault, folder: string): Promise<void> {
	const path = normalizePath(folder.trim());
	if (!path || path === '/') {
		return;
	}
	if (!vault.getAbstractFileByPath(path)) {
		await vault.createFolder(path).catch(() => {
			// Another process may have created it concurrently; ignore.
		});
	}
}
