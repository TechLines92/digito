import { useEffect, useRef, useState } from "react";
import { ANIMAIS, HOURS_ORDER, THEME_COLORS } from "../constants";
import { getGrupoIdFromMilhar } from "../utils";
import { loadGameData, saveGameData } from "../supabase";
import type { DayResult, GameData, GameBet, GameUser } from "../types";
import { BetsCarousel } from "./BetsCarousel";
import jsPDF from "jspdf";

const { bg, panel, bdr, yellow, green, orange, dim, text, red } = THEME_COLORS;
const bebas = "'Bebas Neue', sans-serif";
const mono = "'Share Tech Mono', monospace";

const MULTIPLIERS: Record<string, number> = {
  grupo: 25,
  dezena: 100,
  centena: 1000,
  milhar: 10000,
};

function calcPrize(amount: number, betType: string, scope: string, position: number): number {
  const base = MULTIPLIERS[betType];
  if (scope === "cabeca") return position === 0 ? amount * base : 0;
  if (scope === "1-5") return position < 5 ? Math.floor(amount * base / 5) : 0;
  return Math.floor(amount * base / 10);
}

function scopeMultiplier(scope: string): string {
  if (scope === "cabeca") return "";
  return ` (÷${scope === "1-5" ? "5" : "10"})`;
}

function getBetPrize(bet: GameBet, days: DayResult[]): number {
  const dayResult = days.find((d) => d.date === bet.date);
  if (!dayResult) return 0;
  const draw = dayResult.draws.find((d) => d.label === bet.drawLabel);
  if (!draw) return 0;
  for (let i = 0; i < draw.milhares.length; i++) {
    const milhar = draw.milhares[i];
    let match = false;
    if (bet.betType === "milhar" && milhar === bet.betValue) match = true;
    else if (bet.betType === "centena" && milhar.slice(-3) === bet.betValue) match = true;
    else if (bet.betType === "dezena" && milhar.slice(-2) === bet.betValue) match = true;
    else if (bet.betType === "grupo") {
      const gid = getGrupoIdFromMilhar(milhar);
      if (gid === parseInt(bet.betValue, 10)) match = true;
    }
    if (match) return calcPrize(bet.amount, bet.betType, bet.scope, i);
  }
  return 0;
}

const PASSWORD_MAP: Record<string, string> = {
  "2504": "Milena",
  "1004": "Luan",
  "admin": "Banca",
};

const DEFAULT_USERS: GameUser[] = [
  { password: "2504", name: "Milena", points: 1000 },
  { password: "1004", name: "Luan", points: 1000 },
  { password: "admin", name: "Banca", points: 0 },
];

const DEFAULT_GAME_DATA: GameData = {
  users: DEFAULT_USERS,
  bets: [],
  nextBetId: 1,
};

function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function getNextDraw(days: DayResult[]): string {
  const allWithResults: { date: string; label: string }[] = [];

  for (const day of days) {
    for (const draw of day.draws) {
      if (draw.milhares.length > 0) {
        allWithResults.push({ date: day.date, label: draw.label });
      }
    }
  }

  if (allWithResults.length === 0) {
    return HOURS_ORDER[0];
  }

  allWithResults.sort((a, b) => {
    const [aD, aM, aY] = a.date.split("/").map(Number);
    const [bD, bM, bY] = b.date.split("/").map(Number);
    const aDate = new Date(aY, aM - 1, aD).getTime();
    const bDate = new Date(bY, bM - 1, bD).getTime();
    if (aDate !== bDate) return bDate - aDate;
    return HOURS_ORDER.indexOf(b.label) - HOURS_ORDER.indexOf(a.label);
  });

  const last = allWithResults[0];
  const lastIdx = HOURS_ORDER.indexOf(last.label);
  const nextIdx = (lastIdx + 1) % HOURS_ORDER.length;

  return HOURS_ORDER[nextIdx];
}

function padValue(type: string, value: string): string {
  if (type === "dezena") return value.padStart(2, "0");
  if (type === "centena") return value.padStart(3, "0");
  if (type === "milhar") return value.padStart(4, "0");
  return value;
}

let cachedLogo: string | null = null;

async function getLogoBase64(): Promise<string | null> {
  if (cachedLogo) return cachedLogo;
  try {
    const res = await fetch("https://i.postimg.cc/cJ3pgqmm/businesscard5-26-14159.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          cachedLogo = reader.result;
          resolve(cachedLogo);
        } else {
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function downloadOrSharePdf(pdfBlob: Blob, filename: string) {
  if (navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], filename, { type: "application/pdf" })] })) {
    try {
      await navigator.share({
        title: "Comprovante de Aposta",
        files: [new File([pdfBlob], filename, { type: "application/pdf" })],
      });
      return;
    } catch {}
  }
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function generatePdfReceipt(
  bets: GameBet[],
  userName: string,
  remainingPoints: number,
  drawLabel: string
): Promise<Blob> {
  return new Promise(async (resolve) => {
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = margin;

    const logo = await getLogoBase64();
    if (logo) {
      doc.addImage(logo, "PNG", pw / 2 - 26, y, 52, 52);
      y += 58;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("COMPROVANTE DE APOSTA", pw / 2, y, { align: "center" });
    y += 10;

    doc.setDrawColor(180);
    doc.line(margin, y, pw - margin, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Jogador: ${userName}`, pw / 2, y, { align: "center" });
    y += 7;
    doc.text(`Data: ${bets[0]?.date || ""}`, pw / 2, y, { align: "center" });
    y += 7;
    doc.text(`Sorteio: ${drawLabel}`, pw / 2, y, { align: "center" });
    y += 7;

    doc.setDrawColor(180);
    doc.line(margin, y + 2, pw - margin, y + 2);
    y += 10;

    for (let i = 0; i < bets.length; i++) {
      const bet = bets[i];
      let desc: string;
      if (bet.betType === "grupo") {
        const animal = ANIMAIS.find((a) => a.id === parseInt(bet.betValue, 10));
        desc = animal ? `${animal.nome} (GRUPO ${bet.betValue})` : `GRUPO ${bet.betValue}`;
      } else {
        desc = `${bet.betType.toUpperCase()} ${bet.betValue}`;
      }
      const scopeLabel = bet.scope === "cabeca" ? "CABEÇA" : bet.scope === "1-5" ? "1-5" : "1-10";
      desc += ` [${scopeLabel}]`;
      const scopeMult = bet.scope === "cabeca" ? MULTIPLIERS[bet.betType] : Math.floor(MULTIPLIERS[bet.betType] / (bet.scope === "1-5" ? 5 : 10));
      const prizeDisp = bet.amount * scopeMult;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(desc, pw / 2, y, { align: "center" });
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`${bet.amount} pts ×${scopeMult} = ${prizeDisp} pts`, pw / 2, y, { align: "center" });
      y += 8;
    }

    const total = bets.reduce((s, b) => s + b.amount, 0);
    doc.setDrawColor(180);
    doc.line(margin, y, pw - margin, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Total apostado: ${total} pts`, pw / 2, y, { align: "center" });
    y += 7;
    doc.text(`Pontos restantes: ${remainingPoints} pts`, pw / 2, y, { align: "center" });
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.text("Status: Pendente", pw / 2, y, { align: "center" });
    y += 12;

    doc.setDrawColor(180);
    doc.line(margin, y, pw - margin, y);
    y += 6;
    const now = new Date();
    const ts = `${formatDate(now)} as ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text(`Gerado em ${ts}`, pw / 2, y, { align: "center" });

    resolve(doc.output("blob"));
  });
}

type GameProps = {
  days: DayResult[];
};

export function Game({ days }: GameProps) {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [currentUser, setCurrentUser] = useState<GameUser | null>(null);
  const [loginStep, setLoginStep] = useState<"select" | "password">("select");
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [betType, setBetType] = useState<"grupo" | "dezena" | "centena" | "milhar">("grupo");
  const [scope, setScope] = useState<"cabeca" | "1-5" | "1-10">("1-5");
  const [betValue, setBetValue] = useState("");
  const [selectedAnimals, setSelectedAnimals] = useState<number[]>([]);
  const [betAmount, setBetAmount] = useState("");
  const [betMessage, setBetMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetStep, setResetStep] = useState<"idle" | "password">("idle");
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [lastDrawLabel, setLastDrawLabel] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const gameDataRef = useRef(gameData);
  gameDataRef.current = gameData;
  const loadedRef = useRef(false);

  useEffect(() => {
    (async () => {
      const existing = await loadGameData();
      if (existing) {
        if (!existing.users.find(u => u.password === "admin")) {
          existing.users.push({ password: "admin", name: "Banca", points: 0 });
          await saveGameData(existing);
        }
        setGameData(existing);
      }
      loadedRef.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!gameData || !loadedRef.current) return;
    const data = gameDataRef.current;
    if (!data) return;

    const now = new Date();
    const today = formatDate(now);
    let changed = false;
    const newBets = data.bets.map((bet) => {
      if (bet.settled) return bet;
      if (bet.date !== today) return bet;

      const dayResult = days.find((d) => d.date === today);
      if (!dayResult) return bet;

      const draw = dayResult.draws.find((d) => d.label === bet.drawLabel);
      if (!draw) return bet;

      let won = false;
      for (let i = 0; i < draw.milhares.length; i++) {
        const milhar = draw.milhares[i];
        let match = false;
        if (bet.betType === "milhar" && milhar === bet.betValue) match = true;
        else if (bet.betType === "centena" && milhar.slice(-3) === bet.betValue) match = true;
        else if (bet.betType === "dezena" && milhar.slice(-2) === bet.betValue) match = true;
        else if (bet.betType === "grupo") {
          const gid = getGrupoIdFromMilhar(milhar);
          if (gid === parseInt(bet.betValue, 10)) match = true;
        }
        if (match) {
          const prize = calcPrize(bet.amount, bet.betType, bet.scope, i);
          if (prize > 0) { won = true; break; }
        }
      }

      changed = true;
      return { ...bet, settled: true, won };
    });

    if (!changed) return;

    let totalPrizePaid = 0;
    const newUsers = data.users.map((u) => {
      let pts = u.points;
      for (let i = 0; i < newBets.length; i++) {
        const b = newBets[i];
        const oldB = data.bets[i];
        if (b.settled && !oldB.settled && b.userPassword === u.password && b.won) {
          const prize = getBetPrize(b, days);
          pts += prize;
          if (u.password !== "admin") totalPrizePaid += prize;
        }
      }
      if (u.password === "admin") pts -= totalPrizePaid;
      return { ...u, points: pts };
    });

    const newData: GameData = { ...data, users: newUsers, bets: newBets };
    setGameData(newData);
    saveGameData(newData);
  }, [days]);

  function handleSelectUser(name: string) {
    setSelectedName(name);
    setLoginStep("password");
    setPasswordInput("");
    setPasswordError("");
  }

  function handlePasswordConfirm() {
    if (!gameData) return;
    const expected = Object.entries(PASSWORD_MAP).find(([, v]) => v === selectedName)?.[0];
    if (!expected) {
      setPasswordError("Erro interno");
      return;
    }
    if (passwordInput !== expected) {
      setPasswordError("Senha incorreta");
      return;
    }
    const user = gameData.users.find((u) => u.password === expected) ?? null;
    setCurrentUser(user);
  }

  function handleLogout() {
    setCurrentUser(null);
    setLoginStep("select");
    setSelectedName(null);
    setPasswordInput("");
    setPasswordError("");
  }

  function handleCheckResults() {
    if (!gameData || !currentUser) return;
    const today = formatDate(new Date());
    let changed = false;
    let wonCount = 0;
    let totalPrize = 0;
    let checkedCount = 0;

    const newBets = gameData.bets.map((bet) => {
      if (bet.settled) return bet;
      if (bet.date !== today) return bet;
      if (bet.userPassword !== currentUser.password) return bet;

      const dayResult = days.find((d) => d.date === today);
      if (!dayResult) return bet;

      const draw = dayResult.draws.find((d) => d.label === bet.drawLabel);
      if (!draw) return bet;

      let won = false;
      for (let i = 0; i < draw.milhares.length; i++) {
        const milhar = draw.milhares[i];
        let match = false;
        if (bet.betType === "milhar" && milhar === bet.betValue) match = true;
        else if (bet.betType === "centena" && milhar.slice(-3) === bet.betValue) match = true;
        else if (bet.betType === "dezena" && milhar.slice(-2) === bet.betValue) match = true;
        else if (bet.betType === "grupo") {
          const gid = getGrupoIdFromMilhar(milhar);
          if (gid === parseInt(bet.betValue, 10)) match = true;
        }
        if (match) {
          const prize = calcPrize(bet.amount, bet.betType, bet.scope, i);
          if (prize > 0) { won = true; break; }
        }
      }

      changed = true;
      checkedCount++;
      if (won) wonCount++;
      return { ...bet, settled: true, won };
    });

    if (!changed) {
      setBetMessage("NENHUMA APOSTA PENDENTE PARA CONFERIR");
      return;
    }

    const newUsers = gameData.users.map((u) => {
      let pts = u.points;
      for (let i = 0; i < newBets.length; i++) {
        const b = newBets[i];
        const oldB = gameData.bets[i];
        if (b.settled && !oldB.settled && b.userPassword === u.password && b.won) {
          const prize = getBetPrize(b, days);
          pts += prize;
          if (u.password === currentUser.password) {
            totalPrize += prize;
          }
        }
      }
      if (u.password === "admin") pts -= totalPrize;
      return { ...u, points: pts };
    });

    const updatedUser = newUsers.find((u) => u.password === currentUser.password);
    if (updatedUser) {
      setCurrentUser(updatedUser);
    }

    const newData: GameData = { ...gameData, users: newUsers, bets: newBets };
    setGameData(newData);
    saveGameData(newData);

    if (wonCount > 0) {
      setBetMessage(`VOCÊ GANHOU! ${wonCount} aposta(s) premiada(s) — Total: ${totalPrize} pts`);
    } else {
      setBetMessage(`CONFERIDO — ${checkedCount} aposta(s) — Nenhuma premiada`);
    }
  }

  function handlePlaceBet() {
    if (!gameData || !currentUser) return;
    const nextDraw = getNextDraw(days);
    if (!nextDraw) {
      setBetMessage("NÃO HÁ MAIS SORTEIOS HOJE");
      return;
    }
    const today = formatDate(new Date());

    if (betType === "grupo") {
      if (selectedAnimals.length === 0) {
        setBetMessage("Selecione pelo menos 1 animal");
        return;
      }
      if (selectedAnimals.length > 5) {
        setBetMessage("Máximo 5 animais por aposta");
        return;
      }
    } else {
      const cleanValue = betValue.replace(/\D/g, "");
      if (!cleanValue) {
        setBetMessage("Digite um valor válido");
        return;
      }
      if (betType === "dezena") {
        if (cleanValue.length > 2) { setBetMessage("Dezena: 00 a 99"); return; }
      } else if (betType === "centena") {
        if (cleanValue.length > 3) { setBetMessage("Centena: 000 a 999"); return; }
      } else if (betType === "milhar") {
        if (cleanValue.length > 4) { setBetMessage("Milhar: 0000 a 9999"); return; }
      }
    }

    const amount = parseInt(betAmount, 10);
    if (!amount || amount <= 0) {
      setBetMessage("Digite uma quantidade de pontos");
      return;
    }

    const count = betType === "grupo" ? selectedAnimals.length : 1;
    const totalCost = amount * count;
    if (totalCost > currentUser.points) {
      setBetMessage(`Pontos insuficientes. Necessário: ${totalCost}, Saldo: ${currentUser.points}`);
      return;
    }

    let nextId = gameData.nextBetId;
    const newBets: GameBet[] = [];

      if (betType === "grupo") {
        for (const animalId of selectedAnimals) {
          newBets.push({
            id: String(nextId++),
            userPassword: currentUser.password,
            betType: "grupo",
            betValue: String(animalId).padStart(2, "0"),
            amount,
            date: today,
            drawLabel: nextDraw,
            scope,
            settled: false,
            won: null,
          });
        }
      } else {
        const paddedValue = padValue(betType, betValue.replace(/\D/g, ""));
        newBets.push({
          id: String(nextId++),
          userPassword: currentUser.password,
          betType,
          betValue: paddedValue,
          amount,
          date: today,
          drawLabel: nextDraw,
          scope,
          settled: false,
          won: null,
        });
      }

    const newUsers = gameData.users.map((u) =>
      u.password === currentUser.password
        ? { ...u, points: u.points - totalCost }
        : u.password === "admin"
        ? { ...u, points: u.points + totalCost }
        : u
    );
    const newData: GameData = {
      ...gameData,
      users: newUsers,
      bets: [...gameData.bets, ...newBets],
      nextBetId: nextId,
    };

    const remaining = currentUser.points - totalCost;
    setCurrentUser({ ...currentUser, points: remaining });
    setGameData(newData);
    saveGameData(newData);
    setLastDrawLabel(nextDraw);
    setBetValue("");
    setSelectedAnimals([]);
    setBetAmount("");
    const scopeLabel = scope === "cabeca" ? "CABEÇA" : scope === "1-5" ? "1-5" : "1-10";
    const label = betType === "grupo"
      ? `${selectedAnimals.length} animais no ${nextDraw} [${scopeLabel}]`
      : `Aposta registrada! ${nextDraw} [${scopeLabel}]`;
    setBetMessage(label);
  }

  function handleCancelBet(betId: string) {
    if (!gameData || !currentUser) return;
    if (currentUser.name !== "Luan") return;

    const bet = gameData.bets.find((b) => b.id === betId);
    if (!bet) return;
    if (bet.settled) return;

    const confirmMsg = `Cancelar aposta de ${bet.userPassword === currentUser.password ? "Luan" : gameData.users.find(u => u.password === bet.userPassword)?.name || "outro"} ${bet.betType.toUpperCase()} ${bet.betValue} (${bet.amount} pts) no ${bet.drawLabel}?`;
    if (!confirm(confirmMsg)) return;

    const updatedBets = gameData.bets.filter((b) => b.id !== betId);
    const updatedUsers = gameData.users.map((u) => {
      if (u.password === bet.userPassword) return { ...u, points: u.points + bet.amount };
      if (u.password === "admin") return { ...u, points: u.points - bet.amount };
      return u;
    });

    const newData: GameData = { ...gameData, bets: updatedBets, users: updatedUsers };
    setGameData(newData);
    if (bet.userPassword === currentUser.password) {
      setCurrentUser({ ...currentUser, points: currentUser.points + bet.amount });
    }
    saveGameData(newData);
  }

  async function handleSharePdf(label: string) {
    setSharing(true);
    const user = gameData?.users.find((u) => u.password === currentUser?.password);
    if (!user || !gameData) { setSharing(false); return; }
    const today = formatDate(new Date());
    const bets = gameData.bets.filter(
      (b) => b.userPassword === currentUser?.password && b.date === today && b.drawLabel === label
    );
    if (bets.length === 0) { setSharing(false); return; }
    try {
      const blob = await generatePdfReceipt(bets, user.name, user.points, label);
      const filename = `comprovante_${label}_${bets[0]?.date?.replace(/\//g, "-") || "sem-data"}.pdf`;
      await downloadOrSharePdf(blob, filename);
    } catch {}
    setSharing(false);
  }

  function handleWhatsApp(label: string) {
    if (!gameData || !currentUser) return;
    const today = formatDate(new Date());
    const bets = gameData.bets.filter(
      (b) => b.userPassword === currentUser.password && b.date === today && b.drawLabel === label
    );
    if (bets.length === 0) return;

    const user = gameData.users.find((u) => u.password === currentUser.password);
    if (!user) return;

    const lines: string[] = [];
    lines.push("📋 COMPROVANTE DE APOSTA");
    lines.push(`👤 ${user.name}`);
    lines.push(`📅 ${today} - ${label}`);
    lines.push("");

    for (const bet of bets) {
      let desc: string;
      if (bet.betType === "grupo") {
        const animal = ANIMAIS.find((a) => a.id === parseInt(bet.betValue, 10));
        desc = animal ? `${animal.emoji} ${animal.nome}` : `GRUPO ${bet.betValue}`;
      } else {
        desc = `${bet.betType.toUpperCase()} ${bet.betValue}`;
      }
      const scopeLabel = bet.scope === "cabeca" ? "CABEÇA" : bet.scope === "1-5" ? "1-5" : "1-10";
      const prize = calcPrize(bet.amount, bet.betType, bet.scope, 0);
      lines.push(`${desc} [${scopeLabel}] - ${bet.amount} pts → ${prize} pts`);
    }

    const total = bets.reduce((s, b) => s + b.amount, 0);
    lines.push("");
    lines.push(`💰 Total: ${total} pts | 💵 Restante: ${user.points} pts`);

    const pendentes = bets.filter((b) => !b.settled).length;
    if (pendentes > 0) lines.push("⏳ Pendente");

    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  if (!gameData) {
    return (
      <div style={{ textAlign: "center", color: dim, fontFamily: bebas, fontSize: "1.2rem", marginTop: "40px" }}>
        Carregando...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{ maxWidth: "400px", margin: "40px auto 0" }}>
        <div style={{ textAlign: "center", fontFamily: bebas, fontSize: "1.5rem", letterSpacing: "3px", color: yellow, marginBottom: "24px" }}>
          ACESSO
        </div>
        {loginStep === "select" && (
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            {["Milena", "Luan"].map((name) => (
              <button
                key={name}
                onClick={() => handleSelectUser(name)}
                style={{
                  flex: 1,
                  padding: "14px",
                  fontFamily: bebas,
                  fontSize: "1.1rem",
                  letterSpacing: "2px",
                  background: panel,
                  color: text,
                  border: `1px solid ${bdr}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                {name}
              </button>
            ))}
          </div>
        )}
        {loginStep === "password" && (
          <div>
            <div style={{ textAlign: "center", color: text, fontFamily: bebas, fontSize: "1rem", marginBottom: "16px" }}>
              {selectedName}, digite sua senha
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value.replace(/\D/g, ""));
                setPasswordError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePasswordConfirm();
              }}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px",
                background: panel,
                border: `1px solid ${bdr}`,
                borderRadius: "6px",
                color: text,
                fontFamily: mono,
                fontSize: "1.2rem",
                textAlign: "center",
                outline: "none",
                marginBottom: "12px",
                "-webkit-text-security": "disc",
              } as any}
              autoFocus
            />
            <button
              onClick={() => {
                setLoginStep("select");
                setSelectedName(null);
              }}
              style={{
                width: "48%",
                marginRight: "4%",
                padding: "10px",
                fontFamily: bebas,
                fontSize: "0.9rem",
                letterSpacing: "2px",
                background: panel,
                color: dim,
                border: `1px solid ${bdr}`,
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              VOLTAR
            </button>
            <button
              onClick={handlePasswordConfirm}
              style={{
                width: "48%",
                padding: "10px",
                fontFamily: bebas,
                fontSize: "0.9rem",
                letterSpacing: "2px",
                background: green,
                color: "#000",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              CONFIRMAR
            </button>
            {passwordError && (
              <div style={{ textAlign: "center", color: red, fontFamily: bebas, fontSize: "0.9rem", marginTop: "12px" }}>
                {passwordError}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const nextDraw = getNextDraw(days);
  const today = formatDate(new Date());
  const todayBets = gameData.bets.filter((b) => b.date === today && b.userPassword === currentUser.password);
  const selectedCount = selectedAnimals.length;

  return (
    <div>
      <BetsCarousel gameData={gameData} currentUser={currentUser} onCancelBet={handleCancelBet} />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          marginBottom: "18px",
        }}
      >
        {gameData.users.filter(u => u.password !== "admin").map((u) => (
          <div
            key={u.password}
            style={{
              fontFamily: bebas,
              fontSize: "0.95rem",
              letterSpacing: "2px",
              color: u.password === currentUser.password ? yellow : dim,
              background: u.password === currentUser.password ? "rgba(255,215,0,0.08)" : "transparent",
              padding: "6px 16px",
              borderRadius: "6px",
              border: u.password === currentUser.password ? `1px solid ${yellow}` : "1px solid transparent",
            }}
          >
            {u.name}: <span style={{ color: u.password === currentUser.password ? "#fff" : dim }}>{u.points} pts</span>
          </div>
        ))}
      </div>

      {}
      <div
        style={{
          textAlign: "center",
          fontFamily: bebas,
          fontSize: "1.2rem",
          letterSpacing: "2px",
          color: nextDraw ? green : dim,
          marginBottom: "18px",
        }}
      >
        {nextDraw ? `PRÓXIMO SORTEIO: ${nextDraw}` : "NÃO HÁ MAIS SORTEIOS HOJE"}
      </div>

      {}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {(["grupo", "dezena", "centena", "milhar"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setBetType(t);
              setScope("cabeca");
              setBetValue("");
              setSelectedAnimals([]);
              setBetMessage("");
            }}
            style={{
              flex: 1,
              padding: "8px 4px",
              fontFamily: bebas,
              fontSize: "0.8rem",
              letterSpacing: "2px",
              background: betType === t ? (t === "grupo" ? yellow : t === "dezena" ? orange : t === "centena" ? green : "#a855f7") : panel,
              color: betType === t ? "#000" : dim,
              border: `1px solid ${betType === t ? (t === "grupo" ? yellow : t === "dezena" ? orange : t === "centena" ? green : "#a855f7") : bdr}`,
              borderRadius: "6px",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {t === "grupo" ? "GRUPOS" : t === "dezena" ? "DEZENAS" : t === "centena" ? "CENTENAS" : "MILHARES"}
          </button>
        ))}
      </div>

      {}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {(["cabeca", "1-5", "1-10"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            style={{
              flex: 1,
              padding: "6px 4px",
              fontFamily: bebas,
              fontSize: "0.75rem",
              letterSpacing: "1px",
              background: scope === s ? "#a855f7" : panel,
              color: scope === s ? "#fff" : dim,
              border: `1px solid ${scope === s ? "#a855f7" : bdr}`,
              borderRadius: "6px",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {s === "cabeca" ? "CABEÇA" : s === "1-5" ? "1 AO 5" : "1 AO 10"}
          </button>
        ))}
      </div>

      {}
      <div
        style={{
          background: panel,
          border: `1px solid ${bdr}`,
          borderRadius: "6px",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <div style={{ fontFamily: bebas, fontSize: "0.9rem", letterSpacing: "2px", color: text, marginBottom: "12px" }}>
          {betType === "grupo"
            ? `GRUPOS (${selectedCount}/5 selecionados)`
            : betType === "dezena"
            ? "DEZENA (00 a 99)"
            : betType === "centena"
            ? "CENTENA (000 a 999)"
            : "MILHAR (0000 a 9999)"}
        </div>

        {}
        {betType !== "grupo" && (
          <input
            type="text"
            inputMode="numeric"
            value={betValue}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 4);
              setBetValue(v);
              setBetMessage("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePlaceBet();
            }}
            placeholder={
              betType === "dezena"
              ? "Ex: 35"
              : betType === "centena"
              ? "Ex: 123"
              : "Ex: 1234"
            }
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px",
              background: bg,
              border: `1px solid ${bdr}`,
              borderRadius: "6px",
              color: text,
              fontFamily: mono,
              fontSize: "1.3rem",
              textAlign: "center",
              outline: "none",
              marginBottom: "16px",
            }}
          />
        )}

        {}
        {betType === "grupo" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, auto)",
              gap: "14px",
              marginBottom: "20px",
              justifyItems: "center",
              justifyContent: "center",
            }}
          >
            {ANIMAIS.map((a) => {
              const isSelected = selectedAnimals.includes(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => {
                    setSelectedAnimals((prev) => {
                      if (prev.includes(a.id)) {
                        return prev.filter((id) => id !== a.id);
                      }
                      if (prev.length >= 5) return prev;
                      return [...prev, a.id];
                    });
                    setBetMessage("");
                  }}
                  style={{
                    padding: "14px 6px",
                    fontFamily: bebas,
                    fontSize: "0.9rem",
                    background: isSelected ? yellow : "transparent",
                    color: isSelected ? "#000" : dim,
                    border: `2px solid ${isSelected ? yellow : bdr}`,
                    borderRadius: "6px",
                    cursor: "pointer",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    opacity: !isSelected && selectedAnimals.length >= 5 ? 0.4 : 1,
                  }}
                  disabled={!isSelected && selectedAnimals.length >= 5}
                >
                  <div style={{ fontSize: "2.2rem", lineHeight: 1 }}>{a.emoji}</div>
                  <div style={{ letterSpacing: "1px" }}>{a.nome}</div>
                </button>
              );
            })}
          </div>
        )}

        {}
        <div style={{ fontFamily: bebas, fontSize: "0.9rem", letterSpacing: "2px", color: text, marginBottom: "8px" }}>
          {betType === "grupo" ? "PONTOS POR ANIMAL" : "PONTOS"}
        </div>
        <input
          type="text"
          inputMode="numeric"
          value={betAmount}
          onChange={(e) => {
            setBetAmount(e.target.value.replace(/\D/g, ""));
            setBetMessage("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handlePlaceBet();
          }}
          placeholder="Ex: 50"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px",
            background: bg,
            border: `1px solid ${bdr}`,
            borderRadius: "6px",
            color: text,
            fontFamily: mono,
            fontSize: "1.3rem",
            textAlign: "center",
            outline: "none",
            marginBottom: "8px",
          }}
        />

        {}
        {betType === "grupo" && selectedCount > 0 && betAmount && parseInt(betAmount) > 0 && (
          <div style={{ textAlign: "center", fontFamily: bebas, fontSize: "0.85rem", color: dim, marginBottom: "12px" }}>
            {selectedCount} animais × {betAmount} pts = <span style={{ color: text }}>{selectedCount * parseInt(betAmount)} pts total</span>
          </div>
        )}

        <button
          onClick={handlePlaceBet}
          disabled={!nextDraw || saving}
          style={{
            width: "100%",
            padding: "12px",
            fontFamily: bebas,
            fontSize: "1rem",
            letterSpacing: "3px",
            background: !nextDraw ? dim : green,
            color: "#000",
            border: "none",
            borderRadius: "6px",
            cursor: !nextDraw ? "not-allowed" : "pointer",
            opacity: !nextDraw ? 0.5 : 1,
          }}
        >
          APOSTAR
        </button>

        {betMessage && (
          <div style={{ textAlign: "center", color: betMessage.includes("registrada") ? green : red, fontFamily: bebas, fontSize: "0.9rem", marginTop: "10px" }}>
            {betMessage}
          </div>
        )}

        {lastDrawLabel && betMessage && betMessage.includes("registrada") && (
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button
              onClick={() => handleSharePdf(lastDrawLabel)}
              disabled={sharing}
              style={{
                flex: 1,
                padding: "10px",
                fontFamily: bebas,
                fontSize: "0.85rem",
                letterSpacing: "1px",
                background: sharing ? dim : "#25D366",
                color: "#000",
                border: "none",
                borderRadius: "6px",
                cursor: sharing ? "not-allowed" : "pointer",
              }}
            >
              {sharing ? "GERANDO PDF..." : "📄 PDF"}
            </button>
            <button
              onClick={() => handleWhatsApp(lastDrawLabel)}
              style={{
                flex: 1,
                padding: "10px",
                fontFamily: bebas,
                fontSize: "0.85rem",
                letterSpacing: "1px",
                background: "#075E54",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              📱 WHATSAPP
            </button>
          </div>
        )}

        <div style={{ textAlign: "center", fontFamily: bebas, fontSize: "0.75rem", color: dim, marginTop: "8px" }}>
          {betType === "grupo" && (scope === "cabeca" ? "Prêmio: ×25" : scope === "1-5" ? "Prêmio: ×5" : "Prêmio: ×2.5")}
          {betType === "dezena" && (scope === "cabeca" ? "Prêmio: ×100" : scope === "1-5" ? "Prêmio: ×20" : "Prêmio: ×10")}
          {betType === "centena" && (scope === "cabeca" ? "Prêmio: ×1000" : scope === "1-5" ? "Prêmio: ×200" : "Prêmio: ×100")}
          {betType === "milhar" && (scope === "cabeca" ? "Prêmio: ×10000" : scope === "1-5" ? "Prêmio: ×2000" : "Prêmio: ×1000")}
        </div>
      </div>

      <div
        style={{
          background: panel,
          border: `1px solid ${bdr}`,
          borderRadius: "6px",
          padding: "12px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <span style={{ fontFamily: bebas, fontSize: "1rem", letterSpacing: "2px", color: text }}>
            MINHAS APOSTAS
          </span>
          <span style={{ fontFamily: bebas, fontSize: "0.8rem", letterSpacing: "1px", color: dim }}>
            {todayBets.length} aposta(s)
          </span>
        </div>

        {todayBets.length === 0 && (
          <div style={{ textAlign: "center", fontFamily: bebas, fontSize: "0.85rem", color: dim, padding: "16px 0" }}>
            Nenhuma aposta hoje
          </div>
        )}

        {(() => {
          const grouped: Record<string, GameBet[]> = {};
          for (const bet of todayBets) {
            if (!grouped[bet.drawLabel]) grouped[bet.drawLabel] = [];
            grouped[bet.drawLabel].push(bet);
          }
          const labels: string[] = [];
          for (const h of HOURS_ORDER) {
            if (grouped[h]) labels.push(h);
          }
          for (const label of Object.keys(grouped)) {
            if (!labels.includes(label)) labels.push(label);
          }
          return labels.map((label) => {
            const bets = grouped[label];
            return (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${bdr}` }}>
                  <span style={{ fontFamily: bebas, fontSize: "0.85rem", color: yellow, letterSpacing: "1px" }}>
                    {label}
                  </span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() => handleSharePdf(label)}
                      disabled={sharing}
                      style={{
                        background: sharing ? dim : "#25D366",
                        border: "none",
                        borderRadius: "4px",
                        color: "#000",
                        fontSize: "0.65rem",
                        fontFamily: bebas,
                        letterSpacing: "1px",
                        padding: "3px 6px",
                        cursor: sharing ? "not-allowed" : "pointer",
                      }}
                    >
                      📄 PDF
                    </button>
                    <button
                      onClick={() => handleWhatsApp(label)}
                      style={{
                        background: "#075E54",
                        border: "none",
                        borderRadius: "4px",
                        color: "#fff",
                        fontSize: "0.65rem",
                        fontFamily: bebas,
                        letterSpacing: "1px",
                        padding: "3px 6px",
                        cursor: "pointer",
                      }}
                    >
                      📱 ZAP
                    </button>
                  </div>
                </div>
                {bets.map((bet) => (
                  <div
                    key={bet.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "4px 0 4px 12px",
                      borderBottom: `1px solid ${bdr}55`,
                    }}
                  >
                    <span style={{ fontFamily: mono, fontSize: "0.8rem", color: text }}>
                      {bet.betType === "grupo"
                        ? (() => {
                            const aid = parseInt(bet.betValue, 10);
                            const animal = ANIMAIS.find((a) => a.id === aid);
                            return animal ? `${animal.emoji} ${animal.nome}` : `GRUPO ${bet.betValue}`;
                          })()
                        : `${bet.betType.toUpperCase()} ${bet.betValue}`}
                      <span style={{ fontFamily: bebas, fontSize: "0.65rem", color: dim, marginLeft: "6px" }}>
                        {bet.scope === "cabeca" ? "[CABEÇA]" : bet.scope === "1-5" ? "[1-5]" : "[1-10]"}
                      </span>
                    </span>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                        <span style={{ fontFamily: mono, fontSize: "0.8rem", color: text }}>
                          {bet.amount} pts
                        </span>
                        {currentUser.name === "Luan" && !bet.settled && (
                          <button
                            onClick={() => handleCancelBet(bet.id)}
                            style={{
                              background: "transparent",
                              border: `1px solid ${red}55`,
                              borderRadius: "4px",
                              color: red,
                              fontSize: "0.6rem",
                              fontFamily: bebas,
                              letterSpacing: "1px",
                              padding: "1px 5px",
                              cursor: "pointer",
                              lineHeight: 1.2,
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <div style={{ fontFamily: bebas, fontSize: "0.7rem", letterSpacing: "1px" }}>
                        {!bet.settled ? (
                          <span>
                            <span style={{ color: orange }}>⏳ Pendente</span>
                            <span style={{ color: green, fontSize: "0.65rem", marginLeft: "6px" }}>
                              → {calcPrize(bet.amount, bet.betType, bet.scope, 0)} pts
                            </span>
                          </span>
                        ) : bet.won ? (
                          <span style={{ color: green }}>✅ +{getBetPrize(bet, days)}</span>
                        ) : (
                          <span style={{ color: red }}>❌ Perdeu</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          });
        })()}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 24px",
              fontFamily: bebas,
              fontSize: "0.85rem",
              letterSpacing: "2px",
              background: panel,
              color: dim,
              border: `1px solid ${bdr}`,
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            SAIR
          </button>
          <button
            onClick={handleCheckResults}
            style={{
              padding: "8px 24px",
              fontFamily: bebas,
              fontSize: "0.85rem",
              letterSpacing: "2px",
              background: "transparent",
              color: yellow,
              border: `1px solid ${yellow}`,
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            CONFERIR RESULTADO
          </button>
          <button
            onClick={() => {
              setResetStep("password");
              setResetPassword("");
              setResetError("");
            }}
            style={{
              padding: "8px 24px",
              fontFamily: bebas,
              fontSize: "0.85rem",
              letterSpacing: "2px",
              background: "transparent",
              color: red,
              border: `1px solid ${red}`,
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            RESETAR JOGO
          </button>
        </div>
        {resetStep === "password" && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ fontFamily: bebas, fontSize: "0.8rem", color: dim, letterSpacing: "1px" }}>
              Senha do Luan:
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={resetPassword}
              onChange={(e) => {
                setResetPassword(e.target.value.replace(/\D/g, ""));
                setResetError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (resetPassword === "1004") {
                    setGameData(DEFAULT_GAME_DATA);
                    saveGameData(DEFAULT_GAME_DATA);
                    setCurrentUser(null);
                    setLoginStep("select");
                    setSelectedName(null);
                    setResetStep("idle");
                    setResetPassword("");
                    setResetError("");
                  } else {
                    setResetError("Senha incorreta");
                  }
                }
              }}
              style={{
                width: "120px",
                padding: "6px 8px",
                background: bg,
                border: `1px solid ${resetError ? red : bdr}`,
                borderRadius: "4px",
                color: text,
                fontFamily: mono,
                fontSize: "1rem",
                textAlign: "center",
                outline: "none",
                "-webkit-text-security": "disc",
              } as any}
              autoFocus
            />
            <button
              onClick={() => {
                if (resetPassword === "1004") {
                  setGameData(DEFAULT_GAME_DATA);
                  saveGameData(DEFAULT_GAME_DATA);
                  setCurrentUser(null);
                  setLoginStep("select");
                  setSelectedName(null);
                  setResetStep("idle");
                  setResetPassword("");
                  setResetError("");
                } else {
                  setResetError("Senha incorreta");
                }
              }}
              style={{
                padding: "6px 16px",
                fontFamily: bebas,
                fontSize: "0.8rem",
                letterSpacing: "2px",
                background: red,
                color: "#000",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              CONFIRMAR
            </button>
            <button
              onClick={() => { setResetStep("idle"); setResetPassword(""); setResetError(""); }}
              style={{
                padding: "6px 12px",
                fontFamily: bebas,
                fontSize: "0.8rem",
                letterSpacing: "2px",
                background: panel,
                color: dim,
                border: `1px solid ${bdr}`,
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              CANCELAR
            </button>
            {resetError && (
              <div style={{ width: "100%", textAlign: "center", fontFamily: bebas, fontSize: "0.85rem", color: red, marginTop: "4px" }}>
                {resetError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
