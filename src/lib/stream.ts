const EXPANSION = 3.3;

export async function readWithProgress(
  response: Response,
  expected: number,
  onBytes: (loaded: number, total: number) => void
): Promise<Blob> {
  const length = Number(response.headers.get("content-length")) || 0;
  const encoded = /gzip|br|deflate|zstd/.test(response.headers.get("content-encoding") ?? "");
  const total = length ? (encoded ? length * EXPANSION : length) : expected;
  const type = response.headers.get("content-type") ?? "";

  if (!response.body) {
    const blob = await response.blob();

    onBytes(blob.size, blob.size);
    return blob;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  for (;;) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
    loaded += value.length;
    onBytes(loaded, Math.max(total, loaded));
  }

  onBytes(loaded, loaded);

  return new Blob(chunks as BlobPart[], { type });
}
