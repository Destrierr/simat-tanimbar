import { useMemo, useRef, useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import Checkbox from "../checkbox/Checkbox";
import Button from "../button/Button";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function defaultAccessor(row, column) {
  if (typeof column.accessor === "function") {
    return column.accessor(row);
  }

  if (typeof column.accessor === "string") {
    return row[column.accessor];
  }

  if (column.key in row) {
    return row[column.key];
  }

  return "";
}

function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  const aDate = new Date(a);
  const bDate = new Date(b);
  const aDateOk = !Number.isNaN(aDate.getTime());
  const bDateOk = !Number.isNaN(bDate.getTime());

  if (aDateOk && bDateOk) {
    return aDate.getTime() - bDate.getTime();
  }

  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  return String(a).localeCompare(String(b), "id", {
    sensitivity: "base",
    numeric: true,
  });
}

function SortIndicator({ direction }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={direction ?? "none"}
        initial={{ opacity: 0, y: -4, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.9 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className="inline-flex"
      >
        {direction === "asc" ? (
          <ChevronUpIcon className="h-4 w-4 text-[var(--text-inverse)]" />
        ) : direction === "desc" ? (
          <ChevronDownIcon className="h-4 w-4 text-[var(--text-inverse)]" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-[var(--color-blue-100)]" />
        )}
      </motion.span>
    </AnimatePresence>
  );
}

const ACTION_CONFIG_MAP = {
  create: {
    icon: PlusIcon,
    variant: "primary",
    className: "!rounded-xl shadow-sm",
  },
  update: {
    icon: PencilSquareIcon,
    variant: "secondary",
    className: "!rounded-xl shadow-sm",
  },
  detail: {
    icon: EyeIcon,
    variant: "tertiary",
    className:
      "!rounded-xl !border !border-[var(--border)] !bg-[var(--bg)] !text-[var(--text-high-emphasis)] hover:!bg-[var(--color-blue-50)] dark:hover:!bg-slate-600 dark:hover:!border-slate-500 shadow-sm",
  },
  delete: {
    icon: TrashIcon,
    variant: "secondary",
    className:
      "!rounded-xl !border-[var(--color-error-300)] !text-[var(--text-error)] hover:!bg-[var(--color-error-100)] dark:hover:!bg-red-900 dark:hover:!border-red-700 shadow-sm",
  },
};

function ActionButton({ action, row }) {
  const actionKey = action.key ?? "custom";
  const config = ACTION_CONFIG_MAP[actionKey] ?? ACTION_CONFIG_MAP.detail;
  const Icon = action.icon ?? config.icon;
  const variant = action.variant ?? config.variant ?? "tertiary";
  const className = action.className ?? config.className ?? "";
  const accessibleLabel = action.label ?? actionKey;

  return (
    <Button
      type="button"
      onClick={(event) => action.onClick?.(row, event)}
      variant={variant}
      size="small"
      iconOnly
      icon={Icon}
      aria-label={`${accessibleLabel} ${row.id ?? row.key ?? "row"}`}
      className={cn("rounded-lg", className)}
    />
  );
}

function Table({
  className = "",
  columns = [],
  data = [],
  displayCount,
  rowKey = "id",
  selectable = true,
  selectedRowKeys,
  onSelectedRowKeysChange,
  defaultSort,
  rowActions,
  actions,
  onActionClick,
  actionsHeader = "Aksi",
}) {
  const [internalSelectedKeys, setInternalSelectedKeys] = useState([]);
  const [sortState, setSortState] = useState(defaultSort ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const scrollContainerRef = useRef(null);
  const dragStateRef = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    pointerId: null,
  });

  const isSelectionControlled = selectedRowKeys !== undefined;
  const activeSelectedKeys = isSelectionControlled
    ? selectedRowKeys
    : internalSelectedKeys;

  const resolvedColumns = useMemo(
    () =>
      columns.filter(Boolean).map((column, index) => ({
        ...column,
        key: column.key ?? column.accessor ?? `column-${index}`,
      })),
    [columns],
  );

  const sortedRows = useMemo(() => {
    if (!sortState?.key || !sortState.direction) return [...data];

    const targetColumn = resolvedColumns.find(
      (column) => column.key === sortState.key,
    );

    if (!targetColumn) return [...data];

    const factor = sortState.direction === "asc" ? 1 : -1;

    return [...data].sort((left, right) => {
      const leftValue = defaultAccessor(left, targetColumn);
      const rightValue = defaultAccessor(right, targetColumn);
      return compareValues(leftValue, rightValue) * factor;
    });
  }, [data, resolvedColumns, sortState]);

  const allRowKeys = useMemo(() => {
    const sourceRows =
      typeof displayCount === "number" && displayCount > 0
        ? sortedRows.slice(0, displayCount)
        : sortedRows;
    return sourceRows.map((row) => String(row[rowKey]));
  }, [rowKey, sortedRows, displayCount]);

  const selectedSet = useMemo(
    () => new Set(activeSelectedKeys.map(String)),
    [activeSelectedKeys],
  );

  const allChecked =
    selectable &&
    allRowKeys.length > 0 &&
    allRowKeys.every((key) => selectedSet.has(key));

  const isIndeterminate = selectable && selectedSet.size > 0 && !allChecked;

  const setSelection = (nextKeys) => {
    if (!isSelectionControlled) {
      setInternalSelectedKeys(nextKeys);
    }
    onSelectedRowKeysChange?.(nextKeys);
  };

  const toggleSelectAll = () => {
    if (!selectable) return;
    setSelection(allChecked ? [] : allRowKeys);
  };

  const toggleSelectRow = (rowKeyValue) => {
    if (!selectable) return;

    const key = String(rowKeyValue);
    const nextSet = new Set(selectedSet);
    if (nextSet.has(key)) {
      nextSet.delete(key);
    } else {
      nextSet.add(key);
    }

    setSelection([...nextSet]);
  };

  const toggleSort = (column) => {
    if (!column.sortable) return;

    setSortState((current) => {
      if (!current || current.key !== column.key) {
        return { key: column.key, direction: "asc" };
      }

      if (current.direction === "asc") {
        return { key: column.key, direction: "desc" };
      }

      return null;
    });
  };

  const renderCell = (row, column, index) => {
    if (typeof column.render === "function") {
      return column.render(row, index, defaultAccessor(row, column));
    }
    return defaultAccessor(row, column);
  };

  const parseActionKeys = (actionsProp) => {
    if (!actionsProp) return [];
    if (Array.isArray(actionsProp)) return actionsProp;
    if (typeof actionsProp === "string") {
      return actionsProp
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const actionKeys = useMemo(() => parseActionKeys(actions), [actions]);

  const normalizedActions = useMemo(() => {
    if (rowActions && rowActions.length > 0) {
      return rowActions.map((action, index) => ({
        key: action.key ?? `action-${index}`,
        label: action.label ?? action.key ?? "Action",
        onClick: action.onClick,
        icon: action.icon,
        variant: action.variant,
        className: action.className,
      }));
    }

    if (actionKeys.length > 0) {
      return actionKeys.map((key) => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        onClick: (row) => onActionClick?.(key, row),
        icon: ACTION_CONFIG_MAP[key]?.icon,
        variant: ACTION_CONFIG_MAP[key]?.variant,
        className: ACTION_CONFIG_MAP[key]?.className,
      }));
    }

    return [];
  }, [rowActions, actionKeys, onActionClick]);

  const showActions = normalizedActions.length > 0;
  const actionColumnWidth = Math.max(92, normalizedActions.length * 46 + 24);

  const visibleRows = useMemo(() => {
    if (typeof displayCount === "number" && displayCount > 0) {
      return sortedRows.slice(0, displayCount);
    }
    return sortedRows;
  }, [sortedRows, displayCount]);

  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (!scrollContainerRef.current) return;
    if (event.target.closest("button, a, input, select, textarea, label")) {
      return;
    }

    dragStateRef.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: scrollContainerRef.current.scrollLeft,
      pointerId: event.pointerId,
    };
    setIsDragging(true);
    scrollContainerRef.current.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragStateRef.current.active || !scrollContainerRef.current) return;
    const delta = event.clientX - dragStateRef.current.startX;
    scrollContainerRef.current.scrollLeft =
      dragStateRef.current.scrollLeft - delta;
  };

  const stopDrag = (event) => {
    if (!dragStateRef.current.active) return;
    dragStateRef.current.active = false;
    setIsDragging(false);
    if (event?.pointerId != null) {
      scrollContainerRef.current?.releasePointerCapture?.(event.pointerId);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="hidden overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] md:block">
        <div
          ref={scrollContainerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          onPointerLeave={stopDrag}
          className={cn(
            "overflow-x-auto select-none",
            "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent",
            "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--color-blue-100)]",
            "hover:[&::-webkit-scrollbar-thumb]:bg-[var(--color-blue-300)]",
            isDragging ? "cursor-grabbing" : "cursor-grab",
          )}
        >
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="border-b border-[var(--color-blue-300)] bg-[var(--color-blue-600)]">
                {selectable ? (
                  <th className="w-14 px-4 py-3 text-left">
                    <Checkbox
                      checked={allChecked}
                      indeterminate={isIndeterminate}
                      onChange={toggleSelectAll}
                      aria-label="Select all rows"
                    />
                  </th>
                ) : null}

                {resolvedColumns.map((column) => {
                  const isSorted = sortState?.key === column.key;
                  const direction = isSorted ? sortState.direction : null;

                  return (
                    <th key={column.key} className="px-4 py-3 text-left">
                      {column.sortable ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(column)}
                          className="s2 inline-flex items-center gap-1.5 text-[var(--text-inverse)] transition-colors hover:text-[var(--text-inverse)]"
                        >
                          <span>{column.header}</span>
                          <SortIndicator direction={direction} />
                        </button>
                      ) : (
                        <span className="s2 text-[var(--text-inverse)]">
                          {column.header}
                        </span>
                      )}
                    </th>
                  );
                })}

                {showActions ? (
                  <th
                    className="sticky right-0 z-20 border-l border-[var(--color-blue-300)] bg-[var(--color-blue-500)] px-4 py-3 text-left"
                    style={{
                      width: `${actionColumnWidth}px`,
                      minWidth: `${actionColumnWidth}px`,
                    }}
                  >
                    <span className="s2 text-[var(--text-inverse)]">
                      {actionsHeader}
                    </span>
                  </th>
                ) : null}
              </tr>
            </thead>

            <tbody>
              {visibleRows.map((row, index) => {
                const key = String(row[rowKey]);
                const checked = selectedSet.has(key);

                return (
                  <tr
                    key={key}
                    className={cn(
                      "group border-b border-[var(--border)] transition-colors last:border-b-0 hover:bg-[var(--color-blue-50)] dark:hover:bg-slate-700",
                      checked
                        ? "bg-[var(--color-blue-50)] dark:bg-slate-800"
                        : "",
                    )}
                  >
                    {selectable ? (
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={checked}
                          onChange={() => toggleSelectRow(key)}
                          aria-label={`Select row ${key}`}
                        />
                      </td>
                    ) : null}

                    {resolvedColumns.map((column) => (
                      <td
                        key={column.key}
                        className="b4 px-4 py-3 text-[var(--text-medium-emphasis)]"
                      >
                        {renderCell(row, column, index)}
                      </td>
                    ))}

                    {showActions ? (
                      <td
                        className={cn(
                          "sticky right-0 z-20 isolate border-l border-[var(--border)] px-4 py-3",
                          checked
                            ? "bg-[var(--color-blue-50)] dark:bg-slate-800"
                            : "bg-[var(--bg)] group-hover:bg-[var(--color-blue-50)] dark:group-hover:bg-slate-700",
                        )}
                        style={{
                          width: `${actionColumnWidth}px`,
                          minWidth: `${actionColumnWidth}px`,
                        }}
                      >
                        <div className="flex items-center justify-end gap-2">
                          {normalizedActions.map((action) => (
                            <ActionButton
                              key={action.key}
                              action={action}
                              row={row}
                            />
                          ))}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {visibleRows.map((row, index) => {
          const key = String(row[rowKey]);
          const checked = selectedSet.has(key);

          return (
            <article
              key={key}
              className={cn(
                "rounded-2xl border p-4",
                checked
                  ? "border-[var(--color-blue-300)] bg-[var(--color-blue-50)] dark:border-slate-600 dark:bg-slate-800"
                  : "border-[var(--border)] bg-[var(--bg)]",
              )}
            >
              {selectable ? (
                <div className="mb-3 flex justify-end">
                  <Checkbox
                    checked={checked}
                    onChange={() => toggleSelectRow(key)}
                    aria-label={`Select row ${key}`}
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                {resolvedColumns.map((column) => (
                  <div
                    key={column.key}
                    className="grid grid-cols-[96px_1fr] items-start gap-3"
                  >
                    <span className="b4 text-[var(--text-low-emphasis)]">
                      {column.header}
                    </span>
                    <div className="b4 text-[var(--text-high-emphasis)]">
                      {renderCell(row, column, index)}
                    </div>
                  </div>
                ))}

                {showActions ? (
                  <div className="pt-2">
                    <p className="b4 mb-2 text-[var(--text-low-emphasis)]">
                      {actionsHeader}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {normalizedActions.map((action) => (
                        <ActionButton
                          key={action.key}
                          action={action}
                          row={row}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default Table;
