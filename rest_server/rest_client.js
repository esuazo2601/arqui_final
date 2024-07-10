let REST = {
  "Texto": 'Hola desde REST',
  "FechaHora": new Date().toLocaleString(),
  "Sistema": "REST",
  "Estado": 0
};

const request = new Request("http://localhost:3000/rest", {
  method: "POST",
  body: JSON.stringify(REST),
  headers: {
    "Content-Type": "application/json"
  }
});

fetch(request)
  .then(response => {
    console.log(response.status);
    return   response.json();  // Si la respuesta es JSON
  })
  .then(data => {
    console.log(data);  // Procesa la respuesta
  })
  .catch(error => {
    console.error('Error:', error);
  });
