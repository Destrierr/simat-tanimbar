import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import Button from "../button/Button";

function Modal({
  open = false,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  headerIcon = (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-bg)] text-[var(--text-active)]">
      <InformationCircleIcon className="h-5 w-5" aria-hidden="true" />
    </span>
  ),
}) {
  const sizeMap = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && open) onClose?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`relative w-full ${sizeMap[size] || sizeMap.md} max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-[var(--bg)] shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4 sm:px-6 sm:py-5">
                <div className="flex min-w-0 items-center gap-3 pr-3">
                  {headerIcon}
                  <div className="min-w-0">
                    <h2 className="text-[19px] font-extrabold leading-6 text-[var(--text-high-emphasis)]">
                      {title}
                    </h2>
                    {description ? (
                      <p className="mt-1 max-w-2xl text-[12px] leading-5 text-[var(--text-medium-emphasis)]">
                        {description}
                      </p>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={!onClose}
                  aria-label="Tutup"
                  className="icon-button shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              {children && (
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {children}
                </div>
              )}

              {/* Footer */}
              {footer && (
                <div className="grid shrink-0 grid-cols-2 gap-3 px-6 py-5">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// Default ikon & warna per-variant, dipakai kalau prop `illustration` tidak diisi
const CONFIRM_VARIANT_META = {
  danger: {
    icon: TrashIcon,
    color: "text-[var(--color-blue-500)]",
    bg: "bg-[var(--color-blue-100)]",
  },
  warning: {
    icon: ExclamationTriangleIcon,
    color: "text-[var(--text-warning)]",
    bg: "bg-[var(--color-warning-100)]",
  },
  primary: {
    icon: InformationCircleIcon,
    color: "text-[var(--color-blue-500)]",
    bg: "bg-[var(--color-blue-100)]",
  },
};

function ModalConfirm({
  open = false,
  onClose,
  onConfirm,
  title = "Konfirmasi",
  description,
  confirmText = "Ya, Hapus",
  cancelText = "Batal",
  loading = false,
  variant = "danger",
  illustration, // opsional: kasih <img src="..." /> atau elemen custom untuk override icon default
}) {
  const variantMap = {
    danger: { tone: "error" },
    warning: { tone: "warning" },
    primary: { tone: "primary" },
  };

  const { tone } = variantMap[variant] || variantMap.danger;
  const meta = CONFIRM_VARIANT_META[variant] || CONFIRM_VARIANT_META.danger;
  const Icon = meta.icon;

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title={title}
      size="sm"
      closeOnBackdrop={!loading}
      headerIcon={
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      }
      footer={
        <>
          <Button
            variant="secondary"
            size="medium"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={tone === "primary" ? "primary" : "primary"}
            size="medium"
            onClick={onConfirm}
            disabled={loading}
            className={
              tone === "primary"
                ? "border-[var(--color-error-300)] text-[var(--text-error)]! hover:bg-[var(--color-error-100)]!"
                : ""
            }
          >
            {loading ? "Memproses..." : confirmText}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-3 text-center">
        {illustration || null}
        {description && (
          <p className="b4 text-[var(--text-medium-emphasis)]">{description}</p>
        )}
      </div>
    </Modal>
  );
}

export { ModalConfirm };
export default Modal;
