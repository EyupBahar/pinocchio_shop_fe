import apiClient from './api.js'

export const authService = {
  register: (payload) => {
    // payload: { firstName, lastName, email, phone, password }
    // Note: No auth token needed for registration
    return apiClient.post('/auth/register', payload)
  },
  login: (payload) => {
    // payload: { email, password }
    // Note: No auth token needed for login
    return apiClient.post('/auth/login', payload)
  },
  // Initiate Google OAuth flow - Backend returns Google OAuth URL or redirects
  // Flow: Frontend → Backend (/auth/google/login) → Backend redirects to Google → Google → Backend (/auth/google/callback)
  initiateGoogleLogin: (options = {}) => {
    // Backend will return Google OAuth URL or handle redirect
    // Option 1: Backend returns URL, frontend redirects
    // Option 2: Backend directly redirects (window.location)
    // We'll use Option 1 for better control
    // options: { redirectUri, prompt } - prompt can be 'select_account' to force account selection
    const params = {}
    if (options.redirectUri) {
      params.redirect_uri = options.redirectUri
    }
    if (options.prompt) {
      params.prompt = options.prompt
    }
    return apiClient.get('/auth/google/login', { params })
  },
  // Handle Google OAuth callback - Backend exchanges authorization code for tokens
  handleGoogleCallback: (payload) => {
    // payload: { code, state } - Google OAuth authorization code and state
    // Flow:
    //   1. Google redirects to /auth/google/callback?code=...&state=...
    //   2. Frontend sends code to backend
    //   3. Backend exchanges code with Google for access token
    //   4. Backend exchanges Google token with Keycloak token
    //   5. Backend returns Keycloak access token and refresh token
    // Returns: { accessToken: KeycloakToken, refreshToken: KeycloakRefreshToken, ... }
    return apiClient.post('/auth/google/callback', payload)
  },
  // Legacy: Direct Google token exchange (if needed)
  loginWithGoogle: (payload) => {
    // payload: { idToken, accessToken } - Google OAuth tokens
    // Flow: 
    //   1. Frontend sends Google idToken to backend
    //   2. Backend verifies Google idToken
    //   3. Backend exchanges Google idToken with Keycloak token
    //   4. Backend returns Keycloak access token and refresh token
    // Returns: { accessToken: KeycloakToken, refreshToken: KeycloakRefreshToken, ... }
    return apiClient.post('/auth/google/login', payload)
  },
  loginWithKeycloakCode: (payload) => {
    // payload: { code, redirectUri } - Keycloak authorization code
    // Backend will exchange authorization code for Keycloak token
    return apiClient.post('/auth/keycloak/callback', payload)
  },
  getProfile: (token) => {
    // Note: If token is provided, it will be used, otherwise apiClient interceptor will try to get it from cookie/localStorage
    // For explicit token usage, we can pass it via headers, but interceptor handles it automatically
    if (token) {
      // If explicit token provided, use it
      return apiClient.get('/users/getProfile', {
        headers: { Authorization: `Bearer ${token}` }
      })
    }
    // Otherwise, let interceptor handle it
    return apiClient.get('/users/getProfile')
  }
}


