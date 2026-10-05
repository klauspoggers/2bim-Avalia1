javascript
try {
    const resposta = await fetch('/api/desenho', { ... });
    if (!resposta.ok) {
        throw new Error("Erro do servidor");
    }
    // ...
} catch (erro) {
    // É aqui que ele mostra aquela mensagem na tela do site!
    divErro.innerText = "❌ Erro 500: Não foi possível gerar o desenho. Verifique as credenciais no Cloudflare.";
}
