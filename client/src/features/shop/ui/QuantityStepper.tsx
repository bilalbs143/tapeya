import { NumberStepper, type NumberStepperProps } from '@/shared/ui/NumberStepper';

type QuantityStepperProps = Pick<NumberStepperProps, 'value' | 'min' | 'max' | 'onChange' | 'className' | 'disabled'>;

/** Full-width product qty — same − / value / + field as overs / players. */
export function QuantityStepper({ value = 1, min = 1, max = 10, onChange, className, disabled }: QuantityStepperProps) {
  return (
    <NumberStepper
      value={value}
      min={min}
      max={max}
      onChange={(next) => onChange?.(next)}
      decreaseLabel="Decrease Quantity"
      increaseLabel="Increase Quantity"
      disabled={disabled}
      className={className}
    />
  );
}
