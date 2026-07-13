/**
 * Auth client — backed by Supabase session.
 * Provides the `base44` auth interface used by AuthContext.
 */
import { getCurrentProfile, clearSession } from '@/lib/session';

export const base44 = {
  auth: {
    async me() {
      const profile = await getCurrentProfile();
      if (!profile) throw new Error('Not authenticated');
      return profile;
    },
    async isAuthenticated() {
      const profile = await getCurrentProfile();
      return !!profile;
    },
    logout(redirectUrl) {
      clearSession();
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    },
    redirectToLogin() {
      window.location.href = '/login';
    },
  },
};