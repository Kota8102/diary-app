import json
import boto3
import os

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.getenv('TABLE_NAME'))

    # event['body'] を JSON として解析
    body = json.loads(event['body'])

    user_id = context.identity.cognito_identity_id
    date = body['date']
    new_content = body['content']

    try:
        # DynamoDB テーブルのアイテムを更新
        table.update_item(
            Key={
                'user_id': user_id,
                'date': date,
            },
            UpdateExpression="SET content = :new_content",
            ExpressionAttributeValues={
                ':new_content': new_content,
            }
        )

        return {
            'statusCode': 200,
            'body': json.dumps('Diary updated successfully'),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error updating diary: {str(e)}'),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
