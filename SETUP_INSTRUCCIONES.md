# Configurar Tienda de Desarrollo de Shopify

## Paso 1: Crear cuenta de Shopify Partners (si no tienes una)

1. Ve a: https://partners.shopify.com/signup
2. Regístrate con tu email (kingdenmex@gmail.com)
3. Completa el formulario de registro

## Paso 2: Crear una tienda de desarrollo

### Opción A: Desde Shopify Partners (Web)
1. Inicia sesión en https://partners.shopify.com
2. Ve a "Stores" → "Add store"
3. Selecciona "Development store"
4. Completa los datos:
   - Nombre de la tienda (ej: kingmac-dev)
   - Dirección (ej: kingmac-dev.myshopify.com)
   - Propósito: Development
5. Haz clic en "Create"

### Opción B: Desde el CLI
```bash
shopify auth login
# Sigue las instrucciones para autenticarte

# Esto te permitirá crear o seleccionar una tienda
shopify theme dev
```

## Paso 3: Conectar tu tema local a la tienda

Una vez que tengas tu tienda de desarrollo:

```bash
# Desde la carpeta del tema
cd /home/rxmovil/Documentos/rectrack/kingmacs/kingmac

# Iniciar servidor de desarrollo
shopify theme dev --store TU-TIENDA-DEV

# O sin --store para que te pregunte
shopify theme dev
```

## Paso 4: Subir el tema a tu tienda (opcional)

Si quieres subirlo como tema:

```bash
shopify theme push
```

## Notas Importantes

- Las tiendas de desarrollo son **100% gratuitas**
- Puedes crear múltiples tiendas de desarrollo
- No tienen límite de tiempo
- Tienen todas las funcionalidades de Shopify
- Solo tú puedes acceder a ellas (no son públicas)

## Solución de Problemas

Si te da error de autenticación:
```bash
shopify auth logout
shopify auth login
```

Si necesitas cambiar de tienda:
```bash
shopify theme dev --store NUEVA-TIENDA
```
