type FreqItem = { d: number; c: number };

type FreqBarsProps = {
  sorted: FreqItem[];
  total: number;
  maxVal: number;
  bebas: string;
  yellow: string;
  dim: string;
  bdr: string;
};

export function FreqBars({
  sorted,
  total,
  maxVal,
  bebas,
  yellow,
  dim,
  bdr,
}: FreqBarsProps) {
  // Sort by frequency (highest first) to create podium effect
  const podium = [...sorted].sort((a, b) => b.c - a.c);
  
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "flex-end",
        height: "200px",
        marginBottom: "20px",
        padding: "20px 10px",
      }}
    >
      {podium.map(({ d, c }, i) => {
        const barHeight = maxVal > 0 ? (c / maxVal) * 150 : 0;
        const isTop3 = i < 3;
        const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
        
        return (
          <div
            key={d}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
              maxWidth: "60px",
            }}
          >
            {/* Bar */}
            <div
              style={{
                width: "40px",
                height: `${barHeight}px`,
                background: isTop3 
                  ? `linear-gradient(180deg, ${medalColors[i]}, ${medalColors[i]}88)`
                  : "linear-gradient(180deg, #00ff88, #00c8ff)",
                borderRadius: "4px 4px 0 0",
                marginBottom: "8px",
                position: "relative",
                border: isTop3 ? `2px solid ${medalColors[i]}` : "1px solid #00ff88",
              }}
            >
              {/* Medal for top 3 */}
              {isTop3 && (
                <div
                  style={{
                    position: "absolute",
                    top: "-8px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "20px",
                    height: "20px",
                    background: medalColors[i],
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                    color: "#000",
                    border: "1px solid #fff",
                  }}
                >
                  {i + 1}
                </div>
              )}
              {/* Bomb for first place */}
              {i === 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "-25px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "2.2rem",
                  }}
                >
                  💣
                </div>
              )}
              {/* Skull for last place */}
              {i === podium.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: "-25px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "2.2rem",
                  }}
                >
                  💀
                </div>
              )}
            </div>
            
            {/* Digit label */}
            <div
              style={{
                fontFamily: bebas,
                fontSize: "2.2rem",
                color: isTop3 ? medalColors[i] : yellow,
                textAlign: "center",
                marginBottom: "4px",
              }}
            >
              {d}
            </div>
            
            {/* Count */}
            <div
              style={{
                fontSize: "0.85rem",
                color: isTop3 ? medalColors[i] : "#fff",
                textAlign: "center",
                marginBottom: "2px",
              }}
            >
              {c}x
            </div>
            
            {/* Percentage */}
            <div
              style={{
                fontSize: "0.65rem",
                color: dim,
                textAlign: "center",
              }}
            >
              {total > 0 ? ((c / total) * 100).toFixed(1) : 0}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
