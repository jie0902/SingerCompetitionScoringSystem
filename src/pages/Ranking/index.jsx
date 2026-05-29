import { useState, useEffect, useCallback } from 'react';
import { Tabs, Table, Tag, Spin, Button, message } from 'antd';
import { TrophyOutlined, DownloadOutlined } from '@ant-design/icons';
import { getRanking, exportRanking } from '../../api/ranking';
import { useSession } from '../../context/SessionContext';

const rankColors = ['#ff4d4f', '#ff7a45', '#ffa940', '#5b3cc4'];

export default function Ranking() {
  const { sessionId } = useSession();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('专业组');

  const fetchRanking = useCallback(async (category) => {
    setLoading(true);
    try {
      const res = await getRanking(sessionId, category);
      setData(res.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExport = async () => {
    try {
      const response = await exportRanking(sessionId, activeTab);
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `排名_${activeTab}_${new Date().toLocaleDateString()}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      message.success('导出成功');
    } catch {
      message.error('导出失败');
    }
  };

  useEffect(() => {
    fetchRanking(activeTab);
  }, [activeTab, fetchRanking]);

  const columns = [
    {
      title: '排名', dataIndex: 'rank', width: 70,
      render: (v) => {
        const color = v <= 3 ? rankColors[v - 1] : '#999';
        return (
          <span style={{ fontWeight: 'bold', fontSize: 18, color }}>
            {v <= 3 ? <TrophyOutlined style={{ marginRight: 4 }} /> : null}
            {v}
          </span>
        );
      },
      sorter: (a, b) => a.rank - b.rank,
      defaultSortOrder: 'ascend',
    },
    { title: '编号', dataIndex: 'singerNumber', width: 80 },
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '性别', dataIndex: 'gender', width: 60,
      render: (v) => <Tag color={v === '男' ? 'blue' : 'pink'}>{v}</Tag>
    },
    { title: '个人曲目', dataIndex: 'individualSong', width: 150 },
    { title: '所属组合', dataIndex: 'groupName', width: 100,
      render: (v) => v || '-'
    },
    { title: '合唱曲目', dataIndex: 'groupSong', width: 150,
      render: (v) => v || '-'
    },
    {
      title: '个人演唱均分', dataIndex: 'individualAvg', width: 120,
      render: (v) => <span className="avg-highlight">{v}</span>,
    },
    {
      title: '组合演唱均分', dataIndex: 'groupAvg', width: 120,
      render: (v) => <span className="avg-highlight">{v}</span>,
    },
    {
      title: '人气分数', dataIndex: 'popularityScore', width: 90,
      render: (v) => v != null ? v : '-',
    },
    {
      title: '总分', dataIndex: 'totalScore', width: 100,
      render: (v) => (
        <span style={{ fontWeight: 'bold', fontSize: 18, color: '#5b3cc4' }}>
          {v}
        </span>
      ),
      sorter: (a, b) => Number(a.totalScore) - Number(b.totalScore),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>
          <TrophyOutlined style={{ color: '#faad14', marginRight: 8 }} />
          分数一览
        </h2>
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
          导出Excel
        </Button>
      </div>
      <p style={{ color: '#999', marginBottom: 16 }}>
        计算公式：个人演唱均分 × 0.5 + 组合演唱均分 × 0.4 + 人气分数
      </p>
      <Tabs activeKey={activeTab} onChange={setActiveTab}
        items={[
          { key: '专业组', label: '专业组排名' },
          { key: '非专业组', label: '非专业组排名' },
        ]}
      />
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="singerId"
          scroll={{ x: 1200 }}
          pagination={false}
        />
      </Spin>
    </div>
  );
}