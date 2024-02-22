import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  useEffect(() => {
    const access_token = searchParams.get('access_token')
    const refresh_token = searchParams.get('refresh_token')
    const new_user = searchParams.get('newUser')
    const verify = searchParams.get('verify')
    console.log('🐻 ~ useEffect ~ verify:', verify)
    console.log('🐻 ~ useEffect ~ new_user:', new_user)
    // Đây là trường hợp login còn trường hợp register chưa code dựa vào new_user và verify để biết user là mới hay cũ và đã verify hay chưa
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    navigate('/')
  }, [searchParams, navigate])
  return <div>Login</div>
}
