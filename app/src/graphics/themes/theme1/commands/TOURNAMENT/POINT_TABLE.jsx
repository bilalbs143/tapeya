import { toPointTableData } from '../../adapters/pointTable.adapter';
import { PointTableGraphic } from '../../layouts/full-screen/PointTableGraphic';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function POINT_TABLE({ ...props }) {
  const table = toPointTableData(props);
  if (!table) return null;

  return (
    <BroadcastShell stage="full">
      <PointTableGraphic title={table.title} sub={table.sub} data={table.data} />
    </BroadcastShell>
  );
}
