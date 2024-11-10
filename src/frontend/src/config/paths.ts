export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },

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
  },

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
    setting: {
      path: 'setting',
      getHref: () => '/app/setting',
    },
  },
} as const
