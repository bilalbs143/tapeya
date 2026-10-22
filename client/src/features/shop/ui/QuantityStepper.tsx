import { NumberStepper, type NumberStepperProps } from '@/shared/ui/NumberStepper';

type QuantityStepperProps = Pick<NumberStepperProps, 'value' | 'min' | 'max' | 'onChange' | 'className' | 'disabled'>;

/** Compact product-qty control — thin wrapper over shared NumberStepper. */
export function QuantityStepper({ value = 1, min = 1, max = 10, onChange, className, disabled }: QuantityStepperProps) {
  return (
    <NumberStepper
      variant="inline"
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
