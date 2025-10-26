const fs = require('fs');
const path = require('path');

function checkProductionReadiness() {
  console.log('🔍 CHECKING PRODUCTION READINESS');
  console.log('================================');
  console.log('');

  const checks = [];

  // 1. Check render.yaml
  console.log('1️⃣ Checking render.yaml...');
  const renderYamlPath = path.join(__dirname, '../docs/render.yaml');
  if (fs.existsSync(renderYamlPath)) {
    const renderYaml = fs.readFileSync(renderYamlPath, 'utf8');
    const hasVnpayConfig = renderYaml.includes('VNP_TMN_CODE') && 
                          renderYaml.includes('VNP_HASH_SECRET') &&
                          renderYaml.includes('VNP_URL');
    checks.push({ name: 'render.yaml with VNPay config', status: hasVnpayConfig });
    console.log(hasVnpayConfig ? '✅' : '❌', 'render.yaml with VNPay config');
  } else {
    checks.push({ name: 'render.yaml exists', status: false });
    console.log('❌ render.yaml not found');
  }
  console.log('');

  // 2. Check database setup script
  console.log('2️⃣ Checking database setup script...');
  const setupScriptPath = path.join(__dirname, 'setup-production-db.js');
  const setupScriptExists = fs.existsSync(setupScriptPath);
  checks.push({ name: 'Database setup script', status: setupScriptExists });
  console.log(setupScriptExists ? '✅' : '❌', 'Database setup script exists');
  console.log('');

  // 3. Check package.json dependencies
  console.log('3️⃣ Checking package.json dependencies...');
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredDeps = ['bcrypt', 'qs', 'jsonwebtoken', '@prisma/client'];
    const hasAllDeps = requiredDeps.every(dep => packageJson.dependencies[dep]);
    checks.push({ name: 'Required dependencies', status: hasAllDeps });
    console.log(hasAllDeps ? '✅' : '❌', 'Required dependencies present');
  } else {
    checks.push({ name: 'package.json exists', status: false });
    console.log('❌ package.json not found');
  }
  console.log('');

  // 4. Check Prisma schema
  console.log('4️⃣ Checking Prisma schema...');
  const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const hasPaymentTables = schema.includes('model Transaction') && 
                            schema.includes('model Withdrawal');
    checks.push({ name: 'Payment tables in schema', status: hasPaymentTables });
    console.log(hasPaymentTables ? '✅' : '❌', 'Payment tables in schema');
  } else {
    checks.push({ name: 'Prisma schema exists', status: false });
    console.log('❌ Prisma schema not found');
  }
  console.log('');

  // 5. Check payment controller
  console.log('5️⃣ Checking payment controller...');
  const paymentControllerPath = path.join(__dirname, 'src/controllers/paymentController.js');
  const paymentControllerExists = fs.existsSync(paymentControllerPath);
  checks.push({ name: 'Payment controller', status: paymentControllerExists });
  console.log(paymentControllerExists ? '✅' : '❌', 'Payment controller exists');
  console.log('');

  // 6. Check withdrawal controller
  console.log('6️⃣ Checking withdrawal controller...');
  const withdrawalControllerPath = path.join(__dirname, 'src/controllers/withdrawalController.js');
  const withdrawalControllerExists = fs.existsSync(withdrawalControllerPath);
  checks.push({ name: 'Withdrawal controller', status: withdrawalControllerExists });
  console.log(withdrawalControllerExists ? '✅' : '❌', 'Withdrawal controller exists');
  console.log('');

  // 7. Check frontend payment components
  console.log('7️⃣ Checking frontend payment components...');
  const frontendPath = path.join(__dirname, '../frontend/src');
  const paymentModalPath = path.join(frontendPath, 'components/PaymentModal.jsx');
  const paymentContextPath = path.join(frontendPath, 'contexts/PaymentContext.jsx');
  const adminWithdrawalsPath = path.join(frontendPath, 'pages/AdminWithdrawals.jsx');
  
  const hasPaymentModal = fs.existsSync(paymentModalPath);
  const hasPaymentContext = fs.existsSync(paymentContextPath);
  const hasAdminWithdrawals = fs.existsSync(adminWithdrawalsPath);
  
  const frontendReady = hasPaymentModal && hasPaymentContext && hasAdminWithdrawals;
  checks.push({ name: 'Frontend payment components', status: frontendReady });
  console.log(hasPaymentModal ? '✅' : '❌', 'PaymentModal.jsx');
  console.log(hasPaymentContext ? '✅' : '❌', 'PaymentContext.jsx');
  console.log(hasAdminWithdrawals ? '✅' : '❌', 'AdminWithdrawals.jsx');
  console.log('');

  // Summary
  console.log('📊 PRODUCTION READINESS SUMMARY');
  console.log('===============================');
  
  const passedChecks = checks.filter(check => check.status).length;
  const totalChecks = checks.length;
  
  checks.forEach(check => {
    console.log(check.status ? '✅' : '❌', check.name);
  });
  
  console.log('');
  console.log(`🎯 Overall: ${passedChecks}/${totalChecks} checks passed`);
  
  if (passedChecks === totalChecks) {
    console.log('');
    console.log('🎉 SYSTEM IS READY FOR PRODUCTION DEPLOYMENT!');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Push code to GitHub');
    console.log('2. Deploy on Render using render.yaml');
    console.log('3. Run database setup script');
    console.log('4. Test production features');
  } else {
    console.log('');
    console.log('⚠️  Some checks failed. Please fix them before deployment.');
  }
  
  console.log('');
  console.log('📋 Deployment checklist available in DEPLOYMENT_CHECKLIST.md');
}

checkProductionReadiness();
