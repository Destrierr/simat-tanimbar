import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import {
  viewPhotoProfileService,
  deletePhotoProfileService,
} from "../../services/profile/get_me";
import BaseModal from "../modal/Modal";
import Input from "../input/Input";
import Button from "../button/Button";
import Avatar from "../avatar/Avatar";

export default function ModalProfile({ isOpen, onClose, user, onSave }) {
  const [form, setForm] = useState({ name: "", username: "", email: "" });
  const [avatar, setAvatar] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const fileRef = useRef(null);
  const avatarMenuRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
    });
    if (user.photoprofile)
      viewPhotoProfileService(user.photoprofile)
        .then(setAvatar)
        .catch(() => setAvatar(null));
    else setAvatar(null);
  }, [user]);

  useEffect(() => {
    const handler = (event) => {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(event.target)
      )
        setShowAvatarMenu(false);
    };
    if (showAvatarMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showAvatarMenu]);

  if (!isOpen) return null;
  const handleChange = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatar(URL.createObjectURL(file));
    setForm((current) => ({ ...current, avatarFile: file }));
  };
  const handleDeleteAvatar = async () => {
    try {
      await deletePhotoProfileService();
      setAvatar(null);
      setForm((current) => ({ ...current, avatarFile: null }));
      setShowAvatarMenu(false);
    } catch (err) {
      console.error("Gagal hapus foto:", err);
    }
  };
  const initials = form.name
    ? form.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="surface-card p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Profil Saya</h2>
            <p className="mt-1 text-xs text-[var(--text-medium-emphasis)]">
              Perbarui informasi profil dan foto pengguna.
            </p>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Tutup"
          >
            <Icon icon="lucide:x" width={17} />
          </button>
        </div>
        <div className="mb-6 flex justify-center">
          <div className="relative" ref={avatarMenuRef}>
            <button
              type="button"
              onClick={() => setShowAvatarMenu((value) => !value)}
              className="rounded-full ring-4 ring-[var(--accent-bg)]"
            >
              <Avatar name={form.name} src={avatar || undefined} size="h3" />
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white shadow-md transition hover:bg-sky-600"
              aria-label="Ubah foto"
            >
              <Icon icon="lucide:pencil" width={14} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            {showAvatarMenu ? (
              <div className="absolute left-1/2 top-[calc(100%+10px)] z-30 w-40 -translate-x-1/2 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setShowPreview(true);
                    setShowAvatarMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[var(--surface-muted)]"
                >
                  <Icon icon="lucide:eye" width={14} /> Lihat Foto
                </button>
                {avatar ? (
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10"
                  >
                    <Icon icon="lucide:trash-2" width={14} /> Hapus Foto
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onSave({ ...form, avatarFile: form.avatarFile });
          }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <Input
            label="Nama"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="sm:col-span-2"
          />
          <div className="sm:col-span-2 flex flex-col-reverse gap-2 border-t border-[var(--border)] pt-4 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </div>

      {showPreview ? (
        <div
          className="fixed inset-0 z-[10001] flex items-center justify-center bg-slate-950/80 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Avatar
              name={form.name}
              src={avatar || undefined}
              size="h2"
              className="h-72 w-72 border-4 border-white"
            />
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="icon-button absolute -right-3 -top-3 h-9 w-9 bg-white"
              aria-label="Tutup"
            >
              <Icon icon="lucide:x" width={16} />
            </button>
          </div>
        </div>
      ) : null}
    </BaseModal>
  );
}
