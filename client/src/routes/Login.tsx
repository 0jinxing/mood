import React, { FC } from "react";
import { Form, Button, Checkbox, Input } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import UserLayout from "@/layouts/UserLayout";
import favicon from "../assets/favicon.svg";

import "./Login.scss";

const Login: FC = () => {
  return (
    <UserLayout>
      <h1 className={"traps_login-title"}>
        <a href="/">
          <img src={favicon} className={"traps_login-title__icon"} />
          <span className={"traps_login-title__text"}>FE Monitoring</span>
        </a>
      </h1>
      <Form className={"traps_login-form"} layout="vertical">
        <Form.Item label="Username or email address">
          <Input
            prefix={<MailOutlined className={"traps_login-form__icon"} />}
            placeholder="username or email"
          />
        </Form.Item>
        <Form.Item label="Password">
          <Input
            prefix={<LockOutlined className={"traps_login-form__icon"} />}
            placeholder="password"
          />
        </Form.Item>
        <Form.Item>
          <Checkbox className={"traps_login-form__remember"}>
            Remember me
          </Checkbox>
          <a className={"traps_login-form__forgot"}>Forgot password</a>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="button"
            className={"traps_login-form__submit"}
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
