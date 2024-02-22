import './App.css'
import useRouter from './router/useRouter'

function App() {
  const routeElements = useRouter()
  return <>{routeElements}</>
}

export default App
