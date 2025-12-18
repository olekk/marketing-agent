import { chromium } from "playwright";

export async function scrapeToMarkdown(url: string): Promise<string> {
  console.log(`🕷️ Semantic Scraping: ${url}...`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    const markdown = await page.evaluate(() => {
      // 1. Usuwanie śmieci (tak jak wcześniej, ale agresywniej)
      const garbage = document.querySelectorAll(
        'script, style, svg, noscript, iframe, nav, [class*="cookie"], [id*="cookie"], .ads, #sidebar'
      );
      garbage.forEach((el) => el.remove());

      // 2. Pobieramy meta dane
      const title = document.title;
      const description =
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content") || "";

      // 3. Funkcja rekurencyjna do budowania Markdowna
      function outputMarkdown(node: Element): string {
        let text = "";

        // Ignorujemy ukryte elementy
        const style = window.getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden")
          return "";

        // Przetwarzamy dzieci
        for (const child of Array.from(node.children)) {
          text += outputMarkdown(child) + " ";
        }

        // Jeśli nie ma dzieci, bierzemy tekst (ale tylko jeśli node sam w sobie ma tekst)
        if (node.children.length === 0) {
          text = node.textContent?.trim() || "";
        }

        // Formatowanie na podstawie tagu
        const tagName = node.tagName.toLowerCase();
        switch (tagName) {
          case "h1":
            return `\n# ${text}\n`;
          case "h2":
            return `\n## ${text}\n`;
          case "h3":
            return `\n### ${text}\n`;
          case "p":
            return `\n${text}\n`;
          case "li":
            return ` - ${text}\n`;
          case "a":
            return ` [${text}](${node.getAttribute("href")}) `;
          case "img":
            return ` ![${node.getAttribute("alt") || "img"}] `;
          case "div":
          case "section":
          case "article":
          case "main":
          case "span":
          case "b":
          case "strong":
            return text; // Zwracamy sam tekst bez formatowania
          default:
            return text;
        }
      }

      // Uruchamiamy na body
      const bodyContent = outputMarkdown(document.body);

      // Sklejamy całość
      return `
Title: ${title}
Description: ${description}
URL: ${window.location.href}
---
${bodyContent.replace(/\n\s*\n/g, "\n\n").trim()} 
        `; // Regex usuwa wielokrotne puste linie
    });

    return markdown;
  } catch (e) {
    console.error(`⚠️ Błąd:`, e);
    return "";
  } finally {
    await browser.close();
  }
}

// scrapeToMarkdown("https://seedpaper.pl").then((res) => console.log(res));
