// Auth Configuration - NextAuth.js benzeri yapı
import { decodeToken } from '../services/api.js'
import { authService } from '../services/authService.js'

// Token payload interface (NextAuth.js'deki gibi)
export const createTokenPayload = (decodedToken, userData = {}) => {
  return {
    sub: decodedToken?.sub || userData.userId || userData.id, // User ID
    email: decodedToken?.email || userData.email || '',
    iat: decodedToken?.iat || Math.floor(Date.now() / 1000), // Issued at
    exp: decodedToken?.exp || null, // Expires at
    role: decodedToken?.realm_access?.roles?.[0] || userData.role || null,
    permissions: decodedToken?.realm_access?.roles || userData.permissions || [],
    access_token: null, // Will be set by JWT callback
    refresh_token: null, // Will be set by JWT callback
    provider: userData.provider || 'credentials', // Provider used for login
    name: decodedToken?.name || userData.name || userData.username || '',
    given_name: decodedToken?.given_name || userData.firstName || '',
    family_name: decodedToken?.family_name || userData.lastName || '',
    surname: decodedToken?.surname || userData.surname || '',
    realm_access: decodedToken?.realm_access || {
      roles: userData.role ? [userData.role] : []
    },
    isCreated: userData.isUserNew || false
  }
}

// Credentials Provider - NextAuth.js'deki gibi
export const credentialsProvider = {
  name: 'Credentials',
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    if (!credentials || !credentials.email || !credentials.password) {
      return null
    }

    try {
      const res = await authService.login({
        email: credentials.email,
        password: credentials.password
      })

      // Check for error response
      if (res.status === 401 || res.error) {
        return null
      }

      // Get token from response
      const accessToken = res?.data?.accessToken || 
                        res?.data?.data?.accessToken || 
                        res?.data?.token || 
                        res?.data?.data?.token || 
                        res?.data?.access_token ||
                        res?.data?.data?.access_token

      if (!accessToken) {
        throw new Error('No token received from login')
      }

      // Decode token
      const decodedToken = decodeToken(accessToken)
      if (!decodedToken) {
        throw new Error('Invalid token')
      }

      // Check if user is admin (NextAuth.js'deki gibi)
      const isAdmin = decodedToken?.realm_access?.roles?.includes('Admin') || 
                     decodedToken?.realm_access?.roles?.includes('admin')

      // Get user ID
      const userId = decodedToken?.sub || 
                    decodedToken?.userId || 
                    decodedToken?.user_id || 
                    decodedToken?.id || 
                    decodedToken?.nameid || 
                    res?.data?.customerId || 
                    res?.data?.data?.customerId || 
                    null

      // Get user info from profile
      let profile = {}
      try {
        const profileRes = await authService.getProfile(accessToken)
        profile = profileRes?.data?.data || profileRes?.data || {}
      } catch (err) {
        console.warn('Could not fetch profile, using token data')
      }

      return {
        id: userId,
        email: decodedToken?.email || profile.email || credentials.email,
        firstName: decodedToken?.given_name || profile.firstName || '',
        lastName: decodedToken?.family_name || profile.lastName || '',
        role: isAdmin ? 'ADMIN' : (decodedToken?.realm_access?.roles?.[0] || 'GUEST'),
        accessToken: accessToken,
        refreshToken: res?.data?.refreshToken || res?.data?.data?.refreshToken || null,
        isUserNew: res?.data?.isUserNew || res?.data?.data?.isUserNew || false,
        provider: 'credentials'
      }
    } catch (error) {
      console.error('Credentials authorize error:', error)
      throw error
    }
  }
}

// Google Provider - NextAuth.js'deki gibi
// Flow: Google idToken → Backend (/auth/google/login) → Keycloak Token Exchange → Keycloak Token
export const googleProvider = {
  name: 'Google',
  async authorize(googleResponse) {
    if (!googleResponse || !googleResponse.credential) {
      return null
    }

    try {
      // Step 1: Get Google idToken from OAuth response
      const idToken = googleResponse.credential
      const accessToken = googleResponse.access_token || null

      // Step 2: Send Google idToken to backend for Keycloak token exchange
      // Backend will:
      //   - Verify Google idToken
      //   - Exchange Google idToken with Keycloak token
      //   - Return Keycloak access token and refresh token
      const res = await authService.loginWithGoogle({ idToken, accessToken })

      // Check for error response
      if (res.status === 401 || res.error) {
        return null
      }

      // Step 3: Extract Keycloak token from response
      // Backend returns Keycloak token after successful exchange
      const keycloakToken = res?.data?.accessToken || 
                           res?.data?.data?.accessToken || 
                           res?.data?.token || 
                           res?.data?.data?.token || 
                           res?.data?.access_token ||
                           res?.data?.data?.access_token

      if (!keycloakToken) {
        throw new Error('No Keycloak token received from backend after Google token exchange')
      }

      // Step 4: Decode Keycloak token to get user info
      const decodedToken = decodeToken(keycloakToken)
      if (!decodedToken) {
        throw new Error('Invalid Keycloak token')
      }

      // Step 5: Extract user ID from Keycloak token
      const userId = decodedToken?.sub || 
                    decodedToken?.userId || 
                    decodedToken?.user_id || 
                    decodedToken?.id || 
                    decodedToken?.nameid || 
                    res?.data?.customerId || 
                    res?.data?.data?.customerId || 
                    null

      // Step 6: Get additional user info from profile API
      let profile = {}
      try {
        const profileRes = await authService.getProfile(keycloakToken)
        profile = profileRes?.data?.data || profileRes?.data || {}
      } catch (err) {
        console.warn('Could not fetch profile, using token data')
      }

      // Step 7: Return user data with Keycloak token
      return {
        id: userId,
        email: decodedToken?.email || profile.email || '',
        firstName: decodedToken?.given_name || profile.firstName || '',
        lastName: decodedToken?.family_name || profile.lastName || '',
        role: decodedToken?.realm_access?.roles?.includes('Admin') ? 'ADMIN' : 'GUEST',
        accessToken: keycloakToken, // Keycloak token (not Google token)
        refreshToken: res?.data?.refreshToken || res?.data?.data?.refreshToken || null,
        isUserNew: res?.data?.isUserNew || res?.data?.data?.isUserNew || false,
        provider: 'google'
      }
    } catch (error) {
      console.error('Google authorize error:', error)
      throw error
    }
  }
}

// JWT Callback - NextAuth.js'deki gibi
export const jwtCallback = (token, user, account) => {
  // Initial sign in
  if (user && account?.provider) {
    token.accessToken = user.accessToken
    token.refreshToken = user.refreshToken
    token.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      isUserNew: user.isUserNew
    }
    token.provider = account.provider
  }

  return token
}

// Session Callback - NextAuth.js'deki gibi
export const sessionCallback = (session, token) => {
  if (token) {
    session.user = token.user
    session.accessToken = token.accessToken
    session.provider = token.provider
  }

  return session
}




