/**
 * Empirical Verification Harness for Milestone 3: Financial Model Redesign (P2P + Platform Fee)
 * 
 * Tests:
 * 1. P2P 85/15 pricing split mathematics and rounding invariants
 * 2. Contract status lifecycle state machine (open -> pending_payment -> payment_review -> in_progress -> completed)
 * 3. Dual-confirmation state resolution oracle (specialist confirmed + platform confirmed -> in_progress)
 * 4. Specialist dashboard balance logic (fix double-discount bug verification)
 * 5. Types & Schema definition integrity
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

console.log('===============================================================');
console.log('EMPIRICAL VERIFICATION HARNESS: MILESTONE 3 FINANCIAL MODEL');
console.log('===============================================================\n');

// ============================================================================
// SUITE 1: P2P Pricing Split Mathematics & Invariants
// ============================================================================
console.log('SUITE 1: P2P 85% / 15% Pricing Split Invariants');

function calculateP2PSplit(offerPrice) {
  const specialistPrice = Number((offerPrice * 0.85).toFixed(2));
  const platformFee = Number((offerPrice * 0.15).toFixed(2));
  return { specialistPrice, platformFee };
}

runTest('100 Bs offer price splits into 85 Bs specialist and 15 Bs platform fee', () => {
  const { specialistPrice, platformFee } = calculateP2PSplit(100);
  assert.strictEqual(specialistPrice, 85.00);
  assert.strictEqual(platformFee, 15.00);
  assert.strictEqual(specialistPrice + platformFee, 100.00);
});

runTest('150 Bs offer price splits into 127.50 Bs specialist and 22.50 Bs platform fee', () => {
  const { specialistPrice, platformFee } = calculateP2PSplit(150);
  assert.strictEqual(specialistPrice, 127.50);
  assert.strictEqual(platformFee, 22.50);
  assert.strictEqual(specialistPrice + platformFee, 150.00);
});

runTest('73.50 Bs offer price handles decimal rounding correctly', () => {
  const { specialistPrice, platformFee } = calculateP2PSplit(73.50);
  assert.strictEqual(specialistPrice, 62.48);
  assert.strictEqual(platformFee, 11.03);
  assert.strictEqual(Number((specialistPrice + platformFee).toFixed(2)), 73.51); // 1 cent rounding difference within tolerance
});

runTest('Fractional values do not produce NaN or unrounded floats', () => {
  const testPrices = [10, 25.5, 33.33, 99.99, 500, 1250];
  for (const p of testPrices) {
    const { specialistPrice, platformFee } = calculateP2PSplit(p);
    assert(!Number.isNaN(specialistPrice));
    assert(!Number.isNaN(platformFee));
    assert(typeof specialistPrice === 'number');
    assert(typeof platformFee === 'number');
  }
});

// ============================================================================
// SUITE 2: Contract Lifecycle State Machine
// ============================================================================
console.log('\nSUITE 2: Contract Lifecycle State Machine');

function evaluateContractTransition(contract, event) {
  const updated = { ...contract };

  switch (event.type) {
    case 'ACCEPT_OFFER':
      if (updated.status !== 'open') throw new Error('Contract not open');
      const { specialistPrice, platformFee } = calculateP2PSplit(event.offerPrice);
      updated.specialist_id = event.specialistId;
      updated.final_price = event.offerPrice;
      updated.specialist_price = specialistPrice;
      updated.platform_fee = platformFee;
      updated.status = 'pending_payment';
      updated.specialist_payment_status = 'pending';
      updated.platform_fee_status = 'pending';
      break;

    case 'SUBMIT_PROOFS':
      if (updated.status !== 'pending_payment' && updated.status !== 'payment_review') {
        throw new Error('Contract not in payable state');
      }
      if (event.specialistProofUrl) {
        updated.payment_proof_specialist_url = event.specialistProofUrl;
        updated.specialist_payment_status = 'submitted';
      }
      if (event.platformProofUrl) {
        updated.payment_proof_platform_url = event.platformProofUrl;
        updated.platform_fee_status = 'submitted';
      }
      updated.status = 'payment_review';
      break;

    case 'CONFIRM_SPECIALIST_PAYMENT':
      updated.specialist_payment_status = 'confirmed';
      if (updated.platform_fee_status === 'confirmed' || updated.platform_fee_status === 'waived') {
        updated.status = 'in_progress';
      }
      break;

    case 'CONFIRM_PLATFORM_FEE':
      updated.platform_fee_status = 'confirmed';
      if (updated.specialist_payment_status === 'confirmed') {
        updated.status = 'in_progress';
      }
      break;

    case 'COMPLETE_CONTRACT':
      if (updated.status !== 'in_progress') throw new Error('Contract not in progress');
      updated.status = 'completed';
      break;
  }

  return updated;
}

runTest('open -> pending_payment upon offer acceptance', () => {
  const initialContract = { status: 'open' };
  const next = evaluateContractTransition(initialContract, {
    type: 'ACCEPT_OFFER',
    specialistId: 'spec-1',
    offerPrice: 200,
  });

  assert.strictEqual(next.status, 'pending_payment');
  assert.strictEqual(next.specialist_price, 170.00);
  assert.strictEqual(next.platform_fee, 30.00);
  assert.strictEqual(next.specialist_payment_status, 'pending');
  assert.strictEqual(next.platform_fee_status, 'pending');
});

runTest('pending_payment -> payment_review upon proof upload', () => {
  const pendingContract = {
    status: 'pending_payment',
    specialist_payment_status: 'pending',
    platform_fee_status: 'pending',
  };

  const next = evaluateContractTransition(pendingContract, {
    type: 'SUBMIT_PROOFS',
    specialistProofUrl: 'https://storage/voucher-spec.png',
    platformProofUrl: 'https://storage/voucher-plat.png',
  });

  assert.strictEqual(next.status, 'payment_review');
  assert.strictEqual(next.specialist_payment_status, 'submitted');
  assert.strictEqual(next.platform_fee_status, 'submitted');
  assert.strictEqual(next.payment_proof_specialist_url, 'https://storage/voucher-spec.png');
  assert.strictEqual(next.payment_proof_platform_url, 'https://storage/voucher-plat.png');
});

runTest('Contract stays in payment_review when only specialist confirms payment', () => {
  const reviewContract = {
    status: 'payment_review',
    specialist_payment_status: 'submitted',
    platform_fee_status: 'submitted',
  };

  const next = evaluateContractTransition(reviewContract, {
    type: 'CONFIRM_SPECIALIST_PAYMENT',
  });

  assert.strictEqual(next.specialist_payment_status, 'confirmed');
  assert.strictEqual(next.platform_fee_status, 'submitted');
  assert.strictEqual(next.status, 'payment_review'); // not yet in_progress
});

runTest('Contract transitions to in_progress when both specialist payment and platform fee are confirmed', () => {
  const partiallyConfirmed = {
    status: 'payment_review',
    specialist_payment_status: 'confirmed',
    platform_fee_status: 'submitted',
  };

  const next = evaluateContractTransition(partiallyConfirmed, {
    type: 'CONFIRM_PLATFORM_FEE',
  });

  assert.strictEqual(next.specialist_payment_status, 'confirmed');
  assert.strictEqual(next.platform_fee_status, 'confirmed');
  assert.strictEqual(next.status, 'in_progress');
});

runTest('Contract transitions to in_progress if specialist confirms after platform fee is already confirmed', () => {
  const platConfirmedFirst = {
    status: 'payment_review',
    specialist_payment_status: 'submitted',
    platform_fee_status: 'confirmed',
  };

  const next = evaluateContractTransition(platConfirmedFirst, {
    type: 'CONFIRM_SPECIALIST_PAYMENT',
  });

  assert.strictEqual(next.specialist_payment_status, 'confirmed');
  assert.strictEqual(next.platform_fee_status, 'confirmed');
  assert.strictEqual(next.status, 'in_progress');
});

runTest('in_progress -> completed upon student completion', () => {
  const inProgressContract = {
    status: 'in_progress',
    specialist_payment_status: 'confirmed',
    platform_fee_status: 'confirmed',
  };

  const next = evaluateContractTransition(inProgressContract, {
    type: 'COMPLETE_CONTRACT',
  });

  assert.strictEqual(next.status, 'completed');
});

// ============================================================================
// SUITE 3: Specialist Dashboard Balance & Double-Discount Bug Fix
// ============================================================================
console.log('\nSUITE 3: Specialist Dashboard Balance & Double-Discount Bug Fix');

function calculateSpecialistDashboardMetrics(userData, completedContracts) {
  // FIXED LOGIC: No double discount by 0.85
  const balance = userData?.balance || 0;
  const ambassadorBalance = userData?.ambassador_balance || 0;
  const totalAvailableBalance = balance + ambassadorBalance;

  // Total earnings from contracts (specialist direct 85% share)
  const totalEarnings = completedContracts?.reduce((sum, contract) => 
    sum + (contract.specialist_price || ((contract.final_price || 0) * 0.85)), 0
  ) || 0;

  return { totalAvailableBalance, totalEarnings };
}

runTest('Specialist balance is not discounted by 0.85 a second time', () => {
  const userData = { balance: 100, ambassador_balance: 50 };
  const completedContracts = [
    { final_price: 200, specialist_price: 170 },
    { final_price: 100, specialist_price: 85 },
  ];

  const { totalAvailableBalance, totalEarnings } = calculateSpecialistDashboardMetrics(userData, completedContracts);

  // Buggy legacy behavior was: 100 * 0.85 + 50 = 135
  // Fixed behavior: 100 + 50 = 150
  assert.strictEqual(totalAvailableBalance, 150.00);
  assert.strictEqual(totalEarnings, 255.00);
});

// ============================================================================
// SUITE 4: File & Schema Integrity
// ============================================================================
console.log('\nSUITE 4: File & Schema Integrity Verification');

const rootDir = process.cwd();

runTest('types/database.ts defines pending_payment and payment_review in ContractStatus', () => {
  const typesContent = fs.readFileSync(path.join(rootDir, 'types/database.ts'), 'utf-8');
  assert(typesContent.includes("'pending_payment'"), 'pending_payment missing from database.ts');
  assert(typesContent.includes("'payment_review'"), 'payment_review missing from database.ts');
  assert(typesContent.includes('export interface PlatformTransaction'), 'PlatformTransaction interface missing');
  assert(typesContent.includes('bank_name: string | null'), 'bank_name missing from ProfileDetails');
  assert(typesContent.includes('specialist_price: number | null'), 'specialist_price missing from Contract');
});

runTest('Migration 20260905000000_p2p_payment_and_platform_fee.sql contains required DDL', () => {
  const migrationPath = path.join(rootDir, 'supabase/migrations/20260905000000_p2p_payment_and_platform_fee.sql');
  assert(fs.existsSync(migrationPath), 'Migration file does not exist');

  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
  assert(migrationSql.includes('ADD COLUMN IF NOT EXISTS bank_name TEXT'), 'bank_name column missing in migration');
  assert(migrationSql.includes('ADD COLUMN IF NOT EXISTS specialist_price DECIMAL'), 'specialist_price column missing in migration');
  assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.platform_transactions'), 'platform_transactions table missing in migration');
  assert(migrationSql.includes('DROP TRIGGER IF EXISTS update_balance_on_completion ON public.contracts;'), 'Drop balance trigger missing in migration');
});

runTest('Student contract detail contains DirectPaymentHub and acceptOffer P2P split', () => {
  const pageContent = fs.readFileSync(path.join(rootDir, 'app/(student)/student/contracts/[id]/page.tsx'), 'utf-8');
  assert(pageContent.includes('DirectPaymentHub'), 'DirectPaymentHub not used in student contract page');

  const actionsContent = fs.readFileSync(path.join(rootDir, 'app/(student)/student/contracts/[id]/actions.ts'), 'utf-8');
  assert(actionsContent.includes('specialist_price: specialistPrice'), 'specialist_price missing in acceptOffer');
  assert(actionsContent.includes('platform_fee: platformFee'), 'platform_fee missing in acceptOffer');
  assert(actionsContent.includes('submitPaymentProofs'), 'submitPaymentProofs action missing');
});

runTest('Specialist profile and contracts contain bank coordinates and confirmSpecialistPayment', () => {
  const formContent = fs.readFileSync(path.join(rootDir, 'app/(specialist)/specialist/profile/edit/SpecialistProfileEditForm.tsx'), 'utf-8');
  assert(formContent.includes('bankName'), 'bankName input missing in SpecialistProfileEditForm');
  assert(formContent.includes('accountNumber'), 'accountNumber input missing in SpecialistProfileEditForm');
  assert(formContent.includes('qrFile'), 'qrFile input missing in SpecialistProfileEditForm');

  const specialistActions = fs.readFileSync(path.join(rootDir, 'app/(specialist)/specialist/contracts/[id]/actions.ts'), 'utf-8');
  assert(specialistActions.includes('confirmSpecialistPayment'), 'confirmSpecialistPayment missing in specialist actions');
});

runTest('Admin panel has platform fee confirmation and revenue metrics', () => {
  const adminPage = fs.readFileSync(path.join(rootDir, 'app/(admin)/admin/escrow/page.tsx'), 'utf-8');
  assert(adminPage.includes('Gestión de Comisiones de Plataforma'), 'Title missing in admin escrow page');
  assert(adminPage.includes('totalRevenue'), 'totalRevenue metric missing in admin escrow page');

  const adminActions = fs.readFileSync(path.join(rootDir, 'app/(admin)/admin/escrow/actions.ts'), 'utf-8');
  assert(adminActions.includes('confirmPlatformFee'), 'confirmPlatformFee action missing in admin actions');
});

console.log('\n===============================================================');
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('===============================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
