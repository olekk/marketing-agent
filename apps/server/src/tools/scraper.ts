import { chromium, Page } from 'playwright'

export async function scrapeToMarkdown(url: string): Promise<string> {
  console.log(`\n🕷️ Semantic Scraping: ${url}...`)

  const browser = await chromium.launch({ headless: true })
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 768 }
  })
  
  const page = await context.newPage()

  try {
    // 1. Ładowanie
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    
    // 2. Klikanie Cookies (To ważne, żeby odsłonić treść)
    await handleCookieConsent(page);

    // 3. Czekamy na przeładowanie UI (Hilti często przeładowuje treść po kliknięciu)
    await page.waitForTimeout(3000);

    // 4. Pobieranie treści
    const markdown = await page.evaluate(() => {
      
      // --- HELPERY ---
      function isElement(node: Node): node is Element {
        return node.nodeType === Node.ELEMENT_NODE
      }

      function isVisible(node: Node): boolean {
        if (!isElement(node)) return true
        try {
          const style = window.getComputedStyle(node)
          return (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
            style.width !== '0px' &&
            style.height !== '0px'
          )
        } catch (e) {
          return false
        }
      }

      // --- BEZPIECZNE CZYSZCZENIE ---
      // Usunąłem te niebezpieczne selektory *="cookie"
      const garbageSelectors = [
        'script', 'style', 'svg', 'noscript', 'iframe', 
        'nav', 'footer', 
        '.ads', '#sidebar', 
        '[aria-hidden="true"]',
        // Tylko konkretne ID banerów (bezpieczne)
        '#onetrust-banner-sdk', 
        '#onetrust-consent-sdk',
        '.cc-banner',
        '#CybotCookiebotDialog'
      ];
      
      document.querySelectorAll(garbageSelectors.join(',')).forEach((el) => {
          // Dodatkowe zabezpieczenie: NIGDY nie usuwaj body ani html
          if (el.tagName !== 'BODY' && el.tagName !== 'HTML') {
              el.remove();
          }
      })

      const title = document.title
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || ''

      // --- PARSER ---
      function outputMarkdown(node: Node | null): string {
        if (!node) return ''
        if (node.nodeType === Node.TEXT_NODE) return node.textContent?.trim() || ''
        if (!isElement(node)) return ''
        if (!isVisible(node)) return ''

        let text = ''
        const children = Array.from(node.childNodes)
        for (const child of children) {
          text += outputMarkdown(child) + ' '
        }

        const tagName = node.tagName.toLowerCase()
        const cleanText = text.replace(/\s+/g, ' ').trim()

        if (!cleanText && tagName !== 'img') return ''

        switch (tagName) {
          case 'h1': return `\n# ${cleanText}\n`
          case 'h2': return `\n## ${cleanText}\n`
          case 'h3': return `\n### ${cleanText}\n`
          case 'p': return `\n${cleanText}\n`
          case 'li': return ` - ${cleanText}\n`
          case 'a': 
            const href = node.getAttribute('href')
            // Ignorujemy linki puste lub JS
            if (!href || href.startsWith('javascript') || href.startsWith('#')) return cleanText;
            return ` [${cleanText}](${href}) `
          case 'img': 
            const alt = node.getAttribute('alt')
            return alt ? ` ![${alt}] ` : ''
          case 'br': return '\n'
          case 'strong':
          case 'b': return ` **${cleanText}** `
          default: return cleanText
        }
      }

      const bodyContent = outputMarkdown(document.body)
      
      // FALLBACK
      if (bodyContent.length < 200) {
          return `
Title: ${title}
Description: ${description}
URL: ${window.location.href}
---
[FALLBACK MODE - RAW TEXT]
${document.body.innerText}
          `
      }

      return `
Title: ${title}
Description: ${description}
URL: ${window.location.href}
---
${bodyContent}
      `
    })

    return markdown.replace(/\n\s*\n\s*\n/g, '\n\n').trim()

  } catch (e) {
    console.error(`⚠️ Błąd Scrapera:`, e)
    throw new Error('Nie udało się pobrać treści strony.')
  } finally {
    await browser.close()
  }
}

// --- KLIKANIE CIASTECZEK (Bez zmian, bo działa dobrze) ---
async function handleCookieConsent(page: Page) {
    console.log("🍪 Szukam przycisku cookies...");
    
    // 1. Znane ID
    const commonSelectors = [
        '#onetrust-accept-btn-handler',
        '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
        '.cc-btn.cc-allow',
        '[data-testid="cookie-policy-dialog-accept-button"]'
    ];
    for (const selector of commonSelectors) {
        try {
            const el = page.locator(selector).first();
            if (await el.isVisible({ timeout: 500 })) {
                await el.click();
                return;
            }
        } catch (e) {}
    }

    // 2. Po tekście
    const keywords = ["Zgadzam się", "Zaakceptuj", "Akceptuj", "Zgoda", "Accept All"];
    const tags = ['button', 'a', 'div', 'span'];
    
    for (const word of keywords) {
        for (const tag of tags) {
            try {
                const selector = `${tag}:visible:has-text("${word}")`;
                // Klikamy pierwszy pasujący
                const el = page.locator(selector).first();
                if (await el.isVisible()) {
                    await el.click({ force: true, timeout: 500 });
                    return;
                }
            } catch (e) {}
        }
    }
}