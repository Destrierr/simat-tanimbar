import { useEffect, useState } from "react";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import { logoutService } from "../../services/auth";

import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/header/Header";
import ModalProfile from "../../components/profile/ModalProfile";

import {
  getMeService,
  editProfileService,
} from "../../services/profile/get_me";

import logoKantor from "../../assets/img/logo_kantor.webp";

import {
  HomeIcon,
  MapIcon,
  DocumentChartBarIcon,
  UsersIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

import useAppStore from "../../stores/useAppStore";

const HEADER_CONFIG = {
  "/dashboard": {
    title: "Dashboard",
    status: "Sistem Aktif",
    roles: ["admin", "operator", "viewer"],
  },

  "/assets": {
    title: "Manajemen Aset Tanah",
    roles: ["admin", "operator", "viewer"],
  },

  "/reports": {
    title: "Laporan Inventaris",
    roles: ["admin", "operator", "viewer"],
  },

  "/users": {
    title: "Manajemen Pengguna",
    status: "Admin Konsol",
    roles: ["admin"],
  },
  // "/kecamatan": {
  //   title: "Manajemen Kecamatan",
  //   status: "Admin Konsol",
  //   roles: ["admin"],
  // },
};

const normalize = (str) => str?.toLowerCase().replace(/\s+/g, "").trim();

function getHeader(path, role) {
  const cleanRole = normalize(role);
  const config = HEADER_CONFIG[path];

  if (config && config.roles.includes(cleanRole)) {
    return config;
  }

  return null;
}

function WorkspaceLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { role } = useAppStore();

  const [user, setUser] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 960 : true,
  );

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const SIDEBAR_EXPANDED_WIDTH = 280;
  const SIDEBAR_COLLAPSED_WIDTH = 92;

  /*
   * ============================================
   * GET USER
   * ============================================
   */
  const fetchUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const response = await getMeService();

      const data = response?.data;

      setUser({
        name: data?.name ?? "",
        username: data?.username ?? "",
        email: data?.email ?? "",
        photoprofile: data?.photoprofile ?? "",
      });
    } catch (err) {
      console.error("GetMe error:", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  /*
   * ============================================
   * RESPONSIVE SIDEBAR
   * ============================================
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 960) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
        setIsSidebarCollapsed(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /*
   * Tutup sidebar setelah navigasi pada mobile
   */
  useEffect(() => {
    if (window.innerWidth < 960) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  /*
   * ============================================
   * HEADER
   * ============================================
   */
  const header = getHeader(location.pathname, role) ?? {
    title: "SIMAT Tanimbar",
    status: "Sistem Aktif",
  };

  /*
   * ============================================
   * SIDEBAR MENU
   * ============================================
   */
  const sidebarItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: HomeIcon,

      onClick: () => {
        navigate("/dashboard");

        if (window.innerWidth < 960) {
          setIsSidebarOpen(false);
        }
      },
    },

    {
      key: "assets",
      label: "Manajemen Aset Tanah",
      icon: MapIcon,

      onClick: () => {
        navigate("/assets");

        if (window.innerWidth < 960) {
          setIsSidebarOpen(false);
        }
      },
    },

    {
      key: "reports",
      label: "Laporan Inventaris",
      icon: DocumentChartBarIcon,

      onClick: () => {
        navigate("/reports");

        if (window.innerWidth < 960) {
          setIsSidebarOpen(false);
        }
      },
    },

    ...(normalize(role) === "admin"
      ? [
          {
            key: "users",
            label: "Manajemen Pengguna",
            icon: UsersIcon,

            onClick: () => {
              navigate("/users");

              if (window.innerWidth < 960) {
                setIsSidebarOpen(false);
              }
            },
          },
          // {
          //   key: "kecamatan",
          //   label: "Manajemen Kecamatan",
          //   icon: MapPinIcon,

          //   onClick: () => {
          //     navigate("/kecamatan");

          //     if (window.innerWidth < 960) {
          //       setIsSidebarOpen(false);
          //     }
          //   },
          // },
        ]
      : []),
  ];

  /*
   * ============================================
   * SIDEBAR LOGOUT
   * ============================================
   */

  const handleLogout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("name");
      localStorage.removeItem("email");

      setUser(null);

      navigate("/", {
        replace: true,
      });
    }
  };

  /*
   * ============================================
   * LAYOUT
   * ============================================
   */
  return (
    <>
      {/* =====================================================
          MAIN APPLICATION LAYOUT

          Sidebar = tidak scroll
          Main    = satu-satunya area yang scroll
      ====================================================== */}
      <div
        className={[
          "grid h-dvh min-h-0 min-w-0 w-full grid-cols-1 overflow-hidden",
          isSidebarCollapsed
            ? "lg:grid-cols-[92px_minmax(0,1fr)]"
            : "lg:grid-cols-[270px_minmax(0,1fr)]",
        ].join(" ")}
      >
        {/* ===================================================
            SIDEBAR
        ==================================================== */}
        <Sidebar
          isOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onClose={() => setIsSidebarOpen(false)}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          onLogout={handleLogout}
          items={sidebarItems}
          activeKey={location.pathname.replace("/", "") || "dashboard"}
          logoSrc={logoKantor}
          collapsedLogoSrc={logoKantor}
          logoAlt="Logo SIMAT Tanimbar"
          appName="SIMAT Tanimbar"
          appDescription="Sistem Informasi Manajemen Aset Tanah · Kabupaten Kepulauan Tanimbar"
          width="100%"
          collapsedWidth="100%"
        />

        {/* ===================================================
            CONTENT COLUMN
        ==================================================== */}
        <div
          className={[
            "flex",
            "min-h-0",
            "min-w-0",
            "w-full",
            "flex-col",
            "overflow-hidden",
          ].join(" ")}
        >
          {/* HEADER
              Header tidak ikut scroll
          */}
          <div className="shrink-0">
            <Header
              title={header.title}
              status={header.status}
              user={user}
              role={role}
              onOpenSidebar={() => setIsSidebarOpen(true)}
              onOpenProfile={() => setIsProfileModalOpen(true)}
            />
          </div>

          {/* =================================================
              CONTENT

              HANYA BAGIAN INI YANG SCROLL
          ================================================== */}
          <main
            className={[
              "min-h-0",
              "min-w-0",
              "flex-1",
              "overflow-x-hidden",
              "overflow-y-auto",
              "overscroll-contain",
              "bg-[var(--surface-muted)]",
            ].join(" ")}
          >
            <Outlet key={location.pathname} />
          </main>
        </div>
      </div>

      {/* =====================================================
          PROFILE MODAL

          DILUAR GRID supaya tidak pernah dianggap
          sebagai grid item.
      ====================================================== */}
      <ModalProfile
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onSave={async (data) => {
          try {
            await editProfileService(data);

            localStorage.setItem("name", data.name ?? "");

            localStorage.setItem("email", data.email ?? "");

            await fetchUser();

            setIsProfileModalOpen(false);
          } catch (err) {
            console.error("onSave error:", err);

            alert(err?.resp_message || err?.message || "Gagal update profil");
          }
        }}
      />
    </>
  );
}

export default WorkspaceLayout;
