import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { scrapeToMarkdown } from "./tools/scraper";

// Konfiguracja
dotenv.config();
const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CLIENT_URL = "https://seedpaper.pl"; // Twój cel
const CONTEXT_FILE = path.join(__dirname, "../inputs/context.txt");

// --- HELPERY ---

// Funkcja czyszcząca Markdown pod AI (oszczędność tokenów)
function cleanMarkdownForAI(markdown: string): string {
  return markdown
    .replace(/!\[.*?\]\(.*?\)/g, "") // Usuwa obrazki ![alt](url)
    .replace(/\[.*?\]\(.*?\)/g, (match) => {
      // Opcjonalnie: Możemy usuwać linki, ale czasem są przydatne.
      // Na razie zostawmy sam tekst linku, usuwając URL, żeby AI skupiło się na treści.
      return match; // Zostawiamy linki, bo mogą prowadzić do podstron oferty
    })
    .replace(/\n\s*\n/g, "\n") // Usuwa puste linie
    .substring(0, 35000); // TWARDY LIMIT: 35k znaków (ok. 6-8k tokenów). Bezpiecznie dla gpt-4o-mini.
}

// Główny Prompt Systemowy (Definiuje strukturę JSON)
const MASTER_PROMPT = `
Jesteś Strategicznym Architektem Marketingu
Twoim zadaniem jest przeanalizowanie treści strony klienta i kontekstu biznesowego, a następnie wygenerowanie kompleksowej strategii.

Musisz zwrócić wynik w formacie czystego JSON (bez bloków code \`\`\`json).
Oczekiwana struktura JSON:
{
  "audit": {
    "summary": "Krótka diagnoza stanu obecnego",
    "swot": {
      "strengths": ["..."],
      "weaknesses": ["..."],
      "opportunities": ["..."],
      "threats": ["..."]
    },
    "sentiment": "Wydźwięk opinii (jeśli znaleziono) lub 'Brak danych'",
    "gapAnalysis": "Czego brakuje na stronie względem standardów rynkowych"
  },
  "strategy": {
    "uvp": "Unique Value Proposition - jedno zdanie",
    "rtb": "Reasons to Believe - 3 punkty",
    "brandArchetype": "Archetyp marki (np. Opiekun, Twórca)",
    "personas": [
      {
        "name": "Nazwa profilu",
        "painPoints": ["Ból 1", "Ból 2"],
        "goals": ["Cel 1"],
        "languageStyle": "Jak do nich mówić"
      }
    ]
  },
  "roadmap": {
    "contentPillars": ["Temat 1", "Temat 2", "Temat 3"],
    "keywords": ["słowo1", "słowo2", "słowo3 (long tail)"],
    "negativeKeywords": ["słowo1", "słowo2", "Przemyśl dokładnie, jakie hasła będą tylko marnować budżet reklamowy"],
    "kpi": {
      "primary": "Główny cel",
      "metrics": ["Metryka 1", "Metryka 2"]
    },
    "channels": ["Kanał 1", "Kanał 2"]
  }
}
`;

async function runOrchestrator() {
  console.log("🚀 SYSTEM START: Orchestrator v2 (Prisma + AI)");

  // 1. Pobierz lub utwórz projekt w bazie
  // Używamy upsert, żeby nie wywaliło błędu jak projekt już istnieje
  // Ale uwaga: przy 'create' musimy mieć dane, więc najpierw sprawdźmy czy jest

  let project = await prisma.project.findUnique({
    where: { domain: CLIENT_URL },
  });

  let rawContent = project?.rawContent || "";

  // 2. Jeśli nie ma treści w bazie -> SCRAPING
  if (!project || !project.rawContent) {
    console.log("🕷️ Brak danych w bazie. Uruchamiam Scrapera...");
    rawContent = await scrapeToMarkdown(CLIENT_URL);

    // Pobierz kontekst usera (jeśli istnieje)
    let userContext = "";
    if (fs.existsSync(CONTEXT_FILE)) {
      userContext = fs.readFileSync(CONTEXT_FILE, "utf-8");
      console.log("📝 Wczytano kontekst użytkownika.");
    }

    // Zapisz/Zaktualizuj w bazie
    project = await prisma.project.upsert({
      where: { domain: CLIENT_URL },
      update: { rawContent, userContext }, // Jeśli jest, a pusty content -> update
      create: {
        domain: CLIENT_URL,
        rawContent,
        userContext,
      },
    });
    console.log("💾 Surowe dane zapisane w bazie SQLite.");
  } else {
    console.log("⚡ Dane pobrane z cache bazy danych (pominięto scraping).");
  }

  // 3. Przygotowanie wsadu dla AI
  console.log("🧹 Czyszczenie danych i przygotowanie prompta...");
  const cleanContent = cleanMarkdownForAI(rawContent);
  const context = project.userContext || "Brak";

  // 4. Call do OpenAI (Jeden duży strzał po JSON)
  console.log(
    "🧠 Analiza AI w toku (Generowanie Audytu, Strategii i Roadmapy)..."
  );

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini", // Szybki i tani, idealny do JSONowania danych
      response_format: { type: "json_object" }, // Wymusza poprawny JSON
      messages: [
        { role: "system", content: MASTER_PROMPT },
        {
          role: "user",
          content: `
            CONTEXT (Info od właściciela): 
            ${context}

            WEBSITE CONTENT (Markdown): 
            ${cleanContent}
          `,
        },
      ],
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    // 5. Zapis wyników do bazy
    console.log(
      "📥 Otrzymano JSON od AI. Zapisuję do poszczególnych modułów..."
    );

    await prisma.project.update({
      where: { id: project.id },
      data: {
        // Zapisujemy jako Stringi (JSON.stringify), bo tak mamy w schemacie
        auditData: JSON.stringify(result.audit),
        strategyData: JSON.stringify(result.strategy),
        roadmapData: JSON.stringify(result.roadmap),
      },
    });

    console.log("✅ SUKCES! Wszystkie moduły zaktualizowane.");
    console.log("------------------------------------------------");
    console.log("🔍 Podgląd Strategii (UVP):", result.strategy.uvp);
    console.log("🔍 Podgląd Person:", result.strategy.personas.length);
    console.log(
      "🔍 Podgląd Słów Kluczowych:",
      result.roadmap.keywords.slice(0, 3)
    );
  } catch (error) {
    console.error("❌ Błąd krytyczny AI:", error);
  }
}

runOrchestrator();
