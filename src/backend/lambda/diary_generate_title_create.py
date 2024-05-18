import json
import boto3
import os
import urllib.request
import urllib.parse

def lambda_handler(event, context):
    try:
      for record in event['Records']:
          if record['eventName'] == 'INSERT':
              diary_content = record['dynamodb']['NewImage']['diary_content']['S']
              generate_title_and_save_to_dynamodb(diary_content, record)

      return {
          'statusCode': 200,
          'body': json.dumps('Processed DynamoDB Stream records.')
      }
    except Exception as e:
      return {
          'statusCode': 400,
          'body': json.dumps(f'An error occurred: {str(e)}')
      }

def generate_title_and_save_to_dynamodb(diary_content, record):
    api_endpoint = "https://api.openai.com/v1/chat/completions"
    api_key = get_parameter_from_parameter_store('OpenAI_API_KEY')
    
    request_data = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": diary_content}],
        "temperature": 0.7
    }
    
    response = send_request_to_openai_api(api_endpoint, api_key, request_data)
    generated_title = json.loads(response)['choices'][0]['message']['content']
    
    dynamodb = boto3.resource('dynamodb')
    table_name = os.environ['TABLE_NAME']
    table = dynamodb.Table(table_name)
    table.put_item(Item={'user_id': record['dynamodb']['NewImage']['user_id']['S'], 'date': record['dynamodb']['NewImage']['date']['S'], 'title': generated_title})

def get_parameter_from_parameter_store(parameter_name):
    ssm = boto3.client('ssm')
    response = ssm.get_parameter(Name=parameter_name, WithDecryption=True)
    return response['Parameter']['Value']

def send_request_to_openai_api(api_endpoint, api_key, request_data):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + api_key
    }

    data = json.dumps(request_data).encode('utf-8')
    req = urllib.request.Request(api_endpoint, data=data, headers=headers)
    response = urllib.request.urlopen(req).read().decode('utf-8')
    
    return response
