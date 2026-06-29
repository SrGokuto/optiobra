import pymysql

# Django 6 exige mysqlclient >= 2.2.1; PyMySQL se registra con esta versión.
pymysql.version_info = (2, 2, 1, 'final', 0)
pymysql.install_as_MySQLdb()