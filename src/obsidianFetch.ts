import { requestUrl, RequestUrlParam } from 'obsidian';

/**
 * Wraps Obsidian's requestUrl (no CORS restrictions) as a fetch()-compatible
 * function, matching the subset of the Response API that defuddle's
 * extractors (reddit.ts, youtube.ts) actually use: ok, status, url, text(),
 * json(), and an optional body for `.body?.cancel()`.
 */
export function createObsidianFetch(): typeof globalThis.fetch {
	const obsidianFetch = async (
		input: RequestInfo | URL,
		init?: RequestInit,
	): Promise<Response> => {
		const url =
			typeof input === 'string'
				? input
				: input instanceof URL
					? input.toString()
					: input.url;

		const headers: Record<string, string> = {};
		if (init?.headers) {
			new Headers(init.headers).forEach((value, key) => {
				headers[key] = value;
			});
		}

		const params: RequestUrlParam = {
			url,
			method: init?.method ?? 'GET',
			headers,
			throw: false,
		};
		if (typeof init?.body === 'string') {
			params.body = init.body;
		}

		const res = await requestUrl(params);

		return {
			ok: res.status >= 200 && res.status < 300,
			status: res.status,
			statusText: '',
			url,
			redirected: false,
			type: 'basic',
			headers: new Headers(res.headers as Record<string, string>),
			body: null,
			bodyUsed: false,
			text: async () => res.text,
			json: async () => res.json,
			arrayBuffer: async () => res.arrayBuffer,
			blob: async () => new Blob([res.arrayBuffer]),
			clone(): Response {
				throw new Error('clone() is not supported by the Obsidian fetch shim');
			},
		} as unknown as Response;
	};

	return obsidianFetch as typeof globalThis.fetch;
}
