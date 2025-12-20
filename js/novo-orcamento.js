checkLogin();

// 1. Carregar Clientes no Select
async function carregarClientes() {
    const response = await fetchAuth('/clientes');
    const select = document.getElementById('selectCliente');
    select.innerHTML = '<option value="">Selecione um cliente...</option>';
    
    if(response.ok) {
        const clientes = await response.json();
        clientes.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.idCliente;
            opt.textContent = c.nomeCliente;
            select.appendChild(opt);
        });
    }
}

// 2. Manipulação dinâmica de itens
function adicionarLinhaItem() {
    const template = document.getElementById('template-item');
    const clone = template.content.cloneNode(true);
    document.getElementById('lista-itens').appendChild(clone);
}

window.removerLinha = function(btn) {
    btn.closest('.item-row').remove();
}

// 3. Envio do Formulário
document.getElementById('formOrcamento').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Coletar dados do cabeçalho
    const idCliente = document.getElementById('selectCliente').value;
    const observacoes = document.getElementById('observacoes').value;
    
    // Coletar itens
    const itemRows = document.querySelectorAll('.item-row');
    const itens = [];
    
    itemRows.forEach(row => {
        itens.push({
            tituloAmbiente: row.querySelector('.titulo').value,
            descricaoDetalhada: row.querySelector('.descricao').value,
            valorUnitario: parseFloat(row.querySelector('.valor').value),
            quantidade: parseInt(row.querySelector('.qtd').value)
        });
    });

    if(itens.length === 0) {
        alert('Adicione pelo menos um item ao orçamento.');
        return;
    }

    const payload = {
        idCliente,
        observacoes,
        itens,
        status: 'Em Analise', // Padrão
        validadeDias: 15
    };

    const response = await fetchAuth('/orcamentos', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    if(response.ok) {
        alert('Orçamento criado com sucesso!');
        window.location.href = 'dashboard.html';
    } else {
        const erro = await response.json();
        alert('Erro: ' + (erro.erro || erro.error));
    }
});

carregarClientes();
// Adiciona um item por padrão ao carregar
adicionarLinhaItem();