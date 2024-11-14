import base64
import json
import logging
import os
import uuid
from datetime import datetime

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def validate_input(body):
    """
    バリデーションを行い、入力データの整合性を確認する関数。

    Args:
        body (dict): リクエストボディの JSON データ。

    Raises:
        ValueError: 必須フィールドが不足している場合や日付形式が不正な場合に発生。
    """
    required_fields = ["date", "content"]
    for field in required_fields:
        if field not in body:
            raise ValueError(f"必須フィールドがありません: {field}")

    try:
        datetime.strptime(body["date"], "%Y-%m-%d")
    except ValueError:
        raise ValueError("不正な日付形式です。YYYY-MM-DDの形式を使用してください")


def get_img_from_s3(flower_id):
    """
    S3 から花の画像を取得して、Base64 エンコードした文字列を返す関数。

    Args:
        flower_id (str): 取得する画像に対応する花の ID。

    Returns:
        str: Base64 エンコードされた画像データ。

    Raises:
        Exception: S3 操作が失敗した場合に発生。
    """
    s3 = boto3.client("s3")
    bucket_name = os.environ["FLOWER_IMAGE_BUCKET_NAME"]
    s3_key = f"flowers/{flower_id}.png"

    try:
        response = s3.get_object(Bucket=bucket_name, Key=s3_key)
        body = response["Body"].read()
        if body != "":
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


def save_to_dynamodb(user_id, date, content, is_deleted=False):
    """
    DynamoDB に日記のアイテムを保存し、生成した diary_id を返す関数。

    Args:
        user_id (str): ユーザーの一意の ID。
        date (str): 日記の日付。
        content (str): 日記の内容。
        is_deleted (bool): 削除済みフラグ。デフォルトは False。

    Returns:
        str: 新たに生成された日記の ID。
    """
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(os.getenv("TABLE_NAME"))

    diary_id = str(uuid.uuid4())
    item = {
        "user_id": user_id,
        "date": date,
        "diary_id": diary_id,
        "content": content,
        "is_deleted": is_deleted,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }

    table.put_item(Item=item)
    return diary_id


def invoke_flower_lambda(user_id, date, content):
    """
    Flower Lambda を呼び出して日記内容に基づいて花の ID を取得する関数。

    Args:
        user_id (str): ユーザーの一意の ID。
        date (str): 日記の日付。
        content (str): 日記の内容。

    Returns:
        str: 取得された花の ID。

    Raises:
        Exception: 呼び出しやレスポンスの処理が失敗した場合に発生。
    """
    lambda_client = boto3.client("lambda")
    response = lambda_client.invoke(
        FunctionName=os.getenv("FLOWER_SELECT_FUNCTION_NAME"),
        InvocationType="RequestResponse",
        Payload=json.dumps(
            {"user_id": user_id, "date": date, "diary_content": content}
        ),
    )

    logger.info(f"response: {response['Payload']}")
    response_payload = json.loads(response["Payload"].read())
    body = json.loads(response_payload["body"])
    return body["flower_id"]


def lambda_handler(event, context):
    """
    メインの Lambda ハンドラー関数。入力データの検証、DynamoDB への保存、
    Flower Lambda の呼び出しを行い、成功レスポンスを返す。

    Args:
        event (dict): Lambda イベントデータ。
        context (object): Lambda 実行コンテキストオブジェクト。

    Returns:
        dict: HTTP ステータスコード、レスポンスボディ、HTTP ヘッダーを含むレスポンスオブジェクト。
    """
    try:
        body = json.loads(event["body"])
        validate_input(body)

        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        date = body["date"]
        content = body["content"]

        # DynamoDB にアイテムを保存
        diary_id = save_to_dynamodb(user_id, date, content)

        # Flower Lambda を呼び出して花の ID を取得
        flower_id = invoke_flower_lambda(user_id, date, content)
        flower_image = get_img_from_s3(flower_id)

        # 成功レスポンスの返却
        return {
            "statusCode": 201,
            "body": json.dumps(
                {
                    "message": "Success",
                    "flower_id": flower_id,
                    "flower_image": flower_image,
                }
            ),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }
    except ValueError as e:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": str(e)}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "サーバー内部エラーが発生しました"}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }
