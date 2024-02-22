import { Link } from 'react-router-dom'
import reactLogo from '../../assets/react.svg'
import viteLogo from '/vite.svg'

const getGoogleAuthUrl = () => {
  const url = 'https://accounts.google.com/o/oauth2/v2/auth'
  const { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_REDIRECT_URI } = import.meta.env
  const queries = {
    client_id: VITE_GOOGLE_CLIENT_ID,
    redirect_uri: VITE_GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'].join(' '),
    prompt: 'consent',
    access_type: 'offline'
  }
  const queryString = new URLSearchParams(queries).toString()
  return `${url}?${queryString}`
}

console.log(getGoogleAuthUrl())

export default function Home() {
  const isAuthenticated = Boolean(localStorage.getItem('access_token'))
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.reload()
  }
  return (
    <>
      <div>
        <span href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </span>
        <span href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </span>
      </div>
      <h1>Vite + React</h1>

      {isAuthenticated ? (
        <div>
          <p className="read-the-docs">Hello my friend, you are logged in.</p>
          <button onClick={() => handleLogout()}>Logout</button>
        </div>
      ) : (
        <button>
          <Link to={getGoogleAuthUrl()}>Login with Google OAuth</Link>
        </button>
      )}
    </>
  )
}
