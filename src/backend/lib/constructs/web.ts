import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CloudFrontToS3 } from '@aws-solutions-constructs/aws-cloudfront-s3';
import { NodejsBuild } from 'deploy-time-build';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as waf from 'aws-cdk-lib/aws-wafv2';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as idPool from '@aws-cdk/aws-cognito-identitypool-alpha';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as agw from 'aws-cdk-lib/aws-apigateway'


export interface WebProps {
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  identityPool: idPool.IdentityPool;
  api: agw.RestApi;
}

export class Web extends Construct {
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: WebProps) {
    super(scope, id);

    // 環境変数に基づいて条件を設定
    const isProd = process.env.ENVIRONMENT === 'prod';
    let certificateArn: acm.ICertificate | undefined = undefined;
    let domainNames: string[] | undefined = undefined;

    if (isProd) {
      // 既存の証明書のARNを指定
      const existingCertificateArn = process.env.CERTIFICATE_ARN;
      if (typeof existingCertificateArn === 'string') { // ここでstring型であることを確認
        const certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', existingCertificateArn);
        certificateArn = certificate;
        domainNames = ['bouquet-note.com', '*.bouquet-note.com'];
      } else {
        console.error('CERTIFICATE_ARN environment variable is undefined.');
      }
    }

    const { cloudFrontWebDistribution, s3BucketInterface } = new CloudFrontToS3(this, 'Web', {
      insertHttpSecurityHeaders: false,
      bucketProps: {
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        encryption: s3.BucketEncryption.S3_MANAGED,
        enforceSSL: true,
        autoDeleteObjects: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
      loggingBucketProps: {
        objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
        autoDeleteObjects: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        serverAccessLogsPrefix: 'logs',
      },
      cloudFrontLoggingBucketProps: {
        objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
        autoDeleteObjects: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        serverAccessLogsPrefix: 'logs',
      },
      cloudFrontDistributionProps: {
        certificate: certificateArn, // 条件に基づいてSSL証明書を設定
        domainNames: domainNames, // 条件に基づいてドメイン名を設定
        geoRestriction: cloudfront.GeoRestriction.allowlist('JP'),
        errorResponses: [
          {
            httpStatus: 403,
            responsePagePath: '/index.html',
            responseHttpStatus: 200,
            ttl: cdk.Duration.seconds(0),
          }
        ],
      }
    });

    new NodejsBuild(this, 'WebBuild', {
      assets: [
        {
          path: '../../',
          exclude: ['.git', 'node_modules', 'docs', 'node_modules', 'src/backend', 'src/frontend/build', 'src/fontend/node_modules'],
        }
      ],
      destinationBucket: s3BucketInterface,
      distribution: cloudFrontWebDistribution,
      outputSourceDirectory: 'src/frontend/dist',
      buildCommands: [
        'npm install -w src/frontend',
        'npm run build -w src/frontend',
      ],
      buildEnvironment: {
        VITE_COGNITO_REGION: cdk.Stack.of(this).region,
        VITE_COGNITO_USER_POOL_ID: props.userPool.userPoolId,
        VITE_COGNITO_APP_USER_POOL_CLIENT_ID: props.userPoolClient.userPoolClientId,
        VITE_API_ENDPOINT: props.api.url,
      }
    });

    this.distribution = cloudFrontWebDistribution;
  }
}
