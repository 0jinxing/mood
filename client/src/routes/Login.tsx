import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Checkbox, Input } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import AuthLayout from '@/layouts/AuthLayout';
import LINK from '@/constant/link';

import styles from './Login.scss';

const Login: FC = () => {
  return (
    <AuthLayout>
      <Form className={styles.loginForm} layout="vertical">
        <Form.Item label="Email address">
          <Input
            prefix={<MailOutlined className={styles.icon} />}
            placeholder="email"
          />
        </Form.Item>
        <Form.Item label="Password">
          <Input
            prefix={<LockOutlined className={styles.icon} />}
            placeholder="password"
          />
        </Form.Item>
        <Form.Item>
          <Checkbox className={styles.remember}>Remember me</Checkbox>
          <Link to={LINK.PASSWORD_RESET} className={styles.forgot}>
            Forgot password
          </Link>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="button" className={styles.submit}>
            LOGIN
          </Button>
          Or <Link to={LINK.REGISTER}>register now</Link>
        </Form.Item>
      </Form>
    </AuthLayout>
  );
};
export default Login;
