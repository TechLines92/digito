export type Draw = {
  label: string;
  milhares: string[];
};

export type DayResult = {
  date: string;
  draws: Draw[];
};

export type TabMode = "dia" | "geral" | "palpites";

export type ParsedTextResult = {
  date: string | null;
  draws: Draw[];
};

export type AnimalGroup = {
  id: number;
  nome: string;
  emoji: string;
};

export type ThemeColors = {
  bg: string;
  panel: string;
  bdr: string;
  yellow: string;
  green: string;
  orange: string;
  dim: string;
  text: string;
  red: string;
};
