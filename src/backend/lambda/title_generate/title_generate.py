import json
import os
import urllib.parse
import urllib.request

import boto3


def lambda_handler(event, context):
    """
    AWS Lambda handler function to process DynamoDB stream records and generate diary titles.

    This function:
    - Processes an event triggered by an 'INSERT' operation in DynamoDB.
    - Extracts the diary content from the event.
    - Generates a title for the diary content using the OpenAI API (ChatGPT).
    - Saves the generated title back to the same DynamoDB record.

    Args:
        event (dict): DynamoDB stream event details, including the modified records.
        context (object): The context object providing runtime information.

    Returns:
        dict: HTTP response with a status code, headers, and body.
    """
    print("title generate lambda start")
    try:
        record = event['Records'][0]
        if record['eventName'] == 'INSERT':
            print(f"content: {record['dynamodb']['NewImage']['content']['S']}")
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
    """Generate a title from diary contents using ChatGPT and save it to DynamoDB

    Args:
        diary_content (string): content of diary
        record (dict): event record of lambda function

    Returns:
        none
    """
    api_endpoint = "https://api.openai.com/v1/chat/completions"

    try:
        api_key = get_parameter_from_parameter_store('OpenAI_API_KEY')
    except Exception as e:
        print(
            f"An error occurred during getting parameter from parameter store: {str(e)}")
        raise

    system_message = """Please write a title of 10 words or less based on the contents of your diary.""".strip()
    request_data = {
        "model": "gpt-3.5-turbo",
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
    except Exception as e:
        print(f"An error occurred during OpenAI API call: {str(e)}")
        raise

    print(f"title: {generated_title}")

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
        print(f"DynamoDB update response: {dynamodb_response}")
    except Exception as e:
        print(f"An error occurred during DynamoDB update: {str(e)}")
        raise


def get_parameter_from_parameter_store(parameter_name):
    """Get OpenAI API Token

    Args:
        parameter_name (_type_): Parameter name of OpenAI token

    Returns:
        string: OpenAI API token
    """

    ssm = boto3.client('ssm', region_name=os.environ.get(
        'AWS_REGION', 'ap-northeast-1'))
    try:
        response = ssm.get_parameter(Name=parameter_name, WithDecryption=True)
        return response['Parameter']['Value']
    except Exception as e:
        return f"An error occurred during getting parameter from parameter store: {str(e)}"


def send_request_to_openai_api(api_endpoint, api_key, request_data):
    """Call OpenAI API

    Args:
        api_endpoint (string): OpenAI API endpoint
        api_key (string): OpenAI API Key 
        request_data (string): request data to chatGPT 

    Returns:
        dict: Response data of API request to ChatGPT
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
        print(error_message)
        print(json.dumps({"error": error_message}))
        raise
    return response
