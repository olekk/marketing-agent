import fs from 'fs'
import OpenAI from 'openai'
import dotenv from 'dotenv'

// Ładujemy zmienne z pliku .env
dotenv.config()

const INPUT_FILE = 'site-data.json'
const OUTPUT_FILE = 'RAPORT_MARKETINGOWY.md'

// Konfiguracja OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function generateAudit() {
  console.log('🚀 Uruchamiam Agenta Marketingowego AI...')

  // 1. Wczytujemy dane ze scrapingu
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Nie znaleziono pliku ${INPUT_FILE}. Najpierw uruchom scraper!`)
    return
  }

  const rawData = fs.readFileSync(INPUT_FILE, 'utf-8')
  const pages = JSON.parse(rawData)

  console.log(`\n📊 Wczytano ${pages.length} podstron. Przygotowuję kontekst...`)

  // 2. Przygotowujemy "wsad" dla AI
  // Łączymy treści z podstron w jeden ciąg, ale ucinamy zbyt długie teksty, żeby nie spalić milionów tokenów
  let contextData = pages
    .map((p: any, index: number) => {
      return `
    ---
    STRONA #${index + 1}: ${p.title}
    URL: ${p.url}
    TREŚĆ: ${p.content.substring(0, 8000)} ... [ucięto resztę]
    ---
    `
    })
    .join('\n')

  // Limit bezpieczeństwa (np. 50k znaków), żeby nie przekroczyć limitu modelu
  if (contextData.length > 50000) {
    console.log('⚠️ Kontekst zbyt długi, przycinam do 50k znaków...')
    contextData = contextData.substring(0, 50000)
  }
  // wklejenie dodatkowych informacji jakie się wie o kliencie - np. poprzez pole tekstowe lub stt
  // Podać przyklad:
  const additionalData =
    'firma zatrudnia 3 ludzi, pracują przy produkcji papieru w małych kontenerach przy domu właściciela; Zazwyczaj dostają od 1 do 4 zapytań na maila dziennie; właściciel planuje zwiekszyc wydatki na promocje online;'
  // 3. Wysyłamy zapytanie do AI
  console.log('🧠 Analizuję dane (to może potrwać kilkanaście sekund)...')

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Tani i szybki model, idealny do analizy tekstu
      messages: [
        {
          role: 'system',
          content: `Jesteś ekspertem marketingu internetowego (SEM/SEO) z 10-letnim doświadczeniem. 
          Twoim zadaniem jest stworzenie profesjonalnego audytu dla klienta na podstawie treści jego strony www.
          
          Raport ma być w formacie Markdown, gotowy do druku dla klienta. Używaj nagłówków, punktorów i pogrubień.
          Język: Polski. Styl: Konkretny, biznesowy, bez lania wody.
          
          Struktura raportu:
          1. ANALIZA SWOT (Mocne strony, Słabe strony, Szanse, Zagrożenia - w kontekście oferty i strony).
          2. PERSONY ZAKUPOWE (Zdefiniuj 3 konkretne grupy docelowe: Kim są? Czego szukają? Jakim językiem do nich mówić?).
          3. SŁOWA KLUCZOWE (Google Ads/SEO):
             - 10 fraz ogólnych (wysoki wolumen).
             - 15 fraz "Long Tail" (sprzedażowych, np. "papier czerpany z nasionami cena").
             - 10 słów wykluczających (czego unikać, co może przepalać budżet).
          4. SUGESTIE OPTYMALIZACJI (3 konkretne rzeczy do poprawy na stronie, które zwiększą konwersję).
          5. POMYSŁY NA CONTENT (5 tematów na bloga/social media, które przyciągną ruch).`,
        },
        {
          role: 'user',
          content: `Oto treść strony klienta:\n${contextData}\noraz dodatkowe dane:${additionalData}`,
        },
      ],
    })

    // 4. Zapisujemy wynik
    const reportContent = completion.choices[0].message.content

    if (reportContent) {
      fs.writeFileSync(OUTPUT_FILE, reportContent)
      console.log(`\n✅ SUKCES! Raport zapisano w pliku: ${OUTPUT_FILE}`)
    } else {
      console.error('❌ AI nie zwróciło treści.')
    }
  } catch (error) {
    console.error('❌ Błąd połączenia z OpenAI:', error)
  }
}

generateAudit()
