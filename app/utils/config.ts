export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development';
export const API_BASE_URL = ENVIRONMENT === 'production' ? import.meta.env.VITE_API_BASE_URL_PROD : import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const GQL_URL = `${API_BASE_URL}/graphql`;

console.log("environment is ", ENVIRONMENT);
console.log("API BASE URL is: ", API_BASE_URL);