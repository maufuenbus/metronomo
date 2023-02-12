const init = () => {
    const tieneSoporteUserMedia = () =>
        !!(navigator.mediaDevices.getUserMedia)

    // Declaración de elementos del DOM
    const $listaDeDispositivos = document.querySelector("#listaDeDispositivos"),
        $duracion = document.querySelector("#duracion"),
        $btnComenzarGrabacion = document.querySelector("#start_stop"),
        $btnDetenerGrabacion = document.querySelector("#start_stop");

    // Algunas funciones útiles
    const limpiarSelect = () => {
        for (let x = $listaDeDispositivos.options.length - 1; x >= 0; x--) {
            $listaDeDispositivos.options.remove(x);
        }
    }

    const segundosATiempo = numeroDeSegundos => {
        let horas = Math.floor(numeroDeSegundos / 60 / 60);
        numeroDeSegundos -= horas * 60 * 60;
        let minutos = Math.floor(numeroDeSegundos / 60);
        numeroDeSegundos -= minutos * 60;
        numeroDeSegundos = parseInt(numeroDeSegundos);
        if (horas < 10) horas = "0" + horas;
        if (minutos < 10) minutos = "0" + minutos;
        if (numeroDeSegundos < 10) numeroDeSegundos = "0" + numeroDeSegundos;
        return `${horas}:${minutos}:${numeroDeSegundos}`;
    };

    // Variables "globales"
    let tiempoInicio, mediaRecorder, idIntervalo;
    const refrescar = () => {
        $duracion.textContent = segundosATiempo((Date.now() - tiempoInicio) / 1000);
    }


    // Consulta la lista de dispositivos de entrada de audio y llena el select
    const llenarLista = () => {
        navigator
            .mediaDevices
            .enumerateDevices()
            .then(dispositivos => {
                limpiarSelect();
                dispositivos.forEach((dispositivo, indice) => {
                    if (dispositivo.kind === "audioinput") {
                        const $opcion = document.createElement("option");
                        // Firefox no trae nada con label, que viva la privacidad
                        // y que muera la compatibilidad
                        $opcion.text = dispositivo.label || `Dispositivo ${indice + 1}`;
                        $opcion.value = dispositivo.deviceId;
                        $listaDeDispositivos.appendChild($opcion);
                    }
                })
            })
    };

    // Ayudante para la duración; no ayuda en nada pero muestra algo informativo
    const comenzarAContar = () => {
        tiempoInicio = Date.now();
        idIntervalo = setInterval(refrescar, 500);
    };

    // Comienza a grabar el audio con el dispositivo seleccionado
    const comenzarAGrabar = () => {
        if (!$listaDeDispositivos.options.length) return alert("No hay dispositivos");
        if (mediaRecorder) return alert("Excelente, completaste tu Ejercitación. Recuerda que debes ejercitar almenos 3 veces al día"); // No permitir que se grabe doblemente

        navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: $listaDeDispositivos.value,
            }
        })
            .then(
                stream => {
                    mediaRecorder = new MediaRecorder(stream);                      // Comenzar a grabar con el stream
                    mediaRecorder.start();
                    comenzarAContar();
                    const fragmentosDeAudio = [];                                       // En el arreglo pondremos los datos que traiga el evento dataavailable
                    mediaRecorder.addEventListener("dataavailable", evento => {         // Escuchar cuando haya datos disponibles
                        fragmentosDeAudio.push(evento.data);                             // Y agregarlos a los fragmentos
                        console.log(fragmentosDeAudio)                               // se ve por consola el objeto
                    });


                    // Cuando se detenga (haciendo click en el botón) se ejecuta esto
                    mediaRecorder.addEventListener("stop", () => {
                        // Detener el stream
                        stream.getTracks().forEach(track => track.stop());
                        // Detener la cuenta regresiva
                        detenerConteo();
                    });

                    // Cuando se detenga (haciendo click en el botón) se ejecuta esto
                    // GUARDAR EL ARCHIVO
                    mediaRecorder.addEventListener("stop", () => {
                        stream.getTracks().forEach(track => track.stop());  // Detener el stream
                         detenerConteo();                                    // Detener la cuenta regresiva
                        const blobAudio = new Blob(fragmentosDeAudio);
                         // Convertir los fragmentos a un objeto binario
                         const urlParaDescargar = URL.createObjectURL(blobAudio);        // Crear una URL o enlace para descargar
                         let a = document.createElement("a");                            // Crear un elemento <a> invisible para descargar el audio
                        document.body.appendChild(a);
                        a.style = "display: none";
                        a.href = urlParaDescargar;
                        a.download = "ejercicio_vocal.wav";
                        a.click();                                          // Hacer click en el enlace
                        window.URL.revokeObjectURL(urlParaDescargar);       // Y remover el objeto
                    });
                }
            )
            .catch(error => {
                console.log(error) // Aquí maneja el error, tal vez no dieron permiso
            });
    };


    const detenerConteo = () => {
        clearInterval(idIntervalo);
        tiempoInicio = null;
        const duracion = $duracion.textContent
        // document.getElementById('total_duracion').value = duracion
        $duracion.textContent = "";
    }

    const detenerGrabacion = () => {
        if (!mediaRecorder) return
        mediaRecorder.stop();
        mediaRecorder = null;
    };




    $btnComenzarGrabacion.addEventListener("click", comenzarAGrabar);
    $btnDetenerGrabacion.addEventListener("click", detenerGrabacion);

    // Cuando ya hemos configurado lo necesario allá arriba llenamos la lista

    llenarLista();
}
// Esperar a que el documento esté listo...
document.addEventListener("DOMContentLoaded", init);