import React, { createContext, useContext, useState, useEffect } from 'react';

interface GlobalSettingsContextType {
    currency: string;
    symbol: string;
    taxRate: number;
    freeShippingThreshold: number;
    exchangeRate: number; // 🔥 ZAROORI: Stripe aur Razorpay ki calculation ke liye
    convertPrice: (baseUsdPrice: number) => string;
    changeCurrency: (newCurrency: string) => void; // 🔥 NAYA FIX: Currency change function
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

    // 🔥 NAYA FIX: Customer ki marzi se currency change karne aur save karne ka logic
    const changeCurrency = async (newCurrency: string) => {
        setLoading(true);
        setCurrency(newCurrency);
        localStorage.setItem('userCurrency', newCurrency); // Customer ki choice save kar li

        if (newCurrency !== 'USD') {
            try {
                const apiRes = await fetch('https://open.er-api.com/v6/latest/USD');
                const apiData = await apiRes.json();
                setRate(apiData.rates[newCurrency] || 1);
            } catch (error) {
                console.error("Failed to fetch new rate", error);
            }
        } else {
            setRate(1);
        }
        setLoading(false);
    };

    useEffect(() => {
        async function initGlobalSettings() {
            try {
                // 1. Database se saari Admin Settings uthao
                const dbRes = await fetch('/api/admin/settings');
                const dbData = await dbRes.json();

                setTaxRate(dbData.taxRate || 0);
                setFreeShippingThreshold(dbData.freeShippingAmount || 100);

                // 2. 🔥 NAYA FIX: Pehle check karo agar user ne khud koi currency select ki hai (Local Storage)
                const savedCurrency = localStorage.getItem('userCurrency');
                const targetCurrency = savedCurrency || dbData.defaultCurrency || 'USD';
                setCurrency(targetCurrency);

                // 3. Fetch live exchange rate
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
            changeCurrency, // 🔥 NAYA FIX: Export kiya taaki button ise use kar sake
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
