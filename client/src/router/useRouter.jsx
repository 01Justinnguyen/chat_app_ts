import Home from '../components/Home'
import Login from '../components/Login'
import { useRoutes } from 'react-router-dom'
export default function useRouter() {
  const routeElement = useRoutes([
    {
      path: '/login/oauth',
      element: <Login />
    },
    { path: '/', element: <Home /> }
  ])
  return routeElement
}
