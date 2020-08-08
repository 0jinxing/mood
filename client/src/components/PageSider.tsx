import React, { FC } from 'react';
import { Layout, Menu } from 'antd';

import {
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined
} from '@ant-design/icons';

const menu = [
  { label: 'nav 1', path: '1', icon: <UserOutlined /> },
  { label: 'nav 2', path: '2', icon: <UploadOutlined /> },
  { label: 'nav 3', path: '3', icon: <VideoCameraOutlined /> }
];

const PageSider: FC = () => {
  return (
    <Layout.Sider theme="light">
      <Menu theme="light" mode="inline">
        {menu.map((i) => (
          <Menu.Item key={i.path} icon={i.icon}>
            {i.label}
          </Menu.Item>
        ))}
      </Menu>
    </Layout.Sider>
  );
};

export default PageSider;
