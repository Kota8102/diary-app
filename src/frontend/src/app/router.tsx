import { useMemo } from 'react'

import { type QueryClient, useQueryClient } from '@tanstack/react-query'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import { paths } from '@/config/paths'

import { ProtectedRoute } from '@/lib/auth/auth'
import { AppRoot, AppRootErrorBoundary } from './routes/app/root'

export const createAppRouter = (_queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: '/',
      lazy: async () => {
        const { RootRoute } = await import('./routes/root')
        return { Component: RootRoute }
      },
    },
    // 認証選択ページ
    {
      path: paths.auth.choice.path,
      lazy: async () => {
        const { AuthChoiceRoute } = await import('./routes/auth/auth')
        return { Component: AuthChoiceRoute }
      },
    },
    // 利用規約ページ
    {
      path: paths.auth.terms.path,
      lazy: async () => {
        const { TermsRoute } = await import('./routes/auth/terms')
        return { Component: TermsRoute }
      },
    },
    // 新規登録ページ
    {
      path: paths.auth.register.path,
      lazy: async () => {
        const { RegisterRoute } = await import('./routes/auth/register')
        return { Component: RegisterRoute }
      },
    },
    // メールアドレス検証ページ
    {
      path: paths.auth.verifyEmail.path,
      lazy: async () => {
        const { VerifyEmailRoute } = await import('./routes/auth/verify-email')
        return { Component: VerifyEmailRoute }
      },
    },
    // ログインページ
    {
      path: paths.auth.login.path,
      lazy: async () => {
        const { LoginRoute } = await import('./routes/auth/login')
        return { Component: LoginRoute }
      },
    },
    // パスワード再設定ページ
    {
      path: paths.auth.forgotPassword.path,
      lazy: async () => {
        const { ForgotPasswordRoute } = await import('./routes/auth/forgot-password')
        return { Component: ForgotPasswordRoute }
      },
    },
    // パスワード再設定ページ
    {
      path: paths.auth.resetPassword.path,
      lazy: async () => {
        const { ResetPasswordRoute } = await import('./routes/auth/reset-password')
        return { Component: ResetPasswordRoute }
      },
    },

    // アプリルート
    {
      path: paths.app.path,
      element: (
        <ProtectedRoute>
          <AppRoot />
        </ProtectedRoute>
      ),
      ErrorBoundary: AppRootErrorBoundary,
      children: [
        // カレンダー
        {
          path: paths.app.calendar.path,
          lazy: async () => {
            const { CalendarRoute } = await import('./routes/app/calendar')
            return {
              Component: CalendarRoute,
            }
          },
          ErrorBoundary: AppRootErrorBoundary,
        },
        // 日記
        {
          path: paths.app.diary.path,
          lazy: async () => {
            const { DiaryRoute } = await import('./routes/app/diary/diary')
            return { Component: DiaryRoute }
          },
          ErrorBoundary: AppRootErrorBoundary,
        },
        // 日記作成
        {
          path: paths.app.diaryDetail.path,
          lazy: async () => {
            const { DiaryCreateRoute } = await import('./routes/app/diary/diary-create')
            return { Component: DiaryCreateRoute }
          },
          ErrorBoundary: AppRootErrorBoundary,
        },
        // 作成した花の表示
        {
          path: paths.app.diaryFlower.path,
          lazy: async () => {
            const { DisplayFlowerRoute } = await import('./routes/app/diary/diary-flower')
            return { Component: DisplayFlowerRoute }
          },
        },
        // 花の表示
        {
          path: `${paths.app.flower.path}`,
          lazy: async () => {
            const { FlowerRoute } = await import('./routes/app/flower')
            return { Component: FlowerRoute }
          },
        },
        // 花束
        {
          path: paths.app.bouquet.path,
          lazy: async () => {
            const { BouquetRoute } = await import('./routes/app/bouquet')
            return { Component: BouquetRoute }
          },
        },
        // 設定
        {
          path: paths.app.setting.path,
          lazy: async () => {
            const { SettingRoute } = await import('./routes/app/setting/setting')
            return { Component: SettingRoute }
          },
        },
        // パスワード変更
        {
          path: paths.app.changePassword.path,
          lazy: async () => {
            const { ChangePasswordRoute } = await import('./routes/app/setting/change-password')
            return { Component: ChangePasswordRoute }
          },
        },
      ],
    },

    {
      path: '*',
      lazy: async () => {
        const { NotFoundRoute } = await import('./routes/not-found')
        return { Component: NotFoundRoute }
      },
    },
  ])

export const AppRouter = () => {
  const queryClient = useQueryClient()

  const router = useMemo(() => createAppRouter(queryClient), [queryClient])

  return <RouterProvider router={router} />
}
