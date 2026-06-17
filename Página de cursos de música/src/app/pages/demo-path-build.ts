import type { PathModuleData, PathNodeData, PathLane } from "../data/gmusic-path-types";
import {
  DEMO_ACADEMY_MORE_COUNT,
  DEMO_ACADEMY_TEASER_NODE_ID,
  DEMO_CAROUSEL_LESSON_COUNT,
  DEMO_FREE_LESSON_COUNT,
  DEMO_PATH_TOTAL_LESSONS,
  getCarouselDemoPathEntries,
  isFreeDemoLesson,
} from "../data/demo-path-catalog";

const DEMO_LANES: PathLane[] = ["center", "right", "center", "left", "center"];

function laneForIndex(index: number): PathLane {
  if (index < DEMO_LANES.length) return DEMO_LANES[index] ?? "center";
  return (["center", "left", "right"] as const)[index % 3] ?? "center";
}

function buildAcademyTeaserNode(): PathNodeData {
  return {
    id: DEMO_ACADEMY_TEASER_NODE_ID,
    title: `Más de ${DEMO_ACADEMY_MORE_COUNT} clases te esperan en la Academia`,
    type: "reward",
    status: "available",
    lane: "center",
    typeLabel: `Camino completo · ${DEMO_PATH_TOTAL_LESSONS} lecciones`,
    description: "Academia Gmusic",
  };
}

export function buildDemoModules(completedLessons: number[]): PathModuleData[] {
  const entries = getCarouselDemoPathEntries();
  const nextFreeLesson = completedLessons.filter(isFreeDemoLesson).length + 1;

  const nodes: PathNodeData[] = entries.map((entry, index) => {
    const { lessonNumber, title, subtitle, videoDuration } = entry;
    let status: PathNodeData["status"];

    if (!entry.isFree) {
      status = "locked";
    } else if (completedLessons.includes(lessonNumber)) {
      status = "completed";
    } else if (lessonNumber === nextFreeLesson) {
      status = "active";
    } else {
      status = "locked";
    }

    return {
      id: `demo-node-${lessonNumber}`,
      title,
      type: "video" as const,
      status,
      lane: laneForIndex(index),
      duration: videoDuration,
      typeLabel: subtitle,
      description: entry.moduleName,
    };
  });

  nodes.push(buildAcademyTeaserNode());

  return [
    {
      id: "demo-path-teaser",
      index: 1,
      title: "Camino Gmusic",
      focus: `${DEMO_FREE_LESSON_COUNT} gratuitas · ${DEMO_CAROUSEL_LESSON_COUNT} en preview · ${DEMO_PATH_TOTAL_LESSONS} en academia`,
      nodes,
    },
  ];
}

export function countFreeDemoCompleted(completedLessons: number[]): number {
  return completedLessons.filter(isFreeDemoLesson).length;
}
