import { chromium } from "playwright";
import * as fs from "fs";

// Konfiguracja
const START_URL = "https://seedpaper.pl";
const MAX_PAGES = 15; // Limit stron, żeby nie czekać wieki na start
const OUTPUT_FILE = "site-data.json";

interface PageData {
  url: string;
  title: string;
  content: string;
}

async function runCrawler() {
  console.log(`🚀 Startujemy crawlera na: ${START_URL}`);

  const browser = await chromium.launch({ headless: false }); // Widzisz co się dzieje
  const context = await browser.newContext();
  const page = await context.newPage();

  // Zbiory do zarządzania kolejką
  const visitedUrls = new Set<string>();
  const urlsToVisit: string[] = [START_URL];
  const results: PageData[] = [];

  try {
    while (urlsToVisit.length > 0 && visitedUrls.size < MAX_PAGES) {
      // Pobieramy pierwszy link z kolejki
      const currentUrl = urlsToVisit.shift();

      // Jeśli URL jest pusty lub już odwiedzony -> pomiń
      if (!currentUrl || visitedUrls.has(currentUrl)) continue;

      console.log(
        `\n🕷️ Crawling (${visitedUrls.size + 1}/${MAX_PAGES}): ${currentUrl}`
      );

      try {
        await page.goto(currentUrl, {
          waitUntil: "networkidle",
          timeout: 10000,
        });

        // Czekamy chwilę dla pewności
        await page.waitForTimeout(1000);

        // 1. Pobieramy dane
        const title = await page.title();
        const content = await page.evaluate(() => {
          // Pobieramy sam tekst, czyścimy entery i tabulatory
          return document.body.innerText.replace(/\s+/g, " ").trim();
        });

        // Dodajemy do wyników
        results.push({ url: currentUrl, title, content });
        visitedUrls.add(currentUrl);

        // 2. Szukamy nowych linków na tej podstronie
        const links = await page.evaluate((baseUrl) => {
          // Pobieramy wszystkie elementy <a>
          const anchors = Array.from(document.querySelectorAll("a"));
          console.log(anchors.map((a) => a.href));
          return anchors
            .map((a) => (a.href.endsWith("/") ? a.href.slice(0, -1) : a.href)) // Wyciągamy href
            .filter((href) => href.startsWith(baseUrl)) // Tylko ta sama domena!
            .filter((href) => !href.includes("#")) // Bez kotwic
            .filter((href) => !href.match(/\.(pdf|jpg|png|zip)$/i)); // Bez plików
        }, START_URL);

        // Dodajemy unikalne nowe linki do kolejki
        for (const link of links) {
          if (!visitedUrls.has(link) && !urlsToVisit.includes(link)) {
            urlsToVisit.push(link);
          }
        }
      } catch (e) {
        console.error(`⚠️ Błąd na stronie ${currentUrl}:`, e);
      }
    }

    // KONIEC: Zapisujemy wyniki
    console.log(
      `\n💾 Zapisuję ${results.length} podstron do pliku ${OUTPUT_FILE}...`
    );
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    console.log("✅ Gotowe! Sprawdź plik site-data.json");
  } finally {
    await browser.close();
  }
}

runCrawler();
