import { useEffect, useRef } from "react";
import type { PathModuleData, PathNodeData } from "../../../data/gmusic-path-types";
import { PathModuleDivider } from "./PathModuleDivider";
import { PathNode } from "./PathNode";
import { PathConnector } from "./PathConnector";
import { LevelingChallengeButton } from "./LevelingChallengeButton";

export interface SerpentinePathMapProps {
  modules: PathModuleData[];
  activeNodeId: string | null;
  selectedNodeId?: string | null;
  onLevelingChallenge: () => void;
  onNodeSelect?: (node: PathNodeData) => void;
}

export function SerpentinePathMap({
  modules,
  activeNodeId,
  selectedNodeId,
  onLevelingChallenge,
  onNodeSelect,
}: SerpentinePathMapProps) {
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeNodeId) return;
    const t = setTimeout(() => {
      activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
    return () => clearTimeout(t);
  }, [activeNodeId, modules]);

  return (
    <div className="relative max-w-lg mx-auto px-1 sm:px-4 pb-8">
      {modules.map((mod, modIdx) => {
        const completedInModule = mod.nodes.filter((n) => n.status === "completed").length;

        return (
          <div key={mod.id}>
            <PathModuleDivider
              index={mod.index}
              title={mod.title}
              focus={mod.focus}
              completedInModule={completedInModule}
              totalInModule={mod.nodes.length}
            />
            <div className="relative">
              {mod.nodes.map((node, i) => {
                const next = mod.nodes[i + 1];
                const isActiveNode = node.id === activeNodeId;
                const isSelected = node.id === selectedNodeId;

                return (
                  <div
                    key={node.id}
                    ref={isActiveNode ? activeRef : undefined}
                    className="relative"
                    style={{ zIndex: 1 }}
                  >
                    {next && (
                      <PathConnector
                        from={node.lane}
                        to={next.lane}
                        lit={node.status === "completed"}
                      />
                    )}
                    <PathNode
                      node={node}
                      stepIndex={i + 1}
                      isSelected={isSelected}
                      onSelect={onNodeSelect}
                    />
                  </div>
                );
              })}
            </div>
            {modIdx === modules.length - 1 && (
              <LevelingChallengeButton onClick={onLevelingChallenge} />
            )}
          </div>
        );
      })}
    </div>
  );
}
