export function generateDescription(psaNumber: number): string {
  let rarity: string

  if (psaNumber >= 9) {
    rarity = 'Factory New 🔥'
  } else if (psaNumber >= 7) {
    rarity = 'Minimal Wear ✨'
  } else if (psaNumber >= 5) {
    rarity = 'Field-Tested ⚡'
  } else {
    rarity = 'Battle-Scarred 💀'
  }

  return `${rarity}`
}
