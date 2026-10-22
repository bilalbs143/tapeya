/** Prefill composer when replying to a comment. */
export function postDetailReplyDraft(handle: string): string {
  return `@${handle} `;
}

export function isValidPostId(id: number): boolean {
  return Number.isFinite(id) && id > 0;
}
