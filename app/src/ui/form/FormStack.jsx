import { FORM_STACK_DENSITY, FORM_STACK_LAYOUT } from '@/lib/constants/formLayout';

/**
 * Vertical or responsive grid layout for form fields.
 * Replaces ad-hoc `space-y-*` / `gap-*` on `<form>` elements.
 *
 * @param {'default' | 'compact'} [density='default'] — 24px or 16px between fields
 * @param {'stack' | 'grid-2' | 'grid-3'} [layout='stack']
 * @param {keyof JSX.IntrinsicElements | React.ElementType} [as='div']
 */
export function FormStack({ density = 'default', layout = 'stack', as: Component = 'div', className = '', children, ...props }) {
  const densityClass = FORM_STACK_DENSITY[density] ?? FORM_STACK_DENSITY.default;
  const layoutClass = FORM_STACK_LAYOUT[layout] ?? FORM_STACK_LAYOUT.stack;

  return (
    <Component className={`${layoutClass} ${densityClass} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}
