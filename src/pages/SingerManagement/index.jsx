import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getSingerPage, saveSinger, updateSinger, deleteSinger } from '../../api/singer';

export default function SingerManagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSinger, setEditingSinger] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchData = async (pageNum = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await getSingerPage({ pageNum, pageSize });
      setData(res.data.records);
      setPagination({ current: res.data.current, pageSize: res.data.size, total: res.data.total });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = () => {
    setEditingSinger(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingSinger(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteSinger(id);
    message.success('删除成功');
    fetchData(pagination.current, pagination.pageSize);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editingSinger) {
      await updateSinger({ ...values, id: editingSinger.id });
      message.success('更新成功');
    } else {
      await saveSinger(values);
      message.success('添加成功');
    }
    setModalOpen(false);
    fetchData(pagination.current, pagination.pageSize);
  };

  const columns = [
    { title: '编号', dataIndex: 'singerNumber', width: 100 },
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '性别', dataIndex: 'gender', width: 70,
      render: (v) => <Tag color={v === '男' ? 'blue' : 'pink'}>{v}</Tag>
    },
    { title: '个人曲目', dataIndex: 'individualSong', width: 150 },
    { title: '个人组别', dataIndex: 'individualCategory', width: 100,
      render: (v) => <Tag color={v === '专业组' ? 'gold' : 'green'}>{v}</Tag>
    },
    { title: '合唱组别', dataIndex: 'groupSingingCategory', width: 100,
      render: (v) => v ? <Tag color={v === '专业组' ? 'gold' : 'green'}>{v}</Tag> : '-'
    },
    { title: '所属组合', dataIndex: 'groupName', width: 100 },
    { title: '合唱曲目', dataIndex: 'groupSong', width: 150 },
    {
      title: '操作', width: 150, fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>选手管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加选手</Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1100 }}
        pagination={pagination}
        onChange={(p) => fetchData(p.current, p.pageSize)}
      />
      <Modal
        title={editingSinger ? '编辑选手' : '添加选手'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="singerNumber" label="选手编号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="性别" rules={[{ required: true }]}>
            <Select options={[{ label: '男', value: '男' }, { label: '女', value: '女' }]} />
          </Form.Item>
          <Form.Item name="individualSong" label="个人演唱曲目">
            <Input />
          </Form.Item>
          <Form.Item name="individualCategory" label="个人组别" rules={[{ required: true }]}>
            <Select options={[{ label: '专业组', value: '专业组' }, { label: '非专业组', value: '非专业组' }]} />
          </Form.Item>
          <Form.Item name="groupSingingCategory" label="合唱组别">
            <Select options={[{ label: '专业组', value: '专业组' }, { label: '非专业组', value: '非专业组' }]} allowClear />
          </Form.Item>
          <Form.Item name="groupName" label="所属组合">
            <Input placeholder="如：组合一" />
          </Form.Item>
          <Form.Item name="groupSong" label="合唱曲目">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}