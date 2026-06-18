export type AcademiaInstrumentId = "guitarra" | "teclado" | "canto";

export interface AcademiaInstrument {
  id: AcademiaInstrumentId;
  name: string;
  variants: string;
  available: boolean;
  bgImage: string;
}

export const ACADEMIA_INSTRUMENTS: ReadonlyArray<AcademiaInstrument> = [
  {
    id: "guitarra",
    name: "Guitarra",
    variants: "Acústica · Eléctrica · Clásica",
    available: true,
    bgImage:
      "https://images.unsplash.com/photo-1750131418942-1638bdc87b06?w=600&q=80",
  },
  {
    id: "teclado",
    name: "Teclado",
    variants: "Piano · Sintetizador",
    available: false,
    bgImage:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&q=80",
  },
  {
    id: "canto",
    name: "Canto",
    variants: "Técnica vocal · Interpretación",
    available: false,
    bgImage:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80",
  },
];
