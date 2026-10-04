let tokenGoogle = "";

window.handleCredentialResponse = function(response) {
  tokenGoogle = response.credential;
  
  const mensagem = document.getElementById('mensagem');
  if (mensagem) {
    mensagem.textContent = "Login efetuado com sucesso! Escolha o número e clique em Desenhar.";
    mensagem.style.color = "#4CAF50";
  }
};

const formulario = document.getElementById('formulario');
const campoNumero = document.getElementById('numero');
const mensagem = document.getElementById('mensagem');
const areaDesenho = document.getElementById('desenho');
const botaoBaixar = document.getElementById('baixar');

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  if (!tokenGoogle) {
    mensagem.textContent = "Por favor, inicie sessão com o Google primeiro.";
    mensagem.style.color = "#f44336";
    return;
  }

  const numero = Number(campoNumero.value);

  mensagem.textContent = "Gerando o desenho no servidor...";
  mensagem.style.color = "#ffffff";
  areaDesenho.innerHTML = "";
  if (botaoBaixar) botaoBaixar.hidden = true;

  try {
    const resposta = await fetch('/api/desenho', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenGoogle}`
      },
      body: JSON.stringify({ numero: numero })
    });

    if (resposta.status === 200) {
      const svgData = await resposta.text();
      areaDesenho.innerHTML = svgData;
      mensagem.textContent = "";
      if (botaoBaixar) botaoBaixar.hidden = false;
    } else if (resposta.status === 400 || resposta.status === 401) {
      mensagem.textContent = `Erro ${resposta.status}: Não foi possível gerar o desenho. Verifique os dados e o login.`;
      mensagem.style.color = "#f44336";
    } else {
      mensagem.textContent = `Erro inesperado: Código ${resposta.status}`;
      mensagem.style.color = "#f44336";
    }
  } catch (erro) {
    mensagem.textContent = "Erro na comunicação com o servidor.";
    mensagem.style.color = "#f44336";
  }
});

if (botaoBaixar) {
  botaoBaixar.addEventListener('click', () => {
    const svgContent = areaDesenho.innerHTML;
    if (!svgContent) return;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'exemplo.svg';
    link.click();
    URL.revokeObjectURL(url);
  });
}
