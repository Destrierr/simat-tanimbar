import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

const CONTENT_MOTION = {
  duration: 0.2,
  ease: "easeOut",
};

const ICON_MOTION = {
  type: "spring",
  stiffness: 420,
  damping: 30,
};

function buildInitialKeys(items, selectionMode, defaultExpandedKeys) {
  if (defaultExpandedKeys && defaultExpandedKeys.length > 0) {
    return selectionMode === "multiple"
      ? [...defaultExpandedKeys]
      : [defaultExpandedKeys[0]];
  }

  if (selectionMode === "single") {
    const firstAvailableKey = items.find((item) => !item.disabled)?.key;
    return firstAvailableKey ? [firstAvailableKey] : [];
  }

  return [];
}

function Accordion({
  className = "",
  defaultExpandedKeys,
  expandedKeys,
  items = [],
  onExpandedChange,
  selectionMode = "single",
  variant = "light",
  width = "100%",
}) {
  const normalizedItems = useMemo(
    () =>
      items.map((item, index) => ({
        ...item,
        key: item.key ?? String(index),
      })),
    [items],
  );

  const isControlled = expandedKeys !== undefined;
  const [internalExpandedKeys, setInternalExpandedKeys] = useState(() =>
    buildInitialKeys(normalizedItems, selectionMode, defaultExpandedKeys),
  );

  const activeKeys = isControlled ? expandedKeys : internalExpandedKeys;

  const setActiveKeys = (nextKeys) => {
    if (!isControlled) {
      setInternalExpandedKeys(nextKeys);
    }
    onExpandedChange?.(nextKeys);
  };

  const toggleItem = (key, disabled) => {
    if (disabled) return;

    const currentlyExpanded = activeKeys.includes(key);

    if (selectionMode === "multiple") {
      if (currentlyExpanded) {
        setActiveKeys(activeKeys.filter((activeKey) => activeKey !== key));
        return;
      }

      setActiveKeys([...activeKeys, key]);
      return;
    }

    if (currentlyExpanded) {
      setActiveKeys([]);
      return;
    }

    setActiveKeys([key]);
  };

  const isSolid = variant === "solid";

  return (
    <div
      className={cn(
        "flex w-full min-w-0 max-w-full self-stretch flex-col gap-2",
        className,
      )}
      style={{ width }}
    >
      {normalizedItems.map((item) => {
        const isExpanded = activeKeys.includes(item.key);
        const isDisabled = Boolean(item.disabled);

        return (
          <div
            key={item.key}
            className={cn(
              "w-full min-w-0 overflow-hidden rounded-2xl border transition-colors",
              isSolid
                ? "border-[var(--accent-border)] bg-[var(--accent-bg)]"
                : "border-[var(--border)] bg-[var(--bg)]",
              isExpanded ? "border-[var(--color-blue-300)]" : "",
              isDisabled ? "opacity-60" : "",
            )}
          >
            <button
              type="button"
              onClick={() => toggleItem(item.key, isDisabled)}
              disabled={isDisabled}
              className={cn(
                "flex min-h-12 w-full items-center gap-3 px-4 py-3 text-left transition-colors focus-visible:outline-none",
                isDisabled
                  ? "cursor-not-allowed"
                  : isSolid
                    ? "cursor-pointer hover:bg-[var(--accent-border)]"
                    : "cursor-pointer hover:bg-[var(--accent-bg)]",
              )}
            >
              {item.startContent ? (
                <span className="shrink-0 text-[var(--icon-active)]">
                  {item.startContent}
                </span>
              ) : null}

              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "s2 block whitespace-normal break-words",
                    isExpanded
                      ? "text-[var(--text-active)]"
                      : "text-[var(--text-high-emphasis)]",
                  )}
                >
                  {item.title}
                </span>
              </span>

              {item.endContent ? (
                <span className="shrink-0 text-[var(--icon-medium-emphasis)]">
                  {item.endContent}
                </span>
              ) : null}

              <motion.span
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={ICON_MOTION}
                className={cn(
                  "shrink-0",
                  isExpanded
                    ? "text-[var(--icon-active)]"
                    : "text-[var(--icon-medium-emphasis)]",
                )}
              >
                <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isExpanded ? (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={CONTENT_MOTION}
                  className="overflow-hidden"
                >
                  <div
                    className={cn(
                      "b4 border-t px-4 pb-4 pt-3 text-[var(--text-medium-emphasis)]",
                      isSolid
                        ? "border-[var(--accent-border)]"
                        : "border-[var(--border)]",
                    )}
                  >
                    {item.content}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
