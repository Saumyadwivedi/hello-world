#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import uuid

class HomeCookHubAPITester:
    def __init__(self, base_url="https://homecook-hub-5.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = None
        self.user_id = None
        self.society_id = None
        self.seller_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.passed_tests = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            self.passed_tests.append(test_name)
            print(f"✅ {test_name} - PASSED")
        else:
            self.failed_tests.append({"test": test_name, "details": details})
            print(f"❌ {test_name} - FAILED: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {}
        
        if self.session_token:
            headers['Authorization'] = f'Bearer {self.session_token}'
        
        if not files:
            headers['Content-Type'] = 'application/json'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers={k:v for k,v in headers.items() if k != 'Content-Type'})
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            
            if success:
                self.log_result(name, True)
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.log_result(name, False, f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.log_result(name, False, f"Exception: {str(e)}")
            return False, {}

    def create_test_session(self):
        """Create a test session using MongoDB directly"""
        print("\n🔧 Creating test session...")
        
        # Generate test data
        timestamp = int(datetime.now().timestamp())
        self.user_id = f"test_user_{timestamp}"
        self.session_token = f"test_session_{timestamp}"
        
        # Create test user and session in MongoDB
        import subprocess
        
        mongo_script = f'''
        use('test_database');
        db.users.insertOne({{
            user_id: "{self.user_id}",
            email: "test.user.{timestamp}@example.com",
            name: "Test User",
            picture: "https://via.placeholder.com/150",
            role: "user",
            society_id: null,
            created_at: new Date().toISOString()
        }});
        db.user_sessions.insertOne({{
            user_id: "{self.user_id}",
            session_token: "{self.session_token}",
            expires_at: new Date(Date.now() + 7*24*60*60*1000),
            created_at: new Date().toISOString()
        }});
        '''
        
        try:
            result = subprocess.run(['mongosh', '--eval', mongo_script], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                print(f"✅ Test session created: {self.session_token}")
                return True
            else:
                print(f"❌ Failed to create test session: {result.stderr}")
                return False
        except Exception as e:
            print(f"❌ MongoDB connection failed: {str(e)}")
            return False

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n📋 Testing Authentication Endpoints...")
        
        # Test /auth/me
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        if success and response.get('user_id') == self.user_id:
            print(f"✅ User data correct: {response.get('name')}")
        elif success:
            print(f"⚠️  User data mismatch: expected {self.user_id}, got {response.get('user_id')}")

    def test_society_endpoints(self):
        """Test society management endpoints"""
        print("\n🏢 Testing Society Endpoints...")
        
        # Test create society
        society_data = {
            "name": f"Test Society {datetime.now().strftime('%H%M%S')}",
            "address": "123 Test Street",
            "city": "Test City",
            "state": "Test State",
            "pincode": "123456",
            "description": "Test society for API testing",
            "contact_name": "Test Contact",
            "contact_phone": "1234567890"
        }
        
        success, response = self.run_test(
            "Create Society",
            "POST",
            "societies",
            200,
            society_data
        )
        
        if success:
            self.society_id = response.get('society_id')
            print(f"✅ Society created: {self.society_id}")
        
        # Test list societies
        self.run_test(
            "List Societies",
            "GET",
            "societies",
            200
        )
        
        # Test get specific society
        if self.society_id:
            self.run_test(
                "Get Society Details",
                "GET",
                f"societies/{self.society_id}",
                200
            )

    def test_admin_endpoints(self):
        """Test admin endpoints (requires admin role)"""
        print("\n👑 Testing Admin Endpoints...")
        
        # First make user admin
        import subprocess
        mongo_script = f'''
        use('test_database');
        db.users.updateOne(
            {{user_id: "{self.user_id}"}},
            {{$set: {{role: "admin"}}}}
        );
        '''
        
        try:
            subprocess.run(['mongosh', '--eval', mongo_script], 
                          capture_output=True, text=True, timeout=10)
            print("✅ User promoted to admin")
        except:
            print("❌ Failed to promote user to admin")
        
        # Test admin stats
        self.run_test(
            "Get Admin Stats",
            "GET",
            "admin/stats",
            200
        )
        
        # Test approve society
        if self.society_id:
            self.run_test(
                "Approve Society",
                "PATCH",
                f"societies/{self.society_id}/approve?status=approved",
                200
            )

    def test_seller_endpoints(self):
        """Test seller registration and management"""
        print("\n👨‍🍳 Testing Seller Endpoints...")
        
        # First join the approved society
        if self.society_id:
            success, _ = self.run_test(
                "Join Society as User",
                "POST",
                f"societies/{self.society_id}/join?role=user",
                200
            )
        
        # Test seller registration (requires files - will test basic endpoint)
        # Note: File upload testing would require actual files
        print("ℹ️  Seller registration requires file upload - testing endpoint availability")
        
        # Test list sellers
        self.run_test(
            "List Sellers",
            "GET",
            "sellers",
            200
        )

    def test_food_item_endpoints(self):
        """Test food item management"""
        print("\n🍽️ Testing Food Item Endpoints...")
        
        # Test list food items
        self.run_test(
            "List Food Items",
            "GET",
            "food-items",
            200
        )
        
        # Test with filters
        if self.society_id:
            self.run_test(
                "List Food Items by Society",
                "GET",
                f"food-items?society_id={self.society_id}",
                200
            )

    def test_order_endpoints(self):
        """Test order management"""
        print("\n📦 Testing Order Endpoints...")
        
        # Test list orders
        self.run_test(
            "List Orders",
            "GET",
            "orders",
            200
        )

    def cleanup_test_data(self):
        """Clean up test data"""
        print("\n🧹 Cleaning up test data...")
        
        import subprocess
        mongo_script = f'''
        use('test_database');
        db.users.deleteMany({{user_id: /^test_user_/}});
        db.user_sessions.deleteMany({{session_token: /^test_session_/}});
        db.societies.deleteMany({{name: /^Test Society/}});
        '''
        
        try:
            subprocess.run(['mongosh', '--eval', mongo_script], 
                          capture_output=True, text=True, timeout=10)
            print("✅ Test data cleaned up")
        except Exception as e:
            print(f"⚠️  Cleanup warning: {str(e)}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting HomeCook Hub API Tests")
        print("=" * 50)
        
        # Create test session
        if not self.create_test_session():
            print("❌ Cannot proceed without test session")
            return False
        
        # Run test suites
        self.test_auth_endpoints()
        self.test_society_endpoints()
        self.test_admin_endpoints()
        self.test_seller_endpoints()
        self.test_food_item_endpoints()
        self.test_order_endpoints()
        
        # Print summary
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  • {test['test']}: {test['details']}")
        
        if self.passed_tests:
            print("\n✅ PASSED TESTS:")
            for test in self.passed_tests:
                print(f"  • {test}")
        
        # Cleanup
        self.cleanup_test_data()
        
        return len(self.failed_tests) == 0

def main():
    tester = HomeCookHubAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())