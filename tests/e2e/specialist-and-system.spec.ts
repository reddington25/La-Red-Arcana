import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { isRegularWithdrawalDate } from '../../lib/utils/withdrawal';
import { getRelatedUserDisplayName, normalizeProfileDetails } from '../../lib/utils/profile';
import { validateAmbassadorCodeAction } from '../../app/auth/register/specialist/actions';
import { confirmPlatformFeeWithClient, processWithdrawalWithClient } from '../../app/(admin)/admin/escrow/actions';

const specialistEmail = 'abcde@gmail.com';
const specialistPassword = '123456';
const studentEmail = '12345@gmail.com';
const studentPassword = 'abcdef';

const getSupabaseAdmin = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

test.describe('Suite Integral: Login de Especialista, Negociación E2E, Reglas de Retiro y Embajadores', () => {

  test('R1: Login exitoso del especialista (abcde@gmail.com) y carga limpia de /specialist/dashboard sin Server Components error', async ({ page }) => {
    // 1. Navegar al login
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // 2. Ingresar credenciales del especialista
    await page.fill('#email', specialistEmail);
    await page.fill('#password', specialistPassword);
    await page.click('button[type="submit"]');

    // 3. Verificar redirección exitosa a /specialist/dashboard
    await page.waitForURL('**/specialist/dashboard', { timeout: 20000 });
    await expect(page).toHaveURL(/\/specialist\/dashboard/);

    // 4. Verificar encabezado y bienvenida
    const welcomeHeader = page.locator('h1');
    await expect(welcomeHeader).toContainText('Bienvenido');

    // 5. Verificar que NO aparece ningún error de Server Components ni Application error
    await expect(page.getByText('Server Components render error')).not.toBeVisible();
    await expect(page.getByText('Application error: a client-side exception has occurred')).not.toBeVisible();

    // 6. Verificar presencia de tarjetas de métricas del dashboard
    await expect(page.getByText('Contratos Activos').first()).toBeVisible();
    await expect(page.getByText('Completados').first()).toBeVisible();
    await expect(page.getByText('Saldo en Plataforma para Retiro')).toBeVisible();

    // 7. Verificar que el botón de solicitar retiro está presente
    await expect(page.getByTestId('withdrawal-button')).toBeVisible();
  });

  test('R4: Estabilidad visual del botón Crear Contrato en /student/dashboard sin parpadeos ni desapariciones', async ({ page }) => {
    // 1. Iniciar sesión como estudiante
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.fill('#email', studentEmail);
    await page.fill('#password', studentPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/student/dashboard', { timeout: 20000 });

    // 2. Verificar que el botón "Crear Contrato" está visible de inmediato
    const createContractBtn = page.getByTestId('create-contract-btn');
    await expect(createContractBtn).toBeVisible();
    await expect(createContractBtn).toContainText('Crear Contrato');

    // 3. Esperar 3 segundos para confirmar que no desaparece ni parpadea por hidratación
    await page.waitForTimeout(3000);
    await expect(createContractBtn).toBeVisible();
    await expect(createContractBtn).toBeEnabled();
  });

  test('R5.2 & R5.3: Flujo integral de postulación, envío de contraoferta por el especialista y aceptación por el estudiante con transición a DirectPaymentHub', async ({ browser }) => {
    // Crear dos contextos de navegación independientes (uno para estudiante y otro para especialista)
    const studentContext = await browser.newContext();
    const studentPage = await studentContext.newPage();

    const specialistContext = await browser.newContext();
    const specialistPage = await specialistContext.newPage();

    try {
      // 1. Estudiante crea un contrato abierto
      await studentPage.goto('/auth/login');
      await studentPage.waitForLoadState('networkidle');
      await studentPage.fill('#email', studentEmail);
      await studentPage.fill('#password', studentPassword);
      await studentPage.click('button[type="submit"]');
      await studentPage.waitForURL('**/student/dashboard', { timeout: 20000 });

      await studentPage.goto('/student/contracts/new');
      await studentPage.waitForLoadState('networkidle');

      const contractTitle = `Proyecto Negociación Playwright ${Date.now()}`;
      await studentPage.fill('#title', contractTitle);
      await studentPage.fill('#description', 'Contrato abierto para validar la postulación y envío de contraoferta por el especialista y aceptación.');
      await studentPage.selectOption('#department', 'Cochabamba');
      await studentPage.selectOption('#faculty', 'Facultad de Tecnologia');
      await studentPage.selectOption('#career', 'Ing. de Sistemas');
      await studentPage.fill('#price', '300');
      await studentPage.getByRole('button', { name: '+24 horas (1 día)' }).click();
      await studentPage.locator('input[type="checkbox"]').first().check();
      await studentPage.getByRole('button', { name: 'Publicar Contrato' }).click();

      await studentPage.waitForURL(/\/student\/contracts\/[a-f0-9-]+/, { timeout: 25000 });
      const contractUrl = studentPage.url();
      const contractId = contractUrl.split('/').pop()!;

      // 2. Especialista inicia sesión en su propio contexto independiente y navega a la oportunidad
      await specialistPage.goto('/auth/login');
      await specialistPage.waitForLoadState('networkidle');
      await specialistPage.fill('#email', specialistEmail);
      await specialistPage.fill('#password', specialistPassword);
      await specialistPage.click('button[type="submit"]');
      await specialistPage.waitForURL('**/specialist/dashboard', { timeout: 20000 });

      // Navegar a la oportunidad del contrato
      await specialistPage.goto(`/specialist/opportunities/${contractId}`);
      await specialistPage.waitForLoadState('networkidle');
      await expect(specialistPage.locator('h1')).toHaveText(contractTitle);

      // Llenar y enviar formulario de contraoferta
      await specialistPage.fill('#price', '320');
      await specialistPage.fill('#message', 'Puedo realizar este trabajo con alta precisión y entregarlo antes del plazo.');
      await specialistPage.click('button[type="submit"]:has-text("Enviar Contraoferta")');

      // Confirmar que se envió y se muestra el estado de contraoferta enviada
      await expect(specialistPage.getByText('Ya enviaste una contraoferta')).toBeVisible({ timeout: 15000 });
      await expect(specialistPage.getByText('Bs. 320.00')).toBeVisible();

      // 3. Estudiante recarga la vista del contrato y acepta la contraoferta
      await studentPage.goto(`/student/contracts/${contractId}`);
      await studentPage.waitForLoadState('networkidle');

      // Verificar que la contraoferta recibida de Bs. 320 está visible
      await expect(studentPage.getByText('Ofertas Recibidas (1)')).toBeVisible({ timeout: 15000 });
      await expect(studentPage.getByText('Bs. 320')).toBeVisible();

      const acceptBtn = studentPage.getByRole('button', { name: 'Aceptar Oferta' });
      await expect(acceptBtn).toBeVisible();

      // Manejar confirmación de diálogo nativo
      studentPage.once('dialog', async (dialog) => {
        await dialog.accept();
      });
      await acceptBtn.click();

      // 4. Verificar transición al Hub de Pago P2P (DirectPaymentHub)
      await expect(studentPage.getByText('Oferta aceptada. El contrato está ahora pendiente de depósito.').first()).toBeVisible({ timeout: 15000 });
      await expect(studentPage.getByText(/Paso 1: Pago Directo/)).toBeVisible({ timeout: 20000 });
      await expect(studentPage.getByText(/Paso 2: Comisión de Servicio/)).toBeVisible();
    } finally {
      await studentContext.close();
      await specialistContext.close();
    }
  });

  test('R2 & R5.4: Modal de retiro con reglas de calendario y consumo de 50 monedas Arcanas', async ({ page }) => {
    const supabaseAdmin = getSupabaseAdmin();

    // Obtener ID del especialista
    const { data: specUser } = await supabaseAdmin
      .from('users')
      .select('id, arcanas, balance')
      .eq('email', specialistEmail)
      .single();

    expect(specUser).not.toBeNull();
    const specialistId = specUser!.id;

    // Asegurar saldo suficiente de retiro (Bs. 120) y arcanas suficientes (100) para la prueba
    await supabaseAdmin
      .from('users')
      .update({ balance: 120, arcanas: 100 })
      .eq('id', specialistId);

    // 1. Iniciar sesión como especialista
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.fill('#email', specialistEmail);
    await page.fill('#password', specialistPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/specialist/dashboard', { timeout: 20000 });

    // 2. Abrir modal de retiro
    const withdrawBtn = page.getByTestId('withdrawal-button');
    await expect(withdrawBtn).toBeVisible();
    await expect(withdrawBtn).toBeEnabled();
    await withdrawBtn.click();

    // 3. Verificar que el modal de retiro se abre
    const modal = page.getByTestId('withdrawal-modal');
    await expect(modal).toBeVisible();

    const isTodayRegular = isRegularWithdrawalDate();

    if (isTodayRegular) {
      // Si hoy es día 15 o último del mes: no debe costar arcanas
      await expect(modal.getByText('Fecha Regular de Retiro (Sin costo)')).toBeVisible();
    } else {
      // Fuera de fecha: debe indicar consumo de 50 arcanas
      await expect(modal.getByText('Retiro Extraordinario Fuera de Fecha')).toBeVisible();
      await expect(modal.getByText(/se deducirán automáticamente 50 monedas Arcanas/)).toBeVisible();
    }

    const confirmWithdrawBtn = page.getByTestId('confirm-withdrawal-button');
    await expect(confirmWithdrawBtn).toBeEnabled();

    // 4. Probar bloqueo cuando el especialista tiene menos de 50 arcanas fuera de fecha
    if (!isTodayRegular) {
      // Reducir arcanas a 20 temporalmente
      await supabaseAdmin
        .from('users')
        .update({ arcanas: 20 })
        .eq('id', specialistId);

      // Recargar página y volver a abrir modal
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.getByTestId('withdrawal-button').click();

      // Debe mostrar banner de bloqueo y mensaje de contacto con administrador
      const blockedBanner = page.getByTestId('withdrawal-blocked-banner');
      await expect(blockedBanner).toBeVisible();
      await expect(blockedBanner.getByText(/Contacta a un administrador para recargar Arcanas/)).toBeVisible();

      // El botón de confirmar retiro debe estar deshabilitado
      const submitBtn = page.getByTestId('confirm-withdrawal-button');
      await expect(submitBtn).toBeDisabled();

      // Restaurar arcanas a 100
      await supabaseAdmin
        .from('users')
        .update({ arcanas: 100 })
        .eq('id', specialistId);
    }

    // 5. Enviar solicitud de retiro real desde la UI y validar deducción de arcanas y registro
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.getByTestId('withdrawal-button').click();
    await expect(page.getByTestId('withdrawal-modal')).toBeVisible();

    await page.fill('#amount', '50');
    await page.getByTestId('confirm-withdrawal-button').click();

    // Confirmar mensaje de éxito
    await expect(page.getByText(/Solicitud enviada exitosamente/)).toBeVisible({ timeout: 15000 });

    // 6. Verificar persistencia en base de datos
    const { data: updatedUser } = await supabaseAdmin
      .from('users')
      .select('arcanas, balance')
      .eq('id', specialistId)
      .single();

    if (!isTodayRegular) {
      // Si fue retiro extraordinario: debe haber consumido exactamente 50 arcanas
      expect(updatedUser!.arcanas).toBe(50);

      const { data: arcanaTx } = await supabaseAdmin
        .from('arcana_transactions')
        .select('amount, user_id')
        .eq('user_id', specialistId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      expect(arcanaTx).not.toBeNull();
      expect(arcanaTx!.amount).toBe(-50);
    }

    // Verificar solicitud de retiro pendiente creada
    const { data: withdrawalReq } = await supabaseAdmin
      .from('withdrawal_requests')
      .select('id, amount, status, notes')
      .eq('specialist_id', specialistId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    expect(withdrawalReq).not.toBeNull();
    expect(withdrawalReq!.amount).toBe(50);

    // 7. Validar procesamiento de retiro por el administrador (aprobación)
    const processResult = await processWithdrawalWithClient(
      withdrawalReq!.id,
      'completed',
      'Aprobado en prueba automatizada',
      specialistId,
      supabaseAdmin
    );
    expect(processResult.success).toBe(true);

    // Verificar que el saldo se descontó de Bs. 120 a Bs. 70
    const { data: afterProcessUser } = await supabaseAdmin
      .from('users')
      .select('balance')
      .eq('id', specialistId)
      .single();
    expect(afterProcessUser!.balance).toBe(70);

    // 7.1 Validar prevención de doble procesamiento (idempotencia)
    const duplicateProcessResult = await processWithdrawalWithClient(
      withdrawalReq!.id,
      'completed',
      'Intento de doble aprobación',
      specialistId,
      supabaseAdmin
    );
    expect(duplicateProcessResult.success).toBe(false);
    expect(duplicateProcessResult.error).toContain('ya fue procesada');

    // 7.2 Validar rechazo de retiro extraordinario con reembolso de 50 Arcanas
    const { data: rejectTestReq } = await supabaseAdmin
      .from('withdrawal_requests')
      .insert({
        specialist_id: specialistId,
        amount: 50,
        status: 'pending',
        notes: 'Retiro extraordinario (-50 Arcanas deducidas automáticamente)',
      })
      .select()
      .single();

    expect(rejectTestReq).not.toBeNull();
    const arcanasBeforeReject = updatedUser!.arcanas; // 50 si fue extraordinario

    const rejectResult = await processWithdrawalWithClient(
      rejectTestReq!.id,
      'rejected',
      'Rechazado por datos bancarios incompletos en prueba',
      specialistId,
      supabaseAdmin
    );
    expect(rejectResult.success).toBe(true);

    // Verificar reembolso de 50 arcanas al especialista
    const { data: userAfterReject } = await supabaseAdmin
      .from('users')
      .select('arcanas')
      .eq('id', specialistId)
      .single();
    expect(userAfterReject!.arcanas).toBe(arcanasBeforeReject + 50);

    // 8. Validar procesamiento de retiro para un embajador con saldo en ambassador_balance
    await supabaseAdmin
      .from('users')
      .update({ balance: 0, ambassador_balance: 80 })
      .eq('id', specialistId);

    const { data: ambWithdrawalReq } = await supabaseAdmin
      .from('withdrawal_requests')
      .insert({
        specialist_id: specialistId,
        amount: 50,
        status: 'pending',
        notes: 'Retiro de ganancias de embajador',
      })
      .select()
      .single();

    expect(ambWithdrawalReq).not.toBeNull();

    const ambProcessResult = await processWithdrawalWithClient(
      ambWithdrawalReq!.id,
      'completed',
      'Aprobación ganancias de embajador',
      specialistId,
      supabaseAdmin
    );
    expect(ambProcessResult.success).toBe(true);

    // Debe haberse descontado de ambassador_balance (80 - 50 = 30)
    const { data: afterAmbUser } = await supabaseAdmin
      .from('users')
      .select('ambassador_balance, balance')
      .eq('id', specialistId)
      .single();
    expect(afterAmbUser!.ambassador_balance).toBe(30);
    expect(afterAmbUser!.balance).toBe(0);

    // Restaurar usuario a valores iniciales de prueba y limpiar
    await supabaseAdmin
      .from('users')
      .update({ balance: 120, arcanas: 100, ambassador_balance: 0 })
      .eq('id', specialistId);
    await supabaseAdmin
      .from('withdrawal_requests')
      .delete()
      .eq('id', ambWithdrawalReq!.id);
    await supabaseAdmin
      .from('withdrawal_requests')
      .delete()
      .eq('id', rejectTestReq!.id);
    await supabaseAdmin
      .from('withdrawal_requests')
      .delete()
      .eq('id', withdrawalReq!.id);
  });

  test('R3: Programa de embajadores: atribución de referido y división de comisión (5% embajador / 10% plataforma)', async () => {
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Seleccionar o preparar un usuario embajador de prueba
    const testAmbassadorCode = `AMB-TEST-${Date.now().toString().slice(-4)}`;
    
    // Obtener un usuario que fungirá como embajador (super_admin o specialist)
    const { data: superAdmin } = await supabaseAdmin
      .from('users')
      .select('id, ambassador_balance')
      .eq('role', 'super_admin')
      .single();

    expect(superAdmin).not.toBeNull();
    const ambassadorId = superAdmin!.id;

    // Asignar rol de embajador con código único
    await supabaseAdmin
      .from('users')
      .update({
        is_ambassador: true,
        ambassador_code: testAmbassadorCode,
      })
      .eq('id', ambassadorId);

    // 2. Verificar que la validación de código de embajador funciona
    const validationResult = await validateAmbassadorCodeAction(testAmbassadorCode);
    expect(validationResult.valid).toBe(true);
    expect(validationResult.ambassadorId).toBe(ambassadorId);

    // 3. Vincular especialista existente como referido del embajador
    const { data: specUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', specialistEmail)
      .single();

    expect(specUser).not.toBeNull();
    const specialistId = specUser!.id;

    await supabaseAdmin
      .from('users')
      .update({ referred_by: ambassadorId })
      .eq('id', specialistId);

    // 4. Crear contrato con precio de Bs. 200 y todos los campos requeridos
    const { data: newContract, error: contractErr } = await supabaseAdmin
      .from('contracts')
      .insert({
        student_id: '20986ef7-fcac-4e74-8976-47d229ebbf70', // Estudiante existente
        specialist_id: specialistId,
        title: `Contrato Liquidación Comisión Embajador ${Date.now()}`,
        description: 'Prueba de atribución del 5% al embajador y 10% a plataforma.',
        tags: ['General', 'Pruebas'],
        service_type: 'full',
        deadline: new Date(Date.now() + 86400000).toISOString(),
        department: 'Cochabamba',
        faculty: 'Facultad de Tecnologia',
        career: 'Ing. de Sistemas',
        status: 'pending_payment',
        initial_price: 200,
        final_price: 200,
        specialist_price: 170, // 85%
        platform_fee: 30, // 15%
        specialist_payment_status: 'confirmed',
        platform_fee_status: 'pending',
      })
      .select()
      .single();

    expect(contractErr).toBeNull();
    expect(newContract).not.toBeNull();

    const previousAmbassadorBalance = superAdmin!.ambassador_balance || 0;

    // 5. Simular la validación de comisión de plataforma por parte del admin
    // La comisión total es 15% (Bs. 30).
    // El 5% del contrato (Bs. 10) debe ir al embajador.
    // El 10% del contrato (Bs. 20) queda para la plataforma.
    const result = await confirmPlatformFeeWithClient(newContract!.id, ambassadorId, supabaseAdmin);
    expect(result.success).toBe(true);

    // 6. Verificar que se acreditó el 5% al ambassador_balance
    const { data: updatedAmbassador } = await supabaseAdmin
      .from('users')
      .select('ambassador_balance')
      .eq('id', ambassadorId)
      .single();

    const expectedShare = Number((200 * 0.05).toFixed(2)); // Bs. 10.00
    expect(updatedAmbassador!.ambassador_balance).toBeCloseTo(previousAmbassadorBalance + expectedShare, 2);

    // 7. Verificar que se registró la fila en ambassador_earnings
    const { data: earningRecord } = await supabaseAdmin
      .from('ambassador_earnings')
      .select('amount, specialist_id, contract_id')
      .eq('contract_id', newContract!.id)
      .single();

    expect(earningRecord).not.toBeNull();
    expect(earningRecord!.amount).toBe(expectedShare);
    expect(earningRecord!.specialist_id).toBe(specialistId);

    // Limpieza
    await supabaseAdmin.from('contracts').delete().eq('id', newContract!.id);
  });

  test('R1 & R2 Robustez: Manejo seguro de relaciones nulas/arrays y validaciones de límites de retiro y calendario', async () => {
    // 1. Validar getRelatedUserDisplayName con diversas estructuras
    expect(getRelatedUserDisplayName(null, 'Fallback')).toBe('Fallback');
    expect(getRelatedUserDisplayName(undefined, 'Fallback')).toBe('Fallback');
    expect(getRelatedUserDisplayName([], 'Fallback')).toBe('Fallback');
    expect(getRelatedUserDisplayName({ alias: 'AliasDirecto' })).toBe('AliasDirecto');
    expect(getRelatedUserDisplayName({ profile_details: { alias: 'AliasPerfil' } })).toBe('AliasPerfil');
    expect(getRelatedUserDisplayName({ profile_details: [{ real_name: 'NombreRealArray' }] })).toBe('NombreRealArray');
    expect(getRelatedUserDisplayName([{ profile_details: { alias: 'ArrayUserAlias' } }])).toBe('ArrayUserAlias');
    expect(getRelatedUserDisplayName({ profile_details: null, real_name: 'SoloReal' })).toBe('SoloReal');

    // 2. Validar reglas de calendario de retiro (días 15 y último día del mes)
    // Fechas regulares
    expect(isRegularWithdrawalDate(new Date('2026-01-15T14:00:00Z'))).toBe(true);
    expect(isRegularWithdrawalDate(new Date('2026-01-31T14:00:00Z'))).toBe(true);
    expect(isRegularWithdrawalDate(new Date('2026-02-15T14:00:00Z'))).toBe(true);
    expect(isRegularWithdrawalDate(new Date('2026-02-28T14:00:00Z'))).toBe(true); // 2026 no bisiesto
    expect(isRegularWithdrawalDate(new Date('2024-02-29T14:00:00Z'))).toBe(true); // 2024 bisiesto
    expect(isRegularWithdrawalDate(new Date('2026-04-30T14:00:00Z'))).toBe(true);
    expect(isRegularWithdrawalDate(new Date('2026-12-31T14:00:00Z'))).toBe(true);

    // Fechas no regulares
    expect(isRegularWithdrawalDate(new Date('2026-01-14T14:00:00Z'))).toBe(false);
    expect(isRegularWithdrawalDate(new Date('2026-01-16T14:00:00Z'))).toBe(false);
    expect(isRegularWithdrawalDate(new Date('2026-02-27T14:00:00Z'))).toBe(false);
    expect(isRegularWithdrawalDate(new Date('2026-04-29T14:00:00Z'))).toBe(false);
    expect(isRegularWithdrawalDate(new Date('2026-10-02T14:00:00Z'))).toBe(false);

    // 3. Validar rechazo de retiro por saldo insuficiente
    const supabaseAdmin = getSupabaseAdmin();
    const { data: specUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', specialistEmail)
      .single();

    expect(specUser).not.toBeNull();
    const specialistId = specUser!.id;

    // Colocar saldo a 0
    await supabaseAdmin
      .from('users')
      .update({ balance: 0, ambassador_balance: 0 })
      .eq('id', specialistId);

    const { data: testWithdrawalReq } = await supabaseAdmin
      .from('withdrawal_requests')
      .insert({
        specialist_id: specialistId,
        amount: 80,
        status: 'pending',
        notes: 'Retiro prueba saldo insuficiente',
      })
      .select()
      .single();

    expect(testWithdrawalReq).not.toBeNull();

    const insufficientResult = await processWithdrawalWithClient(
      testWithdrawalReq!.id,
      'completed',
      'Intento de aprobar sin saldo',
      specialistId,
      supabaseAdmin
    );

    expect(insufficientResult.success).toBe(false);
    expect(insufficientResult.error).toBe('Saldo insuficiente');

    // Limpieza
    await supabaseAdmin.from('withdrawal_requests').delete().eq('id', testWithdrawalReq!.id);
    await supabaseAdmin.from('users').update({ balance: 120, arcanas: 100 }).eq('id', specialistId);
  });
});
