// Prevents fetch call hanging forever
const DEFAULT_TIMEOUT_MS = 8000;

export type FetchPageSuccess = {
  ok: true;
  url: string;
  html: string;
  status: number;
};

export type FetchPageFailure = {
  ok: false;
  url: string;
  reason: 'network_error' | 'timeout' | 'non_ok_status' | 'non_html_content';
  message: string;
};

export type FetchPageResult = FetchPageSuccess | FetchPageFailure;

export async function fetchPage(
  url: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<FetchPageResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'MoKnowledgeBot/1.0 (+https://moflo.ai; knowledge base research)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        url,
        reason: 'non_ok_status',
        message: `Server responded with HTTP ${response.status}`,
      };
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html')) {
      return {
        ok: false,
        url,
        reason: 'non_html_content',
        message: `Expected HTML, got content-type "${contentType}"`,
      };
    }

    const html = await response.text();
    return { ok: true, url: response.url, html, status: response.status };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        ok: false,
        url,
        reason: 'timeout',
        message: `No response within ${timeoutMs}ms`,
      };
    }
    return {
      ok: false,
      url,
      reason: 'network_error',
      message: error instanceof Error ? error.message : 'Unknown fetch error',
    };
  } finally {
    clearTimeout(timeout);
  }
}
