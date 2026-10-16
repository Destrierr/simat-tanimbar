import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { viewPhotoProfileService } from "../../../services/profile/get_me";
import Avatar from "../Avatar";

function ProfileMenu({
  user,
  onLogout,
  isCollapsed,
  onOpenProfile,
  onOpenSettings,
  isLoggingOut,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (user?.photoprofile) {
      viewPhotoProfileService(user.photoprofile)
        .then((url) => setAvatarUrl(url))
        .catch(() => setAvatarUrl(null));
    } else {
      setAvatarUrl(null);
    }
  }, [user?.photoprofile]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      {/* TRIGGER */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`w-full flex items-center px-3 py-2 rounded-xl 
          hover:bg-white/10
          text-sky-100
          transition-colors
          gap-3`}
      >
        {/* AVATAR */}
        <Avatar
          name={user?.name || "User"}
          src={avatarUrl}
          size={36}
          className="shrink-0"
        />

        {/* USER INFO */}
        <div
          className={`flex min-w-0 flex-col overflow-hidden text-left whitespace-nowrap transition-[max-width,opacity] duration-200 ease-in-out ${isCollapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100 delay-75"}`}
        >
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
            {user?.name || "Unknown User"}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
            {user?.email || ""}
          </span>
        </div>

        {/* CHEVRON */}
        <Icon
          icon="lucide:chevron-up"
          className={`ml-auto flex-shrink-0 transition-[transform,opacity] duration-200 text-slate-400 dark:text-slate-500
              ${isCollapsed ? "w-0 opacity-0" : "opacity-100"} ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* DROPDOWN */}
      {isOpen && (
        <div
          className="absolute bottom-14 left-0 w-56 
          bg-white dark:bg-slate-900 
          border border-slate-200 dark:border-slate-700 
          rounded-xl shadow-lg p-2 z-50"
        >
          <button
            onClick={() => {
              onOpenProfile();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded
              text-slate-700 dark:text-slate-300
              hover:bg-slate-100 dark:hover:bg-slate-800
              transition-colors"
          >
            <Icon icon="lucide:user" width={16} />
            Profil Saya
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded
              text-slate-700 dark:text-slate-300
              hover:bg-slate-100 dark:hover:bg-slate-800
              transition-colors"
          >
            <Icon icon="lucide:settings" width={16} />
            Pengaturan
          </button>

          <div className="my-2 h-px bg-slate-200 dark:bg-slate-700" />

          <button
            onClick={onLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded
              text-red-500 dark:text-red-400
              hover:bg-red-50 dark:hover:bg-red-500/10
              transition-colors"
          >
            <Icon icon="lucide:log-out" width={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
