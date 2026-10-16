import { XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

const BADGE_SIZE_MAP = {
  large: {
    pill: "min-h-8 px-4 gap-1.5",
    clip: "h-8 w-8",
    text: "text-[14px] leading-5 font-[600]",
    icon: "h-4 w-4",
    close: "h-4 w-4",
  },
  small: {
    pill: "min-h-6 px-2.5 gap-1",
    clip: "h-6 w-6",
    text: "text-[12px] leading-4 font-[600]",
    icon: "h-3.5 w-3.5",
    close: "h-3.5 w-3.5",
  },
  medium: {
    pill: "min-h-7 px-3 gap-1.5",
    clip: "h-7 w-7",
    text: "text-[13px] leading-5 font-[600]",
    icon: "h-4 w-4",
    close: "h-4 w-4",
  },
};

const BADGE_TONE_MAP = {
  default: {
    solid: "border-[var(--color-blue-500)] bg-[var(--color-blue-500)]",
    outline: "border-[var(--color-blue-500)] bg-[var(--color-blue-50)]",
    solidText: "text-[var(--text-inverse)]",
    outlineText: "text-[var(--text-active)]",
  },
  info: {
    solid: "border-cyan-500 bg-cyan-500",
    outline: "border-cyan-500 bg-cyan-50",
    solidText: "text-[var(--text-inverse)]",
    outlineText: "text-cyan-500",
  },
  neutral: {
    solid: "border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)]",
    outline: "border-[var(--color-neutral-300)] bg-[var(--bg)]",
    solidText: "text-[var(--text-medium-emphasis)]",
    outlineText: "text-[var(--text-medium-emphasis)]",
  },
  success: {
    solid: "border-[var(--color-success-500)] bg-[var(--color-success-500)]",
    outline:
      "border-[var(--color-success-500)] bg-[color-mix(in_srgb,var(--color-success-100)_82%,var(--color-white)_18%)]",
    solidText: "text-[var(--text-inverse)]",
    outlineText: "text-[var(--text-success)]",
  },
  warning: {
    solid: "border-[var(--color-warning-500)] bg-[var(--color-warning-500)]",
    outline:
      "border-[var(--color-warning-500)] bg-[color-mix(in_srgb,var(--color-warning-100)_80%,var(--color-white)_20%)]",
    solidText: "text-[var(--text-inverse)]",
    outlineText: "text-[var(--text-warning)]",
  },
  error: {
    solid: "border-[var(--color-error-500)] bg-[var(--color-error-500)]",
    outline:
      "border-[var(--color-error-500)] bg-[color-mix(in_srgb,var(--color-error-100)_82%,var(--color-white)_18%)]",
    solidText: "text-[var(--text-inverse)]",
    outlineText: "text-[var(--text-error)]",
  },
};

function Badge({
  className = "",
  closeIcon: CloseIcon = XMarkIcon,
  closeLabel,
  closeOnlyLabel = "Hapus badge",
  icon: Icon,
  label = "Badge",
  onRemove,
  removable = false,
  shape = "pill",
  size = "medium",
  tone = "default",
  title,
  variant = "solid",
}) {
  const sizeConfig = BADGE_SIZE_MAP[size] ?? BADGE_SIZE_MAP.medium;
  const toneConfig = BADGE_TONE_MAP[tone] ?? BADGE_TONE_MAP.default;
  const isOutline = variant === "outline";
  const isClip = shape === "clip";
  const textTone = isOutline ? toneConfig.outlineText : toneConfig.solidText;
  const toneSurface = isOutline ? toneConfig.outline : toneConfig.solid;
  const removeLabel = closeLabel ?? `Hapus badge ${label}`;
  const pillRemoveHoverClass = isOutline
    ? "hover:bg-black/10"
    : "hover:bg-white/20";

  if (isClip) {
    if (removable && onRemove) {
      return (
        <button
          type="button"
          onClick={onRemove}
          aria-label={closeLabel ?? closeOnlyLabel}
          title={title}
          className={cn(
            "inline-flex cursor-pointer items-center justify-center rounded-full border",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
            sizeConfig.clip,
            toneSurface,
            textTone,
            className,
          )}
        >
          <CloseIcon className={sizeConfig.close} aria-hidden="true" />
        </button>
      );
    }

    return (
      <span
        title={title}
        className={cn(
          "inline-flex items-center justify-center rounded-full border",
          sizeConfig.clip,
          toneSurface,
          textTone,
          className,
        )}
      >
        <CloseIcon className={sizeConfig.close} aria-hidden="true" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border",
        sizeConfig.pill,
        toneSurface,
        textTone,
        className,
      )}
      title={title}
    >
      {Icon ? (
        <Icon className={cn("shrink-0", sizeConfig.icon)} aria-hidden="true" />
      ) : null}

      <span className={cn("max-w-[14ch] truncate", sizeConfig.text)}>
        {label}
      </span>

      {removable && onRemove ? (
        <motion.button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className={cn(
            "-mr-0.5 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full p-0.5",
            "transition-colors duration-150",
            pillRemoveHoverClass,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
          )}
        >
          <CloseIcon className={sizeConfig.close} aria-hidden="true" />
        </motion.button>
      ) : null}
    </span>
  );
}

export default Badge;
