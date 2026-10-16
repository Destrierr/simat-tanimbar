import { useState } from "react";
import { motion } from "framer-motion";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

const RADIO_CONTAINER_BASE =
  "relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2";

const RADIO_INNER_BASE = "pointer-events-none inline-block rounded-full";

const INNER_MOTION = {
  type: "spring",
  stiffness: 700,
  damping: 38,
  mass: 0.7,
};

const CONTAINER_MOTION = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.6,
};

const SCALE_DOWN_MOTION = {
  type: "spring",
  stiffness: 600,
  damping: 35,
  mass: 0.65,
};

const STATIC_STATE_MAP = {
  default: {
    uncheckedBorder: "border-neutral-300 bg-white",
    uncheckedInner: "hidden",
    checkedBorder: "border-[var(--color-blue-500)] bg-[var(--bg)]",
    checkedInner: "h-2.5 w-2.5 bg-[var(--color-blue-500)]",
  },
  hover: {
    uncheckedBorder: "border-[var(--color-blue-500)] bg-[var(--bg)]",
    uncheckedInner: "hidden",
    checkedBorder: "border-[#74D4FF] bg-[#F0F9FF]",
    checkedInner: "h-2.5 w-2.5 bg-[var(--color-blue-500)]",
  },
  focus: {
    uncheckedBorder:
      "border-[var(--color-blue-500)] bg-[var(--bg)] ring-3 ring-[#B8E6FE]",
    uncheckedInner: "hidden",
    checkedBorder:
      "border-[var(--color-blue-500)] bg-[var(--bg)] ring-3 ring-[#B8E6FE]",
    checkedInner: "h-2.5 w-2.5 bg-[var(--color-blue-500)]",
  },
  disabled: {
    uncheckedBorder: "border-neutral-300 bg-neutral-100",
    uncheckedInner: "hidden",
    checkedBorder: "border-neutral-300 bg-neutral-100",
    checkedInner: "h-2.5 w-2.5 bg-neutral-300",
  },
};

function RadioButton({
  checked,
  className = "",
  defaultChecked = false,
  disabled = false,
  id,
  label,
  labelPosition = "right",
  name,
  onChange,
  value,
  visualState,
}) {
  if (visualState) {
    const cfg = STATIC_STATE_MAP[visualState] ?? STATIC_STATE_MAP.default;
    const isChecked = Boolean(checked);
    const isDisabled = visualState === "disabled";
    const labelColor = isDisabled
      ? "text-[var(--text-disabled)]"
      : "text-[var(--text-high-emphasis)]";

    const borderClassName = isChecked ? cfg.checkedBorder : cfg.uncheckedBorder;
    const innerClassName = isChecked ? cfg.checkedInner : cfg.uncheckedInner;

    const radioEl = (
      <motion.div
        layout
        className={cn(RADIO_CONTAINER_BASE, borderClassName)}
        animate={{ scale: isChecked ? 1.15 : 1 }}
        transition={isChecked ? CONTAINER_MOTION : SCALE_DOWN_MOTION}
      >
        <motion.span
          className={cn(RADIO_INNER_BASE, innerClassName)}
          animate={{ scale: isChecked ? 1 : 0 }}
          transition={isChecked ? INNER_MOTION : SCALE_DOWN_MOTION}
        />
      </motion.div>
    );

    if (!label) {
      return radioEl;
    }

    return (
      <span className="inline-flex items-center gap-3">
        {labelPosition === "left" ? (
          <span className={cn("b2", labelColor)}>{label}</span>
        ) : null}
        {radioEl}
        {labelPosition !== "left" ? (
          <span className={cn("b2", labelColor)}>{label}</span>
        ) : null}
      </span>
    );
  }

  const labelColor = disabled
    ? "text-[var(--text-disabled)]"
    : "text-[var(--text-high-emphasis)]";
  const isControlled = typeof checked === "boolean";
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = isControlled ? checked : internalChecked;

  function handleChange(event) {
    if (disabled) return;

    if (!isControlled) {
      setInternalChecked(!internalChecked);
    }

    // Manually trigger onChange with toggled checked state
    const newEvent = {
      ...event,
      target: {
        ...event.target,
        checked: !isChecked,
      },
    };
    onChange?.(newEvent);
  }

  return (
    <label
      htmlFor={id}
      className={cn(
        "group/radio inline-flex items-center gap-3",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      {label && labelPosition === "left" ? (
        <span className={cn("b2", labelColor)}>{label}</span>
      ) : null}

      <input
        type="checkbox"
        id={id}
        name={name}
        value={value}
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
        className="peer/radio sr-only"
      />

      <motion.div
        layout
        aria-hidden="true"
        className={cn(
          RADIO_CONTAINER_BASE,
          disabled
            ? "border-neutral-300 bg-neutral-100"
            : isChecked
              ? "border-[var(--color-blue-500)] bg-[var(--bg)] group-hover/radio:border-[#74D4FF] group-hover/radio:bg-[#F0F9FF]"
              : "border-neutral-300 bg-white group-hover/radio:border-[var(--color-blue-500)]",
          !disabled &&
            (isChecked
              ? "peer-focus/radio:border-[var(--color-blue-500)] peer-focus/radio:ring-3 peer-focus/radio:ring-[#B8E6FE] peer-focus-visible/radio:border-[var(--color-blue-500)] peer-focus-visible/radio:ring-3 peer-focus-visible/radio:ring-[#B8E6FE]"
              : "peer-focus/radio:border-[var(--color-blue-500)] peer-focus/radio:ring-3 peer-focus/radio:ring-[#B8E6FE] peer-focus-visible/radio:border-[var(--color-blue-500)] peer-focus-visible/radio:ring-3 peer-focus-visible/radio:ring-[#B8E6FE]"),
        )}
        animate={{ scale: isChecked ? 1.15 : 1 }}
        transition={isChecked ? CONTAINER_MOTION : SCALE_DOWN_MOTION}
      >
        <motion.span
          className={cn(
            RADIO_INNER_BASE,
            disabled
              ? isChecked
                ? "h-2.5 w-2.5 bg-neutral-300"
                : "hidden"
              : isChecked
                ? "h-2.5 w-2.5 bg-[var(--color-blue-500)] group-hover/radio:bg-[var(--color-blue-500)]"
                : "hidden",
          )}
          animate={{ scale: isChecked ? 1 : 0 }}
          transition={isChecked ? INNER_MOTION : SCALE_DOWN_MOTION}
        />
      </motion.div>

      {label && labelPosition !== "left" ? (
        <span className={cn("b2", labelColor)}>{label}</span>
      ) : null}
    </label>
  );
}

export default RadioButton;
