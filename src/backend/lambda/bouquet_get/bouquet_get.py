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
    if not date_str:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "date query parameter is required"}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }

    # 日付を解析して年と週番号を取得
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        year = date_obj.strftime("%Y")
        week = date_obj.strftime("%U")  # %U は週番号（週の始まりは日曜日）
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
    key = f"{user_id}/{year}-{week}.png"

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
