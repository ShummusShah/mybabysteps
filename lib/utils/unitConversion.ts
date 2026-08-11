export function mlToFlOz(ml: number): number {
  return parseFloat((ml * 0.033814).toFixed(1));
}

export function flOzToMl(flOz: number): number {
  return parseFloat((flOz * 29.5735).toFixed(1));
}

export function kgToLb(kg: number): number {
  return parseFloat((kg * 2.20462).toFixed(2));
}

export function lbToKg(lb: number): number {
  return parseFloat((lb / 2.20462).toFixed(2));
}

export function celsiusToFahrenheit(celsius: number): number {
  return parseFloat(((celsius * 9) / 5 + 32).toFixed(1));
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return parseFloat((((fahrenheit - 32) * 5) / 9).toFixed(1));
}

export function cmToInches(cm: number): number {
  return parseFloat((cm / 2.54).toFixed(2));
}

export function inchesToCm(inches: number): number {
  return parseFloat((inches * 2.54).toFixed(2));
}

export function formatWeight(kg: number, unit: 'kg' | 'lb'): string {
  if (unit === 'kg') {
    return `${kg.toFixed(2)} kg`;
  }
  return `${kgToLb(kg).toFixed(2)} lb`;
}

export function formatMilk(ml: number, unit: 'ml' | 'fl_oz'): string {
  if (unit === 'ml') {
    return `${ml} ml`;
  }
  return `${mlToFlOz(ml).toFixed(1)} fl oz`;
}

export function formatTemperature(celsius: number, unit: 'celsius' | 'fahrenheit'): string {
  if (unit === 'celsius') {
    return `${celsius.toFixed(1)}°C`;
  }
  return `${celsiusToFahrenheit(celsius).toFixed(1)}°F`;
}

export function formatLength(cm: number, unit: 'cm' | 'inches'): string {
  if (unit === 'cm') {
    return `${cm.toFixed(1)} cm`;
  }
  return `${cmToInches(cm).toFixed(2)} in`;
}
