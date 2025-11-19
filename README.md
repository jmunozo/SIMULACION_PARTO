# 🏥 Simulador de Posiciones de Parto

## 📋 Descripción
Interfaz web interactiva que compara posición vertical vs posición supina durante el trabajo de parto usando principios físicos.

## ✅ Cálculos Implementados

### Fórmulas Físicas Correctas:
1. **Fuerza Gravitacional**: `F = m × g` (g = 9.8 m/s²)
2. **Trabajo Mecánico Vertical**: `W = F × d × cos(0°)` → `W = F × d`
3. **Trabajo Mecánico Supina**: `W = F × d × cos(90°)` → `W = 0`
4. **Presión Hidrostática**: `P = ρ × g × h`
5. **Conversión**: `P_mmHg = P_Pa / 133.322`
7. **Presión Total**: `P_total = P_uterina + P_hidrostática`

### Valores Predeterminados:
- Peso del bebé: 3.5 kg
- Altura del canal: 0.15 m
- Altura uterina: 0.30 m
- Densidad líquido amniótico: 1006 kg/m³
- Fuerza de contracción: 50 mmHg

## 🛡️ Validaciones Implementadas

### Validación HTML5:
- Todos los inputs tienen atributos `min` y `max`
- Atributo `required` en todos los campos
- Atributo `step` para incrementos apropiados
- Tipo `number` para prevenir texto

### Validación JavaScript:
✅ Verificación de valores NaN o Infinity  
✅ Verificación de valores positivos (> 0)  
✅ Mensajes de error descriptivos  
✅ Prevención de división por cero  
✅ Try-catch para errores inesperados  

## ⚠️ Casos donde podría fallar

### 1. **Chart.js no carga (Sin internet)**
- **Síntoma**: Los gráficos no se muestran
- **Solución**: El código detecta esto y muestra una alerta
- **Alternativa**: Descargar Chart.js localmente

### 2. **Valores extremos fuera de rango**
- **Síntoma**: Resultados muy grandes o animación desbordada
- **Prevención**: Límites min/max en inputs HTML
- **Rango seguro**: Usar valores dentro de los límites establecidos

### 3. **Navegador antiguo**
- **Síntoma**: Sintaxis moderna no compatible
- **Requisito**: Navegador moderno (Chrome 90+, Firefox 88+, Edge 90+)
- **Características usadas**: ES6+, SVG, Canvas API

### 4. **JavaScript deshabilitado**
- **Síntoma**: Página estática sin funcionalidad
- **Solución**: Habilitar JavaScript en el navegador

### 5. **Archivos separados**
- **Síntoma**: Estilos o scripts no cargan
- **Causa**: Los 3 archivos deben estar en el mismo directorio
- **Verificar**: `index.html`, `estilos.css`, `simulacion.js`

## 🔍 Verificación de Cálculos

### Ejemplo de prueba manual:
**Entrada:**
- Peso bebé: 3.5 kg
- Altura canal: 0.15 m
- Altura uterina: 0.30 m

**Resultados esperados:**
- Fuerza: `3.5 × 9.8 = 34.3 N`
- Trabajo vertical: `34.3 × 0.15 × cos(0°) = 5.145 J`
- Trabajo supina: `34.3 × 0.15 × cos(90°) = 0 J`
- Presión: `1006 × 9.8 × 0.30 = 2957.64 Pa ≈ 22.18 mmHg`

## 🚀 Cómo Ejecutar

### Opción 1: Doble clic
Simplemente abre `index.html` con doble clic.

### Opción 2: Desde navegador
Arrastra `index.html` a tu navegador.

### Opción 3: Servidor local (opcional)
```bash
# Con Python 3
python -m http.server 8000

# Con Node.js
npx http-server
```
Luego abre: `http://localhost:8000`

## 📊 Características

✅ **Animación y displays en tiempo real** - Los sliders actualizan la animación y los valores instantáneamente  
✅ **Resultados y gráficos solo al presionar "CALCULAR COMPARATIVA"**  
✅ **Animación SVG** - Visualización del descenso fetal  
✅ **4 Gráficos comparativos** - Chart.js con animaciones  
✅ **Conclusiones automáticas** - Análisis inteligente con porcentajes  
✅ **Diseño responsivo** - Funciona en móviles y tablets  
✅ **Validación robusta** - Previene errores de entrada  
✅ **Manejo de errores** - Mensajes claros al usuario  

## 🔧 Dependencias

- **Chart.js 4.4.0** (desde CDN): Para gráficos interactivos
- Sin otras dependencias externas

## 📝 Notas Técnicas

### Supuestos del modelo:
1. La presión hidrostática en supina es 30% de la vertical (basado en geometría)
2. El momento de fuerza en supina es 50% del vertical (menor eficiencia rotacional)
3. La gravedad contribuye 100% en vertical vs 0% en supina para trabajo mecánico

### Precisión:
- Todos los cálculos usan punto flotante de JavaScript (64-bit)
- Resultados redondeados apropiadamente para legibilidad
- Conversión Pa→mmHg usa factor estándar 133.322

## 🐛 Debugging

Si encuentras problemas:
1. Abre la consola del navegador (F12)
2. Revisa mensajes de error
3. Verifica que los 3 archivos estén presentes
4. Confirma conexión a internet (para Chart.js)

## 📄 Licencia

Proyecto educativo - 2025
