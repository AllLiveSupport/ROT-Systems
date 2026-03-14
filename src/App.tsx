import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Clock } from './components/Clock'

export default function App() {
  return (
    <BrowserRouter>
      <div className="m-0 p-0 min-h-screen bg-slate-950">
        <Routes>
          <Route path="/*" element={<Clock />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
