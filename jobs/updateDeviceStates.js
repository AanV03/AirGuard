const cron = require('node-cron');
const Device = require('../models/Device');
const Schedule = require('../models/schedule');

function getCurrentTime() {
    const now = new Date();
    const hora = now.toTimeString().slice(0, 5); // "HH:mm"
    const dia = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()];
    return { hora, dia };
}

async function actualizarEstadosDispositivos() {
    const { hora, dia } = getCurrentTime();

    const schedules = await Schedule.find({});
    const estadosPorDispositivo = {};

    // Verificar si cada dispositivo tiene al menos un horario activo ahora
    schedules.forEach(s => {
        const id = s.deviceId.toString();
        const estaActivo = s.activeDays.includes(dia) && s.startTime <= hora && hora <= s.endTime;

        if (estaActivo) {
            estadosPorDispositivo[id] = true;
        } else if (!(id in estadosPorDispositivo)) {
            estadosPorDispositivo[id] = false;
        }
    });

    // Actualizar campo horarioActivo de cada dispositivo
    const dispositivos = await Device.find({});
    for (const d of dispositivos) {
        const id = d._id.toString();
        const nuevoHorarioActivo = estadosPorDispositivo[id] || false;

        if (d.horarioActivo !== nuevoHorarioActivo) {
            await Device.findByIdAndUpdate(d._id, { horarioActivo: nuevoHorarioActivo });
            console.log(`[horarioActivo] ${d.nombre} → ${nuevoHorarioActivo}`);
        }

        // Mostrar verificación extendida con estado solo si está en horario
        if (nuevoHorarioActivo) {
            const estadoActual = d.estado || 'desconocido';
            const extra = estadoActual === 'activo' ? `→ estado: activo` : '';
            console.log(`[verificación] ${id} - ${dia} ${hora} → en horario ${extra}`);
        }
    }
}

// Ejecutar cada minuto
cron.schedule('* * * * *', async () => {
    try {
        await actualizarEstadosDispositivos();
    } catch (err) {
        console.error('[cron estado] Error:', err);
    }
});

module.exports = { actualizarEstadosDispositivos };
