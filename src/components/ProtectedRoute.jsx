import { Outlet } from 'react-router-dom';
import { getStoredProfileId } from '@/lib/session';

export default function ProtectedRoute({ unauthenticatedElement }) {
  const profileId = getStoredProfileId();

  if (!profileId) {
    return unauthenticatedElement;
  }

  return <Outlet />;
}