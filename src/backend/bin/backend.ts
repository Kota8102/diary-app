#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { Aspects } from 'aws-cdk-lib'
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag'
import { BackendStack } from '../lib/backend-stack'

const app = new cdk.App()

Aspects.of(app).add(new AwsSolutionsChecks())

const openAiApiKey = app.node.tryGetContext('openAiApiKey')
console.log(`OpenAIAPIKEY: ${openAiApiKey}`)

const backendStack = new BackendStack(app, 'BackendStack', {
  openAiApiKey: openAiApiKey,
})

NagSuppressions.addStackSuppressions(backendStack, [
  {
    id: 'AwsSolutions-COG3',
    reason: 'このプロジェクトではAdvancedSecurityModeをENFORCEDに設定する必要はないと判断した。',
  },
  {
    id: 'AwsSolutions-IAM5',
    reason: '暫定的にオフにしているが、本番環境では適切なIAMポリシーを設定すること。',
  },

  {
    id: 'AwsSolutions-L1',
    reason: 'CDKにより自動で作成されるLambdaに適用されてしまうため',
  },
  {
    id: 'AwsSolutions-IAM4',
    reason: 'CDKにより自動で作成されるLambdaに適用されてしまうため',
  },
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
    reason:
      'CloudFrontのロギングをオフにします。S3のパブリックアクセスをオフにしなければオンに出来無さそうでした',
  },
  {
    id: 'AwsSolutions-S5',
    reason: 'OAIの強制をオフにします。OACを使うので',
  },
  {
    id: 'AwsSolutions-COG4',
    reason: 'オーソライザーの要求を一時的にオフにします。(本番はON)',
  },
  {
    id: 'AwsSolutions-COG2',
    reason: 'CognitoでMFAは要求しません。',
  },
  {
    id: 'AwsSolutions-APIG4',
    reason: 'オーソライザーの要求を一時的にオフにします。(本番はON)',
  },
])
