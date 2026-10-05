javascript
export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    let corpo;
    try {
      corpo = await request.json();
    } catch (e) {
      return new Response('Corpo ausente ou JSON inválido', { status: 400 });
    }

    const numero = corpo.numero;
    if (numero === undefined || !Number.isInteger(numero) || numero < 1 || numero > 100) {
      return new Response('Número ausente, não inteiro ou fora do intervalo de 1 a 100', { status: 400 });
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Token ausente ou inválido', { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Faz a requisição ao Google e captura qualquer falha de rede
    const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    
    if (googleResponse.status !== 200) {
      const errorText = await googleResponse.text();
      return new Response(`Erro na validação do Google: ${errorText}`, { status: 401 });
    }

    const tokenInfo = await googleResponse.json();

    // Verificação de segurança da variável de ambiente
    if (!env.GOOGLE_CLIENT_ID) {
      return new Response('Erro crítico: GOOGLE_CLIENT_ID não está configurado no Cloudflare', { status: 500 });
    }

    if (tokenInfo.aud !== env.GOOGLE_CLIENT_ID) {
      return new Response(`Audience incorreto. Recebido: ${tokenInfo.aud}`, { status: 401 });
    }

    if (tokenInfo.email_verified !== "true" && tokenInfo.email_verified !== true) {
      return new Response('Email não verificado pelo Google', { status: 401 });
    }

    const email = tokenInfo.email || "usuario@desconhecido.com";
    const svg = gerarDesenho(numero, email);

    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml'
      }
    });

  } catch (err) {
    // Retorna o erro exato na tela em vez de um Erro 500 genérico
    return new Response(`Erro interno capturado: ${err.message}`, { status: 500 });
  }
}

function gerarDesenho(numero, email) {
  const tamanhoRaio = Math.min(numero, 120);
  const cor = numero % 2 === 0 ? "#4CAF50" : "#FF9800";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
    <rect width="100%" height="100%" fill="#2c2c2c" />
    <circle cx="150" cy="150" r="${tamanhoRaio}" fill="${cor}" />
    <text x="150" y="155" font-family="Arial" font-size="24" fill="#ffffff" text-anchor="middle" font-weight="bold">${numero}</text>
    <text x="150" y="280" font-family="Arial" font-size="12" fill="#aaaaaa" text-anchor="middle">Assinado por: ${email}</text>
  </svg>`;
}
