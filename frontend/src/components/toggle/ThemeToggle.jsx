import { Icon } from "@iconify/react";

export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle dark/light theme"
      className={`
        p-2 rounded-full transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500
        ${
          isDark
            ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
            : "bg-sky-100 text-sky-400 hover:bg-sky-200"
        }
      `}
    >
      <Icon
        icon={isDark ? "lucide:moon" : "lucide:sun"}
        width={20}
        className="transition-transform duration-300 hover:rotate-12"
      />
    </button>
  );
}
