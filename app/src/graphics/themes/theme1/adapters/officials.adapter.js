/**
 * Officials commands — processor: processOfficialsBanner
 * Output shape: { heading, text, names }
 */
import { officialsHeadingForCommand } from './presentationLabels';

export function toOfficialsData(props) {
  const names = Array.isArray(props.names) ? props.names : [];
  const text = props.text ?? '';
  if (!names.length && !text) return null;

  return {
    heading: officialsHeadingForCommand(props.commandKey, props.heading),
    subtitle: props.subtitle ?? 'MATCH',
    names,
    text,
  };
}
