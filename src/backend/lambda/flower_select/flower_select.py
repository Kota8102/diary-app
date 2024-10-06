import json
import os

import boto3
import requests


def lambda_handler(event, context):
    """AWS Lambda handler function to process DynamoDB stream records.

    This function:
    - Iterates over the incoming DynamoDB stream records.
    - Checks if the event name is "INSERT".
    - Extracts the diary content from the new image in the DynamoDB record.
    - Calls the function to select a flower based on the diary content and saves the flower ID to DynamoDB.

    Args:
        event (dict): Incoming DynamoDB stream event, containing records to be processed.
        context (object): The context object providing runtime information for the Lambda function.

    Returns:
        dict: HTTP response with a status code, headers, and a JSON body.
            - On success (200), returns a message indicating that the records were processed.
            - On failure (400), returns an error message indicating what went wrong.
    """
    print("Flower Generate Function Start")
    try:
        record = event["Records"][0]
        print(f"record: {record}")
        if record["eventName"] == "INSERT":
            diary_content = record["dynamodb"]["NewImage"]["content"]["S"]
            user_id = record["dynamodb"]["NewImage"]["user_id"]["S"]
            date = record["dynamodb"]["NewImage"]["date"]["S"]
            print(f"content: {diary_content}")
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
    """Selects a flower based on the diary content and saves the flower ID to DynamoDB.

    This function:
    - Retrieves the API key from the parameter store.
    - Calls the API to select a flower using the diary content.
    - Saves the selected flower ID to DynamoDB.

    Args:
        diary_content (str): The content of the diary entry.
        date (str): Date to choose the flower.
    """
    api_key = get_parameter_from_parameter_store("DIFY_API_KEY")
    flower_id = select_flower_using_api(api_key, diary_content)
    save_flower_id_to_dynamodb(user_id, date, flower_id)


def get_parameter_from_parameter_store(parameter_name):
    """Retrieves a parameter value from the AWS Systems Manager Parameter Store.

    Args:
        parameter_name (str): The name of the parameter to retrieve.

    Returns:
        str: The value of the specified parameter.

    Raises:
        Exception: If the parameter retrieval fails.
    """
    print("get_parameter_from_parameter_store")
    try:
        ssm = boto3.client("ssm")
        response = ssm.get_parameter(Name=parameter_name, WithDecryption=True)
        print("Successfully get the parameter")
        return response["Parameter"]["Value"]
    except Exception as e:
        raise Exception(f"Failed to get parameter from parameter store: {e}")


def select_flower_using_api(api_key, query):
    """Selects a flower based on the provided query by calling an external API.

    Args:
        api_key (str): The API key for authentication.
        query (str): The query string to select a flower.

    Returns:
        str: The selected flower ID.

    Raises:
        Exception: If the API call fails or returns an error.
    """
    print("select flower using api")
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

    flower_id = response.get('answer')
    print("successfully get flower_id")
    print("Answer: ", flower_id)
    return flower_id


def save_flower_id_to_dynamodb(user_id, date, flower_id):
    """Saves the selected flower ID to DynamoDB.

    Args:
        user_id (str): The ID of the user.
        date (str): Date to choose the flower.
        flower_id (str): The ID of the selected flower to save.

    Raises:
        Exception: If saving to DynamoDB fails.
    """
    print("save_flower_id_to_dynamodb")

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
        print(f"DynamoDB Update Response: {response}")

    except Exception as e:
        print(f"Error saving to DynamoDB: {e}")
        raise
