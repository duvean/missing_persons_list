const API_URL = 'http://localhost:3000/api';

export const apiFetch = async (endpoint: string, options: any = {}) => {
  // Достаем токен из localStorage
  const token = localStorage.getItem('todo_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Если токен устарел или неверный разлогиниваем
    localStorage.removeItem('todo_token');
    window.location.href = '/login'; 
  }

  return response;
};