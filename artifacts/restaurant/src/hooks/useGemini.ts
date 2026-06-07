import { Meal } from "@/types";

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export const isGeminiConfigured = !!GEMINI_KEY;

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_KEY) throw new Error("Gemini not configured");
  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error("Gemini API error");
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export async function getAIPairings(
  meal: Meal,
  allMeals: Meal[]
): Promise<{ meal: Meal; reason: string }[]> {
  const menuSummary = allMeals
    .filter((m) => m.id !== meal.id && m.isAvailable)
    .slice(0, 24)
    .map((m) => `${m.id}|${m.name}|${m.category}|$${m.price}|${(m.description ?? "").slice(0, 60)}`)
    .join("\n");

  if (!GEMINI_KEY) {
    const fallback = allMeals
      .filter((m) => m.id !== meal.id && m.isAvailable && m.category !== meal.category)
      .slice(0, 2);
    return fallback.map((m) => ({ meal: m, reason: "Popular combination choice." }));
  }

  const prompt = `You are a restaurant sommelier. A customer added "${meal.name}" (${meal.category}, $${meal.price}).
From this menu suggest exactly 2-3 perfect pairings. Return ONLY a JSON array, no markdown:
[{"id":"<meal_id>","reason":"<max 10 words why it pairs perfectly>"}]

Menu:
${menuSummary}`;

  try {
    const text = await callGemini(prompt);
    const match = text.match(/\[[\s\S]*?\]/);
    if (!match) return [];
    const pairs: { id: string; reason: string }[] = JSON.parse(match[0]);
    return pairs
      .map((p) => ({ meal: allMeals.find((m) => m.id === p.id)!, reason: p.reason }))
      .filter((p) => p.meal)
      .slice(0, 3);
  } catch {
    return [];
  }
}

export async function naturalLanguageSearch(
  query: string,
  allMeals: Meal[]
): Promise<Meal[]> {
  const q = query.toLowerCase();
  const fallback = allMeals.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.ingredients?.some((i) => i.toLowerCase().includes(q)) ||
      m.tags?.some((t) => t.toLowerCase().includes(q)) ||
      m.allergens?.some((a) => a.toLowerCase().includes(q)) ||
      m.category.toLowerCase().includes(q)
  );

  if (!GEMINI_KEY) return fallback;

  const menuSummary = allMeals
    .map(
      (m) =>
        `${m.id}|${m.name}|${m.category}|$${m.price}|${m.ingredients?.join(",")}|${m.tags?.join(",")}|${m.allergens?.join(",")}|${m.calories}cal|${(m.description ?? "").slice(0, 80)}`
    )
    .join("\n");

  const prompt = `Restaurant menu assistant. Customer query: "${query}"
Return ONLY a JSON array of matching meal IDs, no markdown. Example: ["id1","id2"]
If nothing matches return [].

Menu:
${menuSummary}`;

  try {
    const text = await callGemini(prompt);
    const match = text.match(/\[[\s\S]*?\]/);
    if (!match) return fallback;
    const ids: string[] = JSON.parse(match[0]);
    const result = ids.map((id) => allMeals.find((m) => m.id === id)!).filter(Boolean);
    return result.length > 0 ? result : fallback;
  } catch {
    return fallback;
  }
}
