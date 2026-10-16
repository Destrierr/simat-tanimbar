import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  XMarkIcon,
  ArrowUpTrayIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

import Input from "../input/Input";
import Button from "../button/Button";
import Card from "../card/Card";
import Dropdown from "../dropdown/Dropdown";
import DatePicker from "../date-picker/DatePicker";
import FormMultiSelect from "./FormMultiSelect";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function getInitialForm(fields, initialData) {
  return fields.reduce((result, field) => {
    const provided = initialData?.[field.name];

    if (provided !== undefined && provided !== null) {
      result[field.name] = provided;
    } else if (field.type === "select-multi") {
      result[field.name] = [];
    } else if (field.type === "file") {
      result[field.name] = null;
    } else {
      result[field.name] = "";
    }

    return result;
  }, {});
}

function normalizeSubmitValue(field, value) {
  if (field.type === "select-multi") {
    const values = Array.isArray(value)
      ? value.map((item) =>
          item && typeof item === "object" ? item.value : item,
        )
      : [];

    return values.length === 1 && values[0] === "ALL" ? "ALL" : values;
  }

  if (value && typeof value === "object" && "value" in value) {
    return value.value;
  }

  return value;
}

function TextAreaField({ field, value, onChange, error }) {
  return (
    <div className="min-w-0">
      <label htmlFor={field.id} className="field-label">
        {field.label}

        {field.required ? (
          <span className="ml-1 text-[var(--text-error)]">*</span>
        ) : null}
      </label>

      <textarea
        id={field.id}
        name={field.name}
        rows={field.rows ?? 4}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        required={field.required}
        disabled={field.disabled}
        className={cn(
          "w-full resize-y rounded-xl border bg-[var(--bg)] px-3.5 py-3 text-[14px] text-[var(--text-high-emphasis)] outline-none transition-all placeholder:text-[var(--text-low-emphasis)]",
          error
            ? "border-[var(--color-error-500)] shadow-[0_0_0_3px_rgba(240,68,56,.08)]"
            : "border-[var(--border)] focus:border-[var(--color-blue-500)] focus:shadow-[0_0_0_3px_rgba(22,166,233,.10)]",
          field.disabled
            ? "cursor-not-allowed bg-[var(--color-neutral-100)] text-[var(--text-disabled)]"
            : "",
        )}
      />

      {error ? (
        <p className="mt-1 text-[11px] font-medium text-[var(--text-error)]">
          {error}
        </p>
      ) : field.helperText ? (
        <p className="mt-1 text-[11px] text-[var(--text-low-emphasis)]">
          {field.helperText}
        </p>
      ) : null}
    </div>
  );
}

function FileField({ field, value, onChange, error }) {
  return (
    <div className="min-w-0">
      <label htmlFor={field.id} className="field-label">
        {field.label}

        {field.required ? (
          <span className="ml-1 text-[var(--text-error)]">*</span>
        ) : null}
      </label>

      <label
        htmlFor={field.id}
        className={cn(
          "flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-5 text-center transition-all",
          error
            ? "border-[var(--color-error-500)] bg-[var(--color-error-100)]/40"
            : "border-[var(--border-strong)] bg-[var(--surface-muted)] hover:border-[var(--color-blue-300)] hover:bg-[var(--accent-bg)]",
          field.disabled ? "cursor-not-allowed opacity-60" : "",
        )}
      >
        <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-bg)] text-[var(--text-active)]">
          {value ? (
            <DocumentIcon className="h-5 w-5" />
          ) : (
            <ArrowUpTrayIcon className="h-5 w-5" />
          )}
        </span>

        <span className="text-[12px] font-semibold text-[var(--text-high-emphasis)]">
          {value?.name || "Klik untuk memilih file"}
        </span>

        <span className="mt-1 text-[11px] text-[var(--text-low-emphasis)]">
          {field.accept || "Semua format file"}
          {field.maxSize ? ` • Maks. ${field.maxSize}` : ""}
        </span>
      </label>

      <input
        id={field.id}
        name={field.name}
        type="file"
        accept={field.accept}
        multiple={field.multiple}
        disabled={field.disabled}
        onChange={(event) =>
          onChange(
            field.multiple
              ? Array.from(event.target.files || [])
              : event.target.files?.[0] || null,
          )
        }
        className="sr-only"
      />

      {error ? (
        <p className="mt-1 text-[11px] font-medium text-[var(--text-error)]">
          {error}
        </p>
      ) : field.helperText ? (
        <p className="mt-1 text-[11px] text-[var(--text-low-emphasis)]">
          {field.helperText}
        </p>
      ) : null}
    </div>
  );
}

function FormField({ field, value, onChange, error }) {
  const fieldId = field.id || `form-field-${field.name}`;
  const resolvedField = {
    ...field,
    id: fieldId,
  };

  if (field.render) {
    return field.render({
      field: resolvedField,
      value,
      onChange,
      error,
    });
  }

  if (field.type === "textarea") {
    return (
      <TextAreaField
        field={resolvedField}
        value={value}
        onChange={onChange}
        error={error}
      />
    );
  }

  if (field.type === "file") {
    return (
      <FileField
        field={resolvedField}
        value={value}
        onChange={onChange}
        error={error}
      />
    );
  }

  if (field.type === "date") {
    return (
      <div className="min-w-0">
        <DatePicker
          id={fieldId}
          name={field.name}
          label={field.label}
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          required={field.required}
          disabled={field.disabled}
          minDate={field.minDate}
          maxDate={field.maxDate}
          state={error ? "error" : field.state || "default"}
        />

        {error ? (
          <p className="mt-1 text-[11px] font-medium text-[var(--text-error)]">
            {error}
          </p>
        ) : field.helperText ? (
          <p className="mt-1 text-[11px] text-[var(--text-low-emphasis)]">
            {field.helperText}
          </p>
        ) : null}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="min-w-0">
        <label htmlFor={fieldId} className="field-label">
          {field.label}

          {field.required ? (
            <span className="ml-1 text-[var(--text-error)]">*</span>
          ) : null}
        </label>

        <Dropdown
          id={fieldId}
          options={field.options || []}
          value={value || undefined}
          onChange={(option) => onChange(option?.value ?? "")}
          placeholder={field.placeholder || "Pilih"}
          searchable={field.searchable ?? (field.options?.length || 0) > 6}
          disabled={field.disabled}
        />

        {error ? (
          <p className="mt-1 text-[11px] font-medium text-[var(--text-error)]">
            {error}
          </p>
        ) : field.helperText ? (
          <p className="mt-1 text-[11px] text-[var(--text-low-emphasis)]">
            {field.helperText}
          </p>
        ) : null}
      </div>
    );
  }

  if (field.type === "select-multi") {
    return (
      <div className="min-w-0">
        <label htmlFor={fieldId} className="field-label">
          {field.label}

          {field.required ? (
            <span className="ml-1 text-[var(--text-error)]">*</span>
          ) : null}
        </label>

        <FormMultiSelect
          id={fieldId}
          options={field.options || []}
          value={value || []}
          onChange={onChange}
          placeholder={field.placeholder || "Pilih"}
          searchable={field.searchable ?? true}
          disabled={field.disabled}
          helperText={field.helperText}
          error={error}
        />
      </div>
    );
  }

  const inputType = ["email", "number", "password", "url", "text"].includes(
    field.type,
  )
    ? field.type
    : "text";

  return (
    <div className="min-w-0">
      <Input
        id={fieldId}
        name={field.name}
        label={field.label}
        type={inputType}
        value={value ?? ""}
        placeholder={field.placeholder || ""}
        onChange={(event) => onChange(event.target.value)}
        required={field.required}
        disabled={field.disabled}
        autoComplete={field.autoComplete}
        helperText={error || field.helperText || ""}
        state={error ? "error" : field.state || "default"}
      />
    </div>
  );
}

export default function FormModal({
  title,
  description = "Lengkapi data berikut lalu simpan perubahan.",
  isOpen,
  onClose,
  fields = [],
  initialData,
  onSubmit,
  isUploading = false,
  uploadProgress = 0,
  submitText = "Simpan",
  cancelText = "Batal",
  size = "xl",
  closeOnBackdrop = true,
  closeOnEscape = true,
}) {
  const formId = useId();

  const [form, setForm] = useState(() => getInitialForm(fields, initialData));

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(getInitialForm(fields, initialData));
    setErrors({});
  }, [fields, initialData, isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting && !isUploading) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeOnEscape, isOpen, isUploading, onClose, submitting]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const busy = submitting || isUploading;

  const widthClass = useMemo(
    () =>
      ({
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        "2xl": "max-w-5xl",
      })[size] || "max-w-4xl",
    [size],
  );

  const updateField = (name, value) => {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => {
      if (!current[name]) return current;

      const next = {
        ...current,
      };

      delete next[name];

      return next;
    });
  };

  const validate = () => {
    const nextErrors = {};

    fields.forEach((field) => {
      if (!field.required) return;

      const value = form[field.name];

      const empty = Array.isArray(value)
        ? value.length === 0
        : value === undefined || value === null || String(value).trim() === "";

      if (empty) {
        nextErrors[field.name] =
          field.requiredMessage || `${field.label} wajib diisi.`;
      }
    });

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (busy || !validate()) return;

    const cleanedForm = Object.fromEntries(
      fields.map((field) => [
        field.name,
        normalizeSubmitValue(field, form[field.name]),
      ]),
    );

    try {
      setSubmitting(true);

      await onSubmit?.(cleanedForm);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] overflow-y-auto"
        aria-hidden={!isOpen}
      >
        <motion.button
          type="button"
          aria-label="Tutup modal"
          className="fixed inset-0 cursor-default bg-slate-950/50 backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeOnBackdrop && !busy ? onClose : undefined}
        />

        <div className="relative flex min-h-full items-center justify-center p-3 sm:p-5">
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${formId}-title`}
            aria-describedby={`${formId}-description`}
            initial={{
              opacity: 0,
              y: 18,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 12,
              scale: 0.985,
            }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 30,
            }}
            className={cn(
              "relative z-10 w-full overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_70px_rgba(15,23,42,.22)]",
              widthClass,
            )}
          >
            <div className="flex max-h-[calc(100dvh-2rem)] flex-col sm:max-h-[calc(100dvh-3rem)]">
              {/* HEADER */}
              <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4 sm:px-6 sm:py-5">
                <div className="flex min-w-0 items-start gap-3 pr-3">
                  {/* ICON */}
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-bg)] text-[var(--text-active)]">
                    <DocumentIcon className="h-5 w-5" />
                  </div>

                  {/* TITLE + DESCRIPTION */}
                  <div className="min-w-0">
                    <h2
                      id={`${formId}-title`}
                      className="text-[19px] font-extrabold leading-6 tracking-[-0.02em] text-[var(--text-high-emphasis)]"
                    >
                      {title}
                    </h2>

                    <p
                      id={`${formId}-description`}
                      className="mt-1 max-w-2xl text-[12px] leading-5 text-[var(--text-medium-emphasis)]"
                    >
                      {description}
                    </p>
                  </div>
                </div>

                {/* CLOSE */}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={busy}
                  aria-label="Tutup"
                  className="icon-button shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* FORM BODY */}
              <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
                <form id={formId} onSubmit={handleSubmit} noValidate>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {fields.map((field) => (
                      <div
                        key={field.name}
                        className={
                          field.colSpan === 2 || field.fullWidth
                            ? "md:col-span-2"
                            : "md:col-span-1"
                        }
                      >
                        <FormField
                          field={field}
                          value={form[field.name]}
                          onChange={(value) => updateField(field.name, value)}
                          error={errors[field.name]}
                        />
                      </div>
                    ))}
                  </div>

                  {/* UPLOAD / SUBMIT STATUS */}
                  {busy ? (
                    <Card className="mt-5 border-[var(--accent-border)] bg-[var(--accent-bg)] p-4 shadow-none">
                      <div className="flex items-center justify-between gap-4 text-[12px] font-bold text-[var(--text-active)]">
                        <span>
                          {isUploading
                            ? "Mengupload dokumen..."
                            : "Menyimpan data..."}
                        </span>

                        {isUploading ? (
                          <span>{uploadProgress}%</span>
                        ) : (
                          <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current/20 border-t-current" />
                        )}
                      </div>

                      {isUploading ? (
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--bg)]">
                          <div
                            className="h-full rounded-full bg-[var(--color-blue-500)] transition-all duration-300"
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(uploadProgress, 100),
                              )}%`,
                            }}
                          />
                        </div>
                      ) : null}
                    </Card>
                  ) : null}
                </form>
              </div>

              {/* FOOTER */}
              <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy}
                  onClick={onClose}
                >
                  {cancelText}
                </Button>

                <Button type="submit" form={formId} loading={busy}>
                  {busy ? "Memproses..." : submitText}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
