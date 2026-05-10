import { useEffect, useMemo, useRef, useState } from "react";
import Tesseract from "tesseract.js";
import { ANIMAIS, HOURS_ORDER, THEME_COLORS } from "./constants";
import { AnimalGroupsGrid } from "./components/AnimalGroupsGrid";
import { FreqBars } from "./components/FreqBars";
import { Game } from "./components/Game";
import { Podium } from "./components/Podium";
import {
  computeGrupoCounts,
  countDigits,
  getGrupoIdFromMilhar,
  parseBancaUniao,
} from "./utils";
import { loadDaysFromCloud, saveDaysToCloud } from "./supabase";
import type { DayResult, Draw, TabMode } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [days, setDays] = useState<DayResult[]>([
    {
      date: "24/04/2026",
      draws: [
        {
          label: "02HS",
          milhares: [
            "7525",
            "6214",
            "4724",
            "3464",
            "7883",
            "7643",
            "5274",
            "2126",
            "5444",
            "0297",
          ],
        },
        {
          label: "08HS",
          milhares: [
            "0157",
            "0369",
            "8242",
            "7561",
            "4139",
            "0087",
            "1325",
            "5646",
            "7921",
            "5447",
          ],
        },
        {
          label: "10HS",
          milhares: [
            "5009",
            "0448",
            "1205",
            "8507",
            "3609",
            "5018",
            "0425",
            "0400",
            "9857",
            "4478",
          ],
        },
        {
          label: "12HS",
          milhares: [
            "2502",
            "7903",
            "4625",
            "9509",
            "0971",
            "2749",
            "5965",
            "0020",
            "2359",
            "4703",
          ],
        },
        {
          label: "15HS",
          milhares: [
            "7931",
            "8180",
            "2110",
            "1738",
            "0838",
            "7821",
            "9117",
            "3813",
            "1008",
            "2556",
          ],
        },
        {
          label: "17HS",
          milhares: [
            "3831",
            "8273",
            "8964",
            "6054",
            "8276",
            "3886",
            "7290",
            "3765",
            "1344",
            "2623",
          ],
        },
        {
          label: "21HS",
          milhares: [
            "7020",
            "4321",
            "6420",
            "2646",
            "0668",
            "7462",
            "0346",
            "2224",
            "0106",
            "1213",
          ],
        },
        {
          label: "23HS",
          milhares: [
            "8112",
            "4485",
            "9736",
            "0762",
            "6476",
            "8490",
            "1477",
            "1836",
            "2562",
            "3936",
          ],
        },
      ],
    },
    {
      date: "25/04/2026",
      draws: [
        {
          label: "02HS",
          milhares: [
            "3851",
            "2487",
            "3791",
            "9466",
            "0452",
            "3239",
            "8474",
            "5896",
            "1716",
            "9372",
          ],
        },
        {
          label: "08HS",
          milhares: [
            "8769",
            "4637",
            "2252",
            "9961",
            "2828",
            "8429",
            "7629",
            "6356",
            "9721",
            "0582",
          ],
        },
        {
          label: "10HS",
          milhares: [
            "8436",
            "5915",
            "6882",
            "3076",
            "5799",
            "8563",
            "4980",
            "3187",
            "6526",
            "3364",
          ],
        },
        {
          label: "12HS",
          milhares: [
            "3549",
            "5240",
            "9845",
            "4313",
            "9036",
            "3594",
            "5283",
            "4441",
            "9053",
            "4354",
          ],
        },
        {
          label: "15HS",
          milhares: [
            "9713",
            "5522",
            "6629",
            "4106",
            "1963",
            "9567",
            "7561",
            "1220",
            "3296",
            "2577",
          ],
        },
        {
          label: "17HS",
          milhares: [
            "6011",
            "1619",
            "7192",
            "3168",
            "5114",
            "6173",
            "0611",
            "1196",
            "9300",
            "3012",
          ],
        },
        {
          label: "21HS",
          milhares: [
            "6980",
            "4693",
            "7521",
            "6314",
            "8428",
            "6476",
            "9653",
            "8921",
            "0314",
            "9300",
          ],
        },
        {
          label: "23HS",
          milhares: [
            "3509",
            "5822",
            "0961",
            "8920",
            "8638",
            "3508",
            "5899",
            "0262",
            "9210",
            "6729",
          ],
        },
      ],
    },
    {
      date: "26/04/2026",
      draws: [
        {
          label: "02HS",
          milhares: [
            "7134",
            "9117",
            "1515",
            "1609",
            "1528",
            "7911",
            "1156",
            "3110",
            "4759",
            "7839",
          ],
        },
        {
          label: "08HS",
          milhares: [
            "0792",
            "3343",
            "3872",
            "1124",
            "7990",
            "0331",
            "7381",
            "9472",
            "2324",
            "6629",
          ],
        },
        {
          label: "10HS",
          milhares: [
            "7266",
            "2437",
            "4586",
            "8490",
            "7150",
            "7248",
            "2454",
            "6389",
            "6760",
            "2780",
          ],
        },
        {
          label: "12HS",
          milhares: [
            "9890",
            "3963",
            "3144",
            "5928",
            "0134",
            "9335",
            "8919",
            "9642",
            "0348",
            "1303",
          ],
        },
        {
          label: "15HS",
          milhares: [
            "6132",
            "1613",
            "5227",
            "0850",
            "9387",
            "6150",
            "1628",
            "3125",
            "2370",
            "6482",
          ],
        },
        {
          label: "17HS",
          milhares: [
            "5192",
            "6807",
            "9088",
            "5865",
            "7554",
            "5695",
            "1808",
            "9086",
            "2785",
            "3880",
          ],
        },
        {
          label: "21HS",
          milhares: [
            "4146",
            "1459",
            "7849",
            "9352",
            "0701",
            "4179",
            "1483",
            "4545",
            "6992",
            "0706",
          ],
        },
        {
          label: "23HS",
          milhares: [
            "8013",
            "8528",
            "1575",
            "6460",
            "7228",
            "8816",
            "0554",
            "1276",
            "3850",
            "6300",
          ],
        },
      ],
    },
    {
      date: "27/04/2026",
      draws: [
        {
          label: "02HS",
          milhares: [
            "2544",
            "8849",
            "1181",
            "6626",
            "6167",
            "2816",
            "5816",
            "4482",
            "4916",
            "3397",
          ],
        },
        {
          label: "08HS",
          milhares: [
            "2344",
            "1922",
            "0240",
            "3738",
            "6517",
            "2103",
            "3927",
            "4243",
            "4208",
            "9242",
          ],
        },
        {
          label: "10HS",
          milhares: [
            "8704",
            "4177",
            "4543",
            "5916",
            "3881",
            "8445",
            "7159",
            "0741",
            "4736",
            "8302",
          ],
        },
        {
          label: "12HS",
          milhares: [
            "7233",
            "2682",
            "9664",
            "2127",
            "2463",
            "7292",
            "2661",
            "3862",
            "3247",
            "1231",
          ],
        },
        {
          label: "15HS",
          milhares: [
            "6301",
            "3719",
            "5525",
            "0032",
            "8822",
            "6350",
            "3750",
            "0123",
            "1952",
            "6574",
          ],
        },
        {
          label: "17HS",
          milhares: [
            "0434",
            "1700",
            "0354",
            "2078",
            "2416",
            "0102",
            "4730",
            "3057",
            "4048",
            "8919",
          ],
        },
        {
          label: "21HS",
          milhares: [
            "5299",
            "6621",
            "0320",
            "7559",
            "0070",
            "5607",
            "2635",
            "9225",
            "9109",
            "6445",
          ],
        },
        {
          label: "23HS",
          milhares: [
            "5488",
            "6384",
            "1126",
            "3541",
            "0417",
            "5613",
            "4315",
            "8824",
            "8461",
            "4169",
          ],
        },
      ],
    },
    {
      date: "28/04/2026",
      draws: [
        {
          label: "02HS",
          milhares: [
            "7273",
            "1878",
            "3932",
            "6522",
            "2543",
            "7136",
            "2895",
            "7732",
            "3822",
            "3733",
          ],
        },
        {
          label: "08HS",
          milhares: [
            "6900",
            "2869",
            "2813",
            "1998",
            "3772",
            "6221",
            "9889",
            "0619",
            "0938",
            "6019",
          ],
        },
        {
          label: "10HS",
          milhares: [
            "8053",
            "9630",
            "2993",
            "5947",
            "8600",
            "8925",
            "0699",
            "5394",
            "3037",
            "3278",
          ],
        },
      ],
    },
  ]);

  const [selectedDay, setSelectedDay] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    return `${mm}/${yyyy}`;
  });
  const [tab, setTab] = useState<TabMode>("dia");
  const [topN, setTopN] = useState(5);
  const [cloudStatus, setCloudStatus] = useState("Nuvem: conectando...");
  const hasLoadedFromCloud = useRef(false);
  const hasClearedLocalSeed = useRef(false);

  // Referência para pular de campo automaticamente
  const inputRefs = useRef([]);

   // Senha Limpar
   const [confirmReset, setConfirmReset] = useState(false);
   const [passInput, setPassInput] = useState("");
   const [removingDay, setRemovingDay] = useState("");
   const [removePassInput, setRemovePassInput] = useState("");
   const [addPassInput, setAddPassInput] = useState("");
   const [showAddPassPrompt, setShowAddPassPrompt] = useState(false);
   const [siteImportPass, setSiteImportPass] = useState("");

  // Estados para o novo formulário de entrada
  const [newDate, setNewDate] = useState("");
  const [newHour, setNewHour] = useState("TODOS");
  const [newMilhares, setNewMilhares] = useState(Array(10).fill(""));
  const [showAddForm, setShowAddForm] = useState(false);

  // --- NOVOS ESTADOS PARA O LEITOR DE PRINT ---
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState("");
  const [isSiteLoading, setIsSiteLoading] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [fetchLogs, setFetchLogs] = useState<string[]>([]);
  const [sitePreview, setSitePreview] = useState<{
    date: string;
    draws: Draw[];
  } | null>(null);
  const [dezenaSearch, setDezenaSearch] = useState("");

   const dezenaResults = useMemo(() => {
     const search = dezenaSearch.trim();
     if (search.length !== 2) return [];
     const results: Array<{ date: string; horario: string }> = [];
     days.forEach(day => {
       day.draws.forEach(draw => {
         const hasDezena = draw.milhares.some(m => m.slice(-2) === search);
         if (hasDezena) {
           results.push({ date: day.date, horario: draw.label });
         }
       });
     });
     return results;
   }, [dezenaSearch, days]);

   const [centenaSearch, setCentenaSearch] = useState("");

   const centenaResults = useMemo(() => {
     const search = centenaSearch.trim();
     if (search.length !== 3) return [];
     const results: Array<{ date: string; horario: string }> = [];
     days.forEach(day => {
       day.draws.forEach(draw => {
         const hasCentena = draw.milhares.some(m => m.slice(1) === search);
         if (hasCentena) {
           results.push({ date: day.date, horario: draw.label });
         }
       });
     });
     return results;
   }, [centenaSearch, days]);

   const [milharSearch, setMilharSearch] = useState("");

   const milharResults = useMemo(() => {
     const search = milharSearch.trim();
     if (search.length !== 4) return [];
     const results: Array<{ date: string; horario: string }> = [];
     days.forEach(day => {
       day.draws.forEach(draw => {
         const hasMilhar = draw.milhares.some(m => m === search);
         if (hasMilhar) {
           results.push({ date: day.date, horario: draw.label });
         }
       });
     });
     return results;
   }, [milharSearch, days]);

  function resetAll() {
    setDays([]);
    setSelectedDay("");
    setConfirmReset(false);
  }

  function removeDay(date) {
    setDays((prev) => {
      const remaining = prev.filter((d) => d.date !== date);
      setSelectedDay(
        remaining.length > 0 ? remaining[remaining.length - 1].date : ""
      );
      return remaining;
    });
  }

  // Função para colocar a data de hoje automaticamente
  const setTodayDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    setNewDate(`${dd}/${mm}/${yyyy}`);
  };

  const navigateDate = (direction: number) => {
    const parts = newDate.split("/");
    if (parts.length !== 3) return;
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);
    const date = new Date(year, month, day);
    date.setDate(date.getDate() + direction);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    setNewDate(`${dd}/${mm}/${yyyy}`);
  };

  // --- NOVA FUNÇÃO: UPLOAD E OCR DA IMAGEM ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsOcrLoading(true);
    setOcrProgress("Iniciando leitura...");

    Tesseract.recognize(file, "por", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          setOcrProgress(`Lendo imagem: ${Math.round(m.progress * 100)}%`);
        }
      },
    })
      .then(({ data: { text } }) => {
        console.log("Texto puro lido pelo OCR no Smartphone:\n", text);

        // 1. Âncora mais flexível (ignora horários do topo do site)
        // Adicionado [eê] caso o OCR perca o acento no celular
        let startIndex = text.search(/Pr[eê]mio|Milhar|Grupo|Bicho/i);
        if (startIndex === -1) startIndex = 0;
        let textParaBuscar = text.substring(startIndex);

        // 2. Limpeza severa: transforma TUDO que não for número em espaço.
        // Isso destrói letras, barras e símbolos que sujam a leitura.
        textParaBuscar = textParaBuscar.replace(/[^0-9]/g, " ");

        // 3. Pega todos os blocos de números isolados que sobraram
        const rawNumbers = textParaBuscar.match(/\d+/g) || [];

        const matches = [];

        for (let num of rawNumbers) {
          // Ignora anos perdidos no texto (2026, 2027)
          if (/^202[0-9]$/.test(num)) continue;

          if (num.length === 4) {
            // Caso perfeito: leu exatamente os 4 dígitos do milhar
            matches.push(num);
          } else if (num.length === 5 && /^[1-9]/.test(num)) {
            // Celular grudou o prêmio e engoliu o º (Ex: "12544")
            // Pega apenas os 4 últimos dígitos ("2544")
            matches.push(num.slice(-4));
          } else if (num.length === 6 && /^[1-9]0/.test(num)) {
            // Celular grudou e leu o º como zero (Ex: "102544" -> 1º virou 10)
            matches.push(num.slice(-4));
          } else if (num.length === 7 && /^100/.test(num)) {
            // Para garantir que o 10º prêmio não fuja se for lido como "100" (Ex: "1003397")
            matches.push(num.slice(-4));
          }
        }

        // 4. Preenche os campos do formulário
        const extractedMilhares = Array(10).fill("");
        for (let i = 0; i < Math.min(matches.length, 10); i++) {
          extractedMilhares[i] = matches[i];
        }

        setNewMilhares(extractedMilhares);
        setIsOcrLoading(false);
        setOcrProgress("");

        if (matches.length >= 10) {
          alert("✅ 10 Milhares extraídos com sucesso!");
        } else if (matches.length > 0) {
          alert(
            `⚠️ Apenas ${matches.length} milhares lidos. Preencha o restante.`
          );
        } else {
          alert("❌ Nenhum milhar encontrado. Tente uma foto mais nítida.");
        }
      })
      .catch((err) => {
        console.error(err);
        setIsOcrLoading(false);
        setOcrProgress("");
        alert("Erro ao processar a imagem.");
      });
  };

  const handleFetchFromSite = async () => {
    if (!newDate || !newHour) {
      alert("Selecione a data e o horário antes de buscar no site.");
      return;
    }

    setIsSiteLoading(true);
    setImportMessage("");
    setFetchLogs(["🚀 Iniciando busca..."]);
    setSitePreview(null);

    const addLog = (msg) => setFetchLogs((prev) => [...prev, msg]);

    const CACHE_KEY = `cached_fetch_${newDate.replace(/\//g, "-")}`;
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      addLog("💾 Cache local encontrado!");
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.draws && parsed.draws.length > 0) {
          addLog("✅ Usando dados do cache.");
          setSitePreview(parsed);
          setImportMessage("Dados carregados do cache local.");
          setIsSiteLoading(false);
          return;
        }
      } catch {}
      localStorage.removeItem(CACHE_KEY);
      addLog("⚠️ Cache inválido, buscando online...");
    }

    const toIsoDateSlug = (brDate) => {
      const [dd, mm, yyyy] = brDate.split("/");
      return `${yyyy}-${mm}-${dd}`;
    };

    const sourceUrls = [
      `https://www.resultadofacil.com.br/resultados-loteria-nacional-do-dia-${toIsoDateSlug(newDate)}-1ao10`,
      `https://www.resultadofacil.com.br/resultado-loteria-nacional-do-dia-${toIsoDateSlug(newDate)}`,
    ];

    const proxies = [
      `https://api.allorigins.win/raw?url=`,
      `https://corsproxy.io/?`,
      `https://r.jina.ai/http://`,
    ];

    let success = false;

    for (const url of sourceUrls) {
      if (success) break;
      addLog(`🔍 Tentando fonte: ${url}`);
      for (const proxy of proxies) {
        if (success) break;
        const proxyUrl = url.includes("http")
          ? `${proxy}${encodeURIComponent(url)}`
          : `${proxy}${url.replace(/^https?:\/\//, "")}`;
        
        addLog(`  📡 Usando proxy: ${proxy.split("//")[1].split("/")[0] || "proxy"}`);
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          const response = await fetch(proxyUrl, { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          let html = await response.text();
          addLog("  ✅ Resposta recebida.");

          const text = html
            .replace(/<script[\s\S]*?<\/script>/gi, " ")
            .replace(/<style[\s\S]*?<\/style>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/&nbsp;/gi, " ")
            .replace(/&amp;/gi, "&")
            .replace(/\s+/g, " ")
            .trim();

          addLog("  🧹 Texto limpo. Extraindo dados...");

          // Validação de data flexível
          const datePatterns = [
            new RegExp(newDate.replace(/\//g, "[/\\-]"), "g"),
            /(\d{2}[/\-]\d{2}[/\-]\d{4})/g
          ];
          let dateFound = false;
          for (const p of datePatterns) {
            const matches = text.match(p);
            if (matches && matches.some(m => m.replace(/[-]/g, "/") === newDate || m === newDate)) {
              dateFound = true;
              break;
            }
          }
          if (!dateFound) {
            addLog("  ⚠️ Data não confirmada no texto. Continuando tentativa...");
            continue;
          }

          const extractedDraws = [];
          // Regex mais robusta para seções
          const sectionRegex = /(?:Nacional|Lotex|Loteria Nacional)\s*[-:]\s*(?:LN\s*)?(\d{2}):00/gi;
          let sectionMatch;
          
          while ((sectionMatch = sectionRegex.exec(text)) !== null) {
            const hour = sectionMatch[1];
            const startIdx = sectionMatch.index;
            const endIdx = sectionRegex.lastIndex;
            
            // Tenta pegar o próximo índice de seção ou fim do texto
            let nextIdx = text.length;
            sectionRegex.lastIndex = startIdx + 1; // Reset for lookahead
            const tempMatch = sectionRegex.exec(text);
            if (tempMatch) nextIdx = tempMatch.index;
            sectionRegex.lastIndex = endIdx;

            const chunk = text.substring(startIdx, nextIdx);
            const milhares = [];
            
            // Regex melhorada para milhares: 1º 1234, 1º[1234], 1-1234, etc.
            const prizeRegex = /(?:10|[1-9])º\s*(?:\[\s*)?(\d{4})/g;
            let prizeMatch;
            while ((prizeMatch = prizeRegex.exec(chunk)) !== null) {
              if (milhares.length < 10) {
                milhares.push(prizeMatch[1]);
              }
            }

            if (milhares.length >= 5) {
              extractedDraws.push({ label: `${hour}HS`, milhares });
            }
          }

          if (extractedDraws.length > 0) {
            extractedDraws.sort(
              (a, b) => HOURS_ORDER.indexOf(a.label) - HOURS_ORDER.indexOf(b.label)
            );
            
            const filteredDraws = newHour === "TODOS"
              ? extractedDraws
              : extractedDraws.filter((d) => d.label === newHour);

            if (filteredDraws.length > 0) {
              addLog(`🎉 Sucesso! ${filteredDraws.length} sorteios encontrados.`);
              localStorage.setItem(CACHE_KEY, JSON.stringify({ date: newDate, draws: filteredDraws }));
              setSitePreview({ date: newDate, draws: filteredDraws });
              setImportMessage("Dados carregados com sucesso! Confira abaixo.");
              success = true;
            } else {
              addLog("⚠️ Horário solicitado não encontrado nesta fonte.");
            }
          } else {
            addLog("❌ Nenhum sorteio extraído. Estrutura pode ter mudado.");
          }
        } catch (err) {
          addLog(`  ⏱️ Falha no proxy/fonte: ${err.message}`);
        }
      }
    }

    if (!success) {
      addLog("💥 Falha em todas as tentativas. Tente o OCR ou adicione manualmente.");
      setImportMessage("Não foi possível obter os dados automaticamente.");
    }

    setIsSiteLoading(false);
  };

   const handleConfirmSiteImport = () => {
     if (!sitePreview) return;
     if (siteImportPass !== "1004") {
       alert("❌ Senha incorreta!");
       setSiteImportPass("");
       return;
     }
     const { date: parsedDate, draws: extractedDraws } = sitePreview;

    setDays((prevDays) => {
      const nextDays = [...prevDays];
      const dayIndex = nextDays.findIndex((d) => d.date === parsedDate);

      if (dayIndex === -1) {
        nextDays.push({
          date: parsedDate,
          draws: extractedDraws,
        });
      } else {
        const merged = [...nextDays[dayIndex].draws];
        extractedDraws.forEach((incoming) => {
          const idx = merged.findIndex((d) => d.label === incoming.label);
          if (idx >= 0) merged[idx] = incoming;
          else merged.push(incoming);
        });
        merged.sort(
          (a, b) => HOURS_ORDER.indexOf(a.label) - HOURS_ORDER.indexOf(b.label)
        );
        nextDays[dayIndex] = { ...nextDays[dayIndex], draws: merged };
      }

      nextDays.sort((a, b) => {
        const [dA, mA, yA] = a.date.split("/").map(Number);
        const [dB, mB, yB] = b.date.split("/").map(Number);
        return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
      });
      return nextDays;
    });

    setSelectedDay(parsedDate);
    setSitePreview(null);
    setImportMessage("Importação confirmada e inserida com sucesso.");
    alert("✅ Resultado inserido com sucesso!");
  };

   const handleAddResult = (e) => {
     e.preventDefault();

     if (addPassInput !== "1004") {
       alert("❌ Senha incorreta!");
       setAddPassInput("");
       return;
     }

     if (!newDate || !newHour) {
       alert("Por favor, selecione a data e o horário.");
       return;
     }
    if (newHour === "TODOS") {
      alert("Para adicionar manualmente, selecione um horário específico.");
      return;
    }
    const validMilhares = newMilhares.filter(
      (m) => m.length === 4 && /^\d+$/.test(m)
    );
    if (validMilhares.length !== 10) {
      alert(
        "Por favor, preencha todos os 10 milhares com 4 dígitos numéricos."
      );
      return;
    }

    const newDraw = {
      label: newHour,
      milhares: validMilhares,
    };

    setDays((prevDays) => {
      const existingDayIndex = prevDays.findIndex(
        (day) => day.date === newDate
      );

      if (existingDayIndex > -1) {
        const updatedDraws = [...prevDays[existingDayIndex].draws];
        const existingDrawIndex = updatedDraws.findIndex(
          (draw) => draw.label === newHour
        );

        if (existingDrawIndex > -1) {
          updatedDraws[existingDrawIndex] = newDraw;
        } else {
          updatedDraws.push(newDraw);
          updatedDraws.sort(
            (a, b) =>
              HOURS_ORDER.indexOf(a.label) - HOURS_ORDER.indexOf(b.label)
          );
        }

        const updatedDays = [...prevDays];
        updatedDays[existingDayIndex] = {
          ...updatedDays[existingDayIndex],
          draws: updatedDraws,
        };
        return updatedDays;
      } else {
        const newDay = {
          date: newDate,
          draws: [newDraw],
        };
        const updatedDays = [...prevDays, newDay];
        updatedDays.sort((a, b) => {
          const [dA, mA, yA] = a.date.split("/").map(Number);
          const [dB, mB, yB] = b.date.split("/").map(Number);
          return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
        });
        return updatedDays;
      }
    });

     setNewDate("");
     setNewHour("TODOS");
     setNewMilhares(Array(10).fill(""));
     setAddPassInput("");
     setShowAddForm(false);
     alert("Resultado adicionado/atualizado com sucesso!");
     setSelectedDay(newDate);
  };

  useEffect(() => {
    if (hasClearedLocalSeed.current) return;
    hasClearedLocalSeed.current = true;
    setDays([]);
    setSelectedDay("");
  }, []);

  useEffect(() => {
    let alive = true;

    async function bootstrapCloud() {
      try {
        const cloudDays = await loadDaysFromCloud();
        if (!alive) return;

        if (cloudDays && cloudDays.length > 0) {
          setDays(cloudDays);
          setSelectedDay((prev) => prev || cloudDays[cloudDays.length - 1]?.date || "");
          setCloudStatus("Nuvem: dados carregados");
        } else {
          setCloudStatus("Nuvem: sem dados remotos");
        }
      } catch (err) {
        console.error("Erro ao carregar do Supabase:", err);
        if (alive) setCloudStatus("Nuvem: erro ao carregar");
      } finally {
        if (alive) hasLoadedFromCloud.current = true;
      }
    }

    bootstrapCloud();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedFromCloud.current) return;

    const timeout = setTimeout(async () => {
      try {
        await saveDaysToCloud(days);
        setCloudStatus("Nuvem: sincronizado");
      } catch (err) {
        console.error("Erro ao salvar no Supabase:", err);
        const message =
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "erro desconhecido";
        setCloudStatus(`Nuvem: erro ao sincronizar (${message})`);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [days]);

  // --- DADOS DO DIA ---
  const currentDay = useMemo(
    () => days.find((d) => d.date === selectedDay),
    [days, selectedDay]
  );
   const dayMilhares = useMemo(
     () =>
       currentDay ? currentDay.draws.flatMap((d) => d.milhares.slice(0, topN)) : [],
     [currentDay, topN]
   );

   const dayCentenaMap = useMemo(() => {
     const map = {};
     dayMilhares.forEach((m) => {
       const c = m.slice(1);
       map[c] = (map[c] || 0) + 1;
     });
     return map;
   }, [dayMilhares]);

   const dayCentenasSorted = useMemo(() => {
     return Object.entries(dayCentenaMap)
       .map(([c, count]) => ({ c, count }))
       .sort((a, b) => b.count - a.count);
   }, [dayCentenaMap]);

   const seenCentenas = useMemo(() => {
     const set = new Set();
     dayMilhares.forEach((m) => {
       set.add(m.slice(1));
     });
     return set;
   }, [dayMilhares]);

  const grupoCounts = useMemo(() => computeGrupoCounts(dayMilhares), [dayMilhares]);
  const maxGrupoCount = Math.max(...grupoCounts, 0);
  const minGrupoCount = Math.min(...grupoCounts, 0);
  const halfGrupoCount = Math.round(maxGrupoCount / 2);

  // --- DADOS GERAIS ---
  const allMilhares = useMemo(
    () => days.flatMap((d) => d.draws.flatMap((dr) => dr.milhares.slice(0, topN))),
    [days, topN]
  );

  const globalGrupoCounts = useMemo(
    () => computeGrupoCounts(allMilhares),
    [allMilhares]
  );
  const maxGlobalGrupoCount = Math.max(...globalGrupoCounts, 0);
  const minGlobalGrupoCount = Math.min(...globalGrupoCounts, 0);
  const halfGlobalGrupoCount = Math.round(maxGlobalGrupoCount / 2);

  // --- OUTROS DADOS ESTATÍSTICOS ---
  const dayFreq = useMemo(() => countDigits(dayMilhares), [dayMilhares]);
  const dayTotal = dayFreq.reduce((a, b) => a + b, 0);
  const dayMax = Math.max(...dayFreq, 1);
  const daySorted = [...dayFreq.map((c, d) => ({ d, c }))].sort(
    (a, b) => b.c - a.c
  );
  const dayDrawFreqs = useMemo(
    () =>
      currentDay ? currentDay.draws.map((d) => countDigits(d.milhares.slice(0, topN))) : [],
    [currentDay, topN]
  );
  const dayColMaxes = dayDrawFreqs.map((f) => Math.max(...f, 1));

  const globalFreq = useMemo(() => countDigits(allMilhares), [allMilhares]);
  const globalTotal = globalFreq.reduce((a, b) => a + b, 0);
  const globalMax = Math.max(...globalFreq, 1);
  const globalSorted = [...globalFreq.map((c, d) => ({ d, c }))].sort(
    (a, b) => b.c - a.c
  );

  const centenaMap = {};
  allMilhares.forEach((m) => {
    const c = m.slice(1);
    centenaMap[c] = (centenaMap[c] || 0) + 1;
  });
  const top50Centenas = Object.entries(centenaMap)
    .map(([c, count]) => ({ c, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
  const maxCentena = top50Centenas.length > 0 ? top50Centenas[0].count : 1;

  const milharMap = {};
  allMilhares.forEach((m) => {
    milharMap[m] = (milharMap[m] || 0) + 1;
  });

  const top20Milhares = Object.entries(milharMap)
    .map(([m, count]) => ({ m, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
  const maxMilhar = top20Milhares.length > 0 ? top20Milhares[0].count : 1;

  const faixaCor = (m) => {
    const v = parseInt(m);
    return v <= 2500
      ? "#4488ff"
      : v <= 5000
      ? "#00ff88"
      : v <= 7500
      ? "#ffd700"
      : "#ff4455";
  };

  const { bg, panel, bdr, yellow, green, orange, dim, text, red } = THEME_COLORS;
  const bebas = "'Bebas Neue', sans-serif",
    mono = "'Share Tech Mono', monospace";

  return (
    <div
      style={{
        background: bg,
        minHeight: "100vh",
        fontFamily: mono,
        color: text,
        padding: "20px 16px 60px",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Bebas+Neue&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes tl-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fire-blink {
          0%, 100% { 
            background: rgba(255,40,70,0.10);
            color: ${red};
            transform: scale(1);
          }
          25% { 
            background: rgba(255,100,0,0.3);
            color: #ff6600;
            transform: scale(1.05);
          }
          50% { 
            background: rgba(255,200,0,0.2);
            color: #ff9900;
            transform: scale(1.1);
          }
          75% { 
            background: rgba(255,50,0,0.25);
            color: #ff3300;
            transform: scale(1.05);
          }
        }
        @keyframes jump {
          0%, 100% { 
            transform: translateY(0);
            background: ${yellow};
            color: #000;
          }
          25% { 
            transform: translateY(-3px);
            background: #ffcc00;
          }
          50% { 
            transform: translateY(-6px);
            background: #ffdd00;
          }
           75% { 
             transform: translateY(-3px);
             background: #ffcc00;
           }
         }
         @keyframes outline-pulse {
           0%, 100% { 
             box-shadow: 0 0 8px ${yellow}88, 0 0 16px ${yellow}44;
             border-color: ${yellow};
           }
           50% { 
             box-shadow: 0 0 16px ${yellow}, 0 0 32px ${yellow}88;
             border-color: #ffcc00;
           }
         }
         @keyframes outline-pulse-green {
           0%, 100% { 
             box-shadow: 0 0 8px ${green}88, 0 0 16px ${green}44;
             border-color: ${green};
           }
           50% { 
             box-shadow: 0 0 16px ${green}, 0 0 32px ${green}88;
             border-color: #00ff44;
           }
         }
       `}</style>

      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <img
          src="https://i.postimg.cc/cJ3pgqmm/businesscard5-26-14159.png"
          alt="TechLines Logo"
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            objectFit: "cover",
            border: `2px solid ${bdr}`,
          }}
        />
      </div>
      {tab !== "game" && (<>
      <div
        style={{
          fontFamily: bebas,
          fontSize: "2rem",
          letterSpacing: "5px",
          color: yellow,
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        TECH LINES
      </div>
      <div
        style={{
          textAlign: "center",
          color: dim,
          fontSize: "0.7rem",
          marginTop: "-16px",
          marginBottom: "16px",
          letterSpacing: "1px",
        }}
      >
        {cloudStatus}
      </div>

      {/* Day selector */}
      <div style={{ marginBottom: "18px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              fontFamily: bebas,
              letterSpacing: "3px",
              color: "#ffffff",
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            DIAS DISPONÍVEIS
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setSelectedDay("");
            }}
            style={{
              background: panel,
              border: `1px solid ${bdr}`,
              color: text,
              fontFamily: bebas,
              fontSize: "0.8rem",
              letterSpacing: "2px",
              borderRadius: "4px",
              padding: "4px 8px",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {Array.from(
              new Set(
                days.map((d) => {
                  const parts = d.date.split("/");
                  return `${parts[1]}/${parts[2]}`;
                })
              )
            )
              .sort()
              .map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
          </select>
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              style={{
                background: "none",
                border: `1px solid ${red}`,
                color: red,
                fontFamily: bebas,
                fontSize: "0.8rem",
                letterSpacing: "2px",
                borderRadius: "4px",
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              🗑 ZERAR TUDO
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="text"
                placeholder="Senha..."
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                style={{
                  width: "70px",
                  background: "transparent",
                  border: `1px solid ${bdr}`,
                  color: text,
                  borderRadius: "4px",
                  padding: "4px 6px",
                  fontFamily: mono,
                  fontSize: "0.8rem",
                  outline: "none",
                  "-webkit-text-security": "disc",
                } as any}
              />
              <button
                onClick={() => {
                  if (passInput === "1004") {
                    resetAll();
                    setPassInput("");
                  } else {
                    alert("❌ Senha incorreta!");
                    setPassInput("");
                  }
                }}
                style={{
                  background: red,
                  border: "none",
                  color: "#000",
                  fontFamily: bebas,
                  fontSize: "0.8rem",
                  letterSpacing: "2px",
                  borderRadius: "4px",
                  padding: "4px 10px",
                  cursor: "pointer",
                }}
              >
                OK
              </button>
              <button
                onClick={() => {
                  setConfirmReset(false);
                  setPassInput("");
                }}
                style={{
                  background: "none",
                  border: `1px solid ${bdr}`,
                  color: text,
                  fontFamily: bebas,
                  fontSize: "0.8rem",
                  letterSpacing: "2px",
                  borderRadius: "4px",
                  padding: "4px 10px",
                  cursor: "pointer",
                }}
              >
                CANCELAR
              </button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {days
            .filter((d) => {
              const parts = d.date.split("/");
              return `${parts[1]}/${parts[2]}` === selectedMonth;
            })
            .map((d) => (
             <div key={d.date} style={{ display: "flex", alignItems: "center" }}>
               <button
                 onClick={() => setSelectedDay(d.date)}
                 style={{
                   background: selectedDay === d.date ? yellow : panel,
                   color: selectedDay === d.date ? "#000" : text,
                   fontFamily: bebas,
                   fontSize: "0.85rem",
                   letterSpacing: "2px",
                   border: `1px solid ${selectedDay === d.date ? yellow : bdr}`,
                   borderRadius: "4px 0 0 4px",
                   padding: "6px 12px",
                   cursor: "pointer",
                 }}
               >
                 {d.date}
               </button>
               {removingDay === d.date ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Senha"
                    value={removePassInput}
                    onChange={(e) => setRemovePassInput(e.target.value)}
                    style={{
                      width: "50px",
                      background: "transparent",
                      border: `1px solid ${bdr}`,
                      color: text,
                      borderRadius: "0",
                      padding: "6px 4px",
                      fontFamily: mono,
                      fontSize: "0.7rem",
                      outline: "none",
                      "-webkit-text-security": "disc",
                    } as any}
                   />
                   <button
                     onClick={() => {
                       if (removePassInput === "1004") {
                         removeDay(d.date);
                         setRemovingDay("");
                         setRemovePassInput("");
                       } else {
                         alert("❌ Senha incorreta!");
                         setRemovePassInput("");
                       }
                     }}
                     style={{
                       background: red,
                       border: "none",
                       color: "#000",
                       fontFamily: bebas,
                       fontSize: "0.7rem",
                       borderRadius: "0 4px 4px 0",
                       padding: "6px 6px",
                       cursor: "pointer",
                     }}
                   >
                     OK
                   </button>
                   <button
                     onClick={() => {
                       setRemovingDay("");
                       setRemovePassInput("");
                     }}
                     style={{
                       background: "none",
                       border: `1px solid ${bdr}`,
                       color: text,
                       fontFamily: bebas,
                       fontSize: "0.7rem",
                       borderRadius: "4px",
                       padding: "6px 6px",
                       cursor: "pointer",
                       marginLeft: "2px",
                     }}
                   >
                     X
                   </button>
                 </div>
               ) : (
                 <button
                   onClick={() => setRemovingDay(d.date)}
                   style={{
                     background: selectedDay === d.date ? "#cc8800" : bdr,
                     color: selectedDay === d.date ? "#000" : red,
                     border: `1px solid ${selectedDay === d.date ? yellow : bdr}`,
                     borderRadius: "0 4px 4px 0",
                     padding: "6px 8px",
                     cursor: "pointer",
                     fontSize: "0.9rem",
                     lineHeight: 1,
                   }}
                 >
                   ×
                 </button>
               )}
             </div>
           ))}
        </div>
      </div>

       {/* Botão para mostrar/esconder o formulário de adicionar resultado */}
       <div style={{ marginBottom: "18px", textAlign: "center" }}>
         {showAddPassPrompt ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <input
                type="text"
                placeholder="Senha..."
                value={addPassInput}
                onChange={(e) => setAddPassInput(e.target.value)}
                style={{
                  width: "70px",
                  background: "transparent",
                  border: `1px solid ${bdr}`,
                  color: text,
                  borderRadius: "4px",
                  padding: "4px 6px",
                  fontFamily: mono,
                  fontSize: "0.8rem",
                  outline: "none",
                  "-webkit-text-security": "disc",
                } as any}
             />
             <button
                onClick={() => {
                  if (addPassInput === "1004") {
                    setShowAddForm(true);
                   setShowAddPassPrompt(false);
                   setAddPassInput("");
                 } else {
                   alert("❌ Senha incorreta!");
                   setAddPassInput("");
                 }
               }}
               style={{
                 background: green,
                 border: "none",
                 color: "#000",
                 fontFamily: bebas,
                 fontSize: "0.8rem",
                 letterSpacing: "2px",
                 borderRadius: "4px",
                 padding: "4px 10px",
                 cursor: "pointer",
               }}
             >
               OK
             </button>
             <button
               onClick={() => {
                 setShowAddPassPrompt(false);
                 setAddPassInput("");
               }}
               style={{
                 background: "none",
                 border: `1px solid ${bdr}`,
                 color: text,
                 fontFamily: bebas,
                 fontSize: "0.8rem",
                 letterSpacing: "2px",
                 borderRadius: "4px",
                 padding: "4px 10px",
                 cursor: "pointer",
               }}
             >
               CANCELAR
             </button>
           </div>
         ) : (
           <button
             onClick={() => {
               if (showAddForm) {
                 setShowAddForm(false);
               } else {
                 setShowAddPassPrompt(true);
               }
             }}
             style={{
               background: green,
               border: "none",
               color: "#000",
               fontFamily: bebas,
               fontSize: "0.9rem",
               letterSpacing: "2px",
               borderRadius: "6px",
               padding: "8px 15px",
               cursor: "pointer",
               width: "100%",
             }}
           >
             {showAddForm
               ? "ESCONDER FORMULÁRIO"
               : "ADICIONAR RESULTADO MANUALMENTE"}
           </button>
         )}
       </div>

      {/* Formulário para adicionar resultado manualmente */}
      {showAddForm && (
        <div
          style={{
            background: panel,
            border: `1px solid ${bdr}`,
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              fontFamily: bebas,
              letterSpacing: "3px",
              color: yellow,
              marginBottom: "15px",
              fontSize: "1.1rem",
              textAlign: "center",
            }}
          >
            ADICIONAR NOVO RESULTADO
          </div>
          <form onSubmit={handleAddResult}>
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  fontFamily: bebas,
                  fontSize: "0.85rem",
                  color: dim,
                  marginBottom: "5px",
                }}
              >
                DATA (DD/MM/AAAA):
              </label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => navigateDate(-1)}
                  style={{
                    background: panel,
                    color: yellow,
                    border: `1px solid ${yellow}`,
                    borderRadius: "4px",
                    padding: "8px 10px",
                    fontFamily: bebas,
                    fontSize: "1rem",
                    cursor: "pointer",
                    lineHeight: 1,
                  }}
                >
                  ‹
                </button>
                <input
                  type="text"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  placeholder="Ex: 27/04/2026"
                  pattern="\d{2}/\d{2}/\d{4}"
                  required
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "4px",
                    border: `1px solid ${bdr}`,
                    background: bg,
                    color: text,
                    fontFamily: mono,
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => navigateDate(1)}
                  style={{
                    background: panel,
                    color: yellow,
                    border: `1px solid ${yellow}`,
                    borderRadius: "4px",
                    padding: "8px 10px",
                    fontFamily: bebas,
                    fontSize: "1rem",
                    cursor: "pointer",
                    lineHeight: 1,
                  }}
                >
                  ›
                </button>
                <button
                  type="button"
                  onClick={setTodayDate}
                  style={{
                    background: panel,
                    color: green,
                    border: `1px solid ${green}`,
                    borderRadius: "4px",
                    padding: "0 15px",
                    fontFamily: bebas,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    letterSpacing: "1px",
                  }}
                >
                  HOJE
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  fontFamily: bebas,
                  fontSize: "0.85rem",
                  color: dim,
                  marginBottom: "5px",
                }}
              >
                HORÁRIO:
              </label>
              <select
                value={newHour}
                onChange={(e) => setNewHour(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: `1px solid ${bdr}`,
                  background: bg,
                  color: text,
                  fontFamily: mono,
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              >
                <option value="TODOS">TODOS</option>
                {HOURS_ORDER.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
            </div>

            {/* BLOCO DE UPLOAD DE IMAGEM PARA LEITURA (OCR) */}
            <div
              style={{
                marginBottom: "20px",
                padding: "10px",
                border: `1px dashed ${dim}`,
                borderRadius: "6px",
                textAlign: "center",
                background: "#0d0f14",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontFamily: bebas,
                  fontSize: "0.95rem",
                  color: green,
                  cursor: "pointer",
                  letterSpacing: "1px",
                  transition: "color 0.2s",
                }}
              >
                {isOcrLoading ? (
                  <span style={{ color: yellow }}>⏳ {ocrProgress}</span>
                ) : (
                  <span>📸 IMPORTAR MILHARES DE UM PRINT</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isOcrLoading}
                  style={{ display: "none" }}
                />
              </label>
              <button
                type="button"
                onClick={handleFetchFromSite}
                disabled={isSiteLoading}
                style={{
                  marginTop: "10px",
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: `1px solid ${yellow}`,
                  background: isSiteLoading ? panel : "#1a1a2e",
                  color: yellow,
                  fontFamily: bebas,
                  fontSize: "0.85rem",
                  letterSpacing: "1px",
                  cursor: isSiteLoading ? "not-allowed" : "pointer",
                }}
              >
                {isSiteLoading
                  ? "BUSCANDO RESULTADO..."
                  : "BUSCAR RESULTADO SOLICITADO (FONTE: RESULTADO FÁCIL)"}
              </button>
              {isSiteLoading && (
                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    color: yellow,
                    fontFamily: bebas,
                    fontSize: "0.8rem",
                    letterSpacing: "1px",
                  }}
                >
                  <span
                    style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      border: `2px solid ${yellow}55`,
                      borderTopColor: yellow,
                      animation: "tl-spin 0.8s linear infinite",
                    }}
                  />
                  CARREGANDO DADOS...
                </div>
              )}
               {sitePreview && (
                 <div
                   style={{
                     marginTop: "10px",
                     border: `1px solid ${bdr}`,
                     borderRadius: "6px",
                     padding: "10px",
                     background: bg,
                     textAlign: "left",
                   }}
                 >
                   <div
                     style={{
                       fontFamily: bebas,
                       color: yellow,
                       fontSize: "0.85rem",
                       letterSpacing: "1px",
                       marginBottom: "8px",
                     }}
                   >
                     CONFIRME A INSERÇÃO - DATA {sitePreview.date}
                   </div>
                   {sitePreview.draws.map((draw) => (
                     <div
                       key={draw.label}
                       style={{
                         marginBottom: "6px",
                         fontSize: "0.76rem",
                         color: text,
                         fontFamily: mono,
                       }}
                     >
                       <strong style={{ color: green }}>{draw.label}</strong>{" "}
                       {draw.milhares.join(" ")}
                     </div>
                   ))}
                   <div style={{ marginBottom: "10px" }}>
                     <label
                       style={{
                         display: "block",
                         fontFamily: bebas,
                         fontSize: "0.75rem",
                         color: dim,
                         marginBottom: "4px",
                       }}
                     >
                       SENHA PARA IMPORTAR:
                     </label>
                    <input
                      type="text"
                      value={siteImportPass}
                      onChange={(e) => setSiteImportPass(e.target.value)}
                      placeholder="Digite a senha..."
                      style={{
                        width: "100%",
                        padding: "6px",
                        borderRadius: "4px",
                        border: `1px solid ${bdr}`,
                        background: "#0d0f14",
                        color: text,
                        fontFamily: mono,
                        fontSize: "0.8rem",
                        outline: "none",
                        boxSizing: "border-box",
                        "-webkit-text-security": "disc",
                      } as any}
                     />
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                      <button
                        type="button"
                        onClick={handleConfirmSiteImport}
                       style={{
                         flex: 1,
                         padding: "8px",
                         borderRadius: "4px",
                         border: "none",
                         background: green,
                         color: "#000",
                         fontFamily: bebas,
                         letterSpacing: "1px",
                         cursor: "pointer",
                       }}
                     >
                       CONFIRMAR INSERÇÃO
                     </button>
                     <button
                       type="button"
                       onClick={() => {
                         setSitePreview(null);
                         setSiteImportPass("");
                         setImportMessage("Prévia cancelada.");
                       }}
                       style={{
                         flex: 1,
                         padding: "8px",
                         borderRadius: "4px",
                         border: `1px solid ${red}`,
                         background: "transparent",
                         color: red,
                         fontFamily: bebas,
                         letterSpacing: "1px",
                         cursor: "pointer",
                       }}
                     >
                       CANCELAR
                     </button>
                   </div>
                 </div>
               )}
              {importMessage && (
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "0.72rem",
                    color: dim,
                    fontFamily: mono,
                  }}
                >
                  {importMessage}
                </div>
              )}
              {fetchLogs.length > 0 && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "8px",
                    background: "#000",
                    border: `1px solid ${bdr}`,
                    borderRadius: "4px",
                    maxHeight: "150px",
                    overflowY: "auto",
                    fontSize: "0.65rem",
                    color: "#aaa",
                    fontFamily: mono,
                    lineHeight: "1.4",
                  }}
                >
                  {fetchLogs.map((log, i) => (
                    <div key={i} style={{ marginBottom: "2px" }}>{log}</div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontFamily: bebas,
                  fontSize: "0.85rem",
                  color: dim,
                  marginBottom: "10px",
                }}
              >
                MILHARES (1º ao 10º):
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                  gap: "10px",
                }}
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    value={newMilhares[i]}
                    onChange={(e) => {
                      // Permite apenas números
                      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      const updatedMilhares = [...newMilhares];
                      updatedMilhares[i] = val;
                      setNewMilhares(updatedMilhares);

                      // Auto-focus para o próximo campo
                      if (val.length === 4 && i < 9) {
                        inputRefs.current[i + 1]?.focus();
                      }
                    }}
                    placeholder={`${i + 1}º`}
                    maxLength="4"
                    pattern="\d{4}"
                    required
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: `1px solid ${bdr}`,
                      background: bg,
                      color: text,
                      fontFamily: mono,
                      fontSize: "0.9rem",
                      textAlign: "center",
                      outline: "none",
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
               <label
                 style={{
                   display: "block",
                   fontFamily: bebas,
                   fontSize: "0.85rem",
                   color: dim,
                   marginBottom: "5px",
                 }}
               >
                 SENHA PARA ADICIONAR:
               </label>
              <input
                type="text"
                value={addPassInput}
                onChange={(e) => setAddPassInput(e.target.value)}
                placeholder="Digite a senha..."
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: `1px solid ${bdr}`,
                  background: bg,
                  color: text,
                  fontFamily: mono,
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                  "-webkit-text-security": "disc",
                } as any}
               />
              </div>

             <button
                type="submit"
               style={{
                 background: yellow,
                 border: "none",
                 color: "#000",
                 fontFamily: bebas,
                 fontSize: "1rem",
                 letterSpacing: "2px",
                 borderRadius: "6px",
                 padding: "10px 20px",
                 cursor: "pointer",
                 width: "100%",
               }}
             >
               ADICIONAR/ATUALIZAR RESULTADO
             </button>
           </form>
         </div>
       )}
      </>)}
      <Podium />

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
        {[
          ["dia", "RANKING DO DIA"],
          ["geral", "RANKING GERAL"],
          ["palpites", "PALPITES"],
          ["game", "JOGO"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key as TabMode)}
            style={{
              flex: 1,
              padding: "10px",
              fontFamily: bebas,
              fontSize: "0.95rem",
              letterSpacing: "3px",
              background:
                tab === key
                  ? key === "dia"
                    ? yellow
                    : key === "palpites"
                    ? orange
                    : key === "game"
                    ? "#a855f7"
                    : green
                  : panel,
              color: tab === key ? "#000" : dim,
              border: `1px solid ${
                tab === key
                  ? key === "dia"
                    ? yellow
                    : key === "palpites"
                    ? orange
                    : key === "game"
                    ? "#a855f7"
                    : green
                  : bdr
              }`,
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TopN toggle */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
        {[5, 10].map((n) => (
          <button
            key={n}
            onClick={() => setTopN(n)}
            style={{
              flex: 1,
              padding: "8px",
              fontFamily: bebas,
              fontSize: "0.9rem",
              letterSpacing: "3px",
              background: topN === n ? "#1a1a2e" : panel,
              color: topN === n ? "#00c8ff" : dim,
              border: `1px solid ${topN === n ? "#00c8ff" : bdr}`,
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            1 A {n}
          </button>
        ))}
      </div>

      {/* ── DAY VIEW ── */}
      {tab === "dia" && currentDay && (
        <>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              fontSize: "0.72rem",
              color: dim,
              letterSpacing: "1px",
              marginBottom: "18px",
            }}
          >
            {[
              ["DATA", currentDay.date],
              ["EXTRAÇÕES", currentDay.draws.length],
              ["MILHARES", dayMilhares.length],
              ["DÍGITOS", dayTotal],
              ["MAIS FREQ.", `${daySorted[0].d} (${daySorted[0].c}x)`],
            ].map(([k, v]) => (
              <div key={k}>
                {k} <span style={{ color: text }}>{v}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              background: panel,
              border: `1px solid ${bdr}`,
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                fontFamily: bebas,
                letterSpacing: "3px",
                color: "#ffffff",
                marginBottom: "8px",
                fontSize: "0.9rem",
                textAlign: "center",
              }}
            >
              CARROSSEL DE EXTRAÇÕES — {currentDay.date}
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                overflowX: "auto",
                paddingBottom: "6px",
              }}
            >
              {currentDay.draws.map((draw) => {
                const shown = draw.milhares.slice(0, topN);
                return (
                  <div
                    key={`carousel-${draw.label}`}
                    style={{
                      minWidth: topN === 5 ? "300px" : "360px",
                      background: bg,
                      border: `1px solid ${bdr}`,
                      borderRadius: "8px",
                      padding: "12px",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: bebas,
                        color: yellow,
                        letterSpacing: "2px",
                        marginBottom: "8px",
                        textAlign: "center",
                      }}
                    >
                      {draw.label}
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          topN === 5 ? "minmax(0, 1fr)" : "repeat(2, minmax(0, 1fr))",
                        gap: "8px",
                      }}
                    >
                      {shown.map((m, idx) => {
                        const grupoId = getGrupoIdFromMilhar(m);
                        const animal = ANIMAIS[grupoId - 1];
                        return (
                          <div
                            key={`${draw.label}-${m}-${idx}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "6px",
                              padding: "6px 8px",
                              borderRadius: "6px",
                              border: `1px solid ${bdr}`,
                              fontSize: "0.72rem",
                              background: "#0d0f14",
                            }}
                          >
                            <span style={{ color: dim, fontFamily: bebas, width: "24px" }}>
                              {idx + 1}º
                            </span>
                            <span style={{ color: text, fontFamily: mono, width: "44px" }}>
                              {m}
                            </span>
                            <span style={{ color: yellow, fontFamily: bebas, width: "28px" }}>
                              G{String(grupoId).padStart(2, "0")}
                            </span>
                            <span
                              style={{
                                color: text,
                                fontSize: "0.66rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                flex: 1,
                              }}
                              title={animal?.nome}
                            >
                              {animal?.emoji} {animal?.nome}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TABELA DE GRUPOS (ANIMAIS) DO DIA */}
          <div
            style={{
              background: panel,
              border: `1px solid ${bdr}`,
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                fontFamily: bebas,
                letterSpacing: "3px",
                color: "#ffffff",
                marginBottom: "4px",
                fontSize: "0.9rem",
                textAlign: "center",
              }}
            >
              GRUPOS DO DIA (ANIMAIS) — {currentDay.date}
            </div>
            <div
              style={{
                fontSize: "0.68rem",
                color: "#ffffff",
                letterSpacing: "1px",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              CONTAGEM BASEADA NA DEZENA FINAL (1 A {topN})
            </div>
            <AnimalGroupsGrid
              counts={grupoCounts}
              maxCount={maxGrupoCount}
              minCount={minGrupoCount}
              halfCount={halfGrupoCount}
              bdr={bdr}
              dim={dim}
              green={green}
              red={red}
              orange={orange}
              yellow={yellow}
              bebas={bebas}
              mono={mono}
            />
          </div>

          {/* Frequência do dia */}
          <div
            style={{
              background: panel,
              border: `1px solid ${bdr}`,
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                fontFamily: bebas,
                letterSpacing: "3px",
                color: "#ffffff",
                marginBottom: "12px",
                fontSize: "0.9rem",
                textAlign: "center",
              }}
            >
              FREQUÊNCIA DE DÍGITOS — {currentDay.date}
            </div>
            <FreqBars
              sorted={daySorted}
              total={dayTotal}
              maxVal={dayMax}
              bebas={bebas}
              yellow={yellow}
              dim={dim}
              bdr={bdr}
            />
          </div>

          {/* Andamento */}
          <div
            style={{
              background: panel,
              border: `1px solid ${bdr}`,
              borderRadius: "10px",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <button
                onClick={() => {
                  const idx = days.findIndex((d) => d.date === selectedDay);
                  if (idx > 0) setSelectedDay(days[idx - 1].date);
                }}
                style={{
                  background: "transparent",
                  border: `1px solid ${bdr}`,
                  color: yellow,
                  fontFamily: bebas,
                  fontSize: "1.2rem",
                  borderRadius: "4px",
                  padding: "2px 10px",
                  cursor: "pointer",
                }}
              >
                {"<"}
              </button>
              <div
                style={{
                  fontFamily: bebas,
                  letterSpacing: "3px",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                }}
              >
                ANDAMENTO — {currentDay.date}
              </div>
              <button
                onClick={() => {
                  const idx = days.findIndex((d) => d.date === selectedDay);
                  if (idx < days.length - 1) setSelectedDay(days[idx + 1].date);
                }}
                style={{
                  background: "transparent",
                  border: `1px solid ${bdr}`,
                  color: yellow,
                  fontFamily: bebas,
                  fontSize: "1.2rem",
                  borderRadius: "4px",
                  padding: "2px 10px",
                  cursor: "pointer",
                }}
              >
                {">"}
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.78rem",
                  minWidth: "280px",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        fontFamily: bebas,
                        letterSpacing: "2px",
                        color: yellow,
                        padding: "8px 6px 8px 10px",
                        borderBottom: `1px solid ${bdr}`,
                        textAlign: "left",
                        background: bg,
                      }}
                    >
                      DIG
                    </th>
                    {currentDay.draws.map((d) => (
                      <th
                        key={d.label}
                        style={{
                          fontFamily: bebas,
                          letterSpacing: "2px",
                          color: yellow,
                          padding: "8px 6px",
                          borderBottom: `1px solid ${bdr}`,
                          textAlign: "center",
                          background: bg,
                        }}
                      >
                        {d.label}
                      </th>
                    ))}
                    <th
                      style={{
                        fontFamily: bebas,
                        letterSpacing: "2px",
                        color: green,
                        padding: "8px 6px",
                        borderBottom: `1px solid ${bdr}`,
                        textAlign: "center",
                        background: bg,
                      }}
                    >
                      TOT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }, (_, d) => (
                    <tr
                      key={d}
                      style={{
                        background:
                          d % 2 === 0
                            ? "transparent"
                            : "rgba(255,255,255,0.02)",
                      }}
                    >
                      <td
                        style={{
                          fontFamily: bebas,
                          fontSize: "1.1rem",
                          color: yellow,
                          padding: "6px 6px 6px 10px",
                          borderBottom: `1px solid ${bdr}`,
                        }}
                      >
                        {d}
                      </td>
                      {dayDrawFreqs.map((f, i) => {
                        const v = f[d];
                        const isHigh = v === dayColMaxes[i] && v > 0;
                        const isZero = v === 0;
                        return (
                          <td
                            key={i}
                            style={{
                              padding: "6px",
                              borderBottom: `1px solid ${bdr}`,
                              textAlign: "center",
                              color: isZero ? red : isHigh ? "#000" : text,
                              background: isZero
                                ? "rgba(255,40,70,0.10)"
                                : isHigh
                                ? yellow
                                : "transparent",
                              fontWeight: isHigh ? "bold" : "normal",
                              ...(isZero && {
                                animation: "fire-blink 4s ease-in-out infinite",
                              }),
                              ...(isHigh && {
                                animation: "jump 3s ease-in-out infinite",
                              }),
                            }}
                          >
                            {v}
                          </td>
                        );
                      })}
                      <td
                        style={{
                          padding: "6px",
                          borderBottom: `1px solid ${bdr}`,
                          textAlign: "center",
                          color: green,
                          fontWeight: "bold",
                        }}
                      >
                        {dayFreq[d]}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      style={{
                        fontFamily: bebas,
                        padding: "8px 6px 8px 10px",
                        borderTop: `2px solid ${yellow}`,
                        color: yellow,
                        background: bg,
                      }}
                    >
                      TOT
                    </td>
                    {dayDrawFreqs.map((f, i) => (
                      <td
                        key={i}
                        style={{
                          padding: "8px 6px",
                          borderTop: `2px solid ${yellow}`,
                          textAlign: "center",
                          color: text,
                          background: bg,
                        }}
                      >
                        {f.reduce((a, b) => a + b, 0)}
                      </td>
                    ))}
                    <td
                      style={{
                        padding: "8px 6px",
                        borderTop: `2px solid ${yellow}`,
                        textAlign: "center",
                        color: green,
                        fontWeight: "bold",
                        background: bg,
                      }}
                    >
                      {dayTotal}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Distribuição 4 faixas — dia */}
          {(() => {
            const faixas = [
              {
                label: "0000–2500",
                cor: "#4488ff",
                fn: (m) => parseInt(m) <= 2500,
              },
              {
                label: "2501–5000",
                cor: "#00ff88",
                fn: (m) => parseInt(m) >= 2501 && parseInt(m) <= 5000,
              },
              {
                label: "5001–7500",
                cor: "#ffd700",
                fn: (m) => parseInt(m) >= 5001 && parseInt(m) <= 7500,
              },
              {
                label: "7501–9999",
                cor: "#ff4455",
                fn: (m) => parseInt(m) >= 7501,
              },
            ];
            const totDia = dayMilhares.length || 1;
            const countsDia = faixas.map(
              (f) => dayMilhares.filter(f.fn).length
            );

            // ── DEZENAS DO DIA ──
            const seenDezenas = new Set();
            dayMilhares.forEach((m) => {
              const d = m.slice(2);
              seenDezenas.add(d);
            });

            return (
              <>
              {/* DEZENAS DO DIA */}
              <div
                style={{
                  background: panel,
                  border: `1px solid ${bdr}`,
                  borderRadius: "10px",
                  padding: "16px",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <button
                    onClick={() => {
                      const idx = days.findIndex((d) => d.date === selectedDay);
                      if (idx > 0) setSelectedDay(days[idx - 1].date);
                    }}
                    style={{
                      background: "transparent",
                      border: `1px solid ${bdr}`,
                      color: yellow,
                      fontFamily: bebas,
                      fontSize: "1.2rem",
                      borderRadius: "4px",
                      padding: "2px 10px",
                      cursor: "pointer",
                    }}
                  >
                    {"<"}
                  </button>
                  <div
                    style={{
                      fontFamily: bebas,
                      letterSpacing: "3px",
                      color: "#ffffff",
                      fontSize: "1.5rem",
                    }}
                  >
                    DEZENAS DO DIA — {currentDay.date}
                  </div>
                  <button
                    onClick={() => {
                      const idx = days.findIndex((d) => d.date === selectedDay);
                      if (idx < days.length - 1) setSelectedDay(days[idx + 1].date);
                    }}
                    style={{
                      background: "transparent",
                      border: `1px solid ${bdr}`,
                      color: yellow,
                      fontFamily: bebas,
                      fontSize: "1.2rem",
                      borderRadius: "4px",
                      padding: "2px 10px",
                      cursor: "pointer",
                    }}
                  >
                    {">"}
                  </button>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(10, 1fr)",
                    gap: "4px",
                  }}
                >
                  {Array.from({ length: 100 }, (_, i) => {
                    const dezena = i.toString().padStart(2, "0");
                    const isSeen = seenDezenas.has(dezena);
                    let animal = null;
                    if (isSeen) {
                      animal = ANIMAIS.find((a) => {
                        const val = parseInt(dezena);
                        if (val === 0) return a.id === 25;
                        const start = (a.id - 1) * 4 + 1;
                        const end = a.id * 4;
                        return val >= start && val <= end;
                      });
                    }

                    return (
                      <div
                        key={dezena}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "2px",
                          padding: "4px 2px",
                          borderRadius: "4px",
                          fontSize: "0.65rem",
                          fontFamily: mono,
                          transition: "all 0.3s",
                          background: isSeen ? "rgba(255,255,255,0.1)" : "transparent",
                          color: isSeen ? "#ffffff" : dim,
                          opacity: isSeen ? 1 : 0.25,
                          border: isSeen ? `1px solid ${yellow}` : `1px solid ${bdr}33`,
                          ...(isSeen && {
                            boxShadow: `0 0 6px ${yellow}66`,
                            animation: "fire-blink 4s ease-in-out infinite",
                          }),
                        }}
                      >
                        <span style={{ fontWeight: isSeen ? "bold" : "normal" }}>
                          {dezena}
                        </span>
                        {isSeen && animal && (
                          <span style={{ fontSize: "0.7rem" }}>{animal.emoji}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BUSCA DE DEZENA */}
              <div
                style={{
                  background: panel,
                  border: `1px solid ${bdr}`,
                  borderRadius: "10px",
                  padding: "16px",
                  marginTop: "18px",
                }}
              >
                <div
                  style={{
                    fontFamily: bebas,
                    letterSpacing: "3px",
                    color: "#ffffff",
                    marginBottom: "10px",
                    fontSize: "1.1rem",
                    textAlign: "center",
                  }}
                >
                  BUSCAR DEZENA
                </div>
                <input
                  type="text"
                  placeholder="Digite a dezena..."
                  maxLength={2}
                  value={dezenaSearch}
                  onChange={e => setDezenaSearch(e.target.value)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: `1px solid ${bdr}`,
                    color: "#ffffff",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    fontFamily: bebas,
                    fontSize: "1rem",
                    letterSpacing: "2px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {dezenaResults.length > 0 && (
                  <div style={{ marginTop: "12px", fontSize: "0.85rem", color: "#ffffff" }}>
                    <div style={{ fontFamily: bebas, letterSpacing: "2px", marginBottom: "6px" }}>
                      RESULTADOS ({dezenaResults.length}):
                    </div>
                    {dezenaResults.map((r, i) => (
                      <div key={i} style={{ padding: "4px 0", borderBottom: `1px solid ${bdr}33` }}>
                        {r.date} — {r.horario}
                      </div>
                    ))}
                  </div>
                )}
                 {dezenaSearch.trim().length === 2 && dezenaResults.length === 0 && (
                   <div style={{ marginTop: "12px", fontSize: "0.85rem", color: "#ff6666", fontFamily: bebas }}>
                     NENHUM RESULTADO ENCONTRADO
                   </div>
                 )}
               </div>

               {/* CENTENAS DO DIA - APENAS SORTEADAS */}
               {dayCentenasSorted.length > 0 && (
                 <div
                   style={{
                     background: panel,
                     border: `1px solid ${bdr}`,
                     borderRadius: "10px",
                     padding: "16px",
                     marginTop: "18px",
                   }}
                 >
                   <div
                     style={{
                       fontFamily: bebas,
                       letterSpacing: "3px",
                       color: "#ffffff",
                       marginBottom: "10px",
                       fontSize: "1.1rem",
                       textAlign: "center",
                     }}
                   >
                     CENTENAS DO DIA — {currentDay.date}
                   </div>
                   <div
                     style={{
                       display: "flex",
                       flexWrap: "wrap",
                       gap: "6px",
                       justifyContent: "center",
                     }}
                   >
                     {dayCentenasSorted.map(({ c, count }) => {
                       const dezena = c.slice(1);
                       const val = parseInt(dezena);
                       const animal = ANIMAIS.find((a) => {
                         if (val === 0) return a.id === 25;
                         const start = (a.id - 1) * 4 + 1;
                         const end = a.id * 4;
                         return val >= start && val <= end;
                       });
                       return (
                         <div
                           key={c}
                           style={{
                             background: "rgba(255,255,255,0.05)",
                             border: `1px solid ${yellow}`,
                             borderRadius: "4px",
                             padding: "4px 8px",
                             display: "flex",
                             alignItems: "center",
                             gap: "4px",
                             boxShadow: `0 0 6px ${yellow}66`,
                             animation: "fire-blink 4s ease-in-out infinite",
                           }}
                         >
                           <span style={{ fontFamily: mono, color: "#ffffff", fontSize: "0.85rem" }}>
                             {c}
                           </span>
                           {animal && (
                             <span style={{ fontSize: "0.7rem" }}>{animal.emoji}</span>
                           )}
                           <span style={{ fontFamily: bebas, color: yellow, fontSize: "0.7rem" }}>
                             {count}x
                           </span>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               )}

               {/* BUSCA DE CENTENA */}
               <div
                 style={{
                   background: panel,
                   border: `1px solid ${bdr}`,
                   borderRadius: "10px",
                   padding: "16px",
                   marginTop: "18px",
                 }}
               >
                 <div
                   style={{
                     fontFamily: bebas,
                     letterSpacing: "3px",
                     color: "#ffffff",
                     marginBottom: "10px",
                     fontSize: "1.1rem",
                     textAlign: "center",
                   }}
                 >
                   BUSCAR CENTENA
                 </div>
                 <input
                   type="text"
                   placeholder="Digite a centena..."
                   maxLength={3}
                   value={centenaSearch}
                   onChange={e => setCentenaSearch(e.target.value)}
                   style={{
                     width: "100%",
                     background: "transparent",
                     border: `1px solid ${bdr}`,
                     color: "#ffffff",
                     borderRadius: "4px",
                     padding: "8px 12px",
                     fontFamily: bebas,
                     fontSize: "1rem",
                     letterSpacing: "2px",
                     outline: "none",
                     boxSizing: "border-box",
                   }}
                 />
                 {centenaResults.length > 0 && (
                   <div style={{ marginTop: "12px", fontSize: "0.85rem", color: "#ffffff" }}>
                     <div style={{ fontFamily: bebas, letterSpacing: "2px", marginBottom: "6px" }}>
                       RESULTADOS ({centenaResults.length}):
                     </div>
                     {centenaResults.map((r, i) => (
                       <div key={i} style={{ padding: "4px 0", borderBottom: `1px solid ${bdr}33` }}>
                         {r.date} — {r.horario}
                       </div>
                     ))}
                   </div>
                 )}
                 {centenaSearch.trim().length === 3 && centenaResults.length === 0 && (
                   <div style={{ marginTop: "12px", fontSize: "0.85rem", color: "#ff6666", fontFamily: bebas }}>
                     NENHUM RESULTADO ENCONTRADO
                   </div>
                 )}
               </div>

               {/* BUSCA DE MILHAR */}
               <div
                 style={{
                   background: panel,
                   border: `1px solid ${bdr}`,
                   borderRadius: "10px",
                   padding: "16px",
                   marginTop: "18px",
                 }}
               >
                 <div
                   style={{
                     fontFamily: bebas,
                     letterSpacing: "3px",
                     color: "#ffffff",
                     marginBottom: "10px",
                     fontSize: "1.1rem",
                     textAlign: "center",
                   }}
                 >
                   BUSCAR MILHAR
                 </div>
                 <input
                   type="text"
                   placeholder="Digite a milhar..."
                   maxLength={4}
                   value={milharSearch}
                   onChange={e => setMilharSearch(e.target.value)}
                   style={{
                     width: "100%",
                     background: "transparent",
                     border: `1px solid ${bdr}`,
                     color: "#ffffff",
                     borderRadius: "4px",
                     padding: "8px 12px",
                     fontFamily: bebas,
                     fontSize: "1rem",
                     letterSpacing: "2px",
                     outline: "none",
                     boxSizing: "border-box",
                   }}
                 />
                 {milharResults.length > 0 && (
                   <div style={{ marginTop: "12px", fontSize: "0.85rem", color: "#ffffff" }}>
                     <div style={{ fontFamily: bebas, letterSpacing: "2px", marginBottom: "6px" }}>
                       RESULTADOS ({milharResults.length}):
                     </div>
                     {milharResults.map((r, i) => (
                       <div key={i} style={{ padding: "4px 0", borderBottom: `1px solid ${bdr}33` }}>
                         {r.date} — {r.horario}
                       </div>
                     ))}
                   </div>
                 )}
                 {milharSearch.trim().length === 4 && milharResults.length === 0 && (
                   <div style={{ marginTop: "12px", fontSize: "0.85rem", color: "#ff6666", fontFamily: bebas }}>
                     NENHUM RESULTADO ENCONTRADO
                   </div>
                 )}
               </div>

               </>
            );
          })()}

         </>
       )}

      {/* ── GLOBAL VIEW ── */}
      {tab === "geral" && (
        <>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              fontSize: "0.72rem",
              color: dim,
              letterSpacing: "1px",
              marginBottom: "18px",
            }}
          >
            {[
              ["DIAS", days.length],
              ["EXTRAÇÕES", days.reduce((a, d) => a + d.draws.length, 0)],
              ["MILHARES", allMilhares.length],
              ["DÍGITOS", globalTotal],
              [
                "MAIS FREQ.",
                globalSorted[0]
                  ? `${globalSorted[0].d} (${globalSorted[0].c}x)`
                  : "-",
              ],
            ].map(([k, v]) => (
              <div key={k}>
                {k} <span style={{ color: text }}>{v}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              background: panel,
              border: `1px solid ${bdr}`,
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                fontFamily: bebas,
                letterSpacing: "3px",
                color: "#ffffff",
                marginBottom: "4px",
                fontSize: "0.9rem",
                textAlign: "center",
              }}
            >
              GRUPOS - RANKING GERAL ACUMULADO (ANIMAIS)
            </div>
            <AnimalGroupsGrid
              counts={globalGrupoCounts}
              maxCount={maxGlobalGrupoCount}
              minCount={minGlobalGrupoCount}
              halfCount={halfGlobalGrupoCount}
              bdr={bdr}
              dim={dim}
              green={green}
              red={red}
              orange={orange}
              yellow={yellow}
              bebas={bebas}
              mono={mono}
            />
          </div>

          <div
            style={{
              background: panel,
              border: `1px solid ${bdr}`,
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                fontFamily: bebas,
                letterSpacing: "3px",
                color: "#ffffff",
                marginBottom: "12px",
                fontSize: "0.9rem",
                textAlign: "center",
              }}
            >
              FREQUÊNCIA GERAL ACUMULADA
            </div>
            <FreqBars
              sorted={globalSorted}
              total={globalTotal}
              maxVal={globalMax}
              bebas={bebas}
              yellow={yellow}
              dim={dim}
              bdr={bdr}
            />
          </div>

          {top20Milhares.length > 0 && (
            <div
              style={{
                background: panel,
                border: `1px solid ${bdr}`,
                borderRadius: "10px",
                padding: "16px",
                marginTop: "18px",
              }}
            >
              <div
                style={{
                  fontFamily: bebas,
                  letterSpacing: "3px",
                  color: "#ffffff",
                  marginBottom: "4px",
                  fontSize: "0.9rem",
                  textAlign: "center",
                }}
              >
                TOP 12 MILHARES
              </div>
              {top20Milhares.map(({ m, count }, i) => {
                const cor = faixaCor(m);
                return (
                  <div
                    key={m}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: bebas,
                        fontSize: "1rem",
                        color: i === 0 ? "#000" : cor,
                        background: i === 0 ? cor : "transparent",
                        width: "46px",
                        textAlign: "center",
                        borderRadius: "3px",
                        padding: i === 0 ? "1px 0" : "0",
                      }}
                    >
                      {m}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        background: bdr,
                        borderRadius: "4px",
                        height: "18px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${((count / maxMilhar) * 100).toFixed(1)}%`,
                          background: cor,
                          opacity: i === 0 ? 1 : 0.7,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: cor,
                        width: "24px",
                        textAlign: "right",
                      }}
                    >
                      {count}x
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {top50Centenas.length > 0 && (
            <div
              style={{
                background: panel,
                border: `1px solid ${bdr}`,
                borderRadius: "10px",
                padding: "16px",
                marginTop: "18px",
              }}
            >
              <div
                style={{
                  fontFamily: bebas,
                  letterSpacing: "3px",
                  color: "#ffffff",
                  marginBottom: "4px",
                  fontSize: "0.9rem",
                  textAlign: "center",
                }}
              >
                TOP 12 CENTENAS
              </div>
              {top50Centenas.map(({ c, count }, i) => {
                const cor = faixaCor("0" + c);
                return (
                  <div
                    key={c}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: bebas,
                        fontSize: "1rem",
                        color: i === 0 ? "#000" : cor,
                        background: i === 0 ? cor : "transparent",
                        width: "36px",
                        textAlign: "center",
                        borderRadius: "3px",
                        padding: i === 0 ? "1px 0" : "0",
                      }}
                    >
                      {c}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        background: bdr,
                        borderRadius: "4px",
                        height: "18px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${((count / maxCentena) * 100).toFixed(1)}%`,
                          background: cor,
                          opacity: i === 0 ? 1 : 0.7,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: cor,
                        width: "24px",
                        textAlign: "right",
                      }}
                    >
                      {count}x
                    </div>
                  </div>
                );
              })}
            </div>
            )}
        </>
      )}

      {/* ── PALPITES VIEW ── */}
      {tab === "palpites" && (
        <>
          <h2 style={{ fontFamily: bebas, letterSpacing: "3px", marginBottom: "18px" }}>
            PALPITES - REPETIÇÃO SEQUENCIAL
          </h2>
          {(() => {
            // Ordenar dias cronologicamente
            const sortedDays = [...days].sort((a, b) => {
              const [da, ma, ya] = a.date.split("/").map(Number);
              const [db, mb, yb] = b.date.split("/").map(Number);
              return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
            });

            const toDate = (s: string) => {
              const [d, m, y] = s.split("/").map(Number);
              return new Date(y, m - 1, d);
            };
            const fmtDate = (dt: Date) =>
              `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
            const diffDays = (a: string, b: string) =>
              (toDate(b).getTime() - toDate(a).getTime()) / (1000 * 60 * 60 * 24);

            // Agrupar dezenas por dia (qualquer horário)
            const dezenaPorDia: Record<string, Record<string, string[]>> = {};

            for (const day of sortedDays) {
              for (const draw of day.draws) {
                for (const milhar of draw.milhares) {
                  const dezena = milhar.slice(-2);
                  if (!dezenaPorDia[dezena]) dezenaPorDia[dezena] = {};
                  if (!dezenaPorDia[dezena][day.date]) dezenaPorDia[dezena][day.date] = [];
                  if (!dezenaPorDia[dezena][day.date].includes(draw.label)) {
                    dezenaPorDia[dezena][day.date].push(draw.label);
                  }
                }
              }
            }

            // Última data inserida no sistema
            const ultimoDia = sortedDays.length > 0 ? sortedDays[sortedDays.length - 1].date : "";

            // Gerar lista dos últimos 4 dias
            const ultimos4Dias: string[] = [];
            if (ultimoDia) {
              const ref = toDate(ultimoDia);
              for (let j = 3; j >= 0; j--) {
                const d = new Date(ref);
                d.setDate(d.getDate() - j);
                ultimos4Dias.push(fmtDate(d));
              }
            }

            // Dezenas que apareceram em TODOS os 4 dias
            const firmesGreen = ultimoDia
              ? Object.entries(dezenaPorDia)
                  .filter(([_, dias]) => ultimos4Dias.every(d => dias[d]))
                  .map(([dezena, dias]) => ({
                    dezena,
                    datas: ultimos4Dias.map(d => ({ date: d, horarios: dias[d] })),
                  }))
              : [];

            // Dezenas que apareceram em 3 dos 4 dias (falhou 1)
            const firmesOrange = ultimoDia
              ? Object.entries(dezenaPorDia)
                  .filter(([_, dias]) => {
                    const presentes = ultimos4Dias.filter(d => dias[d]).length;
                    return presentes === 3;
                  })
                  .map(([dezena, dias]) => ({
                    dezena,
                    datas: ultimos4Dias.map(d => ({ date: d, horarios: dias[d] || [] })),
                  }))
              : [];

            // Detectar repetições em 2 dias consecutivos (previsão)
            const palpiteList: { dezena: string; horario: string; datas: string[]; nextDate: string }[] = [];

            for (const day of sortedDays) {
              for (const draw of day.draws) {
                for (const milhar of draw.milhares) {
                  const dezena = milhar.slice(-2);
                  const dias = dezenaPorDia[dezena];
                  if (!dias) continue;
                  const datas = Object.keys(dias).sort((a, b) => diffDays(a, b) > 0 ? -1 : 1);
                  if (datas.length < 2) continue;

                  const idx = datas.indexOf(day.date);
                  if (idx < 1) continue;

                  const d1 = datas[idx - 1];
                  const d2 = datas[idx];

                  if (diffDays(d1, d2) === 1) {
                    const next = new Date(toDate(d2));
                    next.setDate(next.getDate() + 1);
                    const nd = fmtDate(next);

                    if (!datas.includes(nd)) {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (next >= today) {
                        palpiteList.push({ dezena, horario: draw.label, datas: [d1, d2], nextDate: nd });
                      }
                    }
                  }
                }
              }
            }

            // ── Score de Confiança ──
            const allM = sortedDays.flatMap(d => d.draws.flatMap(dr => dr.milhares));
            const gCounts = Array(25).fill(0);
            allM.forEach(m => { const g = parseInt(m.slice(-2), 10) === 0 ? 25 : Math.ceil(parseInt(m.slice(-2), 10) / 4); gCounts[g - 1]++; });
            const sortedGC = [...gCounts].sort((a, b) => b - a);
            const top3Val = sortedGC[2] || 0;
            const top5Val = sortedGC[4] || 0;

            const calcScore = (dzn: string) => {
              const dias = dezenaPorDia[dzn];
              if (!dias) return { score: 0, color: red, pct: 0 };
              const dates = Object.keys(dias).sort((a, b) => diffDays(a, b) > 0 ? 1 : -1);
              if (dates.length === 0) return { score: 0, color: red, pct: 0 };

              let streak = 1, maxStreak = 1;
              for (let i = 1; i < dates.length; i++) {
                if (diffDays(dates[i-1], dates[i]) === 1) { streak++; maxStreak = Math.max(maxStreak, streak); }
                else streak = 1;
              }
              const streakPct = maxStreak >= 4 ? 95 : maxStreak === 3 ? 85 : maxStreak === 2 ? 70 : 0;
              const s1 = (streakPct / 100) * 35;

              const refD = toDate(ultimoDia);
              let recent = 0;
              for (let i = 0; i < 7; i++) { const d = new Date(refD); d.setDate(d.getDate() - i); if (dias[fmtDate(d)]) recent++; }
              const s2 = (recent / 7) * 20;

              const lastDate = dates[dates.length - 1];
              const daysSince = diffDays(lastDate, ultimoDia);
              const atrasoPct = daysSince <= 1 ? 30 : daysSince === 2 ? 80 : daysSince === 3 ? 100 : daysSince === 4 ? 90 : daysSince <= 7 ? 60 : 20;
              const s3 = (atrasoPct / 100) * 15;

              const allH = Object.values(dias).flat();
              const uniqueH = new Set(allH).size;
              const hPct = uniqueH === 1 ? 100 : uniqueH === 2 ? 60 : 20;
              const s4 = (hPct / 100) * 15;

              const gGreen = firmesGreen.some(f => f.dezena === dzn);
              const gOrange = firmesOrange.some(f => f.dezena === dzn);
              const s5 = gGreen ? 10 : gOrange ? 5 : 0;

              const dzNum = parseInt(dzn, 10);
              const gId = dzNum === 0 ? 25 : Math.ceil(dzNum / 4);
              const gc = gCounts[gId - 1];
              const gPct = gc >= top3Val ? 100 : gc >= top5Val ? 60 : 20;
              const s6 = (gPct / 100) * 5;

              const total = Math.round(s1 + s2 + s3 + s4 + s5 + s6);
              return { score: total, color: total >= 70 ? green : total >= 40 ? orange : red, pct: total };
            };

            // Agrupar por horário
            const grouped: Record<string, typeof palpiteList> = {};
            for (const p of palpiteList) {
              if (!grouped[p.horario]) grouped[p.horario] = [];
              grouped[p.horario].push(p);
            }

            const horarios = ["02HS", "08HS", "10HS", "12HS", "15HS", "17HS", "21HS", "23HS"];

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* ── DEZENAS FIRMES 4/4 ── */}
                {firmesGreen.length > 0 && (
                  <div style={{ background: panel, border: `1px solid ${green}`, borderRadius: "10px", padding: "16px" }}>
                    <div style={{ fontFamily: bebas, fontSize: "1.2rem", letterSpacing: "2px", color: green, marginBottom: "14px", textAlign: "center" }}>
                      🔥 DEZENAS FIRMES (4/4)
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
                      {firmesGreen.map((s, i) => {
                        const sc = calcScore(s.dezena);
                        const dezenaNum = parseInt(s.dezena, 10);
                        const grupoId = dezenaNum === 0 ? 25 : Math.ceil(dezenaNum / 4);
                        const animal = ANIMAIS[grupoId - 1];
                        return (
                          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                            <div style={{
                              width: "68px",
                              height: "68px",
                              borderRadius: "50%",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "transparent",
                              border: `2px solid ${green}`,
                            }}>
                              <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>{animal?.emoji}</span>
                              <span style={{ fontFamily: bebas, fontSize: "1rem", color: "#fff", letterSpacing: "1px", lineHeight: 1 }}>{s.dezena}</span>
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#fff", textAlign: "center", whiteSpace: "nowrap" }}>
                              {s.datas.map(d => d.date.split("/")[0]).join(" ")}
                            </div>
                            <div style={{ fontSize: "0.65rem", color: "#ffffffcc", textAlign: "center", whiteSpace: "nowrap" }}>
                              {s.datas.map(d => d.horarios.join(" ")).join(" ")}
                            </div>
                            <div style={{ width: "60px", height: "4px", background: "#2a2a3e", borderRadius: "2px", overflow: "hidden" }}>
                              <div style={{ width: `${sc.pct}%`, height: "100%", background: sc.color, borderRadius: "2px" }} />
                            </div>
                            <div style={{ fontSize: "0.6rem", color: sc.color, fontFamily: bebas, letterSpacing: "1px", lineHeight: 1 }}>
                              {sc.score}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── DEZENAS FIRMES 3/4 ── */}
                {firmesOrange.length > 0 && (
                  <div style={{ background: panel, border: `1px solid ${orange}`, borderRadius: "10px", padding: "16px" }}>
                    <div style={{ fontFamily: bebas, fontSize: "1.2rem", letterSpacing: "2px", color: orange, marginBottom: "14px", textAlign: "center" }}>
                      🔥 DEZENAS FIRMES (3/4)
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
                      {firmesOrange.map((s, i) => {
                        const sc = calcScore(s.dezena);
                        const dezenaNum = parseInt(s.dezena, 10);
                        const grupoId = dezenaNum === 0 ? 25 : Math.ceil(dezenaNum / 4);
                        const animal = ANIMAIS[grupoId - 1];
                        const diaFaltou = s.datas.find(d => d.horarios.length === 0);
                        return (
                          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                            <div style={{
                              width: "68px",
                              height: "68px",
                              borderRadius: "50%",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "transparent",
                              border: `2px solid ${orange}`,
                            }}>
                              <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>{animal?.emoji}</span>
                              <span style={{ fontFamily: bebas, fontSize: "1rem", color: "#fff", letterSpacing: "1px", lineHeight: 1 }}>{s.dezena}</span>
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#fff", textAlign: "center", whiteSpace: "nowrap" }}>
                              {s.datas.map(d => d.date.split("/")[0]).join(" ")}
                            </div>
                            <div style={{ fontSize: "0.65rem", color: "#ffffffcc", textAlign: "center", whiteSpace: "nowrap" }}>
                              {s.datas.map(d => d.horarios.join(" ")).join(" ")}
                            </div>
                            {diaFaltou && (
                              <div style={{ fontSize: "0.6rem", color: orange, textAlign: "center" }}>
                                Faltou: {diaFaltou.date}
                              </div>
                            )}
                            <div style={{ width: "60px", height: "4px", background: "#2a2a3e", borderRadius: "2px", overflow: "hidden" }}>
                              <div style={{ width: `${sc.pct}%`, height: "100%", background: sc.color, borderRadius: "2px" }} />
                            </div>
                            <div style={{ fontSize: "0.6rem", color: sc.color, fontFamily: bebas, letterSpacing: "1px", lineHeight: 1 }}>
                              {sc.score}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── PREVISÕES (2 DIAS) ── */}
                <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: "10px", padding: "16px" }}>
                  <div style={{ fontFamily: bebas, fontSize: "1.2rem", letterSpacing: "2px", color: orange, marginBottom: "14px", textAlign: "center" }}>
                    📊 PREVISÕES (REPETIÇÃO EM 2 DIAS)
                  </div>
                  {horarios.map((h) => {
                    const items = grouped[h] || [];
                    return (
                      <div key={h} style={{ marginBottom: "12px" }}>
                        <div style={{ fontFamily: bebas, fontSize: "1rem", letterSpacing: "2px", color: yellow, marginBottom: "8px" }}>
                          {h} ({items.length})
                        </div>
                        {items.length === 0 ? (
                          <div style={{ color: dim, fontSize: "0.8rem", marginBottom: "10px" }}>Nenhuma repetição detectada</div>
                        ) : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {[...items].sort((a, b) => calcScore(b.dezena).score - calcScore(a.dezena).score).map((p, i) => {
                              const sc = calcScore(p.dezena);
                              const dezenaNum = parseInt(p.dezena, 10);
                              const grupoId = dezenaNum === 0 ? 25 : Math.ceil(dezenaNum / 4);
                              const animal = ANIMAIS[grupoId - 1];
                              return (
                                <div key={i} style={{ background: "#1a1a2e", border: `1px solid ${sc.color}`, borderRadius: "8px", padding: "10px 14px", textAlign: "center" }}>
                                  <div style={{ fontFamily: bebas, fontSize: "1.4rem", color: "#fff", letterSpacing: "2px" }}>
                                    {animal?.emoji} {p.dezena}
                                  </div>
                                  <div style={{ width: "100%", height: "5px", background: "#2a2a3e", borderRadius: "3px", marginTop: "6px", overflow: "hidden" }}>
                                    <div style={{ width: `${sc.pct}%`, height: "100%", background: sc.color, borderRadius: "3px" }} />
                                  </div>
                                  <div style={{ fontSize: "0.65rem", color: sc.color, marginTop: "2px", fontFamily: bebas, letterSpacing: "1px" }}>
                                    {sc.score}% Confiança
                                  </div>
                                  <div style={{ fontSize: "0.7rem", color: "#fff", marginTop: "4px" }}>
                                    {p.datas.join(" → ")}
                                  </div>
                                  <div style={{ fontSize: "0.75rem", color: orange, marginTop: "4px" }}>
                                    Próximo: {p.nextDate}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* ── GAME VIEW ── */}
      {tab === "game" && <Game days={days} />}
    </div>
  );
}


