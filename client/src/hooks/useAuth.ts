import { useSelector } from 'react-redux';
import { RootState } from '@/reducers';

export default function useAuth() {
  const auth = useSelector((state: RootState) => state.auth);
  return auth;
}
