import json
import boto3
import os

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.getenv('TABLE_NAME'))

    # event['body'] を JSON として解析
    body = json.loads(event['body'])

    # イベントから情報を取得
    user_id = context.identity.cognito_identity_id
    date = body['date']

    try:
        # DynamoDB テーブルからアイテムを削除
        response = table.delete_item(
            Key={
                'user_id': user_id,
                'date': date,
            }
        )

        return {
            'statusCode': 200,
            'body': json.dumps('Diary entry deleted successfully')
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error deleting diary: {str(e)}')
        }
