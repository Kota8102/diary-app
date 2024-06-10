import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CloudFrontToS3 } from '@aws-solutions-constructs/aws-cloudfront-s3';
import { NodejsBuild } from 'deploy-time-build';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as waf from 'aws-cdk-lib/aws-wafv2';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as idPool from '@aws-cdk/aws-cognito-identitypool-alpha';


export interface WebProps {
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  identityPool: idPool.IdentityPool;
}

export class Web extends Construct {
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: WebProps) {
    super(scope, id);

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
        // REACT_APP_IDENTITY_POOL_ID: props.identityPool.identityPoolId,
        VITE_COGNITO_REGION: cdk.Stack.of(this).region,
        VITE_COGNITO_USER_POOL_ID: props.userPool.userPoolId,
        VITE_COGNITO_APP_USER_POOL_CLIENT_ID: props.userPoolClient.userPoolClientId,
      }
    });

    this.distribution = cloudFrontWebDistribution;
  }
}
