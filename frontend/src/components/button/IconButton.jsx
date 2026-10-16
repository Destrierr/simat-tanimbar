export default function IconButton({
  label,
  variant = "default",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`icon-button ${variant === "danger" ? "icon-button--danger" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
