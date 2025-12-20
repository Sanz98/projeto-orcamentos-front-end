checkLogin();

// Pega ID da URL
const urlParams = new URLSearchParams(window.location.search);
const idOrcamento = urlParams.get('id');

// --- VARIÁVEL GLOBAL PARA GUARDAR O TOTAL ---
// Isso corrige o erro 500 no backend. Precisamos reenviar esse valor ao atualizar o status.
let valorTotalAtual = 0; 

// --- CARREGAR DADOS ---
async function carregarDetalhes() {
    if(!idOrcamento) {
        alert('ID não fornecido');
        window.location.href = 'dashboard.html';
        return;
    }

    try {
        const response = await fetchAuth(`/orcamentos/${idOrcamento}`);
        
        if(response.ok) {
            const orc = await response.json();
            
            // Debug: Abra o Console (F12) para confirmar se telefoneCliente está chegando
            console.log("DADOS DO BACKEND:", orc);

            document.getElementById('loading').classList.add('hidden');
            document.getElementById('conteudo-detalhes').classList.remove('hidden');

            // --- 1. DADOS DO CLIENTE E TELEFONE ---
            // Nome: Tenta na raiz (nomeCliente) ou dentro de objeto cliente
            document.getElementById('detalhe-cliente').innerText = orc.nomeCliente || (orc.cliente && orc.cliente.nomeCliente) || "Cliente";
            
            // Telefone: Busca exatamente pelo nome que está no seu banco (telefoneCliente)
            // Verificamos se está na raiz do objeto ou dentro de um sub-objeto 'cliente'
            let tel = orc.telefoneCliente || 
                      (orc.cliente && orc.cliente.telefoneCliente) || 
                      "Não informado";
            
            document.getElementById('detalhe-telefone').innerText = tel.trim(); // .trim() remove espaços extras do CHAR(12)


            // --- 2. STATUS ---
            // No seu banco o padrão é 'Em Analise' (sem acento)
            let statusAtual = orc.status || "Em Analise";
            
            // Ajuste Visual: Se for "Em Analise", seleciona "Em Análise" (com acento) no select
            if(statusAtual === 'Em Analise') {
                document.getElementById('status-select').value = "Em Análise";
            } else {
                document.getElementById('status-select').value = statusAtual;
            }

            // Texto estático da impressão
            document.getElementById('print-status-texto').innerText = statusAtual;


            // --- 3. DADOS DE IMPRESSÃO ---
            const numOrc = orc.numeroOrcamento || (orc.idOrcamento ? orc.idOrcamento.substring(0, 8).toUpperCase() : "---");
            document.getElementById('print-id-orcamento').innerText = numOrc;
            
            const dataEmissao = orc.dataCriacao || orc.createdAt || new Date();
            document.getElementById('print-data-emissao').innerText = new Date(dataEmissao).toLocaleDateString('pt-BR');
            
            // Se o backend mandar o nome do vendedor, usa. Senão, usa genérico.
            document.getElementById('detalhe-vendedor').innerText = orc.nomeVendedor || "Consultor Focco"; 
            document.getElementById('detalhe-obs').innerText = orc.observacoes || "Pagamento conforme combinado. Validade de 15 dias.";


            // --- 4. TABELA E TOTAIS ---
            // Se o backend mandar 'itens', usa. Se mandar 'itensOrcamento', usa.
            const listaItens = orc.itens || orc.itensOrcamento || [];
            renderizarTabela(listaItens);
            
            // Importante: Guardar o total na variável global
            valorTotalAtual = parseFloat(orc.valorTotal || 0);
            
            document.getElementById('detalhe-total').innerText = valorTotalAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        } else {
            alert('Erro ao carregar orçamento.');
        }
    } catch (error) {
        console.error(error);
        alert("Erro de conexão com a API.");
    }
}

// --- RENDERIZAR TABELA ---
function renderizarTabela(itens) {
    const tbody = document.querySelector('#tabela-itens tbody');
    tbody.innerHTML = ''; 
    
    itens.forEach(item => {
        const tr = document.createElement('tr');
        const valorUnit = parseFloat(item.valorUnitario);
        const qtd = parseInt(item.quantidade);
        const subtotal = valorUnit * qtd;
        
        // Garante pegar o ID correto do item
        const itemId = item.idItem || item.id || item._id; 

        tr.innerHTML = `
            <td>${item.tituloAmbiente}</td>
            <td style="font-size: 0.9em;">${item.descricaoDetalhada}</td>
            <td style="text-align: center;">${qtd}</td>
            <td style="text-align: right;">${valorUnit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td style="text-align: right;">${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td class="no-print" style="text-align: center;">
                <button onclick="excluirItem('${itemId}')" class="btn-icon-delete" title="Excluir">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- AÇÃO 1: ATUALIZAR STATUS ---
async function atualizarStatus(novoStatus) {
    // TRADUÇÃO: O select tem acento ("Em Análise"), mas o banco ACEITA SOMENTE "Em Analise" (sem acento)
    let statusEnvio = novoStatus;
    if(novoStatus === "Em Análise") statusEnvio = "Em Analise";

    try {
        console.log("Enviando atualização:", { status: statusEnvio, valorTotal: valorTotalAtual });

        // SOLUÇÃO DO ERRO 500: Enviamos valorTotalAtual junto!
        const response = await fetchAuth(`/orcamentos/${idOrcamento}`, {
            method: 'PUT', 
            body: JSON.stringify({ 
                status: statusEnvio,
                valorTotal: valorTotalAtual 
            })
        });
        
        if(response.ok) {
            document.getElementById('print-status-texto').innerText = statusEnvio;
            
            // Feedback Visual (Verde)
            const select = document.getElementById('status-select');
            select.style.borderColor = 'green';
            setTimeout(() => select.style.borderColor = '', 1000);

            // Opcional: Mostra alerta de sucesso
            // alert(`Status atualizado para: ${novoStatus}`);
        } else {
            const erro = await response.json();
            console.error("Erro do servidor:", erro);
            
            // Mostra mensagem amigável
            alert("Não foi possível atualizar: " + (erro.erro || "Verifique se o orçamento já está fechado."));
            
            // Recarrega para voltar o select ao estado real
            carregarDetalhes(); 
        }
    } catch (error) { 
        console.error(error); 
        alert("Erro de conexão.");
    }
}

// --- AÇÃO 2: ADICIONAR ITEM ---
async function adicionarItem() {
    const ambiente = document.getElementById('novo-ambiente').value;
    const descricao = document.getElementById('nova-descricao').value;
    const qtd = document.getElementById('novo-qtd').value;
    const valor = document.getElementById('novo-valor').value;

    if(!ambiente || !descricao || !valor) return alert("Preencha todos os campos!");

    try {
        // Nomes dos campos iguais ao banco: tituloAmbiente, descricaoDetalhada
        const response = await fetchAuth(`/orcamentos/${idOrcamento}/itens`, {
            method: 'POST',
            body: JSON.stringify({
                tituloAmbiente: ambiente,
                descricaoDetalhada: descricao,
                quantidade: Number(qtd),
                valorUnitario: Number(valor)
            })
        });

        if(response.ok) {
            // Limpa form
            document.getElementById('novo-ambiente').value = '';
            document.getElementById('nova-descricao').value = '';
            document.getElementById('novo-valor').value = '';
            document.getElementById('novo-qtd').value = '1';
            carregarDetalhes(); // Recarrega tela
        } else {
            const erro = await response.json();
            alert("Erro: " + (erro.erro || "Falha ao adicionar item"));
        }
    } catch (error) { console.error(error); }
}

// --- AÇÃO 3: EXCLUIR ITEM ---
async function excluirItem(itemId) {
    if(!confirm("Tem certeza que deseja remover este item?")) return;
    try {
        const response = await fetchAuth(`/orcamentos/${idOrcamento}/itens/${itemId}`, { 
            method: 'DELETE' 
        });
        
        if(response.ok) {
            carregarDetalhes();
        } else {
            const erro = await response.json();
            alert("Erro: " + (erro.erro || "Falha ao excluir item"));
        }
    } catch (error) { console.error(error); }
}

// Inicia
carregarDetalhes();