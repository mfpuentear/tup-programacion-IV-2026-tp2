# Trabajo Práctico N.° 2 - Programación IV
**Universidad Tecnológica Nacional – Facultad Regional La Rioja**  
**Tecnicatura Universitaria en Programación**  
**Estudiante:** Federico Merlo Brac  
**Rama de entrega:** `MerloBracFederico`

---

## 📋 Resumen de Ejercicios Entregados

| Ejercicio | Descripción | Base de Datos | Puerto | Recursos Principales | Documentación |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **[Ejercicio 1](file:///c:/Users/Usuario/Desktop/tp2%20prog4/tup-programacion-IV-2026-tp2/Merlo%20Brac,%20Federico/Ejercicio%201)** | Administración de Rectángulos (Cálculo exclusivo de perímetro y superficie en servidor) | `tp2_ejercicio1` | `3001` | `/api/rectangulos` | [README Ejercicio 1](file:///c:/Users/Usuario/Desktop/tp2%20prog4/tup-programacion-IV-2026-tp2/Merlo%20Brac,%20Federico/Ejercicio%201/README.md) |
| **[Ejercicio 2](file:///c:/Users/Usuario/Desktop/tp2%20prog4/tup-programacion-IV-2026-tp2/Merlo%20Brac,%20Federico/Ejercicio%202)** | Lista de Tareas (Control de nombres únicos y filtrado por estado completadas/pendientes) | `tp2_ejercicio2` | `3002` | `/api/tareas` | [README Ejercicio 2](file:///c:/Users/Usuario/Desktop/tp2%20prog4/tup-programacion-IV-2026-tp2/Merlo%20Brac,%20Federico/Ejercicio%202/README.md) |
| **[Ejercicio 3](file:///c:/Users/Usuario/Desktop/tp2%20prog4/tup-programacion-IV-2026-tp2/Merlo%20Brac,%20Federico/Ejercicio%203)** | Calificaciones de Alumnos (Relación foránea con materias, exactamente 3 notas y unicidad alumno-materia) | `tp2_ejercicio3` | `3003` | `/api/calificaciones`<br>`/api/materias` | [README Ejercicio 3](file:///c:/Users/Usuario/Desktop/tp2%20prog4/tup-programacion-IV-2026-tp2/Merlo%20Brac,%20Federico/Ejercicio%203/README.md) |

---

## 🚀 Guía de Inicialización Rápida

Cada ejercicio es independiente y cuenta con su propio puerto, lo que permite ejecutarlos en simultáneo abriendo terminales independientes.

### 1. Configuración de Credenciales de Base de Datos
En cada subcarpeta (`Ejercicio 1`, `Ejercicio 2`, `Ejercicio 3`) se encuentra un archivo `.env` para indicar las credenciales de MySQL:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña_aqui
```

---

### 2. Inicialización en PowerShell (Windows)

#### Ejercicio 1: Rectángulos (Puerto 3001)
```powershell
cd "Merlo Brac, Federico\Ejercicio 1"
npm install
npm run init-db    # Crea automáticamente la BD y la tabla
npm start          # Servidor en http://localhost:3001
```

#### Ejercicio 2: Tareas (Puerto 3002)
```powershell
cd "Merlo Brac, Federico\Ejercicio 2"
npm install
npm run init-db
npm start          # Servidor en http://localhost:3002
```

#### Ejercicio 3: Calificaciones (Puerto 3003)
```powershell
cd "Merlo Brac, Federico\Ejercicio 3"
npm install
npm run init-db
npm start          # Servidor en http://localhost:3003
```

---

### 3. Inicialización en Bash / Git Bash

#### Ejercicio 1: Rectángulos (Puerto 3001)
```bash
cd "Merlo Brac, Federico/Ejercicio 1"
npm install
npm run init-db
npm start
```

#### Ejercicio 2: Tareas (Puerto 3002)
```bash
cd "Merlo Brac, Federico/Ejercicio 2"
npm install
npm run init-db
npm start
```

#### Ejercicio 3: Calificaciones (Puerto 3003)
```bash
cd "Merlo Brac, Federico/Ejercicio 3"
npm install
npm run init-db
npm start
```

---

## 🧪 Pruebas de la API

1. **Archivos `.http` representativos:**
   - [Ejercicio 1: ejercicio1.http](file:///c:/Users/Usuario/Desktop/tp2%20prog4/tup-programacion-IV-2026-tp2/Merlo%20Brac,%20Federico/Ejercicio%201/ejercicio1.http)
   - [Ejercicio 2: ejercicio2.http](file:///c:/Users/Usuario/Desktop/tp2%20prog4/tup-programacion-IV-2026-tp2/Merlo%20Brac,%20Federico/Ejercicio%202/ejercicio2.http)
   - [Ejercicio 3: ejercicio3.http](file:///c:/Users/Usuario/Desktop/tp2%20prog4/tup-programacion-IV-2026-tp2/Merlo%20Brac,%20Federico/Ejercicio%203/ejercicio3.http)
   *(Compatibles con las extensiones REST Client de VS Code y Thunder Client)*.

2. **Suites de Pruebas Automatizadas:**
   En cualquiera de los ejercicios se puede ejecutar:
   ```bash
   npm test
   ```

3. **Panel Web Interactivo:**
   Al abrir la ruta raíz en el navegador (`http://localhost:3001/`, `http://localhost:3002/` o `http://localhost:3003/`), se despliega una interfaz web con accesos directos interactivos a cada recurso de la API.
