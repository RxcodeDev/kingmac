#!/usr/bin/env node
/**
 * create-pages.js
 * Creates the 4 policy pages in Shopify via the Admin REST API.
 * Usage: SHOPIFY_TOKEN=<tu-token> node create-pages.js
 *
 * Cómo obtener el token:
 *   Admin Shopify → Apps → Desarrollar apps → Crear app →
 *   Configurar permisos Admin API: write_content → Instalar app → copiar token
 */

const STORE = 'kingden-9646.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN;

if (!TOKEN) {
  console.error('❌  Falta la variable SHOPIFY_TOKEN');
  console.error('    Uso: SHOPIFY_TOKEN=shpat_xxx node create-pages.js');
  process.exit(1);
}

const pages = [
  {
    title: 'Aviso de privacidad',
    handle: 'aviso-de-privacidad',
    template_suffix: 'policy',
    body_html: '',
  },
  {
    title: 'Política de devolución',
    handle: 'politica-de-devolucion',
    template_suffix: 'policy',
    body_html: '',
  },
  {
    title: 'Política de entrega',
    handle: 'politica-de-entrega',
    template_suffix: 'policy',
    body_html: '',
  },
  {
    title: 'Política de compra',
    handle: 'politica-de-compra',
    template_suffix: 'policy',
    body_html: '',
  },
];

async function createPage(page) {
  const url = `https://${STORE}/admin/api/2024-01/pages.json`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': TOKEN,
    },
    body: JSON.stringify({ page }),
  });

  const data = await res.json();

  if (res.ok) {
    const p = data.page;
    console.log(`✅  Creada: "${p.title}"  →  /pages/${p.handle}  (template: ${p.template_suffix})`);
  } else {
    const msg = data.errors || JSON.stringify(data);
    // If it already exists Shopify returns "Handle has already been taken"
    if (JSON.stringify(msg).includes('taken') || JSON.stringify(msg).includes('already')) {
      console.log(`⚠️   Ya existe: /pages/${page.handle}  — actualizando template...`);
      await setTemplate(page);
    } else {
      console.error(`❌  Error creando "${page.title}":`, msg);
    }
  }
}

async function setTemplate(page) {
  // Find the page first
  const url = `https://${STORE}/admin/api/2024-01/pages.json?handle=${page.handle}`;
  const res = await fetch(url, {
    headers: { 'X-Shopify-Access-Token': TOKEN },
  });
  const data = await res.json();
  if (!data.pages || data.pages.length === 0) return;

  const id = data.pages[0].id;
  const putUrl = `https://${STORE}/admin/api/2024-01/pages/${id}.json`;
  const putRes = await fetch(putUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': TOKEN,
    },
    body: JSON.stringify({ page: { id, template_suffix: page.template_suffix } }),
  });
  if (putRes.ok) {
    console.log(`✅  Template actualizado para /pages/${page.handle}`);
  } else {
    console.error(`❌  No se pudo actualizar template para /pages/${page.handle}`);
  }
}

(async () => {
  console.log(`\n🚀  Creando páginas en ${STORE}...\n`);
  for (const page of pages) {
    await createPage(page);
  }
  console.log('\n✨  Listo. Revisa las páginas en kingden.com.mx\n');
})();
