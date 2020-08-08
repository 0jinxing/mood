import React from 'react';
import { Form, Input, Button } from 'antd';

import AuthLayout from '@/layouts/AuthLayout';
import { b, e } from '@/utils/bem';
import { MailOutlined, LockOutlined, MessageOutlined } from '@ant-design/icons';
import './Register.scss';
import { Link } from 'react-router-dom';
import LINK from '@/constant/link';

const Register = () => {
  return (
    <AuthLayout>
      <Form className={b('register-form')} layout="vertical">
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
        <Form.Item label="Captcha">
          <div className={e('captcha-wrapper')}>
            <Input
              placeholder="captcha"
              prefix={<MessageOutlined className={e('icon')} />}
            />
            <Button type="link" htmlType="button">
              Get captcha
            </Button>
          </div>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className={e('submit')}>
            REGISTER
          </Button>
          Or <Link to={LINK.LOGIN}>login now</Link>
        </Form.Item>
      </Form>
    </AuthLayout>
  );
};

export default Register;
