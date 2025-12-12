import os
import json
import zipfile
import shutil
from datetime import datetime, timedelta
import random

def generate_mock_instagram_zip(output_filename="instagram_mock.zip"):
    # Create a temporary directory structure
    base_dir = "mock_instagram_data"
    content_dir = os.path.join(base_dir, "content")
    media_dir = os.path.join(base_dir, "media", "posts")
    
    if os.path.exists(base_dir):
        shutil.rmtree(base_dir)
        
    os.makedirs(content_dir, exist_ok=True)
    os.makedirs(media_dir, exist_ok=True)

    # Generate Mock Posts
    posts = []
    start_date = datetime(2012, 1, 1) # Ancient history for "Gatekeeper"
    
    for i in range(1, 21): # 20 posts
        # Random date between 2012 and 2018 (safe zone)
        days_offset = random.randint(0, 365 * 6)
        post_date = start_date + timedelta(days=days_offset)
        iso_timestamp = post_date.isoformat()

        # Create dummy image file
        image_filename = f"IMG_{i}.jpg"
        image_path = os.path.join(media_dir, image_filename)
        # Create a simple 1x1 black pixel JPG (header only needed for file existence checks usually)
        with open(image_path, "wb") as f:
            # Minimal JPG header
            f.write(b'\xff\xd8\xff\xe0\x00\x10\x4a\x46\x49\x46\x00\x01\x01\x01\x00\x48\x00\x48\x00\x00\xff\xdb\x00\x43\x00\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x03\x01\x22\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x15\x00\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xff\xd9')

        post = {
            "uri": f"media/posts/{image_filename}",
            "creation_timestamp": int(post_date.timestamp()),
            "upload_timestamp": int(post_date.timestamp()),
            "title": f"Mock Post {i} - {post_date.strftime('%Y-%m-%d')}",
            "media_metadata": {
                 "photo_metadata": {
                     "exif_data": []
                 }
            }
        }
        posts.append(post)

    # Write posts_1.json
    with open(os.path.join(content_dir, "posts_1.json"), "w") as f:
        json.dump(posts, f, indent=2)

    # Zip it up
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(base_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # Archive name should be relative to base_dir
                arcname = os.path.relpath(file_path, base_dir)
                zipf.write(file_path, arcname)

    # Cleanup
    shutil.rmtree(base_dir)
    print(f"Successfully generated {output_filename} with {len(posts)} mock posts.")

if __name__ == "__main__":
    generate_mock_instagram_zip()
