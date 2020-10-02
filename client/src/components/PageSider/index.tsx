import React, { FC, useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';

import {
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { useHistory, Link } from 'react-router-dom';

import styles from './index.scss';

const menu = [
  { label: 'Overview', path: '/overview', icon: <UserOutlined /> },
  { label: 'Instance', path: '/instance/list', icon: <UploadOutlined /> },
  { label: 'Event', path: '/event/list', icon: <VideoCameraOutlined /> }
];

const PageSider: FC = () => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const history = useHistory();
  const { pathname } = history.location;

  useEffect(() => {
    setSelectedKeys([pathname]);
  }, [pathname]);

  return (
    <Layout.Sider
      className={styles.sider}
      theme="light"
      breakpoint="lg"
      collapsedWidth="48px"
    >
      <Menu theme="light" mode="inline" selectedKeys={selectedKeys}>
        {menu.map(i => (
          <Menu.Item key={i.path} icon={i.icon}>
            <Link to={i.path}>{i.label}</Link>
          </Menu.Item>
        ))}
      </Menu>
    </Layout.Sider>
  );
};

export default PageSider;
