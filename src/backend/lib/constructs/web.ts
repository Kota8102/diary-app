import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';

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

    const cfnOriginAccessControl = new cdk.aws_cloudfront.CfnOriginAccessControl(
      this,
      "OriginAccessControl",
      {
        originAccessControlConfig: {
          name: "OriginAccessControlForAppBucket",
          originAccessControlOriginType: "s3",
          signingBehavior: "always",
          signingProtocol: "sigv4",
          description: "S3 Access Control",
        },
      }
    );

    const distribution =new cdk.aws_cloudfront.Distribution(this, 'distro', {
      defaultBehavior: {
        origin: new cdk.aws_cloudfront_origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cdk.aws_cloudfront.ViewerProtocolPolicy.HTTPS_ONLY
      },
      defaultRootObject: "index.html",
      geoRestriction: cdk.aws_cloudfront.GeoRestriction.allowlist('US', 'JP'),
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

    const cfnDistribution = distribution.node.defaultChild as cdk.aws_cloudfront.CfnDistribution
    cfnDistribution.addPropertyOverride('DistributionConfig.Origins.0.OriginAccessControlId', cfnOriginAccessControl.getAtt('Id'))
    cfnDistribution.addPropertyOverride('DistributionConfig.Origins.0.DomainName', websiteBucket.bucketRegionalDomainName)
    cfnDistribution.addOverride('Properties.DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity', "")
    cfnDistribution.addPropertyDeletionOverride('DistributionConfig.Origins.0.CustomOriginConfig')

    NagSuppressions.addStackSuppressions(this, [
      {
        id: 'AwsSolutions-CFR2',
        reason: '暫定的にオフにしているが、本番環境では必要に応じてWAFの導入も行う。',
       },
       {
        id: 'AwsSolutions-CFR4',
        reason: 'カスタムドメインが必要になるので暫定的にオフにします',
       }, 
       {
        id: 'AwsSolutions-CFR5',
        reason: 'カスタムドメインが必要になるので暫定的にオフにします',
       }, 
       {
        id: 'AwsSolutions-CFR3',
        reason: 'CloudFrontのロギングをオフにします。S3のパブリックアクセスをオフにしなければオンに出来無さそうでした',
       },
       {
        id: 'AwsSolutions-S5',
        reason: 'OAIの強制をオフにします。OACを使うので',
       },
    ])
  }
}
