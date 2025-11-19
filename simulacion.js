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
    // No calcular resultados automáticamente
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
    
        // Vertical - Fuerza (con SVG animado)
        resultados.vertical.fuerza.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    F = ${m} kg × ${G} m/s²<br>
                    <strong style=\"color: var(--secondary-color);\">F = ${F.toFixed(2)} N</strong>
                </div>
                <div style="margin-left: 16px; min-width: 90px;">
                    <svg width="80" height="120" viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg">
                        <!-- Cabello -->
                        <ellipse cx="40" cy="22" rx="13" ry="10" fill="#7c4a1e"/>
                        <ellipse cx="32" cy="28" rx="7" ry="5" fill="#7c4a1e"/>
                        <!-- Cabeza -->
                        <ellipse cx="40" cy="28" rx="10" ry="12" fill="#f9d6b5" stroke="#b48a78" stroke-width="1.5"/>
                        <!-- Cuello -->
                        <rect x="36" y="38" width="8" height="8" rx="4" fill="#f9d6b5"/>
                        <!-- Brazo izquierdo -->
                        <rect x="18" y="48" width="7" height="28" rx="4" fill="#f9d6b5" stroke="#b48a78" stroke-width="1" transform="rotate(-18 21.5 62)"/>
                        <!-- Brazo derecho -->
                        <rect x="55" y="48" width="7" height="28" rx="4" fill="#f9d6b5" stroke="#b48a78" stroke-width="1" transform="rotate(18 58.5 62)"/>
                        <!-- Cuerpo -->
                        <ellipse cx="40" cy="62" rx="16" ry="28" fill="#f9d6b5" stroke="#b48a78" stroke-width="1.5"/>
                        <!-- Barriga (embarazo) -->
                        <ellipse cx="48" cy="78" rx="13" ry="16" fill="#eabfae" stroke="#b48a78" stroke-width="1.2"/>
                        <!-- Pierna izquierda -->
                        <rect x="30" y="90" width="7" height="25" rx="4" fill="#b48a78">
                            <animate attributeName="y" values="90;98;90" dur="1.2s" repeatCount="indefinite"/>
                        </rect>
                        <!-- Pierna derecha -->
                        <rect x="43" y="90" width="7" height="25" rx="4" fill="#b48a78">
                            <animate attributeName="y" values="90;98;90" dur="1.2s" begin="0.6s" repeatCount="indefinite"/>
                        </rect>
                        <!-- Flecha de gravedad -->
                        <g>
                            <line x1="40" y1="10" x2="40" y2="115" stroke="#4caf50" stroke-width="2" stroke-dasharray="4 2"/>
                            <polygon points="36,110 44,110 40,118" fill="#4caf50">
                                <animateTransform attributeName="transform" type="translate" values="0,0;0,8;0,0" dur="1.2s" repeatCount="indefinite"/>
                            </polygon>
                        </g>
                    </svg>
                </div>
            </div>
        `;
    
    // Vertical - Trabajo (SVG animado: mujer caminando hacia abajo, representa trabajo)
    resultados.vertical.trabajo.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
                W = ${F.toFixed(2)} N × ${d} m × 1<br>
                <strong style=\"color: var(--secondary-color);\">W = ${W_vertical.toFixed(4)} J</strong>
            </div>
            <div style="margin-left: 16px; min-width: 90px;">
                <svg width="80" height="120" viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg">
                    <!-- Cabello -->
                    <ellipse cx="40" cy="22" rx="13" ry="10" fill="#7c4a1e"/>
                    <ellipse cx="32" cy="28" rx="7" ry="5" fill="#7c4a1e"/>
                    <!-- Cabeza -->
                    <ellipse cx="40" cy="28" rx="10" ry="12" fill="#f9d6b5" stroke="#b48a78" stroke-width="1.5"/>
                    <!-- Cuello -->
                    <rect x="36" y="38" width="8" height="8" rx="4" fill="#f9d6b5"/>
                    <!-- Brazos -->
                    <rect x="18" y="48" width="7" height="28" rx="4" fill="#f9d6b5" stroke="#b48a78" stroke-width="1" transform="rotate(-18 21.5 62)"/>
                    <rect x="55" y="48" width="7" height="28" rx="4" fill="#f9d6b5" stroke="#b48a78" stroke-width="1" transform="rotate(18 58.5 62)"/>
                    <!-- Cuerpo -->
                    <ellipse cx="40" cy="62" rx="16" ry="28" fill="#f9d6b5" stroke="#b48a78" stroke-width="1.5"/>
                    <!-- Barriga (embarazo) -->
                    <ellipse cx="48" cy="78" rx="13" ry="16" fill="#eabfae" stroke="#b48a78" stroke-width="1.2"/>
                    <!-- Piernas animadas (simulan caminar) -->
                    <rect x="30" y="90" width="7" height="25" rx="4" fill="#b48a78">
                        <animate attributeName="y" values="90;98;90" dur="1.2s" repeatCount="indefinite"/>
                    </rect>
                    <rect x="43" y="90" width="7" height="25" rx="4" fill="#b48a78">
                        <animate attributeName="y" values="90;98;90" dur="1.2s" begin="0.6s" repeatCount="indefinite"/>
                    </rect>
                    <!-- Flecha de trabajo (movimiento) -->
                    <g>
                        <line x1="60" y1="40" x2="60" y2="110" stroke="#2196f3" stroke-width="2" stroke-dasharray="4 2"/>
                        <polygon points="56,105 64,105 60,113" fill="#2196f3">
                            <animateTransform attributeName="transform" type="translate" values="0,0;0,8;0,0" dur="1.2s" repeatCount="indefinite"/>
                        </polygon>
                    </g>
                </svg>
            </div>
        </div>
    `;
    

    // Vertical - Presión (SVG animado: ondas de presión sobre la barriga)
    resultados.vertical.presion.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
                P = ${rho} kg/m³ × ${G} m/s² × ${h} m<br>
                <strong style=\"color: var(--secondary-color);\">P = ${P_hidro_vertical.toFixed(2)} Pa ≈ ${P_hidro_vertical_mmHg.toFixed(2)} mmHg</strong>
            </div>
            <div style="margin-left: 16px; min-width: 90px;">
                <svg width="80" height="120" viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg">
                    <!-- Cabello -->
                    <ellipse cx="40" cy="22" rx="13" ry="10" fill="#7c4a1e"/>
                    <ellipse cx="32" cy="28" rx="7" ry="5" fill="#7c4a1e"/>
                    <!-- Cabeza -->
                    <ellipse cx="40" cy="28" rx="10" ry="12" fill="#f9d6b5" stroke="#b48a78" stroke-width="1.5"/>
                    <!-- Cuello -->
                    <rect x="36" y="38" width="8" height="8" rx="4" fill="#f9d6b5"/>
                    <!-- Brazos -->
                    <rect x="18" y="48" width="7" height="28" rx="4" fill="#f9d6b5" stroke="#b48a78" stroke-width="1" transform="rotate(-18 21.5 62)"/>
                    <rect x="55" y="48" width="7" height="28" rx="4" fill="#f9d6b5" stroke="#b48a78" stroke-width="1" transform="rotate(18 58.5 62)"/>
                    <!-- Cuerpo -->
                    <ellipse cx="40" cy="62" rx="16" ry="28" fill="#f9d6b5" stroke="#b48a78" stroke-width="1.5"/>
                    <!-- Barriga (embarazo) -->
                    <ellipse cx="48" cy="78" rx="13" ry="16" fill="#eabfae" stroke="#b48a78" stroke-width="1.2"/>
                    <!-- Ondas de presión -->
                    <ellipse cx="48" cy="78" rx="7" ry="3" fill="none" stroke="#2196f3" stroke-width="2">
                        <animate attributeName="rx" values="7;13;7" dur="1.2s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite"/>
                    </ellipse>
                    <!-- Piernas -->
                    <rect x="30" y="90" width="7" height="25" rx="4" fill="#b48a78"/>
                    <rect x="43" y="90" width="7" height="25" rx="4" fill="#b48a78"/>
                </svg>
            </div>
        </div>
    `;
    resultados.vertical.presionMmHg.innerHTML = '';
    
    // Vertical - Presión Total (SVG animado: ondas y flecha)
    resultados.vertical.presionTotal.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
                P_total = ${P_uterina} mmHg + ${P_hidro_vertical_mmHg.toFixed(2)} mmHg<br>
                <strong style=\"color: var(--secondary-color);\">P_total = ${P_total_vertical.toFixed(2)} mmHg</strong>
            </div>
            <div style="margin-left: 16px; min-width: 90px;">
                <svg width="80" height="120" viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg">
                    <!-- Cabello -->
                    <ellipse cx="40" cy="22" rx="13" ry="10" fill="#7c4a1e"/>
                    <ellipse cx="32" cy="28" rx="7" ry="5" fill="#7c4a1e"/>
                    <!-- Cabeza -->
                    <ellipse cx="40" cy="28" rx="10" ry="12" fill="#f9d6b5" stroke="#b48a78" stroke-width="1.5"/>
                    <!-- Cuello -->
                    <rect x="36" y="38" width="8" height="8" rx="4" fill="#f9d6b5"/>
                    <!-- Brazos -->
                    <rect x="18" y="48" width="7" height="28" rx="4" fill="#f9d6b5" stroke="#b48a78" stroke-width="1" transform="rotate(-18 21.5 62)"/>
                    <rect x="55" y="48" width="7" height="28" rx="4" fill="#f9d6b5" stroke="#b48a78" stroke-width="1" transform="rotate(18 58.5 62)"/>
                    <!-- Cuerpo -->
                    <ellipse cx="40" cy="62" rx="16" ry="28" fill="#f9d6b5" stroke="#b48a78" stroke-width="1.5"/>
                    <!-- Barriga (embarazo) -->
                    <ellipse cx="48" cy="78" rx="13" ry="16" fill="#eabfae" stroke="#b48a78" stroke-width="1.2"/>
                    <!-- Ondas de presión -->
                    <ellipse cx="48" cy="78" rx="7" ry="3" fill="none" stroke="#2196f3" stroke-width="2">
                        <animate attributeName="rx" values="7;13;7" dur="1.2s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite"/>
                    </ellipse>
                    <!-- Flecha de presión total -->
                    <g>
                        <line x1="60" y1="40" x2="60" y2="110" stroke="#4caf50" stroke-width="2" stroke-dasharray="4 2"/>
                        <polygon points="56,105 64,105 60,113" fill="#4caf50">
                            <animateTransform attributeName="transform" type="translate" values="0,0;0,8;0,0" dur="1.2s" repeatCount="indefinite"/>
                        </polygon>
                    </g>
                </svg>
            </div>
        </div>
    `;

    // Supina - Fuerza (SVG animado: icono simple, pierna y flecha vertical)
    resultados.supina.fuerza.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
                F = ${m} kg × ${G} m/s²<br>
                <strong style=\"color: var(--secondary-color);\">F = ${F.toFixed(2)} N</strong>
            </div>
            <div style="margin-left: 16px; min-width: 90px;">
                <svg width="120" height="80" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
                    <!-- Cabello -->
                    <ellipse cx="32" cy="40" rx="13" ry="10" fill="#7c4a1e"/>
                    <ellipse cx="40" cy="48" rx="7" ry="5" fill="#7c4a1e"/>
                    <!-- Cabeza -->
                    <ellipse cx="40" cy="40" rx="12" ry="10" fill="#f9d6b5" stroke="#b48a78" stroke-width="1.5"/>
                    <!-- Cuello -->
                    <rect x="50" y="36" width="8" height="8" rx="4" fill="#f9d6b5" transform="rotate(20 54 40)"/>
                    <!-- Brazos -->
                    <rect x="60" y="28" width="28" height="7" rx="4" fill="#f9d6b5" stroke="#b48a78" stroke-width="1" transform="rotate(8 74 31.5)"/>
                    <rect x="60" y="55" width="28" height="7" rx="4" fill="#f9d6b5" stroke="#b48a78" stroke-width="1" transform="rotate(-8 74 58.5)"/>
                    <!-- Cuerpo -->
                    <ellipse cx="70" cy="40" rx="28" ry="16" fill="#f9d6b5" stroke="#b48a78" stroke-width="1.5"/>
                    <!-- Barriga (embarazo) -->
                    <ellipse cx="88" cy="48" rx="16" ry="13" fill="#eabfae" stroke="#b48a78" stroke-width="1.2"/>
                    <!-- Pierna (natural, solo una) -->
                    <rect x="100" y="60" width="18" height="7" rx="4" fill="#b48a78">
                        <animate attributeName="x" values="100;108;100" dur="1.2s" repeatCount="indefinite"/>
                    </rect>
                    <!-- Flecha de gravedad (vertical) -->
                    <g>
                        <line x1="88" y1="48" x2="88" y2="75" stroke="#4caf50" stroke-width="2" stroke-dasharray="4 2"/>
                        <polygon points="84,70 92,70 88,78" fill="#4caf50">
                            <animateTransform attributeName="transform" type="translate" values="0,0;0,8;0,0" dur="1.2s" repeatCount="indefinite"/>
                        </polygon>
                    </g>
                </svg>
            </div>
        </div>
    `;
    
    // Supina - Trabajo (SVG animado: mujer echada, pierna natural, flecha azul hacia abajo)
    resultados.supina.trabajo.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
                W = ${F.toFixed(2)} N × ${d} m × 0<br>
                <strong style=\"color: var(--secondary-color);\">W = ${W_supina.toFixed(4)} J</strong>
            </div>
            <div style="margin-left: 16px; min-width: 90px;">
                <svg width="120" height="80" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
                    <!-- Cabello -->
                    <ellipse cx="32" cy="40" rx="13" ry="10" fill="#7c4a1e"/>
                    <ellipse cx="40" cy="48" rx="7" ry="5" fill="#7c4a1e"/>
                    <!-- Cabeza -->
                    <ellipse cx="40" cy="40" rx="12" ry="10" fill="#f9d6b5" stroke="#b48a78" stroke-width="1.5"/>
                    <!-- Cuello -->
                    <rect x="50" y="36" width="8" height="8" rx="4" fill="#f9d6b5" transform="rotate(20 54 40)"/>
                    <!-- Brazos -->
                    <rect x="60" y="28" width="28" height="7" rx="4" fill="#f9d6b5" stroke="#b48a78" stroke-width="1" transform="rotate(8 74 31.5)"/>
                    <rect x="60" y="55" width="28" height="7" rx="4" fill="#f9d6b5" stroke="#b48a78" stroke-width="1" transform="rotate(-8 74 58.5)"/>
                    <!-- Cuerpo -->
                    <ellipse cx="70" cy="40" rx="28" ry="16" fill="#f9d6b5" stroke="#b48a78" stroke-width="1.5"/>
                    <!-- Barriga (embarazo) -->
                    <ellipse cx="88" cy="48" rx="16" ry="13" fill="#eabfae" stroke="#b48a78" stroke-width="1.2"/>
                    <!-- Pierna (natural, solo una) -->
                    <rect x="100" y="60" width="18" height="7" rx="4" fill="#b48a78">
                        <animate attributeName="x" values="100;108;100" dur="1.2s" repeatCount="indefinite"/>
                    </rect>
                    <!-- Flecha de trabajo (azul, vertical) -->
                    <g>
                        <line x1="88" y1="48" x2="88" y2="75" stroke="#2196f3" stroke-width="2" stroke-dasharray="4 2"/>
                        <polygon points="84,70 92,70 88,78" fill="#2196f3">
                            <animateTransform attributeName="transform" type="translate" values="0,0;0,8;0,0" dur="1.2s" repeatCount="indefinite"/>
                        </polygon>
                    </g>
                </svg>
            </div>
        </div>
    `;
    

    // Supina - Presión (SVG animado: ondas sobre barriga echada, pierna natural, flecha presión hacia abajo)
    resultados.supina.presion.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
                P = ${rho} kg/m³ × ${G} m/s² × ${h} m (reducida)<br>
                <strong style=\"color: var(--secondary-color);\">P = ${P_hidro_supina.toFixed(2)} Pa ≈ ${P_hidro_supina_mmHg.toFixed(2)} mmHg</strong>
            </div>
            <div style="margin-left: 16px; min-width: 90px;">
                <svg width="120" height="80" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
                    <!-- Cabello -->
                    <ellipse cx="32" cy="40" rx="13" ry="10" fill="#7c4a1e"/>
                    <ellipse cx="40" cy="48" rx="7" ry="5" fill="#7c4a1e"/>
                    <!-- Cabeza -->
                    <ellipse cx="40" cy="40" rx="12" ry="10" fill="#f9d6b5" stroke="#b48a78" stroke-width="1.5"/>
                    <!-- Cuello -->
                    <rect x="50" y="36" width="8" height="8" rx="4" fill="#f9d6b5" transform="rotate(20 54 40)"/>
                    <!-- Brazos -->
                    <rect x="60" y="28" width="28" height="7" rx="4" fill="#f9d6b5" stroke="#b48a78" stroke-width="1" transform="rotate(8 74 31.5)"/>
                    <rect x="60" y="55" width="28" height="7" rx="4" fill="#f9d6b5" stroke="#b48a78" stroke-width="1" transform="rotate(-8 74 58.5)"/>
                    <!-- Cuerpo -->
                    <ellipse cx="70" cy="40" rx="28" ry="16" fill="#f9d6b5" stroke="#b48a78" stroke-width="1.5"/>
                    <!-- Barriga (embarazo) -->
                    <ellipse cx="88" cy="48" rx="16" ry="13" fill="#eabfae" stroke="#b48a78" stroke-width="1.2"/>
                    <!-- Ondas de presión -->
                    <ellipse cx="88" cy="48" rx="7" ry="3" fill="none" stroke="#2196f3" stroke-width="2">
                        <animate attributeName="rx" values="7;16;7" dur="1.2s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite"/>
                    </ellipse>
                    <!-- Pierna (natural, solo una) -->
                    <rect x="100" y="60" width="18" height="7" rx="4" fill="#b48a78">
                        <animate attributeName="x" values="100;108;100" dur="1.2s" repeatCount="indefinite"/>
                    </rect>
                    <!-- Flecha presión (vertical) -->
                    <g>
                        <line x1="88" y1="48" x2="88" y2="75" stroke="#2196f3" stroke-width="2" stroke-dasharray="4 2"/>
                        <polygon points="84,70 92,70 88,78" fill="#2196f3">
                            <animateTransform attributeName="transform" type="translate" values="0,0;0,8;0,0" dur="1.2s" repeatCount="indefinite"/>
                        </polygon>
                    </g>
                </svg>
            </div>
        </div>
    `;
    resultados.supina.presionMmHg.innerHTML = '';
    
    // Supina - Presión Total (SVG animado: ondas y flecha hacia abajo, pierna natural)
    resultados.supina.presionTotal.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
                P_total = ${P_uterina} mmHg + ${P_hidro_supina_mmHg.toFixed(2)} mmHg<br>
                <strong style=\"color: var(--secondary-color);\">P_total = ${P_total_supina.toFixed(2)} mmHg</strong>
            </div>
            <div style="margin-left: 16px; min-width: 90px;">
                <svg width="120" height="80" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
                    <!-- Cabello -->
                    <ellipse cx="32" cy="40" rx="13" ry="10" fill="#7c4a1e"/>
                    <ellipse cx="40" cy="48" rx="7" ry="5" fill="#7c4a1e"/>
                    <!-- Cabeza -->
                    <ellipse cx="40" cy="40" rx="12" ry="10" fill="#f9d6b5" stroke="#b48a78" stroke-width="1.5"/>
                    <!-- Cuello -->
                    <rect x="50" y="36" width="8" height="8" rx="4" fill="#f9d6b5" transform="rotate(20 54 40)"/>
                    <!-- Brazos -->
                    <rect x="60" y="28" width="28" height="7" rx="4" fill="#f9d6b5" stroke="#b48a78" stroke-width="1" transform="rotate(8 74 31.5)"/>
                    <rect x="60" y="55" width="28" height="7" rx="4" fill="#f9d6b5" stroke="#b48a78" stroke-width="1" transform="rotate(-8 74 58.5)"/>
                    <!-- Cuerpo -->
                    <ellipse cx="70" cy="40" rx="28" ry="16" fill="#f9d6b5" stroke="#b48a78" stroke-width="1.5"/>
                    <!-- Barriga (embarazo) -->
                    <ellipse cx="88" cy="48" rx="16" ry="13" fill="#eabfae" stroke="#b48a78" stroke-width="1.2"/>
                    <!-- Ondas de presión -->
                    <ellipse cx="88" cy="48" rx="7" ry="3" fill="none" stroke="#2196f3" stroke-width="2">
                        <animate attributeName="rx" values="7;16;7" dur="1.2s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite"/>
                    </ellipse>
                    <!-- Pierna (natural, solo una) -->
                    <rect x="100" y="60" width="18" height="7" rx="4" fill="#b48a78">
                        <animate attributeName="x" values="100;108;100" dur="1.2s" repeatCount="indefinite"/>
                    </rect>
                    <!-- Flecha presión total (vertical) -->
                    <g>
                        <line x1="88" y1="48" x2="88" y2="75" stroke="#4caf50" stroke-width="2" stroke-dasharray="4 2"/>
                        <polygon points="84,70 92,70 88,78" fill="#4caf50">
                            <animateTransform attributeName="transform" type="translate" values="0,0;0,8;0,0" dur="1.2s" repeatCount="indefinite"/>
                        </polygon>
                    </g>
                </svg>
            </div>
        </div>
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
                    align: 'end',
                    formatter: (value) => value.toFixed(2),
                    font: {
                        weight: 'bold',
                        size: 16
                    },
                    color: '#111',
                    backgroundColor: 'rgba(255,255,255,0.85)',
                    borderRadius: 4,
                    padding: 6,
                    clip: false
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
