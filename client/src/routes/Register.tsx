import React from "react";
import { Form } from "antd";

import UserLayout from "@/layouts/UserLayout";
import { b, e } from "@/utils/bem";

import favicon from "../assets/favicon.svg";

const Register = () => {
  return (
    <UserLayout>
      <h1 className={b("register-title")}>
        <a href="/">
          <img src={favicon} className={e("icon")} />
          <span className={e("text")}>MOOD</span>
        </a>
      </h1>
      <Form className={b("register-form")}></Form>
    </UserLayout>
  );
};

export default Register;
