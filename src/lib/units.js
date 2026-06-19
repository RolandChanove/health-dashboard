// Unit conversion + formatting helpers.
// Internally the app stores weight in POUNDS and height in INCHES (imperial canonical),
// then converts for display based on the active unit system. Liquids stored in OUNCES.

export const LB_PER_KG = 2.2046226218
export const KG_PER_LB = 1 / LB_PER_KG
export const CM_PER_IN = 2.54
export const IN_PER_CM = 1 / CM_PER_IN
export const ML_PER_OZ = 29.5735
export const OZ_PER_ML = 1 / ML_PER_OZ
export const KCAL_PER_LB_FAT = 3500 // ~3500 kcal per lb of body fat

// --- raw conversions ---
export const lbToKg = (lb) => lb * KG_PER_LB
export const kgToLb = (kg) => kg * LB_PER_KG
export const inToCm = (inch) => inch * CM_PER_IN
export const cmToIn = (cm) => cm * IN_PER_CM
export const ozToMl = (oz) => oz * ML_PER_OZ
export const mlToOz = (ml) => ml * OZ_PER_ML

const round = (n, dp = 1) => {
  const f = 10 ** dp
  return Math.round(n * f) / f
}

// --- display helpers (input is canonical imperial) ---

// weight: lb (canonical) -> { value, unit } in the chosen system
export function displayWeight(lb, system) {
  if (system === 'metric') return { value: round(lbToKg(lb), 1), unit: 'kg' }
  return { value: round(lb, 1), unit: 'lb' }
}

export function formatWeight(lb, system, dp = 1) {
  const v = system === 'metric' ? lbToKg(lb) : lb
  return `${round(v, dp)} ${system === 'metric' ? 'kg' : 'lb'}`
}

// height: inches (canonical) -> nice string
export function formatHeight(inches, system) {
  if (system === 'metric') return `${Math.round(inToCm(inches))} cm`
  const ft = Math.floor(inches / 12)
  const inch = Math.round(inches - ft * 12)
  return `${ft}'${inch}"`
}

export function formatVolume(oz, system, dp = 0) {
  if (system === 'metric') return `${round(ozToMl(oz), dp)} mL`
  return `${round(oz, dp)} oz`
}

// Convert a user-entered display weight back to canonical lb
export function toCanonicalWeight(value, system) {
  return system === 'metric' ? kgToLb(Number(value)) : Number(value)
}

// Convert a user-entered display height back to canonical inches
export function toCanonicalHeight(value, system) {
  return system === 'metric' ? cmToIn(Number(value)) : Number(value)
}

export function toCanonicalVolume(value, system) {
  return system === 'metric' ? mlToOz(Number(value)) : Number(value)
}

export const weightUnit = (system) => (system === 'metric' ? 'kg' : 'lb')
export const volumeUnit = (system) => (system === 'metric' ? 'mL' : 'oz')

export { round }
