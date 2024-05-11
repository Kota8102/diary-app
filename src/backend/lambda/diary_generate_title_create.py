import json
import boto3
import requests

def lambda_handler(event, context):
    api_endpoint = get_parameter_from_parameter_store('OpenAI_API_ENDPOINT')
    api_key = get_parameter_from_parameter_store('OpenAI_API_KEY')
    
    request_data = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": event['diary_content']}],
        "temperature": 0.7
    }
    
    response = send_request_to_openai_api(api_endpoint, api_key, request_data)
    generated_title = response.json()['choices'][0]['message']['content']
    save_title_to_dynamodb(generated_title)
    
    return {
        'statusCode': 200,
        'body': json.dumps('Title generated and saved to DynamoDB: ' + generated_title)
    }

def get_parameter_from_parameter_store(parameter_name):
    ssm = boto3.client('ssm')
    response = ssm.get_parameter(Name=parameter_name, WithDecryption=True)
    return response['Parameter']['Value']

def send_request_to_openai_api(api_endpoint, api_key, request_data):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + api_key
    }

    response = requests.post(api_endpoint, headers=headers, json=request_data)
    
    return response

def save_title_to_dynamodb(generated_title):
    dynamodb = boto3.resource('dynamodb')
    table_name = 'generative-ai-table'
    table = dynamodb.Table(table_name)
    table.put_item(Item={'title': generated_title})
