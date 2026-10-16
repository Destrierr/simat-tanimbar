import { useMemo, useState } from "react";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

const AVATAR_SIZE_MAP = {
  h2: {
    container: "h-[60px] w-[60px]",
    text: "text-[32px] leading-[36px] font-[700]",
  },
  h3: {
    container: "h-[48px] w-[48px]",
    text: "text-[24px] leading-[30px] font-[700]",
  },
  p4: {
    container: "h-[40px] w-[40px]",
    text: "text-[20px] leading-[28px] font-[700]",
  },
  s2: {
    container: "h-[32px] w-[32px]",
    text: "text-[16px] leading-[24px] font-[600]",
  },
};

function buildInitials(name, fallback) {
  if (fallback) return String(fallback).trim().slice(0, 2).toUpperCase();
  if (!name) return "A";

  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function Avatar({ alt, className = "", initials, name, size = "p4", src }) {
  const sizeConfig = AVATAR_SIZE_MAP[size] ?? AVATAR_SIZE_MAP.p4;
  const [imageFailed, setImageFailed] = useState(false);
  const computedInitials = useMemo(
    () => buildInitials(name, initials),
    [name, initials],
  );
  const showImage = Boolean(src) && !imageFailed;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        sizeConfig.container,
        showImage ? "bg-[#F7C6D7]" : "bg-[var(--color-blue-100)]",
        className,
      )}
      aria-label={alt ?? name ?? `Avatar ${computedInitials}`}
      title={name}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt ?? name ?? "Avatar"}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
          loading="lazy"
        />
      ) : (
        <span className={cn("text-[var(--text-active)]", sizeConfig.text)}>
          {computedInitials}
        </span>
      )}
    </span>
  );
}

export default Avatar;
