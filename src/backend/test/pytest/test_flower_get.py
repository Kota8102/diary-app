import pytest
from flower_get.flower_get import validate_query_params


def test_validate_query_params():
    """validate_query_params関数のテスト"""
    event = {"queryStringParameters": {"date": "2024-03-15"}}
    assert validate_query_params(event) == "2024-03-15"


def test_calidata_error_parms():
    """日付パラメータが不正な場合のテスト"""

    event = {"queryStringParameters": {}}
    with pytest.raises(ValueError):
        validate_query_params(event)

    event = {"queryStringParameters": {"date": "error "}}
    with pytest.raises(ValueError):
        validate_query_params(event)

    event = {"queryStringParameters": {"date": "20240315"}}
    with pytest.raises(ValueError):
        validate_query_params(event)


# テストデータをfixtureで定義
@pytest.fixture
def valid_event():
    return {
        "requestContext": {"authorizer": {"claims": {"sub": "test-user-id"}}},
        "queryStringParameters": {"date": "2024-03-20"},
    }


# テストデータをfixtureで定義
@pytest.fixture
def s3_image_response():
    return b"test_image_data"
