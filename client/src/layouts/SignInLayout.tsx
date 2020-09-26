import React, { FC } from 'react';
import logo from '../assets/logo.svg';
import { Link } from 'react-router-dom';
import LINK from '@/constants/link';

import styles from './SignInLayout.scss';

const SignInLayout: FC = ({ children }) => {
  return (
    <div className={styles.signInLayout}>
      <main className={styles.container}>
        <div>
          <h1 className={styles.title}>
            <Link to={LINK.HOME}>
              <img src={logo} className={styles.icon} />
              <span className={styles.text}>MOOD</span>
            </Link>
          </h1>
          {children}
        </div>
      </main>
    </div>
  );
};

export default SignInLayout;
