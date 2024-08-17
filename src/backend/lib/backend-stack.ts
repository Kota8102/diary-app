import * as cdk from 'aws-cdk-lib'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as s3 from 'aws-cdk-lib/aws-s3'
import type { Construct } from 'constructs'
import { Api, Auth, Identity, Web } from './constructs'

interface BackendStackProps extends cdk.StackProps {}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: BackendStackProps) {
    super(scope, id, props)

    const logBucket = new s3.Bucket(this, 'LogBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enforceSSL: true,
      serverAccessLogsPrefix: 'log/',
    })

    // 環境変数の読み込み 20240726cognito domain追加
    const isProd = process.env.ENVIRONMENT === 'prod'
    let certificate: acm.ICertificate | undefined
    let domainNames: string[] | undefined
    const cognitoDomain = isProd ? 'bouquet-note' : undefined

    if (isProd) {
      const existingCertificateArn = process.env.CERTIFICATE_ARN
      if (typeof existingCertificateArn === 'string') {
        certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', existingCertificateArn)
        domainNames = ['bouquet-note.com', '*.bouquet-note.com']
      } else {
        console.error('CERTIFICATE_ARN environment variable is undefined.')
      }
    }

    // 認証機能スタックのインスタンス化
    const auth = new Auth(this, 'Auth', { cognitoDomain })

    const identity = new Identity(this, 'Identity', {
      userPool: auth.userPool,
      userPoolClient: auth.userPoolClient,
    })

    // API機能スタックのインスタンス化
    const api = new Api(this, 'Api', {
      userPool: auth.userPool,
    })

    const web = new Web(this, 'Web', {
      userPool: auth.userPool,
      userPoolClient: auth.userPoolClient,
      identityPool: identity.identityPool,
      certificate,
      domainNames,
      api: api.api,
    })

    new cdk.CfnOutput(this, 'WebFrontend', {
      value: `https://${web.distribution.distributionDomainName}`,
    })

    new cdk.CfnOutput(this, 'IdentityPoolId', {
      value: identity.identityPool.identityPoolId,
    })

    new cdk.CfnOutput(this, 'CognitoUserPoolId', {
      value: auth.userPool.userPoolId,
    })

    new cdk.CfnOutput(this, 'CognitoUserPoolClientId', {
      value: auth.userPoolClient.userPoolClientId,
    })

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.api.url,
    })
  }
}
