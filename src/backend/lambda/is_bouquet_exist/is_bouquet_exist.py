import json
import os
from datetime import datetime, timezone

import boto3


def get_current_week():
    """
    Get the current year and week number in ISO calendar format.

    Returns:
        tuple: A tuple containing the current year and week number (year, week).
    """
    current_date = datetime.now(timezone.utc)
    current_year, current_week, _ = current_date.isocalendar()
    return current_year, current_week


def check_bouquet_created(user_id, current_year, current_week):
    """
    Check if a bouquet has already been created for the given user in the specified week.

    Args:
        user_id (str): The ID of the user.
        current_year (int): The current year.
        current_week (int): The current week number.

    Returns:
        bool: True if a bouquet has already been created, otherwise False.
    """
    dynamodb = boto3.resource('dynamodb')
    bouquet_table_name = os.environ["BOUQUET_TABLE_NAME"]
    bouquet_table = dynamodb.Table(bouquet_table_name)
    bouquet_response = bouquet_table.get_item(
        Key={
            'user_id': user_id,
            'year_week': f"{current_year}-{current_week}"
        }
    )
    return 'Item' in bouquet_response


def count_flowers_in_week(user_id, current_year, current_week):
    """
    Count the number of flowers created by the user in the current week.

    Args:
        user_id (str): The ID of the user.
        current_year (int): The current year.
        current_week (int): The current week number.

    Returns:
        int: The number of flowers created by the user in the specified week.
    """
    dynamodb = boto3.resource('dynamodb')
    generative_ai_table_name = os.environ["GENERATIVE_AI_TABLE_NAME"]
    generative_ai_table = dynamodb.Table(generative_ai_table_name)
    flower_response = generative_ai_table.scan(
        FilterExpression='user_id = :user_id AND begins_with(#date, :year_week)',
        ExpressionAttributeNames={
            '#date': 'date'
        },
        ExpressionAttributeValues={
            ':user_id': user_id,
            ':year_week': f"{current_year}-W{current_week}"
        }
    )
    return len(flower_response.get('Items', []))


def lambda_handler(event, context):
    """
    Main handler for the Lambda function. Determines whether the user can create a bouquet
    for the current week based on the number of flowers they have created.

    Args:
        event (dict): The event payload that triggered the Lambda function.
        context (object): The runtime information of the Lambda function.

    Returns:
        dict: A response containing the status code and whether the user can create a bouquet (boolean).
    """
    try:
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

        current_year, current_week = get_current_week()

        if check_bouquet_created(user_id, current_year, current_week):
            return {
                'statusCode': 200,
                'body': json.dumps({'can_create_bouquet': False})
            }

        flower_count = count_flowers_in_week(
            user_id, current_year, current_week)

        if flower_count >= 5:
            return {
                'statusCode': 200,
                'body': json.dumps({'can_create_bouquet': True})
            }
        else:
            return {
                'statusCode': 200,
                'body': json.dumps({'can_create_bouquet': False})
            }
    except Exception as e:
        # Log the exception (consider using a logging framework for better log management)
        print(f"Error: {str(e)}")
        return {
            'statusCode': 400,
            'body': json.dumps({'error': str(e)})
        }
