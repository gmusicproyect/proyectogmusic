import type { Course } from "../types/music-app";

export const SEMESTRAL_PLAN_NAME = "Semestral";

export const SEMESTRAL_CHECKOUT_COURSE = {
  id: 9001,
  title: "Gmusic Estudio · Plan Semestral",
  instructor: "Gmusic Estudio",
  instructorImg: "https://images.unsplash.com/photo-1603661850942-3b922be12831?w=100&q=80",
  image: "https://images.unsplash.com/photo-1603661850942-3b922be12831?w=800&q=80",
  level: "Básico",
  levelColor: "#C9A84C",
  duration: "6 meses",
  lessons: 24,
  students: 0,
  rating: 5,
  price: 349,
  tags: ["Guitarra", "Semestral", "Academia"],
  description: "Acceso semestral al programa de guitarra de Gmusic Estudio.",
  featured: true,
} satisfies Course;

export interface SemestralCheckoutPlan {
  name: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
}

export function isSemestralCheckoutCourse(
  course: Pick<Course, "id">
): course is typeof SEMESTRAL_CHECKOUT_COURSE {
  return course.id === SEMESTRAL_CHECKOUT_COURSE.id;
}

export function getSemestralCheckoutPlan(): SemestralCheckoutPlan {
  return {
    name: SEMESTRAL_PLAN_NAME,
    price: SEMESTRAL_CHECKOUT_COURSE.price,
    duration: SEMESTRAL_CHECKOUT_COURSE.duration,
    description: "Acceso semestral • 6 meses de programa guiado",
    features: [
      "Acceso completo a la zona del alumno",
      "Programa semestral de guitarra",
      "Progreso persistido en plataforma",
      "Soporte de la academia",
    ],
  };
}
