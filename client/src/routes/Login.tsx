import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Checkbox, Input } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import AuthLayout from '@/layouts/AuthLayout';
import { b, e } from '@/utils/bem';
import LINK from '@/constant/link';

import './Login.scss';

const Login: FC = () => {
  return (
    <AuthLayout>
      <Form className={b('login-form')} layout="vertical">
        <Form.Item label="Email address">
          <Input
            prefix={<MailOutlined className={e('icon')} />}
            placeholder="email"
          />
        </Form.Item>
        <Form.Item label="Password">
          <Input
            prefix={<LockOutlined className={e('icon')} />}
            placeholder="password"
          />
        </Form.Item>
        <Form.Item>
          <Checkbox className={e('remember')}>Remember me</Checkbox>
          <Link to={LINK.PASSWORD_RESET} className={e('forgot')}>
            Forgot password
          </Link>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="button" className={e('submit')}>
            LOGIN
          </Button>
          Or <Link to={LINK.REGISTER}>register now</Link>
        </Form.Item>
      </Form>
    </AuthLayout>
  );
};
export default Login;
