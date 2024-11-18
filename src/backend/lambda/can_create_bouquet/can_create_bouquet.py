import json
import logging
import os
from datetime import datetime, timedelta, timezone

import boto3

logger = logging.getLogger(__name__)
# ロガーの設定
formatter = logging.Formatter(
    "[%(asctime)s - %(levelname)s - %(filename)s(func:%(funcName)s, line:%(lineno)d)] %(message)s"
)
handler = logging.StreamHandler()
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)


def get_current_week():
    """
    現在の年と週番号をISOカレンダー形式で取得します。

    戻り値:
        tuple: 現在の年と週番号を含むタプル (year, week)。
    """
    current_date = datetime.now(timezone.utc)
    current_year, current_week, _ = current_date.isocalendar()
    return current_year, current_week


def check_bouquet_created(user_id, current_year, current_week):
    """
    指定された週に指定されたユーザーがすでにブーケを作成しているかを確認します。

    引数:
        user_id (str): ユーザーのID。
        current_year (int): 現在の年。
        current_week (int): 現在の週番号。

    戻り値:
        bool: すでにブーケが作成されている場合はTrue、それ以外はFalse。
    """
    dynamodb = boto3.resource("dynamodb")
    bouquet_table_name = os.environ["BOUQUET_TABLE_NAME"]
    bouquet_table = dynamodb.Table(bouquet_table_name)
    bouquet_response = bouquet_table.get_item(
        Key={"user_id": user_id, "year_week": f"{current_year}-{current_week}"}
    )
    return "Item" in bouquet_response


def count_flowers_in_week(user_id, current_year, current_week):
    """
    現在の週に指定されたユーザーが作成した花の数をカウントします。

    引数:
        user_id (str): ユーザーのID。
        current_year (int): 現在の年。
        current_week (int): 現在の週番号。

    戻り値:
        int: 指定された週に作成された花の数。
    """
    logger.info(f"year week: {current_year} {current_week}")
    dynamodb = boto3.resource("dynamodb")
    generative_ai_table_name = os.environ.get["GENERATIVE_AI_TABLE_NAME"]
    generative_ai_table = dynamodb.Table(generative_ai_table_name)

    # 現在の日付を取得
    current_date = datetime.now(timezone.utc)

    # その週の最初の日 (月曜日) と最後の日 (日曜日) を計算
    start_of_week = current_date - timedelta(
        days=current_date.isocalendar()[2] - 1
    )  # 月曜日
    end_of_week = start_of_week + timedelta(days=6)  # 日曜日

    # 日付をYYYY-MM-DD形式に変換
    start_date = start_of_week.strftime("%Y-%m-%d")
    end_date = end_of_week.strftime("%Y-%m-%d")

    flower_response = generative_ai_table.query(
        KeyConditionExpression="user_id = :user_id AND #date BETWEEN :start_date AND :end_date",
        ExpressionAttributeNames={
            "#date": "date"  # dateを別名で指定
        },
        ExpressionAttributeValues={
            ":user_id": user_id,
            ":start_date": start_date,
            ":end_date": end_date,
        },
    )
    return len(flower_response.get("Items", []))


def lambda_handler(event, context):
    """
    Lambda関数のメインハンドラー。現在の週に基づき、ユーザーがブーケを作成可能かを判定します。

    引数:
        event (dict): Lambda関数をトリガーしたイベントペイロード。
        context (object): Lambda関数のランタイム情報。

    戻り値:
        dict: ステータスコードと、ユーザーがブーケを作成可能か (boolean) を含むレスポンス。
    """
    try:
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        current_year, current_week = get_current_week()

        if check_bouquet_created(user_id, current_year, current_week):
            logger.info("already exists bouquet")
            return {
                "statusCode": 200,
                "body": json.dumps({"can_create_bouquet": False}),
            }

        try:
            flower_count = count_flowers_in_week(user_id, current_year, current_week)
        except ValueError:
            logger.error("Error occurred during counting flowers in the week")
        logger.info(f"flower_count: {flower_count}")
        if flower_count >= 5:
            logger.info("flower count eq or gr 5")
            return {"statusCode": 200, "body": json.dumps({"can_create_bouquet": True})}
        else:
            logger.info("flower count lt 5")
            return {
                "statusCode": 200,
                "body": json.dumps({"can_create_bouquet": False}),
            }
    except Exception as e:
        logger.info(f"Error: {str(e)}")
        return {"statusCode": 400, "body": json.dumps({"error": str(e)})}
