// Aguarda o HTML carregar completamente antes de rodar o script
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. VERIFICAÇÃO DE SEGURANÇA E PERFIL ---
    const token = localStorage.getItem('token');
    
    // Tratamento de string: remove espaços em branco e converte para minúsculo
    const perfilRaw = localStorage.getItem('perfil');
    const perfil = perfilRaw ? perfilRaw.trim().toLowerCase() : null;

    if (!token) {
        alert('Você precisa estar logado para acessar o painel.');
        window.location.href = 'index.html';
        return; // Para a execução aqui
    }

    // --- 2. LÓGICA DO BOTÃO DE GERENTE ---
    if (perfil === 'gerente') {
        const btnEquipe = document.getElementById('btnEquipe');
        
        if (btnEquipe) {
            console.log('Sucesso: Botão de equipe encontrado. Tornando visível.');
            // Remove o display: none e coloca block ou inline-block
            btnEquipe.style.display = 'block'; 
        } else {
            console.error('Erro: O Javascript não achou o botão com id="btnEquipe".');
        }
    } else {
        console.log('Usuário não é gerente. Botão permanece oculto.');
    }

    // --- 3. INICIA O CARREGAMENTO DOS DADOS ---
    carregarOrcamentos();
});

// --- FUNÇÕES AUXILIARES (Ficam fora do evento DOMContentLoaded) ---

async function carregarOrcamentos() {
    const token = localStorage.getItem('token'); // Pega o token novamente para garantir scope
    
    try {
        const resposta = await fetch(`${API_URL}/orcamentos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (resposta.status === 401 || resposta.status === 403) {
            alert('Sessão expirada. Faça login novamente.');
            logout();
            return;
        }

        const orcamentos = await resposta.json();
        renderizarCards(orcamentos);

    } catch (error) {
        console.error('Erro de conexão:', error);
        const container = document.getElementById('containerOrcamentos');
        if(container) {
            container.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar orçamentos. Verifique se o Back-end está rodando.</p>';
        }
    }
}

function renderizarCards(orcamentos) {
    const container = document.getElementById('containerOrcamentos');
    if (!container) return;
    
    container.innerHTML = ''; 

    if (orcamentos.length === 0) {
        container.innerHTML = '<p style="text-align: center; width: 100%;">Nenhum orçamento encontrado.</p>';
        return;
    }

    orcamentos.forEach(orc => {
        const dataFormatada = new Date(orc.dataCriacao).toLocaleDateString('pt-BR');
        
        const valorFormatado = parseFloat(orc.valorTotal).toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        });

        const statusClass = orc.status ? orc.status.replace(' ', '.') : 'Em.Analise';

        const card = document.createElement('div');
        card.className = `card-orcamento status-${statusClass}`;
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${orc.nomeCliente || 'Cliente Desconhecido'}</h3>
                <span class="status-badge status-${statusClass}" style="margin-top: 5px; display: inline-block;">
                    ${orc.status}
                </span>
            </div>
            
            <div style="margin-top: 15px;">
                <div class="card-price">${valorFormatado}</div>
                <p class="card-data">📅 Data: ${dataFormatada}</p>
                <p class="card-data">📦 Itens: ${orc.itens ? orc.itens.length : 0}</p>
                
                <button onclick="window.location.href='detalhes.html?id=${orc.idOrcamento}'" class="btn-outline" style="width: 100%; margin-top: 15px;">
                    Ver Detalhes →
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('perfil');
    window.location.href = 'index.html';
}