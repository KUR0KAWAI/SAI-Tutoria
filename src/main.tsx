import ReactDOM from 'react-dom/client'
import { AuthProvider } from './auth/authContext'
import AppRouter from './router/AppRouter'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <AppRouter />
  </AuthProvider>,
)
