import { useState, useEffect } from 'react';
import { Card, Form, InputNumber, Button, message, Spin, Descriptions } from 'antd';
import { getConfig, updateConfig } from '../../api/config';

export default function Config() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await getConfig();
      setConfig(res.data);
      form.setFieldsValue(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfig(); }, []);

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await updateConfig(values);
      message.success('配置保存成功');
      fetchConfig();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 24px 0' }}>比赛信息设置</h2>
      <Spin spinning={loading}>
        <Card title="评分配置" style={{ maxWidth: 500, marginBottom: 24 }}>
          <Form form={form} layout="vertical">
            <Form.Item name="judgeCount" label="评委数量" rules={[{ required: true, message: '请输入评委数量' }]}>
              <InputNumber min={1} max={20} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="singerCount" label="选手数量">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleSave} loading={saving}>保存配置</Button>
            </Form.Item>
          </Form>
        </Card>

        {config && (
          <Card title="当前配置" style={{ maxWidth: 500 }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="评委数量">{config.judgeCount}</Descriptions.Item>
              <Descriptions.Item label="选手数量">{config.singerCount}</Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Spin>
    </div>
  );
}