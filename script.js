// NAVEGAÇÃO SPA
const navDashboard = document.getElementById('nav-dashboard');
const navCadastros = document.getElementById('nav-cadastros');
const viewDashboard = document.getElementById('view-dashboard');
const viewCadastros = document.getElementById('view-cadastros');

function switchTab(activeNav, inactiveNav, activeView, inactiveView) {
    activeNav.classList.add('active'); inactiveNav.classList.remove('active');
    activeView.classList.add('active'); inactiveView.classList.remove('active');
}

navDashboard.addEventListener('click', () => switchTab(navDashboard, navCadastros, viewDashboard, viewCadastros));
navCadastros.addEventListener('click', () => switchTab(navCadastros, navDashboard, viewCadastros, viewDashboard));

// SISTEMA DE TOAST (Notificações Profissionais)
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    
    // Animação de entrada
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// BANCO DE DADOS DINÂMICO
// Iniciando apenas com a Tag de requisito do projeto
let tagsDB = [
    { equipamento: "FROTA-01", tag: "001A2B3C", empresa: "Empresa Local", tipo: "Caminhão Baú", status: "ATIVO" }
];
let logsAcesso = []; // Começa vazio
let dadosGrafico = [0, 0, 0, 0, 0, 0, 0, 0]; // Gráfico zerado

// ELEMENTOS DOM
const dashCadastros = document.getElementById('dash-cadastros');
const dashAcessos = document.getElementById('dash-acessos');
const tabelaTags = document.getElementById('tabela-tags');
const feedLeituras = document.getElementById('feed-leituras');
const emptyLogs = document.getElementById('empty-logs');

// INICIALIZAÇÃO
function inicializarSistema() {
    const hoje = new Date();
    document.getElementById('data-atual').innerText = hoje.toLocaleDateString('pt-BR');
    atualizarPainelEstatisticas();
    atualizarTabelaCadastros();
}

function atualizarPainelEstatisticas() {
    dashCadastros.innerText = tagsDB.length;
    dashAcessos.innerText = logsAcesso.length;
}

function atualizarTabelaCadastros() {
    tabelaTags.innerHTML = '';
    tagsDB.forEach(item => {
        tabelaTags.innerHTML += `
            <tr>
                <td><strong>${item.equipamento}</strong></td>
                <td><span class="tag-badge">${item.tag}</span></td>
                <td>${item.empresa}</td>
                <td>${item.tipo}</td>
                <td><span class="status-badge">${item.status}</span></td>
            </tr>
        `;
    });
}

// LÓGICA DO MODAL DE CADASTRO
const modalCadastro = document.getElementById('modal-cadastro');
const formTag = document.getElementById('form-tag');

function fecharModal() {
    modalCadastro.classList.remove('active');
    formTag.reset();
}

document.getElementById('btn-abrir-modal').addEventListener('click', () => modalCadastro.classList.add('active'));
document.getElementById('btn-fechar-modal').addEventListener('click', fecharModal);
document.getElementById('btn-cancelar-modal').addEventListener('click', fecharModal);

formTag.addEventListener('submit', (e) => {
    e.preventDefault();
    const novoCadastro = {
        equipamento: document.getElementById('cad-equipamento').value.toUpperCase(),
        tag: document.getElementById('cad-tag').value.toUpperCase(),
        empresa: document.getElementById('cad-empresa').value,
        tipo: document.getElementById('cad-tipo').value,
        status: "ATIVO"
    };
    
    tagsDB.unshift(novoCadastro); 
    atualizarTabelaCadastros();
    atualizarPainelEstatisticas();
    fecharModal();
    
    // Substitui o alert nativo pelo Toast profissional
    showToast(`Tag ${novoCadastro.tag} vinculada com sucesso.`);
});

// CONFIGURAÇÃO DO GRÁFICO
const ctx = document.getElementById('fluxoChart').getContext('2d');
const fluxoChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['-7min', '-6min', '-5min', '-4min', '-3min', '-2min', '-1min', 'AGORA'],
        datasets: [{
            data: dadosGrafico, 
            borderColor: '#10b981', 
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2, fill: true, tension: 0.3, pointRadius: 3
        }]
    },
    options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { 
            y: { beginAtZero: true, suggestedMax: 5, grid: { color: '#f3f4f6' } }, 
            x: { grid: { display: false } } 
        }
    }
});

// SIMULAÇÃO DO HARDWARE (Leitura RFID)
const btnAcionar = document.getElementById('btn-acionar-leitura');

btnAcionar.addEventListener('click', () => {
    if(tagsDB.length === 0) return; // Segurança caso delete todos

    // Muda botão para estado "Processando"
    const txtOriginal = btnAcionar.innerText;
    btnAcionar.innerText = "Lendo Buffer...";
    btnAcionar.style.opacity = "0.7";
    btnAcionar.disabled = true;

    setTimeout(() => { 
        // Lógica de Leitura
        const veiculoLido = tagsDB[Math.floor(Math.random() * tagsDB.length)];
        const agora = new Date();
        const horaFormato = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}:${agora.getSeconds().toString().padStart(2, '0')}`;

        logsAcesso.unshift(veiculoLido);
        atualizarPainelEstatisticas();

        // Remove estado vazio se existir
        if(emptyLogs) emptyLogs.style.display = 'none';

        // Cria elemento de log técnico
        const novoRegistroHTML = `
            <div class="record-item">
                <div class="record-main">
                    <h4>${veiculoLido.equipamento} - ${veiculoLido.empresa}</h4>
                    <p>EPC: ${veiculoLido.tag} | Tipo: ${veiculoLido.tipo}</p>
                </div>
                <div class="record-time">${horaFormato}</div>
            </div>
        `;
        feedLeituras.insertAdjacentHTML('afterbegin', novoRegistroHTML);

        // Atualiza Gráfico deslocando o array
        dadosGrafico.shift(); // Remove o mais antigo
        dadosGrafico.push(Math.floor(Math.random() * 3) + 1); // Adiciona novo pico
        fluxoChart.update();

        // Restaura botão
        btnAcionar.innerText = txtOriginal; 
        btnAcionar.style.opacity = "1";
        btnAcionar.disabled = false;
        
    }, 400); // 400ms simula o delay da controladora física
});

// Inicializa a interface
window.onload = inicializarSistema;