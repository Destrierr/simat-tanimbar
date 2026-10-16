import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function toSet(value) {
  if (!value) return new Set();
  if (value instanceof Set) return new Set(value);
  if (Array.isArray(value)) return new Set(value);
  return new Set([value]);
}

function Sidebar({
  className = "",
  items = [],
  isCollapsed = false,

  logo,
  collapsedLogo,
  logoSrc,
  collapsedLogoSrc,
  logoAlt = "Application logo",

  appName = "SIMAT Tanimbar",
  appDescription = "Sistem Informasi Manajemen Aset Tanah",

  activeKey,
  defaultActiveKey,
  onActiveChange,

  expandedKeys,
  defaultExpandedKeys = [],
  onExpandedChange,

  width = "260px",
  collapsedWidth = "92px",

  ariaLabel = "Sidebar navigation",

  isOpen = true,
  onClose,
  onToggleCollapse,
  onLogout,
}) {
  const isActiveControlled = activeKey !== undefined;
  const isExpandedControlled = expandedKeys !== undefined;

  const popupRef = useRef(null);
  const triggerRef = useRef(null);

  const [openPopoverKey, setOpenPopoverKey] = useState(null);
  const [popoverPos, setPopoverPos] = useState(null);

  const [internalActiveKey, setInternalActiveKey] = useState(
    defaultActiveKey ?? items[0]?.key,
  );

  const [internalExpandedKeys, setInternalExpandedKeys] = useState(
    toSet(defaultExpandedKeys),
  );

  const resolvedActiveKey = isActiveControlled ? activeKey : internalActiveKey;

  const resolvedExpandedKeys = useMemo(
    () => (isExpandedControlled ? toSet(expandedKeys) : internalExpandedKeys),
    [expandedKeys, internalExpandedKeys, isExpandedControlled],
  );

  const resolvedLogoNode = isCollapsed
    ? (collapsedLogo ?? logo)
    : (logo ?? collapsedLogo);

  const resolvedLogoSrc = isCollapsed
    ? (collapsedLogoSrc ?? logoSrc)
    : (logoSrc ?? collapsedLogoSrc);

  /*
   * Mapping child -> parent
   */
  const parentByChildKey = useMemo(() => {
    const mapping = new Map();

    items.forEach((item) => {
      if (!Array.isArray(item.children)) return;

      item.children.forEach((child) => {
        mapping.set(child.key, item.key);
      });
    });

    return mapping;
  }, [items]);

  /*
   * Active menu
   */
  const setActive = (key, item) => {
    if (!isActiveControlled) {
      setInternalActiveKey(key);
    }

    onActiveChange?.(key, item);
  };

  /*
   * Expanded menu
   */
  const setExpanded = (nextSet, item) => {
    if (!isExpandedControlled) {
      setInternalExpandedKeys(nextSet);
    }

    onExpandedChange?.(Array.from(nextSet), item);
  };

  const toggleExpanded = (key, item) => {
    const nextSet = new Set(resolvedExpandedKeys);

    if (nextSet.has(key)) {
      nextSet.delete(key);
    } else {
      nextSet.add(key);
    }

    setExpanded(nextSet, item);
  };

  /*
   * Popover ketika sidebar collapsed
   */
  const openCollapsedPopover = (event, item) => {
    const rect = event.currentTarget.getBoundingClientRect();

    setPopoverPos({
      top: rect.top + rect.height / 2,
      left: rect.right + 10,
    });

    triggerRef.current = event.currentTarget;

    setOpenPopoverKey((current) => (current === item.key ? null : item.key));
  };

  /*
   * Parent menu click
   */
  const handleItemClick = (event, item) => {
    const hasChildren =
      Array.isArray(item.children) && item.children.length > 0;

    if (item.disabled) return;

    if (hasChildren) {
      if (isCollapsed) {
        openCollapsedPopover(event, item);
      } else {
        toggleExpanded(item.key, item);
      }

      setActive(item.key, item);

      // Tetap jalankan callback aplikasi
      item.onClick?.(event, item);

      return;
    }

    setActive(item.key, item);

    // Tetap jalankan navigasi aplikasi
    item.onClick?.(event, item);

    setOpenPopoverKey(null);
    setPopoverPos(null);
  };

  /*
   * Child menu click
   */
  const handleChildClick = (parentItem, childItem) => {
    if (childItem.disabled) return;

    setActive(childItem.key, childItem);

    childItem.onClick?.(undefined, childItem);

    if (isCollapsed) {
      setOpenPopoverKey(null);
      setPopoverPos(null);
    }

    if (!isCollapsed && !resolvedExpandedKeys.has(parentItem.key)) {
      toggleExpanded(parentItem.key, parentItem);
    }
  };

  /*
   * Close popover ketika klik di luar
   */
  useEffect(() => {
    if (!isCollapsed || !openPopoverKey) return;

    const handleOutside = (event) => {
      const target = event.target;

      if (popupRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;

      setOpenPopoverKey(null);
      setPopoverPos(null);
    };

    document.addEventListener("pointerdown", handleOutside);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
    };
  }, [isCollapsed, openPopoverKey]);

  /*
   * Close popover ketika expand
   */
  useEffect(() => {
    if (!isCollapsed) {
      setOpenPopoverKey(null);
      setPopoverPos(null);
    }
  }, [isCollapsed]);

  /*
   * Auto-expand parent dari active child
   */
  useEffect(() => {
    const parentKey = parentByChildKey.get(resolvedActiveKey);

    if (!parentKey || isCollapsed || isExpandedControlled) {
      return;
    }

    if (!internalExpandedKeys.has(parentKey)) {
      const nextSet = new Set(internalExpandedKeys);

      nextSet.add(parentKey);

      setInternalExpandedKeys(nextSet);
    }
  }, [
    resolvedActiveKey,
    parentByChildKey,
    isCollapsed,
    isExpandedControlled,
    internalExpandedKeys,
  ]);

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "flex h-dvh min-h-0 w-full flex-col",
        "overflow-hidden",
        "border-r border-[var(--border)]",
        "bg-[var(--surface)]",

        // Mobile
        "fixed inset-y-0 left-0 z-50",
        "transition-transform duration-300 ease-out",

        isOpen ? "translate-x-0" : "-translate-x-full",

        // Desktop
        "lg:sticky lg:top-0",
        "lg:h-dvh",
        "lg:translate-x-0",

        className,
      )}
      style={{
        width: isCollapsed ? collapsedWidth : width,
      }}
    >
      {/* =========================================
          MOBILE CLOSE
      ========================================= */}
      <div className="flex items-center justify-end border-b border-[var(--border)] bg-[var(--surface)] px-3 py-2 lg:hidden">
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
          aria-label="Tutup sidebar"
        >
          ×
        </button>
      </div>

      {/* BRAND */}
      <div
        className={cn(
          "relative flex h-[85px] w-full items-center border-b border-[var(--border)] bg-[var(--surface)]",
          isCollapsed ? "justify-center px-2" : "justify-start gap-3 px-6",
        )}
        aria-label={logoAlt}
      >
        {isCollapsed ? (
          /* ==========================================
              COLLAPSED
              Logo kantor menjadi tombol expand
            =========================================== */
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-neutral-100"
            aria-label="Buka sidebar"
            title="Buka sidebar"
          >
            {resolvedLogoSrc ? (
              <img
                src={resolvedLogoSrc}
                alt={logoAlt}
                className="h-10 w-10 object-contain"
              />
            ) : resolvedLogoNode ? (
              <div className="h-10 w-10">{resolvedLogoNode}</div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 font-bold text-sky-700">
                S
              </div>
            )}
          </button>
        ) : (
          /* ==========================================
              EXPANDED
            =========================================== */
          <>
            {/* LOGO KANTOR */}
            {resolvedLogoNode ? (
              <div className="h-12 w-12 shrink-0">{resolvedLogoNode}</div>
            ) : resolvedLogoSrc ? (
              <img
                src={resolvedLogoSrc}
                alt={logoAlt}
                className="block h-12 w-12 shrink-0 object-contain"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-sky-100 font-bold text-sky-700">
                S
              </div>
            )}

            {/* APP NAME */}
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-bold leading-5 text-neutral-800 dark:text-neutral-100">
                {appName}
              </div>
            </div>

            {/* COLLAPSE */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 lg:flex"
              aria-label="Kecilkan sidebar"
              title="Kecilkan sidebar"
            >
              <ChevronRightIcon className="h-4 w-4 rotate-180" />
            </button>
          </>
        )}
      </div>

      {/* =========================================
          MENU
      ========================================= */}
      <div className="min-h-0 flex-1 overflow-hidden p-3 pt-4">
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const hasChildren =
              Array.isArray(item.children) && item.children.length > 0;

            const isExpanded = resolvedExpandedKeys.has(item.key);

            const isActive = resolvedActiveKey === item.key;

            const hasActiveChild = hasChildren
              ? item.children.some((child) => child.key === resolvedActiveKey)
              : false;

            const showFilledActive = isActive || hasActiveChild;

            const Icon = item.icon;

            const rowTone = item.disabled
              ? "text-[var(--text-disabled)]"
              : showFilledActive
                ? "text-[var(--text-active)]"
                : "text-[var(--text-low-emphasis)]";

            return (
              <div key={item.key} className="w-full">
                {/* =====================================
                  MAIN MENU BUTTON
              ===================================== */}
                <motion.button
                  type="button"
                  disabled={item.disabled}
                  onClick={(event) => handleItemClick(event, item)}
                  className={cn(
                    "group relative flex min-h-12 w-full items-center rounded-2xl text-left",
                    "transition-colors duration-200",
                    isCollapsed ? "justify-center px-3" : "gap-3 px-4",
                    showFilledActive
                      ? "bg-[var(--accent-bg)] text-[--text-active]"
                      : "bg-transparent hover:bg-[var(--accent-bg)] hover:text-[--text-active]",
                    item.disabled ? "cursor-not-allowed" : "cursor-pointer",
                    rowTone,
                  )}
                  whileHover={item.disabled ? undefined : { x: 2 }}
                  whileTap={item.disabled ? undefined : { scale: 0.99 }}
                  transition={{
                    type: "spring",
                    stiffness: 440,
                    damping: 34,
                  }}
                >
                  {/* Active indicator ketika collapsed */}
                  {showFilledActive && isCollapsed && (
                    <span className="absolute -left-3 h-8 w-1.5 rounded-r-full bg-[var(--color-blue-600)]" />
                  )}

                  {/* Icon */}
                  {Icon ? (
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        showFilledActive
                          ? "text-[var(--icon-active)]"
                          : "text-current",
                      )}
                      aria-hidden="true"
                    />
                  ) : null}

                  {/* Label */}
                  {!isCollapsed && (
                    <span
                      className={cn(
                        "flex-1 truncate text-[14px] leading-5",
                        showFilledActive ? "font-semibold" : "font-medium",
                      )}
                    >
                      {item.label}
                    </span>
                  )}

                  {/* Chevron */}
                  {hasChildren && !isCollapsed && (
                    <span className="ml-2 shrink-0 text-current">
                      {isExpanded ? (
                        <ChevronDownIcon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      ) : (
                        <ChevronRightIcon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  )}
                </motion.button>

                {/* =====================================
                  CHILDREN
              ===================================== */}
                {hasChildren && !isCollapsed && (
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.22,
                          ease: "easeOut",
                        }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 mt-2 border-l-2 border-neutral-300 pl-4">
                          {item.children.map((child) => {
                            const isChildActive =
                              resolvedActiveKey === child.key;

                            return (
                              <motion.button
                                key={child.key}
                                type="button"
                                disabled={child.disabled}
                                onClick={() => handleChildClick(item, child)}
                                className={cn(
                                  "flex min-h-12 w-full items-center rounded-xl px-4 text-left text-[14px] leading-5",
                                  "transition-colors duration-150",
                                  child.disabled
                                    ? "cursor-not-allowed text-[var(--text-disabled)]"
                                    : isChildActive
                                      ? "font-semibold text-[var(--text-active)]"
                                      : "font-medium text-[var(--text-low-emphasis)] hover:bg-neutral-100",
                                )}
                                whileHover={
                                  child.disabled ? undefined : { x: 2 }
                                }
                                transition={{
                                  type: "spring",
                                  stiffness: 440,
                                  damping: 34,
                                }}
                              >
                                <span className="truncate">{child.label}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {/* =====================================
                  COLLAPSED SUBMENU POPOVER
              ===================================== */}
                {isCollapsed &&
                  hasChildren &&
                  openPopoverKey === item.key &&
                  popoverPos &&
                  createPortal(
                    <div
                      ref={popupRef}
                      style={{
                        left: popoverPos.left,
                        top: popoverPos.top,
                        transform: "translateY(-42%)",
                        zIndex: 9999,
                      }}
                      className="fixed min-w-[220px] rounded-2xl border border-neutral-200 bg-[var(--surface)] p-2 shadow-[0_10px_30px_rgba(16,24,40,0.12)]"
                    >
                      <ul className="space-y-1">
                        {item.children.map((child) => {
                          const isChildActive = resolvedActiveKey === child.key;

                          return (
                            <li key={child.key}>
                              <motion.button
                                type="button"
                                disabled={child.disabled}
                                onClick={() => handleChildClick(item, child)}
                                className={cn(
                                  "flex min-h-10 w-full items-center rounded-xl px-3 text-left text-[14px]",
                                  "transition-colors duration-150",
                                  child.disabled
                                    ? "cursor-not-allowed text-[var(--text-disabled)]"
                                    : isChildActive
                                      ? "bg-[var(--color-blue-50)] font-semibold text-[var(--text-active)]"
                                      : "font-medium text-[var(--text-medium-emphasis)] hover:bg-neutral-100",
                                )}
                                whileHover={
                                  child.disabled ? undefined : { x: 2 }
                                }
                                transition={{
                                  type: "spring",
                                  stiffness: 440,
                                  damping: 34,
                                }}
                              >
                                <span className="truncate">{child.label}</span>

                                <ChevronRightIcon className="ml-auto h-4 w-4 text-[var(--text-low-emphasis)]" />
                              </motion.button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>,
                    typeof document !== "undefined" ? document.body : null,
                  )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================
          FOOTER SIDEBAR
          Selalu berada di bagian paling bawah.
      ========================================= */}
      <div
        className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] px-3 pt-3"
        style={{
          paddingBottom: "8px",
        }}
      >
        {/* LOGOUT */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className={cn(
              "flex min-h-11 w-full items-center rounded-xl",
              "text-red-600",
              "transition-colors duration-200",
              "hover:bg-red-50",
              isCollapsed ? "justify-center px-3" : "gap-3 px-4",
            )}
            aria-label="Logout"
            title={isCollapsed ? "Logout" : undefined}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />

            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        )}
      </div>
    </nav>
  );
}

export default Sidebar;
