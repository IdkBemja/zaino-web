$(document).ready(function() {
    $("#inicio").addClass("options-active");

    $("#test-api").click(function() {
        fetch("/api/test-api")
            .then(async response => {
                let data;
                try {
                    data = await response.json();
                } catch (e) {
                    data = { error: "Respuesta no es JSON", raw: await response.text() };
                }
                console.log(data);
            })
            .catch(error => {
                console.log({ error: error.toString() });
            });

    fetch("api/visitas", { method: 'POST' }).then(response => response.json()).then(data => {
        console.log("Número de visitas:", data.num_visitas);
    }).catch(error => {
        console.error("Error al actualizar visitas:", error);
    });
});

    $("#inicio").click(function() {
        $(".options-active").removeClass("options-active");
        $(this).addClass("options-active");
    });

    $("#informes").click(function() {
        $(".options-active").removeClass("options-active");
        $(this).addClass("options-active");
    });
});