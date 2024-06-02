
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../cognito-auth';
import { MainLayout } from '../../../components/layout'
// import { Button } from '../../../components/Elements/Button';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(event)
    alert(event)
    const result = await signIn(username, password);
    if (result.success) {
      navigate('/'); // ログイン成功後のリダイレクト先
    } else {
      alert(result.message);
    }
  };

  return (
    <MainLayout>
    <div className="flex flex-col items-center justify-center h-full">
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="username">ユーザー名</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border px-2 py-1"
          />
        </div>
        <div>
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border px-2 py-1"
          />
        </div>
        <button type="submit">ログイン</button>
      </form>
    </div>
    </MainLayout>
  );
};