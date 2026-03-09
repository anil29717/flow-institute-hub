// API client to interact with standard Node.js/MongoDB backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
    // Generic Fetch wrapper with Auth Headers
    async fetch(endpoint: string, options: RequestInit = {}) {
        const token = localStorage.getItem('instiflow_auth_token');

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            throw new Error(errorData.error || errorData.message || 'API Request Failed');
        }

        return response.json();
    },

    // Convenience methods
    async get(endpoint: string) {
        return this.fetch(endpoint, { method: 'GET' });
    },

    async post(endpoint: string, body: any) {
        return this.fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    async put(endpoint: string, body: any) {
        return this.fetch(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    async delete(endpoint: string) {
        return this.fetch(endpoint, { method: 'DELETE' });
    },
    async patch(endpoint: string, body: any) {
        return this.fetch(endpoint, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    },
};
