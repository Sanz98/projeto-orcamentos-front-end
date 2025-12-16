const token = localStorage.getItem('token');
if (!token) window.location.href = 'index.html';

// Array para guardar os itens temporariamente antes de salvar
let listaItens = [];

// 1. Carregar Clientes no Select
async function carregarSelectClientes() {
    try {
        const res = await fetch('http://localhost:8081/clientes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const clientes = await res.json();
        
        const select = document.getElementById('selectCliente');
        select.innerHTML = '<option value="">Selecione um cliente...</option>';
        
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.idCliente; // O ID que o banco precisa
            option.text = cliente.nomeCliente; // O nome que o usuário vê
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao buscar clientes', error);
        alert('Erro ao carregar lista de clientes');
    }
}

// 2. Adicionar Item na Lista (Memória + Tabela)
function adicionarItemNaLista() {
    // Pega valores dos inputs
    const titulo = document.getElementById('itemTitulo').value;
    const qtd = parseInt(document.getElementById('itemQtd').value);
    const valor = parseFloat(document.getElementById('itemValor').value);
    const desc = document.getElementById('itemDescricao').value;

    if (!titulo || !valor || !qtd) {
        alert('Preencha pelo menos Título, Quantidade e Valor.');
        return;
    }

    // Cria objeto do item
    const item = {
        tituloAmbiente: titulo,
        descricaoDetalhada: desc,
        quantidade: qtd,
        valorUnitario: valor,
        subtotal: qtd * valor
    };

    // Adiciona no array global
    listaItens.push(item);

    // Atualiza a tela e limpa inputs
    renderizarTabelaItens();
    limparInputsItem();
}

// 3. Atualizar a Tabela Visual e o Total
function renderizarTabelaItens() {
    const tbody = document.getElementById('tabelaItens');
    tbody.innerHTML = '';
    
    let totalGeral = 0;

    listaItens.forEach((item, index) => {
        totalGeral += item.subtotal;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.tituloAmbiente}</td>
            <td>${item.quantidade}</td>
            <td>R$ ${item.valorUnitario.toFixed(2)}</td>
            <td>R$ ${item.subtotal.toFixed(2)}</td>
            <td>
                <button type="button" onclick="removerItem(${index})" style="background: #dc3545; padding: 5px; width: auto;">X</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Atualiza o texto do Total
    document.getElementById('valorTotalDisplay').innerText = totalGeral.toFixed(2);
}

function removerItem(index) {
    listaItens.splice(index, 1); // Remove do array
    renderizarTabelaItens(); // Redesenha a tabela
}

function limparInputsItem() {
    document.getElementById('itemTitulo').value = '';
    document.getElementById('itemValor').value = '';
    document.getElementById('itemDescricao').value = '';
    document.getElementById('itemQtd').value = '1';
    document.getElementById('itemTitulo').focus();
}

// 4. Enviar tudo para o Back-end (Finalizar)
document.getElementById('formOrcamento').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (listaItens.length === 0) {
        alert('Adicione pelo menos um item ao orçamento!');
        return;
    }

    // Calcula total final
    const totalFinal = listaItens.reduce((acc, item) => acc + item.subtotal, 0);

    // Monta o JSON grandão
    const orcamentoPayload = {
        idCliente: document.getElementById('selectCliente').value,
        prazoEntrega: document.getElementById('prazoEntrega').value,
        validadeDias: document.getElementById('validadeDias').value,
        condicaoPagamento: document.getElementById('condicaoPagamento').value,
        observacoes: document.getElementById('observacoes').value,
        valorTotal: totalFinal,
        desconto: 0, // Pode adicionar campo pra isso depois se quiser
        status: "Em Análise",
        dataCriacao: new Date().toISOString(), // Data de hoje
        itens: listaItens // <--- O Array de itens vai aqui dentro!
    };

    try {
        const res = await fetch('http://localhost:8081/orcamentos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orcamentoPayload)
        });

        if (res.ok) {
            alert('Orçamento criado com sucesso!');
            window.location.href = 'dashboard.html'; // Volta pra tela inicial
        } else {
            const erro = await res.json();
            alert('Erro: ' + JSON.stringify(erro));
        }

    } catch (error) {
        console.error(error);
        alert('Erro de conexão ao salvar.');
    }
});

// Inicializa
carregarSelectClientes();