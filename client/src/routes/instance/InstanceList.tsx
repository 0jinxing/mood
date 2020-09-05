import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { queryInstance, Instance } from '@/services/instance';

import CreateInstanceDialog, {
  CreateValues
} from './components/InstanceCreateDialog';

import { Button, Table, Tag, Input, Form } from 'antd';
import PageToolbar from '@/components/PageToolbar';
import PageMain from '@/components/PageMain';

import styles from './InstanceList.scss';
import { useForm } from 'antd/lib/form/Form';
import { PaginationPage } from '@/common/types/pagination-page';
import useAsyncEffect from '@/hooks/useAsyncEffect';

const { Column } = Table;

type SearchFormValues = {
  domain?: string;
};

const InstanceList = () => {
  const [list, setList] = useState<Instance[]>([]);

  const [createVisible, setCreateVisible] = useState(false);

  const createInstanceSubmit = (value: CreateValues) => {
    queryList();
    setCreateVisible(false);
  };

  const createInstanceCancel = () => {
    setCreateVisible(false);
  };

  const [searchLoading, setSearchLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const [searchForm] = useForm();

  const [searchParams, setSearchParams] = useState<SearchFormValues>({});
  const [pageParams, setPageParams] = useState<PaginationPage>({
    page: 1,
    pageSize: 5
  });

  const [total, setTotal] = useState(0);

  const queryList = async () => {
    try {
      setListLoading(true);
      const skip = (pageParams.page - 1) * pageParams.pageSize;
      const limit = pageParams.pageSize;

      const data = await queryInstance({ ...searchParams, skip, limit });
      setList(data.list);
      setTotal(data.total);

      return data;
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    queryList();
  }, [pageParams]);

  useAsyncEffect(async () => {
    try {
      setSearchLoading(true);
      await queryList();
    } finally {
      setSearchLoading(false);
    }
  }, [searchParams]);

  const handleSearch = () => {
    const values = searchForm.getFieldsValue() as SearchFormValues;
    setSearchParams(values);
  };

  return (
    <div>
      <PageToolbar className={styles.toolbar}>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="domain">
            <Input placeholder="Input domain" />
          </Form.Item>
          <Button
            type="primary"
            ghost
            htmlType="submit"
            loading={searchLoading}
          >
            Search
          </Button>
        </Form>
        <Button
          className={styles.createBtn}
          type="primary"
          onClick={() => setCreateVisible(true)}
        >
          Create
        </Button>
      </PageToolbar>

      <PageMain>
        <Table
          dataSource={list}
          rowKey="uid"
          pagination={{
            total,
            showSizeChanger: true,
            onChange: (page, pageSize) => {
              setPageParams({
                page,
                pageSize: pageSize || pageParams.pageSize
              });
            }
          }}
          loading={listLoading}
        >
          <Column title="Domain" dataIndex="domain" />
          <Column
            title="Uid"
            dataIndex="uid"
            render={val => <Tag color="geekblue">{val}</Tag>}
          />
          <Column
            title="UpdatedAt"
            dataIndex="updatedAt"
            render={val => dayjs(val).format('YYYY-MM-DD HH:mm:ss Z')}
          />
          <Column
            title="Action"
            render={(_, record) => (
              <>
                <a className={styles.action}>Detail</a>
                <a className={styles.action}>Delete</a>
              </>
            )}
          />
        </Table>
      </PageMain>
      <CreateInstanceDialog
        visible={createVisible}
        onCancel={createInstanceCancel}
        onSubmit={createInstanceSubmit}
      />
    </div>
  );
};

export default InstanceList;
