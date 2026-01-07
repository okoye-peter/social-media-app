import { useUserStore } from '@/stores';
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
    // Don't set Content-Type here - let axios set it automatically based on the data
    // This allows FormData to use multipart/form-data and JSON to use application/json
    withCredentials: true,
});

// Track if we're already redirecting to prevent multiple redirects
let isRedirecting = false;

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401 && !isRedirecting) {
            isRedirecting = true;

            // Clear any auth state
            if (typeof window !== 'undefined') {
                const logOut = useUserStore((state) => state.logOut)
                logOut()
                // Or dispatch a logout action if using Redux/Zustand

                // Preserve the current path to redirect back after login
                const currentPath = window.location.pathname;
                const redirectPath = currentPath !== '/login'
                    ? `/login?redirect=${encodeURIComponent(currentPath)}`
                    : '/login';

                window.location.href = redirectPath;
            }
        }

        // Handle other status codes
        if (status === 403) {
            console.error('Access forbidden');
            isRedirecting = true;

            // Clear any auth state
            if (typeof window !== 'undefined') {
                const logOut = useUserStore((state) => state.logOut)
                logOut()
                // Or dispatch a logout action if using Redux/Zustand

                // Preserve the current path to redirect back after login
                const currentPath = window.location.pathname;
                const redirectPath = currentPath !== '/login'
                    ? `/login?redirect=${encodeURIComponent(currentPath)}`
                    : '/login';

                window.location.href = redirectPath;
            }
        }

        if (status === 500) {
            console.error('Server error');
            isRedirecting = true;

            // Clear any auth state
            if (typeof window !== 'undefined') {
                const logOut = useUserStore((state) => state.logOut)
                logOut()
                // Or dispatch a logout action if using Redux/Zustand

                // Preserve the current path to redirect back after login
                const currentPath = window.location.pathname;
                const redirectPath = currentPath !== '/login'
                    ? `/login?redirect=${encodeURIComponent(currentPath)}`
                    : '/login';

                window.location.href = redirectPath;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;