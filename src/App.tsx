import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import AppNotification from './components/common/AppNotification';

const App: React.FC = () => {
  return (
    <>
      <AppNotification />
      <RouterProvider router={router} />
      <style>{`
        .app-notify-root {
          position: fixed;
          top: 18px;
          right: 18px;
          z-index: 3000;
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: min(380px, calc(100vw - 24px));
          pointer-events: none;
        }

        .app-notify-item {
          pointer-events: auto;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border-radius: 10px;
          border: 1px solid #d0d5dd;
          background: #ffffff;
          box-shadow: 0 12px 24px rgba(16, 24, 40, 0.12);
          padding: 10px 12px;
          color: #101828;
          font-size: 13px;
          line-height: 20px;
        }

        .app-notify-item .app-notify-icon {
          margin-top: 1px;
          font-size: 16px;
          line-height: 1;
        }

        .app-notify-item.is-success .app-notify-icon {
          color: #16a34a;
        }

        .app-notify-item.is-error .app-notify-icon {
          color: #dc2626;
        }

        .app-notify-item.is-info .app-notify-icon {
          color: #30c2ec;
        }

        .app-notify-item.is-warning .app-notify-icon {
          color: #d97706;
        }

        .app-notify-content {
          flex: 1;
          word-break: break-word;
        }

        .app-notify-close {
          border: 0;
          background: transparent;
          color: #667085;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }

        .app-notify-close:hover {
          color: #344054;
        }
      `}</style>
    </>
  );
};

export default App;
