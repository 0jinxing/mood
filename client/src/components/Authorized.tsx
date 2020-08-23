import React, { FC } from 'react';
import useAuth from '@/hooks/useAuth';
import { Redirect } from 'react-router-dom';
import LINK from '@/constants/link';

const Authorized: FC = ({ children }) => {
  const auth = useAuth();
  if (!auth.email) {
    return <Redirect to={LINK.LOGIN} />;
  }
  return <>{children}</>;
};

export default Authorized;
