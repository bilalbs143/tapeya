/**
 * POINT_TABLE processor output → PointTableGraphic data shape.
 */
import { assets } from '../config';
import { tournamentSub } from './_shared';
import { POINT_TABLE_TITLE } from './presentationLabels';

/**
 * @param {Record<string, unknown>} props
 */
export function toPointTableData(props) {
  const rows = Array.isArray(props.rows) ? props.rows : [];
  if (!rows.length) return null;

  const qualifyCount = props.qualifyCount ?? props.qualify_count ?? 4;
  const defaultFooter = `TOP ${qualifyCount} TEAMS QUALIFY FOR PLAYOFFS`;

  return {
    title: props.title ?? POINT_TABLE_TITLE,
    sub: props.subtitle ?? props.sub ?? tournamentSub(props),
    data: {
      rows: rows.map((row, index) => ({
        rank: row.rank ?? index + 1,
        code: row.code ?? String(index + 1),
        name: row.name ?? '',
        played: row.played ?? 0,
        won: row.won ?? 0,
        lost: row.lost ?? 0,
        nr: row.nr ?? 0,
        pts: row.pts ?? 0,
        nrr: row.nrr ?? null,
        accent: row.accent ?? null,
      })),
      qualifyCount,
      footerText: props.footerText ?? props.footer_text ?? defaultFooter,
      logoUrl: props.tournamentLogoUrl ?? assets.brandLogoWhite,
    },
  };
}
