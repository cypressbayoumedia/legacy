import json
import random

def generate_dummy_data(output_file="dummy_data.json"):
    dummy_text = """
    Just finished a marathon! #running #fitness
    Can't believe it's already Monday. Coffee needed.
    Check out this recipe for lasagna: ...
    Had a great time at the concert last night!
    Remember to vote!
    My dog is the cutest.
    Learning Python is fun but challenging.
    Contact me at test-user@example.com if you want to colg.
    Also call +15550199 for urgent matters.
    """ * 50 # Duplicate to simulate volume

    data = {
        "userId": f"user_{random.randint(1000, 9999)}",
        "data": dummy_text
    }

    with open(output_file, "w") as f:
        json.dump(data, f, indent=2)
    
    print(f"Generated {output_file}")

if __name__ == "__main__":
    generate_dummy_data()
