import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import Checkbox from "../checkbox/Checkbox";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function FormMultiSelect({
  id,
  options = [],
  value = [],
  onChange,
  placeholder = "Pilih",
  searchable = true,
  disabled = false,
  helperText = "",
  error = "",
}) {
  const generatedId = useId();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const controlId = id ?? generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const normalizedValues = useMemo(() => {
    if (!Array.isArray(value)) return [];
    return value.map((item) =>
      item && typeof item === "object" ? item.value : item,
    );
  }, [value]);

  const selectedOptions = useMemo(
    () => options.filter((option) => normalizedValues.includes(option.value)),
    [normalizedValues, options],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((option) =>
      String(option.label).toLowerCase().includes(normalizedQuery),
    );
  }, [options, query]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleOption = (option) => {
    if (disabled || option.disabled) return;
    const nextValues = normalizedValues.includes(option.value)
      ? normalizedValues.filter((current) => current !== option.value)
      : [...normalizedValues, option.value];
    onChange?.(nextValues);
  };

  const clear = (event) => {
    event.stopPropagation();
    if (disabled) return;
    onChange?.([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <div
        className={cn(
          "flex min-h-10 w-full items-center gap-2 rounded-xl border bg-[var(--bg)] px-3.5 py-1.5 transition-all",
          disabled
            ? "cursor-not-allowed border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] text-[var(--text-disabled)]"
            : error
              ? "border-[var(--color-error-500)] shadow-[0_0_0_3px_rgba(240,68,56,.08)]"
              : isOpen
                ? "border-[var(--color-blue-500)] shadow-[0_0_0_3px_rgba(22,166,233,.10)]"
                : "border-[var(--border)] hover:border-[var(--border-strong)]",
        )}
      >
        <button
          id={controlId}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className="flex min-w-0 flex-1 items-center gap-2 bg-transparent text-left outline-none"
        >
          <span className="flex min-w-0 flex-1 flex-wrap gap-1">
            {selectedOptions.length ? (
              selectedOptions.slice(0, 2).map((option) => (
                <span
                  key={String(option.value)}
                  className="inline-flex max-w-full items-center rounded-lg bg-[var(--accent-bg)] px-2 py-1 text-[11px] font-semibold text-[var(--text-active)]"
                >
                  <span className="truncate">{option.label}</span>
                </span>
              ))
            ) : (
              <span className="py-1 text-[14px] text-[var(--text-low-emphasis)]">
                {placeholder}
              </span>
            )}
            {selectedOptions.length > 2 ? (
              <span className="inline-flex items-center rounded-lg bg-[var(--surface-muted)] px-2 py-1 text-[11px] font-semibold text-[var(--text-medium-emphasis)]">
                +{selectedOptions.length - 2}
              </span>
            ) : null}
          </span>
        </button>
        {selectedOptions.length ? (
          <button
            type="button"
            onClick={clear}
            disabled={disabled}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed"
            aria-label="Hapus semua pilihan"
          >
            <XMarkIcon className="h-4 w-4 text-[var(--icon-low-emphasis)]" />
          </button>
        ) : null}
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 shrink-0 text-[var(--icon-low-emphasis)] transition-transform",
            isOpen ? "rotate-180" : "",
          )}
        />
      </div>

      {helperText && !error ? (
        <p className="mt-1 px-1 text-[11px] text-[var(--text-low-emphasis)]">
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p className="mt-1 px-1 text-[11px] font-medium text-[var(--text-error)]">
          {error}
        </p>
      ) : null}

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.14 }}
            className="absolute left-0 right-0 z-[10000] mt-2 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-1.5 shadow-[0_16px_40px_rgba(15,23,42,.16)]"
          >
            {searchable ? (
              <div className="mb-1.5 flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2">
                <MagnifyingGlassIcon className="h-4 w-4 text-[var(--icon-low-emphasis)]" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari pilihan..."
                  className="w-full bg-transparent text-[13px] text-[var(--text-high-emphasis)] outline-none placeholder:text-[var(--text-low-emphasis)]"
                />
              </div>
            ) : null}
            <div className="max-h-56 overflow-y-auto">
              {filteredOptions.length ? (
                filteredOptions.map((option) => {
                  const checked = normalizedValues.includes(option.value);
                  return (
                    <button
                      key={String(option.value)}
                      type="button"
                      disabled={option.disabled}
                      aria-selected={checked}
                      onClick={() => toggleOption(option)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors",
                        option.disabled
                          ? "cursor-not-allowed opacity-50"
                          : checked
                            ? "bg-[var(--accent-bg)]"
                            : "hover:bg-[var(--surface-muted)]",
                      )}
                    >
                      <span className="pointer-events-none shrink-0">
                        <Checkbox
                          size="small"
                          checked={checked}
                          disabled={option.disabled}
                        />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--text-high-emphasis)]">
                        {option.label}
                      </span>
                      {checked ? (
                        <CheckIcon className="h-4 w-4 shrink-0 text-[var(--color-blue-500)]" />
                      ) : null}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-6 text-center text-[12px] text-[var(--text-medium-emphasis)]">
                  Tidak ada pilihan.
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
