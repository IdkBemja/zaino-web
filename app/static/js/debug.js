$(document).ready(function() {
    // Usar delegación de eventos en el document
    $(document).on('click', '#test-api', async function(e) {
        e.preventDefault();
        
        try {
            console.log("Iniciando petición de prueba a la API...");
            
            const response = await fetch("/api/test-api");
            let data;
            
            try {
                data = await response.json();
                console.log("Respuesta de la API:", data);
            } catch (e) {
                console.error("Error al parsear respuesta como JSON:", e);
                const rawText = await response.text();
                data = { 
                    error: "Respuesta no es JSON", 
                    status: response.status,
                    statusText: response.statusText,
                    raw: rawText 
                };
                console.warn("Respuesta raw:", rawText);
            }
            
            // Si hay un elemento para mostrar el resultado, actualizarlo
            const resultElement = document.getElementById('api-test-result');
            if (resultElement) {
                resultElement.textContent = JSON.stringify(data, null, 2);
            }
            
        } catch (error) {
            console.error("Error en la petición:", error);
            alert("Error al conectar con la API. Revisa la consola para más detalles.");
        }
    });
});