import React, { useRef, useState } from 'react';
import { Avatar, Button, Input, Spin, Tag, Typography } from 'antd';
import {
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

const SupportBotPanel: React.FC = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [askChatbot, { isLoading }] = useAskChatbotMutation();

  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    setInput('');
    const newTurn: ChatTurn = { question, isLoading: true };
    setHistory((prev) => [...prev, newTurn]);
    scrollToBottom();

    const mutationResult = await askChatbot({ question });

    if (mutationResult.error) {
      console.error('[Chatbot] API error:', mutationResult.error);
      const errData = (mutationResult.error as { data?: { message?: string }; status?: number });
      const errMsg = errData?.data?.message ?? `Lỗi ${errData?.status ?? 'kết nối'}. Vui lòng thử lại.`;
      setHistory((prev) =>
        prev.map((turn, i) =>
          i === prev.length - 1
            ? { question, answer: errMsg, isLoading: false }
            : turn,
        ),
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiBody = (mutationResult.data as any);
      const responseData = apiBody?.data ?? apiBody;
      setHistory((prev) =>
        prev.map((turn, i) =>
          i === prev.length - 1
            ? {
                question,
                answer: responseData?.answer ?? 'Không có phản hồi.',
                references: (responseData?.references ?? []).map((r: { title: string }) => r.title),
                isLoading: false,
              }
            : turn,
        ),
      );
    }

    scrollToBottom();
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#f8fcff] to-[#eef7ff]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#d9ebff] bg-white/90 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <Avatar size={44} className="!bg-[#012643]" icon={<RobotOutlined />} />
          <div>
            <Title level={4} className="!mb-0 !text-[#012643]">Trợ lý hỗ trợ EduNet</Title>
            <Text className="text-[#4a6885]">Hỏi bất cứ điều gì về EduNet</Text>
          </div>
        </div>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {history.length === 0 && (
          <div className="flex items-start gap-3 p-4 rounded-2xl border border-[#d6eaff] bg-white/90">
            <Avatar icon={<RobotOutlined />} className="!bg-[#2f7dc7] flex-shrink-0" />
            <div>
              <Text strong className="block text-[#0b3157]">Chào bạn, mình có thể giúp gì?</Text>
              <Text className="text-[#4f6d8a] block mt-1">
                Hãy gõ câu hỏi của bạn bên dưới để nhận hướng dẫn từ AI.
              </Text>
            </div>
          </div>
        )}

        {history.map((turn, index) => (
          <div key={index} className="space-y-3">
            {/* User question */}
            <div className="flex justify-end gap-2">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#012643] px-4 py-3 text-white shadow-sm">
                <Text className="!text-white">{turn.question}</Text>
              </div>
              <Avatar icon={<UserOutlined />} className="!bg-[#4a6885] flex-shrink-0" size={32} />
            </div>

            {/* Bot answer */}
            <div className="flex justify-start gap-2">
              <Avatar icon={<RobotOutlined />} className="!bg-[#2f7dc7] flex-shrink-0" size={32} />
              <div className="max-w-[86%] rounded-2xl rounded-bl-sm bg-white px-4 py-3 border border-[#d6eaff] shadow-sm">
                {turn.isLoading ? (
                  <Spin size="small" />
                ) : (
                  <>
                    <Text className="text-[#2f4e6d] whitespace-pre-wrap">{turn.answer}</Text>
                    {turn.references && turn.references.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {turn.references.map((ref) => (
                          <Tag key={ref} color="blue" className="!rounded-full !text-xs">{ref}</Tag>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-5 py-4 border-t border-[#d9ebff] bg-white/90 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={handleSend}
            placeholder="Nhập câu hỏi của bạn..."
            size="large"
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={isLoading}
            disabled={!input.trim()}
            className="!bg-[#012643] !border-[#012643]"
          />
        </div>
      </div>
    </div>
  );
};

export default SupportBotPanel;
