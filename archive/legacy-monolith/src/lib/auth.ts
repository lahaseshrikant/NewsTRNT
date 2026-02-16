// Authentication Service for NewsNerve
// Handles JWT tokens, user sessions, and API communication

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

export interface User {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
  isAdmin: boolean;
  isVerified: boolean;
  interests: string[];
  preferences: any;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  username?: string;
}

class AuthService {
  private tokenKey = 'newsnerve_auth_token';
  private userKey = 'newsnerve_user';

  // Get stored auth token
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  // Get stored user data
  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userString = localStorage.getItem(this.userKey);
    return userString ? JSON.parse(userString) : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!(this.getToken() && this.getUser());
  }

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.isAdmin || false;
  }

  // Store authentication data
  private storeAuthData(token: string, user: User) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Clear authentication data
  private clearAuthData() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.user && data.token) {
        this.storeAuthData(data.token, data.user);
        return {
          success: true,
          user: data.user,
          token: data.token,
          message: data.message || 'Login successful',
        };
      } else {
        return {
          success: false,
          error: data.error || 'Login failed',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Register user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.user && data.token) {
        this.storeAuthData(data.token, data.user);
        return {
          success: true,
          user: data.user,
          token: data.token,
          message: data.message || 'Registration successful',
        };
      } else {
        return {
          success: false,
          error: data.error || 'Registration failed',
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Logout user
  async logout(): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      if (token) {
        // Call backend logout endpoint (optional)
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Always clear local data
      this.clearAuthData();
    }

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  // Get current user profile
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'No authentication token found',
        };
      }

      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.user) {
        // Update stored user data
        localStorage.setItem(this.userKey, JSON.stringify(data.user));
        return {
          success: true,
          user: data.user,
        };
      } else {
        // Token might be invalid, clear auth data
        if (response.status === 401) {
          this.clearAuthData();
        }
        return {
          success: false,
          error: data.error || 'Failed to fetch user profile',
        };
      }
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Update user profile
  async updateProfile(profileData: Partial<User>): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'No authentication token found',
        };
      }

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        // Update stored user data
        localStorage.setItem(this.userKey, JSON.stringify(data.user));
        return {
          success: true,
          user: data.user,
          message: data.message || 'Profile updated successfully',
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to update profile',
        };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'No authentication token found',
        };
      }

      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Password changed successfully',
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to change password',
        };
      }
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      return {
        success: response.ok,
        message: data.message || 'Password reset email sent',
        error: response.ok ? undefined : data.error,
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      return {
        success: response.ok,
        message: data.message || 'Password reset successfully',
        error: response.ok ? undefined : data.error,
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Verify email
  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      return {
        success: response.ok,
        message: data.message || 'Email verified successfully',
        error: response.ok ? undefined : data.error,
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Get authorization headers for API calls
  getAuthHeaders(): { [key: string]: string } {
    const token = this.getToken();
    return token
      ? {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      : {
          'Content-Type': 'application/json',
        };
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;