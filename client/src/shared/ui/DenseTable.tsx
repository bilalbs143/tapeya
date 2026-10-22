import {
  type ComponentPropsWithoutRef,
  createContext,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  useContext,
  useMemo,
} from 'react';

import { cn } from '@/shared/lib/cn';
import { ChevronDownIcon } from '@/shared/ui/icons';
import { Skeleton } from '@/shared/ui/states';

/** CSS-grid table with shared column contract + ARIA roles. */
export type DenseTableColumn = {
  key: string;
  label: string;
  width?: string | undefined;
  align?: 'right' | undefined;
  mono?: boolean | undefined;
  sortable?: boolean | undefined;
  hideBelow?: 'tab' | undefined;
  emphasis?: 'primary' | undefined;
};

type Density = 'comfortable' | 'compact';

type TableCtxValue = {
  columns: DenseTableColumn[];
  density: Density;
  stickyFirst: boolean;
};

const TableCtx = createContext<TableCtxValue>({
  columns: [],
  density: 'comfortable',
  stickyFirst: false,
});

const DENSITY = {
  comfortable: { head: 'h-9', row: 'min-h-11 py-2', text: 'text-2xs' },
  compact: { head: 'h-8', row: 'min-h-9 py-1.5', text: 'text-3xs' },
} as const;

function gridStyle(columns: DenseTableColumn[]): CSSProperties {
  return {
    gridTemplateColumns: columns
      .map((c) => c.width || (c.key === 'player' || c.key === 'name' ? 'minmax(0,1fr)' : '52px'))
      .join(' '),
  };
}

const hideClass = (col: DenseTableColumn) => (col.hideBelow === 'tab' ? 'hidden tab:block' : null);

const STICKY_CELL = 'sticky left-0 z-10 bg-inherit -ml-3 pl-3 pr-2';
const stickyCell = (i: number, sticky: boolean) => (sticky && i === 0 ? STICKY_CELL : null);

type DenseTableProps = {
  columns?: DenseTableColumn[] | undefined;
  density?: Density | undefined;
  stickyFirst?: boolean | undefined;
  scroll?: boolean | undefined;
  minWidth?: number | string | undefined;
  className?: string | undefined;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

export function DenseTable({
  className,
  columns = [],
  density = 'comfortable',
  stickyFirst = false,
  scroll = false,
  minWidth,
  children,
  ...props
}: DenseTableProps) {
  const ctx = useMemo(() => ({ columns, density, stickyFirst }), [columns, density, stickyFirst]);

  const table = (
    <div role="table" style={scroll && minWidth ? { minWidth } : undefined}>
      {children}
    </div>
  );

  return (
    <TableCtx.Provider value={ctx}>
      <div className={cn('border-border-subtle bg-surface overflow-hidden rounded-card border', className)} {...props}>
        {scroll ? <div className="no-scrollbar overflow-x-auto overscroll-x-contain">{table}</div> : table}
      </div>
    </TableCtx.Provider>
  );
}

type DenseTableHeaderProps = {
  columns?: DenseTableColumn[] | undefined;
  density?: Density | undefined;
  stickyFirst?: boolean | undefined;
  sortKey?: string | undefined;
  sortDir?: 'asc' | 'desc' | undefined;
  onSortChange?: ((key: string, dir: 'asc' | 'desc') => void) | undefined;
  className?: string | undefined;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

export function DenseTableHeader({
  className,
  columns: colsProp,
  density: densityProp,
  stickyFirst: stickyProp,
  sortKey,
  sortDir = 'desc',
  onSortChange,
  ...props
}: DenseTableHeaderProps) {
  const ctx = useContext(TableCtx);
  const columns = colsProp ?? ctx.columns;
  const density = densityProp ?? ctx.density;
  const sticky = stickyProp ?? ctx.stickyFirst;
  const d = DENSITY[density] ?? DENSITY.comfortable;

  return (
    <div
      role="row"
      className={cn(
        'bg-page-deep font-mono text-dim sticky top-0 z-20 grid items-center gap-2 px-3 text-4xs font-bold tracking-eyebrow uppercase',
        d.head,
        className
      )}
      style={gridStyle(columns)}
      {...props}
    >
      {columns.map((col, i) => {
        const active = sortKey === col.key;
        const sortable = col.sortable && typeof onSortChange === 'function';
        const right = col.align === 'right';

        return (
          <span
            key={col.key}
            role="columnheader"
            aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : sortable ? 'none' : undefined}
            className={cn(
              'min-w-0 truncate',
              right && 'text-right',
              col.emphasis === 'primary' && 'text-muted',
              sticky && i === 0 && 'bg-page-deep sticky left-0 z-10 -ml-3 pl-3 pr-2',
              hideClass(col)
            )}
          >
            {sortable ? (
              <button
                type="button"
                onClick={() => onSortChange(col.key, active && sortDir === 'desc' ? 'asc' : 'desc')}
                className={cn(
                  'focus-visible:outline-brand -mx-1 inline-flex max-w-full items-center rounded px-1 uppercase focus-visible:outline-2',
                  right && 'flex-row-reverse',
                  active ? 'text-brand-text' : 'hover:text-body'
                )}
              >
                <span className="truncate">{col.label}</span>
                <ChevronDownIcon
                  className={cn(
                    'mx-0.5 h-2.5 w-2.5 shrink-0 transition-transform',
                    active ? 'text-brand-text' : 'text-dim/40',
                    active && sortDir === 'asc' && 'rotate-180'
                  )}
                  strokeWidth={3}
                  aria-hidden
                />
              </button>
            ) : (
              col.label
            )}
          </span>
        );
      })}
    </div>
  );
}

export type DenseTableCell = ReactNode | { node: ReactNode; className?: string | undefined };

type DenseTableRowProps = {
  columns?: DenseTableColumn[] | undefined;
  density?: Density | undefined;
  stickyFirst?: boolean | undefined;
  cells?: Record<string, DenseTableCell> | undefined;
  selected?: boolean | undefined;
  onClick?: (() => void) | undefined;
  as?: ElementType | undefined;
  className?: string | undefined;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onClick'>;

export function DenseTableRow({
  className,
  columns: colsProp,
  density: densityProp,
  stickyFirst: stickyProp,
  cells,
  selected = false,
  onClick,
  as,
  ...props
}: DenseTableRowProps) {
  const ctx = useContext(TableCtx);
  const columns = colsProp ?? ctx.columns;
  const density = densityProp ?? ctx.density;
  const sticky = stickyProp ?? ctx.stickyFirst;
  const d = DENSITY[density] ?? DENSITY.comfortable;
  const Comp = (as ?? (onClick ? 'button' : 'div')) as ElementType;
  const interactive = Boolean(onClick) || Boolean(as);

  return (
    <Comp
      role="row"
      type={Comp === 'button' ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'border-border-subtle grid w-full items-center gap-2 border-t px-3 text-left',
        selected ? 'bg-brand/12' : 'bg-surface',
        d.row,
        interactive &&
          'hover:bg-surface-raised focus-visible:outline-brand focus-visible:outline-2 focus-visible:-outline-offset-2',
        className
      )}
      style={gridStyle(columns)}
      {...props}
    >
      {columns.map((col, i) => {
        const cell = cells?.[col.key];
        const right = col.align === 'right';

        if (cell != null && typeof cell === 'object' && !Array.isArray(cell) && 'node' in cell) {
          return (
            <span
              key={col.key}
              role="cell"
              className={cn('min-w-0', right && 'text-right', stickyCell(i, sticky), hideClass(col), cell.className)}
            >
              {cell.node}
            </span>
          );
        }

        return (
          <span
            key={col.key}
            role="cell"
            className={cn(
              'min-w-0 truncate',
              right && 'text-right',
              stickyCell(i, sticky),
              hideClass(col),
              col.mono || right ? 'font-mono text-2xs tabular-nums' : cn(d.text, 'font-semibold text-ink'),
              col.emphasis === 'primary' ? 'font-bold text-ink' : col.mono || right ? 'text-body' : null
            )}
          >
            {cell as ReactNode}
          </span>
        );
      })}
    </Comp>
  );
}

type DenseTableSkeletonProps = {
  columns?: DenseTableColumn[] | undefined;
  density?: Density | undefined;
  rows?: number | undefined;
};

export function DenseTableSkeleton({ columns: colsProp, density: densityProp, rows = 6 }: DenseTableSkeletonProps) {
  const ctx = useContext(TableCtx);
  const columns = colsProp ?? ctx.columns;
  const d = DENSITY[densityProp ?? ctx.density] ?? DENSITY.comfortable;

  return (
    <div aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn('border-border-subtle bg-surface grid items-center gap-2 border-t px-3', d.row)}
          style={gridStyle(columns)}
        >
          {columns.map((col) => (
            <Skeleton
              key={col.key}
              className={cn('h-2.5', col.align === 'right' ? 'ml-auto w-6' : 'w-full max-w-[110px]')}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

type DenseTableFooterProps = {
  className?: string | undefined;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

export function DenseTableFooter({ className, children, ...props }: DenseTableFooterProps) {
  return (
    <div
      className={cn(
        'border-border-subtle bg-page-deep flex items-center justify-between gap-3 border-t px-3 py-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
