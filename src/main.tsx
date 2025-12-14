import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid';
import './index.css'

// Polyfill for randomUUID in non-secure contexts
if (!self.crypto) {
  // @ts-ignore
  self.crypto = {};
}
if (!self.crypto.randomUUID) {
  self.crypto.randomUUID = () => uuidv4() as `${string}-${string}-${string}-${string}-${string}`;
}

import App from './App.js'
import CalendarTestPage from './pages/CalendarTestPage'
import MoneyPage from './pages/MoneyPage'
import { Auth } from './components/authorize/auth'

import { MatchingPage } from './pages/MatchingPage'
import { BattlePage } from './pages/BattlePage'
import { WebSocketProvider } from './hooks/useWebSocket'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebSocketProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<App />} />
        <Route path="/test/calendar" element={<CalendarTestPage />} />
        <Route path="/money" element={<MoneyPage />} />
        <Route path="/matching" element={<MatchingPage userId={null} />} />
        <Route path="/battle" element={<BattlePage userId={null} />} />
        <Route path="/test/auth" element={<Auth onLogin={(id) => console.log('Test Login ID:', id)} />} />
      </Routes>
    </BrowserRouter>
    </WebSocketProvider>
  </StrictMode>,
)
