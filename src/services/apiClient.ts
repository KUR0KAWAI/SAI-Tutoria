import axios from 'axios';
import { API_BASE_URL } from '../core/env';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // DEBUG: Log outgoing request with source if available
    const source = config.headers['X-Source-Component'] || 'Unknown';
    console.log(`%c[API Request][${source}] ${config.method?.toUpperCase()} ${config.url}`, 'color: #3b82f6; font-weight: bold', {
        params: config.params,
        data: config.data,
        headers: config.headers
    });

    return config;
});

apiClient.interceptors.response.use(
    (response) => {
        // DEBUG: Log successful response
        console.log(`%c[API Response] ${response.status} ${response.config.url}`, 'color: #10b981; font-weight: bold', response.data);
        return response;
    },
    (error) => {
        // DEBUG: Log error response
        console.error(`%c[API Error] ${error.response?.status || 'Network Error'} ${error.config?.url}`, 'color: #ef4444; font-weight: bold', {
            message: error.message,
            responseData: error.response?.data,
            config: error.config
        });
        return Promise.reject(error);
    }
);

export default apiClient;
