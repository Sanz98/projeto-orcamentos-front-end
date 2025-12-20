document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const response = await fetchAuth('/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
    });

    if (response.ok) {
        const data = await response.json();
        // Salva dados públicos para UI (O token seguro fica no Cookie HttpOnly)
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        window.location.href = 'dashboard.html';
    } else {
        const error = await response.json();
        alert(error.erro || 'Erro ao fazer login');
    }
});