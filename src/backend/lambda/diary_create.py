# lambda/diary_handler.py
import boto3
import uuid

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('diary-contents-table')

    # Example payload
    user_id = event['user_id']
    date = event['date']
    diary_id = str(uuid.uuid4())
    content = event['content']
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
        'body': 'Success'
    }
