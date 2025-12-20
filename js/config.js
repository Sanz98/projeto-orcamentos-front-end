// --- CONFIGURAÇÃO INTELIGENTE DE AMBIENTE ---
// Pega o endereço atual do navegador (pode ser 'localhost' ou '127.0.0.1')
const hostname = window.location.hostname; 

// Verifica se está rodando localmente
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

// URL BASE DA API
// Se for local: usa http:// + o mesmo IP/Nome do navegador + :8081
// Se for produção: usa a URL do render
const API_BASE_URL = isLocalhost 
    ? `http://${hostname}:8081` 
    : 'https://api-focco-interiores.onrender.com'; // <-- Mudar no dia do Deploy


// Função auxiliar para requisições autenticadas (inclui cookies)
async function fetchAuth(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include' // CRÍTICO: Envia o cookie HttpOnly
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    // Mescla headers se existirem
    if (options.headers) {
        finalOptions.headers = { ...defaultOptions.headers, ...options.headers };
    }

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, finalOptions);
        
        if (response.status === 401 || response.status === 403) {
            // Se der erro de auth, redireciona para login (exceto se já estiver lá)
            if (!window.location.href.includes('index.html')) {
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = 'index.html';
            }
        }
        return response;
    } catch (error) {
        console.error('Erro de conexão:', error);
        alert('Erro ao conectar com o servidor.');
    }
}

// Checa se está logado (basicamente vê se tem info no localStorage para UI)
function checkLogin() {
    const usuario = localStorage.getItem('usuario');
    if (!usuario && !window.location.href.includes('index.html')) {
        window.location.href = 'index.html';
    }
    // Atualiza nome na UI se existir elemento
    if (usuario) {
        const userObj = JSON.parse(usuario);
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.textContent = `Olá, ${userObj.nome}`;
        
        // Esconde menu Equipe se não for gerente
        const menuEquipe = document.getElementById('menu-equipe');
        if (menuEquipe && userObj.perfil !== 'gerente') {
            menuEquipe.style.display = 'none';
        }
    }
}