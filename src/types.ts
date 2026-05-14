export type Draw = {
  label: string;
  milhares: string[];
};

export type DayResult = {
  date: string;
  draws: Draw[];
};

export type TabMode = "dia" | "geral" | "palpites" | "game";

export type GameUser = {
  password: string;
  name: string;
  points: number;
};

export type GameBet = {
  id: string;
  userPassword: string;
  betType: "grupo" | "dezena" | "centena" | "milhar";
  betValue: string;
  amount: number;
  date: string;
  drawLabel: string;
  scope: "cabeca" | "1-5" | "1-10";
  settled: boolean;
  won: boolean | null;
};

export type GameData = {
  users: GameUser[];
  bets: GameBet[];
  nextBetId: number;
};

export type Prediction = {
  id: string;
  tipo: "dezena" | "centena" | "grupo";
  dezena: string;
  horario: string;
  dataPrevista: string;
  score: number;
  dataCriacao: string;
  result: "pending" | "hit" | "miss";
};

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
