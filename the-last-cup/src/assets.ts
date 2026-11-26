import { staticFile } from 'remotion';

/** Resolve a public asset: inlined data URLs when the standalone preview provides them, else Remotion's staticFile. */
export function asset(p: string): string {
  const map = (globalThis as any).__ASSETS as Record<string, string> | undefined;
  return map?.[p] ?? staticFile(p);
}
