import pandas as pd
import json
from pymongo import MongoClient

# MongoDB connection details
client = MongoClient('mongodb://localhost:27017/')
db = client['Amazon'] 
collection = db['trends_data']  

# Fetch all data from the MongoDB collection
data = list(collection.find({}))

# Convert the fetched data into a DataFrame
df = pd.DataFrame(data)

# Check if DataFrame is empty
if df.empty:
    result = {'error': 'No data found in the collection.'}
else:
    # Convert necessary columns to numeric types only if they exist
    if 'ratings' in df.columns:
        df['ratings'] = pd.to_numeric(df['ratings'], errors='coerce')
    if 'no_of_ratings' in df.columns:
        df['no_of_ratings'] = pd.to_numeric(df['no_of_ratings'].str.replace(',', ''), errors='coerce')
    if 'sold_in_last_month' in df.columns:
        df['sold_in_last_month'] = pd.to_numeric(df['sold_in_last_month'], errors='coerce')
    if 'BSR_classificationRanks_rank' in df.columns:
        df['BSR_classificationRanks_rank'] = pd.to_numeric(df['BSR_classificationRanks_rank'], errors='coerce')
    if 'BSR_displayGroupRanks_rank' in df.columns:
        df['BSR_displayGroupRanks_rank'] = pd.to_numeric(df['BSR_displayGroupRanks_rank'], errors='coerce')

    # Define weights for each factor
    weight_bsr = 0.4
    weight_ratings = 0.3
    weight_sold = 0.3

    # Invert BSR because a lower rank is better
    if 'BSR_classificationRanks_rank' in df.columns:
        df['BSR_inverted'] = df['BSR_classificationRanks_rank'].max() - df['BSR_classificationRanks_rank']

    # Calculate the weighted score (no normalization)
    df['score'] = (weight_bsr * df['BSR_inverted'].fillna(0)) + (weight_ratings * df['ratings'].fillna(0)) + (weight_sold * df['sold_in_last_month'].fillna(0))

    # Sort by score in descending order and get the top 5 products overall
    top5_recommendations = df.sort_values(by='score', ascending=False).head(5)
    top5_recommendations = top5_recommendations[['name', 'ratings', 'sold_in_last_month', 'BSR_classificationRanks_rank', 'score', 'link', 'image']]

    #  Sort by Main Category BSR to get the top products for each main category
    if 'main_category' in df.columns:
        top_products_main_category = df.sort_values(by='BSR_classificationRanks_rank', ascending=True).groupby('main_category').head(1)
    else:
        top_products_main_category = pd.DataFrame(columns=['name', 'main_category', 'BSR_classificationRanks_rank', 'link'])

    #  Sort by Sub-Category BSR to get the top products for each sub-category
    if 'sub_category' in df.columns:
        top_products_sub_category = df.sort_values(by='BSR_displayGroupRanks_rank', ascending=True).groupby(['main_category', 'sub_category']).head(1)
    else:
        top_products_sub_category = pd.DataFrame(columns=['name', 'main_category', 'sub_category', 'BSR_displayGroupRanks_rank', 'link'])

    # Prepare the results as JSON
    result = {
        'top5_recommendations': top5_recommendations.to_dict(orient='records'),
        'top_products_main_category': top_products_main_category[['name', 'main_category', 'BSR_classificationRanks_rank', 'link', 'image']].to_dict(orient='records'),
        'top_products_sub_category': top_products_sub_category[['name', 'main_category', 'sub_category', 'BSR_displayGroupRanks_rank', 'link', 'image']].to_dict(orient='records')
    }

# Print the result as a JSON string
print(json.dumps(result))
