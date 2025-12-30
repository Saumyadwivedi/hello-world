# Complete Seller Flow Guide

## Understanding the Seller Journey

### Why Users See the Ordering Page First

When you click "Become a Seller" and submit your application, you will be redirected to the **ordering page (UserHome)**. This is CORRECT behavior because:

1. **Your application needs approval** - You're not a seller yet, you're a pending seller
2. **You can browse while waiting** - You can order food from other sellers while your application is being reviewed
3. **Society admin must approve you** - Your society admin will review your Aadhar and FSSAI documents

### Complete Step-by-Step Flow

#### For the User Becoming a Seller:

**Step 1: Sign Up & Join Society**
- Sign up with email/password or Google OAuth
- Join an approved society
- You are now a regular user (role: "user")

**Step 2: Submit Seller Application**
- Click "Become a Seller" from navigation or profile
- Fill in:
  - Business name
  - Aadhar number
  - FSSAI license number  
  - Upload Aadhar card document
  - Upload FSSAI license document
- Click "Submit Application"
- ✅ Success message appears
- You are redirected to the ordering page (UserHome)
- **You see a YELLOW BANNER: "Seller Application Pending - awaiting society admin approval"**

**Step 3: Wait for Approval**
- Your application status is "pending"
- Society admin receives notification
- You can browse and order food while waiting
- The yellow banner reminds you that your application is under review

**Step 4: Get Approved**
- Society admin reviews your documents
- Society admin clicks "Approve" on your seller application
- **Your role is updated from "user" to "seller"** in the database

**Step 5: Access Your Seller Dashboard**
Two ways to access:

**Option A: Automatic (Recommended)**
- Refresh the page or navigate to any page
- System detects you are now a seller
- ✅ **Automatic redirect to Seller Dashboard**
- You see the menu upload page!

**Option B: Manual**
- Log out and log back in
- System redirects you to Seller Dashboard based on your role
- You see the menu upload page!

#### For the Society Admin:

**Reviewing Seller Applications**
1. Login as society admin
2. Navigate to Society Admin Dashboard
3. See "Pending Seller Approvals" section
4. Review documents (Aadhar, FSSAI)
5. Click "Approve" or "Reject"
6. Seller is notified (their role is updated if approved)

## Key Points to Remember

✅ **After submitting seller application**: You see the ordering page (this is normal)
✅ **Yellow banner appears**: Shows your application is pending
✅ **After approval**: Refresh page or navigate anywhere - you'll be redirected to Seller Dashboard
✅ **Seller Dashboard**: This is where you upload your food menu
✅ **No manual redirect needed**: System automatically detects your new role

## Troubleshooting

**Q: I submitted my seller application but I'm still seeing the ordering page**
A: This is correct! Your application is pending approval by the society admin.

**Q: My application was approved but I still see the ordering page**
A: Simply refresh the page or click on any navigation link. The system will detect you're a seller and redirect you.

**Q: How do I know my application was approved?**
A: 
1. The yellow "pending" banner will disappear
2. You'll be automatically redirected to Seller Dashboard
3. Your navigation will show "Seller Dashboard" instead of "Orders"

**Q: Where do I upload my food menu?**
A: After approval and redirect to Seller Dashboard, click "Add Food Item" button

## Current Status Indicators

| Status | What You See | What To Do |
|--------|-------------|------------|
| Not Applied | No banner | Click "Become a Seller" to apply |
| Pending | Yellow banner | Wait for society admin approval |
| Approved | Redirected to Seller Dashboard | Upload your menu! |
| Rejected | No banner, can't become seller | Contact society admin |

## Testing the Flow

**Test Credentials:**
- Admin: admin@homecookhub.com / Admin@123456
- Create your own user to test the full flow

**Test Steps:**
1. Sign up as a new user
2. Join an approved society (KVille)
3. Go to "Become a Seller"
4. Upload test documents (any image files work for testing)
5. Submit application
6. See yellow "pending" banner on home page
7. Login as admin or society admin
8. Approve your seller application
9. Go back to your user
10. Refresh the page
11. ✅ You're redirected to Seller Dashboard!
12. Click "Add Food Item"
13. Upload your menu

---

**Need Help?** The system is designed to guide you through each step with clear messages and visual indicators.
