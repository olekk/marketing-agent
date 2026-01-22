import { chromium, Page } from 'playwright';

// Helper do czekania
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function debugScraperStepByStep(url: string) {
  console.log(`\n🕵️ DEBUG: Rozpoczynam wizualną analizę dla: ${url}`);
  
  // 1. Odpalamy przeglądarkę w trybie WIDOCZNYM
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 768 }
  });
  const page = await context.newPage();

  try {
    // --- KROK 1: ŁADOWANIE ---
    console.log(`\n1️⃣  Ładowanie strony...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log(`✅ Strona załadowana.`);
    await sleep(2000);

    // --- KROK 2: CIASTECZKA (Klikanie) ---
    console.log(`\n2️⃣  Szukam przycisku Cookies (Próba kliknięcia)...`);
    await handleCookieConsent(page);
    console.log(`⏳ Czekam 3 sekundy na przeładowanie po kliknięciu...`);
    await sleep(5000);

    // --- KROK 3: CZYSZCZENIE ETAPAMI ---
    
    // Etap A: Techniczne śmieci
    await visualizeAndRemove(page, 'script, style, svg, noscript, iframe', 'A. Techniczne (script, style, iframe)');

    // Etap B: Nawigacja i Stopka
    await visualizeAndRemove(page, 'nav, footer', 'B. Layout (nav, footer)');

    // Etap C: Reklamy i Sidebar
    await visualizeAndRemove(page, '.ads, #sidebar', 'C. Reklamy (.ads, #sidebar)');

    // Etap D: Banery Cookie (Tutaj uważaj!)
    // To są te selektory, które podejrzewam o zabijanie strony
    const cookieSelectors = '[id*="cookie"], [class*="cookie"], [id*="consent"], [class*="consent"], #onetrust-banner-sdk';
    await visualizeAndRemove(page, cookieSelectors, 'D. Kontenery Cookie (RYZYKOWNE!)');

    // --- KROK 4: PARSING ---
    console.log(`\n4️⃣  Próba wyciągnięcia tekstu z tego co zostało...`);
    const textLength = await page.evaluate(() => document.body.innerText.length);
    
    if (textLength < 200) {
        console.error(`❌ ALARM: Na stronie zostało tylko ${textLength} znaków tekstu! Coś usunęliśmy za dużo.`);
    } else {
        console.log(`✅ Sukces? Widzę ${textLength} znaków tekstu.`);
    }

  } catch (error) {
    console.error("❌ BŁĄD:", error);
  } finally {
    console.log(`\n🏁 Koniec. Zamykam przeglądarkę za 10 sekund.`);
    await sleep(10000);
    await browser.close();
  }
}

// --- HELPER: POKAZUJE NA CZERWONO I USUWA ---
async function visualizeAndRemove(page: Page, selector: string, stepName: string) {
    console.log(`\n🧹 CZYSZCZENIE: ${stepName}`);
    
    // 1. Zaznacz na czerwono
    const count = await page.evaluate((sel) => {
        const els = document.querySelectorAll(sel);
        els.forEach((el) => {
            (el as HTMLElement).style.border = '5px solid red';
            (el as HTMLElement).style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
        });
        return els.length;
    }, selector);

    if (count > 0) {
        console.log(`   Found ${count} elements. Marking red... (Look at browser!)`);
        await sleep(6000); // Czas dla Ciebie na popatrzenie

        // 2. Usuń
        await page.evaluate((sel) => {
            const els = document.querySelectorAll(sel);
            els.forEach((el) => el.remove());
        }, selector);
        console.log(`   🗑️ Usunięto.`);
    } else {
        console.log(`   (Brak elementów do usunięcia)`);
    }
}

// --- TWOJA FUNKCJA OD COOKIES ---
async function handleCookieConsent(page: Page) {
    const commonSelectors = [
        '#onetrust-accept-btn-handler',
        '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
        '.cc-btn.cc-allow',
        '[data-testid="cookie-policy-dialog-accept-button"]'
    ];
    // Próba po ID
    for (const selector of commonSelectors) {
        if (await page.locator(selector).first().isVisible()) {
            await page.locator(selector).first().click();
            console.log(`   🍪 Kliknięto ID: ${selector}`);
            return;
        }
    }
    // Próba po tekście
    const keywords = ["Zgadzam się", "Zaakceptuj", "Akceptuj", "Zgoda", "Accept All"];
    for (const word of keywords) {
        try {
            const el = page.getByRole('button', { name: word }).first();
            if (await el.isVisible()) {
                await el.click({ force: true });
                console.log(`   🍪 Kliknięto tekst: "${word}"`);
                return;
            }
        } catch(e) {}
    }
}

// URUCHOM
debugScraperStepByStep("https://hilti.pl");