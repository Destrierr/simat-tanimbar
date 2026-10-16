import { Icon } from "@iconify/react";
import bannerDashboard from "../../assets/img/banner.png";

function WelcomeBanner() {
  return (
    <section
      className="relative isolate overflow-hidden rounded-2xl shadow-sm"
      style={{
        backgroundImage: `url(${bannerDashboard})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* OVERLAY */}
      <div className="absolute inset-0 -z-10 bg-sky-900/70" />

      {/* OVERLAY GRADIENT */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-800/85 via-blue-500/70 to-blue-300/30" />

      {/* ORNAMEN */}
      <div className="pointer-events-none absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

      <div className="pointer-events-none absolute -bottom-16 right-20 -z-10 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

      {/* CONTENT */}
      <div className="relative flex min-h-[180px] flex-col justify-center px-5 py-6 sm:min-h-[200px] sm:px-8 sm:py-8 lg:min-h-[220px]">
        <div className="max-w-3xl">
          {/* EYEBROW */}
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/90">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
              <Icon icon="lucide:hand" width={17} />
            </span>

            <span>Selamat Datang di Sistem</span>
          </div>

          {/* TITLE */}
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
            Sistem Informasi Manajemen Aset Tanah
          </h2>

          {/* LOCATION */}
          <p className="mt-1 text-sm font-medium text-white/85 sm:text-base">
            Kabupaten Kepulauan Tanimbar
          </p>

          {/* DESCRIPTION */}
          <p className="mt-2 max-w-2xl text-xs leading-5 text-white/75 sm:text-sm">
            Kelola dan pantau data aset tanah secara terintegrasi, terstruktur,
            dan mudah diakses.
          </p>
        </div>

        {/* ICON */}
        {/* <div className="absolute bottom-6 right-6 hidden sm:flex">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md">
            <Icon
              icon="lucide:land-plot"
              width={40}
              className="text-white"
            />
          </div>
        </div> */}
      </div>
    </section>
  );
}

export default WelcomeBanner;
