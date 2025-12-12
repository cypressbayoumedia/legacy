import unittest
from processor import sanitize_pii, process_user_data

class TestProcessor(unittest.TestCase):
    
    def test_sanitize_pii_email(self):
        text = "Contact me at test@example.com for more info."
        sanitized = sanitize_pii(text)
        self.assertIn("[EMAIL_REDACTED]", sanitized)
        self.assertNotIn("test@example.com", sanitized)

    def test_sanitize_pii_phone(self):
        text = "Call me at +12345678901."
        sanitized = sanitize_pii(text)
        self.assertIn("[PHONE_REDACTED]", sanitized)
        self.assertNotIn("+12345678901", sanitized)

    def test_process_user_data_mock(self):
        # Without env vars, this should return mock data
        result = process_user_data({"userId": "123", "data": "dummy data"})
        self.assertEqual(result["userId"], "123")
        self.assertIn("aiProfile", result)
        self.assertIn("generatedBio", result["aiProfile"])

if __name__ == '__main__':
    unittest.main()
