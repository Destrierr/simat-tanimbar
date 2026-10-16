import { useState } from "react";
import { Icon } from "@iconify/react";
import ThemeToggle from "../ThemeToggle";
import Input from "../Input";
import Button from "../Button";
import BaseModal from "../Modal";
import useAppStore from "../../../stores/useAppStore";

export default function ModalSettings({
  isOpen,
  onClose,
  onChangePassword,
  loading = false,
}) {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [openPassword, setOpenPassword] = useState(false);
  const { theme, toggleTheme } = useAppStore();
  if (!isOpen) return null;

  const setField = (name) => (event) => {
    setForm((current) => ({ ...current, [name]: event.target.value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };
  const validate = () => {
    const next = {};
    if (!form.oldPassword) next.oldPassword = "Password lama wajib diisi";
    if (!form.newPassword) next.newPassword = "Password baru wajib diisi";
    else if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.newPassword))
      next.newPassword = "Minimal 8 karakter, 1 huruf kapital & 1 angka";
    if (!form.confirmPassword)
      next.confirmPassword = "Konfirmasi password wajib diisi";
    else if (form.newPassword !== form.confirmPassword)
      next.confirmPassword = "Password tidak sama";
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    await onChangePassword(form);
    setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setOpenPassword(false);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="surface-card p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Pengaturan</h2>
            <p className="mt-1 text-xs text-[var(--text-medium-emphasis)]">
              Atur tampilan dan keamanan akun Anda.
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
        <div className="rounded-xl border border-[var(--border)] p-3.5">
          <p className="field-label">Tampilan</p>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-bg)] text-[var(--text-active)]">
                <Icon
                  icon={theme === "dark" ? "lucide:moon" : "lucide:sun"}
                  width={16}
                />
              </span>
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </div>
            <ThemeToggle isDark={theme === "dark"} onToggle={toggleTheme} />
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-[var(--border)] p-3.5">
          <button
            type="button"
            onClick={() => setOpenPassword((value) => !value)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-bg)] text-[var(--text-active)]">
                <Icon icon="lucide:lock" width={16} />
              </span>
              Ubah Password
            </span>
            <Icon
              icon="lucide:chevron-down"
              width={17}
              className={`transition ${openPassword ? "rotate-180" : ""}`}
            />
          </button>
          {openPassword ? (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <Input
                label="Password Lama"
                type="password"
                value={form.oldPassword}
                onChange={setField("oldPassword")}
                state={errors.oldPassword ? "error" : "default"}
                helperText={errors.oldPassword || ""}
              />
              <Input
                label="Password Baru"
                type="password"
                value={form.newPassword}
                onChange={setField("newPassword")}
                state={errors.newPassword ? "error" : "default"}
                helperText={
                  errors.newPassword ||
                  "Minimal 8 karakter, 1 huruf kapital & 1 angka"
                }
              />
              <Input
                label="Konfirmasi Password"
                type="password"
                value={form.confirmPassword}
                onChange={setField("confirmPassword")}
                state={errors.confirmPassword ? "error" : "default"}
                helperText={errors.confirmPassword || ""}
              />
              <Button type="submit" className="w-full" loading={loading}>
                {loading ? "Menyimpan..." : "Simpan Password"}
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </BaseModal>
  );
}
