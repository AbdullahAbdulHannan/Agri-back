// Mock authentication utility for testing
export const mockLogin = () => {
  const mockUser = {
    id: 1,
    name: 'ByeWind',
    email: 'seller@agribazaar.com',
    role: 'seller',
    avatar: null
  };

  const mockToken = 'mock-jwt-token-12345';

  // Store in localStorage
  localStorage.setItem('token', mockToken);
  localStorage.setItem('userData', JSON.stringify(mockUser));

  return { user: mockUser, token: mockToken };
};

export const mockLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
};

export const isMockAuthenticated = () => {
  return !!localStorage.getItem('token') && !!localStorage.getItem('userData');
};

export const getMockUser = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
}; 