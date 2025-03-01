import base64
import json
import os
from datetime import datetime

import boto3


def lambda_handler(event, context):
    # 認証情報からユーザーIDを取得
    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
    # クエリパラメータから date を取得
    date_str = event["queryStringParameters"].get("date")
    print(f"event: {event}")
    if not date_str:
        return {
            "statusCode": 200,
            "body": json.dumps({"message": "no bouquet found at {date_str}"}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }

    # 日付を解析して年と週番号を取得
    try:
        year_week = get_year_week(date_str)
    except ValueError:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid date format. Use YYYY-MM-DD"}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }

    s3 = boto3.client("s3")
    bucket_name = os.environ["BUCKET_NAME"]
    key = f"bouquets/{user_id}/{year_week}.png"
    print(f"bucket_name:{bucket_name}, {key}")

    try:
        response = s3.get_object(Bucket=bucket_name, Key=key)
        image_content = response["Body"].read()
        encoded_image = base64.b64encode(image_content).decode("utf-8")
        return {
            "statusCode": 200,
            "body": json.dumps({"bouquet": encoded_image}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }
    except s3.exceptions.NoSuchKey:
        return {
            "statusCode": 404,
            "body": json.dumps({"error": "Bouquet image not found"}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }


def get_year_week(date: str) -> str:
    """指定された日付のISO年週を返す関数。

    渡された日付からISOカレンダーに基づく年と週番号を抽出し、
    'YYYY-WW'の形式でフォーマットした文字列を返します。
    週番号は2桁にゼロパディングされます。

    Args:
        date (str): ISO年週を取得するための日付。

    Returns:
        str: 'YYYY-WW'形式のISO年週を表す文字列。
    """
    dt = datetime.strptime(date, "%Y-%m-%d")
    iso_year, iso_week, _ = dt.isocalendar()
    return f"{iso_year}-{iso_week:02d}"
