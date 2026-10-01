import type { Response } from 'express';
import { authService } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { config } from '../config/index.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const authController = {
  async register(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      const result = await authService.register(req.body.name, req.body.email, req.body.password);
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  },

  async login(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new AppError('VALIDATION_ERROR', 'Refresh token is required', 422);
      }
      const tokens = await authService.refreshAccessToken(refreshToken);
      sendSuccess(res, { tokens });
    } catch (err) {
      next(err);
    }
  },

  async me(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      if (!req.user) {
        throw new AppError('AUTH_ERROR', 'Not authenticated', 401);
      }
      const user = await authService.getCurrentUser(req.user.id);
      sendSuccess(res, { user });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      let userId = req.user?.id;
      if (!userId && req.body?.refreshToken) {
        try {
          const { verifyRefreshToken } = await import('../utils/jwt.js');
          const payload = verifyRefreshToken(req.body.refreshToken);
          userId = payload.userId;
        } catch {
          // Ignore invalid refresh token during logout, still proceed
        }
      }
      await authService.logout(userId);
      sendSuccess(res, { message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },

  googleAuth(_req: AuthenticatedRequest, res: Response) {
    const { clientId, callbackUrl } = (config as any).oauth.google;
    if (!clientId) {
      throw new AppError('OAUTH_NOT_CONFIGURED', 'Google OAuth is not configured on this server', 503);
    }
    const state = Math.random().toString(36).substring(2, 15);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'offline',
      prompt: 'select_account',
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  },

  async googleCallback(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      const { code, error } = req.query;
      const clientUrl = config.clientUrl;

      if (error) {
        return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(String(error))}`);
      }
      if (!code || typeof code !== 'string') {
        return res.redirect(`${clientUrl}/login?error=missing_code`);
      }

      const { clientId, clientSecret, callbackUrl } = (config as any).oauth.google;
      if (!clientId || !clientSecret) {
        throw new AppError('OAUTH_NOT_CONFIGURED', 'Google OAuth is not configured on this server', 503);
      }

      // Exchange code for tokens
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: callbackUrl,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenRes.json() as any;
      if (!tokenRes.ok || !tokenData.access_token) {
        return res.redirect(`${clientUrl}/login?error=token_exchange_failed`);
      }

      // Retrieve user profile using access token
      const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = await profileRes.json() as any;

      if (!profileRes.ok || !profile.email) {
        return res.redirect(`${clientUrl}/login?error=email_not_provided`);
      }

      const authResult = await authService.handleOAuthLogin({
        provider: 'google',
        providerId: profile.sub || profile.id,
        email: profile.email,
        name: profile.name || profile.given_name || 'Google User',
        avatar: profile.picture || '',
      });

      const queryParams = new URLSearchParams({
        accessToken: authResult.tokens.accessToken,
        refreshToken: authResult.tokens.refreshToken,
        user: JSON.stringify(authResult.user),
      });

      return res.redirect(`${clientUrl}/login?${queryParams.toString()}`);
    } catch (err) {
      next(err);
    }
  },

  facebookAuth(_req: AuthenticatedRequest, res: Response) {
    const { appId, callbackUrl } = (config as any).oauth.facebook;
    if (!appId) {
      throw new AppError('OAUTH_NOT_CONFIGURED', 'Facebook OAuth is not configured on this server', 503);
    }
    const state = Math.random().toString(36).substring(2, 15);
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: callbackUrl,
      scope: 'public_profile',
      state,
      response_type: 'code',
    });
    res.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`);
  },

  async facebookCallback(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      const { code, error, error_description } = req.query;
      const clientUrl = config.clientUrl;

      if (error) {
        const desc = error_description ? String(error_description) : String(error);
        return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(desc)}`);
      }
      if (!code || typeof code !== 'string') {
        return res.redirect(`${clientUrl}/login?error=missing_code`);
      }

      const { appId, appSecret, callbackUrl } = (config as any).oauth.facebook;
      if (!appId || !appSecret) {
        throw new AppError('OAUTH_NOT_CONFIGURED', 'Facebook OAuth is not configured on this server', 503);
      }

      // Exchange code for user access token
      const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
      tokenUrl.searchParams.set('client_id', appId);
      tokenUrl.searchParams.set('client_secret', appSecret);
      tokenUrl.searchParams.set('redirect_uri', callbackUrl);
      tokenUrl.searchParams.set('code', code);

      const tokenRes = await fetch(tokenUrl.toString());
      const tokenData = await tokenRes.json() as any;
      if (!tokenRes.ok || !tokenData.access_token) {
        return res.redirect(`${clientUrl}/login?error=token_exchange_failed`);
      }

      // Retrieve profile & picture
      const profileUrl = new URL('https://graph.facebook.com/me');
      profileUrl.searchParams.set('fields', 'id,name,email,picture.type(large)');
      profileUrl.searchParams.set('access_token', tokenData.access_token);

      const profileRes = await fetch(profileUrl.toString());
      const profile = await profileRes.json() as any;

      if (!profileRes.ok || !profile.id) {
        return res.redirect(`${clientUrl}/login?error=profile_fetch_failed`);
      }

      // Fallback email if Facebook account has no verified email attached
      const email = profile.email || `fb_${profile.id}@facebook.local`;

      const authResult = await authService.handleOAuthLogin({
        provider: 'facebook',
        providerId: profile.id,
        email,
        name: profile.name || 'Facebook User',
        avatar: profile.picture?.data?.url || '',
      });

      const queryParams = new URLSearchParams({
        accessToken: authResult.tokens.accessToken,
        refreshToken: authResult.tokens.refreshToken,
        user: JSON.stringify(authResult.user),
      });

      return res.redirect(`${clientUrl}/login?${queryParams.toString()}`);
    } catch (err) {
      next(err);
    }
  },
};
