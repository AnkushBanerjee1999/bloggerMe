import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '@/pages/public/LoginPage';
import { RegisterPage } from '@/pages/public/RegisterPage';
import { AppProvider } from '@/context/AppContext';

// Mock socket service so tests run purely in memory
vi.mock('@/services/socket', () => ({
  connectSocket: vi.fn(),
  disconnectSocket: vi.fn(),
  getSocket: vi.fn(),
}));

describe('Frontend React Authentication Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('LoginPage Component', () => {
    it('renders login form with email, password inputs and submit button', () => {
      render(
        <AppProvider>
          <BrowserRouter>
            <LoginPage />
          </BrowserRouter>
        </AppProvider>
      );

      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
    });

    it('allows typing into email and password fields', () => {
      render(
        <AppProvider>
          <BrowserRouter>
            <LoginPage />
          </BrowserRouter>
        </AppProvider>
      );

      const emailInput = screen.getByPlaceholderText('you@example.com') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement;

      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

      expect(emailInput.value).toBe('user@test.com');
      expect(passwordInput.value).toBe('Password123!');
    });

    it('renders Google and Facebook OAuth buttons', () => {
      render(
        <AppProvider>
          <BrowserRouter>
            <LoginPage />
          </BrowserRouter>
        </AppProvider>
      );

      expect(screen.getByText(/Google/i)).toBeInTheDocument();
      expect(screen.getByText(/Facebook/i)).toBeInTheDocument();
    });
  });

  describe('RegisterPage Component', () => {
    it('renders registration fields including name, email, password, and confirm password', () => {
      render(
        <AppProvider>
          <BrowserRouter>
            <RegisterPage />
          </BrowserRouter>
        </AppProvider>
      );

      expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('At least 6 characters')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Re-enter your password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create account/i })).toBeInTheDocument();
    });

    it('displays validation error if passwords do not match', async () => {
      render(
        <AppProvider>
          <BrowserRouter>
            <RegisterPage />
          </BrowserRouter>
        </AppProvider>
      );

      fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), { target: { value: 'Password123!' } });
      fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { target: { value: 'MismatchPassword!' } });

      fireEvent.click(screen.getByRole('button', { name: /Create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('displays validation error if password is less than 6 characters', async () => {
      render(
        <AppProvider>
          <BrowserRouter>
            <RegisterPage />
          </BrowserRouter>
        </AppProvider>
      );

      fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), { target: { value: '123' } });
      fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { target: { value: '123' } });

      fireEvent.click(screen.getByRole('button', { name: /Create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 6 characters long/i)).toBeInTheDocument();
      });
    });
  });
});
