import React, { useEffect, useRef, useState } from 'react';
import { Avatar, Button, Input, Spin, Tag, Typography } from 'antd';
import {
  ArrowLeftOutlined,
  RobotOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAskChatbotMutation } from '../../services/chatbotApi';

const { Text, Title } = Typography;

interface ChatTurn {
  question: string;
  answer?: string;
  references?: string[];
  isLoading?: boolean;
}

interface SupportBotPanelProps {
  onBack?: () => void;
}

const SupportBotPanel: React.FC<SupportBotPanelProps> = ({ onBack }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [askChatbot, { isLoading }] = useAskChatbotMutation();

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

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    setInput('');
    const newTurn: ChatTurn = { question, isLoading: true };
    setHistory((prev) => [...prev, newTurn]);
    scrollToBottom();

    const mutationResult = await askChatbot({ question });

    if (mutationResult.error) {
      const errData = mutationResult.error as { data?: { message?: string }; status?: number };
      const errMsg = errData?.data?.message ?? `Lỗi ${errData?.status ?? 'kết nối'}. Vui lòng thử lại.`;

      setHistory((prev) => prev.map((turn, index) => {
        if (index !== prev.length - 1) return turn;

        return {
          question,
          answer: errMsg,
          isLoading: false,
        };
      }));
    } else {
      const apiBody = mutationResult.data as {
        data?: {
          answer?: string;
          references?: Array<{ title: string }>;
        };
        answer?: string;
        references?: Array<{ title: string }>;
      };

      const responseData = apiBody?.data ?? apiBody;

      setHistory((prev) => prev.map((turn, index) => {
        if (index !== prev.length - 1) return turn;

        return {
          question,
          answer: responseData?.answer ?? 'Không có phản hồi.',
          references: (responseData?.references ?? []).map((ref) => ref.title),
          isLoading: false,
        };
      }));
    }

    scrollToBottom();
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-gradient-to-br from-[#f4fbff] via-[#eef8ff] to-white">
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

          <Avatar size={42} className="!bg-[#012643]" icon={<RobotOutlined />} />
          <div>
            <Title level={5} className="!mb-0 !text-[#012643]">Trợ lý hỗ trợ EduNet</Title>
            <Text className="text-xs text-[#6f8ca8]">Hỏi đáp nhanh về khóa học và hệ thống</Text>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6">
        {history.length === 0 && (
          <div className="rounded-2xl border border-[#d6eaf8] bg-white/90 p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-[#012643]">
              <Avatar icon={<RobotOutlined />} className="!bg-[#30C2EC]" size={28} />
              <Text strong>Xin chào, mình có thể giúp gì cho bạn?</Text>
            </div>
            <Text className="text-sm text-[#6f8ca8]">
              Bạn có thể hỏi về lộ trình học, cách dùng hệ thống hoặc các vấn đề kỹ thuật.
            </Text>
          </div>
        )}

        <div className="space-y-4">
          {history.map((turn, index) => (
            <div key={`${turn.question}-${index}`} className="space-y-2">
              <div className="flex justify-end gap-2">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-r from-[#012643] to-[#0b4a79] px-4 py-3 text-white shadow-sm">
                  <Text className="!text-white">{turn.question}</Text>
                </div>
                <Avatar icon={<UserOutlined />} size={30} className="!bg-[#30C2EC]" />
              </div>

              <div className="flex justify-start gap-2">
                <Avatar icon={<RobotOutlined />} size={30} className="!bg-[#30C2EC]" />
                <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-[#d6eaf8] bg-white px-4 py-3 shadow-sm">
                  {turn.isLoading ? (
                    <Spin size="small" />
                  ) : (
                    <>
                      <Text className="whitespace-pre-wrap text-[#234a6b]">{turn.answer}</Text>
                      {turn.references && turn.references.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {turn.references.map((ref) => (
                            <Tag key={ref} color="blue" className="!m-0 !rounded-full !text-[11px]">
                              {ref}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-[#d8ecf8] bg-white px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] md:px-5">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onPressEnter={handleSend}
            onFocus={() => scrollToBottom('auto')}
            placeholder="Nhập câu hỏi của bạn..."
            size="large"
            disabled={isLoading}
            className="!rounded-xl !border-[#cde7f8] !bg-[#f3fbff]"
          />
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={isLoading}
            disabled={!input.trim()}
            className="!rounded-xl !bg-[#012643] !border-[#012643] !shadow-none hover:!bg-[#023e6d] hover:!border-[#023e6d]"
          />
        </div>
      </div>
    </div>
  );
};

export default SupportBotPanel;
