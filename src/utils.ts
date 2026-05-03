import { HOURS_ORDER } from "./constants";
import type { ParsedTextResult } from "./types";

export function countDigits(milhares: string[]) {
  const freq = Array(10).fill(0);
  milhares.forEach((m) => m.split("").forEach((d) => freq[parseInt(d, 10)]++));
  return freq;
}

export function parseBancaUniao(text: string): ParsedTextResult {
  const normalized = text
    .replace(/\r/g, "\n")
    .replace(/\bO(\d{3})\b/g, "0$1")
    .replace(/\b(\d{3})O\b/g, "$1" + "0")
    .replace(/\b(\d{2})\s(\d{2})\b/g, (m, a, b) => {
      const num = parseInt(a + b, 10);
      return num <= 9999 ? a + b : m;
    });

  const lines = normalized
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let date: string | null = null;
  let foundResultadosLabel = false;
  for (const line of lines) {
    if (/RESULTADO/i.test(line)) {
      foundResultadosLabel = true;
      continue;
    }
    if (foundResultadosLabel) {
      const dm = line.match(/(\d{2}\/\d{2}\/\d{4})/);
      if (dm) {
        date = dm[1];
        break;
      }
    }
  }
  if (!date) {
    for (const line of lines) {
      const dm = line.match(/(\d{2}\/\d{2}\/\d{4})/);
      if (dm) {
        date = dm[1];
        break;
      }
    }
  }

  const draws: { label: string; milhares: string[] }[] = [];
  let currentLabel: string | null = null;
  let currentMilhares: string[] = [];

  const headerRe = /(?:LT\s*)?NACIONAL\s+(\d{2})\s*(?:HS|:00|H)/i;
  const posRe = /^(?:1[0]|[1-9])\s*[:.·\-]?\s*(\d{4})/;
  const posRe2 = /^(1[0]|[1-9])\s+(\d{4})\b/;

  for (const line of lines) {
    const hm = line.match(headerRe);
    if (hm) {
      if (currentLabel && currentMilhares.length > 0) {
        draws.push({ label: currentLabel, milhares: currentMilhares });
      }
      currentLabel = hm[1] + "HS";
      currentMilhares = [];
      continue;
    }

    if (!currentLabel) continue;

    let milhar: string | null = null;
    const pm = line.match(posRe) || line.match(posRe2);
    if (pm) {
      milhar = pm[posRe.test(line) ? 1 : 2];
    }

    if (!milhar && /^\d{4}$/.test(line)) {
      if (!line.match(/^202[0-9]$/)) milhar = line;
    }

    if (milhar && currentMilhares.length < 10) {
      if (/^\d{4}$/.test(milhar) && !milhar.match(/^202[0-9]$/)) {
        currentMilhares.push(milhar);
      }
    }
  }

  if (currentLabel && currentMilhares.length > 0) {
    draws.push({ label: currentLabel, milhares: currentMilhares });
  }

  if (draws.length === 0) {
    return parseTextGenerico(text);
  }

  return { date, draws };
}

export function parseTextGenerico(text: string): ParsedTextResult {
  const cleanText = text.replace(/\r/g, "\n");
  const dateMatch = cleanText.match(/(\d{2}\/\d{2}\/\d{4})/);
  const date = dateMatch ? dateMatch[1] : null;

  const lines = cleanText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const draws: { label: string; milhares: string[] }[] = [];
  let currentLabel: string | null = null;
  let currentMilhares: string[] = [];

  const hourRe = /(?:^|\D)([0-2]\d)\s*(?:HS|:00)/i;
  const posRe = /(?:^|\s)(?:10|0?[1-9])[º°]?\s*[:.·\-–—]+\s*(\d{4})\b/g;

  for (const line of lines) {
    if (/1º ao 10º/i.test(line)) continue;

    const hourMatch = line.match(hourRe);
    if (hourMatch) {
      if (currentLabel && currentMilhares.length > 0) {
        draws.push({ label: currentLabel, milhares: currentMilhares });
      }
      currentLabel = hourMatch[1] + "HS";
      currentMilhares = [];
      continue;
    }

    const explicitMatches = [...line.matchAll(posRe)];
    if (explicitMatches.length > 0) {
      currentMilhares.push(...explicitMatches.map((m) => m[1]));
      continue;
    }

    if (currentLabel) {
      const temp = [...line.matchAll(/\b(\d{4})\b/g)]
        .map((m) => m[1])
        .filter((n) => !/^202[0-9]$/.test(n));
      if (temp.length > 0 && currentMilhares.length < 10) {
        currentMilhares.push(...temp);
      }
    }
  }

  if (currentLabel && currentMilhares.length > 0) {
    draws.push({ label: currentLabel, milhares: currentMilhares });
  }

  if (draws.length === 0) {
    const allMs = [...cleanText.matchAll(/\b(\d{4})\b/g)]
      .map((m) => m[1])
      .filter((n) => !/^202[0-9]$/.test(n));
    for (let i = 0; i < allMs.length; i += 10) {
      const chunk = allMs.slice(i, i + 10);
      if (chunk.length >= 5) {
        draws.push({
          label: HOURS_ORDER[draws.length] || `EXT${draws.length + 1}`,
          milhares: chunk,
        });
      }
    }
  }

  return { date, draws: draws.filter((d) => d.milhares.length > 0) };
}

export function getGrupoIdFromMilhar(milhar: string) {
  const dezena = parseInt(milhar.slice(-2), 10);
  return dezena === 0 ? 25 : Math.ceil(dezena / 4);
}

export function computeGrupoCounts(milhares: string[]) {
  const counts = Array(25).fill(0);
  milhares.forEach((m) => {
    const grupoId = getGrupoIdFromMilhar(m);
    if (grupoId >= 1 && grupoId <= 25) {
      counts[grupoId - 1]++;
    }
  });
  return counts;
}

export function getAnimalDezenas(groupId: number) {
  const d4Val = groupId * 4;
  const d1 = (d4Val - 3).toString().padStart(2, "0");
  const d2 = (d4Val - 2).toString().padStart(2, "0");
  const d3 = (d4Val - 1).toString().padStart(2, "0");
  const d4 = d4Val === 100 ? "00" : d4Val.toString().padStart(2, "0");
  return `${d1} ${d2} ${d3} ${d4}`;
}

export function getGroupHighlight(
  count: number,
  maxCount: number,
  minCount: number,
  halfCount: number,
  colors: { bdr: string; dim: string; green: string; red: string; orange: string; yellow: string }
) {
  if (maxCount > 0 && count === maxCount) {
    return { borderColor: colors.green, mainColor: colors.green, bgColor: "transparent", opacity: 1 };
  }
  if (count === minCount) {
    return {
      borderColor: colors.red,
      mainColor: colors.red,
      bgColor: "transparent",
      opacity: count === 0 ? 0.4 : 0.9,
    };
  }
  if (count === halfCount && count > 0) {
    return { borderColor: colors.orange, mainColor: colors.orange, bgColor: "transparent", opacity: 0.95 };
  }
  return { borderColor: colors.yellow, mainColor: colors.yellow, bgColor: "transparent", opacity: 0.9 };
}
