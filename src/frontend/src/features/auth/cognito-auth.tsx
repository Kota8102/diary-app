import React, {createContext, useContext, useEffect, useState} from 'react';
import {Auth, Amplify} from 'aws-amplify';


const AwsConfigAuth = {
  region: import.meta.env.VITE_COGNITO_REGION,
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  userPoolWebClientId: import.meta.env.VITE_COGNITO_WEB_CLIENT_ID,
  authenticationFlowType: 'USER_SRP_AUTH',
}

Amplify.configure({Auth: AwsConfigAuth});

interface UseAuth {
  isLoading: boolean;
  isAuthenticated: boolean;
  username: string;
  currentAuthenticatedUser: () => Promise<any>;
  signUp: (username: string, password: string) => Promise<Result>;
  confirmSignUp: (verificationCode: string) => Promise<Result>;
  signIn: (username: string, password: string) => Promise<Result>;
  signInComplete: (username: string, oldPassword: string, newPassword: string) => Promise<Result>;
  signOut: () => void;
  changePassword: (user: any, oldPassword: string, newPassword: string, newPasswordConfirm: string) => Promise<Result>;
  forgetPassword: (email: string) => Promise<Result>;
  resetPassword: (username: string, code: string, newPassword: string, newPasswordConfirm: string) => Promise<Result>;
}

interface Result {
  success: boolean
  message: string
  hasChallenge?: boolean
  challengeName?: string
}

const authContext = createContext({} as UseAuth);

export const ProvideAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
};

export const useAuth = () => {
  return useContext(authContext);
};

const useProvideAuth = (): UseAuth => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((result) => {
        setUsername(result.username);
        setIsAuthenticated(true);
        setIsLoading(false);
      })
      .catch(() => {
        setUsername('');
        setIsAuthenticated(false);
        setIsLoading(false);
      });
  }, []);

  const signUp = async (username, password) => {
    try {
      const result = await Auth.signUp({
        username,
        password,
        attributes: {
          // 必要な追加属性があればここに追記
          email: username,  // 仮に email として username を使う場合
        }
      });
      console.log('サインアップ成功:', result);
      return { success: true, message: '' };
    } catch (error) {
      console.error('サインアップエラー:', error);
      return { success: false, message: error.message || 'サインアップに失敗しました。' };
    }
  };  

  const confirmSignUp = async (verificationCode: string) => {
    try {
      await Auth.confirmSignUp(username, verificationCode);
      const result = await signIn(username, password);
      setPassword('');
      return result;
    } catch (error) {
      return {
        success: false,
        message: '認証に失敗しました。',
      };
    }
  };

  const signIn = async (username: string, password: string): Promise<Result> => {
    try {
      const result = await Auth.signIn(username, password);
      const hasChallenge = Object.prototype.hasOwnProperty.call(result, 'challengeName')
      setUsername(result.username);
      setIsAuthenticated(true);
      if (hasChallenge) {
        const challengeName = result.challengeName
        return {success: true, message: '', hasChallenge: true, challengeName};
      }
      return {success: true, message: '', hasChallenge: false}
    } catch (error) {
      return {
        success: false,
        message: '認証に失敗しました。',
      };
    }
  };

  const signInComplete = async (username: string, oldPassword: string, newPassword: string) => {
    try {
      const user = await Auth.signIn(username, oldPassword)
      await Auth.completeNewPassword(user, newPassword, user.challengeParam.requiredAttributes)
      return {
        success: true,
        message: ""
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "InvalidParameterException" || error.name === "InvalidPasswordException") {
          return {
            success: false,
            message: 'パスワードは英字/数字組み合わせの8桁以上で入力してください。',
          };

        } else if (error.name === "NotAuthorizedException") {
          return {
            success: false,
            message: 'パスワードが間違っています。',
          };

        } else if (error.name === "ExpiredCodeException") {
          return {
            success: false,
            message: '仮パスワードの有効期限が切れています。カスタマーサポートへご連絡ください。',
          };

        } else if (error.name === "AuthError") {
          return {
            success: false,
            message: 'メールアドレスとパスワードを入力してください。',
          };

        } else if (error.name === "UserNotFoundException") {
          return {
            success: false,
            message: 'メールアドレスまたはパスワードが正しくありません。',
          };

        }
      }
      return {
        success: false,
        message: '予期せぬエラーが発生しました。',
      };
    }
  }

  const signOut = async () => {
    try {
      await Auth.signOut();
      setUsername('');
      setIsAuthenticated(false);
      return {success: true, message: ''};
    } catch (error) {
      return {
        success: false,
        message: 'ログアウトに失敗しました。',
      };
    }
  };

  const changePassword = async (user: any, oldPassword: string, newPassword: string, newPasswordConfirm: string) => {
    try {
      if (newPassword === newPasswordConfirm) {
        await Auth.changePassword(user, oldPassword, newPassword);
        return {
          success: true,
          message: '',
        };
      } else {
        return {
          success: false,
          message: '入力した新規パスワードが一致しません。もう一度入力してください。',
        };
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "NotAuthorizedException") {
          return {
            success: false,
            message: '現在のパスワードが間違っています。',
          };
        } else if (error.name === "LimitExceededException") {
          return {
            success: false,
            message: 'しばらく時間を置いて再度試してください。',
          };
        } else if (error.name === "InvalidPasswordException") {
          return {
            success: false,
            message: 'パスワードは英字（小文字必須）/数字組み合わせの8桁以上で入力してください。',
          };
        } else if (error.name === "InvalidParameterException") {
          return {
            success: false,
            message: 'パスワードを入力してください。',
          };
        }
      }
      return {
        success: false,
        message: 'パスワードを入力してください。',
      };
    }
  }

  const forgetPassword = async (email: string) => {
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (regex.test(email)) {

      try {
        await Auth.forgotPassword(email)
        return {
          success: true,
          message: '',
        }

      } catch (error) {
        return {
          success: false,
          message: '予期せぬエラーが発生しました',
        }

      }
    } else {
      return {
        success: false,
        message: 'メールアドレスの形式で入力してください',
      };
    }
  }

  const resetPassword = async (username: string, code: string, newPassword: string, newPasswordConfirm: string) => {
    if (newPassword !== newPasswordConfirm) {
      return {
        success: false,
        message: '入力した新規パスワードが一致しません。もう一度入力してください。'
      }
    }
    try {
      await Auth.forgotPasswordSubmit(username, code, newPassword);
      return {
        success: true,
        message: ""
      }

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "InvalidParameterException" || error.name === "InvalidPasswordException") {
          return {
            success: false,
            message: 'パスワードは英字（小文字必須）/数字組み合わせの8桁以上で入力してください。',
          };
        } else if (error.name === "AuthError" || error.name === "ExpiredCodeException" || error.name === "LimitExceededException") {
          if (error.message === "Confirmation code cannot be empty") {
            return {
              success: false,
              message: 'コードを入力してください。',
            };
          } else {
            return {
              success: false,
              message: 'コードの有効期限が切れています。再度プロフィール画面から「編集」をクリックしてください。',
            };
          }
        } else if (error.name === "CodeMismatchException") {
          return {
            success: false,
            message: 'コードが間違っています。',
          };
        }
      }
      return {
        success: false,
        message: "予期せぬエラーが発生しました"
      }
    }
  }

  return {
    isLoading,
    isAuthenticated,
    username,
    currentAuthenticatedUser: () => Auth.currentAuthenticatedUser(),
    signUp,
    confirmSignUp,
    signIn,
    signInComplete,
    signOut,
    changePassword,
    forgetPassword,
    resetPassword
  };
};
