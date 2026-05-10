import { useEffect, useMemo, useState } from "react";
import { ANIMAIS, THEME_COLORS } from "../constants";
import { loadGameData } from "../supabase";
import type { GameData, GameUser } from "../types";

const { bg, panel, bdr, yellow, green, orange, dim, text } = THEME_COLORS;
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

function formatShort(date: string): string {
  return date.slice(0, 5);
}

function betLabel(bet: { betType: string; betValue: string }): string {
  if (bet.betType === "grupo") {
    const aid = parseInt(bet.betValue, 10);
    const animal = ANIMAIS.find((a) => a.id === aid);
    return animal ? `${animal.emoji} ${animal.nome}` : `GRUPO ${bet.betValue}`;
  }
  return `${bet.betType.toUpperCase()} ${bet.betValue}`;
}

export function Podium() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [modalUser, setModalUser] = useState<GameUser | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await loadGameData();
        if (data) setGameData(data);
      } catch {}
    })();
  }, []);

  const pendingUsers = useMemo(() => {
    if (!gameData) return new Set<string>();
    const today = formatDate(new Date());
    return new Set(
      gameData.bets
        .filter((b) => b.date === today && !b.settled)
        .map((b) => b.userPassword)
    );
  }, [gameData]);

  const wonBets = useMemo(() => {
    if (!modalUser || !gameData) return [];
    return gameData.bets
      .filter((b) => b.userPassword === modalUser.password && b.won === true)
      .sort((a, b) => Number(b.id) - Number(a.id))
      .slice(0, 30);
  }, [modalUser, gameData]);

  if (!gameData) return null;

  const sorted = [...gameData.users].sort((a, b) => b.points - a.points);
  const first = sorted[0] ?? null;
  const second = sorted[1] ?? null;
  const third = sorted[2] ?? null;

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: "12px",
          marginBottom: "20px",
          padding: "16px 8px",
          background: panel,
          border: `1px solid ${bdr}`,
          borderRadius: "10px",
        }}
      >
        {/* 2nd */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            width: "90px",
          }}
        >
          {second && (
            <div
              onClick={() => setModalUser(second)}
              style={{
                fontFamily: bebas,
                fontSize: "0.85rem",
                color: text,
                letterSpacing: "1px",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              {second.name}
              {pendingUsers.has(second.password) && <span style={{ color: green, marginLeft: "4px", fontSize: "0.8rem" }}>●</span>}
            </div>
          )}
          <div
            style={{
              width: "70px",
              background: "#2a2a3e",
              borderRadius: "6px 6px 0 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "8px 4px",
              minHeight: "60px",
              justifyContent: "flex-end",
            }}
          >
            {second && (
              <>
                <div style={{ fontSize: "1.2rem", color: dim, marginBottom: "2px" }}>
                  🥈
                </div>
                <div
                  style={{
                    fontSize: "1.6rem",
                    filter: "grayscale(0.3)",
                    opacity: 0.9,
                  }}
                >
                  2º
                </div>
                <div
                  style={{
                    fontFamily: bebas,
                    fontSize: "0.75rem",
                    color: green,
                    letterSpacing: "1px",
                  }}
                >
                  {second.points} pts
                </div>
              </>
            )}
          </div>
        </div>

        {/* 1st */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            width: "100px",
          }}
        >
          {first && (
            <div
              onClick={() => setModalUser(first)}
              style={{
                fontFamily: bebas,
                fontSize: "0.95rem",
                color: "#fff",
                letterSpacing: "1px",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              {first.name}
              {pendingUsers.has(first.password) && <span style={{ color: green, marginLeft: "4px", fontSize: "0.8rem" }}>●</span>}
            </div>
          )}
          <div
            style={{
              width: "80px",
              background: "#1a1a2e",
              border: `1px solid ${yellow}`,
              borderRadius: "8px 8px 0 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "10px 4px",
              minHeight: "80px",
              justifyContent: "flex-end",
            }}
          >
            {first && (
              <>
                <div style={{ fontSize: "1.4rem", marginBottom: "2px" }}>
                  🥇
                </div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    color: yellow,
                  }}
                >
                  1º
                </div>
                <div
                  style={{
                    fontFamily: bebas,
                    fontSize: "0.85rem",
                    color: yellow,
                    letterSpacing: "1px",
                  }}
                >
                  {first.points} pts
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3rd */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            width: "90px",
          }}
        >
          {third && (
            <div
              onClick={() => setModalUser(third)}
              style={{
                fontFamily: bebas,
                fontSize: "0.85rem",
                color: text,
                letterSpacing: "1px",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              {third.name}
              {pendingUsers.has(third.password) && <span style={{ color: green, marginLeft: "4px", fontSize: "0.8rem" }}>●</span>}
            </div>
          )}
          <div
            style={{
              width: "70px",
              background: "#2a2a3e",
              borderRadius: "6px 6px 0 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "8px 4px",
              minHeight: "60px",
              justifyContent: "flex-end",
            }}
          >
            {third && (
              <>
                <div style={{ fontSize: "1.2rem", color: dim, marginBottom: "2px" }}>
                  🥉
                </div>
                <div
                  style={{
                    fontSize: "1.6rem",
                    filter: "grayscale(0.3)",
                    opacity: 0.9,
                  }}
                >
                  3º
                </div>
                <div
                  style={{
                    fontFamily: bebas,
                    fontSize: "0.75rem",
                    color: green,
                    letterSpacing: "1px",
                  }}
                >
                  {third.points} pts
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalUser && (
        <div
          onClick={() => setModalUser(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: panel,
              border: `1px solid ${bdr}`,
              borderRadius: "10px",
              padding: "20px",
              maxWidth: "400px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <span style={{ fontFamily: bebas, fontSize: "1.2rem", letterSpacing: "2px", color: yellow }}>
                🏆 Vitórias de {modalUser.name}
              </span>
              <button
                onClick={() => setModalUser(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: dim,
                  fontFamily: bebas,
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  padding: "4px 8px",
                }}
              >
                X
              </button>
            </div>

            {wonBets.length === 0 && (
              <div style={{ textAlign: "center", fontFamily: bebas, fontSize: "0.9rem", color: dim, padding: "20px 0" }}>
                Nenhuma vitória ainda
              </div>
            )}

            {wonBets.map((bet) => (
              <div
                key={bet.id}
                style={{
                  padding: "8px 0",
                  borderBottom: `1px solid ${bdr}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontFamily: mono, fontSize: "0.75rem", color: dim }}>
                      {formatShort(bet.date)}
                    </span>
                    <span style={{ fontFamily: bebas, fontSize: "0.8rem", color: yellow, marginLeft: "8px", letterSpacing: "1px" }}>
                      {bet.drawLabel}
                    </span>
                  </div>
                  <span style={{ fontFamily: bebas, fontSize: "0.8rem", color: green }}>
                    +{bet.amount * MULTIPLIERS[bet.betType]}
                  </span>
                </div>
                <div style={{ fontFamily: bebas, fontSize: "0.85rem", color: text, letterSpacing: "1px", marginTop: "2px" }}>
                  {betLabel(bet)}
                  <span style={{ color: dim, marginLeft: "8px", fontFamily: mono, fontSize: "0.75rem" }}>
                    {bet.amount} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
