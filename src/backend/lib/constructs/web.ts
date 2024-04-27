import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';

export class WebHostingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const logBucket = new s3.Bucket(this, 'LogBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enforceSSL: true,
      serverAccessLogsPrefix: 'log/',
    });

    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enforceSSL: true,
      serverAccessLogsBucket: logBucket,
      serverAccessLogsPrefix: 'WebHostingBucketLog/',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      websiteIndexDocument: 'index.html',
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
    });

    const distribution = new cloudfront.Distribution(this, 'WebDistribution', {
      defaultBehavior: {
        origin: new cloudfrontOrigins.S3Origin(websiteBucket, {
          originAccessIdentity: new cloudfront.OriginAccessIdentity(this, 'OAI')
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
    });

    const websiteBucketPolicyStatement = new cdk.aws_iam.PolicyStatement({
        actions: ["s3:GetObject"],
        effect: cdk.aws_iam.Effect.ALLOW,
        principals: [new cdk.aws_iam.ServicePrincipal("cloudfront.amazonaws.com")],
        resources: [`${websiteBucket.bucketArn}/*`],
        conditions: {
          StringEquals: {
            "AWS:SourceArn": `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
          },
        },
      });

    websiteBucket.addToResourcePolicy(websiteBucketPolicyStatement);
  }
}
