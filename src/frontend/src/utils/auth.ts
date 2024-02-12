import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  ISignUpResult,
} from 'amazon-cognito-identity-js'

export type User = { [key: string]: string } // TODO: define user type

const userPool = new CognitoUserPool({
  UserPoolId: 'UserPoolId', // Your user pool id here
  ClientId: 'ClientId', // Your client id here
})

export const getCurrentUser = () => {
  return new Promise<User>((resolve, reject) => {
    const cognitoUser: CognitoUser | null = userPool.getCurrentUser()

    if (!cognitoUser) {
      reject(new Error('No user found'))

      return
    }

    cognitoUser.getSession((err: Error | null) => {
      if (err) {
        reject(err)

        return
      }

      cognitoUser.getUserAttributes((err, attributes) => {
        if (err) {
          reject(err)

          return
        }

        if (!attributes) {
          reject(new Error('No attributes found'))

          return
        }

        const userData: { [key: string]: string } = attributes.reduce(
          (acc: { [key: string]: string }, attribute: CognitoUserAttribute) => {
            acc[attribute.getName()] = attribute.getValue()

            return acc
          },
          {}
        )

        resolve({ ...userData, username: cognitoUser.getUsername() })
      })
    })
  })
}

export const signUp = async (username: string, email: string, password: string) => {
  const attributeList = [new CognitoUserAttribute({ Name: 'email', Value: email })]
  await new Promise<ISignUpResult>((resolve, reject) => {
    userPool.signUp(username, password, attributeList, [], (err, result) => {
      if (err || !result) {
        reject(err)

        return
      }
      resolve(result)
    })
  })
    .then((result) => {
      if (result && 'user' in result) {
        return result.user
      }
    })
    .catch((error) => {
      console.error(error)
      throw error
    })
}

export const signIn = (username: string, password: string) => {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    })

    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    })

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        resolve(result)
      },
      onFailure: (err) => {
        reject(err)
      },
    })
  })
}

export const signOut = () => {
  const cognitoUser = userPool.getCurrentUser()
  if (cognitoUser) {
    cognitoUser.signOut()
  }
}

export const confirmSignUp = (username: string, code: string) => {
  console.log(username, code)
  // Confirm sign up implementation
}

export const forgotPassword = (username: string) => {
  console.log(username)
  // Forgot password implementation
}

export const confirmPassword = (username: string, code: string, newPassword: string) => {
  console.log(username, code, newPassword)
  // Confirm password implementation
}

export const getSession = () => {
  // Get session implementation
}
