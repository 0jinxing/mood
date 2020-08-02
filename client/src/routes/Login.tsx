import React, { FC } from "react";
import { Form, Button, Checkbox, Input } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import UserLayout from "@/layouts/UserLayout";
import favicon from "../assets/favicon.svg";
import { b, e } from "@/utils/bem";

import "./Login.scss";

const Login: FC = () => {
  return (
    <UserLayout>
      <h1 className={b("login-title")}>
        <a href="/">
          <img src={favicon} className={e("icon")} />
          <span className={e("text")}>MOOD</span>
        </a>
      </h1>
      <Form className={b("login-form")} layout="vertical">
        <Form.Item label="Username or email address">
          <Input
            prefix={<MailOutlined className={e("icon")} />}
            placeholder="username or email"
          />
        </Form.Item>
        <Form.Item label="Password">
          <Input
            prefix={<LockOutlined className={e("icon")} />}
            placeholder="password"
          />
        </Form.Item>
        <Form.Item>
          <Checkbox className={e("remember")}>Remember me</Checkbox>
          <a className={e("forgot")}>Forgot password</a>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="button"
            className={e("submit")}
          >
            Submit
          </Button>
          Or <a>register now</a>
        </Form.Item>
      </Form>
    </UserLayout>
  );
};
export default Login;
