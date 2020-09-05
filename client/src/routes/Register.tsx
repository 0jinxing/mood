import React from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

import SignInLayout from '@/layouts/SignInLayout';
import LINK from '@/constants/link';
import { register } from '@/utils/request';

import styles from './Register.scss';

type FormValues = {
  email: string;
  password: string;
  remember: boolean;
};

const Register = () => {
  const history = useHistory();
  const { redirectUrl } = useParams<{ redirectUrl: string }>();
  const [form] = Form.useForm();

  const submit = async ({ email, password, remember }: FormValues) => {
    try {
      await register(email, password, remember);
      history.push(redirectUrl ?? LINK.INSTANCE_LIST);
    } catch (err) {
      if (err instanceof Response) {
        message.error(err.statusText);
      } else {
        message.error(err.message || 'Register fail');
      }
    }
  };

  return (
    <SignInLayout>
      <Form
        form={form}
        className={styles.registerForm}
        layout="vertical"
        onFinish={submit}
      >
        <Form.Item
          label="Email address"
          name="email"
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
            prefix={<LockOutlined className={styles.icon} />}
            placeholder="password"
          />
        </Form.Item>
        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>Remember me</Checkbox>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className={styles.submit}>
            REGISTER
          </Button>
          Or <Link to={LINK.LOGIN}>login now</Link>
        </Form.Item>
      </Form>
    </SignInLayout>
  );
};

export default Register;
