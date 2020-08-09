import React from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Button } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

import AuthLayout from '@/layouts/AuthLayout';
import LINK from '@/constant/link';

import styles from './Register.scss';

const Register = () => {
  return (
    <AuthLayout>
      <Form className={styles.registerForm} layout="vertical">
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
          <Button type="primary" htmlType="submit" className={styles.submit}>
            REGISTER
          </Button>
          Or <Link to={LINK.LOGIN}>login now</Link>
        </Form.Item>
      </Form>
    </AuthLayout>
  );
};

export default Register;
