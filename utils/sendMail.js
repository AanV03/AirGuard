const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

async function enviarCorreoBienvenida(destinatario, nombre, link) {
    const mailOptions = {
        from: `"AirGuard" <${process.env.MAIL_USER}>`,
        to: destinatario,
        subject: '¡Bienvenido a AirGuard!',
        html: `
            <h2>Hola ${nombre},</h2>
            <p>Has sido registrado como subusuario en AirGuard.</p>
            <p>Para activar tu cuenta y establecer tu contraseña, haz clic en el siguiente enlace:</p>
            <p><a href="${link}">Activar mi cuenta</a></p>
            <p>Este enlace expirará en 24 horas.</p>
            <br/>
            <small>No respondas a este correo. AirGuard.</small>
        `
    };

    await transporter.sendMail(mailOptions);
}

async function enviarCorreoRecuperacion(destinatario, link) {
    const mailOptions = {
        from: `"AirGuard" <${process.env.MAIL_USER}>`,
        to: destinatario,
        subject: 'Recuperación de contraseña - AirGuard',
        html: `
            <p>Hola, has solicitado restablecer tu contraseña.</p>
            <p>Haz clic en el siguiente enlace para continuar:</p>
            <a href="${link}">${link}</a>
            <p>Este enlace expirará en 1 hora.</p>
            <br/>
            <small>No respondas a este correo. AirGuard.</small>
        `
    };

    await transporter.sendMail(mailOptions);
}

async function enviarCorreoSoporte({ tipo, nombre, email, descripcion, dispositivo, subusuario, archivo }) {
    let asunto = 'Nuevo reporte de soporte';
    let cuerpoTexto = '';
    const adjuntos = [];

    switch (tipo) {
        case 'error_dispositivo':
            asunto = `Reporte: Error en dispositivo (${nombre})`;
            cuerpoTexto = `
Usuario: ${nombre}
Correo: ${email}
Tipo: Error en dispositivo
Dispositivo ID: ${dispositivo}

Descripción:
${descripcion}
            `.trim();
            break;

        case 'error_subusuarios':
            asunto = `Reporte: Error con subusuarios (${nombre})`;
            cuerpoTexto = `
Usuario: ${nombre}
Correo: ${email}
Tipo: Error con subusuarios
Subusuario: ${subusuario}

Descripción:
${descripcion}
            `.trim();
            break;

        case 'error_cuenta':
            asunto = `Reporte: Error en cuenta (${nombre})`;
            cuerpoTexto = `
Usuario: ${nombre}
Correo: ${email}
Tipo: Error en cuenta

Descripción:
${descripcion}
            `.trim();
            break;

        case 'error_pagina':
            asunto = `Reporte: Error en página (${nombre})`;
            cuerpoTexto = `
Usuario: ${nombre}
Correo: ${email}
Tipo: Error en la página

Descripción:
${descripcion}
            `.trim();

            if (archivo) {
                adjuntos.push({
                    filename: archivo.originalname,
                    content: archivo.buffer,
                    contentType: archivo.mimetype,
                });
            }
            break;
    }

    const mailOptions = {
        from: `"AirGuard Soporte" <${process.env.MAIL_USER}>`,
        to: 'airguardcom@gmail.com',
        subject: asunto,
        text: cuerpoTexto,
        replyTo: email,
        attachments: adjuntos
    };

    await transporter.sendMail(mailOptions);
}

module.exports = {
    enviarCorreoBienvenida,
    enviarCorreoSoporte,
    enviarCorreoRecuperacion
};
