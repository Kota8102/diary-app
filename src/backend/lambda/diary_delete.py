import boto3
import os

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.getenv('TABLE_NAME'))

    # イベントから情報を取得
    user_id = event['user_id']
    date = event['date']

    try:
        # DynamoDB テーブルからアイテムを削除
        response = table.delete_item(
            Key={
                'user_id': user_id,
                'date': date
            }
        )

        # 削除が成功したかどうかを確認
        if response.get('ResponseMetadata', {}).get('HTTPStatusCode') == 200:
            return {
                'statusCode': 200,
                'body': 'Diary entry deleted successfully'
            }
        else:
            return {
                'statusCode': 500,
                'body': 'Error deleting diary entry'
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': f'Error deleting diary: {str(e)}'
        }
