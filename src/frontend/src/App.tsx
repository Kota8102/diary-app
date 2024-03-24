import { useState } from 'react'
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import reactLogo from './assets/react.svg'

import viteLogo from '/vite.svg'
import './App.css'

// Amplify.configure(
//   {
//   aws_project_region: import.meta.env.REACT_APP_AWS_PROJECT_REGION,
//   aws_cognito_region: import.meta.env.REACT_APP_AWS_COGNITO_REGION,
//   aws_user_pools_id: import.meta.env.REACT_APP_AWS_USER_POOLS_ID,
//   aws_user_pools_web_client_id:  import.meta.env.REACT_APP_AWS_USER_POOLS_CLIENT_ID,
//   }
// );
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolClientId: import.meta.env.REACT_APP_AWS_USER_POOLS_CLIENT_ID,
      userPoolId: import.meta.env.REACT_APP_AWS_USER_POOLS_ID,
      loginWith: { // Optional
        oauth: {
          domain: import.meta.env.REACT_APP_AWS_USER_POOL_DOMAIN,
          scopes: ['openid email phone profile aws.cognito.signin.user.admin '],
          redirectSignIn: ['http://localhost:3000/','https://example.com/'],
          redirectSignOut: ['http://localhost:3000/','https://example.com/'],
          responseType: 'code',
        },
        username: true,
        email: false, // Optional
        phone: false, // Optional
      }
    }
  }
});

const App = () => {
  const [count, setCount] = useState(0)

  return (
    <>
      <Authenticator>
      <div>
        <a
          href="https://vitejs.dev"
          target="_blank"
          rel="noreferrer">
          <img
            src={viteLogo}
            className="logo"
            alt="Vite logo"
          />
        </a>
        <a
          href="https://react.dev"
          target="_blank"
          rel="noreferrer">
          <img
            src={reactLogo}
            className="logo react"
            alt="React logo"
          />
        </a>
      </div>
      <h1>あVite + Reactあ</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more!!</p>
      </Authenticator>
    </>
  )
}

export default App
