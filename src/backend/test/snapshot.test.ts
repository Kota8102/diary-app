import * as cdk from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import { expect, test } from 'vitest'
import { serializer } from './snapshot-plugin'

import * as Backendstack from '../lib/backend-stack'

test('Snapshot test', () => {
  const app = new cdk.App()

  const stack = new Backendstack.BackendStack(app, 'CdkSampleStack')

  const template = Template.fromStack(stack)

  expect.addSnapshotSerializer(serializer) // シリアライザーを追加
  expect(template).toMatchSnapshot()
})
