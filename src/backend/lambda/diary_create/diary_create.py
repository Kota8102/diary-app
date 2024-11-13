import json
import logging
import os
import uuid
from datetime import datetime
import base64
from botocore.exceptions import ClientError

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def validate_input(body):
    # 必須フィールドの存在チェック
    required_fields = ["date", "content"]
    for field in required_fields:
        if field not in body:
            raise ValueError(f"必須フィールドがありません: {field}")

    # 日付形式の検証
    try:
        datetime.strptime(body["date"], "%Y-%m-%d")
    except ValueError:
        raise ValueError("不正な日付形式です。YYYY-MM-DDの形式を使用してください")

def get_img_from_s3(flower_id): 
    """
    S3から画像を取得する

    Args:
        user_id (str): ユーザーID
        date (str): 日付

    Returns:
        str: 画像のバイナリデータ
    """

    s3 = boto3.client("s3")
    bucket_name = os.environ["BUCKET_NAME"]
    s3_key = f"flowers/{flower_id}.png"

    try:
        response = s3.get_object(Bucket=bucket_name, Key=s3_key)
        body = response["Body"].read()
        logger.info(f"Image fetched from S3: {s3_key}")
        return base64.b64encode(body).decode("utf-8")
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchKey":
            logger.info(f"Image not found: {s3_key}")
            return None
        logger.error(f"S3 operation failed: {e}")
        raise
    except Exception as e:
        logger.error(f"Error processing S3 response: {e}")
        return None

def lambda_handler(event, context):
    try:
        # DynamoDBリソースとテーブルの初期化
        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.Table(os.getenv("TABLE_NAME"))

        # リクエストボディのJSONをパース
        body = json.loads(event["body"])

        # 入力データのバリデーション
        validate_input(body)
        logger.info(event)

        # ユーザーIDの取得（Cognitoアイデンティティ）
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        date = body["date"]
        diary_id = str(uuid.uuid4())  # ユニークなID生成
        content = body["content"]
        is_deleted = False

        # DynamoDBに保存するアイテムの作成
        item = {
            "user_id": user_id,
            "date": date,
            "diary_id": diary_id,
            "content": content,
            "is_deleted": is_deleted,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

        # DynamoDBにアイテムを保存
        table.put_item(Item=item)

        # 同期的に別のLambda関数を呼び出して、日記内容に基づいて花を選択し保存する
        lambda_client = boto3.client("lambda")
        response = lambda_client.invoke(
            FunctionName=os.getenv(
                "FLOWER_SELECT_FUNCTION_NAME"),  # 呼び出すLambda関数名
            InvocationType="RequestResponse",  # 同期で呼び出し
            Payload=json.dumps({
                "user_id": user_id,
                "date": date,
                "diary_content": content
            })
        )

        # 呼び出したLambdaのレスポンスを取得
        logger.info(f"response: {response['Payload']}")
        response_payload = json.loads(response['Payload'].read())
        logger.info(
            f"Received response from Flower Lambda: {response_payload}")
        flower_id = response_payload["flower_id"]
        logger.info(f"flower_id: {response_payload['flower_id']}")
        flower_image = get_img_from_s3(flower_id)
        # 成功レスポンスの返却
        return {
            "statusCode": 201,
            "body": json.dumps({
                "message": "Success",
                "flower_image": flower_image
            }),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }
    except ValueError as e:
        # バリデーションエラーの処理
        return {
            "statusCode": 400,
            "body": json.dumps({"error": str(e)}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }
    except Exception as e:
        # その他の予期せぬエラーの処理
        logger.error(f"Unexpected error: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "サーバー内部エラーが発生しました"}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }
