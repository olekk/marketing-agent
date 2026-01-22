/**
 * Wyczyść domenę z protokołu i końcowych ukośników
 */
export function cleanDomain(domain: string): string {
  return domain
    .trim()
    .replace(/^https?:\/\//i, '') // Usuń http:// lub https://
    .replace(/\/+$/, '') // Usuń końcowe ukośniki
}

/**
 * Rozwiąż protokół dla domeny poprzez próbę połączenia HTTPS
 * @param domain - Domena bez protokołu (np. "example.com")
 * @returns Pełny URL z odpowiednim protokołem (https:// lub http://)
 */
export async function resolveProtocol(domain: string): Promise<string> {
  const clean = cleanDomain(domain)

  // Spróbuj HEAD request na HTTPS z timeoutem 2000ms
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 2000)

  try {
    const response = await fetch(`https://${clean}`, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    })

    // Jeśli request się udał (nawet z błędem HTTP), HTTPS działa
    clearTimeout(timeoutId)
    return `https://${clean}`
  } catch (error) {
    // Timeout, błąd SSL, błąd sieciowy -> użyj HTTP
    clearTimeout(timeoutId)
    return `http://${clean}`
  }
}

// Funkcja czyszcząca Markdown pod AI (oszczędność tokenów)
export function cleanMarkdownForAI(markdown: string): string {
  return markdown
    .replace(/!\[.*?\]\(.*?\)/g, '') // Usuwa obrazki ![alt](url)
    .replace(/\[.*?\]\(.*?\)/g, (match) => {
      // Opcjonalnie: Możemy usuwać linki, ale czasem są przydatne.
      // Na razie zostawmy sam tekst linku, usuwając URL, żeby AI skupiło się na treści.
      return match // Zostawiamy linki, bo mogą prowadzić do podstron oferty
    })
    .replace(/\n\s*\n/g, '\n') // Usuwa puste linie
    .substring(0, 35000) // TWARDY LIMIT: 35k znaków (ok. 6-8k tokenów). Bezpiecznie dla gpt-4o-mini.
}