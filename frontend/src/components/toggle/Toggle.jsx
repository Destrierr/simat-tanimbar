import { useState } from "react";
import { motion } from "framer-motion";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

const TRACK_BASE =
  "relative inline-flex h-8 w-[54px] shrink-0 items-center rounded-full border-2 border-transparent p-1 transition-all duration-150";

const THUMB_BASE =
  "pointer-events-none inline-block h-6 w-6 rounded-full transition-all duration-150";

const THUMB_MOTION = {
  type: "spring",
  stiffness: 700,
  damping: 38,
  mass: 0.7,
};

const STATIC_STATE_MAP = {
  default: {
    offTrack: "bg-[var(--color-neutral-100)]",
    offThumb: "bg-[var(--color-neutral-400)]",
    onTrack: "bg-[#F0F9FF]",
    onThumb: "bg-[#00A6F4]",
  },
  hover: {
    offTrack: "bg-[var(--color-neutral-200)]",
    offThumb: "bg-[var(--color-neutral-400)]",
    onTrack: "bg-[#DFF2FE]",
    onThumb: "bg-[#74D4FF]",
  },
  focus: {
    offTrack: "bg-[var(--color-neutral-100)] ring-3 ring-[#B8E6FE]",
    offThumb: "bg-[var(--color-neutral-400)]",
    onTrack: "bg-[#F0F9FF] ring-3 ring-[#B8E6FE]",
    onThumb: "bg-[#00A6F4]",
  },
  disabled: {
    offTrack: "bg-[var(--color-neutral-100)]",
    offThumb: "bg-[var(--color-neutral-300)]",
    onTrack: "bg-[var(--color-neutral-100)]",
    onThumb: "bg-[var(--color-neutral-300)]",
  },
};

function Toggle({
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
    const isOn = Boolean(checked);
    const isDisabled = visualState === "disabled";
    const labelColor = isDisabled
      ? "text-[var(--text-disabled)]"
      : "text-[var(--text-high-emphasis)]";

    const trackClassName = isOn ? cfg.onTrack : cfg.offTrack;
    const thumbClassName = isOn ? cfg.onThumb : cfg.offThumb;

    const switchEl = (
      <span className={cn(TRACK_BASE, trackClassName)} aria-hidden="true">
        <motion.span
          className={cn(THUMB_BASE, thumbClassName)}
          animate={{ x: isOn ? 14 : 0 }}
          transition={THUMB_MOTION}
        />
      </span>
    );

    if (!label) {
      return switchEl;
    }

    return (
      <span className="inline-flex items-center gap-3">
        {labelPosition === "left" ? (
          <span className={cn("b2", labelColor)}>{label}</span>
        ) : null}
        {switchEl}
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
  const isOn = isControlled ? checked : internalChecked;

  function handleChange(event) {
    if (!isControlled) {
      setInternalChecked(event.target.checked);
    }

    onChange?.(event);
  }

  return (
    <label
      htmlFor={id}
      className={cn(
        "group/toggle inline-flex items-center gap-3",
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
        checked={isOn}
        disabled={disabled}
        onChange={handleChange}
        className="peer/toggle sr-only"
      />

      <span
        aria-hidden="true"
        className={cn(
          TRACK_BASE,
          disabled
            ? "bg-neutral-100"
            : isOn
              ? "bg-[#F0F9FF] group-hover/toggle:bg-[#DFF2FE]"
              : "bg-neutral-100 group-hover/toggle:bg-neutral-200",
          !disabled &&
            (isOn
              ? "peer-focus/toggle:bg-[#F0F9FF] peer-focus/toggle:ring-3 peer-focus/toggle:ring-[#B8E6FE] peer-focus-visible/toggle:bg-[#F0F9FF] peer-focus-visible/toggle:ring-3 peer-focus-visible/toggle:ring-[#B8E6FE]"
              : "peer-focus/toggle:bg-neutral-100 peer-focus/toggle:ring-3 peer-focus/toggle:ring-[#B8E6FE] peer-focus-visible/toggle:bg-neutral-100 peer-focus-visible/toggle:ring-3 peer-focus-visible/toggle:ring-[#B8E6FE]"),
        )}
      >
        <motion.span
          className={cn(
            THUMB_BASE,
            disabled
              ? "bg-neutral-300"
              : isOn
                ? "bg-[#00A6F4] group-hover/toggle:bg-[#74D4FF]"
                : "bg-neutral-400 group-hover/toggle:bg-neutral-400",
          )}
          animate={{ x: isOn ? 14 : 0 }}
          transition={THUMB_MOTION}
        />
      </span>

      {label && labelPosition !== "left" ? (
        <span className={cn("b2", labelColor)}>{label}</span>
      ) : null}
    </label>
  );
}

export default Toggle;
