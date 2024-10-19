import base64
import json
import os

import boto3


def lambda_handler(event, context):
    """
    AWS Lambda handler function to retrieve a flower image based on the user ID and date.

    This function:
    - Extracts the user ID from the request context using the Cognito identity.
    - Extracts the date from the query parameters in the incoming event.
    - Retrieves the flower ID from DynamoDB using the user ID and date.
    - Fetches the corresponding flower image from an S3 bucket using the flower ID.
    - Returns the image in a base64-encoded format in a JSON response with an HTTP 200 status code.
    - If no image is found, it returns an empty image string with an HTTP 200 status code.
    - If any exceptions occur, it returns an HTTP 400 status code with an error message.

    Args:
        event (dict): Incoming request details, including query parameters, headers, and other data.
        context (object): The context object providing runtime information, including the user identity.

    Returns:
        dict: HTTP response with a status code, headers, and JSON body containing the base64-encoded image or an empty string.
    """
    print("Flower get lambda start")
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
                "headers": {
                    "Content-Type": "image/png",
                    "Access-Control-Allow-Origin": "*",
                },
                "statusCode": 200,
                "body": json.dumps({"Image": ""}),
                "isBase64Encoded": True,
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
    """
    Retrieves the flower ID from DynamoDB for a given user ID and date.

    Args:
        user_id (str): The ID of the user.
        date (str): The date for which the flower image is requested.

    Returns:
        str or None: The flower ID if found, otherwise None.
    """
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
    """
    Retrieves the base64-encoded flower image from S3 using the flower ID.

    Args:
        flower_id (str): The ID of the flower.

    Returns:
        str or None: The base64-encoded image data if found, otherwise None.
    """
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
