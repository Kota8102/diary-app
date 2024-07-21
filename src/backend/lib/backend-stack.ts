import * as cdk from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import { Api, Auth, Identity, Web } from './constructs'

interface BackendStackProps extends cdk.StackProps {}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props)

    const logBucket = new s3.Bucket(this, 'LogBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enforceSSL: true,
      serverAccessLogsPrefix: 'log/',
    })

    // 認証機能スタックのインスタンス化
    const auth = new Auth(this, 'Auth')

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
  }
}
