import React, { useState } from 'react';
import { AuthLayout } from '../../../components/layout';
import { Input } from '../components';
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/cognito-auth';

export const ConfirmSignUp = () => {
  const { confirmSignUp } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate()

  const handleConfirmSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const result = await confirmSignUp(username, password, verificationCode);
    setIsLoading(false);
    if (result.success) {
      alert('メールアドレスの検証に成功しました！ログインしてください。')
      navigate('/auth/login');
    } else {
      setError(result.message);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col h-full p-5 gap-5">
        <h2 className="flex items-center justify-center p-20">メールアドレス検証</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleConfirmSignUp} className="space-y-7">
          <Input
            id="username"
            type="text"
            label="メールアドレス"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            id="password"
            type="password"
            label="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            id="verificationCode"
            type="text"
            label="検証コード"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-light-buttonPrimaryDefault p-2 rounded hover:bg-light-buttonPrimaryHover transition-colors duration-200">
            {isLoading ? '確認中...' : 'アカウントを確認'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};
