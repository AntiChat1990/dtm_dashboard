import type { CurrencyCode, CurrencyRate } from "@/lib/dashboard-types";

const CURRENCY_META: Record<CurrencyCode, Pick<CurrencyRate, "name" | "symbol">> = {
  RUB: { name: "\u0420\u0443\u0431\u043b\u044c", symbol: "\u20BD" },
  USD: { name: "\u0414\u043e\u043b\u043b\u0430\u0440", symbol: "$" },
  EUR: { name: "\u0415\u0432\u0440\u043e", symbol: "\u20AC" },
  CNY: { name: "\u042E\u0430\u043d\u044c", symbol: "\u00A5" },
  BTC: { name: "\u0411\u0438\u0442\u043a\u043e\u0438\u043d", symbol: "\u20BF" },
};

const FALLBACK_RUB_RATES: Record<Exclude<CurrencyCode, "RUB">, number> = {
  USD: 80,
  EUR: 90,
  CNY: 11,
  BTC: 5500000,
};

const getDefaultCurrencyRates = (): CurrencyRate[] => {
  const updatedAt = new Date().toISOString();

  return [
    {
      code: "RUB",
      name: CURRENCY_META.RUB.name,
      symbol: CURRENCY_META.RUB.symbol,
      rubRate: 1,
      source: "\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u043E",
      updatedAt,
    },
    {
      code: "USD",
      name: CURRENCY_META.USD.name,
      symbol: CURRENCY_META.USD.symbol,
      rubRate: FALLBACK_RUB_RATES.USD,
      source: "Fallback",
      updatedAt,
    },
    {
      code: "EUR",
      name: CURRENCY_META.EUR.name,
      symbol: CURRENCY_META.EUR.symbol,
      rubRate: FALLBACK_RUB_RATES.EUR,
      source: "Fallback",
      updatedAt,
    },
    {
      code: "CNY",
      name: CURRENCY_META.CNY.name,
      symbol: CURRENCY_META.CNY.symbol,
      rubRate: FALLBACK_RUB_RATES.CNY,
      source: "Fallback",
      updatedAt,
    },
    {
      code: "BTC",
      name: CURRENCY_META.BTC.name,
      symbol: CURRENCY_META.BTC.symbol,
      rubRate: FALLBACK_RUB_RATES.BTC,
      source: "Fallback",
      updatedAt,
    },
  ];
};

const createCurrencyRate = (
  code: CurrencyCode,
  rubRate: number,
  source: string,
  updatedAt: string,
): CurrencyRate => ({
  code,
  name: CURRENCY_META[code].name,
  symbol: CURRENCY_META[code].symbol,
  rubRate,
  source,
  updatedAt,
});

export const getCurrencyRates = async (): Promise<CurrencyRate[]> => {
  const defaults = getDefaultCurrencyRates();

  try {
    const coinbaseResponse = await fetch("https://api.coinbase.com/v2/exchange-rates?currency=RUB", {
      next: { revalidate: 600 },
    });

    if (coinbaseResponse.ok) {
      const coinbaseJson = (await coinbaseResponse.json()) as {
        data?: {
          currency?: string;
          rates?: Partial<Record<CurrencyCode, string>>;
        };
      };

      const rates = coinbaseJson.data?.rates;
      if (coinbaseJson.data?.currency === "RUB" && rates) {
        const toRub = (code: Exclude<CurrencyCode, "RUB">): number => {
          const raw = rates[code];
          const parsed = typeof raw === "string" ? Number.parseFloat(raw) : Number.NaN;
          if (!Number.isFinite(parsed) || parsed <= 0) {
            return FALLBACK_RUB_RATES[code];
          }
          return 1 / parsed;
        };

        const updatedAt = new Date().toISOString();

        return [
          createCurrencyRate("RUB", 1, "api.coinbase.com", updatedAt),
          createCurrencyRate("USD", toRub("USD"), "api.coinbase.com", updatedAt),
          createCurrencyRate("EUR", toRub("EUR"), "api.coinbase.com", updatedAt),
          createCurrencyRate("CNY", toRub("CNY"), "api.coinbase.com", updatedAt),
          createCurrencyRate("BTC", toRub("BTC"), "api.coinbase.com", updatedAt),
        ];
      }
    }

    const fallbackResponse = await fetch("https://open.er-api.com/v6/latest/RUB", {
      next: { revalidate: 600 },
    });

    if (!fallbackResponse.ok) {
      return defaults;
    }

    const fallbackJson = (await fallbackResponse.json()) as {
      result?: string;
      time_last_update_utc?: string;
      rates?: Partial<Record<CurrencyCode, number>>;
    };

    if (fallbackJson.result !== "success" || !fallbackJson.rates) {
      return defaults;
    }

    const toRubFromFallback = (code: Exclude<CurrencyCode, "RUB">): number => {
      const direct = fallbackJson.rates?.[code];
      if (!direct || direct <= 0) {
        return FALLBACK_RUB_RATES[code];
      }
      return 1 / direct;
    };

    const updatedAt = fallbackJson.time_last_update_utc
      ? new Date(fallbackJson.time_last_update_utc).toISOString()
      : new Date().toISOString();

    return [
      createCurrencyRate("RUB", 1, "open.er-api.com", updatedAt),
      createCurrencyRate("USD", toRubFromFallback("USD"), "open.er-api.com", updatedAt),
      createCurrencyRate("EUR", toRubFromFallback("EUR"), "open.er-api.com", updatedAt),
      createCurrencyRate("CNY", toRubFromFallback("CNY"), "open.er-api.com", updatedAt),
      createCurrencyRate("BTC", toRubFromFallback("BTC"), "open.er-api.com", updatedAt),
    ];
  } catch {
    return defaults;
  }
};
