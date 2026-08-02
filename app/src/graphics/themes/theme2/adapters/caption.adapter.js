/** Custom caption LT — title + description (broadcast casing). */
function fixtureBarText(value) {
  const text = String(value ?? '').trim();
  return text ? text.toUpperCase() : '';
}

/**
 * @param {Record<string, unknown>} props
 */
export function toCustomCaptionData(props) {
  const title = fixtureBarText(props.title);
  const description = fixtureBarText(props.description);
  if (!title && !description) return null;
  return { title, description };
}
