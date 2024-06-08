import { Auth } from 'aws-amplify';

export const setAuthData = (user: unknown) => {
  localStorage.setItem('authData', JSON.stringify(user));
};

export const getAuthData = () => {
  const authData = localStorage.getItem('authData');

  return authData ? JSON.parse(authData) : null;
};

export const removeAuthData = () => {
  localStorage.removeItem('authData');
};

export const signIn = async (username: string, password: string) => {
  try {
    const user = await Auth.signIn(username, password);
    setAuthData(user);

    return true;
  } catch (error) {
    console.error('Error signing in', error);

    return false;
  }
};