import * as idPool from '@aws-cdk/aws-cognito-identitypool-alpha'
import type * as cognito from 'aws-cdk-lib/aws-cognito'
import { Construct } from 'constructs'

export interface IdentityProps {
  userPool: cognito.UserPool
  userPoolClient: cognito.UserPoolClient
}

export class Identity extends Construct {
  public readonly identityPool: idPool.IdentityPool

  constructor(scope: Construct, id: string, props: IdentityProps) {
    super(scope, id)

    const identityPool = new idPool.IdentityPool(this, 'IdentityPool', {
      authenticationProviders: {
        userPools: [
          new idPool.UserPoolAuthenticationProvider({
            userPool: props.userPool,
            userPoolClient: props.userPoolClient,
          }),
        ],
      },
    })

    this.identityPool = identityPool
  }
}
