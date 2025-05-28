package com.example.airguard

import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class WelcomeActivity : AppCompatActivity() {

    private lateinit var prefs: SharedPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        Toast.makeText(this, "Entrando a WelcomeActivity", Toast.LENGTH_SHORT).show()

        prefs = getSharedPreferences("MyPrefs", MODE_PRIVATE)

        // Solo para pruebas (reinicia preferencias)
        // prefs.edit().clear().apply()

        val isFirstTime = prefs.getBoolean("firstTime", true)
        Toast.makeText(this, "isFirstTime = $isFirstTime", Toast.LENGTH_SHORT).show()

        if (!isFirstTime) {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
            return
        }

        setContentView(R.layout.activity_welcome)

        val continueButton = findViewById<Button>(R.id.btn_continue)
        if (continueButton == null) {
            Toast.makeText(this, "Botón no encontrado", Toast.LENGTH_LONG).show()
            return
        }

        continueButton.setOnClickListener {
            prefs.edit().putBoolean("firstTime", false).apply()
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }
    }
}