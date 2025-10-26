#!/bin/bash

echo "🚀 PREPARING FOR PRODUCTION DEPLOYMENT"
echo "======================================"
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please initialize git first."
    exit 1
fi

echo "📝 Adding all files to git..."
git add .

echo "📝 Committing changes..."
git commit -m "feat: Complete payment system with VNPay integration

- Add VNPay payment integration with sandbox
- Add withdrawal system with bank information collection
- Add admin panel for withdrawal management
- Add exchange rate consistency (100 VND = 1 Coin)
- Add production deployment configuration
- Add database setup scripts
- Update render.yaml with VNPay environment variables
- Add comprehensive testing and validation

Features:
✅ VNPay Sandbox integration
✅ Bank information collection
✅ Admin approval workflow
✅ Manual transfer simulation
✅ Real-time balance updates
✅ Transaction tracking
✅ Exchange rate consistency
✅ Production deployment ready"

echo ""
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "🎉 CODE PUSHED TO GITHUB SUCCESSFULLY!"
echo ""
echo "🚀 NEXT STEPS FOR DEPLOYMENT:"
echo "1. Go to Render Dashboard: https://dashboard.render.com"
echo "2. Use existing services or create new ones"
echo "3. Update environment variables with VNPay config"
echo "4. Deploy backend first, then frontend"
echo "5. Run database setup script in backend shell"
echo "6. Test production features"
echo ""
echo "📋 See DEPLOYMENT_CHECKLIST.md for detailed instructions"
