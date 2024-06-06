import React, { useState } from 'react';
import { MainLayout } from '../../../components/layout'
import { useAuth } from '../cognito-auth'; // useAuth フックが定義されているパスを確認してください。

export const SignUp = () => {
  const { signUp } = useAuth(); // useAuth フックから signUp 関数を取得
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const result = await signUp(username, password);
    setIsLoading(false);
    if (!result.success) {
      setError(result.message);
    } else {
      setError('');
      alert('登録成功！確認コードを入力してアカウントを有効化してください。');
    }
  };

  return (
    <MainLayout>
    <div className="sign-up-form">
      <h2>サインアップ</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSignUp}>
        <label htmlFor="username">メールアドレス</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <label htmlFor="password">パスワード</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? '登録中...' : 'サインアップ'}
        </button>
      </form>
    </div>
    </MainLayout>
  );
};
