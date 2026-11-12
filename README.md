# Extractor de presupuestos a Excel

Aplicación de escritorio desarrollada en Python para automatizar la lectura de presupuestos desde páginas HTML y organizar la información obtenida en un archivo Excel.

> **Origen:** proyecto desarrollado durante una pasantía, adaptado para su publicación como portfolio. Se eliminó la dirección del sistema original. No incluye documentos, información de clientes ni credenciales de la organización.

## Funcionalidades

- Interfaz gráfica con **Tkinter** para seleccionar un rango de identificadores.
- Extracción y análisis de HTML mediante **Beautiful Soup**.
- Obtención de datos generales del presupuesto y de sus ensayos o servicios.
- Exportación a un libro Excel con dos hojas: **Presupuestos** y **Ensayos**.
- Tablas con formato e hipervínculos entre registros relacionados.
- Barra de progreso y registro de incidencias.
- Procesamiento en un hilo de trabajo para evitar bloquear la interfaz.
- Guardado de los datos recolectados y generación de respaldo si el archivo principal está bloqueado.

## Tecnologías

Python, Tkinter, Beautiful Soup, urllib, openpyxl, threading y queue.

## Requisitos

- Python 3.10 o superior (recomendado).
- Tkinter instalado. En algunas distribuciones Linux se instala aparte (`sudo apt install python3-tk`).
- Acceso **autorizado** a un endpoint compatible con el formato HTML esperado.

## Instalación

```bash
python -m venv .venv
# Linux / macOS:
source .venv/bin/activate
# Windows (PowerShell):
# .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
```

## Configuración y ejecución

Por seguridad, la URL del sistema original **no está incluida**. Antes de iniciar el programa, configurá la variable de entorno `PRESUPUESTOS_URL_BASE` con la dirección de un sistema propio o para el que tengas autorización expresa. Debe ser el prefijo de la URL, de modo que el programa pueda añadir el ID al final.

```bash
# Linux / macOS: ejemplo ficticio, no funcional
export PRESUPUESTOS_URL_BASE="https://ejemplo.invalid/presupuesto?id="
python scraper_presupuestos.py
```

En Windows PowerShell:

```powershell
$env:PRESUPUESTOS_URL_BASE = "https://ejemplo.invalid/presupuesto?id="
python scraper_presupuestos.py
```

Ingresá un ID inicial y final, y elegí **Ejecutar**. El programa generará `presupuestos.xlsx` en el directorio actual. Los archivos Excel se excluyen del repositorio mediante `.gitignore`.

## Consideraciones

- El parser está diseñado para una estructura HTML específica. Para usarlo en otros sistemas, habrá que adaptar los selectores.
- No se incluye una instancia de prueba ni se garantiza el funcionamiento con un sitio externo.
- Se debe respetar el permiso de acceso, las condiciones del sistema y la privacidad de los datos.
- En Linux, la apertura automática del archivo al finalizar puede no funcionar porque `os.startfile` es exclusivo de Windows. El Excel se guarda igualmente.
- El guardado agrega filas: **no implementa deduplicación automática** de identificadores ya procesados.
- La aplicación no implementa autenticación ni gestión de sesiones.

## Estructura

```text
scraper_presupuestos.py  # Interfaz, extracción y exportación
requirements.txt         # Dependencias externas
.gitignore               # Exclusión de resultados y archivos locales
README.md                # Documentación
```

## Privacidad

No subas archivos `.xlsx` generados durante la pasantía, capturas con información de clientes, credenciales o configuraciones internas de la organización.
