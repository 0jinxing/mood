import React, { FC } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { Form, Button, Checkbox, Input } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import AuthLayout from '@/layouts/AuthLayout';
import LINK from '@/constants/link';
import { login } from '@/utils/request';

import styles from './Login.scss';

type FormValues = {
  email: string;
  password: string;
  remember: boolean;
};

const Login: FC = () => {
  const history = useHistory();
  const { redirectUrl } = useParams<{ redirectUrl: string }>();
  const [form] = Form.useForm();

  const submit = async ({ email, password, remember }: FormValues) => {
    try {
      await login(email, password, remember);
      history.push(redirectUrl ?? '/');
    } catch (err) {}
  };

  return (
    <AuthLayout>
      <Form
        className={styles.loginForm}
        layout="vertical"
        form={form}
        onFinish={submit}
      >
        <Form.Item
          name="email"
          label="Email address"
          rules={[{ required: true }, { type: 'email' }]}
        >
          <Input
            prefix={<MailOutlined className={styles.icon} />}
            placeholder="email"
          />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true }, { min: 8 }]}
        >
          <Input
            type="password"
            prefix={<LockOutlined className={styles.icon} />}
            placeholder="password"
          />
        </Form.Item>
        <Form.Item>
          <Form.Item
            className={styles.remember}
            noStyle
            name="remember"
            valuePropName="checked"
          >
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          <Link to={LINK.PASSWORD_RESET} className={styles.forgot}>
            Forgot password
          </Link>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className={styles.submit}>
            LOGIN
          </Button>
          Or <Link to={LINK.REGISTER}>register now</Link>
        </Form.Item>
      </Form>
    </AuthLayout>
  );
};
export default Login;
