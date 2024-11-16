import json
import os
import urllib.parse
import urllib.request

import boto3


def lambda_handler(event, context):
    print("title generate lambda start")
    try:
        record = event["Records"][0]
        if record["eventName"] == "INSERT":
            print(f"content: {record['dynamodb']['NewImage']['content']['S']}")
            diary_content = record["dynamodb"]["NewImage"]["content"]["S"]
            generate_title_and_save_to_dynamodb(diary_content, record)

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


def generate_title_and_save_to_dynamodb(diary_content, record):
    """Generate a title from diary contents using ChatGPT and save it to DynamoDB

    Args:
        diary_content (string): content of diary
        record (dict): event record of lambda function

    Returns:
        none
    """
    api_endpoint = "https://api.openai.com/v1/chat/completions"

    try:
        api_key = get_parameter_from_parameter_store("OpenAI_API_KEY")
    except Exception as e:
        return (
            f"An error occurred during getting parameter from parameter store: {str(e)}"
        )

    request_data = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": diary_content}],
        "temperature": 0.7,
    }

    response = send_request_to_openai_api(api_endpoint, api_key, request_data)
    generated_title = json.loads(response)["choices"][0]["message"]["content"]
    print(f"title: {generated_title}")

    dynamodb = boto3.resource("dynamodb")
    table_name = os.environ["TABLE_NAME"]
    table = dynamodb.Table(table_name)
    dynamodb_response = table.update_item(
        Key={
            "user_id": record["dynamodb"]["NewImage"]["user_id"]["S"],
            "date": record["dynamodb"]["NewImage"]["date"]["S"],
        },
        UpdateExpression="set title = :t",
        ExpressionAttributeValues={":t": generated_title},
    )
    print(f"response: {dynamodb_response}")


def get_parameter_from_parameter_store(parameter_name):
    """Get OpenAI API Token

    Args:
        parameter_name (_type_): Parameter name of OpenAI token

    Returns:
        string: OpenAI API token
    """
    ssm = boto3.client("ssm")
    try:
        response = ssm.get_parameter(Name=parameter_name, WithDecryption=True)
        return response["Parameter"]["Value"]
    except Exception as e:
        return (
            f"An error occurred during getting parameter from parameter store: {str(e)}"
        )


def send_request_to_openai_api(api_endpoint, api_key, request_data):
    """Call OpenAI API

    Args:
        api_endpoint (string): OpenAI API endpoint
        api_key (string): OpenAI API Key
        request_data (string): request data to chatGPT

    Returns:
        dict: Response data of API request to ChatGPT
    """
    headers = {"Content-Type": "application/json", "Authorization": "Bearer " + api_key}

    data = json.dumps(request_data).encode("utf-8")
    req = urllib.request.Request(api_endpoint, data=data, headers=headers)
    response = urllib.request.urlopen(req).read().decode("utf-8")

    return response
