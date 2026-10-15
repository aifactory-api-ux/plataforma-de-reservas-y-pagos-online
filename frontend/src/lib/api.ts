export interface ApiError {
  message: string;
  statusCode?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.text().catch(() => 'Unknown error');
      const error: ApiError = {
        message: errorData || `HTTP error ${response.status}`,
        statusCode: response.status,
      };
      throw error;
    }
    return response.json();
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(path, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(path, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(path, {
      method: 'PUT',
      headers: this.getHeaders(),
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(path, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(path: string): Promise<T> {
    const response = await fetch(path, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async postFormData<T>(path: string, formData: FormData): Promise<T> {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const response = await fetch(path, {
      method: 'POST',
      headers,
      body: formData,
    });
    return this.handleResponse<T>(response);
  }
}

export const apiFetch = new ApiClient();
