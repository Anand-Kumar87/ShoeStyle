// hooks/useAdminData.ts
import { useQuery } from 'react-query';
import axios from 'axios';

// Backend API Base URL
const API = axios.create({ baseURL: 'http://localhost:5000/api/v1/admin' });

// 1. Fetch Real Orders
export const useOrders = (page = 1, limit = 10) => {
    return useQuery(['orders', page], async () => {
        const { data } = await API.get(`/orders?page=${page}&limit=${limit}`);
        return data; // Expected from Node.js: { orders: [...], totalPages: 5 }
    });
};

// 2. Fetch Real Analytics (Revenue, Users, etc.)
export const useAnalytics = (timeframe = '30days') => {
    return useQuery(['analytics', timeframe], async () => {
        const { data } = await API.get(`/analytics?timeframe=${timeframe}`);
        return data;
    });
};

// 3. Real Global Search (Debounced)
export const useGlobalSearch = (searchQuery: string) => {
    return useQuery(['search', searchQuery], async () => {
        if (!searchQuery) return [];
        const { data } = await API.get(`/search?q=${searchQuery}`);
        return data; // Returns matching products, orders, or users
    }, {
        enabled: searchQuery.length > 2, // Only search if more than 2 letters
        staleTime: 60000,
    });
};