import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { store } from './store'
import App from './App'
import './index.css'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { fetchMe, setInitialized } from './store/authSlice'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

onAuthStateChanged(auth, (user) => {
  if (user) {
    store.dispatch(fetchMe())
  } else {
    store.dispatch(setInitialized())
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
)