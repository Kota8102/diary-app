import json
import boto3
import base64
import os

def lambda_handler(event, context):
    try:
        user_id = event['queryStringParameters']['user_id']
        date = event['queryStringParameters']['date']
        
        image = get_img_from_s3(user_id, date)
        
        if image:
            return {
                'statusCode': 200,
                'body': json.dumps({'Image': image})
            }
        else:
            return {
                'statusCode': 404,
                'body': json.dumps('Image not found')
            }
    except Exception as e:
        return {
            'statusCode': 400,
            'body': json.dumps(f'An error occurred: {str(e)}')
        }

def get_img_from_s3(user_id, date):
    try: 
        s3 = boto3.client('s3')
        bucket_name = os.environ["BUCKET_NAME"]
        s3_key = f"generated_images/{user_id}-{date}.png"
        responce = s3.get_object(Bucket=bucket_name, Key=s3_key)
        body = responce['Body'].read()
        body = base64.b64encode(body) 
        return body 
    except Exception as e:
        print(f"Error fetching data from DynamoDB: {e}")
        return None
