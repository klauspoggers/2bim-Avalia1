javascript
export async function onRequestPost(context) {
  try {
    const { request } = context;

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const CLIENT_ID_FIXO = "259260099061-mkhjaqululp4rnctuaeqbmf2ih9c9ojm.apps.googleusercontent.com";

    let corpo;
    try {
      corpo = await request.json();
    } catch (e) {
      return new Response('Corpo ausente ou JSON inválido', { status: 400 });
    }

    const numero = corpo.numero;
    if (numero === undefined || !Number.isInteger(numero) || numero < 1 || numero > 100) {
      return new Response('Número ausente ou fora do intervalo de 1 a 100', { status: 400 });
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Token ausente ou inválido', { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    if (!googleResponse.ok) {
      return new Response('Token do Google inválido ou expirado', { status: 401 });
    }

    const tokenInfo = await googleResponse.json();

    if (tokenInfo.aud !== CLIENT_ID_FIXO) {
      return new Response(`Audience incorreto. Recebido: ${tokenInfo.aud}`, { status: 401 });
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
    return new Response(`Erro interno: ${err.message}`, { status: 500 });
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
