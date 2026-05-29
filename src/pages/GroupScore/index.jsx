import { useState, useEffect, useCallback } from 'react';
import { Tabs, Table, InputNumber, Button, message, Spin, Tag } from 'antd';
import { getGroupScores, saveGroupScores } from '../../api/score';
import { getConfig } from '../../api/config';
import { useSession } from '../../context/SessionContext';

export default function GroupScore() {
  const { sessionId } = useSession();
  const [judgeCount, setJudgeCount] = useState(5);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('专业组');

  useEffect(() => {
    getConfig().then(res => {
      if (res.data?.judgeCount) setJudgeCount(res.data.judgeCount);
    }).catch(() => {});
  }, []);

  const fetchScores = useCallback(async (category) => {
    setLoading(true);
    try {
      const res = await getGroupScores(sessionId, category);
      const data = (res.data || []).map(singer => {
        const scoreMap = {};
        (singer.scores || []).forEach(s => {
          scoreMap[s.judgeNumber] = s.score;
        });
        return { ...singer, scoreMap };
      });
      const chnNumMap = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
      data.sort((a, b) => {
        const groupOrder = (g) => {
          if (!g) return 999;
          const m = g.match(/第([一二三四五六七八九十]+)组/);
          return m && chnNumMap[m[1]] ? chnNumMap[m[1]] : 999;
        };
        const ga = groupOrder(a.groupName);
        const gb = groupOrder(b.groupName);
        if (ga !== gb) return ga - gb;
        return Number(a.singerNumber) - Number(b.singerNumber);
      });
      setScores(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores(activeTab);
  }, [activeTab, fetchScores]);

  const handleScoreChange = (singerId, judgeNum, value) => {
    setScores(prev => prev.map(s => {
      if (s.singerId !== singerId) return s;
      return { ...s, scoreMap: { ...s.scoreMap, [judgeNum]: value } };
    }));
  };

  const calcAvg = (scoreMap) => {
    const vals = Object.values(scoreMap || {}).filter(v => v !== null && v !== undefined && v !== '');
    if (vals.length === 0) return '-';
    const sum = vals.reduce((a, b) => a + Number(b), 0);
    return (sum / vals.length).toFixed(3);
  };

  const handleSave = async () => {
    const payload = scores.map(s => ({
      singerId: s.singerId,
      scores: Array.from({ length: judgeCount }, (_, i) => ({
        judgeNumber: i + 1,
        score: s.scoreMap?.[i + 1] != null ? Number(s.scoreMap[i + 1]) : null,
      })),
    }));
    setSaving(true);
    try {
      await saveGroupScores(sessionId, payload);
      message.success('保存成功');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: '编号', dataIndex: 'singerNumber', width: 70, fixed: 'left' },
    { title: '姓名', dataIndex: 'name', width: 100, fixed: 'left' },
    { title: '性别', dataIndex: 'gender', width: 60, fixed: 'left',
      render: (v) => <Tag color={v === '男' ? 'blue' : 'pink'}>{v}</Tag>
    },
    { title: '所属组合', dataIndex: 'groupName', width: 100,
      render: (v) => <Tag color="purple">{v}</Tag>
    },
    { title: '合唱曲目', dataIndex: 'groupSong', width: 180, ellipsis: true,
      render: (v) => <span title={v}>{v}</span>
    },
    ...Array.from({ length: judgeCount }, (_, i) => ({
      title: `评委${i + 1}`,
      width: 100,
      render: (_, record) => (
        <InputNumber
          className="score-input"
          min={0}
          max={100.000}
          step={0.001}
          precision={3}
          value={record.scoreMap?.[i + 1]}
          onChange={(v) => handleScoreChange(record.singerId, i + 1, v)}
          placeholder="分数"
        />
      ),
    })),
    {
      title: '平均分', width: 80, fixed: 'right',
      render: (_, record) => <span className="avg-highlight">{calcAvg(record.scoreMap)}</span>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>组合演唱评分</h2>
        <Button type="primary" onClick={handleSave} loading={saving}>保存评分</Button>
      </div>
      <Tabs activeKey={activeTab} onChange={setActiveTab}
        items={[
          { key: '专业组', label: '专业组' },
          { key: '非专业组', label: '非专业组' },
        ]}
      />
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={scores}
          rowKey="singerId"
          scroll={{ x: 510 + judgeCount * 100 }}
          pagination={false}
        />
      </Spin>
    </div>
  );
}
