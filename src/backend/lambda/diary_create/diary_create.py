import json
import boto3
import os
import uuid
from datetime import datetime

def validate_input(body):
    # 必須フィールドの存在チェック
    required_fields = ['date', 'content']
    for field in required_fields:
        if field not in body:
            raise ValueError(f"必須フィールドがありません: {field}")
    
    # 日付形式の検証
    try:
        datetime.strptime(body['date'], '%Y-%m-%d')
    except ValueError:
        raise ValueError("不正な日付形式です。YYYY-MM-DDの形式を使用してください")

def lambda_handler(event, context):
    try:
        # DynamoDBリソースとテーブルの初期化
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(os.getenv('TABLE_NAME'))

        # リクエストボディのJSONをパース
        body = json.loads(event['body'])

        # 入力データのバリデーション
        validate_input(body)

        # ユーザーIDの取得（Cognitoアイデンティティ）
        user_id = event['requestContext']['identity']['cognitoIdentityId']
        date = body['date']
        diary_id = str(uuid.uuid4())  # ユニークなID生成
        content = body['content']
        is_deleted = False

        # DynamoDBに保存するアイテムの作成
        item = {
            'user_id': user_id,
            'date': date,
            'diary_id': diary_id,
            'content': content,
            'is_deleted': is_deleted,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }

        # DynamoDBにアイテムを保存
        table.put_item(Item=item)

        # 成功レスポンスの返却
        return {
            'statusCode': 201,
            'body': json.dumps('Success'),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    except ValueError as e:
        # バリデーションエラーの処理
        return {
            'statusCode': 400,
            'body': json.dumps({'error': str(e)}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    except Exception as e:
        # その他の予期せぬエラーの処理
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'サーバー内部エラーが発生しました'}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }