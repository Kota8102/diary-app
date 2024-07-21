/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_COGNITO_REGION: string;
  readonly VITE_COGNITO_USER_POOL_ID: string;
  readonly VITE_COGNITO_APP_USER_POOL_CLIENT_ID: string;
  readonly VITE_API_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}