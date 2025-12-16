const formLogin = document.getElementById('formLogin');

formLogin.addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita que a página recarregue

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        // 1. Faz a requisição para a SUA API
        const resposta = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            // 2. Se deu certo, salva o token e o perfil no LocalStorage
            localStorage.setItem('token', dados.token);
            
            // AQUI MUDOU: Salvamos o perfil para usar no Dashboard
            localStorage.setItem('perfil', dados.usuario.perfil);
            localStorage.setItem('nomeUsuario', dados.usuario.nome);
            
            alert('Login realizado com sucesso!');
            // 3. Redireciona para o painel principal
            window.location.href = 'dashboard.html';
        } else {
            document.getElementById('mensagem').innerText = dados.erro || 'Erro ao logar';
        }

    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor. O Back-end está rodando?');
    }
});