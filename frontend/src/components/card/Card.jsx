export default function Card({
  children,
  className = "",
  padding = true,
  ...props
}) {
  return (
    <section
      {...props}
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] ${padding ? "p-4" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
