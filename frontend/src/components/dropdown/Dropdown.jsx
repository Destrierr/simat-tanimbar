import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Dropdown({
  className = "",
  defaultValue,
  disabled = false,
  disabledHelperText = "",
  focusHelperText = "",
  helperText = "",
  helperTextClassName = "",
  hoverHelperText = "",
  id,
  leftIcon: LeftIcon,
  onChange,
  options = [],
  searchPlaceholder = "Search",
  searchable = false,
  placeholder = "Pilih",
  renderTrigger,
  rightIcon: RightIcon,
  variant = "default",
  width = "100%",
  value,
}) {
  const generatedId = useId();
  const dropdownId = id ?? generatedId;
  const listboxId = `${dropdownId}-listbox`;
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [triggerQuery, setTriggerQuery] = useState("");

  const selectedValue = isControlled ? value : internalValue;
  const isPanelVariant = variant === "panel";
  const showMenuSearch = searchable || isPanelVariant;
  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue),
    [options, selectedValue],
  );
  const hasSelectedOption = Boolean(selectedOption);

  const activeQuery = isPanelVariant
    ? searchQuery
    : searchQuery.trim()
      ? searchQuery
      : triggerQuery;

  const filteredOptions = useMemo(() => {
    const query = activeQuery.trim().toLowerCase();
    if (!query) return options;

    return options.filter((option) =>
      String(option.label).toLowerCase().includes(query),
    );
  }, [activeQuery, options]);

  const menuMaxHeight = useMemo(() => {
    const visibleItems = Math.min(5, Math.max(filteredOptions.length, 1));
    const itemHeight = 40;
    const menuPadding = 8;
    const searchArea = showMenuSearch ? 56 : 0;

    return `${visibleItems * itemHeight + menuPadding + searchArea}px`;
  }, [filteredOptions.length, showMenuSearch]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && searchQuery) {
      setSearchQuery("");
    }
  }, [isOpen, searchQuery]);

  useEffect(() => {
    if (isPanelVariant) return;
    setTriggerQuery(selectedOption?.label ?? "");
  }, [isPanelVariant, selectedOption]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((current) => !current);
  };

  const handleSelect = (option, event) => {
    if (option.disabled) return;

    if (isPanelVariant && selectedValue === option.value) {
      if (!isControlled) {
        setInternalValue(undefined);
      }
      onChange?.(null, event);
      return;
    }

    if (!isControlled) {
      setInternalValue(option.value);
    }

    onChange?.(option, event);
    setIsOpen(false);
    setTriggerQuery(option.label);
    setSearchQuery("");
    buttonRef.current?.focus();
  };

  const handleClearSelection = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;

    if (!isControlled) {
      setInternalValue(undefined);
    }

    setTriggerQuery("");
    setSearchQuery("");
    onChange?.(null, event);
    setIsOpen(false);

    if (!isPanelVariant) {
      inputRef.current?.focus();
    } else {
      buttonRef.current?.focus();
    }
  };

  const resolvedHelperText = disabled
    ? disabledHelperText
    : isOpen || isFocused
      ? focusHelperText || hoverHelperText || helperText
      : isHovered
        ? hoverHelperText || helperText
        : "";

  const isActiveTriggerState = !disabled && (isOpen || isHovered || isFocused);

  const triggerContent = renderTrigger ? (
    renderTrigger({
      disabled,
      isOpen,
      selectedOption,
      toggle: handleToggle,
    })
  ) : (
    <div
      className={cn(
        "inline-flex h-10 w-full items-center gap-2 rounded-lg px-3",
        "transition-colors duration-200",
        disabled
          ? "cursor-not-allowed border border-neutral-200 bg-neutral-100 text-[var(--text-disabled)] dark:border-slate-700 dark:bg-slate-800"
          : isActiveTriggerState
            ? "border border-[var(--color-blue-500)] bg-[var(--bg)] text-[var(--text-high-emphasis)]"
            : "border border-[var(--border)] bg-[var(--bg)] text-[var(--text-medium-emphasis)]",
        !disabled
          ? "focus-within:border-[var(--color-blue-500)] focus-within:ring-2 focus-within:ring-[#DFF2FE] dark:focus-within:ring-slate-600"
          : "",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {LeftIcon ? (
        <LeftIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
      ) : null}

      {isPanelVariant ? (
        <>
          <button
            ref={buttonRef}
            id={dropdownId}
            type="button"
            disabled={disabled}
            onClick={handleToggle}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={isOpen ? listboxId : undefined}
            className="flex min-h-9 w-full flex-1 items-center gap-2 bg-transparent text-left"
          >
            <span
              className={cn(
                "flex-1 truncate text-left text-[15px] leading-5 font-normal",
                hasSelectedOption
                  ? "text-[var(--text-high-emphasis)]"
                  : isActiveTriggerState
                    ? "text-[var(--text-medium-emphasis)]"
                    : "text-[var(--text-low-emphasis)]",
              )}
            >
              {selectedOption?.label ?? placeholder}
            </span>

            {RightIcon ? (
              <RightIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : null}
          </button>

          <button
            type="button"
            onClick={hasSelectedOption ? handleClearSelection : handleToggle}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="-mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full focus-visible:outline-none"
            aria-label={hasSelectedOption ? "Hapus pilihan" : "Buka dropdown"}
          >
            {hasSelectedOption ? (
              <XMarkIcon
                className="h-4 w-4 shrink-0 text-[var(--icon-low-emphasis)]"
                aria-hidden="true"
              />
            ) : (
              <ChevronDownIcon
                className={cn(
                  "h-4 w-4 shrink-0 text-[var(--icon-low-emphasis)] transition-transform duration-200",
                  isOpen ? "rotate-180" : "rotate-0",
                )}
                aria-hidden="true"
              />
            )}
          </button>
        </>
      ) : (
        <>
          <input
            ref={inputRef}
            id={dropdownId}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            value={triggerQuery}
            disabled={disabled}
            onFocus={() => {
              setIsFocused(true);
              setIsOpen(true);
            }}
            onBlur={() => setIsFocused(false)}
            onChange={(event) => {
              setTriggerQuery(event.target.value);
              if (!isOpen) {
                setIsOpen(true);
              }
            }}
            placeholder={placeholder}
            aria-expanded={isOpen}
            aria-controls={isOpen ? listboxId : undefined}
            className={cn(
              "min-h-9 w-full bg-transparent text-left text-[15px] leading-5 font-normal focus:outline-none",
              hasSelectedOption
                ? "text-[var(--text-high-emphasis)] placeholder:text-[var(--text-medium-emphasis)]"
                : isActiveTriggerState
                  ? "text-[var(--text-high-emphasis)] placeholder:text-[var(--text-medium-emphasis)]"
                  : "text-[var(--text-medium-emphasis)] placeholder:text-[var(--text-low-emphasis)]",
            )}
          />

          {RightIcon ? (
            <RightIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : null}

          <button
            ref={buttonRef}
            type="button"
            disabled={disabled}
            onClick={hasSelectedOption ? handleClearSelection : handleToggle}
            className="-mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full focus-visible:outline-none"
            aria-label={
              hasSelectedOption
                ? "Hapus pilihan"
                : isOpen
                  ? "Tutup dropdown"
                  : "Buka dropdown"
            }
          >
            {hasSelectedOption ? (
              <XMarkIcon
                className="h-4 w-4 shrink-0 text-[var(--icon-low-emphasis)]"
                aria-hidden="true"
              />
            ) : (
              <ChevronDownIcon
                className={cn(
                  "h-4 w-4 shrink-0 text-[var(--icon-low-emphasis)] transition-transform duration-200",
                  isOpen ? "rotate-180" : "rotate-0",
                )}
                aria-hidden="true"
              />
            )}
          </button>
        </>
      )}
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={cn("relative inline-block w-full", className)}
      style={{ width }}
    >
      {triggerContent}

      {resolvedHelperText && !isOpen ? (
        <p
          className={cn(
            "px-4 pt-1 text-[12px] leading-4 text-[var(--text-medium-emphasis)]",
            helperTextClassName,
          )}
        >
          {resolvedHelperText}
        </p>
      ) : null}

      <AnimatePresence>
        {isOpen ? (
          <motion.ul
            id={listboxId}
            role="listbox"
            aria-labelledby={dropdownId}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={cn(
              "absolute z-50 mt-1 w-full overflow-hidden rounded-lg border",
              isPanelVariant
                ? "border-[var(--border)] bg-[var(--bg)] p-1 shadow-lg"
                : "border-[var(--border)] bg-[var(--bg)] p-1 shadow-lg",
            )}
          >
            <div
              className="dropdown-scroll-subtle max-h-full overflow-y-auto overflow-x-hidden"
              style={{ maxHeight: menuMaxHeight }}
            >
              {showMenuSearch ? (
                <li
                  role="presentation"
                  className={cn(isPanelVariant ? "pb-2" : "pb-2")}
                >
                  <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setSearchQuery(nextValue);
                        if (!isPanelVariant) {
                          setTriggerQuery(nextValue);
                        }
                      }}
                      placeholder={searchPlaceholder}
                      className="w-full bg-transparent text-[15px] leading-5 text-[var(--text-high-emphasis)] placeholder:text-[var(--text-low-emphasis)] focus:outline-none"
                    />
                    <MagnifyingGlassIcon
                      className="h-4 w-4 shrink-0 text-[var(--icon-low-emphasis)]"
                      aria-hidden="true"
                    />
                  </div>
                </li>
              ) : null}

              {filteredOptions.length === 0 ? (
                <li className="b4 px-3 py-2 text-[var(--text-medium-emphasis)]">
                  Tidak ada data
                </li>
              ) : (
                filteredOptions.map((option, index) => {
                  const Icon = option.icon;
                  const isSelected = selectedValue === option.value;

                  return (
                    <li
                      key={String(option.value)}
                      role="option"
                      aria-selected={isSelected}
                      className={cn(index > 0 ? "mt-1" : "")}
                    >
                      <button
                        type="button"
                        onClick={(event) => handleSelect(option, event)}
                        disabled={option.disabled}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors duration-150",
                          option.disabled
                            ? "cursor-not-allowed text-[var(--text-disabled)]"
                            : isSelected
                              ? isPanelVariant
                                ? "text-[var(--text-high-emphasis)]"
                                : "bg-[var(--color-blue-50)] dark:bg-slate-700 text-[var(--text-high-emphasis)]"
                              : isPanelVariant
                                ? "cursor-pointer text-[var(--text-high-emphasis)] hover:bg-[var(--color-blue-50)] dark:hover:bg-slate-700"
                                : "cursor-pointer text-[var(--text-high-emphasis)] hover:bg-[var(--color-blue-50)] dark:hover:bg-slate-700",
                        )}
                      >
                        {Icon ? (
                          <Icon
                            className="h-4 w-4 shrink-0"
                            aria-hidden="true"
                          />
                        ) : null}

                        <span className="b4 flex-1 truncate">
                          {option.label}
                        </span>

                        {isPanelVariant ? (
                          <span
                            className="shrink-0"
                            onMouseDown={(event) => event.stopPropagation()}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              disabled={option.disabled}
                              onChange={(checkboxEvent) => {
                                checkboxEvent.stopPropagation();
                                handleSelect(option, checkboxEvent);
                              }}
                            />
                          </span>
                        ) : isSelected ? (
                          <CheckIcon
                            className="h-4 w-4 shrink-0 text-[var(--color-blue-500)]"
                            aria-hidden="true"
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </div>
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default Dropdown;
