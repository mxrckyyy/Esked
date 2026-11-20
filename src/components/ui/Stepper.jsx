import { Button } from './Button.jsx'

/**
 * Stepper — increment/decrement control with value display.
 *
 * Props:
 *   value       – current numeric value
 *   onChange     – (newValue: number) => void
 *   min         – minimum value (default 0.5)
 *   max         – maximum value (default 3)
 *   step        – increment/decrement amount (default 0.25)
 *   formatValue – (value) => string (default: percentage)
 *   label       – accessible label for the group
 *   onReset     – optional reset callback
 *   className   – extra classes on outer wrapper
 */
export function Stepper({
  value = 1,
  onChange,
  min = 0.5,
  max = 3,
  step = 0.25,
  formatValue,
  label = 'Value',
  onReset,
  className = '',
}) {
  const display = formatValue ? formatValue(value) : `${Math.round(value * 100)}%`

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      role="group"
      aria-label={label}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange?.(Math.max(min, value - step))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
      >
        −
      </Button>
      <span className="min-w-12 text-center text-sm tabular-nums text-ink">
        {display}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange?.(Math.min(max, value + step))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
      >
        +
      </Button>
      {onReset ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          aria-label={`Reset ${label}`}
        >
          Reset
        </Button>
      ) : null}
    </div>
  )
}
