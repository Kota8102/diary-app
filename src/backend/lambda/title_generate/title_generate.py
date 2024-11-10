import json
import os
import urllib.parse
import urllib.request
from logging import getLogger

import boto3

logger = getLogger(__name__)


def lambda_handler(event, context):
    """
    AWS Lambdaハンドラ関数。DynamoDBストリームのレコードを処理し、日記のタイトルを生成します。

    この関数は以下を行います:
    - DynamoDBでの 'INSERT' 操作によってトリガーされたイベントを処理。
    - イベントから日記の内容を抽出。
    - OpenAI API（ChatGPT）を使用して日記内容からタイトルを生成。
    - 生成したタイトルを同じDynamoDBレコードに保存。

    Args:
        event (dict): DynamoDBストリームイベントの詳細情報、変更されたレコードを含む。
        context (object): 実行時情報を提供するコンテキストオブジェクト。

    Returns:
        dict: ステータスコード、ヘッダー、および本文を含むHTTPレスポンス。
    """
    logger.info("title generate lambda start")
    try:
        record = event['Records'][0]
        if record['eventName'] == 'INSERT':
            logger.info(
                f"content: {record['dynamodb']['NewImage']['content']['S']}")
            diary_content = record['dynamodb']['NewImage']['content']['S']
            generate_title_and_save_to_dynamodb(diary_content, record)

        return {
            'statusCode': 200,
            'body': json.dumps('Processed DynamoDB Stream records.'),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
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


def generate_title_and_save_to_dynamodb(diary_content, record):
    """ChatGPTを使用して日記の内容からタイトルを生成し、DynamoDBに保存します。

    Args:
        diary_content (string): 日記の内容
        record (dict): Lambda関数のイベントレコード

    Returns:
        none
    """
    api_endpoint = "https://api.openai.com/v1/chat/completions"

    try:
        api_key = get_parameter_from_parameter_store('OpenAI_API_KEY')
    except Exception as e:
        logger.error(
            f"An error occurred during getting parameter from parameter store: {str(e)}")
        raise

    system_message = """Please write a title of 10 words or less based on the contents of your diary.""".strip()
    request_data = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": diary_content}
        ],
        "temperature": 0.7,
    }
    try:
        response = send_request_to_openai_api(
            api_endpoint, api_key, request_data)
        generated_title = json.loads(
            response)['choices'][0]['message']['content']
    except urllib.error.HTTPError as e:
        if e.code == 429:
            logger.error("API request rate limit exceeded or usage has exceeded billing threshold. "
                         "Please wait and try again or check your account billing details.")
        else:
            logger.error(
                f"An HTTP error occurred during OpenAI API call: {str(e)}")
        raise
    except Exception as e:
        logger.error(
            f"An unexpected error occurred during OpenAI API call: {str(e)}")
        raise

    dynamodb = boto3.resource('dynamodb')
    table_name = os.environ['TABLE_NAME']
    table = dynamodb.Table(table_name)
    try:
        dynamodb_response = table.update_item(
            Key={
                'user_id': record['dynamodb']['NewImage']['user_id']['S'],
                'date': record['dynamodb']['NewImage']['date']['S']
            },
            UpdateExpression="set title = :t",
            ExpressionAttributeValues={
                ':t': generated_title
            }
        )
        logger.info(f"DynamoDB update response: {dynamodb_response}")
    except Exception as e:
        logger.error(f"An error occurred during DynamoDB update: {str(e)}")
        raise


def get_parameter_from_parameter_store(parameter_name):
    """OpenAI APIトークンを取得

    Args:
        parameter_name (string): OpenAIトークンのパラメータ名

    Returns:
        string: OpenAI APIトークン
    """

    ssm = boto3.client('ssm', region_name=os.environ.get(
        'AWS_REGION', 'ap-northeast-1'))
    try:
        response = ssm.get_parameter(Name=parameter_name, WithDecryption=True)
        return response['Parameter']['Value']
    except Exception as e:
        logger.error(
            f"An unexpected error occurred during get parameter fro parameter store: {str(e)}")
        raise


def send_request_to_openai_api(api_endpoint, api_key, request_data):
    """OpenAI APIを呼び出します

    Args:
        api_endpoint (string): OpenAI APIエンドポイント
        api_key (string): OpenAI APIキー 
        request_data (string): ChatGPTへのリクエストデータ

    Returns:
        dict: ChatGPTへのAPIリクエストのレスポンスデータ
    """
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + api_key
    }

    data = json.dumps(request_data).encode("utf-8")
    req = urllib.request.Request(api_endpoint, data=data, headers=headers)

    try:
        response = urllib.request.urlopen(req).read().decode("utf-8")
    except Exception as e:
        error_message = f"An unexpected error occurred: {str(e)}"
        logger.error(json.dumps({"error": error_message}))
        raise
    return response
