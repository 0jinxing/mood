import React, { FC } from "react";
import classnames from "classnames";

import "./UserLayout.scss";

const UserLayout: FC = ({ children }) => {
  return (
    <div className={classnames("traps_user-layout")}>
      <main className={classnames("traps_user-layout__content")}>
        <div>{children}</div>
      </main>
      {/* <footer>copyright</footer> */}
    </div>
  );
};

export default UserLayout;
