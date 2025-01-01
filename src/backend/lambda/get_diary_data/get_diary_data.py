import base64
import json
import logging
import os
from datetime import datetime, timezone
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
    HTTPレスポンスを生成します。

    Args:
        status_code (int): HTTPステータスコード。
        body (dict): レスポンスボディ。

    Returns:
        dict: フォーマット済みのHTTPレスポンス。
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
    日付文字列の形式を検証します。

    Args:
        date (str): 検証する日付文字列。

    Returns:
        bool: 日付が有効な場合はTrue。
    """
    import re

    return bool(re.match(r"^\d{4}-\d{2}-\d{2}$", date))


def get_flower_id(user_id: str, date: str) -> Optional[str]:
    """
    DynamoDBからflower_idを取得します。

    Args:
        user_id (str): ユーザーID。
        date (str): 日付文字列。

    Returns:
        Optional[str]: flower_idまたはNone。
    """
    table_name = os.getenv("GENERATIVE_AI_TABLE_NAME")
    if not table_name:
        logger.error("GENERATIVE_AI_TABLE_NAME is not defined")
        raise ValueError("GENERATIVE_AI_TABLE_NAME is not defined")

    table = dynamodb.Table(table_name)

    try:
        response = table.get_item(Key={"user_id": user_id, "date": date})
        return response.get("Item", {}).get("flower_id")
    except ClientError as e:
        logger.error(f"DynamoDB client error: {e.response['Error']['Message']}")
        raise


def get_image(flower_id: str) -> Optional[str]:
    """
    S3から画像を取得します。

    Args:
        flower_id (str): Flower ID。

    Returns:
        Optional[str]: Base64エンコードされた画像データまたはNone。
    """
    s3 = boto3.client("s3")
    bucket_name = os.getenv("FLOWER_BUCKET_NAME")
    if not bucket_name:
        logger.error("FLOWER_BUCKET_NAME環境変数が設定されていません。")
        raise ValueError("FLOWER_BUCKET_NAME環境変数が設定されていません。")

    s3_key = f"flowers/{flower_id}.png"

    try:
        response = s3.get_object(Bucket=bucket_name, Key=s3_key)
        body = response["Body"].read()
        return base64.b64encode(body).decode("utf-8")
    except ClientError as e:
        if e.response["Error"].get("Code") == "NoSuchKey":
            logger.info(f"image not found: {s3_key}")
            return None
        logger.error(f"S3エラー: {e.response['Error']['Message']}")
        raise


def get_title(user_id: str, date: str) -> Optional[str]:
    """
    DynamoDBからタイトルを取得します。

    Args:
        user_id (str): ユーザーID。
        date (str): 日付文字列。

    Returns:
        Optional[str]: タイトルまたはNone。
    """
    generative_ai_table_name = os.getenv("GENERATIVE_AI_TABLE_NAME")
    if not generative_ai_table_name:
        logger.error("GENERATIVE_AI_TABLE_NAME環境変数が設定されていません。")
        raise ValueError("GENERATIVE_AI_TABLE_NAME環境変数が設定されていません。")

    generative_ai_table = dynamodb.Table(generative_ai_table_name)

    try:
        response = generative_ai_table.get_item(Key={"user_id": user_id, "date": date})
        return response.get("Item", {}).get("title")
    except ClientError as e:
        logger.error(f"DynamoDB client error: {e.response['Error']['Message']}")
        raise


def get_body(user_id: str, date: str) -> Optional[str]:
    """
    DynamoDBから本文を取得します。

    Args:
        user_id (str): ユーザーID。
        date (str): 日付文字列。

    Returns:
        Optional[str]: 本文またはNone。
    """
    diary_table_name = os.getenv("TABLE_NAME")
    if not diary_table_name:
        logger.error("TABLE_NAME環境変数が設定されていません。")
        raise ValueError("TABLE_NAME環境変数が設定されていません。")

    diary_table = dynamodb.Table(diary_table_name)

    try:
        response = diary_table.get_item(Key={"user_id": user_id, "date": date})
        return response.get("Item", {}).get("body")
    except ClientError as e:
        logger.error(f"DynamoDB client error: {e.response['Error']['Message']}")
        raise


def get_current_week() -> (int, int):
    """
    現在の年と週番号を取得します。

    Returns:
        tuple: 現在の年とISO週番号。
    """
    current_date = datetime.now(timezone.utc)
    current_year, current_week, _ = current_date.isocalendar()
    return current_year, current_week


def check_bouquet_created(user_id: str, current_year: int, current_week: int) -> bool:
    """
    現在の週にブーケが作成されたか確認します。

    Args:
        user_id (str): ユーザーID。
        current_year (int): 現在の年。
        current_week (int): 現在のISO週番号。

    Returns:
        bool: ブーケが作成されている場合はTrue、それ以外はFalse。
    """
    bouquet_table_name = os.getenv("BOUQUET_TABLE_NAME")
    bouquet_table = dynamodb.Table(bouquet_table_name)
    bouquet_response = bouquet_table.get_item(
        Key={"user_id": user_id, "year_week": f"{current_year}-{current_week}"}
    )
    return "Item" in bouquet_response


def count_flowers_in_week(user_id: str, current_year: int, current_week: int) -> int:
    """
    現在の週にS3にある花の数をカウントします。

    Args:
        user_id (str): ユーザーID。
        current_year (int): 現在の年。
        current_week (int): 現在のISO週番号。

    Returns:
        int: 花の数。
    """
    s3 = boto3.client("s3")
    bucket_name = os.getenv("FLOWER_BUCKET_NAME")
    prefix = f"{user_id}/{current_year}-{current_week}"

    try:
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix)
        return len(response.get("Contents", []))
    except ClientError as e:
        logger.error(f"S3 error: {e.response['Error']['Message']}")
        raise


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda関数: 画像、タイトル、本文をDynamoDBから取得し、
    ブーケ作成可能かどうかをチェックします。

    Args:
        event (Dict[str, Any]): Lambdaイベントデータ。
        context (Any): Lambdaコンテキストオブジェクト。

    Returns:
        Dict[str, Any]: API Gateway互換のレスポンス。
    """
    try:
        query_params = event.get("queryStringParameters", {})
        if not query_params or "date" not in query_params:
            return create_response(
                400, {"error": "Required parameter is missing: date"}
            )

        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        date = query_params["date"]

        if not validate_date(date):
            return create_response(400, {"error": "Invalid date format"})

        flower_id = get_flower_id(user_id, date)
        image = get_image(flower_id) if flower_id else None
        title = get_title(user_id, date)
        body = get_body(user_id, date)

        current_year, current_week = get_current_week()
        bouquet_created = check_bouquet_created(user_id, current_year, current_week)
        flower_count = count_flowers_in_week(user_id, current_year, current_week)
        can_create_bouquet = not bouquet_created and flower_count >= 5

        response_data = {
            "image": image,
            "title": title or "",
            "body": body or "",
            "has_title": bool(title),
            "has_body": bool(body),
            "can_create_bouquet": can_create_bouquet,
        }

        return create_response(200, response_data)

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return create_response(
            500,
            {
                "error": "Internal server error",
                "details": str(e) if os.getenv("DEBUG") else "Please contact support",
            },
        )
