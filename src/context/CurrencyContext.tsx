import React, { createContext, useContext, useState, useEffect } from 'react';

interface GlobalSettingsContextType {
    currency: string;
    symbol: string;
    taxRate: number;
    freeShippingThreshold: number;
    exchangeRate: number;
    convertPrice: (baseInrPrice: number) => string;
    changeCurrency: (newCurrency: string) => void;
    loading: boolean;
    // 🔥 NAYE SHIPPING VARIABLES
    shippingIndia: number;
    shippingTier1: number;
    shippingRow: number;
}

const CurrencyContext = createContext<GlobalSettingsContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    // 🔥 Default base currency ab INR hai
    const [currency, setCurrency] = useState('INR');
    const [rate, setRate] = useState(1);
    const [taxRate, setTaxRate] = useState(0);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(100);
    const [loading, setLoading] = useState(true);

    // 🔥 NAYE SHIPPING STATES (Default values in INR)
    const [shippingIndia, setShippingIndia] = useState(15);
    const [shippingTier1, setShippingTier1] = useState(50);
    const [shippingRow, setShippingRow] = useState(80);

    const symbols: Record<string, string> = { USD: '$', INR: '₹', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$' };

    const changeCurrency = async (newCurrency: string) => {
        setLoading(true);
        setCurrency(newCurrency);
        localStorage.setItem('userCurrency', newCurrency);

        // 🔥 Agar nayi currency INR nahi hai, tabhi rate fetch karo (Base is INR)
        if (newCurrency !== 'INR') {
            try {
                // Live rates based on INR
                const apiRes = await fetch('https://open.er-api.com/v6/latest/INR');
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

                setTaxRate(typeof dbData.taxRate === 'number' ? dbData.taxRate : Number(dbData.taxRate) || 0);
                if (dbData.freeShippingAmount !== undefined && dbData.freeShippingAmount !== null) {
                    setFreeShippingThreshold(Number(dbData.freeShippingAmount));
                }

                // 🔥 ADMIN SE SHIPPING RATES UTHAO
                setShippingIndia(dbData.shippingIndia || 15);
                setShippingTier1(dbData.shippingTier1 || 50);
                setShippingRow(dbData.shippingRow || 80);

                // 2. Check karo agar user ne khud koi currency select ki hai (Default INR)
                const savedCurrency = localStorage.getItem('userCurrency');
                const targetCurrency = savedCurrency || dbData.defaultCurrency || 'INR';
                setCurrency(targetCurrency);

                // 3. Fetch live exchange rate based on INR
                if (targetCurrency !== 'INR') {
                    const apiRes = await fetch('https://open.er-api.com/v6/latest/INR');
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

    // 🔥 Convert price from BASE INR to Selected Currency
    const convertPrice = (baseInrPrice: number) => {
        if (baseInrPrice === undefined || baseInrPrice === null) return '';
        const converted = baseInrPrice * rate;

        // 'en-IN' formats correctly for Indian numbering system (e.g. ₹1,00,000)
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(converted);
    };

    return (
        <CurrencyContext.Provider value={{
            currency,
            symbol: symbols[currency] || '₹',
            taxRate,
            freeShippingThreshold,
            exchangeRate: rate,
            convertPrice,
            changeCurrency,
            loading,
            // 🔥 VALUES PROVIDE KARO
            shippingIndia,
            shippingTier1,
            shippingRow
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