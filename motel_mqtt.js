var mqtt = require('mqtt');

var broker_remoto = true;

// ============================== CONEXIÓN LOCAL ====================================
var broker_local = "mqtt://127.0.0.1"
var options_local = {
    clientId: "p69_czu_server",
    //username: "user",
    //password: "password",
    clean: false
};
var client_local = mqtt.connect(broker_local, options_local);

client_local.on('message', function (topic, message, packet) {
    // console.log(topic + " -> " + message);

    var sub_topics = topic.toString().split('/');
    if (sub_topics.length < 2) {
        return;
    }

    switch (sub_topics[0]) {
        case "habitacion":
            var habitacion = sub_topics[1];
            var evento = message.toString();
            registrarSensor(habitacion, evento);
            if (broker_remoto) {
                try {
                    pub_sensor(habitacion, evento);
                } catch (error) {
                    client_disp_connect(dispositivo);
                    pub_sensor(habitacion, evento);
                }
            } 
            break;
        case "online":
            var dispositivo = sub_topics[1];
            var evento = message.toString();
            alertaAlive(dispositivo, evento);
            if (broker_remoto) pub_online_disp(dispositivo, evento);
            break;
    }

});

client_local.on("connect", function () {
    console.log("Conectado a " + broker_local);
    suscripcion_local();
})

client_local.on("error", function (error) {
    console.log("ERROR: " + broker_local + " -> " + error);
});

// ============================== CONEXIÓN BROKER REMOTO - SERVER ==================================
var topic_nube = "myiot87/";
var client_server;

if (broker_remoto) {
    var broker_nube = "mqtt://broker.mqttdashboard.com";
    var id_server = "20"
    var options_server = {
        clientId: "p69_czu_server",
        username: "",
        password: "",
        clean: false,
        will: {
            topic: topic_nube + "online/" + id_server,
            payload: "0",
            qos: 2,
            retain: false
        }
    };
    client_server = mqtt.connect(broker_nube, options_server);

    client_server.on("connect", function () {
        console.log("Server conectado a " + broker_nube);
        pub_online_server();
    })

    client_server.on("error", function (error) {
        console.log("SERVER ERROR: " + broker_nube + " -> " + error);
    });
}
// ============================== CONEXIÓN BROKER REMOTO - DISP ==================================
var client_disp;
function client_disp_connect(dispositivo) {
    var options_disp = {
        clientId: "p69_czu_disp_" + dispositivo,
        username: "",
        password: "",
        clean: false,
        will: {
            topic: topic_nube + "online/" + dispositivo,
            payload: "0",
            qos: 2,
            retain: false
        }
    };
    client_disp = mqtt.connect(broker_nube, options_disp);

    client_disp.on("connect", function () {
        console.log("Dispositivo conectado a " + broker_nube);
        publish_topic = topic_nube + "online/" + dispositivo;
        publish_nube(client_disp, publish_topic, "1");
    })

    client_disp.on("error", function (error) {
        console.log("DISPOSITIVO ERROR: " + broker_nube + " -> " + error);
    });
}

//====================================================================================================

const sensores = [
    { hab: '1', id_sensor: '21' },
    { hab: '2', id_sensor: '22' },
    { hab: '3', id_sensor: '23' },
    { hab: '4', id_sensor: '24' },
    { hab: '5', id_sensor: '20' },
    { hab: '6', id_sensor: '20' },
    { hab: '7', id_sensor: '20' },
    { hab: '8', id_sensor: '20' },
    { hab: '9', id_sensor: '20' },
    { hab: '10', id_sensor: '20' },
    { hab: '11', id_sensor: '20' },
    { hab: '12', id_sensor: '20' },
    { hab: '13', id_sensor: '20' },
    { hab: '14', id_sensor: '20' },
    { hab: '15', id_sensor: '20' },
    { hab: '16', id_sensor: '20' },
    { hab: '17', id_sensor: '20' },
    { hab: '18', id_sensor: '20' },
    { hab: '19', id_sensor: '20' },
    { hab: '20', id_sensor: '20' },
];

function get_id_sensor_by_hab(hab) {
    sensor = sensores.find(sensores => sensores.hab === hab);
    return sensor.id_sensor;
}

function pub_sensor(habitacion, evento) {
    publish_topic = topic_nube + "sensor/" + get_id_sensor_by_hab(habitacion);
    publish_nube(client_disp, publish_topic, evento);
}

function pub_online_disp(dispositivo, evento) {
    if (evento == "1") client_disp_connect(dispositivo);
    if (evento == "0") {
        publish_topic = topic_nube + "online/" + dispositivo;
        try {
            publish_nube(client_disp, publish_topic, "0");
        } catch (error) {
            console.log("CATCH: Dispositivo no conectado, no se puede publicar el mensaje.");
            ;
        }
    }
}

function pub_online_server() {
    publish_topic = topic_nube + "online/" + id_server;
    publish_nube(client_server, publish_topic, "1");
}

function publish_nube(client, topic, msg, options = { retain: false, qos: 2 }) {
    console.log("PUB: " + topic + " -> ", msg);
    if (client.connected == true) {
        client.publish(topic, msg, options);
    }
}

function suscripcion_local() {
    var topic_list = ["habitacion/#", "online/#"];
    console.log("SUB: " + topic_list);
    client_local.subscribe(topic_list, { qos: 2 });
}

//=================================================================================
/*  Se ejecuta cuando la puerta de una habitación dispara un evento. El estado puede ser: 
        0: cierre, ocupacion
        1: apertura, liberacion         */
function registrarSensor(habitacion, evento) {
    console.log("Habitación_" + habitacion + " -> " + evento);
    // Insertar función de almacenamiento para registrar el evento

}

/*  Se ejecuta cuando un dispositivo se conecta o pierde conexión e informa del evento. 
    El evento puede ser: 
        1: online, inicia conexión
        0: offline, pierde conexión     */
function alertaAlive(dispositivo, evento) {
    console.log("Dispositivo_" + dispositivo + " -> " + evento);
    // Insertar función de almacenamiento para registrar el evento

}

console.log("...");
