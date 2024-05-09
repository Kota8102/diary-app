import json
import boto3
import os
import uuid

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.getenv('TABLE_NAME'))

    # event['body'] を JSON として解析
    body = json.loads(event['body'])

    user_id = body['user_id']
    date = body['date']
    diary_id = str(uuid.uuid4())
    content = body['content']
    is_deleted = False

    table.put_item(
        Item={
            'user_id': user_id,
            'date': date,
            'diary_id': diary_id,
            'content': content,
            'is_deleted': is_deleted
        }
    )

    return {
        'statusCode': 200,
        'body': json.dumps('Success')
    }
