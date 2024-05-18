import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Auth, Web, Identity, Api } from './constructs';

interface BackendStackProps extends cdk.StackProps { }

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const logBucket = new s3.Bucket(this, 'LogBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enforceSSL: true,
      serverAccessLogsPrefix: 'log/',
    });

    // 認証機能スタックのインスタンス化
    const auth = new Auth(this, 'Auth');

    const identity = new Identity(this, 'Identity', {
      userPool: auth.userPool,
      userPoolClient: auth.userPoolClient,
    })

    // API機能スタックのインスタンス化
    const apiStack = new Api(this, 'Api');

    const web = new Web(this, 'Web', {
      userPool: auth.userPool,
      userPoolClient: auth.userPoolClient,
      identityPool: identity.identityPool,
    });

  }
}