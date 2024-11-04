import boto3
from PIL import Image
import io
from datetime import datetime, timedelta

# AWS clients
s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
BUCKET_NAME = "backendstack-apiflowerimagebucket5ac81e41-qv2hl0feinwb"
GENERATIVE_AI_TABLE = "BackendStack-ApigenerativeAiTableB5975AA2-5LG6W354RO5A"

class BouquetImageCreator:
    def __init__(self, flowers):
        self.flowers = flowers
        self.flower_pos = self.calculate_flower_positions()

    def calculate_flower_positions(self):
        flower_count = len(self.flowers)
        flower_positions = {
            5: {
                (1, 1, 1, 1, 1): [[400, 180], [250, 180], [100, 180], [150, 70], [300, 70]],
                # Add additional patterns for 5 flowers...
            },
            # Add patterns for 6 and 7 flowers as needed...
        }
        return flower_positions.get(flower_count, {})

    def create_bouquet_image(self):
        base_image = Image.new('RGBA', (800, 400), (255, 255, 255, 255))  # Base image size
        positions = self.flower_pos.get(tuple(self.flowers), [])
        
        for flower_id, (x, y) in zip(self.flowers, positions):
            flower_image = self.load_flower_image(flower_id)
            base_image.paste(flower_image, (x, y), flower_image)

        return base_image

    def load_flower_image(self, flower_id):
        flower_key = f'flowers/{flower_id}.png'
        flower_image = s3_client.get_object(Bucket=BUCKET_NAME, Key=flower_key)['Body'].read()
        return Image.open(io.BytesIO(flower_image))

def get_flower_ids(user_id, date):
    week_start = date - timedelta(days=date.weekday())  # Get Monday of the week
    flower_ids = []
    table = dynamodb.Table(GENERATIVE_AI_TABLE)
    
    # Retrieve flower IDs for each day from Monday to the given date
    for i in range(7):  # Look back for the last 7 days
        current_date = week_start + timedelta(days=i)
        formatted_date = current_date.strftime('%Y-%m-%d')
        
        try:
            response = table.get_item(
                Key={
                    'user_id': user_id,
                    'date': formatted_date
                }
            )
            if 'Item' in response:
                flower_ids.append(response['Item']['flower_id'])
        except Exception as e:
            print(f"Error fetching flower ID for {formatted_date}: {e}")

    return flower_ids

def lambda_handler(event, context):
    #user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
    #date_str = event["queryStringParameters"]["date"]
    user_id ="22348a88-d011-7046-cb45-f010763d1997"
    date_str = "2024-10-19"

    date = datetime.strptime(date_str, '%Y-%m-%d')

    flower_ids = get_flower_ids(user_id, date)
    
    if len(flower_ids) < 5:
        return {
            'statusCode': 400,
            'body': 'Not enough flowers to create a bouquet.'
        }

    # Create bouquet image
    bouquet_creator = BouquetImageCreator(flower_ids)
    bouquet_image = bouquet_creator.create_bouquet_image()

    # Save bouquet image to S3
    image_buffer = io.BytesIO()
    bouquet_image.save(image_buffer, format='PNG')
    image_buffer.seek(0)
    
    bouquet_key = f'bouquets/{user_id}_{date_str}.png'
    s3_client.put_object(Bucket=BUCKET_NAME, Key=bouquet_key, Body=image_buffer)

    # Register the bouquet in DynamoDB
    week_num = date.isocalendar()[1]
    dynamodb.Table(GENERATIVE_AI_TABLE).put_item(
        Item={
            'user_id': user_id,
            'week': week_num,
            # Other attributes as needed...
        }
    )

    return {
        'statusCode': 200,
        'body': f'Bouquet image created and saved as {bouquet_key}'
    }
