import { useState, useEffect } from 'react';
import { Table, InputNumber, Button, message, Spin, Tag } from 'antd';
import { getPopularityScores, savePopularityScores } from '../../api/score';
import { useSession } from '../../context/SessionContext';

export default function PopularityScore() {
  const { sessionId } = useSession();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const res = await getPopularityScores(sessionId);
      const data = (res.data || []).map(singer => ({
        ...singer,
        popScore: singer.scores?.[0]?.score ?? null,
      }));
      data.sort((a, b) => Number(a.singerNumber) - Number(b.singerNumber));
      setScores(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScores(); }, []);

  const handleScoreChange = (singerId, value) => {
    setScores(prev => prev.map(s => {
      if (s.singerId !== singerId) return s;
      return { ...s, popScore: value };
    }));
  };

  const handleSave = async () => {
    const payload = {};
    scores.forEach(s => {
      if (s.popScore != null) {
        payload[s.singerId] = Number(s.popScore);
      }
    });
    setSaving(true);
    try {
      await savePopularityScores(sessionId, payload);
      message.success('保存成功');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: '编号', dataIndex: 'singerNumber', width: 100 },
    { title: '姓名', dataIndex: 'name', width: 120 },
    { title: '性别', dataIndex: 'gender', width: 70,
      render: (v) => <Tag color={v === '男' ? 'blue' : 'pink'}>{v}</Tag>
    },
    { title: '个人组别', dataIndex: 'individualCategory', width: 100,
      render: (v) => <Tag color={v === '专业组' ? 'gold' : 'green'}>{v}</Tag>
    },
    {
      title: '人气分数 (0-10)', width: 180,
      render: (_, record) => (
        <InputNumber
          min={0}
          max={10}
          step={0.001}
          precision={3}
          value={record.popScore}
          onChange={(v) => handleScoreChange(record.singerId, v)}
          placeholder="人气分"
          style={{ width: 120 }}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>人气分数评分（满分10分）</h2>
        <Button type="primary" onClick={handleSave} loading={saving}>保存评分</Button>
      </div>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={scores}
          rowKey="singerId"
          pagination={false}
        />
      </Spin>
    </div>
  );
}