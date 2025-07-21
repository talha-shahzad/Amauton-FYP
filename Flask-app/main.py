from flask import Flask, request, jsonify
import re
import cv2
import numpy as np
import io
import requests
from nltk.corpus import wordnet
from nltk.stem import WordNetLemmatizer
import pint
import nltk
from tensorflow.keras.applications import VGG16
from tensorflow.keras.preprocessing import image as tf_image
from tensorflow.keras.applications.vgg16 import preprocess_input
from sklearn.metrics.pairwise import cosine_similarity

# Initialize Flask app
app = Flask(__name__)

# Initialize NLTK and Pint
nltk.download('wordnet')
lemmatizer = WordNetLemmatizer()
ureg = pint.UnitRegistry()

# Initialize VGG16 model for image feature extraction
image_model = VGG16(weights='imagenet', include_top=False, input_shape=(224, 224, 3))

# Unit mapping for normalizing units
UNIT_MAPPING = {
    "gb": "gigabyte",
    "mb": "megabyte",
    "kb": "kilobyte",
    "tb": "terabyte",
    "kg": "kilogram",
    "g": "gram",
    "lb": "pound",
    "oz": "ounce",
    "cm": "centimeter",
    "m": "meter",
    "km": "kilometer",
    "ft": "foot",
    "in": "inch",
}

# Helper Functions

def normalize_word(word):
    """Normalize words to handle units and abbreviations."""
    if word in UNIT_MAPPING:
        return UNIT_MAPPING[word]
    try:
        parsed_unit = ureg(word)
        return str(parsed_unit.units).singular
    except:
        return lemmatizer.lemmatize(word)

def clean_and_split_title(title):
    """Clean and normalize the title into a list of words."""
    title = title.lower()
    title = re.sub(r'[^a-z0-9\s]', '', title)
    words = title.split()
    return [normalize_word(word) for word in words]

def check_title_consistency(title1, title2):
    """Check if two titles are consistent based on word matching."""
    words1 = clean_and_split_title(title1)
    words2 = clean_and_split_title(title2)
    return all(word in words2 for word in words1) and all(word in words1 for word in words2)

def extract_image_features(img_bytes):
    """Extract features from an image using the VGG16 model."""
    img = tf_image.load_img(io.BytesIO(img_bytes), target_size=(224, 224))
    img_array = tf_image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    features = image_model.predict(img_array).flatten()
    return features

# Routes

@app.route('/compare', methods=['POST'])
def compare_products():
    """Compare two products based on images and titles."""
    try:
        # Parse request data
        data = request.json
        image_url1 = data['image1']
        image_url2 = data['image2']
        title1 = data['title1']
        title2 = data['title2']

        # Fetch images from URLs with error handling
        try:
            image1_bytes = requests.get(image_url1).content
        except:
            image1_bytes = None

        try:
            image2_bytes = requests.get(image_url2).content
        except:
            image2_bytes = None

        if not image1_bytes or not image2_bytes:
            # Handle missing or invalid images
            return jsonify({
                "image_similarity": 0.0,
                "images_similar": False,
                "titles_consistent": False,
                "overall_match": False
            }), 200
        # Extract image features and compute similarity
        image_features1 = extract_image_features(image1_bytes)
        image_features2 = extract_image_features(image2_bytes)
        image_similarity = float(cosine_similarity([image_features1], [image_features2])[0][0])
        image_threshold = 0.6

        # Check title consistency
        title_consistent = check_title_consistency(title1, title2)

        # Compile results
        result = {
            "image_similarity": image_similarity,
            "images_similar": image_similarity > image_threshold,
            "titles_consistent": title_consistent,
            "overall_match": (image_similarity > image_threshold) and title_consistent
        }
        return jsonify(result)
    except Exception as e:
        return jsonify({
                "image_similarity": 0.0,
                "images_similar": False,
                "titles_consistent": False,
                "overall_match": False
            }), 200

if __name__ == "__main__":
    app.run(debug=True)
