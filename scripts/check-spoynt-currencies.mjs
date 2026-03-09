import fs from "node:fs";
import path from "node:path";

const root = "/Users/yaroslav/Projects/cv-maker";

const files = {
  route: path.join(root, "src/app/api/spoynt/create-invoice/route.ts"),
  currencies: path.join(root, "src/resources/currencies.ts"),
  currencySwitch: path.join(root, "src/components/widgets/currency-switch/CurrencySwitch.tsx"),
  drawer: path.join(root, "src/components/ui/drawer/Drawer.tsx"),
  env: path.join(root, ".env"),
};

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function parseEnv(envText) {
  const result = {};
  for (const rawLine of envText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    result[key] = line.slice(eqIndex + 1).trim();
  }
  return result;
}

function extractCurrencies(source, exportName, inherited = []) {
  const match = source.match(new RegExp(`${exportName}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*as const`));
  if (!match) return [];
  const body = match[1];
  const uncommented = body
    .split(/\r?\n/)
    .map((line) => line.replace(/\/\/.*$/, ""))
    .join("\n");
  const direct = [...uncommented.matchAll(/"([A-Z]{3})"/g)].map((item) => item[1]);
  const values = body.includes("...DISPLAY_CURRENCIES") ? [...inherited, ...direct] : direct;
  return [...new Set(values)];
}

function extractDrawerCurrencies(source) {
  return [...source.matchAll(/<option[^>]+value={?"?([A-Z]{3})"?/g)].map((item) => item[1]);
}

function unique(values) {
  return [...new Set(values)];
}

function formatList(values) {
  return values.length ? values.join(", ") : "—";
}

const routeSource = read(files.route);
const currenciesSource = read(files.currencies);
const switchSource = read(files.currencySwitch);
const drawerSource = read(files.drawer);
const envText = read(files.env);
const env = parseEnv(envText);

const displayCurrencies = unique(extractCurrencies(currenciesSource, "DISPLAY_CURRENCIES"));
const supportedCurrencies = unique(extractCurrencies(currenciesSource, "SUPPORTED_CURRENCIES", displayCurrencies));
const switchCurrencies = switchSource.includes("DISPLAY_CURRENCIES") ? displayCurrencies : [];
const drawerCurrencies = drawerSource.includes("DISPLAY_CURRENCIES") ? displayCurrencies : unique(extractDrawerCurrencies(drawerSource));
const forceSuccess = (env.SPOYNT_FORCE_SUCCESS || "").trim();

const serviceStatus = supportedCurrencies.map((currency) => {
  const envKey = currency === "GBP" ? "SPOYNT_DEFAULT_SERVICE" : `SPOYNT_DEFAULT_SERVICE_${currency}`;
  const rawValue = (env[envKey] || "").trim();
  const passthroughConfigured = currency === "GBP" ? rawValue.length > 0 : rawValue.length > 0;
  return {
    currency,
    envKey,
    passthroughConfigured,
    fallsBackToGBP: currency !== "GBP" && !passthroughConfigured,
    valuePreview: rawValue ? `${rawValue.slice(0, 18)}${rawValue.length > 18 ? "…" : ""}` : "<empty>",
  };
});

const directPassThroughCurrencies = serviceStatus
  .filter((item) => item.currency === "GBP" || item.passthroughConfigured)
  .map((item) => item.currency);
const fallbackCurrencies = serviceStatus.filter((item) => item.fallsBackToGBP).map((item) => item.currency);

console.log("=== Spoynt currency diagnostics ===");
console.log(`Frontend-visible currencies: ${formatList(displayCurrencies)}`);
console.log(`Header switch currencies: ${formatList(switchCurrencies)}`);
console.log(`Drawer currencies: ${formatList(drawerCurrencies)}`);
console.log("");
console.log(`Accepted by checkout route: ${formatList(supportedCurrencies)}`);
console.log(`Direct pass-through to Spoynt: ${formatList(directPassThroughCurrencies)}`);
console.log(`Fallback to GBP when selected: ${formatList(fallbackCurrencies)}`);
console.log("");
console.log(`SPOYNT_FORCE_SUCCESS: ${forceSuccess || "<missing>"}`);
console.log("Per-currency service readiness:");
for (const item of serviceStatus) {
  console.log(
    `- ${item.currency}: ${item.fallsBackToGBP ? "fallback->GBP" : "direct"} (${item.envKey} = ${item.valuePreview})`
  );
}

if (forceSuccess === "true") {
  console.log("WARNING: SPOYNT_FORCE_SUCCESS=true, so real HPP/3DS will be bypassed.");
}
