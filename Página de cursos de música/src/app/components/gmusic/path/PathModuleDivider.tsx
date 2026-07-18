import { GM_GOLD_MATT, GM_TEXT, GM_TEXT_SEC } from "../tokens";

interface PathModuleDividerProps {
  index: number;
  title: string;
  focus: string;
  completedInModule: number;
  totalInModule: number;
}

export function PathModuleDivider({
  index,
  title,
  focus,
  completedInModule,
  totalInModule,
}: PathModuleDividerProps) {
  return (
    <div className="my-10 md:my-14">
      <div className="flex items-center gap-4 mb-3">
        <div className="flex-1 h-px" style={{ background: GM_GOLD_MATT }} />
        <span
          className="text-[10px] font-medium tracking-[0.25em] uppercase whitespace-nowrap"
          style={{ color: GM_TEXT_SEC }}
        >
          Módulo {index}
        </span>
        <div className="flex-1 h-px" style={{ background: GM_GOLD_MATT }} />
      </div>
      <div className="text-center px-2">
        <h2 className="text-lg font-medium mb-1" style={{ color: GM_TEXT }}>
          {title}
        </h2>
        {focus.trim() ? (
          <p className="text-sm mb-2 max-w-sm mx-auto leading-relaxed" style={{ color: GM_TEXT_SEC }}>
            {focus}
          </p>
        ) : null}
        <p className="text-[11px] tracking-wide" style={{ color: "rgba(160,160,165,0.65)" }}>
          {completedInModule} de {totalInModule} lecciones recorridas
        </p>
      </div>
    </div>
  );
}
