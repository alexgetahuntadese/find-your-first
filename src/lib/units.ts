export type Unit = { label: string; symbol: string; factor: number };
export type Category = { label: string; description: string; units: Unit[] };

export const UNIT_CATEGORIES = {
  length: { label: "Length", description: "Convert millimeters, centimeters, meters, kilometers, inches, feet, yards, and miles.", units: [{ label: "Millimeter", symbol: "mm", factor: 0.001 }, { label: "Centimeter", symbol: "cm", factor: 0.01 }, { label: "Meter", symbol: "m", factor: 1 }, { label: "Kilometer", symbol: "km", factor: 1000 }, { label: "Inch", symbol: "in", factor: 0.0254 }, { label: "Foot", symbol: "ft", factor: 0.3048 }, { label: "Yard", symbol: "yd", factor: 0.9144 }, { label: "Mile", symbol: "mi", factor: 1609.344 }] },
  area: { label: "Area", description: "Convert square meters, square kilometers, acres, hectares, and more.", units: [{ label: "Square millimeter", symbol: "mm²", factor: 0.000001 }, { label: "Square centimeter", symbol: "cm²", factor: 0.0001 }, { label: "Square meter", symbol: "m²", factor: 1 }, { label: "Square kilometer", symbol: "km²", factor: 1000000 }, { label: "Square foot", symbol: "ft²", factor: 0.09290304 }, { label: "Acre", symbol: "ac", factor: 4046.8564224 }, { label: "Hectare", symbol: "ha", factor: 10000 }] },
  mass: { label: "Mass / Weight", description: "Convert milligrams, grams, kilograms, metric tons, ounces, and pounds.", units: [{ label: "Milligram", symbol: "mg", factor: 0.000001 }, { label: "Gram", symbol: "g", factor: 0.001 }, { label: "Kilogram", symbol: "kg", factor: 1 }, { label: "Metric ton", symbol: "t", factor: 1000 }, { label: "Ounce", symbol: "oz", factor: 0.028349523125 }, { label: "Pound", symbol: "lb", factor: 0.45359237 }] },
  temperature: { label: "Temperature", description: "Convert Celsius, Fahrenheit, and Kelvin temperatures.", units: [{ label: "Celsius", symbol: "°C", factor: 1 }, { label: "Fahrenheit", symbol: "°F", factor: 1 }, { label: "Kelvin", symbol: "K", factor: 1 }] },
  volume: { label: "Volume", description: "Convert milliliters, liters, cups, gallons, teaspoons, and cubic meters.", units: [{ label: "Milliliter", symbol: "mL", factor: 0.001 }, { label: "Liter", symbol: "L", factor: 1 }, { label: "Cubic meter", symbol: "m³", factor: 1000 }, { label: "Teaspoon", symbol: "tsp", factor: 0.00492892159 }, { label: "Tablespoon", symbol: "tbsp", factor: 0.0147867648 }, { label: "Cup", symbol: "cup", factor: 0.2365882365 }, { label: "US gallon", symbol: "gal", factor: 3.785411784 }] },
  speed: { label: "Speed", description: "Convert kilometers per hour, miles per hour, meters per second, and knots.", units: [{ label: "Meters per second", symbol: "m/s", factor: 1 }, { label: "Kilometers per hour", symbol: "km/h", factor: 0.2777777778 }, { label: "Miles per hour", symbol: "mph", factor: 0.44704 }, { label: "Knot", symbol: "kn", factor: 0.5144444444 }] },
  time: { label: "Time", description: "Convert milliseconds, seconds, minutes, hours, days, and weeks.", units: [{ label: "Millisecond", symbol: "ms", factor: 0.001 }, { label: "Second", symbol: "s", factor: 1 }, { label: "Minute", symbol: "min", factor: 60 }, { label: "Hour", symbol: "h", factor: 3600 }, { label: "Day", symbol: "day", factor: 86400 }, { label: "Week", symbol: "week", factor: 604800 }] },
  data: { label: "Digital data", description: "Convert bits, bytes, kilobytes, megabytes, gigabytes, and terabytes.", units: [{ label: "Bit", symbol: "bit", factor: 0.125 }, { label: "Byte", symbol: "B", factor: 1 }, { label: "Kilobyte", symbol: "KB", factor: 1024 }, { label: "Megabyte", symbol: "MB", factor: 1048576 }, { label: "Gigabyte", symbol: "GB", factor: 1073741824 }, { label: "Terabyte", symbol: "TB", factor: 1099511627776 }] },
  pressure: { label: "Pressure", description: "Convert pascals, kilopascals, bar, PSI, and atmospheres.", units: [{ label: "Pascal", symbol: "Pa", factor: 1 }, { label: "Kilopascal", symbol: "kPa", factor: 1000 }, { label: "Bar", symbol: "bar", factor: 100000 }, { label: "PSI", symbol: "psi", factor: 6894.757293 }, { label: "Atmosphere", symbol: "atm", factor: 101325 }] },
  energy: { label: "Energy", description: "Convert joules, kilojoules, calories, kilocalories, watt-hours, and kilowatt-hours.", units: [{ label: "Joule", symbol: "J", factor: 1 }, { label: "Kilojoule", symbol: "kJ", factor: 1000 }, { label: "Calorie", symbol: "cal", factor: 4.184 }, { label: "Kilocalorie", symbol: "kcal", factor: 4184 }, { label: "Watt-hour", symbol: "Wh", factor: 3600 }, { label: "Kilowatt-hour", symbol: "kWh", factor: 3600000 }] },
  power: { label: "Power", description: "Convert watts, kilowatts, and horsepower.", units: [{ label: "Watt", symbol: "W", factor: 1 }, { label: "Kilowatt", symbol: "kW", factor: 1000 }, { label: "Horsepower", symbol: "hp", factor: 745.699872 }] },
  force: { label: "Force", description: "Convert newtons, kilonewtons, and pound-force.", units: [{ label: "Newton", symbol: "N", factor: 1 }, { label: "Kilonewton", symbol: "kN", factor: 1000 }, { label: "Pound-force", symbol: "lbf", factor: 4.4482216153 }] },
  angle: { label: "Angle", description: "Convert degrees, radians, and gradians.", units: [{ label: "Degree", symbol: "°", factor: 1 }, { label: "Radian", symbol: "rad", factor: 57.2957795131 }, { label: "Gradian", symbol: "gon", factor: 0.9 }] },
} satisfies Record<string, Category>;

export type UnitCategory = keyof typeof UNIT_CATEGORIES;

function temperatureToCelsius(value: number, unit: string) {
  if (unit === "°F") return (value - 32) * (5 / 9);
  if (unit === "K") return value - 273.15;
  return value;
}

function celsiusToTemperature(value: number, unit: string) {
  if (unit === "°F") return value * (9 / 5) + 32;
  if (unit === "K") return value + 273.15;
  return value;
}

export function convertUnit(category: UnitCategory, value: number, from: Unit, to: Unit) {
  if (category === "temperature") return celsiusToTemperature(temperatureToCelsius(value, from.symbol), to.symbol);
  return (value * from.factor) / to.factor;
}
