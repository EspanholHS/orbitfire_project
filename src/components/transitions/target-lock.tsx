export function TargetLock() {
  return (
    <div className="orbitfire-target-lock" aria-hidden="true">
      <div className="absolute left-[56%] top-[43%] h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-300/50 shadow-[0_0_34px_rgba(249,115,22,0.24)]">
        <span className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-orange-300/80" />
        <span className="absolute bottom-0 left-1/2 h-4 w-px -translate-x-1/2 bg-orange-300/80" />
        <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-orange-300/80" />
        <span className="absolute right-0 top-1/2 h-px w-4 -translate-y-1/2 bg-orange-300/80" />
        <span className="absolute inset-5 rounded-full border border-orange-400/20" />
      </div>

      <div className="absolute left-[60%] top-[34%] hidden min-w-64 border-l border-orange-300/40 pl-4 md:block">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-orange-300">
          Concentração identificada
        </p>
        <p className="mt-2 text-xl font-medium tracking-tight text-white">
          Tocantins // 1.184 detecções
        </p>
      </div>

      <div className="absolute left-[12%] top-[60%] hidden min-w-72 border-r border-orange-300/30 pr-4 text-right md:block">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-orange-300">
          Bioma em destaque
        </p>
        <p className="mt-2 text-xl font-medium tracking-tight text-white">
          Cerrado // 2.088 focos detectados
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/42">
          FRP acumulado // 76.091,2 MW
        </p>
      </div>
    </div>
  );
}
