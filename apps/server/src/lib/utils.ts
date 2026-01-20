/**
 * Wyczyść domenę z protokołu i końcowych ukośników
 */
function cleanDomain(domain: string): string {
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
