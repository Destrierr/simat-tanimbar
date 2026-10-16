import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Input from "../../components/input/Input";
import Button from "../../components/button/Button";
import { loginService } from "../../services/auth";
import LoadingPage from "../../components/loading/LoadingPage";
import ThemeToggle from "../../components/toggle/ThemeToggle";
import useAppStore from "../../stores/useAppStore";
import { useAlert } from "../../hooks/useAlert";
import Alert from "../../components/alert/Alert";
import { Icon } from "@iconify/react";
import logoKantor from "../../assets/img/logo_kantor.webp";

const DEMO_ACCOUNTS = [
  {
    role: "Admin",
    username: "admin",
    password: "password",
    icon: "lucide:shield-check",
  },
  {
    role: "Operator",
    username: "operator",
    password: "password",
    icon: "lucide:user-cog",
  },
  {
    role: "Viewer",
    username: "viewer",
    password: "password",
    icon: "lucide:user-round",
  },
];

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { alert, showAlert } = useAlert();
  const { setRole, theme, toggleTheme } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUsername = localStorage.getItem("remembered_username");
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error sebelumnya
    setUsernameError("");
    setPasswordError("");

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    let hasError = false;

    if (!trimmedUsername) {
      setUsernameError("Username wajib diisi.");
      hasError = true;
    }

    // Validasi password
    if (!trimmedPassword) {
      setPasswordError("Password wajib diisi.");
      hasError = true;
    }

    // Jangan lanjut ke API kalau validasi gagal
    if (hasError) {
      return;
    }

    setLoading(true);

    try {
      const res = await loginService(trimmedUsername, trimmedPassword);

      const token = res.data.access_token;

      const role = res.data.role?.toLowerCase().replace(/\s+/g, "").trim();

      localStorage.setItem("token", token);
      setRole(role);

      if (rememberMe) {
        localStorage.setItem("remembered_username", trimmedUsername);
      } else {
        localStorage.removeItem("remembered_username");
      }

      showAlert("success", "Login berhasil.");
      navigate("/dashboard");
    } catch (err) {
      const status = err?.response?.status ?? err?.status ?? err?.statusCode;

      // Email / password salah
      if (status === 401 || status === 403) {
        setUsernameError("Username atau password salah.");
        setPasswordError("Email atau password salah.");
        return;
      }

      // Error lainnya tetap gunakan alert
      const message =
        err?.detail ||
        err?.resp_message ||
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Login gagal. Silakan coba lagi.";

      showAlert("error", message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: "lucide:map-pin",
      title: "Informasi Lokasi",
      text: "Simpan lokasi administratif dan tautan Google Maps pada setiap aset.",
    },
    {
      icon: "lucide:file-text",
      title: "Dokumen Legalitas",
      text: "Kelola dan akses dokumen legalitas aset tanah dengan mudah.",
    },
    {
      icon: "lucide:shield-check",
      title: "Akses Aman & Terpercaya",
      text: "Sistem dengan keamanan data dan kontrol akses berlapis.",
    },
  ];

  return (
    <div className="relative">
      {alert.show ? <Alert type={alert.type} message={alert.message} /> : null}
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle isDark={theme === "dark"} onToggle={toggleTheme} />
      </div>
      <AuthLayout
        left={
          <div className="text-white">
            <div className="mb-10 flex items-center gap-3">
              <img
                src={logoKantor}
                alt=""
                className="h-14 w-14 object-contain"
              />
              <div>
                <p className="text-sm font-extrabold uppercase leading-tight tracking-wide text-white">
                  Kabupaten
                  <br />
                  Kepulauan Tanimbar
                </p>
                <p className="mt-1 text-xs italic text-sky-100">
                  Melayani, Profesional, Terpercaya
                </p>
              </div>
            </div>
            <h1 className="mb-4 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
              Selamat Datang di
              <br />
              <span className="text-sky-300">SIMAT Tanimbar</span>
            </h1>
            <p className="mb-8 max-w-xl text-sm leading-relaxed text-sky-50 md:text-base">
              Kelola data aset tanah, dokumen legalitas, dan lokasi aset tanah
              Kabupaten Kepulauan Tanimbar dalam satu workspace yang cepat,
              aman, dan konsisten.
            </p>
            <div className="space-y-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex max-w-md items-center gap-3"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sky-100 ring-1 ring-white/10">
                    <Icon icon={feature.icon} width={21} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-sky-100">
                      {feature.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
        right={
          <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-md)] sm:p-8">
            <div className="mb-7 text-center">
              <img
                src={logoKantor}
                alt="Logo Kabupaten Kepulauan Tanimbar"
                className="mx-auto mb-3 h-14 w-14 object-contain"
              />
              <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-high-emphasis)]">
                SIMAT<span className="text-sky-500">TANIMBAR</span>
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-medium-emphasis)]">
                Sistem Informasi Manajemen Aset Tanah
                <br />
                Kabupaten Kepulauan Tanimbar
              </p>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Username"
                type="text"
                placeholder="Masukkan username Anda"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (usernameError) {
                    setUsernameError("");
                  }
                }}
                helperText={usernameError}
                state={usernameError ? "error" : "default"}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Masukkan password Anda"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) {
                    setPasswordError("");
                  }
                }}
                helperText={passwordError}
                state={passwordError ? "error" : "default"}
              />
              <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-medium-emphasis)]">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-sky-500"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />{" "}
                Ingat Saya
              </label>
              <Button type="submit" className="w-full" loading={loading}>
                {loading ? (
                  "Memproses..."
                ) : (
                  <>
                    <span>Masuk</span>
                  </>
                )}
              </Button>
            </form>
            <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50/70 p-3 dark:border-sky-900/40 dark:bg-sky-900/10">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold text-[var(--text-high-emphasis)]">
                  Akun Demo
                </p>
                <p className="text-[9px] text-[var(--text-low-emphasis)]">
                  Pilih untuk mengisi form
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.username}
                    type="button"
                    onClick={() => {
                      setUsername(account.username);
                      setPassword(account.password);
                    }}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 text-left transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-border-sky-600 dark:hover:bg-slate-800"
                  >
                    <span className="flex items-center gap-1.5 text-[10px] font-bold">
                      <Icon icon={account.icon} width={13} />
                      {account.role}
                    </span>
                    <span className="mt-1 block truncate text-[9px] text-[var(--text-medium-emphasis)]">
                      {account.username}
                    </span>
                    <span className="mt-0.5 block text-[8px] text-[var(--text-low-emphasis)]">
                      Password demo: {account.password}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 border-t border-[var(--border)] pt-4 text-center text-[10px] leading-relaxed text-[var(--text-low-emphasis)]">
              Sistem ini dikelola oleh
              <br />
              <span className="font-bold text-[var(--text-medium-emphasis)]">
                Pemerintah Kabupaten Kepulauan Tanimbar
              </span>
            </div>
          </div>
        }
      />
      <LoadingPage
        isLoading={loading}
        videoSrc="/bots/question-and-answer.mp4"
        message="Loading..."
        animationSize={200}
      />
    </div>
  );
}
