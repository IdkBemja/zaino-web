$(document).ready(function() {

    fetch("/api/visitas", { method: 'POST' }).then(response => response.json()).then(data => {
        $("#visitas").append(`<p style="font-size: 2em; text-align: center;">${data.num_visitas}</p>`);
    }).catch(error => {
        console.error("Error al actualizar visitas:", error);
    });


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
        });

    $("#test-api2").click(function() {
        fetch("/api/weather")
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