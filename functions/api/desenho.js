javascript
export async function onRequestPost(context) {
  return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="red"/><text x="50" y="150" fill="white" font-size="20">TESTE OK</text></svg>', {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml'
    }
  });
}
