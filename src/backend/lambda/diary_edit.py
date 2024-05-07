import boto3
import os

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.getenv('TABLE_NAME'))

    # イベントから情報を取得
    user_id = event['user_id']
    date = event['date']
    new_content = event['content']

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
            'body': 'Diary updated successfully'
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': f'Error updating diary: {str(e)}'
        }
