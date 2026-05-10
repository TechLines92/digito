import { useEffect, useRef, useState } from "react";
import { ANIMAIS, HOURS_ORDER, THEME_COLORS } from "../constants";
import { getGrupoIdFromMilhar } from "../utils";
import { loadGameData, saveGameData } from "../supabase";
import type { DayResult, GameData, GameBet, GameUser } from "../types";

const { bg, panel, bdr, yellow, green, orange, dim, text, red } = THEME_COLORS;
const bebas = "'Bebas Neue', sans-serif";
const mono = "'Share Tech Mono', monospace";

const MULTIPLIERS: Record<string, number> = {
  grupo: 23,
  dezena: 97,
  centena: 970,
  milhar: 9700,
};

const PASSWORD_MAP: Record<string, string> = {
  "2504": "Milena",
  "1004": "Luan",
};

const DEFAULT_USERS: GameUser[] = [
  { password: "2504", name: "Milena", points: 1000 },
  { password: "1004", name: "Luan", points: 1000 },
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

function getNextDraw(days: DayResult[]): string | null {
  const now = new Date();
  const today = formatDate(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayResult = days.find((d) => d.date === today);
  const existingLabels = todayResult ? todayResult.draws.map((d) => d.label) : [];

  for (const label of HOURS_ORDER) {
    const hour = parseInt(label, 10);
    const drawMinutes = hour * 60;
    if (drawMinutes > currentMinutes && !existingLabels.includes(label)) {
      return label;
    }
  }
  return null;
}

function padValue(type: string, value: string): string {
  if (type === "dezena") return value.padStart(2, "0");
  if (type === "centena") return value.padStart(3, "0");
  if (type === "milhar") return value.padStart(4, "0");
  return value;
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
  const [betValue, setBetValue] = useState("");
  const [selectedAnimals, setSelectedAnimals] = useState<number[]>([]);
  const [betAmount, setBetAmount] = useState("");
  const [betMessage, setBetMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetStep, setResetStep] = useState<"idle" | "password">("idle");
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState("");

  const gameDataRef = useRef(gameData);
  gameDataRef.current = gameData;
  const loadedRef = useRef(false);

  useEffect(() => {
    (async () => {
      setGameData(DEFAULT_GAME_DATA);
      try { await saveGameData(DEFAULT_GAME_DATA); } catch {}
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
      for (const milhar of draw.milhares) {
        if (bet.betType === "milhar" && milhar === bet.betValue) {
          won = true;
          break;
        }
        if (bet.betType === "centena" && milhar.slice(-3) === bet.betValue) {
          won = true;
          break;
        }
        if (bet.betType === "dezena" && milhar.slice(-2) === bet.betValue) {
          won = true;
          break;
        }
        if (bet.betType === "grupo") {
          const gid = getGrupoIdFromMilhar(milhar);
          if (gid === parseInt(bet.betValue, 10)) {
            won = true;
            break;
          }
        }
      }

      changed = true;
      return { ...bet, settled: true, won };
    });

    if (!changed) return;

    const newUsers = data.users.map((u) => {
      let pts = u.points;
      for (let i = 0; i < newBets.length; i++) {
        const b = newBets[i];
        const oldB = data.bets[i];
        if (b.settled && !oldB.settled && b.userPassword === u.password && b.won) {
          pts += b.amount * MULTIPLIERS[b.betType];
        }
      }
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

  function handlePlaceBet() {
    if (!gameData || !currentUser) return;
    const nextDraw = getNextDraw(days);
    if (!nextDraw) {
      setBetMessage("NÃO HÁ MAIS SORTEIOS HOJE");
      return;
    }
    const today = formatDate(new Date());

    const jaApostouTipo = gameData.bets.some(
      b => b.userPassword === currentUser.password
        && b.drawLabel === nextDraw
        && b.date === today
        && b.betType === betType
        && !b.settled
    );
    if (jaApostouTipo) {
      setBetMessage(`Você já apostou ${betType.toUpperCase()} no ${nextDraw}`);
      return;
    }

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
        settled: false,
        won: null,
      });
    }

    const newUsers = gameData.users.map((u) =>
      u.password === currentUser.password ? { ...u, points: u.points - totalCost } : u
    );
    const newData: GameData = {
      ...gameData,
      users: newUsers,
      bets: [...gameData.bets, ...newBets],
      nextBetId: nextId,
    };

    setCurrentUser({ ...currentUser, points: currentUser.points - totalCost });
    setGameData(newData);
    saveGameData(newData);
    setBetValue("");
    setSelectedAnimals([]);
    setBetAmount("");
    const label = betType === "grupo"
      ? `${selectedAnimals.length} animais no ${nextDraw}`
      : `Aposta registrada no ${nextDraw}!`;
    setBetMessage(label);
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
              type="password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
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
              }}
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
      {}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          marginBottom: "18px",
        }}
      >
        {gameData.users.map((u) => (
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

        <div style={{ textAlign: "center", fontFamily: bebas, fontSize: "0.75rem", color: dim, marginTop: "8px" }}>
          {betType === "milhar"
            ? "Prêmio: ×9700"
            : betType === "centena"
            ? "Prêmio: ×970"
            : betType === "dezena"
            ? "Prêmio: ×97"
            : "Prêmio: ×23"}
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

        {todayBets.map((bet) => (
          <div
            key={bet.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 0",
              borderBottom: `1px solid ${bdr}`,
            }}
          >
            <div>
              <span style={{ fontFamily: bebas, fontSize: "0.85rem", color: yellow, letterSpacing: "1px" }}>
                {bet.drawLabel}
              </span>
              <span style={{ fontFamily: mono, fontSize: "0.8rem", color: text, marginLeft: "8px" }}>
                {bet.betType === "grupo"
                  ? (() => {
                      const aid = parseInt(bet.betValue, 10);
                      const animal = ANIMAIS.find((a) => a.id === aid);
                      return animal ? `${animal.emoji} ${animal.nome}` : `GRUPO ${bet.betValue}`;
                    })()
                  : `${bet.betType.toUpperCase()} ${bet.betValue}`}
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontFamily: mono, fontSize: "0.8rem", color: text }}>
                {bet.amount} pts
              </span>
              <div style={{ fontFamily: bebas, fontSize: "0.7rem", letterSpacing: "1px" }}>
                {!bet.settled ? (
                  <span style={{ color: orange }}>⏳ Pendente</span>
                ) : bet.won ? (
                  <span style={{ color: green }}>✅ +{bet.amount * MULTIPLIERS[bet.betType]}</span>
                ) : (
                  <span style={{ color: red }}>❌ Perdeu</span>
                )}
              </div>
            </div>
          </div>
        ))}
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
              type="password"
              value={resetPassword}
              onChange={(e) => {
                setResetPassword(e.target.value);
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
              }}
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
