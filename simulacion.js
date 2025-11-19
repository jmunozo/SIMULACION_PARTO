// ===================================
// CONSTANTES FÍSICAS
// ===================================
const G = 9.8; // Aceleración gravitacional (m/s²)
const CONVERSION_PA_TO_MMHG = 133.322; // Factor de conversión Pa a mmHg

// Registrar el plugin de datalabels
if (typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
}

// ===================================
// REFERENCIAS DEL DOM
// ===================================
// Inputs
const inputs = {
    pesoBebe: document.getElementById('peso-bebe'),
    alturaCanal: document.getElementById('altura-canal'),
    alturaUterina: document.getElementById('altura-uterina'),
    densidadLiquido: document.getElementById('densidad-liquido'),
    fuerzaContraccion: document.getElementById('fuerza-contraccion')
};

// Displays de valores
const displays = {
    peso: document.getElementById('peso-display'),
    altura: document.getElementById('altura-display'),
    alturaU: document.getElementById('altura-display-u'),
    densidad: document.getElementById('densidad-display'),
    contraccion: document.getElementById('contraccion-display')
};

// Botones
const calcularBtn = document.getElementById('calcular-btn');
const resetBtn = document.getElementById('reset-btn');

// Resultados
const resultados = {
    vertical: {
        fuerza: document.getElementById('fuerza-vertical'),
        trabajo: document.getElementById('trabajo-vertical'),
        presion: document.getElementById('presion-vertical'),
        presionMmHg: document.getElementById('presion-vertical-mmhg'),
        presionTotal: document.getElementById('presion-total-vertical')
    },
    supina: {
        fuerza: document.getElementById('fuerza-supina'),
        trabajo: document.getElementById('trabajo-supina'),
        presion: document.getElementById('presion-supina'),
        presionMmHg: document.getElementById('presion-supina-mmhg'),
        presionTotal: document.getElementById('presion-total-supina')
    }
};

// SVG Elements para animación
const bebeVertical = document.getElementById('bebe-vertical');
const bebeSupina = document.getElementById('bebe-supina');

// Variables para gráficos
let charts = {
    trabajo: null,
    presion: null,
    presionTotal: null
};

// ===================================
// INICIALIZACIÓN
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    inicializarEventListeners();
    actualizarDisplays();
    actualizarAnimacion();
});

// ===================================
// EVENT LISTENERS
// ===================================
function inicializarEventListeners() {
    // Actualizar displays y animación en tiempo real
    Object.keys(inputs).forEach(key => {
        inputs[key].addEventListener('input', () => {
            actualizarDisplays();
            actualizarAnimacion();
        });
    });

    // Botón calcular
    calcularBtn.addEventListener('click', calcularYMostrarResultados);

    // Botón reset
    resetBtn.addEventListener('click', restablecerValores);
}

// ===================================
// ACTUALIZAR DISPLAYS DE VALORES
// ===================================
function actualizarDisplays() {
    displays.peso.textContent = `${inputs.pesoBebe.value} kg`;
    displays.altura.textContent = `${inputs.alturaCanal.value} m`;
    displays.alturaU.textContent = `${inputs.alturaUterina.value} m`;
    displays.densidad.textContent = `${inputs.densidadLiquido.value} kg/m³`;
    displays.contraccion.textContent = `${inputs.fuerzaContraccion.value} mmHg`;
}

// ===================================
// ACTUALIZAR ANIMACIÓN SVG
// ===================================
function actualizarAnimacion() {
    const alturaCanal = parseFloat(inputs.alturaCanal.value);
    
    // Posición vertical: el bebé desciende proporcionalmente
    // Escala: 0.15m = 200px de recorrido
    const desplazamientoVertical = 80 + (alturaCanal / 0.15) * 200;
    bebeVertical.setAttribute('cy', Math.min(desplazamientoVertical, 320));
    
    // Posición supina: el bebé avanza horizontalmente
    const desplazamientoHorizontal = 80 + (alturaCanal / 0.15) * 220;
    bebeSupina.setAttribute('cx', Math.min(desplazamientoHorizontal, 320));
}

// ===================================
// CÁLCULOS FÍSICOS
// ===================================

/**
 * Calcula la fuerza gravitacional
 * Fórmula: F = m * g
 */
function calcularFuerzaGravitacional(masa) {
    // F = m * g
    const F = masa * G;
    return F;
}

/**
 * Calcula el trabajo mecánico
 * Fórmula vertical: W = F * d * cos(0°)
 * Fórmula supina: W = F * d * cos(90°) = 0
 */
function calcularTrabajoMecanico(fuerza, distancia, angulo) {
    // Convertir ángulo a radianes
    const anguloRad = angulo * Math.PI / 180;
    
    // W = F * d * cos(θ)
    const W = fuerza * distancia * Math.cos(anguloRad);
    return W;
}

/**
 * Calcula la presión hidrostática
 * Fórmula: P = ρ * g * h
 */
function calcularPresionHidrostatica(densidad, altura) {
    // P = ρ * g * h
    const P = densidad * G * altura;
    return P;
}

/**
 * Calcula el momento de fuerza (torque)
 * Fórmula: τ = r * F * sen(θ)
 */
function calcularMomentoFuerza(radio, fuerza, angulo) {
    // Convertir ángulo a radianes
    const anguloRad = angulo * Math.PI / 180;
    
    // τ = r * F * sen(θ)
    const torque = radio * fuerza * Math.sin(anguloRad);
    return torque;
}

/**
 * Convierte presión de Pa a mmHg
 */
function convertirPaAmmHg(presionPa) {
    // P_mmHg = P / 133.322
    const P_mmHg = presionPa / CONVERSION_PA_TO_MMHG;
    return P_mmHg;
}

/**
 * Calcula presión total efectiva
 * P_total = P_uterina + P_hidrostática (en mmHg)
 */
function calcularPresionTotal(presionUterina, presionHidrostatica) {
    return presionUterina + presionHidrostatica;
}

// ===================================
// VALIDACIÓN DE INPUTS
// ===================================
function validarInputs() {
    const valores = {
        pesoBebe: parseFloat(inputs.pesoBebe.value),
        alturaCanal: parseFloat(inputs.alturaCanal.value),
        alturaUterina: parseFloat(inputs.alturaUterina.value),
        densidadLiquido: parseFloat(inputs.densidadLiquido.value),
        fuerzaContraccion: parseFloat(inputs.fuerzaContraccion.value)
    };

    // Verificar que todos los valores sean números válidos
    for (const [key, value] of Object.entries(valores)) {
        if (isNaN(value) || !isFinite(value)) {
            alert(`⚠️ Error: El valor de "${key.replace(/([A-Z])/g, ' $1').toLowerCase()}" no es válido. Por favor, ingresa un número válido.`);
            return null;
        }
        if (value <= 0) {
            alert(`⚠️ Error: El valor de "${key.replace(/([A-Z])/g, ' $1').toLowerCase()}" debe ser mayor que cero.`);
            return null;
        }
    }

    return valores;
}

// ===================================
// CALCULAR Y MOSTRAR RESULTADOS
// ===================================
function calcularYMostrarResultados() {
    // Validar inputs
    const valores = validarInputs();
    if (!valores) return;

    // Obtener valores de entrada
    const m = valores.pesoBebe;
    const d = valores.alturaCanal;
    const h = valores.alturaUterina;
    const rho = valores.densidadLiquido;
    const r = valores.brazoPalanca;
    const P_uterina = valores.fuerzaContraccion;

    try {
        // ====== POSICIÓN VERTICAL ======
        
        // Fuerza gravitacional (igual para ambas posiciones)
        const F = calcularFuerzaGravitacional(m);
    
    // Trabajo mecánico vertical: W = F * d * cos(0°)
    const W_vertical = calcularTrabajoMecanico(F, d, 0);
    
    // Presión hidrostática vertical: P = ρ * g * h
    const P_hidro_vertical = calcularPresionHidrostatica(rho, h);
    const P_hidro_vertical_mmHg = convertirPaAmmHg(P_hidro_vertical);
    
    // Presión total vertical
    const P_total_vertical = calcularPresionTotal(P_uterina, P_hidro_vertical_mmHg);

    // ====== POSICIÓN SUPINA ======
    
    // Trabajo mecánico supina: W = F * d * cos(90°) = 0
    const W_supina = calcularTrabajoMecanico(F, d, 90);
    
    // Presión hidrostática reducida (30% de la vertical en supina)
    const P_hidro_supina = P_hidro_vertical * 0.3;
    const P_hidro_supina_mmHg = convertirPaAmmHg(P_hidro_supina);
    
    // Presión total supina
    const P_total_supina = calcularPresionTotal(P_uterina, P_hidro_supina_mmHg);

    // ====== MOSTRAR RESULTADOS CON FÓRMULAS EXPANDIDAS ======
    
    // Vertical - Fuerza
    resultados.vertical.fuerza.innerHTML = `
        F = ${m} kg × ${G} m/s²<br>
        <strong style="color: var(--secondary-color);">F = ${F.toFixed(2)} N</strong>
    `;
    
    // Vertical - Trabajo
    resultados.vertical.trabajo.innerHTML = `
        W = ${F.toFixed(2)} N × ${d} m × 1<br>
        <strong style="color: var(--secondary-color);">W = ${W_vertical.toFixed(4)} J</strong>
    `;
    

    // Vertical - Presión
    resultados.vertical.presion.innerHTML = `
        P = ${rho} kg/m³ × ${G} m/s² × ${h} m<br>
        <strong style="color: var(--secondary-color);">P = ${P_hidro_vertical.toFixed(2)} Pa ≈ ${P_hidro_vertical_mmHg.toFixed(2)} mmHg</strong>
    `;
    resultados.vertical.presionMmHg.innerHTML = '';
    
    // Vertical - Presión Total
    resultados.vertical.presionTotal.innerHTML = `
        P_total = ${P_uterina} mmHg + ${P_hidro_vertical_mmHg.toFixed(2)} mmHg<br>
        <strong style="color: var(--secondary-color);">P_total = ${P_total_vertical.toFixed(2)} mmHg</strong>
    `;

    // Supina - Fuerza
    resultados.supina.fuerza.innerHTML = `
        F = ${m} kg × ${G} m/s²<br>
        <strong style="color: var(--secondary-color);">F = ${F.toFixed(2)} N</strong>
    `;
    
    // Supina - Trabajo
    resultados.supina.trabajo.innerHTML = `
        W = ${F.toFixed(2)} N × ${d} m × 0<br>
        <strong style="color: var(--secondary-color);">W = ${W_supina.toFixed(4)} J</strong>
    `;
    

    // Supina - Presión (reducida)
    resultados.supina.presion.innerHTML = `
        P = ${rho} kg/m³ × ${G} m/s² × ${h} m (reducida)<br>
        <strong style="color: var(--secondary-color);">P = ${P_hidro_supina.toFixed(2)} Pa ≈ ${P_hidro_supina_mmHg.toFixed(2)} mmHg</strong>
    `;
    resultados.supina.presionMmHg.innerHTML = '';
    
    // Supina - Presión Total
    resultados.supina.presionTotal.innerHTML = `
        P_total = ${P_uterina} mmHg + ${P_hidro_supina_mmHg.toFixed(2)} mmHg<br>
        <strong style="color: var(--secondary-color);">P_total = ${P_total_supina.toFixed(2)} mmHg</strong>
    `;

    // ====== ACTUALIZAR GRÁFICOS ======
    actualizarGraficos({
        trabajo: { vertical: W_vertical, supina: W_supina },
        presion: { vertical: P_hidro_vertical_mmHg, supina: P_hidro_supina_mmHg },
        presionTotal: { vertical: P_total_vertical, supina: P_total_supina }
    });

    // ====== GENERAR CONCLUSIONES ======
    generarConclusiones({
        trabajo: { vertical: W_vertical, supina: W_supina },
        presion: { vertical: P_hidro_vertical_mmHg, supina: P_hidro_supina_mmHg },
        presionTotal: { vertical: P_total_vertical, supina: P_total_supina }
    });
    
    } catch (error) {
        console.error('Error en los cálculos:', error);
        alert('⚠️ Error inesperado durante los cálculos. Por favor, verifica los valores ingresados.');
    }
}

// ===================================
// ACTUALIZAR GRÁFICOS
// ===================================
function actualizarGraficos(datos) {
    // Verificar que Chart.js esté disponible
    if (typeof Chart === 'undefined') {
        console.error('Chart.js no está cargado. Verifica la conexión a internet.');
        alert('⚠️ Error: No se pueden mostrar los gráficos. Verifica tu conexión a internet.');
        return;
    }

    // Configuración común para todos los gráficos
    const configComun = {
        type: 'bar',
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    padding: 12,
                    cornerRadius: 8
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: (value) => value.toFixed(2),
                    font: {
                        weight: 'bold',
                        size: 14
                    },
                    color: '#333'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    };

    // Gráfico de Trabajo Mecánico
    const ctxTrabajo = document.getElementById('chart-trabajo').getContext('2d');
    if (charts.trabajo) charts.trabajo.destroy();
    charts.trabajo = new Chart(ctxTrabajo, {
        ...configComun,
        data: {
            labels: ['Posición Vertical', 'Posición Supina'],
            datasets: [{
                label: 'Trabajo Mecánico (J)',
                data: [datos.trabajo.vertical, datos.trabajo.supina],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.7)',
                    'rgba(244, 67, 54, 0.7)'
                ],
                borderColor: [
                    'rgba(76, 175, 80, 1)',
                    'rgba(244, 67, 54, 1)'
                ],
                borderWidth: 2
            }]
        }
    });

    // Gráfico de Presión Hidrostática
    const ctxPresion = document.getElementById('chart-presion').getContext('2d');
    if (charts.presion) charts.presion.destroy();
    charts.presion = new Chart(ctxPresion, {
        ...configComun,
        data: {
            labels: ['Posición Vertical', 'Posición Supina'],
            datasets: [{
                label: 'Presión Hidrostática (mmHg)',
                data: [datos.presion.vertical, datos.presion.supina],
                backgroundColor: [
                    'rgba(33, 150, 243, 0.7)',
                    'rgba(255, 152, 0, 0.7)'
                ],
                borderColor: [
                    'rgba(33, 150, 243, 1)',
                    'rgba(255, 152, 0, 1)'
                ],
                borderWidth: 2
            }]
        }
    });

    // Gráfico de Presión Total
    const ctxPresionTotal = document.getElementById('chart-presion-total').getContext('2d');
    if (charts.presionTotal) charts.presionTotal.destroy();
    charts.presionTotal = new Chart(ctxPresionTotal, {
        ...configComun,
        data: {
            labels: ['Posición Vertical', 'Posición Supina'],
            datasets: [{
                label: 'Presión Total Efectiva (mmHg)',
                data: [datos.presionTotal.vertical, datos.presionTotal.supina],
                backgroundColor: [
                    'rgba(0, 188, 212, 0.7)',
                    'rgba(255, 87, 34, 0.7)'
                ],
                borderColor: [
                    'rgba(0, 188, 212, 1)',
                    'rgba(255, 87, 34, 1)'
                ],
                borderWidth: 2
            }]
        }
    });
}

// ===================================
// GENERAR CONCLUSIONES AUTOMÁTICAS
// ===================================
function generarConclusiones(datos) {
    const container = document.getElementById('conclusiones-container');
    
    // Limpiar conclusiones previas
    container.innerHTML = '';

    // Análisis de Trabajo Mecánico
    const mejorTrabajo = datos.trabajo.vertical > datos.trabajo.supina ? 'vertical' : 'supina';
    const diferenciaTrabajoPercent = datos.trabajo.vertical !== 0 
        ? ((datos.trabajo.vertical - datos.trabajo.supina) / datos.trabajo.vertical * 100).toFixed(1)
        : '0.0';
    
    const conclusionTrabajo = document.createElement('div');
    conclusionTrabajo.className = 'conclusion-item highlight';
    conclusionTrabajo.innerHTML = `
        <h4>🎯 Trabajo Mecánico Útil</h4>
        <p>La <strong>posición ${mejorTrabajo}</strong> genera mayor trabajo mecánico útil.</p>
        <p>La posición vertical produce <strong>${datos.trabajo.vertical.toFixed(4)} J</strong> de trabajo, mientras que la posición supina produce <strong>${datos.trabajo.supina.toFixed(4)} J</strong>.</p>
        <p>Esto representa una diferencia del <strong>${diferenciaTrabajoPercent}%</strong> a favor de la posición vertical, ya que la gravedad contribuye directamente al descenso fetal.</p>
    `;
    container.appendChild(conclusionTrabajo);

    // Análisis de Presión Hidrostática
    const mejorPresion = datos.presion.vertical > datos.presion.supina ? 'vertical' : 'supina';
    const diferenciaPresionPercent = datos.presion.vertical !== 0
        ? ((datos.presion.vertical - datos.presion.supina) / datos.presion.vertical * 100).toFixed(1)
        : '0.0';
    
    const conclusionPresion = document.createElement('div');
    conclusionPresion.className = 'conclusion-item';
    conclusionPresion.innerHTML = `
        <h4>💧 Presión Hidrostática Efectiva</h4>
        <p>La <strong>posición ${mejorPresion}</strong> produce mayor presión hidrostática.</p>
        <p>La presión en posición vertical es de <strong>${datos.presion.vertical.toFixed(2)} mmHg</strong>, comparado con <strong>${datos.presion.supina.toFixed(2)} mmHg</strong> en posición supina.</p>
        <p>La diferencia es del <strong>${diferenciaPresionPercent}%</strong>, lo que indica que la columna de líquido amniótico ejerce mayor presión en posición vertical, facilitando el descenso.</p>
    `;
    container.appendChild(conclusionPresion);

    // Análisis de Presión Total
    const mejorPresionTotal = datos.presionTotal.vertical > datos.presionTotal.supina ? 'vertical' : 'supina';
    
    const conclusionPresionTotal = document.createElement('div');
    conclusionPresionTotal.className = 'conclusion-item highlight';
    conclusionPresionTotal.innerHTML = `
        <h4>📊 Presión Total Efectiva</h4>
        <p>La <strong>posición ${mejorPresionTotal}</strong> genera mayor presión total efectiva.</p>
        <p>Combinando presión uterina y presión hidrostática:</p>
        <ul style="margin-left: 20px; margin-top: 10px;">
            <li>Vertical: <strong>${datos.presionTotal.vertical.toFixed(2)} mmHg</strong></li>
            <li>Supina: <strong>${datos.presionTotal.supina.toFixed(2)} mmHg</strong></li>
        </ul>
        <p style="margin-top: 10px;">La presión adicional en posición vertical favorece el progreso del trabajo de parto.</p>
    `;
    container.appendChild(conclusionPresionTotal);

    // Conclusión General
    const conclusionGeneral = document.createElement('div');
    conclusionGeneral.className = 'conclusion-item highlight';
    conclusionGeneral.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    conclusionGeneral.style.color = 'white';
    conclusionGeneral.innerHTML = `
        <h4 style="color: white;">🏆 Conclusión General</h4>
        <p>Basándose en los principios físicos analizados, la <strong>posición vertical</strong> presenta ventajas significativas:</p>
        <ul style="margin-left: 20px; margin-top: 10px;">
            <li>✅ Mayor trabajo mecánico útil (aprovecha la gravedad)</li>
            <li>✅ Mayor presión hidrostática efectiva</li>
            <li>✅ Mayor presión total que contribuye al descenso</li>
        </ul>
        <p style="margin-top: 10px;"><em>Estos resultados respaldan el uso de posiciones verticales durante el trabajo de parto desde una perspectiva física.</em></p>
    `;
    container.appendChild(conclusionGeneral);
}

// ===================================
// RESTABLECER VALORES PREDETERMINADOS
// ===================================
function restablecerValores() {
    inputs.pesoBebe.value = 3.5;
    inputs.alturaCanal.value = 0.15;
    inputs.alturaUterina.value = 0.30;
    inputs.densidadLiquido.value = 1006;
    inputs.fuerzaContraccion.value = 50;

    actualizarDisplays();
    actualizarAnimacion();

    // Limpiar resultados
    Object.values(resultados.vertical).forEach(el => el.innerHTML = '-');
    Object.values(resultados.supina).forEach(el => el.innerHTML = '-');

    // Limpiar gráficos
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });

    // Limpiar conclusiones
    document.getElementById('conclusiones-container').innerHTML = 
        '<p class="placeholder-text">Presiona "Calcular Comparativa" para ver las conclusiones basadas en los cálculos físicos.</p>';
}
