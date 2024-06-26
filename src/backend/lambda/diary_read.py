import json
import boto3
import os

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.getenv('TABLE_NAME'))

    # event['queryStringParameters'] から情報を取得
    user_id = event['queryStringParameters']['user_id']
    date = event['queryStringParameters']['date']

    try:
        # DynamoDB テーブルからアイテムをクエリ
        response = table.get_item(
            Key={
                'user_id': user_id,
                'date': date,
            }
        )
        item = response.get('Item')

        if not item:
            return {
                'statusCode': 404,
                'body': json.dumps('Diary entry not found')
            }

        return {
            'statusCode': 200,
            'body': json.dumps(item)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error reading diary: {str(e)}')
        }
