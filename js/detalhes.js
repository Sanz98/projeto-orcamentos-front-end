const token = localStorage.getItem('token');
if (!token) window.location.href = 'index.html';

// 1. Pega o ID da URL
const urlParams = new URLSearchParams(window.location.search);
const idOrcamento = urlParams.get('id');

if (!idOrcamento) {
    alert('Orçamento não especificado!');
    window.location.href = 'dashboard.html';
}

// Variável global para guardar o orçamento atual
let orcamentoAtual = null;

// 2. Busca os dados na API
async function carregarDetalhes() {
    try {
        const res = await fetch(`${API_URL}/orcamentos/${idOrcamento}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 403) {
            alert('Você não tem permissão para ver este orçamento.');
            window.location.href = 'dashboard.html';
            return;
        }

        if (!res.ok) throw new Error('Erro ao buscar dados');

        orcamentoAtual = await res.json();
        renderizarPagina(orcamentoAtual);

    } catch (error) {
        console.error(error);
        alert('Erro ao carregar detalhes.');
    }
}

// 3. Preenche o HTML
function renderizarPagina(orc) {
    document.getElementById('tituloPagina').innerText = `Orçamento: ${orc.nomeCliente}`;
    document.getElementById('detalheObs').innerText = orc.observacoes || 'Sem observações';
    
    const dataCriacao = new Date(orc.dataCriacao).toLocaleDateString('pt-BR');
    const dataPrazo = new Date(orc.prazoEntrega).toLocaleDateString('pt-BR');
    document.getElementById('detalheData').innerText = dataCriacao;
    document.getElementById('detalhePrazo').innerText = dataPrazo;

    document.getElementById('detalheTotal').innerText = parseFloat(orc.valorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Lógica do Dropdown de Status
    const selectStatus = document.getElementById('selectStatus');
    const btnAdd = document.getElementById('btnAdicionarItem');
    
    selectStatus.value = orc.status;

    // Se estiver fechado, bloqueia tudo
    if (orc.status === 'Aprovado' || orc.status === 'Rejeitado') {
        selectStatus.disabled = true;
        selectStatus.style.backgroundColor = (orc.status === 'Aprovado') ? "#d4edda" : "#f8d7da";
        
        // Esconde botão de adicionar item se fechado
        if(btnAdd) btnAdd.style.display = 'none';
        
    } else {
        selectStatus.disabled = false;
        selectStatus.style.backgroundColor = "#fff";
        if(btnAdd) btnAdd.style.display = 'inline-block';
    }

    // Tabela de Itens
    const tbody = document.getElementById('tabelaItens');
    tbody.innerHTML = '';

    if (orc.itens && orc.itens.length > 0) {
        orc.itens.forEach(item => {
            const subtotal = item.valorUnitario * item.quantidade;
            const tr = document.createElement('tr');
            
            // Botão excluir só aparece se não estiver fechado
            const botaoExcluir = (orc.status !== 'Aprovado' && orc.status !== 'Rejeitado') 
                ? `<button onclick="deletarItem('${item.idItem}')" class="btn-danger" style="padding: 5px 10px; width: auto;" title="Remover item">🗑️</button>`
                : '-';

            tr.innerHTML = `
                <td>${item.tituloAmbiente}</td>
                <td>${item.descricaoDetalhada}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${parseFloat(item.valorUnitario).toFixed(2)}</td>
                <td>R$ ${subtotal.toFixed(2)}</td>
                <td style="text-align: center;">${botaoExcluir}</td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Nenhum item neste orçamento.</td></tr>';
    }
}

// --- LÓGICA DO STATUS ---
async function atualizarStatus() {
    const novoStatus = document.getElementById('selectStatus').value;

    if(!confirm(`Deseja alterar o status para "${novoStatus}"?`)) {
        document.getElementById('selectStatus').value = orcamentoAtual.status;
        return;
    }

    const payload = {
        status: novoStatus,
        valorTotal: orcamentoAtual.valorTotal 
    };

    try {
        const res = await fetch(`${API_URL}/orcamentos/${idOrcamento}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        if(res.ok) {
            alert('Status atualizado!');
            carregarDetalhes(); 
        } else {
            const erro = await res.json();
            alert('Erro: ' + erro.erro);
            document.getElementById('selectStatus').value = orcamentoAtual.status;
        }

    } catch (error) { console.error(error); alert('Erro de conexão.'); }
}

// --- FUNÇÕES DE EXCLUSÃO ---
async function deletarItem(idItem) {
    if(!confirm("Tem certeza que deseja remover este item?")) return;
    try {
        const res = await fetch(`${API_URL}/orcamentos/${idOrcamento}/itens/${idItem}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) { alert('Item removido!'); carregarDetalhes(); }
        else { const erro = await res.json(); alert('Erro: ' + erro.erro); }
    } catch(err) { alert('Erro de conexão.'); }
}

async function deletarOrcamentoInteiro() {
    if(!confirm("⚠️ ATENÇÃO: Isso apagará o orçamento e TODOS os itens.\nTem certeza?")) return;
    try {
        const res = await fetch(`${API_URL}/orcamentos/${idOrcamento}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) { alert('Excluído!'); window.location.href = 'dashboard.html'; }
        else { const erro = await res.json(); alert('Erro: ' + erro.erro); }
    } catch(err) { alert('Erro de conexão.'); }
}

// --- LÓGICA DO MODAL (ADICIONAR ITEM) ---

function abrirModalItem() {
    document.getElementById('modalItem').style.display = 'block';
}

function fecharModalItem() {
    document.getElementById('modalItem').style.display = 'none';
    document.getElementById('formNovoItem').reset(); // Limpa os campos
}

// Captura o submit do formulário dentro do modal
document.getElementById('formNovoItem').addEventListener('submit', async (e) => {
    e.preventDefault();

    const novoItem = {
        tituloAmbiente: document.getElementById('novoTitulo').value,
        descricaoDetalhada: document.getElementById('novoDescricao').value,
        quantidade: document.getElementById('novoQtd').value,
        valorUnitario: document.getElementById('novoValor').value
    };

    try {
        // Rota POST na API: /orcamentos/:id/itens
        const res = await fetch(`${API_URL}/orcamentos/${idOrcamento}/itens`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(novoItem)
        });

        if (res.ok) {
            alert('Item adicionado com sucesso!');
            fecharModalItem();
            carregarDetalhes(); // Recarrega para mostrar o item novo e o valor atualizado
        } else {
            const erro = await res.json();
            alert('Erro: ' + (erro.erro || 'Falha ao adicionar'));
        }
    } catch (err) {
        console.error(err);
        alert('Erro de conexão ao salvar item.');
    }
});

// Inicia
carregarDetalhes();