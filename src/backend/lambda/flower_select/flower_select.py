import json
import logging
import os

import boto3
import requests

logger = logging.getLogger(__name__)
# ロガーの設定
formatter = logging.Formatter(
    "[%(asctime)s - %(levelname)s - %(filename)s(func:%(funcName)s, line:%(lineno)d)] %(message)s"
)
handler = logging.StreamHandler()
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    """別のLambdaから呼び出され、日記の内容に基づいて花を選び、DynamoDBに保存します。

    この関数は次の処理を行います:
    - 引数として受け取った日記の内容を使用して花を選択。
    - 選択された花のIDをDynamoDBに保存。

    Args:
        event (dict): 別のLambdaから渡される引数で、user_id, date, diary_content を含む。
        context (object): ランタイム情報を提供するコンテキストオブジェクト。

    Returns:
        dict: ステータスコード、ヘッダー、JSON本文を含むHTTPレスポンス。
            - 成功時 (200): 花のIDが保存された旨のメッセージを返します。
            - 失敗時 (400): エラーメッセージとエラーの内容を返します。
    """
    logger.info("Flower Generate Function Start")
    try:
        user_id = event["user_id"]
        date = event["date"]
        diary_content = event["diary_content"]

        logger.info(f"user_id: {user_id}, date: {date}, diary_content: {diary_content}")

        # 日記の内容に基づいて花を選択
        flower_id = select_flower(diary_content)
        logger.info(f"flower_id: {flower_id}")

        # 選択した花のIDをDynamoDBに保存
        try:
            save_to_dynamodb(user_id, date, flower_id)
            logger.info("Flower ID saved successfully to DynamoDB.")
        except Exception as dynamodb_error:
            logger.error(f"Error saving to DynamoDB: {str(dynamodb_error)}")
            return {
                "statusCode": 500,
                "body": json.dumps(
                    {
                        "message": "Failed to save Flower ID to DynamoDB.",
                        "error": str(dynamodb_error),
                    }
                ),
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            }

        return {
            "statusCode": 200,
            "body": json.dumps(
                {"message": "Flower ID saved to DynamoDB.", "flower_id": flower_id}
            ),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }
    except Exception as e:
        logger.error(f"Unhandled exception: {str(e)}")
        return {
            "statusCode": 400,
            "body": json.dumps(f"An error occurred: {str(e)}"),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }


def select_flower(diary_content):
    """日記の内容に基づいて花を選択し、花のIDを返します。

    この関数は次の処理を行います:
    - パラメータストアからAPIキーを取得。
    - 日記の内容を使用してAPIを呼び出し、花を選択。

    Args:
        diary_content (str): 日記の内容。

    Returns:
        str: 選択された花のID。
    """
    logger.info("select flower")
    api_key = get_parameter_from_parameter_store("DIFY_API_KEY")
    return select_flower_using_api(api_key, diary_content)


def save_to_dynamodb(user_id, date, flower_id):
    """選択された花のIDをDynamoDBに保存します。

    Args:
        user_id (str): ユーザーのID。
        date (str): 花を選択する日付。
        flower_id (str): 保存する選択された花のID。

    Raises:
        Exception: DynamoDBへの保存が失敗した場合。
    """
    logger.info("save_flower_id_to_dynamodb")

    dynamodb = boto3.resource("dynamodb")
    table_name = os.environ["GENERATIVE_AI_TABLE_NAME"]
    table = dynamodb.Table(table_name)

    item = {
        "user_id": user_id,
        "date": date,
    }

    update_expression = "set flower_id = :flower"
    expression_attribute_values = {":flower": flower_id}

    try:
        table.update_item(
            Key=item,
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
        )

    except Exception as e:
        logger.error(f"Error saving to DynamoDB: {e}")
        raise


def get_parameter_from_parameter_store(parameter_name):
    """AWS Systems Manager Parameter Storeからパラメータ値を取得します。

    Args:
        parameter_name (str): 取得するパラメータの名前。

    Returns:
        str: 指定したパラメータの値。

    Raises:
        Exception: パラメータの取得に失敗した場合。
    """
    logger.info("get_parameter_from_parameter_store")
    try:
        ssm = boto3.client("ssm")
        response = ssm.get_parameter(Name=parameter_name, WithDecryption=True)
        return response["Parameter"]["Value"]
    except Exception as e:
        raise Exception(f"Failed to get parameter from parameter store: {e}")


def select_flower_using_api(api_key, query):
    """指定されたクエリに基づき、外部APIを呼び出して花を選択します。

    Args:
        api_key (str): 認証用のAPIキー。
        query (str): 花を選択するためのクエリ文字列。

    Returns:
        str: 選択された花のID。

    Raises:
        Exception: API呼び出しが失敗またはエラーを返した場合。
    """
    logger.info("select flower using api")
    BASE_URL = "https://api.dify.ai/v1"

    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    url = f"{BASE_URL}/chat-messages"

    data = {
        "query": query,
        "inputs": {},
        "response_mode": "blocking",
        "user": "user",
        "auto_generate_name": True,
    }
    try:
        response = requests.post(url, headers=headers, json=data)
    except Exception as e:
        raise Exception(f"Failed to select flower: {e}")

    flower_id = response.json()["answer"]

    return flower_id
