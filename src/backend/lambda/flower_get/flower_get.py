import base64
import json
import os

import boto3


def lambda_handler(event, context):
    try:
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        date = event["queryStringParameters"]["date"]

        flower_id = get_flower_id_from_db(user_id, date)
        image = get_img_from_s3(flower_id)

        if image:
            return {
                "headers": {
                    "Content-Type": "image/png",
                    "Access-Control-Allow-Origin": "*",
                },
                "statusCode": 200,
                "body": json.dumps({"Image": image}),
                "isBase64Encoded": True,
            }
        else:
            return {
                "statusCode": 404,
                "body": json.dumps("Image not found"),
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


def get_flower_id_from_db(user_id, date):
    try:
        dynamodb = boto3.resource("dynamodb")
        table_name = os.environ["GENERATIVE_AI_TABLE_NAME"]
        table = dynamodb.Table(table_name)

        response = table.get_item(
            Key={
                'user_id': user_id,
                'date': date
            }
        )

        if 'Item' in response:
            return response['Item'].get('flower_id')
        else:
            return None

    except Exception as e:
        print(f"Error fetching flower ID from DynamoDB: {e}")
        return None


def get_img_from_s3(flower_id):
    try:
        s3 = boto3.client("s3")
        bucket_name = os.environ["BUCKET_NAME"]
        s3_key = f"flowers/{flower_id}.png"
        response = s3.get_object(Bucket=bucket_name, Key=s3_key)
        body = response["Body"].read()
        body = base64.b64encode(body).decode("utf-8")
        return body
    except Exception as e:
        print(f"Error fetching data from S3: {e}")
        return None
