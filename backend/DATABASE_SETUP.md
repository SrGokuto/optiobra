# Setup Base de Datos MariaDB

## Requisitos

- MariaDB Server 10.3 o superior
- Cliente de MySQL/MariaDB
- Usuario con permisos administrativos

## Instalación

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install mariadb-server mariadb-client
sudo mysql_secure_installation
```

### macOS (Homebrew)
```bash
brew install mariadb
mysql_secure_installation
```

### Windows
Descargar desde https://mariadb.org/download/

## Creación de Base de Datos

### Opción 1: Usando script SQL

Crear archivo `setup_db.sql`:

```sql
-- Crear base de datos
CREATE DATABASE optiobra CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario
CREATE USER 'optiobra_user'@'localhost' IDENTIFIED BY '123456';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON optiobra.* TO 'optiobra_user'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Verificar
SELECT VERSION();
SHOW DATABASES;
```

Ejecutar:
```bash
mysql -u root -p < setup_db.sql
```

### Opción 2: Manual (línea por línea)

```bash
mysql -u root -p
```

Luego ejecutar:

```sql
CREATE DATABASE optiobra CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'optiobra_user'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON optiobra.* TO 'optiobra_user'@'localhost';
FLUSH PRIVILEGES;
exit;
```

## Verificar Conexión

```bash
mysql -u optiobra_user -p123456 -h 127.0.0.1 optiobra
```

Si conecta correctamente, ejecutar:
```sql
SELECT DATABASE();
SHOW TABLES;
exit;
```

## Configuración en Django

El archivo `settings.py` ya incluye:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'optiobra',
        'USER': 'optiobra_user',
        'PASSWORD': '123456',
        'HOST': '127.0.0.1',
        'PORT': '3306',
        'OPTIONS': {
            'charset': 'utf8mb4',
        }
    }
}
```

## Ejecutar Migraciones

```bash
python manage.py makemigrations
python manage.py migrate
```

## Estructura de Tablas

### Tabla: api_categoria
```
id                  INT PRIMARY KEY AUTO_INCREMENT
nombre              VARCHAR(100) UNIQUE NOT NULL
descripcion         LONGTEXT NULL
creado_en          DATETIME AUTO_NOW_ADD
actualizado_en     DATETIME AUTO_NOW
```

### Tabla: api_material
```
id                  INT PRIMARY KEY AUTO_INCREMENT
nombre              VARCHAR(255) NOT NULL
codigo              VARCHAR(50) UNIQUE NOT NULL
categoria_id        INT FOREIGN KEY
precio              DECIMAL(10,2) NOT NULL
cantidad            INT DEFAULT 0
unidad_medida       VARCHAR(50) DEFAULT 'unidad'
estado              VARCHAR(20) DEFAULT 'disponible'
proveedor           VARCHAR(255) NULL
creado_en          DATETIME AUTO_NOW_ADD
actualizado_en     DATETIME AUTO_NOW
creado_por_id      INT FOREIGN KEY (auth_user)
```

### Tabla: api_historialmaterial
```
id                  INT PRIMARY KEY AUTO_INCREMENT
material_id         INT FOREIGN KEY
accion              VARCHAR(20) NOT NULL
usuario_id          INT FOREIGN KEY (auth_user)
valores_anteriores  JSON NULL
valores_nuevos      JSON NULL
fecha               DATETIME AUTO_NOW_ADD
```

### Tabla: api_usuariosupabase
```
id                      INT PRIMARY KEY AUTO_INCREMENT
usuario_django_id       INT FOREIGN KEY UNIQUE (auth_user)
supabase_uid            VARCHAR(255) UNIQUE NOT NULL
email                   VARCHAR(254) NOT NULL
nombre_completo         VARCHAR(255)
rol                     VARCHAR(50) DEFAULT 'usuario'
activo                  BOOLEAN DEFAULT TRUE
creado_en              DATETIME AUTO_NOW_ADD
actualizado_en         DATETIME AUTO_NOW
```

## Índices Automáticos

Django crea índices automáticamente en:
- Campos FOREIGN KEY
- Campos UNIQUE
- Campos con `db_index=True`

Índices adicionales creados:
```sql
CREATE INDEX idx_api_material_codigo ON api_material(codigo);
CREATE INDEX idx_api_material_categoria ON api_material(categoria_id);
CREATE INDEX idx_api_material_estado ON api_material(estado);
CREATE INDEX idx_api_historialmaterial_fecha ON api_historialmaterial(fecha);
```

## Backup y Restore

### Crear Backup
```bash
mysqldump -u optiobra_user -p123456 optiobra > backup.sql
```

### Restaurar Backup
```bash
mysql -u optiobra_user -p123456 optiobra < backup.sql
```

### Backup automático (diario)
```bash
#!/bin/bash
BACKUP_DIR="/backups/optiobra"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u optiobra_user -p123456 optiobra > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*" -mtime +7 -delete  # Borrar backups > 7 días
```

## Monitoreo

### Ver tamaño de base de datos
```sql
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'optiobra'
ORDER BY size_mb DESC;
```

### Ver conexiones activas
```sql
SHOW PROCESSLIST;
```

### Ver variables importantes
```sql
SHOW VARIABLES LIKE 'max_connections';
SHOW VARIABLES LIKE 'innodb%';
```

## Mantenimiento

### Optimizar tablas (mensualmente)
```bash
mysql -u optiobra_user -p123456 optiobra -e "OPTIMIZE TABLE api_material, api_categoria, api_historialmaterial, api_usuariosupabase;"
```

### Reparar tablas (si hay corrupción)
```bash
mysql -u optiobra_user -p123456 optiobra -e "REPAIR TABLE api_material;"
```

### Limpiar logs binarios (si es necesario)
```sql
PURGE BINARY LOGS BEFORE DATE_SUB(NOW(), INTERVAL 10 DAY);
```

## Troubleshooting

### Error: "Can't connect to MySQL server"
1. Verificar que MariaDB está corriendo: `systemctl status mariadb`
2. Iniciar si está detenido: `sudo systemctl start mariadb`
3. Verificar configuración de conexión en settings.py

### Error: "Access denied for user"
```bash
# Reset password
mysql -u root
FLUSH PRIVILEGES;
ALTER USER 'optiobra_user'@'localhost' IDENTIFIED BY '123456';
FLUSH PRIVILEGES;
exit;
```

### Error: "Specified key was too long"
Asegurarse que la base de datos usa utf8mb4:
```sql
ALTER DATABASE optiobra CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Error: "Unknown character set"
Usar utf8mb4 en lugar de utf8

## Caracteres especiales

La configuración usa `utf8mb4` para soportar:
- Caracteres especiales (ñ, é, etc.)
- Emojis
- Caracteres de múltiples idiomas

## Performance

### Consultas lentas
Habilitar slow query log en `/etc/mysql/mariadb.conf.d/50-server.cnf`:
```
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 2
```

### Tuning
Para servidores con < 1GB RAM:
```sql
SET GLOBAL max_connections = 100;
SET GLOBAL innodb_buffer_pool_size = 256M;
```

---

**OptiObra Database Setup** 📊
