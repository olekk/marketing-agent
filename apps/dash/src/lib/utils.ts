import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

// Generic parser that takes a schema and handles errors safely
export function safeParseJSON<T>(
  schema: z.ZodSchema<T>,
  jsonString: string | null,
): T {
  if (!jsonString) {
    return schema.parse({}); // Return default values defined in schema
  }
  try {
    const parsed = JSON.parse(jsonString);
    return schema.parse(parsed); // Validate and fill defaults
  } catch (error) {
    console.error("JSON Parse Error:", error);
    return schema.parse({}); // Fallback to defaults on error
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toKey = (text: string) => text
  .normalize('NFD')                // 1. Rozbija znaki (np. "ą" zamienia na "a" + osobny ogonek)
  .replace(/[\u0300-\u036f]/g, '') // 2. Usuwa te oddzielone ogonki (diakrytyki)
  .replace(/\s+/g, '_')            // 3. Zamienia spacje na podłogi (lub usuwa: replace(/\s+/g, ''))
  .toLowerCase()                   // 4. (Opcjonalnie) Zmniejsza litery

  export const toDomainId = (input: string) => {
    if (!input) return ''
    const trimmed = input.trim().toLowerCase()
  
    const withoutProtocol = trimmed.replace(/^https?:\/\//i, '')
    const withoutPath = withoutProtocol.split('/')[0] ?? ''
    const withoutQuery = withoutPath.split('?')[0] ?? ''
    const withoutPort = withoutQuery.split(':')[0] ?? ''
    return withoutPort.replace(/^www\./, '')
  }