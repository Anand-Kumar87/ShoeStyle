import React, { createContext, useContext, useState, useEffect } from 'react';

interface GlobalSettingsContextType {
    currency: string;
    symbol: string;
    taxRate: number;
    freeShippingThreshold: number;
    exchangeRate: number; // 🔥 ZAROORI: Stripe aur Razorpay ki calculation ke liye
    convertPrice: (baseUsdPrice: number) => string;
    loading: boolean;
}

const CurrencyContext = createContext<GlobalSettingsContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrency] = useState('USD');
    const [rate, setRate] = useState(1);
    const [taxRate, setTaxRate] = useState(0);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(100);
    const [loading, setLoading] = useState(true);

    const symbols: Record<string, string> = { USD: '$', INR: '₹', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$' };

    useEffect(() => {
        async function initGlobalSettings() {
            try {
                // 1. Database se saari Admin Settings uthao
                const dbRes = await fetch('/api/admin/settings');
                const dbData = await dbRes.json();

                const targetCurrency = dbData.defaultCurrency || 'USD';
                setCurrency(targetCurrency);
                setTaxRate(dbData.taxRate || 0);
                setFreeShippingThreshold(dbData.freeShippingAmount || 100);

                // 2. Fetch live exchange rate
                if (targetCurrency !== 'USD') {
                    const apiRes = await fetch('https://open.er-api.com/v6/latest/USD');
                    const apiData = await apiRes.json();
                    setRate(apiData.rates[targetCurrency] || 1);
                }
            } catch (error) {
                console.error("Failed to fetch global settings", error);
            } finally {
                setLoading(false);
            }
        }
        initGlobalSettings();
    }, []);

    const convertPrice = (baseUsdPrice: number) => {
        if (baseUsdPrice === undefined || baseUsdPrice === null) return '';

        const converted = baseUsdPrice * rate;

        // 🔥 PREMIUM UI FIX: Decimals (points) hataye aur commas lagaye
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0, // Zero decimals
            maximumFractionDigits: 0  // Zero decimals
        }).format(converted);
    };

    return (
        <CurrencyContext.Provider value={{
            currency,
            symbol: symbols[currency] || '$',
            taxRate,
            freeShippingThreshold,
            exchangeRate: rate, // 🔥 Backend payment calculation ke liye export kiya
            convertPrice,
            loading
        }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useGlobalCurrency() {
    const context = useContext(CurrencyContext);
    if (!context) throw new Error("useGlobalCurrency must be used within a CurrencyProvider");
    return context;
}