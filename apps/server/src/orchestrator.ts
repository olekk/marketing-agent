import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { scrapeToMarkdown } from './tools/scraper'
import { resolveProtocol, cleanDomain, cleanMarkdownForAI } from './lib/utils'

// Konfiguracja
dotenv.config()
const prisma = new PrismaClient()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// const CONTEXT_FILE = path.join(__dirname, '../inputs/context.txt')

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
`

export async function runOrchestrator(clientUrl: string) {
  console.log('🚀 SYSTEM START: Orchestrator v2 (Prisma + AI)')
  console.log(`\n📍 URL klienta: ${clientUrl}`)

  // 0. Przygotuj domenę i URL
  const domain = cleanDomain(clientUrl) // Czysta domena do zapisu w bazie
  const normalizedUrl = await resolveProtocol(clientUrl) // Pełny URL do scrapowania
  console.log(`\n🔗 Domena (baza): ${domain}`)
  console.log(`\n🔗 URL (scraping): ${normalizedUrl}`)

  // 1. Pobierz lub utwórz projekt w bazie
  let project = await prisma.project.findUnique({
    where: { domain },
  })

  let rawContent = project?.rawContent || ''

  // 2. Jeśli nie ma treści w bazie -> SCRAPING
  if (!project || !project.rawContent) {
    console.log('🕷️ Brak danych w bazie. Uruchamiam Scrapera...')
    try {
      rawContent = await scrapeToMarkdown(normalizedUrl);
    } catch (error) {
      console.error("⚠️ Błąd krytyczny scrapera:", error);
      // TU JEST ZMIANA: Rzucamy błąd dalej, żeby zatrzymać proces!
      throw new Error("Nie udało się pobrać treści strony. Strona może być zablokowana lub niedostępna.");
    }
    
    // 2. BEZPIECZNIK (Guard Clause)
    if (!rawContent || rawContent.length < 100) {
      console.error("⚠️ Pobrana treść jest zbyt krótka lub pusta.");
      throw new Error("Strona zwróciła pustą treść. Analiza niemożliwa.");
    }

    // Pobierz kontekst usera (jeśli istnieje)
    let userContext = ''
    // if (fs.existsSync(CONTEXT_FILE)) {
    //   userContext = fs.readFileSync(CONTEXT_FILE, 'utf-8')
    //   console.log('📝 Wczytano kontekst użytkownika.')
    // }

    // Zapisz/Zaktualizuj w bazie
    project = await prisma.project.upsert({
      where: { domain },
      update: { rawContent, userContext }, // Jeśli jest, a pusty content -> update
      create: {
        domain,
        rawContent,
        userContext,
      },
    })
    console.log('💾 Surowe dane zapisane w bazie SQLite.')
  } else {
    console.log('⚡ Dane pobrane z cache bazy danych (pominięto scraping).')
  }

  // 3. Przygotowanie wsadu dla AI
  console.log('🧹 Czyszczenie danych i przygotowanie prompta...')
  const cleanContent = cleanMarkdownForAI(rawContent)
  const context = project.userContext || 'Brak'

  // 4. Call do OpenAI (Jeden duży strzał po JSON)
  console.log('🧠 Analiza AI w toku (Generowanie Audytu, Strategii i Roadmapy)...')

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini', // Szybki i tani, idealny do JSONowania danych
      response_format: { type: 'json_object' }, // Wymusza poprawny JSON
      messages: [
        { role: 'system', content: MASTER_PROMPT },
        {
          role: 'user',
          content: `
            CONTEXT (Info od właściciela): 
            ${context}

            WEBSITE CONTENT (Markdown): 
            ${cleanContent}
          `,
        },
      ],
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    // 5. Zapis wyników do bazy
    console.log('📥 Otrzymano JSON od AI. Zapisuję do poszczególnych modułów...')

    await prisma.project.update({
      where: { id: project.id },
      data: {
        // Zapisujemy jako Stringi (JSON.stringify), bo tak mamy w schemacie
        auditData: JSON.stringify(result.audit),
        strategyData: JSON.stringify(result.strategy),
        roadmapData: JSON.stringify(result.roadmap),
      },
    })

    console.log('✅ SUKCES! Wszystkie moduły zaktualizowane.')
    console.log('------------------------------------------------')
    console.log('🔍 Podgląd Strategii (UVP):', result.strategy.uvp)
    console.log('🔍 Podgląd Person:', result.strategy.personas.length)
    console.log('🔍 Podgląd Słów Kluczowych:', result.roadmap.keywords.slice(0, 3))
    
    return { success: true, projectId: project.id, domain }
  } catch (error) {
    console.error('❌ Błąd krytyczny AI:', error)
    throw error
  }
}
