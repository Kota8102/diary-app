import base64
import json
import logging
import os
from typing import Any, Dict, Optional

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)
formatter = logging.Formatter(
    "[%(asctime)s - %(levelname)s - %(filename)s(func:%(funcName)s, line:%(lineno)d)] %(message)s"
)
handler = logging.StreamHandler()
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb", region_name="ap-northeast-1")


def create_response(status_code: int, body: dict) -> dict:
    """
    HTTPレスポンスを生成する

    Args:
        status_code (int): HTTPステータスコード
        body (dict): レスポンスボディ

    Returns:
        dict: フォーマット済みのHTTPレスポンス
    """
    return {
        "statusCode": status_code,
        "body": json.dumps(body),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
    }


def validate_date(date: str) -> bool:
    """
    日付形式を検証する

    Args:
        date (str): 検証する日付文字列

    Returns:
        bool: 日付が有効な場合True
    """
    import re

    return bool(re.match(r"^\d{4}-\d{2}-\d{2}$", date))


def get_flower_id(user_id: str, date: str) -> Optional[str]:
    """
    DynamoDBからflower_idを取得する

    Args:
        user_id (str): ユーザーID
        date (str): 日付

    Returns:
        Optional[str]: flower_idまたはNone
    """
    table_name = os.getenv("GENERATIVE_AI_TABLE_NAME")
    if not table_name:
        logger.error("GENERATIVE_AI_TABLE_NAME 環境変数が設定されていません")
        raise ValueError("GENERATIVE_AI_TABLE_NAME 環境変数が設定されていません")

    table = dynamodb.Table(table_name)

    try:
        response = table.get_item(Key={"user_id": user_id, "date": date})
        return response.get("Item", {}).get("flower_id")
    except ClientError as e:
        logger.error(f"DynamoDB クライアントエラー: {e.response['Error']['Message']}")
        raise


def get_image(flower_id: str) -> Optional[str]:
    """
    S3から画像を取得する

    Args:
        flower_id (str): Flower ID

    Returns:
        Optional[str]: Base64エンコードされた画像データまたはNone
    """
    s3 = boto3.client("s3")
    bucket_name = os.getenv("FLOWER_IMAGE_BUCKET_NAME")
    if not bucket_name:
        logger.error("FLOWER_IMAGE_BUCKET_NAME 環境変数が設定されていません")
        raise ValueError("FLOWER_IMAGE_BUCKET_NAME 環境変数が設定されていません")

    s3_key = f"flowers/{flower_id}.png"

    try:
        response = s3.get_object(Bucket=bucket_name, Key=s3_key)
        body = response["Body"].read()
        return base64.b64encode(body).decode("utf-8")
    except ClientError as e:
        if e.response["Error"].get("Code") == "NoSuchKey":
            logger.info(f"画像が見つかりません: {s3_key}")
            return None
        logger.error(f"S3エラー: {e.response['Error']['Message']}")
        raise


def get_title(user_id: str, date: str) -> Optional[str]:
    """
    DynamoDBからタイトルを取得する

    Args:
        user_id (str): ユーザーID
        date (str): 日付

    Returns:
        Optional[str]: タイトルまたはNone
    """
    generative_ai_table_name = os.getenv("GENERATIVE_AI_TABLE_NAME")
    if not generative_ai_table_name:
        logger.error("GENERATIVE_AI_TABLE_NAME 環境変数が設定されていません")
        raise ValueError("GENERATIVE_AI_TABLE_NAME 環境変数が設定されていません")

    generative_ai_table = dynamodb.Table(generative_ai_table_name)

    try:
        response = generative_ai_table.get_item(Key={"user_id": user_id, "date": date})
        return response.get("Item", {}).get("title")
    except ClientError as e:
        logger.error(f"DynamoDB クライアントエラー: {e.response['Error']['Message']}")
        raise


def get_body(user_id: str, date: str) -> Optional[str]:
    """
    DynamoDBから本文を取得する

    Args:
        user_id (str): ユーザーID
        date (str): 日付

    Returns:
        Optional[str]: 本文またはNone
    """
    diary_table_name = os.getenv("TABLE_NAME")
    if not diary_table_name:
        logger.error("TABLE_NAME 環境変数が設定されていません")
        raise ValueError("TABLE_NAME 環境変数が設定されていません")

    diary_table = dynamodb.Table(diary_table_name)

    try:
        response = diary_table.get_item(Key={"user_id": user_id, "date": date})
        return response.get("Item", {}).get("body")
    except ClientError as e:
        logger.error(f"DynamoDB クライアントエラー: {e.response['Error']['Message']}")
        raise


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    DynamoDBから画像、タイトル、本文を取得してレスポンスを返す

    Args:
        event (Dict[str, Any]): イベントデータ
        context (Any): Lambdaコンテキスト

    Returns:
        Dict[str, Any]: API Gateway互換レスポンス
    """
    try:
        query_params = event.get("queryStringParameters", {})
        if not query_params or "date" not in query_params:
            return create_response(400, {"error": "Missing required parameter: date"})

        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        date = query_params["date"]

        if not validate_date(date):
            return create_response(400, {"error": "Invalid date format"})

        flower_id = get_flower_id(user_id, date)
        image = get_image(flower_id) if flower_id else None
        title = get_title(user_id, date)
        body = get_body(user_id, date)

        response_data = {
            "image": image,
            "title": title or "",
            "body": body or "",
        }

        return create_response(200, response_data)

    except Exception as e:
        logger.error(f"予期しないエラー: {str(e)}")
        return create_response(
            500,
            {
                "error": "Internal server error",
                "details": str(e) if os.getenv("DEBUG") else "Please contact support",
            },
        )
