import { fsChart } from '../../config';
import { CHART_SUB, CHART_TITLE, fsFont } from './chartTypographyStyles';

/** Shared FS chart page header — worm, Manhattan, wagon wheel. */
export function ChartHeader({ title, sub }) {
  return (
    <div className="absolute top-14 right-[520px] left-[70px] z-[3]">
      <h2 className={CHART_TITLE} style={fsFont(fsChart.title)}>
        {title}
      </h2>
      {sub ? (
        <p className={CHART_SUB} style={fsFont(fsChart.sub)}>
          {sub}
        </p>
      ) : null}
    </div>
  );
}
