import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Modal, Input, Typography, App, Empty, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getSessions, createSession, deleteSession } from '../../api/session';
import { useSession } from '../../context/SessionContext';

const { Title } = Typography;

export default function SessionSelect() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { selectSession } = useSession();
  const { message } = App.useApp();

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await getSessions();
      setSessions(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleSelect = (session) => {
    selectSession(session.id, session.name);
    navigate('/singer');
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await createSession(newName.trim());
      message.success('场次创建成功');
      setNewName('');
      setModalOpen(false);
      await fetchSessions();
      // 直接进入新场次
      selectSession(res.data.id, res.data.name);
      navigate('/singer');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteSession(id);
    message.success('删除成功');
    fetchSessions();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('loggedIn');
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #5b3cc4 0%, #8b6fd4 50%, #3b1d8e 100%)',
    }}>
      <Card style={{ width: 480, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ color: '#5b3cc4', marginBottom: 4 }}>选择比赛场次</Title>
          <p style={{ color: '#999' }}>请选择或创建一场比赛</p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          onClick={() => setModalOpen(true)}
          style={{ marginBottom: 16 }}
        >
          创建新场次
        </Button>

        {sessions.length === 0 && !loading ? (
          <Empty description="暂无场次，请创建" />
        ) : (
          <div>
            {sessions.map((item) => (
              <div
                key={item.id}
                style={{
                  cursor: 'pointer',
                  padding: '12px 16px',
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.2s',
                }}
                onClick={() => handleSelect(item)}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f0edf7'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: 16 }}>{item.name}</span>
                <Popconfirm
                  title="确定删除此场次？所有评分数据将一并删除"
                  onConfirm={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                  onCancel={(e) => e.stopPropagation()}
                >
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button type="link" onClick={handleLogout}>退出登录</Button>
        </div>

        <Modal
          title="创建新场次"
          open={modalOpen}
          onOk={handleCreate}
          onCancel={() => setModalOpen(false)}
          confirmLoading={creating}
          destroyOnHidden
        >
          <Input
            placeholder="请输入场次名称，如：初赛、复赛、决赛"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onPressEnter={handleCreate}
          />
        </Modal>
      </Card>
    </div>
  );
}