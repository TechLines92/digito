import type { AnimalGroup, ThemeColors } from "./types";

export const HOURS_ORDER = [
  "02HS",
  "08HS",
  "10HS",
  "12HS",
  "15HS",
  "17HS",
  "21HS",
  "23HS",
];

export const ANIMAIS: AnimalGroup[] = [
  { id: 1, nome: "AVESTRUZ", emoji: "🦤" },
  { id: 2, nome: "ÁGUIA", emoji: "🦅" },
  { id: 3, nome: "BURRO", emoji: "🫏" },
  { id: 4, nome: "BORBOLETA", emoji: "🦋" },
  { id: 5, nome: "CACHORRO", emoji: "🐕" },
  { id: 6, nome: "CABRA", emoji: "🐐" },
  { id: 7, nome: "CARNEIRO", emoji: "🐏" },
  { id: 8, nome: "CAMELO", emoji: "🐪" },
  { id: 9, nome: "COBRA", emoji: "🐍" },
  { id: 10, nome: "COELHO", emoji: "🐇" },
  { id: 11, nome: "CAVALO", emoji: "🐎" },
  { id: 12, nome: "ELEFANTE", emoji: "🐘" },
  { id: 13, nome: "GALO", emoji: "🐓" },
  { id: 14, nome: "GATO", emoji: "🐈" },
  { id: 15, nome: "JACARÉ", emoji: "🐊" },
  { id: 16, nome: "LEÃO", emoji: "🦁" },
  { id: 17, nome: "MACACO", emoji: "🐒" },
  { id: 18, nome: "PORCO", emoji: "🐖" },
  { id: 19, nome: "PAVÃO", emoji: "🦚" },
  { id: 20, nome: "PERU", emoji: "🦃" },
  { id: 21, nome: "TOURO", emoji: "🐂" },
  { id: 22, nome: "TIGRE", emoji: "🐅" },
  { id: 23, nome: "URSO", emoji: "🐻" },
  { id: 24, nome: "VEADO", emoji: "🦌" },
  { id: 25, nome: "VACA", emoji: "🐄" },
];

export const THEME_COLORS: ThemeColors = {
  bg: "#09090f",
  panel: "#111318",
  bdr: "#1e2430",
  yellow: "#ffd700",
  green: "#00ff88",
  orange: "#ff9900",
  dim: "#3a4055",
  text: "#c8d0e0",
  red: "#ff4466",
};
