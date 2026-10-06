Cálculos en el servidor: Ignorar el perímetro y superficie enviados por el cliente garantiza la integridad de los datos. Evita que usuarios malintencionados o errores en el cliente guarden rectángulos con medidas matemáticamente imposibles.

Validaciones tempranas: Usar express-validator permite rechazar solicitudes incompletas o erróneas en la puerta de entrada. Esto ahorra procesamiento y evita que la base de datos intente ejecutar consultas que van a fallar.

Estándar REST: Se agruparon las acciones bajo una única ruta (/api/rectangulos) utilizando los métodos HTTP correspondientes (GET, POST, PUT, DELETE), lo que hace que la API sea predecible, ordenada y fácil de entender.