import backgroundImage from "../../assets/img/bg.png";

export default function AuthLayout({ left, right }) {
  return (
    <main className="min-h-screen bg-white transition-colors duration-300 dark:bg-slate-900 lg:flex">
      <section className="relative isolate flex min-h-[620px] flex-col justify-center overflow-hidden px-7 py-14 sm:px-12 lg:min-h-screen lg:w-[55%] lg:px-16 xl:px-24">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-[center_58%]"
          style={{ backgroundImage: `url(${backgroundImage})` }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-[#07549a]/95 via-[#0874c5]/90 to-[#1595eb]/55 dark:from-slate-950/95 dark:via-blue-950/90 dark:to-slate-900/75"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-t from-[#06477f]/65 via-transparent to-[#0862a8]/20 dark:from-black/65 dark:via-slate-950/15 dark:to-slate-950/40"
          aria-hidden="true"
        />
        <div className="mx-auto w-full max-w-2xl">{left}</div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5 py-20 transition-colors duration-300 dark:bg-slate-900 sm:px-10 lg:w-[45%] lg:px-12 lg:py-16">
        <div className="relative z-10 w-full max-w-[560px]">{right}</div>
      </section>
    </main>
  );
}
