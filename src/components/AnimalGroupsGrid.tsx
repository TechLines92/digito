import { ANIMAIS } from "../constants";
import { getAnimalDezenas, getGroupHighlight } from "../utils";

type AnimalGroupsGridProps = {
  counts: number[];
  maxCount: number;
  minCount: number;
  halfCount: number;
  bdr: string;
  dim: string;
  green: string;
  red: string;
  orange: string;
  yellow: string;
  bebas: string;
  mono: string;
};

export function AnimalGroupsGrid({
  counts,
  maxCount,
  minCount,
  halfCount,
  bdr,
  dim,
  green,
  red,
  orange,
  yellow,
  bebas,
  mono,
}: AnimalGroupsGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "8px",
      }}
    >
      {ANIMAIS.map((animal, i) => {
        const count = counts[i];
        const dezenasStr = getAnimalDezenas(animal.id);
        const { borderColor, mainColor, bgColor, opacity } = getGroupHighlight(
          count,
          maxCount,
          minCount,
          halfCount,
          { bdr, dim, green, red, orange, yellow }
        );

        const isOrange = borderColor === orange;

        return (
          <div
            key={animal.id}
            style={{
              background: "transparent",
              border: `2px solid ${borderColor}`,
              borderRadius: "6px",
              padding: "6px 4px",
              textAlign: "center",
              opacity,
              transition: "all 0.2s",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              ...(isOrange && {
                animation: "jump 3s ease-in-out infinite",
              }),
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                padding: "0 4px",
              }}
            >
              <span
                style={{
                  fontFamily: bebas,
                  fontSize: "1.1rem",
                  color: mainColor,
                }}
              >
                {animal.id.toString().padStart(2, "0")}
              </span>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: "0.8rem",
                  color: mainColor,
                  fontWeight: count > 0 ? "bold" : "normal",
                }}
              >
                {count}x
              </span>
            </div>

            <div
              style={{
                fontSize: "2.2rem",
                margin: "4px 0",
                filter: count === 0 ? "grayscale(100%) opacity(50%)" : "none",
              }}
            >
              {animal.emoji}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              <div
                style={{
                  fontSize: "0.6rem",
                  color: mainColor,
                  fontFamily: bebas,
                  letterSpacing: "1px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%",
                }}
              >
                {animal.nome}
              </div>
              <div
                style={{
                  fontSize: "0.55rem",
                  color: "#ffffff",
                  fontFamily: mono,
                  letterSpacing: "0.5px",
                  marginTop: "2px",
                }}
              >
                {dezenasStr}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
