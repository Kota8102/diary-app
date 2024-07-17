import json
import boto3 
import os
import requests
from openai import OpenAI

def lambda_handler(event, context):
    print("Flower Generate Function Start")
    try:
        for record in event['Records']:
            if record['eventName'] == 'INSERT':
                diary_content = record['dynamodb']['NewImage']['content']['S']
                generate_image_and_save_to_dynamodb(diary_content, record)
                print(f"content: {diary_content}")
        return {
            'statusCode': 200,
            'body': json.dumps('Processed DynamoDB Stream records.')
        }
    except Exception as e:
        return {
            'statusCode': 400,
            'body': json.dumps(f'An error occurred: {str(e)}')
        }

def generate_image_and_save_to_dynamodb(diary_content, record):
    # Generate image using OpenAI DALL-E API
    api_key = get_parameter_from_parameter_store('OpenAI_API_KEY')
    img_url = generate_image_dalle(api_key, diary_content)
    
    # Upload image to S3
    s3_bucket = os.environ['FLOWER_BUCKET_NAME']
    s3_key = f"generated_images/{record['dynamodb']['NewImage']['date']['S']}.png"
    s3_url = upload_image_to_s3(img_url, s3_bucket, s3_key)
    
    # Save S3 URL to DynamoDB
    save_image_url_to_dynamodb(record, s3_url)

def get_parameter_from_parameter_store(parameter_name):
    ssm = boto3.client('ssm')
    response = ssm.get_parameter(Name=parameter_name, WithDecryption=True)
    return response['Parameter']['Value']

def generate_image_dalle(api_key, prompt):
    client = OpenAI()
    client.api_key = api_key
    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1
        )
        img_url = response['data'][0]['url']
        return img_url
    except Exception as e:
        print(f"Error generating image: {e}")
        raise

def upload_image_to_s3(img_url, bucket_name, s3_key):
    response = requests.get(img_url)
    if response.status_code == 200:
        s3 = boto3.client('s3')
        s3.put_object(Bucket=bucket_name, Key=s3_key, Body=response.content)
        s3_url = f"https://{bucket_name}.s3.amazonaws.com/{s3_key}"
        return s3_url
    else:
        print(f"Error downloading image: {response.status_code}")
        raise Exception("Failed to download image from DALL-E")

def save_image_url_to_dynamodb(record, s3_url):
    dynamodb = boto3.resource('dynamodb')
    table_name = os.environ['GENERATIVE_AI_TABLE_NAME']
    table = dynamodb.Table(table_name)
    table.put_item(Item={
        'user_id': record['dynamodb']['NewImage']['user_id']['S'],
        'date': record['dynamodb']['NewImage']['date']['S'],
        'image_url': s3_url
    })
