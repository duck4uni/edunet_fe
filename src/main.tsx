import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { ConfigProvider } from 'antd'
import { store } from './redux/store'
import './index.css'
import './assets/styles/app.css'
import App from './App.tsx'

const BRAND_PRIMARY = '#30C2EC'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: BRAND_PRIMARY,
          colorInfo: BRAND_PRIMARY,
          colorLink: BRAND_PRIMARY,
        },
      }}
    >
      <Provider store={store}>
        <App />
      </Provider>
    </ConfigProvider>
  </StrictMode>,
)
