import * as cdk from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import { Construct } from 'constructs'
import { Api, Auth, Identity, Web } from './constructs'

interface BackendStackProps extends cdk.StackProps { }

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props)

    const logBucket = new s3.Bucket(this, 'LogBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enforceSSL: true,
      serverAccessLogsPrefix: 'log/',
    })

    // 環境変数の読み込み
    const isProd = process.env.ENVIRONMENT === 'prod'
    let certificate: acm.ICertificate | undefined
    let domainNames: string[] | undefined

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
    const auth = new Auth(this, 'Auth')

    const identity = new Identity(this, 'Identity', {
      userPool: auth.userPool,
      userPoolClient: auth.userPoolClient,
    })

    // API機能スタックのインスタンス化
    const api = new Api(this, 'Api')

    const web = new Web(this, 'Web', {
      userPool: auth.userPool,
      userPoolClient: auth.userPoolClient,
      identityPool: identity.identityPool,
      certificate,
      domainNames,
    })
  }
}