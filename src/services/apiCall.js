const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;
const getAuthToken = () => {
    return localStorage.getItem('token');
};
const apiCall = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };
  
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  };
  export default apiCall;