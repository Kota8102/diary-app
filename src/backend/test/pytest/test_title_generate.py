import importlib.util
import json
import os
from unittest.mock import MagicMock, patch

import pytest

module_name = 'title_generate'
module_path = os.path.abspath(os.path.join(
    os.path.dirname(__file__), '../..', 'lambda', 'title_generate', 'title_generate.py'))
spec = importlib.util.spec_from_file_location(module_name, module_path)
title_generate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(title_generate)


# Mocking region in boto3 configuration using patch.dict
@patch.dict(os.environ, {'TABLE_NAME': 'TestTable'})
@patch.object(title_generate.boto3, 'resource')
@patch.object(title_generate, 'send_request_to_openai_api')
def test_lambda_handler_success(mock_openai_api, mock_boto_resource):
    # Mock OpenAI API response
    mock_openai_api.return_value = json.dumps({
        'choices': [{
            'message': {
                'content': 'Generated Diary Title'
            }
        }]
    })

    # Set up mock DynamoDB resource
    mock_dynamodb = MagicMock()
    mock_table = MagicMock()
    mock_boto_resource.return_value = mock_dynamodb
    mock_dynamodb.Table.return_value = mock_table

    # Create a mock DynamoDB stream event
    event = {
        "Records": [{
            "eventName": "INSERT",
            "dynamodb": {
                "NewImage": {
                    "content": {"S": "This is a diary entry."},
                    "user_id": {"S": "user123"},
                    "date": {"S": "2024-10-18"}
                }
            }
        }]
    }

    # Call the Lambda function
    response = title_generate.lambda_handler(event, None)

    # Check the response
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    assert body == 'Processed DynamoDB Stream records.'

    # Ensure the title was saved in DynamoDB
    mock_table.update_item.assert_called_once_with(
        Key={'user_id': 'user123', 'date': '2024-10-18'},
        UpdateExpression="set title = :t",
        ExpressionAttributeValues={':t': 'Generated Diary Title'}
    )


# Mocking region for error cases
@patch.dict(os.environ, {'TABLE_NAME': 'TestTable'})
@patch.object(title_generate.boto3, 'resource')
@patch.object(title_generate, 'send_request_to_openai_api')
def test_lambda_handler_error(mock_openai_api, mock_boto_resource):
    # Simulate an error from OpenAI API
    mock_openai_api.side_effect = Exception("OpenAI API failure")

    # Set up mock DynamoDB resource
    mock_dynamodb = MagicMock()
    mock_table = MagicMock()
    mock_boto_resource.return_value = mock_dynamodb
    mock_dynamodb.Table.return_value = mock_table

    # Create a mock DynamoDB stream event
    event = {
        "Records": [{
            "eventName": "INSERT",
            "dynamodb": {
                "NewImage": {
                    "content": {"S": "This is a diary entry."},
                    "user_id": {"S": "user123"},
                    "date": {"S": "2024-10-18"}
                }
            }
        }]
    }

    # Call the Lambda function
    response = title_generate.lambda_handler(event, None)

    # Check the response for error
    assert response['statusCode'] == 400
    body = json.loads(response['body'])
    assert "An error occurred" in body


# Test for table not found with region
@patch.dict(os.environ, {'TABLE_NAME': 'TestTable'})
@patch.object(title_generate.boto3, 'resource')
def test_lambda_handler_table_not_found(mock_boto_resource):
    # Set up mock DynamoDB resource with table not found error
    mock_dynamodb = MagicMock()
    mock_dynamodb.Table.side_effect = Exception("Table not found")
    mock_boto_resource.return_value = mock_dynamodb

    # Create a mock DynamoDB stream event
    event = {
        "Records": [{
            "eventName": "INSERT",
            "dynamodb": {
                "NewImage": {
                    "content": {"S": "This is a diary entry."},
                    "user_id": {"S": "user123"},
                    "date": {"S": "2024-10-18"}
                }
            }
        }]
    }

    # Call the Lambda function
    response = title_generate.lambda_handler(event, None)

    # Check the response for error
    assert response['statusCode'] == 400
    body = json.loads(response['body'])
    assert "An error occurred" in body


# Test for getting parameter from Parameter Store with region
@patch.object(title_generate.boto3, 'client')
def test_get_parameter_from_parameter_store(mock_ssm_client):
    # Set up mock SSM client
    mock_ssm = MagicMock()
    mock_ssm.get_parameter.return_value = {
        'Parameter': {'Value': 'mocked-api-key'}}
    mock_ssm_client.return_value = mock_ssm

    # Test the get_parameter function
    result = title_generate.get_parameter_from_parameter_store(
        'OpenAI_API_KEY')

    # Check the result
    assert result == 'mocked-api-key'


# Test for sending request to OpenAI API with region
@patch.object(title_generate, 'urllib')
def test_send_request_to_openai_api(mock_urllib):
    # Mock urllib request and response
    mock_response = MagicMock()
    mock_response.read.return_value = json.dumps({
        'choices': [{
            'message': {
                'content': 'Generated Diary Title'
            }
        }]
    }).encode("utf-8")
    mock_urllib.request.urlopen.return_value = mock_response

    # Test the send_request_to_openai_api function
    api_endpoint = "https://api.openai.com/v1/chat/completions"
    api_key = "mocked-api-key"
    request_data = {"test": "data"}

    response = title_generate.send_request_to_openai_api(
        api_endpoint, api_key, request_data)

    # Check the response
    assert json.loads(response)[
        'choices'][0]['message']['content'] == 'Generated Diary Title'
