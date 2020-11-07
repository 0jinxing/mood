import React, { useEffect, useState } from 'react';
import PageMain from '@/components/PageMain';
import { EventItem, queryEvent, QueryEventListParams } from '@/services/event';
import pagination, { Conditions } from '@/utils/pagination';
import { message, Table } from 'antd';

type QueryParams = Conditions<QueryEventListParams>;

const { Column } = Table;

const EventList = () => {
  const [listLoading, setListLoading] = useState(false);

  const [pageParams, setPageParams] = useState({ page: 1, pageSize: 5 });
  const [params, setParams] = useState<QueryParams>({});

  const [total, setTotal] = useState(0);
  const [list, setList] = useState<EventItem[]>([]);

  const queryList = async () => {
    setListLoading(true);
    try {
      const data = await queryEvent({ ...params, ...pagination(pageParams) });
      setTotal(data.total);
      setList(data.list);
    } catch (e) {
      message.error(e.message || 'Unknown error');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    queryList();
  }, [pageParams, params]);

  return (
    <div>
      <PageMain>
        <Table dataSource={list} rowKey="_id">
          <Column title="Uid" dataIndex="uid"></Column>
          <Column title="Session" dataIndex="session"></Column>
        </Table>
      </PageMain>
    </div>
  );
};

export default EventList;
