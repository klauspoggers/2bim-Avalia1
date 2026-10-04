let id_token = null;

window.handleCredentialResponse = function(response) {
    id_token = response.credential;
    console.log("Login realizado com sucesso!");
};

const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const botaoBaixar = document.getElementById("baixar");

let svgAtual = "";

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagem.textContent = "";

  const numero = Number(campoNumero.value);

  if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
    mensagem.textContent = "Digite um inteiro entre 1 e 100.";
    return;
  }
  if (!id_token) {
    mensagem.textContent = "Por favor, inicie sessão com o Google primeiro.";
    return;
  }

  area.innerHTML = "A gerar desenho no servidor...";
  botaoBaixar.hidden = true;

  try {
    const resposta = await fetch('/api/desenho', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + id_token 
        },
        body: JSON.stringify({ numero: numero }) 
    });

    if (resposta.status === 200) {
        svgAtual = await resposta.text();
        area.innerHTML = svgAtual;
        botaoBaixar.hidden = false;
    } else if (resposta.status === 400 || resposta.status === 401) {
        area.innerHTML = "";
        mensagem.textContent = `Erro ${resposta.status}: Não foi possível gerar o desenho. Verifique a autenticação e os dados.`;
    } else {
        area.innerHTML = "";
        mensagem.textContent = `Erro inesperado: Código ${resposta.status}`;
    }
  } catch (erro) {
    area.innerHTML = "";
    mensagem.textContent = "Erro na comunicação com o servidor.";
  }
});

botaoBaixar.addEventListener("click", () => {
  const arquivo = new Blob([svgAtual], { type: "image/svg+xml" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = "exemplo.svg";
  link.click();
  URL.revokeObjectURL(url);
});
