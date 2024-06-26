import json
import boto3
import os

def lambda_handler(event, context):
    try:
        # Extract parameters from the API Gateway event
        user_id = event['queryStringParameters']['user_id']
        date = event['queryStringParameters']['date']
        
        # Fetch item from DynamoDB
        title = get_title_from_dynamodb(user_id, date)
        
        if title:
            return {
                'statusCode': 200,
                'body': json.dumps({'title': title})
            }
        else:
            return {
                'statusCode': 404,
                'body': json.dumps('Title not found')
            }
    except Exception as e:
        return {
            'statusCode': 400,
            'body': json.dumps(f'An error occurred: {str(e)}')
        }

def get_title_from_dynamodb(user_id, date):
    dynamodb = boto3.resource('dynamodb')
    table_name = os.environ['TABLE_NAME']
    table = dynamodb.Table(table_name)
    
    try:
        response = table.get_item(
            Key={
                'user_id': user_id,
                'date': date
            }
        )
        
        if 'Item' in response:
            return response['Item'].get('title')
        else:
            return None
    except Exception as e:
        print(f"Error fetching data from DynamoDB: {e}")
        return None
