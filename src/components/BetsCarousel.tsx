import { useState } from "react";
import { ANIMAIS, THEME_COLORS } from "../constants";
import type { GameData, GameBet, GameUser } from "../types";

const { bg, panel, bdr, yellow, green, orange, dim, text, red } = THEME_COLORS;
const bebas = "'Bebas Neue', sans-serif";
const mono = "'Share Tech Mono', monospace";

const MULTIPLIERS: Record<string, number> = {
  grupo: 23,
  dezena: 97,
  centena: 970,
  milhar: 9700,
};

function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function descFromBet(bet: GameBet): string {
  if (bet.betType === "grupo") {
    const animal = ANIMAIS.find((a) => a.id === parseInt(bet.betValue, 10));
    return animal ? `${animal.emoji} ${animal.nome}` : `GRUPO ${bet.betValue}`;
  }
  return `${bet.betType.toUpperCase()} ${bet.betValue}`;
}

type Props = {
  gameData: GameData;
  currentUser?: GameUser | null;
  onCancelBet?: (betId: string) => void;
};

export function BetsCarousel({ gameData, currentUser, onCancelBet }: Props) {
  const [userIndex, setUserIndex] = useState(0);

  const today = formatDate(new Date());

  const todayBetsByUser: { name: string; password: string; bets: GameBet[] }[] = [];
  for (const user of gameData.users) {
    const userBets = gameData.bets
      .filter((b) => b.userPassword === user.password && b.date === today)
      .sort((a, b) => Number(b.id) - Number(a.id));
    if (userBets.length > 0) {
      todayBetsByUser.push({ name: user.name, password: user.password, bets: userBets });
    }
  }

  if (todayBetsByUser.length === 0) return null;

  const safeIndex = Math.min(userIndex, todayBetsByUser.length - 1);
  const current = todayBetsByUser[safeIndex];

  function prev() {
    setUserIndex((i) => (i <= 0 ? todayBetsByUser.length - 1 : i - 1));
  }

  function next() {
    setUserIndex((i) => (i >= todayBetsByUser.length - 1 ? 0 : i + 1));
  }

  const totalBets = current.bets.reduce((s, b) => s + b.amount, 0);

  return (
    <div
      style={{
        background: panel,
        border: `1px solid ${bdr}`,
        borderRadius: "8px",
        padding: "12px",
        marginBottom: "16px",
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
        <button
          onClick={prev}
          style={{
            background: "transparent",
            border: `1px solid ${dim}`,
            borderRadius: "4px",
            color: text,
            fontSize: "0.9rem",
            fontFamily: bebas,
            padding: "4px 10px",
            cursor: "pointer",
          }}
        >
          ◄
        </button>
        <span
          style={{
            fontFamily: bebas,
            fontSize: "1rem",
            letterSpacing: "2px",
            color: yellow,
          }}
        >
          {current.name} ({current.bets.length})
        </span>
        <button
          onClick={next}
          style={{
            background: "transparent",
            border: `1px solid ${dim}`,
            borderRadius: "4px",
            color: text,
            fontSize: "0.9rem",
            fontFamily: bebas,
            padding: "4px 10px",
            cursor: "pointer",
          }}
        >
          ►
        </button>
      </div>

      {current.bets.map((bet) => {
        const prize = bet.amount * MULTIPLIERS[bet.betType];
        return (
          <div
            key={bet.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 0",
              borderBottom: `1px solid ${bdr}55`,
            }}
          >
            <div>
              <span style={{ fontFamily: bebas, fontSize: "0.8rem", color: yellow, letterSpacing: "1px" }}>
                {bet.drawLabel}
              </span>
              <span style={{ fontFamily: mono, fontSize: "0.8rem", color: text, marginLeft: "6px" }}>
                {descFromBet(bet)}
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                <span style={{ fontFamily: mono, fontSize: "0.8rem", color: text }}>
                  {bet.amount} pts
                </span>
                {currentUser?.name === "Luan" && !bet.settled && onCancelBet && (
                  <button
                    onClick={() => onCancelBet(bet.id)}
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
                  <span style={{ color: orange }}>⏳ Pendente</span>
                ) : bet.won ? (
                  <span style={{ color: green }}>✅ +{prize}</span>
                ) : (
                  <span style={{ color: red }}>❌ Perdeu</span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div
        style={{
          textAlign: "right",
          fontFamily: bebas,
          fontSize: "0.8rem",
          color: dim,
          letterSpacing: "1px",
          marginTop: "6px",
          paddingTop: "6px",
          borderTop: `1px solid ${bdr}`,
        }}
      >
        Total: {totalBets} pts
      </div>
    </div>
  );
}
