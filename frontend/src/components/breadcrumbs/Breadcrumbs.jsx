import { ChevronRightIcon } from "@heroicons/react/24/outline";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Breadcrumbs({ className = "", items = [], separator, onItemClick }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("w-full overflow-x-auto", className)}
    >
      <ol className="flex min-w-max items-center gap-1">
        {items.map((item, index) => {
          const key = item.key ?? `${item.label}-${index}`;
          const isCurrent =
            item.current ?? (index === items.length - 1 && !item.href);
          const content = (
            <>
              {item.icon ? (
                <span className="shrink-0 text-[var(--icon-medium-emphasis)]">
                  {item.icon}
                </span>
              ) : null}
              <span>{item.label}</span>
            </>
          );

          return (
            <li key={key} className="flex items-center gap-1">
              {isCurrent ? (
                <span
                  aria-current="page"
                  className="b3 inline-flex items-center gap-1 rounded-lg bg-[var(--color-blue-50)] px-2 py-1 text-[var(--text-active)]"
                >
                  {content}
                </span>
              ) : (
                <a
                  href={item.href ?? "#"}
                  onClick={(event) => {
                    item.onClick?.(event, item);
                    onItemClick?.(event, item, index);
                  }}
                  className="b4 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[var(--text-medium-emphasis)] transition-colors hover:bg-[var(--color-blue-50)] hover:text-[var(--text-active)]"
                >
                  {content}
                </a>
              )}

              {index < items.length - 1 ? (
                <span
                  className="text-[var(--icon-low-emphasis)]"
                  aria-hidden="true"
                >
                  {separator ?? <ChevronRightIcon className="h-4 w-4" />}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
