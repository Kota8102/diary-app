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
    """DynamoDBストリームレコードを処理するAWS Lambdaハンドラ関数。

    この関数は次の処理を行います:
    - 受信したDynamoDBストリームレコードを順に処理。
    - イベント名が「INSERT」であるか確認。
    - DynamoDBレコードの新しいイメージから日記の内容を抽出。
    - 日記内容に基づいて花を選択し、花のIDをDynamoDBに保存する関数を呼び出します。

    Args:
        event (dict): 処理するレコードを含むDynamoDBストリームイベント。
        context (object): ランタイム情報を提供するコンテキストオブジェクト。

    Returns:
        dict: ステータスコード、ヘッダー、JSON本文を含むHTTPレスポンス。
            - 成功時 (200): レコードが処理された旨のメッセージを返します。
            - 失敗時 (400): エラーメッセージとエラーの内容を返します。
    """
    logger.info("Flower Generate Function Start")
    try:
        record = event["Records"][0]
        if record["eventName"] == "INSERT":
            diary_content = record["dynamodb"]["NewImage"]["content"]["S"]
            user_id = record["dynamodb"]["NewImage"]["user_id"]["S"]
            date = record["dynamodb"]["NewImage"]["date"]["S"]
            select_flower_and_save_to_dynamodb(user_id, date, diary_content)
        return {
            "statusCode": 200,
            "body": json.dumps("Processed DynamoDB Stream records."),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }
    except Exception as e:
        return {
            "statusCode": 400,
            "body": json.dumps(f"An error occurred: {str(e)}"),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }


def select_flower_and_save_to_dynamodb(user_id, date, diary_content):
    """日記の内容に基づいて花を選択し、その花のIDをDynamoDBに保存します。

    この関数は次の処理を行います:
    - パラメータストアからAPIキーを取得。
    - 日記の内容を使用してAPIを呼び出し、花を選択。
    - 選択した花のIDをDynamoDBに保存。

    Args:
        diary_content (str): 日記の内容。
        date (str): 花を選択する日付。
    """
    api_key = get_parameter_from_parameter_store("DIFY_API_KEY")
    flower_id = select_flower_using_api(api_key, diary_content)
    save_flower_id_to_dynamodb(user_id, date, flower_id)


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
    BASE_URL = 'https://api.dify.ai/v1'

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    url = f'{BASE_URL}/chat-messages'

    data = {
        'query': query,
        'inputs': {},
        'response_mode': 'blocking',
        'user': "user",
        'auto_generate_name': True
    }
    try:
        response = requests.post(url, headers=headers, json=data)
    except Exception as e:
        raise Exception(f"Failed to select flower: {e}")

    flower_id = response.json()["answer"]

    logger.info("Answer: ", flower_id)
    return flower_id


def save_flower_id_to_dynamodb(user_id, date, flower_id):
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
    expression_attribute_values = {
        ':flower': flower_id
    }

    try:
        response = table.update_item(
            Key=item,
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values
        )
        logger.info(f"DynamoDB Update Response: {response}")

    except Exception as e:
        logger.error(f"Error saving to DynamoDB: {e}")
        raise
