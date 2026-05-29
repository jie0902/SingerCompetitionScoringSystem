import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ConfigProvider, Layout, Menu, App as AntApp, Tag, Select } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  EditOutlined,
  TeamOutlined,
  LikeOutlined,
  TrophyOutlined,
  LogoutOutlined,
  SwapOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import { SessionProvider, useSession } from './context/SessionContext';
import { getSessions } from './api/session';
import Login from './pages/Login';
import SessionSelect from './pages/SessionSelect';
import SingerManagement from './pages/SingerManagement';
import IndividualScore from './pages/IndividualScore';
import GroupScore from './pages/GroupScore';
import PopularityScore from './pages/PopularityScore';
import Ranking from './pages/Ranking';
import Config from './pages/Config';
import UserManagement from './pages/UserManagement';

const { Sider, Content, Header } = Layout;

const allMenuItems = [
  { key: '/singer', icon: <UserOutlined />, label: '选手管理', roles: ['admin'] },
  { key: '/individual', icon: <EditOutlined />, label: '个人演唱评分', roles: ['admin', 'user'] },
  { key: '/group', icon: <TeamOutlined />, label: '组合演唱评分', roles: ['admin', 'user'] },
  { key: '/popularity', icon: <LikeOutlined />, label: '人气分数评分', roles: ['admin', 'user'] },
  { key: '/ranking', icon: <TrophyOutlined />, label: '分数一览', roles: ['admin', 'user'] },
  { key: '/config', icon: <SettingOutlined />, label: '比赛设置', roles: ['admin'] },
  { key: '/users', icon: <UsergroupAddOutlined />, label: '用户管理', roles: ['admin'] },
];

const adminOnlyPaths = ['/singer', '/config', '/users'];

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { sessionId, sessionName, selectSession, clearSession } = useSession();
  const [sessions, setSessions] = useState([]);

  const loggedIn = localStorage.getItem('loggedIn') === 'true';
  const role = localStorage.getItem('role') || 'admin';
  const username = localStorage.getItem('username');

  if (!loggedIn && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname === '/login') {
    if (loggedIn) {
      const defaultPath = role === 'admin' ? '/singer' : '/individual';
      return <Navigate to={sessionId ? defaultPath : '/select'} replace />;
    }
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (location.pathname === '/select') {
    if (sessionId) {
      const defaultPath = role === 'admin' ? '/singer' : '/individual';
      return <Navigate to={defaultPath} replace />;
    }
    return (
      <Routes>
        <Route path="/select" element={<SessionSelect />} />
        <Route path="*" element={<Navigate to="/select" replace />} />
      </Routes>
    );
  }

  if (!sessionId) {
    return <Navigate to="/select" replace />;
  }

  if (role === 'user' && adminOnlyPaths.includes(location.pathname)) {
    return <Navigate to="/individual" replace />;
  }

  const menuItems = allMenuItems
    .filter((item) => item.roles.includes(role))
    .map(({ key, icon, label }) => ({ key, icon, label }));

  const fetchSessions = async () => {
    try {
      const res = await getSessions();
      setSessions(res.data || []);
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('loggedIn');
    clearSession();
    navigate('/login');
  };

  const handleSwitchSession = (newId) => {
    const s = sessions.find((s) => s.id === newId);
    if (s) {
      selectSession(s.id, s.name);
      const defaultPath = role === 'admin' ? '/singer' : '/individual';
      navigate(defaultPath);
    }
  };

  const handleBackToSelect = () => {
    clearSession();
    navigate('/select');
  };

  const defaultPath = role === 'admin' ? '/singer' : '/individual';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ background: 'linear-gradient(180deg, #5b3cc4 0%, #3b1d8e 100%)' }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 18 : 20,
          fontWeight: 'bold',
          letterSpacing: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          {collapsed ? ' ' : '冠军之夜'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>
          <Tag color={role === 'admin' ? 'purple' : 'blue'} style={{ fontSize: 14, padding: '2px 12px' }}>
            {username}（{role === 'admin' ? '管理员' : '用户'}）
          </Tag>
          <Tag color="purple" style={{ fontSize: 14, padding: '2px 12px' }}>
            当前场次：{sessionName}
          </Tag>
          <Select
            size="small"
            style={{ width: 140 }}
            placeholder="切换场次"
            value={sessionId}
            onChange={handleSwitchSession}
            onClick={fetchSessions}
            options={sessions.map((s) => ({ label: s.name, value: s.id }))}
            suffixIcon={<SwapOutlined />}
          />
          <span style={{ cursor: 'pointer', color: '#5b3cc4' }} onClick={handleBackToSelect}>
            场次列表
          </span>
          <span style={{ cursor: 'pointer', color: '#999' }} onClick={handleLogout}>
            <LogoutOutlined /> 退出
          </span>
        </Header>
        <Content style={{ margin: 16, padding: 24, background: '#fff', borderRadius: 8, overflow: 'auto' }}>
          <Routes>
            <Route path="/singer" element={<SingerManagement />} />
            <Route path="/individual" element={<IndividualScore />} />
            <Route path="/group" element={<GroupScore />} />
            <Route path="/popularity" element={<PopularityScore />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/config" element={<Config />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="*" element={<Navigate to={defaultPath} replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#8064db',
          colorPrimaryBg: '#f0edf7',
          borderRadius: 6,
        },
        components: {
          Menu: {
            darkItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(255,255,255,0.2)',
            darkItemHoverBg: 'rgba(255,255,255,0.1)',
          },
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <SessionProvider>
            <AppLayout />
          </SessionProvider>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;