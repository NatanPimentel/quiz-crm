const state = {
  answers: {
    step7: []
  },
  currentStep: 0,
  totalSteps: 16,
};

const BACK_STEPS = new Set([2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

function setProgress(stepNumber) {
  const bar = document.getElementById('progressBar');
  if (!bar) return;
  if (stepNumber < 1 || stepNumber > 11) {
    bar.style.width = '0%';
    return;
  }
  const pct = Math.round(((stepNumber - 1) / 10) * 100);
  bar.style.width = pct + '%';
}

function updateBackButton(stepNumber) {
  const btn = document.getElementById('btnBack');
  if (btn) btn.classList.toggle('visible', BACK_STEPS.has(stepNumber));
}

function goToStep(stepNumber) {
  document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
  const next = document.querySelector(`[data-step="${stepNumber}"]`);
  if (!next) return;
  
  next.classList.add('active');
  state.currentStep = stepNumber;
  document.getElementById('stepContent').scrollTop = 0;
  
  setProgress(stepNumber);
  updateBackButton(stepNumber);

  // Show/Hide Header and Progress Bar
  const isWelcome = stepNumber === 0;
  const isAnalisando = stepNumber === 12;
  const isCaptura = stepNumber === 13;
  const isMontando = stepNumber === 14;
  const isResultado = stepNumber === 15;
  const isOferta = stepNumber === 16;
  const hideHeaderProgress = isWelcome || isAnalisando || isMontando || isResultado || isOferta;

  document.getElementById('headerImob').style.display  = hideHeaderProgress ? 'none' : '';
  document.getElementById('progressTrack').style.display = hideHeaderProgress ? 'none' : '';

  // Trigger animations or calculations
  if (stepNumber === 12) startStep12Loading();
  if (stepNumber === 14) startStep14Loading();
  if (stepNumber === 15) buildResult();
}

// Back navigation
document.getElementById('btnBack')?.addEventListener('click', () => {
  if (BACK_STEPS.has(state.currentStep)) goToStep(state.currentStep - 1);
});

// Welcome to step 1
document.getElementById('btnIniciar')?.addEventListener('click', () => {
  goToStep(1);
});

// Single-select buttons
document.querySelectorAll('.option-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const step = btn.closest('.step');
    const stepNumber = parseInt(step.dataset.step);
    const value = btn.dataset.value;

    // Reset custom commission visibility if entering step 4
    if (stepNumber === 4 && value !== 'custom') {
      document.getElementById('customCommissionGroup').style.display = 'none';
    }

    step.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.answers[`step${stepNumber}`] = value;

    if (stepNumber === 4 && value === 'custom') {
      document.getElementById('customCommissionGroup').style.display = 'block';
      document.getElementById('customCommissionInput').focus();
      return;
    }

    setTimeout(() => goToStep(stepNumber + 1), 200);
  });
});

// Custom Commission validation and continue
document.getElementById('btnCustomCommission')?.addEventListener('click', () => {
  const input = document.getElementById('customCommissionInput');
  const value = parseFloat(input.value);
  if (isNaN(value) || value <= 0 || value > 100) {
    document.getElementById('customCommissionError').classList.add('visible');
    input.classList.add('input-error');
    return;
  }
  document.getElementById('customCommissionError').classList.remove('visible');
  input.classList.remove('input-error');
  state.answers.step4Custom = value;
  goToStep(5);
});

// Multi-select chips step 7
document.querySelectorAll('.option-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    chip.classList.toggle('selected');
    const step = chip.closest('.step');
    const selected = [...step.querySelectorAll('.option-chip.selected')].map(c => c.dataset.value);
    state.answers.step7 = selected;
    document.getElementById('btnContinuar7').disabled = selected.length === 0;
  });
});

document.getElementById('btnContinuar7')?.addEventListener('click', () => {
  goToStep(8);
});

// Dual chips Step 11
document.querySelectorAll('.chip-select').forEach(chip => {
  chip.addEventListener('click', () => {
    const group = chip.dataset.group;
    document.querySelectorAll(`.chip-select[data-group="${group}"]`).forEach(sibling => {
      sibling.classList.remove('selected');
    });
    chip.classList.add('selected');

    // Save selection
    state.answers[`step11${group.charAt(0).toUpperCase() + group.slice(1)}`] = chip.dataset.value;

    // Validate if all groups are selected
    const regSel = !!state.answers.step11Regiao;
    const canSel = !!state.answers.step11Canal;
    const autSel = !!state.answers.step11Automacao;
    document.getElementById('btnContinuar11').disabled = !(regSel && canSel && autSel);
  });
});

document.getElementById('btnContinuar11')?.addEventListener('click', () => {
  goToStep(12);
});

// Step 13 lead fields events
const leadNome = document.getElementById('leadNome');
const leadEmail = document.getElementById('leadEmail');
const leadPhone = document.getElementById('leadPhone');

function showFieldError(id, show) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('visible', show);
}

function setInputError(input, hasError) {
  input.classList.toggle('input-error', hasError);
}

leadNome?.addEventListener('input', () => {
  leadNome.value = leadNome.value.replace(/[^a-zA-ZÀ-ÿ\s'\-]/g, '');
  setInputError(leadNome, false);
  showFieldError('erroNome', false);
});

leadEmail?.addEventListener('input', () => {
  leadEmail.value = leadEmail.value.toLowerCase();
  setInputError(leadEmail, false);
  showFieldError('erroEmail', false);
});

leadPhone?.addEventListener('input', () => {
  let digits = leadPhone.value.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length > 11) digits = digits.slice(2);
  digits = digits.slice(0, 11);
  let masked = '';
  if (digits.length > 0) masked = '(' + digits.slice(0, 2);
  if (digits.length >= 3) {
    if (digits.length <= 10) {
      masked += ') ' + digits.slice(2, 6) + (digits.length >= 7 ? '-' + digits.slice(6, 10) : '');
    } else {
      masked += ') ' + digits.slice(2, 7) + '-' + digits.slice(7, 11);
    }
  }
  leadPhone.value = masked;
  setInputError(leadPhone, false);
  showFieldError('erroPhone', false);
});

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

document.getElementById('btnLiberar')?.addEventListener('click', () => {
  const nome = leadNome.value.trim();
  const email = leadEmail.value.trim();
  const phone = leadPhone.value.trim();
  const digits = phone.replace(/\D/g, '');

  const nomeOk = nome.length >= 3;
  const emailOk = isValidEmail(email);
  const phoneOk = digits.length >= 10;

  setInputError(leadNome, !nomeOk);
  setInputError(leadEmail, !emailOk);
  setInputError(leadPhone, !phoneOk);
  showFieldError('erroNome', !nomeOk);
  showFieldError('erroEmail', !emailOk);
  showFieldError('erroPhone', !phoneOk);

  if (!nomeOk || !emailOk || !phoneOk) return;

  state.answers.lead = { nome, email, phone };
  goToStep(14);
});

// Step 15 CTA to 16
document.getElementById('btnAvançarResultado')?.addEventListener('click', () => {
  goToStep(16);
});

// Step 16 features drawer details toggle
const drawer = document.getElementById('drawerRecursos');
document.getElementById('btnCtaSecundario')?.addEventListener('click', () => {
  if (drawer) drawer.style.display = 'flex';
});

document.getElementById('btnCloseDrawer')?.addEventListener('click', () => {
  if (drawer) drawer.style.display = 'none';
});

document.getElementById('btnDrawerCta')?.addEventListener('click', () => {
  if (drawer) drawer.style.display = 'none';
  window.open('https://pay.imobiturbo.os/checkout-promocional', '_blank');
});

// Close drawer on overlay click
drawer?.addEventListener('click', (e) => {
  if (e.target === drawer) drawer.style.display = 'none';
});

// Helper for BRL Currency formatting
function formatBRL(n) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Web base SVG drawing for loaders
function buildWebBase(container) {
  const N = 8, RINGS = 5, maxR = 82, cx = 90, cy = 90;
  const start = -Math.PI / 2;
  const aStep = (2 * Math.PI) / N;

  const pt = (r, i) => {
    const a = start + i * aStep;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  let inner = '';

  // Outer polygon
  const bgPts = Array.from({ length: N }, (_, i) => {
    const p = pt(maxR, i); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ');
  inner += `<polygon points="${bgPts}" fill="rgba(255,255,255,0.01)" stroke="#2A2A2A" stroke-width="1"/>`;

  // Inner rings
  for (let r = 1; r < RINGS; r++) {
    const pts = Array.from({ length: N }, (_, i) => {
      const p = pt(maxR * r / RINGS, i); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(' ');
    inner += `<polygon points="${pts}" fill="none" stroke="#1F1F1F" stroke-width="0.6"/>`;
  }

  // Axis lines
  for (let i = 0; i < N; i++) {
    const p = pt(maxR, i);
    inner += `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="#1F1F1F" stroke-width="0.7"/>`;
  }

  // Center dot
  inner += `<circle cx="${cx}" cy="${cy}" r="3" fill="var(--accent)"/>`;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 180 180');
  svg.setAttribute('width', '180');
  svg.setAttribute('height', '180');
  svg.style.cssText = 'display:block;position:absolute;top:0;left:0;overflow:visible;pointer-events:none';
  svg.innerHTML = inner;

  container.innerHTML = '';
  container.appendChild(svg);

  return { pt, N, RINGS, maxR };
}

// Step 12 Loader
function startStep12Loading() {
  const container = document.getElementById('radarContainer');
  const fill = document.getElementById('s0BgFill');
  if (!container || !fill) return;

  const { pt, N, RINGS, maxR } = buildWebBase(container);

  const trail = document.createElement('div');
  trail.style.cssText = 'position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 90deg,transparent 0deg,transparent 240deg,rgba(191,215,48,0.02) 310deg,rgba(191,215,48,0.1) 360deg);animation:sweepRotate 2.5s linear infinite;transform-origin:center;pointer-events:none';
  container.appendChild(trail);

  const arm = document.createElement('div');
  arm.style.cssText = 'position:absolute;top:calc(50% - 0.75px);left:50%;width:85px;height:1.5px;transform-origin:left center;background:linear-gradient(to right,var(--accent),transparent);animation:sweepRotate 2.5s linear infinite;pointer-events:none';
  container.appendChild(arm);

  const intersections = [];
  for (let r = 1; r <= RINGS; r++) {
    for (let i = 0; i < N; i++) {
      intersections.push(pt(maxR * r / RINGS, i));
    }
  }

  fill.classList.remove('running');
  void fill.offsetWidth;
  fill.classList.add('running');

  const blipInterval = setInterval(() => {
    if (state.currentStep !== 12) { clearInterval(blipInterval); return; }
    const { x, y } = intersections[Math.floor(Math.random() * intersections.length)];
    const size = 3 + Math.floor(Math.random() * 3);
    const blip = document.createElement('div');
    blip.className = 's-web-blip';
    blip.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px`;
    container.appendChild(blip);
    setTimeout(() => blip.remove(), 1800);
  }, 350);

  setTimeout(() => {
    if (state.currentStep === 12) {
      clearInterval(blipInterval);
      fill.classList.remove('running');
      fill.style.height = '0';
      goToStep(13);
    }
  }, 4500);
}

// Step 14 Loader
function startStep14Loading() {
  const container = document.getElementById('s14Container');
  const fill = document.getElementById('s0BgFill');
  if (!container || !fill) return;

  const { pt, maxR } = buildWebBase(container);

  const PLACEMENTS = [
    [1.00, 0, 5], [0.80, 1, 4], [1.00, 2, 6],
    [0.60, 3, 4], [1.00, 4, 5], [0.80, 5, 7],
    [1.00, 6, 4], [0.60, 7, 5], [0.80, 2, 4],
    [0.60, 5, 4],
  ];

  PLACEMENTS.forEach(([frac, axis, size], i) => {
    const p = pt(maxR * frac, axis);
    setTimeout(() => {
      if (state.currentStep !== 14) return;

      const dot = document.createElement('div');
      dot.className = 's-web-dot';
      dot.style.cssText = `left:${p.x}px;top:${p.y}px;width:${size}px;height:${size}px;background:var(--accent);animation:radarDotPop 0.5s ease-out forwards`;
      container.appendChild(dot);
    }, i * 300);
  });

  fill.classList.remove('running');
  void fill.offsetWidth;
  fill.classList.add('running');

  setTimeout(() => {
    if (state.currentStep === 14) {
      fill.classList.remove('running');
      fill.style.height = '0';
      goToStep(15);
    }
  }, 4500);
}

// Calculations and results drawing
function buildResult() {
  const ticketAnswers = {
    'ate-200k': 150000,
    '200k-500k': 350000,
    '500k-1m': 750000,
    '1m-3m': 2000000,
    'mais-3m': 4000000
  };
  const ticketMedio = ticketAnswers[state.answers.step3] || 350000;
  
  let percentualComissao = 0.05;
  if (state.answers.step4 === 'custom') {
    percentualComissao = parseFloat(state.answers.step4Custom) / 100 || 0.05;
  } else {
    const comissionAnswers = {
      '1.5': 0.015,
      '3': 0.03,
      '5': 0.05,
      '6': 0.06
    };
    percentualComissao = comissionAnswers[state.answers.step4] || 0.05;
  }

  const leadsAnswers = {
    'ate-10': 5,
    '11-30': 20,
    '31-100': 65,
    '101-300': 200,
    'mais-300': 450
  };
  const leadsMensais = leadsAnswers[state.answers.step5] || 20;

  const vendasAnswers = {
    '0-1': 0.5,
    '1': 1.0,
    '2-3': 2.5,
    '4-5': 4.5,
    'mais-5': 7.0
  };
  const vendasMensais = vendasAnswers[state.answers.step6] || 1.0;

  // 1. Current conversion
  const conversaoAtual = Math.min(0.3, vendasMensais / leadsMensais);

  // 2. Score Maturity
  const orgScores = { 'crm': 25, 'planilha': 15, 'caderno': 5, 'cabeca': 0 };
  const respScores = { 'imediato': 25, 'rapido': 15, 'moderado': 5, 'demorado': 0 };
  const followScores = { '5-mais': 25, '2-4': 15, '1': 5, 'nenhum': 0 };

  const organizacaoScore = orgScores[state.answers.step8] ?? 15;
  const velocidadeScore = respScores[state.answers.step9] ?? 15;
  const followUpScore = followScores[state.answers.step10] ?? 15;
  const automacaoScore = state.answers.step11Automacao === 'sim' ? 25 : 0;

  const scoreMaturidade = organizacaoScore + velocidadeScore + followUpScore + automacaoScore;

  // 3. Taxa de Vazamento
  let taxaVazamentoBase = 0.28;
  if (scoreMaturidade <= 35) taxaVazamentoBase = 0.40;
  else if (scoreMaturidade <= 65) taxaVazamentoBase = 0.28;
  else if (scoreMaturidade <= 84) taxaVazamentoBase = 0.16;
  else taxaVazamentoBase = 0.08;

  let modifiers = 0;
  if (state.answers.step8 !== 'crm') modifiers += 0.08;
  if (state.answers.step9 === 'moderado' || state.answers.step9 === 'demorado') modifiers += 0.06;
  if (state.answers.step10 === '1' || state.answers.step10 === 'nenhum') modifiers += 0.06;
  if (state.answers.step11Automacao === 'nao') modifiers += 0.04;

  const taxaVazamento = Math.min(0.55, taxaVazamentoBase + modifiers);

  // 4. Results calculations
  const leadsEmRisco = Math.round(leadsMensais * taxaVazamento);
  const taxaConversaoRecuperavel = Math.max(0.003, Math.min(0.025, conversaoAtual * 0.25));
  const vendasRecuperaveisMes = leadsEmRisco * taxaConversaoRecuperavel;

  const comissaoPorVenda = ticketMedio * percentualComissao;
  const perdaMensal = vendasRecuperaveisMes * comissaoPorVenda;
  const perdaAnual = perdaMensal * 12;

  // Render text data
  document.getElementById('scoreVal').textContent = scoreMaturidade;
  document.getElementById('resComissaoVal').textContent = formatBRL(comissaoPorVenda);
  document.getElementById('resLeadsVal').textContent = leadsEmRisco;
  document.getElementById('resVendasVal').textContent = vendasRecuperaveisMes.toFixed(2);
  document.getElementById('resPerdaMesVal').textContent = formatBRL(perdaMensal);

  // Counters anims
  const annualLossEl = document.getElementById('resultPerdaAnual');
  const offerLossEl = document.getElementById('offerLossVal');

  annualLossEl.textContent = formatBRL(0);
  if (offerLossEl) offerLossEl.textContent = formatBRL(perdaAnual);

  setTimeout(() => {
    const startTime = performance.now();
    const duration = 1500;
    function tick(now) {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const currentVal = perdaAnual * ease;
      annualLossEl.textContent = formatBRL(currentVal);
      if (t < 1) requestAnimationFrame(tick);
      else {
        annualLossEl.textContent = formatBRL(perdaAnual);
      }
    }
    requestAnimationFrame(tick);
  }, 200);

  // Slider marker anim
  const markerEl = document.getElementById('maturityMarker');
  markerEl.style.left = '0%';
  setTimeout(() => {
    markerEl.style.left = scoreMaturidade + '%';
  }, 500);

  // 5. Radar pillars mapping [3 to 10]
  const sourcesCount = (state.answers.step7 || []).length;
  let captacaoPillar = 3 + (sourcesCount / 7) * 5 + (leadsMensais >= 200 ? 2 : 0);
  captacaoPillar = Math.max(3, Math.min(10, captacaoPillar));

  const respMapping = { 'imediato': 9.5, 'rapido': 7.5, 'moderado': 5.0, 'demorado': 3.0 };
  const velocidadePillar = respMapping[state.answers.step9] || 6.0;

  const orgMapping = { 'crm': 9.5, 'planilha': 6.5, 'caderno': 4.5, 'cabeca': 3.0 };
  const organizacaoPillar = orgMapping[state.answers.step8] || 6.0;

  let qualificacaoPillar = 3.0;
  if (state.answers.step8 === 'crm') qualificacaoPillar += 3.5;
  else if (state.answers.step8 === 'planilha') qualificacaoPillar += 2.0;
  if (state.answers.step9 === 'imediato' || state.answers.step9 === 'rapido') qualificacaoPillar += 3.5;
  else if (state.answers.step9 === 'moderado') qualificacaoPillar += 1.5;
  qualificacaoPillar = Math.max(3, Math.min(10, qualificacaoPillar));

  const followMapping = { '5-mais': 9.5, '2-4': 7.0, '1': 4.5, 'nenhum': 3.0 };
  const followUpPillar = followMapping[state.answers.step10] || 6.0;

  let reativacaoPillar = 3.0;
  if (state.answers.step11Automacao === 'sim') reativacaoPillar += 4.0;
  if (state.answers.step8 === 'crm') reativacaoPillar += 3.0;
  reativacaoPillar = Math.max(3, Math.min(10, reativacaoPillar));

  const automacaoPillar = state.answers.step11Automacao === 'sim' ? 9.5 : 3.0;
  const anunciosPillar = (state.answers.step7 || []).includes('ads') ? 9.0 : 3.5;

  const radarValues = [
    captacaoPillar,
    velocidadePillar,
    organizacaoPillar,
    qualificacaoPillar,
    followUpPillar,
    reativacaoPillar,
    automacaoPillar,
    anunciosPillar
  ];

  document.getElementById('radarChart').innerHTML = buildRadarSVG(radarValues);

  // Observations texts
  const RADAR_PILL_LABELS = [
    'Captação', 'Velocidade de Resposta', 'Organização dos Leads', 'Qualificação',
    'Follow-up', 'Reativação de Base', 'Automação', 'Gestão de Anúncios'
  ];

  const RADAR_OBS_TEXTS = [
    {
      ruim: 'Sua captação de leads está muito concentrada ou com baixo volume, o que limita seu potencial de fechamento.',
      medio: 'Você atrai leads de fontes variadas, mas a captação ainda pode ser expandida para outros canais.',
      bom: 'Sua captação é robusta, trazendo fluxo constante de novos contatos para trabalhar.'
    },
    {
      ruim: 'O retorno demorado faz com que o lead perca o interesse rapidamente ou fale com outro corretor primeiro.',
      medio: 'Seu tempo de resposta é aceitável, mas atender em menos de 5 minutos aumentaria suas chances em até 390%.',
      bom: 'Excelente velocidade! Atendimento imediato garante que o lead seja qualificado enquanto está quente.'
    },
    {
      ruim: 'Sem CRM, as informações se perdem no histórico do WhatsApp ou caderno, gerando esquecimento de propostas.',
      medio: 'Planilhas ajudam, mas dificultam a visão geral das etapas de negociação e o histórico de cada cliente.',
      bom: 'Parabéns. O uso de CRM mantém o histórico centralizado e as etapas do funil claras.'
    },
    {
      ruim: 'Você gasta tempo atendendo curiosos e leads sem perfil por falta de um roteiro claro de triagem.',
      medio: 'Há uma filtragem básica de renda e perfil, mas o processo de triagem inicial pode ser mais rigoroso.',
      bom: 'Triagem eficiente. Você foca seus esforços nos clientes com real potencial de compra imediata.'
    },
    {
      ruim: 'Desistir do lead após uma ou duas tentativas sem resposta faz você perder a maioria das oportunidades do mercado.',
      medio: 'Você faz tentativas de contato, mas sem um fluxo estruturado de toques de follow-up em dias diferentes.',
      bom: 'Ótimo follow-up! Persistência estruturada em múltiplos canais garante taxas superiores de agendamento.'
    },
    {
      ruim: 'Base de antigos contatos esquecida. Leads frios que poderiam comprar no futuro são totalmente ignorados.',
      medio: 'Você tenta reativar contatos pontualmente, mas sem um processo automático de nutrição.',
      bom: 'Aproveitamento excelente da base. Contatos antigos são nutridos e reativados com novas oportunidades.'
    },
    {
      ruim: 'Processos 100% manuais limitam sua escala. Você gasta tempo com tarefas repetitivas que poderiam ser automatizadas.',
      medio: 'Alguns envios são semi-automáticos, mas falta integração entre suas ferramentas de captura e mensagens.',
      bom: 'Automação ativa. Mensagens de boas-vindas e lembretes automáticos poupam horas do seu dia.'
    },
    {
      ruim: 'Não investir em anúncios próprios deixa sua captação dependente apenas de indicações ou portais terceiros.',
      medio: 'Você investe em anúncios, mas faltam criativos otimizados ou landing pages específicas para seu público.',
      bom: 'Campanhas rodando com boa segmentação local e criativos focados no seu mercado-alvo.'
    }
  ];

  const obsContainer = document.getElementById('radarObs');
  obsContainer.innerHTML = radarValues.map((v, i) => {
    const norm = Math.max(0, Math.min(1, (v - 3) / 7));
    const [r, g, b] = radarColorRGB(norm);
    const color = `rgb(${r},${g},${b})`;
    const bgColor = `rgba(${r},${g},${b},0.02)`;
    const borderColor = `rgba(${r},${g},${b},0.12)`;
    const obs = RADAR_OBS_TEXTS[i];
    const tier = v >= 8 ? 'bom' : v >= 5 ? 'medio' : 'ruim';
    const badge = `${Math.round(v)}/10`;
    const delay = (0.2 + i * 0.08).toFixed(2);
    
    return `<div class="radar-obs-item" style="background:${bgColor};border-color:${borderColor};animation: fadeIn 0.4s ease ${delay}s both">
      <div class="radar-obs-header">
        <span class="radar-obs-dot" style="background:${color}"></span>
        <span class="radar-obs-topic">${RADAR_PILL_LABELS[i]}</span>
        <span class="radar-obs-badge" style="color:${color};border-color:${color}">${badge}</span>
      </div>
      <p class="radar-obs-text">${obs[tier]}</p>
    </div>`;
  }).join('');
}

// Draw dynamic Radar SVG (Fitted for Imobiturbo Design System)
function buildRadarSVG(values) {
  const n = 8;
  const W = 360, H = 320, cx = 180, cy = 160;
  const RINGS = 5, maxR = 90, labelR = 120;
  const start = -Math.PI / 2, aStep = (2 * Math.PI) / n;

  function pt(r, i) {
    const a = start + i * aStep;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  const dp = values.map((v, i) => {
    const norm = Math.max(0, Math.min(1, (v - 3) / 7));
    const p = pt(maxR * (v / 10), i);
    return { x: p.x, y: p.y, rgb: radarColorRGB(norm) };
  });

  let gradDefs = '';
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const [r1,g1,b1] = dp[i].rgb, [r2,g2,b2] = dp[j].rgb;
    const rm = Math.round((r1+r2)/2), gm = Math.round((g1+g2)/2), bm = Math.round((b1+b2)/2);
    const mx = ((dp[i].x + dp[j].x) / 2).toFixed(1);
    const my = ((dp[i].y + dp[j].y) / 2).toFixed(1);
    gradDefs += `
      <linearGradient id="seg${i}" gradientUnits="userSpaceOnUse" x1="${dp[i].x.toFixed(1)}" y1="${dp[i].y.toFixed(1)}" x2="${dp[j].x.toFixed(1)}" y2="${dp[j].y.toFixed(1)}">
        <stop offset="0%" stop-color="rgb(${r1},${g1},${b1})"/>
        <stop offset="100%" stop-color="rgb(${r2},${g2},${b2})"/>
      </linearGradient>
      <linearGradient id="tri${i}" gradientUnits="userSpaceOnUse" x1="${cx}" y1="${cy}" x2="${mx}" y2="${my}">
        <stop offset="0%" stop-color="rgb(${rm},${gm},${bm})" stop-opacity="0.02"/>
        <stop offset="100%" stop-color="rgb(${rm},${gm},${bm})" stop-opacity="0.20"/>
      </linearGradient>`;
  }

  let out = `<defs>${gradDefs}</defs>`;

  // Background octagon
  const bgPts = Array.from({length: n}, (_, i) => { const p = pt(maxR, i); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(' ');
  out += `<polygon points="${bgPts}" fill="rgba(255,255,255,0.01)" stroke="#2A2A2A" stroke-width="1"/>`;

  // Rings
  for (let r = 1; r < RINGS; r++) {
    const f = r / RINGS;
    const pts = Array.from({length: n}, (_, i) => { const p = pt(maxR * f, i); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(' ');
    out += `<polygon points="${pts}" fill="none" stroke="#1F1F1F" stroke-width="0.6"/>`;
  }

  // Axis lines
  for (let i = 0; i < n; i++) {
    const p = pt(maxR, i);
    out += `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="#1F1F1F" stroke-width="1"/>`;
  }

  // Triangles fill
  out += `<g style="animation:radarFillIn 0.6s ease-out forwards">`;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    out += `<polygon points="${cx},${cy} ${dp[i].x.toFixed(1)},${dp[i].y.toFixed(1)} ${dp[j].x.toFixed(1)},${dp[j].y.toFixed(1)}" fill="url(#tri${i})"/>`;
  }
  out += `</g>`;

  // Stroke lines
  out += `<g style="animation:radarFillIn 0.5s ease-out 0.1s both">`;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    out += `<line x1="${dp[i].x.toFixed(1)}" y1="${dp[i].y.toFixed(1)}" x2="${dp[j].x.toFixed(1)}" y2="${dp[j].y.toFixed(1)}" stroke="url(#seg${i})" stroke-width="2.2" stroke-linecap="round"/>`;
  }
  out += `</g>`;

  // Dots
  values.forEach((_v, i) => {
    const delay = (0.3 + i * 0.05).toFixed(2);
    out += `<circle cx="${dp[i].x.toFixed(1)}" cy="${dp[i].y.toFixed(1)}" r="4.5" fill="rgb(${dp[i].rgb.join(',')})" stroke="#0A0A0A" stroke-width="1.5" style="animation:radarDotPop 0.3s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both;transform-origin:${dp[i].x.toFixed(1)}px ${dp[i].y.toFixed(1)}px"/>`;
  });

  // Pill Labels
  const RADAR_LABELS = [
    'Captação', 'Velocidade', 'Organização', 'Qualificação',
    'Follow-up', 'Reativação', 'Automação', 'Anúncios'
  ];

  RADAR_LABELS.forEach((label, i) => {
    const p = pt(labelR, i);
    let align = 'middle';
    let dy = '0.35em';
    if (p.x < cx - 10) align = 'end';
    else if (p.x > cx + 10) align = 'start';
    
    if (p.y < cy - maxR + 5) dy = '-0.3em';
    else if (p.y > cy + maxR - 5) dy = '0.9em';

    out += `<text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" text-anchor="${align}" dy="${dy}" font-size="9.5" font-weight="600" fill="#B8B8B8" font-family="Stem,sans-serif">${label}</text>`;
  });

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">${out}</svg>`;
}

// Color calculations matching Imobiturbo Lime Punch (#BFD730 is [191, 215, 48])
function radarColorRGB(norm) {
  const stops = [
    [0,    [255, 90,  78]],   // red danger
    [0.35, [255, 176, 32]],   // orange warning
    [0.65, [238, 238, 50]],   // light yellow
    [1.0,  [191, 215, 48]],   // Lime Punch var(--it-lime)
  ];
  let from = stops[0], to = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (norm >= stops[i][0] && norm <= stops[i + 1][0]) { from = stops[i]; to = stops[i + 1]; break; }
  }
  const t = from[0] === to[0] ? 0 : (norm - from[0]) / (to[0] - from[0]);
  return [
    Math.round(from[1][0] + (to[1][0] - from[1][0]) * t),
    Math.round(from[1][1] + (to[1][1] - from[1][1]) * t),
    Math.round(from[1][2] + (to[1][2] - from[1][2]) * t),
  ];
}
