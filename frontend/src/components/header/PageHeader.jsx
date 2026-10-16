export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="page-header">
      <div className="page-header__copy">
        {eyebrow ? (
          <p className="mb-1.5 inline-flex items-center gap-2 text-[11px] font-semibold text-[var(--text-active)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="page-header__title">{title}</h1>
        {description ? (
          <p className="page-header__description">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}
