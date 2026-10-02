import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Flujo de Creación de Contratos y Retención de Sesión', () => {
  const testEmail = '12345@gmail.com';
  const testPassword = 'abcdef';
  const samplePdfPath = path.resolve(__dirname, '../fixtures/documento-prueba.pdf');
  const secondPdfPath = path.resolve(__dirname, '../fixtures/segundo-documento.pdf');
  const invalidTxtPath = path.resolve(__dirname, '../fixtures/archivo-invalido.txt');

  test.beforeEach(async ({ page }) => {
    // Navigate to login
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Fill login credentials
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);

    // Submit login
    await page.click('button[type="submit"]');

    // Wait for successful navigation to student dashboard
    await page.waitForURL('**/student/dashboard', { timeout: 20000 });
    await expect(page).toHaveURL(/\/student\/dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard de Usuario');
  });

  test('Flujo E2E completo: Navegación, localización en español, carga de archivos a Storage, publicación y confirmación en dashboard', async ({ page }) => {
    // 1. Navegación directa desde el dashboard hacia la creación de nuevo contrato sin deslogueo
    const newContractLink = page.locator('a[href="/student/contracts/new"]').first();
    await expect(newContractLink).toBeVisible();
    await newContractLink.click();

    // Estabilidad de sesión: verificar que entra directamente a /student/contracts/new sin ir a /auth/login
    await page.waitForURL('**/student/contracts/new', { timeout: 15000 });
    await expect(page).toHaveURL(/\/student\/contracts\/new/);
    await expect(page.locator('h1')).toContainText('Crear Nuevo Contrato');

    // 2. Localización y experiencia del selector de deadline en español
    const deadlineLabel = page.locator('label[for="deadline"]');
    await expect(deadlineLabel).toContainText('Fecha y Hora Límite de Entrega');
    await expect(page.getByText('Plazo máximo de entrega del trabajo (mínimo 12 horas a partir de ahora)')).toBeVisible();

    // Verificar presencia de botones de sugerencias rápidas
    const preset12h = page.getByRole('button', { name: '+12 horas (urgente)' });
    const preset24h = page.getByRole('button', { name: '+24 horas (1 día)' });
    const preset3d = page.getByRole('button', { name: '+3 días' });
    const preset1w = page.getByRole('button', { name: '+1 semana' });

    await expect(preset12h).toBeVisible();
    await expect(preset24h).toBeVisible();
    await expect(preset3d).toBeVisible();
    await expect(preset1w).toBeVisible();

    // 3. Llenado del formulario con jerarquía académica, precio y deadline
    const uniqueTitle = `Proyecto Automatizado Playwright ${Date.now()}`;
    const contractDesc = 'Esta es una descripción detallada de prueba para la verificación automatizada del flujo E2E en Playwright con plazo de entrega urgente y archivo adjunto en Storage.';

    await page.fill('#title', uniqueTitle);
    await page.fill('#description', contractDesc);

    // Seleccionar Jerarquía Académica
    await page.selectOption('#department', 'Cochabamba');
    await page.selectOption('#faculty', 'Facultad de Tecnologia');
    await page.selectOption('#career', 'Ing. de Sistemas');

    // Precio inicial
    await page.fill('#price', '350');

    // Seleccionar deadline mediante atajo rápido urgente de +12 horas (comprobando que no se invalida inmediatamente)
    await preset12h.click();

    // Verificar indicación contextual en español con fecha formateada y tiempo relativo
    const contextualPreview = page.locator('div:has-text("Plazo seleccionado:")').last();
    await expect(contextualPreview).toBeVisible();

    // Adjuntar archivo en Supabase Storage
    await page.setInputFiles('#files', samplePdfPath);
    await expect(page.getByText('documento-prueba.pdf')).toBeVisible();

    // Aceptar términos y condiciones
    const termsCheckbox = page.locator('input[type="checkbox"]').first();
    await termsCheckbox.check();

    // Botón de submit debe estar habilitado
    const submitButton = page.getByRole('button', { name: 'Publicar Contrato' });
    await expect(submitButton).toBeEnabled();

    // 4. Envío y publicación del contrato
    await submitButton.click();

    // Verificar que NO aparece el error espurio "Tu sesión ha expirado"
    await expect(page.getByText('Tu sesión ha expirado')).not.toBeVisible();

    // Verificar que NO se redirige a /auth/login
    await expect(page).not.toHaveURL(/\/auth\/login/);

    // Redirección inmediata a la vista de detalle del contrato: /student/contracts/[id]
    await page.waitForURL(/\/student\/contracts\/[a-f0-9-]+/, { timeout: 25000 });
    await expect(page).toHaveURL(/\/student\/contracts\/[a-f0-9-]+/);

    // Verificar los datos del contrato en la vista de detalle
    await expect(page.locator('h1')).toHaveText(uniqueTitle);
    // Estado Abierto (open)
    await expect(page.getByText('Abierto').first()).toBeVisible();
    // Precio
    await expect(page.getByText('Bs. 350')).toBeVisible();
    // Jerarquía académica visible
    await expect(page.getByText('Cochabamba')).toBeVisible();
    await expect(page.getByText('Facultad de Tecnologia')).toBeVisible();
    await expect(page.getByText('Ing. de Sistemas')).toBeVisible();

    // Verificar que el archivo adjunto está vinculado en Supabase Storage y visible
    await expect(page.getByText('Archivos Adjuntos')).toBeVisible();
    await expect(page.getByText(/documento-prueba\.pdf/)).toBeVisible();
    const downloadLink = page.locator('a[href*="contract-files"]');
    await expect(downloadLink).toBeVisible();

    // Verificar preparación para recepción de contraofertas según R3
    await expect(page.getByText(/Ofertas Recibidas/)).toBeVisible();
    await expect(page.getByText('Aún no has recibido ofertas. Los especialistas serán notificados.')).toBeVisible();

    // 5. Regresar al Dashboard y verificar que el contrato aparece activo/abierto
    await page.goto('/student/dashboard');
    await page.waitForURL('**/student/dashboard');
    await page.waitForLoadState('networkidle');

    // Verificar que el contrato recién creado aparece listado en Mis Contratos
    const createdContractCard = page.locator(`h3:has-text("${uniqueTitle}")`);
    await expect(createdContractCard).toBeVisible();
  });

  test('Preservación del borrador en localStorage sin interferir con la sesión', async ({ page }) => {
    // Navegar a nuevo contrato
    await page.goto('/student/contracts/new');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/student\/contracts\/new/);

    const draftTitle = `Borrador Test ${Date.now()}`;
    const draftDesc = 'Descripción de prueba para verificar persistencia en localStorage sin deslogueos de sesión.';

    await page.fill('#title', draftTitle);
    await page.fill('#description', draftDesc);
    await page.fill('#price', '200');

    // Recargar página para comprobar que el borrador se restaura
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Comprobar que sigue autenticado y los valores se recuperaron
    await expect(page).toHaveURL(/\/student\/contracts\/new/);
    await expect(page.locator('#title')).toHaveValue(draftTitle);
    await expect(page.locator('#description')).toHaveValue(draftDesc);
    await expect(page.locator('#price')).toHaveValue('200');

    // Limpiar campos del borrador para no interferir en futuras pruebas
    await page.evaluate(() => localStorage.removeItem('draft_contract'));
  });

  test('Validación de plazo mínimo de 12 horas, ayudas en español y recuperación de plazo vencido/idle', async ({ page }) => {
    await page.goto('/student/contracts/new');
    await page.waitForLoadState('networkidle');

    // Inyectar una fecha inválida (por ejemplo dentro de 2 horas)
    const invalidDate = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const invalidDateStr = `${invalidDate.getFullYear()}-${pad(invalidDate.getMonth() + 1)}-${pad(invalidDate.getDate())}T${pad(invalidDate.getHours())}:${pad(invalidDate.getMinutes())}`;

    await page.fill('#deadline', invalidDateStr);

    // Debe mostrar la advertencia contextual en español
    await expect(page.getByText('La fecha y hora límite debe ser de al menos 12 horas en el futuro.')).toBeVisible();

    // Debe mostrar el botón de recuperación rápida en línea dentro de la advertencia
    const inlineRecoveryBtn = page.getByRole('button', { name: 'Actualizar a +12 horas' });
    await expect(inlineRecoveryBtn).toBeVisible();

    // El botón debe permanecer deshabilitado
    const submitBtn = page.getByRole('button', { name: 'Publicar Contrato' });
    await expect(submitBtn).toBeDisabled();

    // Al presionar el botón de recuperación en línea, la advertencia debe desaparecer y mostrar el texto azul de plazo
    await inlineRecoveryBtn.click();
    await expect(page.getByText('La fecha y hora límite debe ser de al menos 12 horas en el futuro.')).not.toBeVisible();
    await expect(page.locator('div:has-text("Plazo seleccionado:")').last()).toBeVisible();

    // Inyectar nuevamente una fecha inválida para comprobar también el atajo rápido de la barra
    await page.fill('#deadline', invalidDateStr);
    await expect(page.getByText('La fecha y hora límite debe ser de al menos 12 horas en el futuro.')).toBeVisible();
    await page.getByRole('button', { name: '+12 horas (urgente)' }).click();
    await expect(page.getByText('La fecha y hora límite debe ser de al menos 12 horas en el futuro.')).not.toBeVisible();
    await expect(page.locator('div:has-text("Plazo seleccionado:")').last()).toBeVisible();
  });

  test('Resiliencia de archivos adjuntos: subida, remoción con botón X y re-selección', async ({ page }) => {
    await page.goto('/student/contracts/new');
    await page.waitForLoadState('networkidle');

    // Adjuntar archivo
    await page.setInputFiles('#files', samplePdfPath);
    await expect(page.getByText('documento-prueba.pdf')).toBeVisible();

    // Remover con botón X
    const removeButton = page.locator('button:has(svg.lucide-x)').first();
    await removeButton.click();
    await expect(page.getByText('documento-prueba.pdf')).not.toBeVisible();

    // Re-seleccionar el mismo archivo para verificar que el input file no quedó bloqueado
    await page.setInputFiles('#files', samplePdfPath);
    await expect(page.getByText('documento-prueba.pdf')).toBeVisible();
  });

  test('Adaptabilidad y usabilidad del selector de fecha en viewport móvil (<375px)', async ({ page }) => {
    // Configurar viewport pequeño para móviles
    await page.setViewportSize({ width: 360, height: 740 });

    await page.goto('/student/contracts/new');
    await page.waitForLoadState('networkidle');

    // Verificar que los botones de presets se visualizan y son interactuables en pantalla angosta
    const preset12h = page.getByRole('button', { name: '+12 horas (urgente)' });
    await expect(preset12h).toBeVisible();
    await preset12h.click();

    // Verificar que la ayuda contextual se muestra legible
    const preview = page.locator('div:has-text("Plazo seleccionado:")').last();
    await expect(preview).toBeVisible();
  });

  test('Validación y rechazo inmediato de tipos de archivo no permitidos (.txt)', async ({ page }) => {
    await page.goto('/student/contracts/new');
    await page.waitForLoadState('networkidle');

    // Intentar adjuntar archivo de texto no permitido
    await page.setInputFiles('#files', invalidTxtPath);

    // Debe mostrar mensaje de error en español (en banner y/o toast)
    await expect(page.getByText(/Tipo de archivo no permitido/).first()).toBeVisible();

    // El archivo inválido NO debe aparecer en la lista de archivos adjuntos agregados
    await expect(page.locator('p.text-sm.text-white:has-text("archivo-invalido.txt")')).not.toBeVisible();
  });

  test('Manejo de múltiples archivos adjuntos simultáneos y verificación en detalle', async ({ page }) => {
    await page.goto('/student/contracts/new');
    await page.waitForLoadState('networkidle');

    const multiTitle = `Proyecto Multi-Archivo ${Date.now()}`;
    await page.fill('#title', multiTitle);
    await page.fill('#description', 'Descripción detallada para la verificación integral de subida múltiple de archivos binarios hacia Supabase Storage.');

    await page.selectOption('#department', 'La Paz');
    await page.selectOption('#faculty', 'Facultad de Tecnologia');
    await page.selectOption('#career', 'Ing. Civil');
    await page.fill('#price', '420');

    // Preset de 24 horas
    await page.getByRole('button', { name: '+24 horas (1 día)' }).click();

    // Adjuntar múltiples archivos a la vez
    await page.setInputFiles('#files', [samplePdfPath, secondPdfPath]);
    await expect(page.getByText('documento-prueba.pdf')).toBeVisible();
    await expect(page.getByText('segundo-documento.pdf')).toBeVisible();

    // Aceptar términos y publicar
    await page.locator('input[type="checkbox"]').first().check();
    await page.getByRole('button', { name: 'Publicar Contrato' }).click();

    // Redirección al detalle del contrato
    await page.waitForURL(/\/student\/contracts\/[a-f0-9-]+/, { timeout: 25000 });
    await expect(page.locator('h1')).toHaveText(multiTitle);

    // Ambos archivos deben aparecer en Archivos Adjuntos
    await expect(page.getByRole('heading', { name: 'Archivos Adjuntos' })).toBeVisible();
    await expect(page.getByText(/documento-prueba\.pdf/)).toBeVisible();
    await expect(page.getByText(/segundo-documento\.pdf/)).toBeVisible();

    // Verificación de contraofertas lista
    await expect(page.getByText(/Ofertas Recibidas/)).toBeVisible();
  });

  test('Comportamiento multi-pestaña: expiración de sesión durante composición/envío y recuperación de borrador', async ({ page, context }) => {
    // Pestaña 1: Componer contrato
    await page.goto('/student/contracts/new');
    await page.waitForLoadState('networkidle');

    const draftTitle = `Borrador MultiTab ${Date.now()}`;
    const draftDesc = 'Contenido redactado antes del cierre de sesión en pestaña paralela para validar retención de borrador.';

    await page.fill('#title', draftTitle);
    await page.fill('#description', draftDesc);
    await page.selectOption('#department', 'Cochabamba');
    await page.selectOption('#faculty', 'Facultad de Tecnologia');
    await page.selectOption('#career', 'Ing. de Sistemas');
    await page.fill('#price', '300');
    await page.getByRole('button', { name: '+12 horas (urgente)' }).click();
    await page.locator('input[type="checkbox"]').first().check();

    // Pestaña 2: Simular deslogueo en otra pestaña
    const page2 = await context.newPage();
    await page2.goto('/student/dashboard');
    await page2.waitForLoadState('networkidle');
    // Cerrar sesión en la segunda pestaña
    await page2.goto('/auth/logout');
    await page2.waitForURL('**/', { timeout: 15000 });
    await page2.close();

    // Pestaña 1: Intentar publicar el contrato tras el deslogueo en Pestaña 2
    const submitBtn = page.getByRole('button', { name: 'Publicar Contrato' });
    await submitBtn.click();

    // Debe mostrar mensaje de sesión expirada
    await expect(page.getByText('Tu sesión ha expirado. Redirigiendo al login...').first()).toBeVisible({ timeout: 10000 });

    // Debe redirigir al login preservando el parámetro redirectTo
    await page.waitForURL(/\/auth\/login\?redirectTo=.+/, { timeout: 15000 });

    // Re-iniciar sesión
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');

    // Debe regresar a /student/contracts/new
    await page.waitForURL('**/student/contracts/new', { timeout: 20000 });
    await expect(page).toHaveURL(/\/student\/contracts\/new/);

    // El borrador debe haberse recuperado exitosamente
    await expect(page.locator('#title')).toHaveValue(draftTitle);
    await expect(page.locator('#description')).toHaveValue(draftDesc);
    await expect(page.locator('#price')).toHaveValue('300');

    // Limpiar borrador para no dejar residuo
    await page.evaluate(() => localStorage.removeItem('draft_contract'));
  });

  test('Flujo de contraofertas P2P: recepción de oferta, visualización de OfferCard y aceptación con transición a DirectPaymentHub', async ({ page }) => {
    // 1. Crear un contrato
    await page.goto('/student/contracts/new');
    await page.waitForLoadState('networkidle');

    const offerTitle = `Contrato para Contraofertas ${Date.now()}`;
    await page.fill('#title', offerTitle);
    await page.fill('#description', 'Contrato para probar la recepción y aceptación de contraofertas de especialistas con DirectPaymentHub.');
    await page.selectOption('#department', 'Cochabamba');
    await page.selectOption('#faculty', 'Facultad de Tecnologia');
    await page.selectOption('#career', 'Ing. de Sistemas');
    await page.fill('#price', '250');
    await page.getByRole('button', { name: '+24 horas (1 día)' }).click();
    await page.locator('input[type="checkbox"]').first().check();
    await page.getByRole('button', { name: 'Publicar Contrato' }).click();

    await page.waitForURL(/\/student\/contracts\/[a-f0-9-]+/, { timeout: 25000 });
    const contractUrl = page.url();
    const contractId = contractUrl.split('/').pop()!;

    // 2. Insertar una contraoferta simulada de un especialista verificado en la base de datos
    const specialistId = '92e04285-db69-4352-906e-d7f8402c7e2f'; // Especialista verificado del seeder
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: offerError } = await supabaseAdmin
      .from('offers')
      .insert({
        contract_id: contractId,
        specialist_id: specialistId,
        price: 280,
        message: 'Puedo realizar este proyecto en 24 horas garantizando alta calidad.',
      });

    expect(offerError).toBeNull();

    // 3. Recargar la página del contrato para ver la oferta recibida
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verificar contador de ofertas recibidas
    await expect(page.getByText('Ofertas Recibidas (1)')).toBeVisible();

    // Verificar tarjeta de oferta (OfferCard)
    await expect(page.getByText('Bs. 280')).toBeVisible();
    await expect(page.getByText('Puedo realizar este proyecto en 24 horas garantizando alta calidad.')).toBeVisible();
    const acceptOfferBtn = page.getByRole('button', { name: 'Aceptar Oferta' });
    await expect(acceptOfferBtn).toBeVisible();

    // 4. Aceptar la oferta confirmando el diálogo
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await acceptOfferBtn.click();

    // Verificar notificación de aceptación y transición de estado a DirectPaymentHub
    await expect(page.getByText('Oferta aceptada. El contrato está ahora pendiente de depósito.').first()).toBeVisible({ timeout: 10000 });

    // Verificar que el DirectPaymentHub se muestra en la página
    await expect(page.getByText(/Paso 1: Pago Directo/)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Paso 2: Comisión de Servicio/)).toBeVisible();
  });
});
