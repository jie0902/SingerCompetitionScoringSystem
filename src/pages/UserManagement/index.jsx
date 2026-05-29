import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/user';
import { getSessions } from '../../api/session';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [form] = Form.useForm();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await getSessions();
      setSessions(res.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchUsers();
    fetchSessions();
  }, [fetchUsers]);

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: 'user', sessionIds: [] });
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      username: record.username,
      role: record.role,
      sessionIds: record.sessionIds || [],
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      message.success('删除成功');
      fetchUsers();
    } catch {}
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await updateUser(editingUser.id, values);
        message.success('更新成功');
      } else {
        await createUser(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      fetchUsers();
    } catch {}
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '用户名', dataIndex: 'username', width: 150 },
    {
      title: '角色', dataIndex: 'role', width: 100,
      render: (v) => (
        <span style={{ color: v === 'admin' ? '#5b3cc4' : '#666', fontWeight: v === 'admin' ? 'bold' : 'normal' }}>
          {v === 'admin' ? '管理员' : '用户'}
        </span>
      ),
    },
    {
      title: '可评分场次', dataIndex: 'sessionIds', width: 250,
      render: (ids) => {
        if (!ids || ids.length === 0) return <Tag color="red">无权限</Tag>;
        return ids.map((sid) => {
          const s = sessions.find((s) => s.id === sid);
          return <Tag key={sid} color="blue">{s ? s.name : sid}</Tag>;
        });
      },
    },
    { title: '创建时间', dataIndex: 'createTime', width: 180 },
    {
      title: '操作', width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除此用户？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>
          <UsergroupAddOutlined style={{ color: '#5b3cc4', marginRight: 8 }} />
          用户管理
        </h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增用户
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: 800 }}
      />
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label={editingUser ? '密码' : '密码'}
            rules={editingUser ? [] : [{ required: true, min: 6, message: '密码至少6位' }]}
          >
            <Input.Password placeholder={editingUser ? ' ' : '请输入密码'} />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select
              options={[
                { label: '管理员', value: 'admin' },
                { label: '用户', value: 'user' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="sessionIds"
            label="可评分场次"
            help="不选择则该用户无法评分任何场次"
          >
            <Select
              mode="multiple"
              placeholder="选择可评分的场次（留空=无权限）"
              options={sessions.map((s) => ({ label: s.name, value: s.id }))}
              allowClear
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
