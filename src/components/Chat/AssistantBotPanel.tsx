import React, { useEffect, useRef, useState } from 'react';
import { Avatar, Button, Drawer, Input, Spin, Tag, Typography } from 'antd';
import {
  ArrowLeftOutlined,
  BookOutlined,
  CalendarOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
  SearchOutlined,
  SendOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAskAssistantMutation } from '../../services/personalAssistantApi';

const { Text, Title } = Typography;

interface ChatTurn {
  question: string;
  answer?: string;
  intent?: string;
  isLoading?: boolean;
}

interface AssistantBotPanelProps {
  onBack?: () => void;
}

const quickActions = [
  { label: 'Khóa học của tôi', icon: <BookOutlined />, question: 'Khóa học của tôi' },
  { label: 'Bài tập', icon: <FileTextOutlined />, question: 'Bài tập của tôi' },
  { label: 'Lịch học', icon: <CalendarOutlined />, question: 'Lịch học của tôi' },
  { label: 'Deadline', icon: <CalendarOutlined />, question: 'Deadline sắp tới' },
  { label: 'Điểm số', icon: <TrophyOutlined />, question: 'Điểm của tôi' },
  { label: 'Tiến độ', icon: <TrophyOutlined />, question: 'Tiến độ học tập' },
  { label: 'Tìm khóa học', icon: <SearchOutlined />, question: 'Tìm khóa học' },
  { label: 'Gợi ý', icon: <QuestionCircleOutlined />, question: 'Gợi ý khóa học cho tôi' },
];

const AssistantBotPanel: React.FC<AssistantBotPanelProps> = ({ onBack }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [showGuide, setShowGuide] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [askAssistant, { isLoading }] = useAskAssistantMutation();

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
    }, 50);
  };

  useEffect(() => {
    const handleViewportResize = () => {
      const activeElement = document.activeElement as HTMLElement | null;
      if (activeElement && activeElement.tagName.toLowerCase() === 'input') {
        scrollToBottom('auto');
      }
    };
    window.visualViewport?.addEventListener('resize', handleViewportResize);
    window.visualViewport?.addEventListener('scroll', handleViewportResize);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportResize);
      window.visualViewport?.removeEventListener('scroll', handleViewportResize);
    };
  }, []);

  const handleSend = async (questionOverride?: string) => {
    const question = (questionOverride ?? input).trim();
    if (!question || isLoading) return;

    if (!questionOverride) setInput('');
    const newTurn: ChatTurn = { question, isLoading: true };
    setHistory((prev) => [...prev, newTurn]);
    scrollToBottom();

    const result = await askAssistant({ question });

    if (result.error) {
      const errData = result.error as { data?: { message?: string }; status?: number };
      const errMsg = errData?.data?.message ?? `Lỗi ${errData?.status ?? 'kết nối'}. Vui lòng thử lại.`;
      setHistory((prev) =>
        prev.map((turn, i) =>
          i !== prev.length - 1 ? turn : { question, answer: errMsg, isLoading: false },
        ),
      );
    } else {
      const responseData = (result.data as any)?.data;
      setHistory((prev) =>
        prev.map((turn, i) =>
          i !== prev.length - 1
            ? turn
            : {
                question,
                answer: responseData?.answer ?? 'Không có phản hồi.',
                intent: responseData?.intent,
                isLoading: false,
              },
        ),
      );
    }

    scrollToBottom();
  };

  const formatAnswer = (text: string) => {
    // Convert **bold** to <strong>
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-gradient-to-br from-[#f4fbff] via-[#eef8ff] to-white">
      {/* Header */}
      <div className="shrink-0 border-b border-[#d8ecf8] bg-white/90 px-4 py-3 backdrop-blur md:px-5">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              type="text"
              shape="circle"
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              className="!text-[#5f7e9d] hover:!bg-[#30C2EC]/15 hover:!text-[#012643]"
            />
          )}
          <Avatar size={42} className="!bg-gradient-to-br !from-[#012643] !to-[#0b5e9e]" icon={<RobotOutlined />} />
          <div className="flex-1">
            <Title level={5} className="!mb-0 !text-[#012643]">Trợ lý học tập</Title>
            <Text className="text-xs text-[#6f8ca8]">Hỏi về khóa học, bài tập, lịch học, điểm số...</Text>
          </div>
          <Button
            type="text"
            shape="circle"
            icon={<QuestionCircleOutlined />}
            onClick={() => setShowGuide(true)}
            title="Hướng dẫn sử dụng"
            className="!text-[#5f7e9d] hover:!bg-[#30C2EC]/15 hover:!text-[#012643]"
          />
        </div>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6">
        {history.length === 0 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#d6eaf8] bg-white/90 p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-[#012643]">
                <Avatar icon={<RobotOutlined />} className="!bg-[#30C2EC]" size={28} />
                <Text strong>Xin chào! Mình là trợ lý học tập cá nhân của bạn 👋</Text>
              </div>
              <Text className="text-sm text-[#6f8ca8]">
                Mình có thể giúp bạn xem khóa học, bài tập, lịch học, điểm số, tìm kiếm khóa học và nhiều hơn nữa. Hãy chọn nhanh bên dưới hoặc gõ câu hỏi!
              </Text>
            </div>

            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => handleSend(action.question)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#d5e9f8] bg-white px-3 py-1.5 text-xs font-medium text-[#2d5f8a] shadow-sm transition hover:border-[#30C2EC] hover:bg-[#30C2EC]/10 hover:text-[#012643]"
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {history.map((turn, index) => (
            <div key={`${turn.question}-${index}`} className="space-y-2">
              {/* User message */}
              <div className="flex justify-end gap-2">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-r from-[#012643] to-[#0b4a79] px-4 py-3 text-white shadow-sm">
                  <Text className="!text-white">{turn.question}</Text>
                </div>
                <Avatar icon={<UserOutlined />} size={30} className="!bg-[#30C2EC]" />
              </div>

              {/* Bot response */}
              <div className="flex justify-start gap-2">
                <Avatar icon={<RobotOutlined />} size={30} className="!bg-[#30C2EC]" />
                <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-[#d6eaf8] bg-white px-4 py-3 shadow-sm">
                  {turn.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Spin size="small" />
                      <Text className="text-xs text-[#8aa7be]">Đang tìm kiếm thông tin...</Text>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {turn.intent && (
                        <Tag
                          color="blue"
                          className="!mb-1 !rounded-full !text-[10px]"
                        >
                          {intentLabel(turn.intent)}
                        </Tag>
                      )}
                      <div className="whitespace-pre-wrap text-[#234a6b] text-sm leading-relaxed">
                        {formatAnswer(turn.answer ?? '')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-[#d8ecf8] bg-white px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] md:px-5">
        {history.length > 0 && (
          <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
            {quickActions.slice(0, 4).map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => handleSend(action.question)}
                disabled={isLoading}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#e3f0fa] bg-[#f5fbff] px-2.5 py-1 text-[11px] text-[#5a8aab] transition hover:border-[#30C2EC] hover:text-[#012643] disabled:opacity-50"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={() => handleSend()}
            onFocus={() => scrollToBottom('auto')}
            placeholder="Hỏi về khóa học, bài tập, lịch học..."
            size="large"
            disabled={isLoading}
            className="!rounded-xl !border-[#cde7f8] !bg-[#f3fbff]"
          />
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            onClick={() => handleSend()}
            loading={isLoading}
            disabled={!input.trim()}
            className="!rounded-xl !bg-[#012643] !border-[#012643] !shadow-none hover:!bg-[#023e6d] hover:!border-[#023e6d]"
          />
        </div>
      </div>

      {/* Guide Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <QuestionCircleOutlined className="text-[#30C2EC]" />
            <span className="text-[#012643]">Hướng dẫn sử dụng</span>
          </div>
        }
        placement="right"
        width={320}
        onClose={() => setShowGuide(false)}
        open={showGuide}
        styles={{ body: { padding: '16px' } }}
      >
        <div className="space-y-5 text-sm text-[#234a6b]">
          <div>
            <p className="mb-2 font-semibold text-[#012643]">🎯 Trợ lý có thể giúp bạn:</p>
            <ul className="space-y-1.5 pl-1">
              {[
                ['📚', 'Xem danh sách khóa học đang học'],
                ['📝', 'Kiểm tra bài tập còn hạn'],
                ['📅', 'Xem lịch học trong tuần'],
                ['⏰', 'Nhắc deadline sắp tới'],
                ['🏆', 'Xem điểm số và kết quả quiz'],
                ['📊', 'Theo dõi tiến độ học tập'],
                ['📂', 'Xem tài liệu khóa học'],
                ['🔍', 'Tìm kiếm khóa học theo tên'],
                ['💡', 'Gợi ý khóa học phù hợp'],
                ['👤', 'Xem thông tin hồ sơ cá nhân'],
              ].map(([icon, text]) => (
                <li key={text} className="flex items-start gap-2">
                  <span>{icon}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 font-semibold text-[#012643]">💬 Ví dụ câu hỏi:</p>
            <div className="space-y-2">
              {[
                'Khóa học của tôi là gì?',
                'Tôi có bài tập nào chưa nộp?',
                'Lịch học tuần này của tôi',
                'Deadline gần nhất là khi nào?',
                'Điểm quiz của tôi thế nào?',
                'Tiến độ học tập của tôi',
                'Tìm khóa học lập trình',
                'Gợi ý khóa học cho tôi',
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => { setShowGuide(false); handleSend(q); }}
                  className="w-full rounded-lg border border-[#d5e9f8] bg-[#f5fbff] px-3 py-2 text-left text-xs text-[#2d5f8a] transition hover:border-[#30C2EC] hover:bg-[#e8f6ff]"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#fde8c0] bg-[#fffbf2] p-3">
            <p className="font-semibold text-[#a06800]">💡 Mẹo:</p>
            <p className="mt-1 text-[#7a5200]">Bạn có thể gõ tự do bằng tiếng Việt — trợ lý sẽ hiểu và tìm thông tin phù hợp cho bạn!</p>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

function intentLabel(intent: string): string {
  const map: Record<string, string> = {
    my_courses: 'Khóa học',
    my_assignments: 'Bài tập',
    my_schedule: 'Lịch học',
    my_progress: 'Tiến độ',
    my_quizzes: 'Kiểm tra',
    my_grades: 'Điểm số',
    my_materials: 'Tài liệu',
    upcoming_deadlines: 'Deadline',
    search_courses: 'Tìm kiếm',
    course_detail: 'Chi tiết khóa',
    categories: 'Danh mục',
    course_recommendations: 'Gợi ý',
    my_profile: 'Hồ sơ',
    help: 'Trợ giúp',
  };
  return map[intent] ?? intent;
}

export default AssistantBotPanel;
