export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // First check localStorage
  const localToken = localStorage.getItem('auth_token');
  if (localToken) return localToken;
  
  // Then check cookies (client-side accessible)
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => cookie.trim().startsWith('client_auth_token='));
  if (authCookie) {
    const token = authCookie.split('=')[1];
    // Store in localStorage for future use
    localStorage.setItem('auth_token', token);
    return token;
  }
  
  return null;
}

export function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('auth_token', token);
  else {
    localStorage.removeItem('auth_token');
    // Also clear the cookie
    document.cookie = 'client_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
}

export function logout() {
  setAuthToken(null);
  // Clear all auth-related cookies
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'client_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'gbp_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'gbp_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = getAuthToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}




