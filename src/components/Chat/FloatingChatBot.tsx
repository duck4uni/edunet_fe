import React, { useEffect, useRef, useState } from 'react';
import { Avatar, Button, Input, Spin, Tag, Typography } from 'antd';
import {
  CloseOutlined,
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

const FloatingChatBot: React.FC = () => {
  const [open, setOpen] = useState(false);
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
    if (open) scrollToBottom('auto');
  }, [open]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    setInput('');
    const newTurn: ChatTurn = { question, isLoading: true };
    setHistory((prev) => [...prev, newTurn]);
    scrollToBottom();

    const result = await askChatbot({ question });

    if (result.error) {
      const errData = result.error as { data?: { message?: string }; status?: number };
      const errMsg = errData?.data?.message ?? `Lỗi ${errData?.status ?? 'kết nối'}. Vui lòng thử lại.`;
      setHistory((prev) =>
        prev.map((turn, i) =>
          i !== prev.length - 1 ? turn : { question, answer: errMsg, isLoading: false }
        )
      );
    } else {
      const apiBody = result.data as {
        data?: { answer?: string; references?: Array<{ title: string }> };
        answer?: string;
        references?: Array<{ title: string }>;
      };
      const responseData = apiBody?.data ?? apiBody;
      setHistory((prev) =>
        prev.map((turn, i) =>
          i !== prev.length - 1
            ? turn
            : {
                question,
                answer: responseData?.answer ?? 'Không có phản hồi.',
                references: (responseData?.references ?? []).map((ref) => ref.title),
                isLoading: false,
              }
        )
      );
    }

    scrollToBottom();
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#012643] to-[#0b4a79] text-white shadow-lg shadow-[#012643]/40 transition-transform hover:scale-110 active:scale-95"
          title="Trợ lý EduNet"
        >
          <RobotOutlined style={{ fontSize: 24 }} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#30C2EC] text-[9px] font-bold text-white">AI</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] max-h-[calc(100dvh-80px)] w-[360px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-[#012643]/25">
          {/* Header */}
          <div className="flex shrink-0 items-center gap-3 border-b border-[#d8ecf8] bg-gradient-to-r from-[#012643] to-[#0b4a79] px-4 py-3">
            <Avatar size={36} className="!bg-[#30C2EC]" icon={<RobotOutlined />} />
            <div className="min-w-0 flex-1">
              <Title level={5} className="!mb-0 !text-white !leading-tight">Trợ lý EduNet</Title>
              <Text className="!text-[11px] !text-[#9dd4ef]">Hỏi đáp về khóa học &amp; hệ thống</Text>
            </div>
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => setOpen(false)}
              className="!text-white hover:!bg-white/20"
            />
          </div>

          {/* Messages */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-br from-[#f4fbff] via-[#eef8ff] to-white px-4 py-4">
            {history.length === 0 && (
              <div className="rounded-2xl border border-[#d6eaf8] bg-white/90 p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-[#012643]">
                  <Avatar icon={<RobotOutlined />} className="!bg-[#30C2EC]" size={26} />
                  <Text strong className="!text-sm">Xin chào, mình có thể giúp gì cho bạn?</Text>
                </div>
                <Text className="text-xs text-[#6f8ca8]">
                  Hỏi về lộ trình học, cách dùng hệ thống hoặc các vấn đề kỹ thuật.
                </Text>
              </div>
            )}

            <div className="space-y-4">
              {history.map((turn, index) => (
                <div key={`${turn.question}-${index}`} className="space-y-2">
                  {/* User bubble */}
                  <div className="flex justify-end gap-2">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-r from-[#012643] to-[#0b4a79] px-4 py-2.5 text-white shadow-sm">
                      <Text className="!text-sm !text-white">{turn.question}</Text>
                    </div>
                    <Avatar icon={<UserOutlined />} size={28} className="!shrink-0 !bg-[#30C2EC]" />
                  </div>

                  {/* Bot bubble */}
                  <div className="flex justify-start gap-2">
                    <Avatar icon={<RobotOutlined />} size={28} className="!shrink-0 !bg-[#30C2EC]" />
                    <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-[#d6eaf8] bg-white px-4 py-2.5 shadow-sm">
                      {turn.isLoading ? (
                        <Spin size="small" />
                      ) : (
                        <>
                          <Text className="!text-sm whitespace-pre-wrap text-[#234a6b]">{turn.answer}</Text>
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

          {/* Input */}
          <div className="shrink-0 border-t border-[#d8ecf8] bg-white px-3 py-3">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPressEnter={handleSend}
                placeholder="Nhập câu hỏi..."
                disabled={isLoading}
                className="!rounded-xl !border-[#cde7f8] !bg-[#f3fbff]"
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={isLoading}
                disabled={!input.trim()}
                className="!rounded-xl !border-[#012643] !bg-[#012643] !shadow-none hover:!border-[#023e6d] hover:!bg-[#023e6d]"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatBot;
