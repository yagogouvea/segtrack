import fetch from 'node-fetch';

async function testUsersRoute() {
  try {
    console.log('🧪 Testando rota de usuários...');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiOThiZGFjNTAtZmUxMi00ZGM2LWJkZGMtM2UxZDliMzhlN2NkIiwibm9tZSI6IkFkbWluaXN0cmFkb3IiLCJlbWFpbCI6ImFkbWluQHNlZ3RyYWNrLmNvbSIsInJvbGUiOiJhZG1pbiIsInBlcm1pc3Npb25zIjpbImNyZWF0ZTp1c2VyIiwicmVhZDp1c2VyIiwidXBkYXRlOnVzZXIiLCJkZWxldGU6dXNlciIsImNyZWF0ZTpjbGllbnQiLCJyZWFkOmNsaWVudCIsInVwZGF0ZTpjbGllbnQiLCJkZWxldGU6Y2xpZW50IiwiY3JlYXRlOm9jb3JyZW5jaWEiLCJyZWFkOm9jb3JyZW5jaWEiLCJ1cGRhdGU6b2NvcnJlbmNpYSIsImRlbGV0ZTpvY29ycmVuY2lhIiwiY3JlYXRlOnByZXN0YWRvciIsInJlYWQ6cHJlc3RhZG9yIiwidXBkYXRlOnByZXN0YWRvciIsImRlbGV0ZTpwcmVzdGFkb3IiLCJjcmVhdGU6cmVsYXRvcmlvIiwicmVhZDpyZWxhdG9yaW8iLCJ1cGRhdGU6cmVsYXRvcmlvIiwiZGVsZXRlOnJlbGF0b3JpbyIsImNyZWF0ZTpjb250cmF0byIsInJlYWQ6Y29udHJhdG8iLCJ1cGRhdGU6Y29udHJhdG8iLCJkZWxldGU6Y29udHJhdG8iLCJyZWFkOmRhc2hib2FyZCIsInVwbG9hZDpmb3RvIiwiY3JlYXRlOmZvdG8iLCJyZWFkOmZvdG8iLCJ1cGRhdGU6Zm90byIsImRlbGV0ZTpmb3RvIiwiY3JlYXRlOnZlaWN1bG8iLCJyZWFkOnZlaWN1bG8iLCJ1cGRhdGU6dmVpY3VsbyIsImRlbGV0ZTp2ZWljdWxvIiwicmVhZDpmaW5hbmNlaXJvIiwidXBkYXRlOmZpbmFuY2Vpcm8iLCJyZWFkOmNvbmZpZyIsInVwZGF0ZTpjb25maWciXX0.AEc3qmIK81SqxWjkD-7dH3EcHlLI0XrZYr7fWCGtR4Q';
    
    const response = await fetch('http://localhost:8080/api/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Status da resposta:', response.status);
    console.log('📋 Headers:', response.headers.raw());

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Sucesso! Dados recebidos:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Erro na resposta:');
      console.log(errorText);
    }

  } catch (error) {
    console.error('❌ Erro ao testar rota:', error);
  }
}

testUsersRoute(); 