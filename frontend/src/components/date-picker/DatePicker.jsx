import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Input from "../input/Input";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function normalizeDate(value) {
  if (!value) return null;
  const date =
    value instanceof Date ? new Date(value) : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateValue(date) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date) {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseDisplayDate(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;

  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (!match) return undefined;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return undefined;
  }

  return parsed;
}

function formatTypedDateInput(rawValue) {
  const digits = String(rawValue ?? "")
    .replace(/\D/g, "")
    .slice(0, 8);

  if (!digits) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function getCaretFromDigitIndex(maskedValue, digitIndex) {
  if (digitIndex <= 0) return 0;

  let seenDigits = 0;
  for (let index = 0; index < maskedValue.length; index += 1) {
    if (/\d/.test(maskedValue[index])) {
      seenDigits += 1;
      if (seenDigits >= digitIndex) {
        return index + 1;
      }
    }
  }

  return maskedValue.length;
}

function isSameDay(first, second) {
  if (!first || !second) return false;
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function isDateBefore(first, second) {
  if (!first || !second) return false;
  return (
    new Date(first.getFullYear(), first.getMonth(), first.getDate()).getTime() <
    new Date(
      second.getFullYear(),
      second.getMonth(),
      second.getDate(),
    ).getTime()
  );
}

function isDateAfter(first, second) {
  if (!first || !second) return false;
  return (
    new Date(first.getFullYear(), first.getMonth(), first.getDate()).getTime() >
    new Date(
      second.getFullYear(),
      second.getMonth(),
      second.getDate(),
    ).getTime()
  );
}

function buildCalendarDays(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const gridStart = new Date(year, month, 1 - firstWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return {
      date,
      inCurrentMonth: date.getMonth() === month,
    };
  });
}

function getYearGridStart(year) {
  return Math.floor(year / 12) * 12;
}

function DatePicker({
  className = "",
  defaultValue,
  disabled = false,
  disableDate,
  id,
  label = "Date",
  locale = "id-ID",
  maxDate,
  minDate,
  name,
  onBlur,
  onChange,
  onFocus,
  required = false,
  size = "medium",
  state = "default",
  value,
}) {
  const generatedId = useId();
  const pickerId = id ?? generatedId;
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const isControlled = value !== undefined;
  const initialDate = normalizeDate(defaultValue);
  const [internalDate, setInternalDate] = useState(initialDate);
  const [isOpen, setIsOpen] = useState(false);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

  const selectedDate = useMemo(
    () => (isControlled ? normalizeDate(value) : internalDate),
    [isControlled, value, internalDate],
  );
  const selectedDateStamp = selectedDate
    ? new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
      ).getTime()
    : null;
  const min = normalizeDate(minDate);
  const max = normalizeDate(maxDate);
  const today = useMemo(() => new Date(), []);
  const minYear = min?.getFullYear() ?? 1900;
  const maxYear = max?.getFullYear() ?? today.getFullYear();

  const [viewDate, setViewDate] = useState(selectedDate ?? today);
  const [typedValue, setTypedValue] = useState(formatDisplayDate(selectedDate));
  const [yearGridStart, setYearGridStart] = useState(
    getYearGridStart((selectedDate ?? today).getFullYear()),
  );

  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }, [selectedDateStamp]);

  useEffect(() => {
    setTypedValue(formatDisplayDate(selectedDate));
  }, [selectedDateStamp]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (wrapperRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsYearPickerOpen(false);
    }
  }, [isOpen]);

  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate]);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "long",
      }).format(viewDate),
    [locale, viewDate],
  );

  const yearOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => yearGridStart + index);
  }, [yearGridStart]);

  const inputValue = useMemo(() => {
    return typedValue;
  }, [typedValue]);

  const isUnavailable = (date) => {
    if (isDateBefore(date, min) || isDateAfter(date, max)) return true;
    return disableDate ? Boolean(disableDate(date)) : false;
  };

  const emitChange = (date) => {
    const nextValue = toDateValue(date);
    const syntheticEvent = {
      target: {
        name,
        id: pickerId,
        value: nextValue,
      },
    };
    onChange?.(syntheticEvent, date);
  };

  const handleSelectDate = (date) => {
    if (disabled || isUnavailable(date)) return;

    if (!isControlled) {
      setInternalDate(date);
    }

    emitChange(date);
    setIsYearPickerOpen(false);
    setIsOpen(false);
  };

  const handleClearValue = () => {
    if (disabled || !selectedDate) return;

    if (!isControlled) {
      setInternalDate(null);
    }

    emitChange(null);
    setIsYearPickerOpen(false);
    setIsOpen(false);
  };

  const handleInputFocus = (event) => {
    if (!disabled) {
      setIsOpen(true);
    }
    onFocus?.(event);
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = (event) => {
    const parsedDate = parseDisplayDate(event.target.value);

    if (event.target.value.trim() === "") {
      if (!isControlled) {
        setInternalDate(null);
      }
      setTypedValue("");
      emitChange(null);
      setIsYearPickerOpen(false);
      onBlur?.(event);
      return;
    }

    if (parsedDate && !isUnavailable(parsedDate)) {
      if (!isControlled) {
        setInternalDate(parsedDate);
      }
      setTypedValue(formatDisplayDate(parsedDate));
      setViewDate(parsedDate);
      emitChange(parsedDate);
      setIsYearPickerOpen(false);
    }

    onBlur?.(event);
  };

  const handleInputChange = (event) => {
    const rawValue = event.target.value;
    const cursorPosition = event.target.selectionStart ?? rawValue.length;
    const digitsBeforeCursor = rawValue
      .slice(0, cursorPosition)
      .replace(/\D/g, "").length;

    const nextMaskedValue = formatTypedDateInput(rawValue);
    const nextCursorPosition = getCaretFromDigitIndex(
      nextMaskedValue,
      digitsBeforeCursor,
    );

    setTypedValue(nextMaskedValue);

    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      inputRef.current.setSelectionRange(
        nextCursorPosition,
        nextCursorPosition,
      );
    });
  };

  const handleInputKeyDown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.currentTarget.blur();
  };

  const goToPreviousMonth = () => {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  };

  const handleYearChange = (event) => {
    const selectedYear = Number(event.target.value);
    if (Number.isNaN(selectedYear)) return;
    setViewDate((current) => new Date(selectedYear, current.getMonth(), 1));
    setIsYearPickerOpen(false);
  };

  const toggleYearPicker = () => {
    setIsYearPickerOpen((current) => {
      const next = !current;
      if (next) {
        setYearGridStart(getYearGridStart(viewDate.getFullYear()));
      }
      return next;
    });
  };

  const goToPreviousYearRange = () => {
    setYearGridStart((current) => current - 12);
  };

  const goToNextYearRange = () => {
    setYearGridStart((current) => current + 12);
  };

  const handleYearSelect = (year) => {
    handleYearChange({ target: { value: String(year) } });
  };

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      <Input
        ref={inputRef}
        id={pickerId}
        name={name}
        label={label}
        required={required}
        disabled={disabled}
        size={size}
        state={state}
        value={inputValue}
        placeholder="dd/mm/yyyy"
        helperText=""
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onClick={handleInputClick}
        rightIcon={CalendarDaysIcon}
        inputClassName="cursor-text"
      />

      <input type="hidden" name={name} value={toDateValue(selectedDate)} />

      {isOpen ? (
        <div className="absolute left-0 z-30 mt-2 w-70 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3 shadow-[var(--shadow)]">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--icon-medium-emphasis)] transition-colors hover:border-[var(--color-blue-300)] hover:text-[var(--icon-active)]"
              aria-label="Previous month"
            >
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="relative flex items-center gap-2">
              <p className="s2 text-[var(--text-high-emphasis)] capitalize">
                {monthLabel}
              </p>

              <button
                type="button"
                onClick={toggleYearPicker}
                className={cn(
                  "b4 inline-flex h-8 items-center rounded-lg border px-2.5 transition-colors",
                  isYearPickerOpen
                    ? "border-[var(--color-blue-500)] text-[var(--text-active)]"
                    : "border-[var(--border)] text-[var(--text-high-emphasis)] hover:border-[var(--color-blue-300)]",
                )}
                aria-label="Pilih tahun"
                aria-expanded={isYearPickerOpen}
              >
                <span>{viewDate.getFullYear()}</span>
              </button>

              {isYearPickerOpen ? (
                <div className="absolute top-10 left-1/2 z-40 w-56 -translate-x-1/2 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2 shadow-[var(--shadow)]">
                  <div className="mb-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={goToPreviousYearRange}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--icon-medium-emphasis)] hover:bg-[var(--color-blue-50)] hover:text-[var(--icon-active)]"
                      aria-label="Tahun sebelumnya"
                    >
                      <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <p className="b4 text-[var(--text-medium-emphasis)]">
                      {yearGridStart} - {yearGridStart + 11}
                    </p>
                    <button
                      type="button"
                      onClick={goToNextYearRange}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--icon-medium-emphasis)] hover:bg-[var(--color-blue-50)] hover:text-[var(--icon-active)]"
                      aria-label="Tahun berikutnya"
                    >
                      <ChevronRightIcon
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <div
                    className="grid grid-cols-3 gap-1.5"
                    role="listbox"
                    aria-label="Daftar tahun"
                  >
                    {yearOptions.map((year) => {
                      const active = year === viewDate.getFullYear();
                      const outOfRange = year < minYear || year > maxYear;
                      return (
                        <button
                          key={year}
                          type="button"
                          onClick={() => handleYearSelect(year)}
                          disabled={outOfRange}
                          className={cn(
                            "b4 flex h-8 items-center justify-center rounded-md transition-colors",
                            active
                              ? "bg-[var(--color-blue-500)] text-[var(--text-inverse)]"
                              : "text-[var(--text-high-emphasis)] hover:bg-[var(--color-blue-50)]",
                            outOfRange
                              ? "cursor-not-allowed text-[var(--text-disabled)] hover:bg-transparent"
                              : "cursor-pointer",
                          )}
                        >
                          {year}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={goToNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--icon-medium-emphasis)] transition-colors hover:border-[var(--color-blue-300)] hover:text-[var(--icon-active)]"
              aria-label="Next month"
            >
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {DAY_LABELS.map((day) => (
              <span
                key={day}
                className="b4 flex h-8 items-center justify-center text-[var(--text-medium-emphasis)]"
              >
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, inCurrentMonth }) => {
              const unavailable = isUnavailable(date);
              const selected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, today);

              return (
                <button
                  key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                  type="button"
                  onClick={() => handleSelectDate(date)}
                  disabled={unavailable}
                  className={cn(
                    "b3 flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                    selected
                      ? "bg-[var(--color-blue-500)] text-[var(--text-inverse)]"
                      : "text-[var(--text-high-emphasis)] hover:bg-[var(--color-blue-50)] hover:text-[var(--text-active)]",
                    isToday && !selected
                      ? "ring-1 ring-[var(--color-blue-300)]"
                      : "",
                    !inCurrentMonth ? "text-[var(--text-low-emphasis)]" : "",
                    unavailable
                      ? "cursor-not-allowed text-[var(--text-disabled)] hover:bg-transparent hover:text-[var(--text-disabled)]"
                      : "cursor-pointer",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex justify-end border-t border-[var(--border)] pt-3">
            <button
              type="button"
              onClick={handleClearValue}
              disabled={!selectedDate || disabled}
              className={cn(
                "b4 rounded-lg px-3 py-1.5 transition-colors",
                selectedDate && !disabled
                  ? "cursor-pointer text-[var(--text-active)] hover:bg-[var(--color-blue-50)]"
                  : "cursor-not-allowed text-[var(--text-disabled)]",
              )}
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DatePicker;
