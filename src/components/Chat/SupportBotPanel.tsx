import React, { useMemo, useState } from 'react';
import { Avatar, Button, Card, Select, Tag, Typography } from 'antd';
import {
  CustomerServiceOutlined,
  MessageOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;

type SupportTopic = {
  id: string;
  label: string;
  category: string;
  answer: string[];
  relatedTopicIds?: string[];
};

type ConversationTurn = {
  topicId: string;
  askedAt: string;
};

const SUPPORT_TOPICS: SupportTopic[] = [
  {
    id: 'enroll-status',
    label: 'Kiem tra trang thai dang ky khoa hoc',
    category: 'Khoa hoc',
    answer: [
      'Ban vao Khoa hoc cua toi de xem trang thai pending, active hoac completed.',
      'Neu khoa hoc dang o pending, hay cho admin duyet hoac lien he giang vien.',
      'Neu can gap, ban co the tao ticket trong muc Ho tro de duoc xu ly nhanh.',
    ],
    relatedTopicIds: ['schedule-empty', 'payment-guide'],
  },
  {
    id: 'schedule-empty',
    label: 'Vi sao Lich hoc khong hien du lieu',
    category: 'Lich hoc',
    answer: [
      'Lich hoc ca nhan chi hien cac khoa hoc ma ban da duoc kich hoat dang ky.',
      'He thong chi lay cac buoi hoc tu hom nay tro di va bo qua buoi da huy.',
      'Hay kiem tra lai tai khoan dang nhap va thu tai lai trang de dong bo token.',
    ],
    relatedTopicIds: ['enroll-status', 'contact-support'],
  },
  {
    id: 'payment-guide',
    label: 'Huong dan thanh toan khoa hoc',
    category: 'Thanh toan',
    answer: [
      'Tai trang chi tiet khoa hoc, bam nut Dang ky va chon hinh thuc thanh toan.',
      'Sau khi thanh toan thanh cong, he thong se cap nhat trang thai khoa hoc tu dong.',
      'Neu da tru tien nhung chua duoc kich hoat, hay gui ma giao dich cho bo phan ho tro.',
    ],
    relatedTopicIds: ['enroll-status', 'contact-support'],
  },
  {
    id: 'contact-support',
    label: 'Lien he ho tro truc tiep',
    category: 'Ho tro',
    answer: [
      'Ban co the gui yeu cau tai trang Ho tro trong he thong.',
      'Khi gui ticket, vui long mo ta ro van de, kem email tai khoan va anh chup man hinh neu co.',
      'Thoi gian phan hoi thong thuong tu 5 den 30 phut trong gio hanh chinh.',
    ],
    relatedTopicIds: ['schedule-empty', 'payment-guide'],
  },
  {
    id: 'reset-password',
    label: 'Huong dan quen mat khau',
    category: 'Tai khoan',
    answer: [
      'Tai man hinh dang nhap, chon Quen mat khau va nhap email da dang ky.',
      'Kiem tra email de nhan lien ket dat lai mat khau.',
      'Neu khong nhan duoc email, hay kiem tra thu muc spam hoac lien he ho tro.',
    ],
    relatedTopicIds: ['contact-support'],
  },
];

const QUICK_TOPIC_IDS = ['schedule-empty', 'enroll-status', 'payment-guide', 'contact-support'];

const SupportBotPanel: React.FC = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>();
  const [history, setHistory] = useState<ConversationTurn[]>([]);

  const topicMap = useMemo(() => {
    return new Map(SUPPORT_TOPICS.map(topic => [topic.id, topic]));
  }, []);

  const pushTopicToHistory = (topicId: string) => {
    const topic = topicMap.get(topicId);
    if (!topic) return;

    setSelectedTopicId(topicId);
    setHistory(prev => [
      ...prev,
      {
        topicId,
        askedAt: new Date().toISOString(),
      },
    ]);
  };

  const handleSelectTopic = (topicId: string) => {
    pushTopicToHistory(topicId);
  };

  const topicOptions = SUPPORT_TOPICS.map(topic => ({
    value: topic.id,
    label: topic.label,
  }));

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#f8fcff] to-[#eef7ff]">
      <div className="px-5 py-4 border-b border-[#d9ebff] bg-white/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Avatar
            size={44}
            className="!bg-[#012643]"
            icon={<RobotOutlined />}
          />
          <div>
            <Title level={4} className="!mb-0 !text-[#012643]">Tro ly ho tro EduNet</Title>
            <Text className="text-[#4a6885]">Chon cau hoi de nhan huong dan nhanh</Text>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 bg-white border-b border-[#e5f1ff]">
        <Select
          value={selectedTopicId}
          onChange={handleSelectTopic}
          options={topicOptions}
          placeholder="Chon van de ban dang gap"
          showSearch
          optionFilterProp="label"
          size="large"
          className="w-full"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_TOPIC_IDS.map(topicId => {
            const topic = topicMap.get(topicId);
            if (!topic) return null;

            return (
              <Button
                key={topic.id}
                onClick={() => pushTopicToHistory(topic.id)}
                icon={<ThunderboltOutlined />}
                className="!rounded-full !border-[#9ec8ff] !text-[#0b4a85]"
              >
                {topic.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {history.length === 0 && (
          <Card className="rounded-2xl border-[#d6eaff] bg-white/90">
            <div className="flex items-start gap-3">
              <Avatar icon={<CustomerServiceOutlined />} className="!bg-[#2f7dc7]" />
              <div>
                <Text strong className="block text-[#0b3157]">Chao ban, minh co the giup gi?</Text>
                <Text className="text-[#4f6d8a] block mt-1">
                  Hay chon mot cau hoi o tren de xem huong dan tu dong theo tung tinh huong.
                </Text>
              </div>
            </div>
          </Card>
        )}

        {history.map((turn, index) => {
          const topic = topicMap.get(turn.topicId);
          if (!topic) return null;

          return (
            <div key={`${turn.topicId}-${index}`} className="space-y-3">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#012643] px-4 py-3 text-white shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageOutlined />
                    <Text className="!text-white !font-medium">{topic.label}</Text>
                  </div>
                  <Text className="!text-white/80 text-xs">Ban vua chon</Text>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="max-w-[86%] rounded-2xl rounded-bl-sm bg-white px-4 py-3 border border-[#d6eaff] shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <RobotOutlined className="text-[#2f7dc7]" />
                    <Text strong className="text-[#0b3157]">Tra loi tu tro ly</Text>
                    <Tag color="blue" className="!rounded-full !ml-1">{topic.category}</Tag>
                  </div>

                  <ul className="list-disc pl-5 space-y-1 text-[#2f4e6d]">
                    {topic.answer.map(step => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>

                  {topic.relatedTopicIds && topic.relatedTopicIds.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {topic.relatedTopicIds.map(relatedId => {
                        const related = topicMap.get(relatedId);
                        if (!related) return null;

                        return (
                          <Button
                            key={related.id}
                            size="small"
                            onClick={() => pushTopicToHistory(related.id)}
                            className="!rounded-full !border-[#bddbff] !text-[#0b4a85]"
                          >
                            {related.label}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SupportBotPanel;
