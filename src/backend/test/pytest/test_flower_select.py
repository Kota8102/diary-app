import importlib.util
import json
import os
from unittest.mock import MagicMock, patch

import pytest

module_name = 'flower_select'
module_path = os.path.abspath(os.path.join(
    os.path.dirname(__file__), '../..', 'lambda', 'flower_select', 'flower_select.py'))
spec = importlib.util.spec_from_file_location(module_name, module_path)
flower_select = importlib.util.module_from_spec(spec)
spec.loader.exec_module(flower_select)


@patch.object(flower_select.boto3, 'resource')
@patch.object(flower_select.boto3, 'client')
@patch.object(flower_select.requests, 'post')
@patch.dict('os.environ', {'GENERATIVE_AI_TABLE_NAME': 'TestTable'})
def test_lambda_handler_no_flower_id(mock_requests_post, mock_boto_client, mock_boto_resource):
    # Set up mock DynamoDB resource
    mock_dynamodb = MagicMock()
    mock_table = MagicMock()
    mock_table.update_item.return_value = {
        'ResponseMetadata': {'HTTPStatusCode': 200}}
    mock_dynamodb.Table.return_value = mock_table
    mock_boto_resource.return_value = mock_dynamodb

    # Mock Systems Manager (SSM) client for parameter store
    mock_ssm_client = MagicMock()
    mock_ssm_client.get_parameter.return_value = {
        'Parameter': {'Value': 'mock-api-key'}}
    mock_boto_client.return_value = mock_ssm_client

    # Mock the external API call to return no flower ID
    mock_requests_response = MagicMock()
    mock_requests_response.json.return_value = {
        'answer': None}  # Mock response with no flower ID
    mock_requests_post.return_value = mock_requests_response

    # Define the mock event
    event = {
        "Records": [
            {
                "eventName": "INSERT",
                "dynamodb": {
                    "NewImage": {
                        "content": {"S": "Today I felt happy."},
                        "date": {"S": "2024-10-01"},
                        "user_id": {"S": "mock-user-id"}
                    }
                }
            }
        ]
    }

    # Mock context
    class Context:
        def __init__(self):
            self.identity = MagicMock()

    context = Context()

    # Call the Lambda function
    response = flower_select.lambda_handler(event, context)

    # Validate the response
    assert response['statusCode'] == 200
    assert json.loads(response['body']) == "Processed DynamoDB Stream records."
    # Check that update_item is still called
    mock_table.update_item.assert_called_once()


@patch.object(flower_select.boto3, 'resource')
@patch.object(flower_select.boto3, 'client')
@patch.object(flower_select.requests, 'post')
@patch.dict('os.environ', {'GENERATIVE_AI_TABLE_NAME': 'TestTable'})
def test_lambda_handler_no_flower_id(mock_requests_post, mock_boto_client, mock_boto_resource):
    # Set up mock DynamoDB resource
    mock_dynamodb = MagicMock()
    mock_table = MagicMock()
    mock_table.update_item.return_value = {
        'ResponseMetadata': {'HTTPStatusCode': 200}}
    mock_dynamodb.Table.return_value = mock_table
    mock_boto_resource.return_value = mock_dynamodb

    # Mock Systems Manager (SSM) client for parameter store
    mock_ssm_client = MagicMock()
    mock_ssm_client.get_parameter.return_value = {
        'Parameter': {'Value': 'mock-api-key'}}
    mock_boto_client.return_value = mock_ssm_client

    # Mock the external API call to return no flower ID
    mock_requests_response = MagicMock()
    mock_requests_response.json.return_value = {
        'answer': None}  # Mock response with no flower ID
    mock_requests_post.return_value = mock_requests_response

    # Define the mock event
    event = {
        "Records": [
            {
                "eventName": "INSERT",
                "dynamodb": {
                    "NewImage": {
                        "content": {"S": "Today I felt happy."},
                        "date": {"S": "2024-10-01"},
                        "user_id": {"S": "mock-user-id"}
                    }
                }
            }
        ]
    }

    # Mock context
    class Context:
        def __init__(self):
            self.identity = MagicMock()

    context = Context()

    # Call the Lambda function
    response = flower_select.lambda_handler(event, context)

    # Validate the response
    assert response['statusCode'] == 200
    assert json.loads(response['body']) == "Processed DynamoDB Stream records."
    # Check that update_item is still called
    mock_table.update_item.assert_called_once()


# Test for handling of errors during DynamoDB update
@patch.object(flower_select.boto3, 'resource')
@patch.object(flower_select.boto3, 'client')
@patch.object(flower_select.requests, 'post')
@patch.dict('os.environ', {'GENERATIVE_AI_TABLE_NAME': 'TestTable'})
def test_lambda_handler_dynamodb_update_error(mock_requests_post, mock_boto_client, mock_boto_resource):
    # Set up mock DynamoDB resource to raise an exception
    mock_dynamodb = MagicMock()
    mock_table = MagicMock()
    mock_table.update_item.side_effect = Exception("DynamoDB update failed")
    mock_dynamodb.Table.return_value = mock_table
    mock_boto_resource.return_value = mock_dynamodb

    # Mock Systems Manager (SSM) client for parameter store
    mock_ssm_client = MagicMock()
    mock_ssm_client.get_parameter.return_value = {
        'Parameter': {'Value': 'mock-api-key'}}
    mock_boto_client.return_value = mock_ssm_client

    # Mock the external API call to return a mock flower ID
    mock_requests_response = MagicMock()
    mock_requests_response.json.return_value = {
        'answer': 'mock-flower-id'}  # Mock response from external API
    mock_requests_post.return_value = mock_requests_response

    # Define the mock event
    event = {
        "Records": [
            {
                "eventName": "INSERT",
                "dynamodb": {
                    "NewImage": {
                        "content": {"S": "Today I felt happy."},
                        "date": {"S": "2024-10-01"},
                        "user_id": {"S": "mock-user-id"}
                    }
                }
            }
        ]
    }

    # Mock context
    class Context:
        def __init__(self):
            self.identity = MagicMock()

    context = Context()

    # Call the Lambda function
    response = flower_select.lambda_handler(event, context)

    # Validate the response
    assert response['statusCode'] == 400
    assert "An error occurred" in json.loads(response['body'])


# Test for handling of errors when getting parameter from parameter store
@patch.object(flower_select.boto3, 'resource')
@patch.object(flower_select.boto3, 'client')
@patch.object(flower_select.requests, 'post')
@patch.dict('os.environ', {'GENERATIVE_AI_TABLE_NAME': 'TestTable'})
def test_lambda_handler_ssm_error(mock_requests_post, mock_boto_client, mock_boto_resource):
    # Set up mock DynamoDB resource
    mock_dynamodb = MagicMock()
    mock_table = MagicMock()
    mock_table.update_item.return_value = {
        'ResponseMetadata': {'HTTPStatusCode': 200}}
    mock_dynamodb.Table.return_value = mock_table
    mock_boto_resource.return_value = mock_dynamodb

    # Mock Systems Manager (SSM) client to raise an exception
    mock_ssm_client = MagicMock()
    mock_ssm_client.get_parameter.side_effect = Exception(
        "SSM parameter retrieval failed")
    mock_boto_client.return_value = mock_ssm_client

    # Define the mock event
    event = {
        "Records": [
            {
                "eventName": "INSERT",
                "dynamodb": {
                    "NewImage": {
                        "content": {"S": "Today I felt happy."},
                        "date": {"S": "2024-10-01"},
                        "user_id": {"S": "mock-user-id"}
                    }
                }
            }
        ]
    }

    # Mock context
    class Context:
        def __init__(self):
            self.identity = MagicMock()

    context = Context()

    # Call the Lambda function
    response = flower_select.lambda_handler(event, context)

    # Validate the response
    assert response['statusCode'] == 400
    assert "An error occurred" in json.loads(response['body'])
