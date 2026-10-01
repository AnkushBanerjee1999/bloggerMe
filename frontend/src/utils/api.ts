/**
 * Centralized API Client for MERN Blog Frontend
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const TOKEN_KEY = 'blog_access_token';
const REFRESH_TOKEN_KEY = 'blog_refresh_token';

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export class ApiError extends Error {
  code: string;
  statusCode: number;
  details?: unknown;

  constructor(message: string, code = 'ERROR', statusCode = 500, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

async function refreshAuthTokens(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    throw new ApiError('No refresh token available', 'NO_REFRESH_TOKEN', 401);
  }

  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    tokenStorage.clearTokens();
    throw new ApiError(
      json.error?.message || 'Session expired. Please log in again.',
      json.error?.code || 'AUTH_EXPIRED',
      response.status
    );
  }

  const newAccessToken = json.data.tokens.accessToken;
  const newRefreshToken = json.data.tokens.refreshToken;
  tokenStorage.setTokens(newAccessToken, newRefreshToken);
  return newAccessToken;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const accessToken = tokenStorage.getAccessToken();
  if (accessToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new ApiError(
      err?.message || 'Network connection failed. Please ensure the backend is running.',
      'NETWORK_ERROR',
      0
    );
  }

  // Handle 401 for token expiry & retry with refresh
  if (response.status === 401 && !isRetry && tokenStorage.getRefreshToken() && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
    if (isRefreshing) {
      try {
        await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        return apiRequest<T>(endpoint, options, true);
      } catch (err) {
        throw err;
      }
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAuthTokens();
      processQueue(null, newToken);
      return apiRequest<T>(endpoint, options, true);
    } catch (err) {
      processQueue(err, null);
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  const json = await response.json().catch(() => null);

  if (!response.ok || (json && json.success === false)) {
    const error = json?.error;
    const message = error?.message || response.statusText || 'An unexpected error occurred';
    const code = error?.code || `HTTP_${response.status}`;
    throw new ApiError(message, code, response.status, error?.details);
  }

  return json?.data !== undefined ? json.data : json;
}

// Convenience methods
export const api = {
  get<T = any>(endpoint: string, options?: RequestInit) {
    return apiRequest<T>(endpoint, { ...options, method: 'GET' });
  },
  post<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  put<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  patch<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  delete<T = any>(endpoint: string, options?: RequestInit) {
    return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
