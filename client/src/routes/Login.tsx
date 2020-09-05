import React, { FC, useState } from 'react';
import { Link, useParams, useHistory, Redirect } from 'react-router-dom';
import { Form, Button, Checkbox, Input, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import SignInLayout from '@/layouts/SignInLayout';
import LINK from '@/constants/link';
import { login } from '@/utils/request';

import styles from './Login.scss';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrent } from '@/actions/auth';
import { RootState } from '@/reducers';

type FormValues = {
  email: string;
  password: string;
  remember: boolean;
};

const Login: FC = () => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const { redirectUrl } = useParams<{ redirectUrl: string }>();
  const [form] = Form.useForm();

  const authorization = useSelector((state: RootState) => !!state.auth.email);
  if (authorization) {
    return <Redirect to={redirectUrl || LINK.INSTANCE} />;
  }

  const submit = async ({ email, password, remember }: FormValues) => {
    try {
      setLoading(true);
      const data = await login(email, password, remember);
      dispatch(setCurrent({ email: data.email }));
      history.push(redirectUrl ?? LINK.INSTANCE_LIST);
    } catch (e) {
      if (e instanceof Response) {
        if (e.status === 403) {
          message.error('Invalid account or password');
        }
      }
      setLoading(false);
    }
  };

  return (
    <SignInLayout>
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
          <Button
            loading={loading}
            type="primary"
            htmlType="submit"
            className={styles.submit}
          >
            LOGIN
          </Button>
          Or <Link to={LINK.REGISTER}>register now</Link>
        </Form.Item>
      </Form>
    </SignInLayout>
  );
};
export default Login;
