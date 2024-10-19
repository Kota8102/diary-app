import importlib.util
import json
import os
from unittest.mock import MagicMock, patch

import pytest

# Load the module containing the lambda function
module_name = 'can_creat_bouquet'
module_path = os.path.abspath(os.path.join(
    os.path.dirname(__file__), '../..', 'lambda', 'can_creat_bouquet', 'can_creat_bouquet.py'))
spec = importlib.util.spec_from_file_location(module_name, module_path)
bouquet_handler = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bouquet_handler)


@patch.object(bouquet_handler.boto3, 'resource')
@patch.dict('os.environ', {'BOUQUET_TABLE_NAME': 'TestBouquetTable', 'GENERATIVE_AI_TABLE_NAME': 'TestGenerativeTable'})
def test_lambda_handler_bouquet_already_created(mock_boto_resource):
    """Test case where bouquet has already been created for the week."""
    # Set up mock DynamoDB resource
    mock_dynamodb = MagicMock()

    # Mock bouquet table response (existing bouquet)
    mock_bouquet_table = MagicMock()
    mock_bouquet_table.get_item.return_value = {'Item': {}}  # Bouquet exists
    mock_dynamodb.Table.side_effect = lambda name: mock_bouquet_table if name == 'TestBouquetTable' else None

    # Mock generative AI table response (any flower count)
    mock_flower_table = MagicMock()
    mock_flower_table.scan.return_value = {
        'Items': [{}] * 3  # Mocking 3 flower entries
    }
    mock_dynamodb.Table.side_effect = lambda name: mock_flower_table if name == 'TestGenerativeTable' else mock_bouquet_table

    mock_boto_resource.return_value = mock_dynamodb

    # Mock context
    class Context:
        def __init__(self):
            self.identity = MagicMock()
            self.identity.cognito_identity_id = '123'

    event = {
        "requestContext": {
            "authorizer": {
                "claims": {
                    "sub": "user123"
                }
            }
        }
    }
    context = Context()

    # Call the Lambda function
    response = bouquet_handler.lambda_handler(event, context)

    # Debugging: Print the response for analysis
    print("Response:", response)  # Add this line to check the actual response

    # Check the response
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    assert body['can_create_bouquet'] is False


@patch.object(bouquet_handler.boto3, 'resource')
@patch.dict('os.environ', {'BOUQUET_TABLE_NAME': 'TestBouquetTable', 'GENERATIVE_AI_TABLE_NAME': 'TestGenerativeTable'})
def test_lambda_handler_cannot_create_bouquet_no_flowers(mock_boto_resource):
    """Test case where bouquet cannot be created due to insufficient flowers."""
    # Set up mock DynamoDB resource
    mock_dynamodb = MagicMock()

    # Mock bouquet table response (no existing bouquet)
    mock_bouquet_table = MagicMock()
    mock_bouquet_table.get_item.return_value = {}
    mock_dynamodb.Table.side_effect = lambda name: mock_bouquet_table if name == 'TestBouquetTable' else None

    # Mock generative AI table response (less than 5 flowers)
    mock_flower_table = MagicMock()
    mock_flower_table.query.return_value = {
        'Items': [{}] * 4  # Mocking 4 flower entries
    }
    mock_dynamodb.Table.side_effect = lambda name: mock_flower_table if name == 'TestGenerativeAI_TABLE_NAME' else mock_bouquet_table

    mock_boto_resource.return_value = mock_dynamodb

    # Mock context
    class Context:
        def __init__(self):
            self.identity = MagicMock()
            self.identity.cognito_identity_id = '123'

    event = {
        "requestContext": {
            "authorizer": {
                "claims": {
                    "sub": "user123"
                }
            }
        }
    }
    context = Context()

    # Call the Lambda function
    response = bouquet_handler.lambda_handler(event, context)

    # Check the response
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    assert body['can_create_bouquet'] is False


@patch.object(bouquet_handler.boto3, 'resource')
@patch.dict('os.environ', {'BOUQUET_TABLE_NAME': 'TestBouquetTable', 'GENERATIVE_AI_TABLE_NAME': 'TestGenerativeTable'})
def test_lambda_handler_bouquet_already_created(mock_boto_resource):
    """Test case where bouquet has already been created for the week."""
    # Set up mock DynamoDB resource
    mock_dynamodb = MagicMock()

    # Mock bouquet table response (existing bouquet)
    mock_bouquet_table = MagicMock()
    mock_bouquet_table.get_item.return_value = {'Item': {}}  # Bouquet exists
    mock_dynamodb.Table.side_effect = lambda name: mock_bouquet_table if name == 'TestBouquetTable' else None

    # Mock generative AI table response (any flower count)
    mock_flower_table = MagicMock()
    mock_flower_table.query.return_value = {
        'Items': [{}] * 3  # Mocking 3 flower entries
    }
    mock_dynamodb.Table.side_effect = lambda name: mock_flower_table if name == 'TestGenerativeAI_TABLE_NAME' else mock_bouquet_table

    mock_boto_resource.return_value = mock_dynamodb

    # Mock context
    class Context:
        def __init__(self):
            self.identity = MagicMock()
            self.identity.cognito_identity_id = '123'

    event = {
        "requestContext": {
            "authorizer": {
                "claims": {
                    "sub": "user123"
                }
            }
        }
    }
    context = Context()

    # Call the Lambda function
    response = bouquet_handler.lambda_handler(event, context)

    # Check the response
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    assert body['can_create_bouquet'] is False


@patch.object(bouquet_handler.boto3, 'resource')
@patch.dict('os.environ', {'BOUQUET_TABLE_NAME': 'TestBouquetTable', 'GENERATIVE_AI_TABLE_NAME': 'TestGenerativeTable'})
def test_lambda_handler_dynamodb_error(mock_boto_resource):
    """Test case to handle DynamoDB errors (e.g., table not found)."""
    # Set up mock DynamoDB resource to raise an exception
    mock_dynamodb = MagicMock()
    mock_dynamodb.Table.side_effect = Exception('An error occurred')
    mock_boto_resource.return_value = mock_dynamodb

    # Mock context
    class Context:
        def __init__(self):
            self.identity = MagicMock()
            self.identity.cognito_identity_id = '123'

    event = {
        "requestContext": {
            "authorizer": {
                "claims": {
                    "sub": "user123"
                }
            }
        }
    }
    context = Context()

    # Call the Lambda function
    response = bouquet_handler.lambda_handler(event, context)

    # Check the response
    assert response['statusCode'] == 400
    body = json.loads(response['body'])
    # Check for 'error' key in the body
    assert body['error'] == 'An error occurred'
