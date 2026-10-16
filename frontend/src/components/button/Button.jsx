import { motion } from "framer-motion";

const BUTTON_SIZE_MAP = {
  large: {
    container: "min-h-12 gap-2 px-6 text-[16px] leading-5",
    iconOnly: "h-12 w-12",
    icon: "h-5 w-5",
    spinner: "button-spinner--lg",
  },

  medium: {
    container: "min-h-10 gap-2 px-5 text-[14px] leading-4",
    iconOnly: "h-10 w-10",
    icon: "h-4 w-4",
    spinner: "button-spinner--md",
  },

  small: {
    container: "min-h-8 gap-1.5 px-4 text-[12px] leading-4",
    iconOnly: "h-8 w-8",
    icon: "h-3 w-3",
    spinner: "button-spinner--sm",
  },
};

const BUTTON_VARIANT_MAP = {
  primary: {
    interactive:
      "border-transparent bg-[var(--color-blue-700)] text-[var(--text-inverse)] hover:bg-[var(--color-blue-800)]",

    hover:
      "border-transparent bg-[var(--color-blue-700)] text-[var(--text-inverse)]",

    focus:
      "border-transparent bg-[var(--color-blue-500)] text-[var(--text-inverse)] outline outline-2 outline-offset-2 outline-[var(--color-blue-300)]",

    focusVisible:
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-300)]",

    disabled:
      "border-transparent bg-[var(--color-neutral-100)] text-[var(--text-disabled)]",

    loading:
      "border-transparent bg-[var(--color-blue-500)] text-[var(--text-inverse)]",
  },

  secondary: {
    interactive:
      "border-[var(--color-blue-500)] bg-[var(--bg)] text-[var(--text-active)] hover:bg-[var(--color-blue-50)]",

    hover:
      "border-[var(--color-blue-500)] bg-[var(--color-blue-50)] text-[var(--text-active)]",

    focus:
      "border-[var(--color-blue-500)] bg-[var(--bg)] text-[var(--text-active)] outline outline-2 outline-offset-2 outline-[var(--color-blue-300)]",

    focusVisible:
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-300)]",

    disabled:
      "border-[var(--color-neutral-200)] bg-[var(--bg)] text-[var(--text-disabled)]",

    loading:
      "border-[var(--color-blue-500)] bg-[var(--bg)] text-[var(--text-active)]",
  },

  tertiary: {
    interactive:
      "border-transparent bg-transparent text-[var(--text-active)] hover:bg-[var(--color-blue-50)]",

    hover:
      "border-transparent bg-[var(--color-blue-50)] text-[var(--text-active)]",

    focus:
      "border-transparent bg-transparent text-[var(--text-active)] shadow-[0_0_0_3px_var(--color-sky-200)]",

    focusVisible:
      "focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--color-sky-200)]",

    disabled: "border-transparent bg-transparent text-[var(--text-disabled)]",

    loading: "border-transparent bg-transparent text-[var(--text-active)]",
  },
};

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Button({
  children,
  text = "Button",
  className = "",
  disabled = false,
  iconOnly = false,
  icon: Icon,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  loading = false,
  size = "medium",
  type = "button",
  variant = "primary",
  visualState = "default",
  ...props
}) {
  const sizeConfig = BUTTON_SIZE_MAP[size] ?? BUTTON_SIZE_MAP.medium;

  const variantConfig =
    BUTTON_VARIANT_MAP[variant] ?? BUTTON_VARIANT_MAP.primary;

  const isLoading = loading || visualState === "loading";

  const isDisabled = disabled || visualState === "disabled";

  const isNonInteractive = isDisabled || isLoading;

  const enableInteractiveMotion =
    !isNonInteractive && visualState === "default";

  let visualClassName = variantConfig.interactive;

  if (isDisabled) {
    visualClassName = variantConfig.disabled;
  } else if (isLoading) {
    visualClassName = variantConfig.loading;
  } else if (visualState === "focus") {
    visualClassName = variantConfig.focus;
  } else if (visualState === "hover") {
    visualClassName = variantConfig.hover;
  }

  /*
   * ============================================
   * BUTTON BASE
   * ============================================
   *
   * inline-flex + items-center
   * memastikan icon dan teks sejajar.
   */
  const baseClassName = cn(
    "inline-flex shrink-0 select-none",
    "items-center justify-center",
    "rounded-xl border",
    "whitespace-nowrap",
    "font-bold tracking-normal",
    "transition-colors duration-200",
    "leading-none",
    isNonInteractive ? "cursor-not-allowed" : "cursor-pointer",
    !isDisabled && variantConfig.focusVisible,
    iconOnly ? sizeConfig.iconOnly : sizeConfig.container,
    visualClassName,
    className,
  );

  /*
   * ============================================
   * ACCESSIBLE LABEL
   * ============================================
   */
  const accessibleLabel =
    props["aria-label"] ??
    (typeof children === "string"
      ? children
      : typeof text === "string"
        ? text
        : undefined);

  /*
   * ============================================
   * BUTTON CONTENT
   * ============================================
   */
  const content = isLoading ? (
    <span
      className={cn(
        "button-spinner",
        `button-spinner--${variant}`,
        sizeConfig.spinner,
      )}
      aria-hidden="true"
    />
  ) : iconOnly ? (
    /*
     * ICON ONLY
     */
    Icon ? (
      <Icon className={sizeConfig.icon} aria-hidden="true" />
    ) : (
      children
    )
  ) : children !== undefined && children !== null ? (
    /*
     * CUSTOM CHILDREN
     *
     * Jangan dibungkus <span>.
     *
     * Contoh:
     *
     * <Button>
     *   <Icon ... />
     *   Tambah Aset
     * </Button>
     *
     * Icon dan teks akan menjadi
     * flex item yang sejajar.
     */
    children
  ) : (
    /*
     * DEFAULT CONTENT
     */
    <>
      {LeftIcon ? (
        <LeftIcon className={sizeConfig.icon} aria-hidden="true" />
      ) : null}

      <span className="leading-none">{text}</span>

      {RightIcon ? (
        <RightIcon className={sizeConfig.icon} aria-hidden="true" />
      ) : null}
    </>
  );

  return (
    <motion.button
      {...props}
      type={type}
      disabled={isNonInteractive}
      aria-busy={isLoading}
      aria-disabled={isNonInteractive}
      aria-label={isLoading || iconOnly ? accessibleLabel : props["aria-label"]}
      className={baseClassName}
      whileHover={enableInteractiveMotion ? { y: -2, scale: 1.02 } : undefined}
      whileTap={enableInteractiveMotion ? { scale: 0.95 } : undefined}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.6,
      }}
    >
      {content}
    </motion.button>
  );
}

export default Button;
