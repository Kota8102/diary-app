export const paths = {
  // 共通関連
  home: {
    path: '/',
    getHref: () => '/',
  },

  // 認証関連
  auth: {
    choice: {
      path: '/auth',
      getHref: () => '/auth',
    },
    terms: {
      path: '/auth/terms',
      getHref: () => '/auth/terms',
    },
    register: {
      path: '/auth/register',
      getHref: (redirectTo?: string | null | undefined) => `/auth/register${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    verifyEmail: {
      path: '/auth/verify-email',
      getHref: () => '/auth/verify-email',
    },
    login: {
      path: '/auth/login',
      getHref: (redirectTo?: string | null | undefined) => `/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    forgotPassword: {
      path: '/auth/forgot-password',
      getHref: () => '/auth/forgot-password',
    },
    resetPassword: {
      path: '/auth/reset-password',
      getHref: () => '/auth/reset-password',
    },
  },

  // アプリ関連
  app: {
    path: '/app',
    getHref: () => '/app/diary',
    calendar: {
      path: 'calendar',
      getHref: () => '/app/calendar',
    },
    diary: {
      path: 'diary',
      getHref: () => '/app/diary',
    },
    diaryDetail: {
      path: 'diary/:date',
      getHref: (date: string) => `/app/diary/${date}`,
    },
    diaryFlower: {
      path: 'diary/diary-flower/:date',
      getHref: (date: string) => `/app/diary/diary-flower/${date}`,
    },
    flower: {
      path: 'flower/:date',
      getHref: (date: string) => `/app/flower/${date}`,
    },
    setting: {
      path: 'setting',
      getHref: () => '/app/setting',
    },
  },
} as const
