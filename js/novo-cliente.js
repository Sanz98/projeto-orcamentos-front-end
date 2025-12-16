// Arquivo: js/novo-cliente.js

// 1. Verificação de Segurança (Token)
const token = localStorage.getItem('token');
if (!token) {
    alert('Você precisa estar logado para acessar esta página.');
    window.location.href = 'index.html';
}

// 2. Manipulação do Formulário
document.getElementById('formCliente').addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede a página de recarregar

    // Captura os dados dos inputs
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;

    try {
        const res = await fetch(`${API_URL}/clientes`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            // Envia os dados no formato que o Back-end espera
            body: JSON.stringify({ 
                nomeCliente: nome, 
                telefoneCliente: telefone 
            })
        });

        if (res.ok) {
            alert('Cliente salvo com sucesso!');
            window.location.href = 'dashboard.html';
        } else {
            const erro = await res.json();
            alert('Erro: ' + (erro.erro || 'Falha ao salvar'));
        }

    } catch (err) { 
        console.error(err); 
        alert('Erro de conexão com o servidor. Verifique se o Back-end está rodando.'); 
    }
});