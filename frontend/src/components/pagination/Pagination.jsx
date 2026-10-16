import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function getVisiblePages(totalPages) {
  return Array.from({ length: totalPages }, (_, index) => index + 1);
}

function Pagination({
  className = "",
  currentPage,
  defaultCurrentPage = 1,
  disabled = false,
  onPageChange,
  showFirstLast = true,
  totalPages = 1,
  visualState = "default",
}) {
  const isControlled = currentPage !== undefined;
  const [internalPage, setInternalPage] = useState(defaultCurrentPage);

  const activePage = isControlled ? currentPage : internalPage;
  const pages = useMemo(() => getVisiblePages(totalPages), [totalPages]);
  const safeTotalPages = Math.max(1, totalPages);
  const safeActivePage = Math.min(Math.max(activePage, 1), safeTotalPages);

  const setPage = (nextPage) => {
    const clampedPage = Math.min(Math.max(nextPage, 1), safeTotalPages);
    if (!isControlled) {
      setInternalPage(clampedPage);
    }
    onPageChange?.(clampedPage);
  };

  const isFirstDisabled = disabled || safeActivePage === 1;
  const isLastDisabled = disabled || safeActivePage === safeTotalPages;
  const getMotionProps = () => {
    if (disabled) {
      return {};
    }

    return {
      whileHover: { scale: 1.03 },
      whileTap: { scale: 0.96 },
    };
  };

  const baseIconButtonClassName = cn(
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-transparent text-[#d4d4d4] transition-colors duration-150",
    "hover:bg-[var(--color-blue-700)] hover:text-[var(--color-blue-700)] focus:outline-none focus:border-[3px] focus:border-[#63c8f3] focus:ring-0 focus:bg-[var(--color-blue-700)] focus:text-[var(--color-blue-500)]",
    "disabled:cursor-not-allowed disabled:bg-transparent disabled:text-[var(--text-disabled)] disabled:hover:bg-transparent disabled:hover:text-[var(--text-disabled)]",
  );

  const basePageButtonClassName = cn(
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-transparent text-[14px] font-medium leading-4 text-[#d4d4d4] transition-colors duration-150",
    "hover:bg-[var(--color-blue-700)] hover:text-[var(--color-blue-700)] focus:outline-none focus:border-[3px] focus:border-[#63c8f3] focus:ring-0 focus:bg-[var(--color-blue-700)] focus:text-[var(--color-blue-700)]",
    "disabled:cursor-not-allowed disabled:bg-transparent disabled:text-[var(--text-disabled)] disabled:hover:bg-transparent disabled:hover:text-[var(--text-disabled)]",
  );

  const buttonMotionProps = getMotionProps();
  const pageButtonMotionProps = getMotionProps();

  return (
    <nav
      className={cn(
        "inline-flex w-full items-center justify-center gap-4",
        className,
      )}
      aria-label="Pagination"
    >
      {showFirstLast ? (
        <motion.button
          type="button"
          onClick={() => setPage(1)}
          disabled={disabled || isFirstDisabled}
          aria-label="Halaman pertama"
          className={baseIconButtonClassName}
          {...buttonMotionProps}
        >
          <ChevronDoubleLeftIcon
            className="h-[18px] w-[18px]"
            aria-hidden="true"
          />
        </motion.button>
      ) : null}

      <motion.button
        type="button"
        onClick={() => setPage(safeActivePage - 1)}
        disabled={disabled || isFirstDisabled}
        aria-label="Halaman sebelumnya"
        className={baseIconButtonClassName}
        {...buttonMotionProps}
      >
        <ChevronLeftIcon className="h-[18px] w-[18px]" aria-hidden="true" />
      </motion.button>

      {pages.map((page) => {
        const isActive = page === safeActivePage;

        return (
          <motion.button
            key={page}
            type="button"
            onClick={() => setPage(page)}
            aria-current={isActive ? "page" : undefined}
            aria-label={`Halaman ${page}`}
            disabled={disabled}
            className={cn(
              basePageButtonClassName,
              isActive
                ? "!border-transparent !bg-[var(--color-blue-700)] !text-white shadow-none hover:!bg-[var(--color-blue-800)] hover:!text-white focus:!border-transparent focus:!bg-[var(--color-blue-700)] focus:!text-white"
                : "",
            )}
            {...pageButtonMotionProps}
          >
            {page}
          </motion.button>
        );
      })}

      <motion.button
        type="button"
        onClick={() => setPage(safeActivePage + 1)}
        disabled={disabled || isLastDisabled}
        aria-label="Halaman berikutnya"
        className={baseIconButtonClassName}
        {...buttonMotionProps}
      >
        <ChevronRightIcon className="h-[18px] w-[18px]" aria-hidden="true" />
      </motion.button>

      {showFirstLast ? (
        <motion.button
          type="button"
          onClick={() => setPage(safeTotalPages)}
          disabled={disabled || isLastDisabled}
          aria-label="Halaman terakhir"
          className={baseIconButtonClassName}
          {...buttonMotionProps}
        >
          <ChevronDoubleRightIcon
            className="h-[18px] w-[18px]"
            aria-hidden="true"
          />
        </motion.button>
      ) : null}
    </nav>
  );
}

export default Pagination;
