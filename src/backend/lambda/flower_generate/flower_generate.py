import json
import boto3 
import os
import urllib.request
from openai import OpenAI

def lambda_handler(event, context):
    print("Flower Generate Function Start")
    try:
        for record in event['Records']:
            print(f"record{record}")
            if record['eventName'] == 'INSERT':
                diary_content = record['dynamodb']['NewImage']['content']['S']
                print(f"content: {diary_content}")
                generate_image_and_save_to_dynamodb(diary_content, record)
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
    print("generate_image_and_save_to_dynamoDB")
    # Generate image using OpenAI DALL-E API
    api_key = get_parameter_from_parameter_store('OpenAI_API_KEY')
    img_url = generate_image_dalle(api_key, diary_content)
    print(f"image url: {img_url}")

    # Upload image to S3
    s3_bucket = os.environ['FLOWER_BUCKET_NAME']
    s3_key = f"generated_images/{record['dynamodb']['NewImage']['user_id']['S']}-{record['dynamodb']['NewImage']['date']['S']}.png"
    s3_url = upload_image_to_s3(img_url, s3_bucket, s3_key)
    
    # Save S3 URL to DynamoDB
    save_image_url_to_dynamodb(record, s3_url)

def get_parameter_from_parameter_store(parameter_name):
    print("get_parameter_from_parameter_store")
    try:
        ssm = boto3.client('ssm')
        response = ssm.get_parameter(Name=parameter_name, WithDecryption=True)
        return response['Parameter']['Value']
    except Exception as e:
        raise Exception(f"Failed to get parameter from parameter store: {e}")


def generate_image_dalle(api_key, prompt):
    print("generate_image_dalle")
    client = OpenAI(api_key=api_key)  
    print("created openai client")
    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1
        )
        print(f"Response: {response}")
        img_url = response.data[0].url
        return img_url
    except Exception as e:
        print(f"Error generating image: {e}")
        raise

def upload_image_to_s3(img_url, bucket_name, s3_key):
    print("upload_image_to_s3")
    print(f"bucket name: {bucket_name}")
    try:
        with urllib.request.urlopen(img_url) as response:
            if response.status == 200:
                try:
                    s3 = boto3.client('s3')
                    s3.put_object(Bucket=bucket_name, Key=s3_key, Body=response.read())
                    s3_url = f"https://{bucket_name}.s3.amazonaws.com/{s3_key}"
                    return s3_url
                except boto3.exceptions.S3UploadFailedError as e:
                    print(f"Error uploading image to S3: {e}")
                    raise
                except Exception as e:
                    print(f"Unexpected error uploading image to S3: {e}")
                    raise
            else:
                print(f"Error downloading image, status code: {response.status}")
                raise Exception("Failed to download image from URL")
    except urllib.error.URLError as e:
        print(f"Error downloading image: {e.reason}")
        raise
    except Exception as e:
        print(f"Unexpected error downloading image: {e}")
        raise
  

def save_image_url_to_dynamodb(record, s3_url):
    print("save_image_url_to_dynamodb")
    
    try:
        dynamodb = boto3.resource('dynamodb')
        table_name = os.environ['GENERATIVE_AI_TABLE_NAME']
        table = dynamodb.Table(table_name)

        item = {
            'user_id': record['dynamodb']['NewImage']['user_id']['S'],
            'date': record['dynamodb']['NewImage']['date']['S'],
            'image_url': s3_url
        }

        table.put_item(Item=item)
        print("Image URL saved to DynamoDB successfully.")

    except Exception as e:
        print(f"Error saving to DynamoDB: {e}")
        raise