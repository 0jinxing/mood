import React, { FC } from "react";
import { b, e } from "@/utils/bem";
import "./UserLayout.scss";

const UserLayout: FC = ({ children }) => {
  return (
    <div className={b("user-layout")}>
      <main className={e("content")}>
        <div>{children}</div>
      </main>
    </div>
  );
};

export default UserLayout;
