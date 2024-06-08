/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_COGNITO_REGION: string;
  readonly VITE_COGNITO_USER_POOL_ID: string;
  readonly VITE_COGNITO_WEB_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}