import React, { FC, useCallback, useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { createInstance } from '@/services/instance';

export type CreateValues = {
  domain: string;
};

type InstanceCreateDialogProps = {
  visible: boolean;
  onSuccess: (values: CreateValues) => void;
  onCancel: () => void;
};

const InstanceCreateDialog: FC<InstanceCreateDialogProps> = ({
  visible,
  onSuccess: onSubmit,
  onCancel
}) => {
  const [form] = useForm();
  const [loading, setLoading] = useState<boolean>(false);

  const handleCreate = useCallback(async () => {
    await form.validateFields();
    const value = form.getFieldsValue() as CreateValues;
    try {
      setLoading(true);
      await createInstance(value);
      message.success('Create success');
      onSubmit(value);
    } finally {
      setLoading(false);
    }
  }, [form]);

  return (
    <Modal
      width="400px"
      title="Create instance"
      visible={visible}
      onCancel={onCancel}
      onOk={handleCreate}
      okText="Create"
      okButtonProps={{ loading }}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label="Domain"
          name="domain"
          rules={[{ required: true }, { type: 'url' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InstanceCreateDialog;
