import { forwardRef, useEffect, useId, useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

const INPUT_SIZE_MAP = {
  large: {
    wrapper: "min-h-12 px-4 gap-2.5",
    text: "text-[18px] leading-5 font-[300] placeholder:font-[300] tracking-normal",
    icon: "h-5 w-5",
  },
  medium: {
    wrapper: "min-h-10 px-3.5 gap-2",
    text: "text-[15px] leading-5 font-[400] placeholder:font-[400] tracking-normal",
    icon: "h-4 w-4",
  },
};

const INPUT_STATE_MAP = {
  default: {
    field: "border-[var(--border)] bg-[var(--bg)]",
    label: "text-[var(--text-high-emphasis)]",
    helper: "text-[var(--text-medium-emphasis)]",
    icon: "text-[var(--icon-low-emphasis)]",
    input:
      "text-[var(--text-high-emphasis)] placeholder:text-[var(--text-low-emphasis)]",
    focusWithin: "focus-within:border-[var(--color-blue-500)]",
  },
  field: {
    field: "border-[var(--border)] bg-[var(--bg)]",
    label: "text-[var(--text-high-emphasis)]",
    helper: "text-[var(--text-medium-emphasis)]",
    icon: "text-[var(--icon-low-emphasis)]",
    input:
      "text-[var(--text-high-emphasis)] placeholder:text-[var(--text-low-emphasis)]",
    focusWithin: "focus-within:border-[var(--color-blue-500)]",
  },
  focus: {
    field: "border-[var(--color-blue-500)] bg-[var(--bg)]",
    label: "text-[var(--text-high-emphasis)]",
    helper: "text-[var(--color-blue-500)]",
    icon: "text-[var(--icon-active)]",
    input:
      "text-[var(--text-high-emphasis)] placeholder:text-[var(--text-low-emphasis)]",
    focusWithin: "",
  },
  info: {
    field: "border-cyan-500 bg-[var(--bg)]",
    label: "text-[var(--text-high-emphasis)]",
    helper: "text-cyan-500",
    icon: "text-[var(--icon-active)]",
    input:
      "text-[var(--text-high-emphasis)] placeholder:text-[var(--text-medium-emphasis)]",
    focusWithin: "",
  },
  disabled: {
    field: "border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)]",
    label: "text-[var(--text-disabled)]",
    helper: "text-[var(--text-disabled)]",
    icon: "text-[var(--icon-disabled)]",
    input:
      "text-[var(--text-disabled)] placeholder:text-[var(--text-disabled)]",
    focusWithin: "",
  },
  success: {
    field: "border-[var(--color-success-500)] bg-[var(--bg)]",
    label: "text-[var(--text-high-emphasis)]",
    helper: "text-[var(--text-success)]",
    icon: "text-[var(--icon-success)]",
    input:
      "text-[var(--text-high-emphasis)] placeholder:text-[var(--text-medium-emphasis)]",
    focusWithin: "",
  },
  warning: {
    field: "border-[var(--color-warning-500)] bg-[var(--bg)]",
    label: "text-[var(--text-high-emphasis)]",
    helper: "text-[var(--text-warning)]",
    icon: "text-[var(--icon-warning)]",
    input:
      "text-[var(--text-high-emphasis)] placeholder:text-[var(--text-medium-emphasis)]",
    focusWithin: "",
  },
  error: {
    field: "border-[var(--color-error-500)] bg-[var(--bg)]",
    label: "text-[var(--text-high-emphasis)]",
    helper: "text-[var(--text-error)]",
    icon: "text-[var(--icon-error)]",
    input:
      "text-[var(--text-high-emphasis)] placeholder:text-[var(--text-medium-emphasis)]",
    focusWithin: "",
  },
};

const Input = forwardRef(function Input(
  {
    className = "",
    defaultValue,
    disabled = false,
    helperText = "Helper Text",
    id,
    inputClassName = "",
    label = "Label",
    leftIcon: LeftIcon,
    name,
    onBlur,
    onChange,
    onFocus,
    placeholder = "Placeholder",
    required = false,
    rightIcon: RightIcon,
    size = "medium",
    state = "default",
    type = "text",
    value,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const shakeControls = useAnimationControls();
  const prefersReducedMotion = useReducedMotion();
  const inputId = id ?? generatedId;
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(
    defaultValue == null ? "" : String(defaultValue),
  );
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const currentValue = isControlled ? value : internalValue;
  const hasContent = currentValue != null && String(currentValue).length > 0;
  const alwaysShowHelperText =
    !disabled &&
    (state === "success" || state === "warning" || state === "error");
  const showHelperText =
    Boolean(helperText) && (alwaysShowHelperText || isFocused || hasContent);

  const stateKey = disabled ? "disabled" : state;
  const resolvedStateKey =
    !disabled && isFocused && (stateKey === "default" || stateKey === "field")
      ? "focus"
      : stateKey;
  const stateConfig =
    INPUT_STATE_MAP[resolvedStateKey] ?? INPUT_STATE_MAP.default;
  const sizeConfig = INPUT_SIZE_MAP[size] ?? INPUT_SIZE_MAP.medium;
  const isPasswordField = type === "password";
  const resolvedInputType =
    isPasswordField && isPasswordVisible ? "text" : type;

  useEffect(() => {
    if (resolvedStateKey === "error" && !disabled && !prefersReducedMotion) {
      void shakeControls.start({
        x: [0, -6, 6, -4, 4, -2, 2, 0],
        transition: { duration: 0.35, ease: "easeOut" },
      });
      return;
    }

    void shakeControls.set({ x: 0 });
  }, [resolvedStateKey, disabled, prefersReducedMotion, shakeControls]);

  const handleFocus = (event) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  const handleChange = (event) => {
    if (!isControlled) {
      setInternalValue(event.target.value);
    }
    onChange?.(event);
  };

  const handlePasswordMouseDown = (event) => {
    event.preventDefault();
  };

  const handlePasswordToggle = () => {
    if (disabled) return;
    setIsPasswordVisible((current) => !current);
  };

  return (
    <div className={cn("inline-grid w-full gap-1", className)}>
      <label
        htmlFor={inputId}
        className={cn("b4 !font-semibold", stateConfig.label)}
      >
        {label}
        {required ? (
          <span className="text-[var(--color-error-500)]" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>

      <motion.div
        animate={shakeControls}
        className={cn(
          "flex w-full items-center rounded-xl border transition-colors duration-200",
          sizeConfig.wrapper,
          stateConfig.field,
          stateConfig.focusWithin,
        )}
      >
        {LeftIcon ? (
          <LeftIcon
            className={cn("shrink-0", sizeConfig.icon, stateConfig.icon)}
            aria-hidden="true"
          />
        ) : null}

        <input
          {...props}
          ref={ref}
          id={inputId}
          name={name}
          type={resolvedInputType}
          required={required}
          aria-required={required}
          disabled={disabled}
          placeholder={placeholder}
          {...(isControlled ? { value } : { defaultValue })}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          className={cn(
            "w-full min-w-0 border-0 bg-transparent py-1 outline-none ring-0",
            "focus:border-0 focus:outline-none focus:ring-0",
            sizeConfig.text,
            stateConfig.input,
            inputClassName,
          )}
        />

        {isPasswordField ? (
          <button
            type="button"
            onMouseDown={handlePasswordMouseDown}
            onClick={handlePasswordToggle}
            disabled={disabled}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            className={cn(
              "shrink-0 rounded-full p-0.5 transition-colors",
              disabled
                ? "cursor-not-allowed"
                : "cursor-pointer hover:bg-neutral-100",
            )}
          >
            {isPasswordVisible ? (
              <EyeSlashIcon
                className={cn(sizeConfig.icon, stateConfig.icon)}
                aria-hidden="true"
              />
            ) : (
              <EyeIcon
                className={cn(sizeConfig.icon, stateConfig.icon)}
                aria-hidden="true"
              />
            )}
          </button>
        ) : RightIcon ? (
          <RightIcon
            className={cn("shrink-0", sizeConfig.icon, stateConfig.icon)}
            aria-hidden="true"
          />
        ) : null}
      </motion.div>

      {showHelperText ? (
        <p className={cn("b4 text-right", stateConfig.helper)}>{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
