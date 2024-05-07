import boto3
import os

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.getenv('TABLE_NAME'))

    # イベントから情報を取得
    user_id = event['user_id']
    date = event['date']

    try:
        # DynamoDB テーブルからアイテムをクエリ
        response = table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key('user_id').eq(user_id) &
                                   boto3.dynamodb.conditions.Key('date').eq(date)
        )
        
        items = response.get('Items', [])
        if not items:
            return {
                'statusCode': 404,
                'body': 'Diary entry not found'
            }

        return {
            'statusCode': 200,
            'body': items
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': f'Error reading diary: {str(e)}'
        }
