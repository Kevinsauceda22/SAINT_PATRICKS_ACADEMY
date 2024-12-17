-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-12-2024 a las 10:00:02
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `saintpatrickacademy`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `actualizarActividadAcademica` (IN `Cod_actividad_academica` INT, IN `Cod_profesor` INT, IN `Cod_ponderacion_ciclo` INT, IN `Cod_parcial` INT, IN `Nombre_actividad_academica` VARCHAR(100), IN `Descripcion` VARCHAR(255), IN `Fechayhora_Inicio` DATETIME, IN `Fechayhora_Fin` DATETIME, IN `Valor` DECIMAL(5,2), IN `Cod_secciones` INT, IN `Cod_seccion_asignatura` INT)   BEGIN
    UPDATE tbl_actividades_academicas
    SET 
        Cod_profesor = Cod_profesor,
        Cod_ponderacion_ciclo = Cod_ponderacion_ciclo,
        Cod_parcial = Cod_parcial,
        Nombre_actividad_academica = Nombre_actividad_academica,
        Descripcion = Descripcion,
        Fechayhora_Inicio = Fechayhora_Inicio,
        Fechayhora_Fin = Fechayhora_Fin,
        Valor = Valor,
        Cod_secciones = Cod_secciones
    WHERE Cod_actividad_academica = Cod_actividad_academica;

    UPDATE tbl_actividades_asignatura
    SET 
        Cod_seccion_asignatura = Cod_seccion_asignatura
    WHERE Cod_actividad_academica = Cod_actividad_academica;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ActualizarConceptoPago` (IN `p_Cod_concepto` INT, IN `p_Concepto` VARCHAR(255), IN `p_Descripcion` VARCHAR(100), IN `p_Activo` ENUM('Si','No'))   BEGIN
    UPDATE tbl_concepto_pago 
    SET Concepto = p_Concepto,
        Descripcion = p_Descripcion,
        Activo = p_Activo
    WHERE Cod_concepto = p_Cod_concepto;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `actualizarSeccionAsignatura` (IN `id` INT, IN `Cod_secciones` INT, IN `Hora_inicio` TIME, IN `Hora_fin` TIME, IN `Cod_grados_asignaturas` INT)   BEGIN
    UPDATE tbl_seccion_asignatura
    SET 
        Cod_secciones = Cod_secciones,
        Hora_inicio = Hora_inicio,
        Hora_fin = Hora_fin,
        Cod_grados_asignaturas = Cod_grados_asignaturas
    WHERE Cod_seccion_asignatura = id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `actualizarYAplicarDescuento` (IN `p_Cod_descuento` INT, IN `p_nombre_descuento` VARCHAR(255), IN `p_valor` DECIMAL(10,2), IN `p_fecha_inicio` DATE, IN `p_fecha_fin` DATE, IN `p_descripcion` VARCHAR(255))   BEGIN
    DECLARE v_valor_anterior DECIMAL(10, 2);
    DECLARE v_Cod_caja INT;

    -- Obtener el valor anterior del descuento
    SELECT valor INTO v_valor_anterior
    FROM tbl_descuentos
    WHERE cod_descuento = p_Cod_descuento;

    -- Actualizar el descuento en la tabla tbl_descuentos
    UPDATE tbl_descuentos
    SET 
        nombre_descuento = p_nombre_descuento,
        valor = p_valor,
        fecha_inicio = p_fecha_inicio,
        fecha_fin = p_fecha_fin,
        descripcion = p_descripcion
    WHERE cod_descuento = p_Cod_descuento;

    -- Obtener el último Cod_caja insertado
    SELECT Cod_caja INTO v_Cod_caja 
    FROM tbl_caja 
    ORDER BY Cod_caja DESC 
    LIMIT 1;

    -- Ajustar el monto en tbl_caja solo si el nuevo valor es diferente al anterior
    IF v_valor_anterior IS NOT NULL AND v_Cod_caja IS NOT NULL THEN
        -- Calcular la diferencia
        SET @diferencia = p_valor - v_valor_anterior;

        -- Solo actualizar si la diferencia es positiva
        IF @diferencia > 0 THEN
            UPDATE tbl_caja
            SET Monto = Monto - @diferencia
            WHERE Cod_caja = v_Cod_caja;
        END IF;
    END IF;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `actualizar_descuento` (IN `p_Cod_descuento` INT, IN `p_nombre_descuento` VARCHAR(255), IN `p_valor` DECIMAL(10,2), IN `p_fecha_inicio` DATE, IN `p_fecha_fin` DATE, IN `p_descripcion` VARCHAR(255))   BEGIN
    -- Actualizar un descuento existente en la tabla tbl_descuentos
    UPDATE tbl_descuentos
    SET 
        nombre_descuento = p_nombre_descuento,
        valor = p_valor,
        fecha_inicio = p_fecha_inicio,
        fecha_fin = p_fecha_fin,
        descripcion = p_descripcion
    WHERE cod_descuento = p_Cod_descuento;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `actualizar_descuento_automatico` ()   BEGIN
    DECLARE v_Cod_descuento INT;
    DECLARE v_valor_descuento DECIMAL(10, 2);
    DECLARE v_Cod_caja INT;

    SELECT cod_caja INTO v_Cod_caja 
    FROM tbl_caja 
    ORDER BY cod_caja DESC 
    LIMIT 1;

    SELECT cod_descuento, valor INTO v_Cod_descuento, v_valor_descuento
    FROM tbl_descuentos  
    ORDER BY cod_descuento DESC  
    LIMIT 1;

    IF v_valor_descuento IS NOT NULL THEN
        UPDATE tbl_caja
        SET monto = monto - v_valor_descuento
        WHERE cod_caja = v_Cod_caja;

        UPDATE tbl_caja_descuento
        SET cod_descuento = v_Cod_descuento
        WHERE cod_caja = v_Cod_caja;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No hay descuentos válidos disponibles.';
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `actualizar_estado_citas` ()   BEGIN
    -- Actualizar citas finalizadas
    UPDATE tbl_solicitud
    SET Estado = 'Finalizada'
    WHERE CONCAT(Fecha_solicitud, ' ', Hora_Fin) <= NOW()
      AND Estado != 'Finalizada';

    -- Actualizar citas pendientes
    UPDATE tbl_solicitud
    SET Estado = 'Activo'
    WHERE CONCAT(Fecha_solicitud, ' ', Hora_Inicio) > NOW()
      AND Estado != 'Activo';
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `actualizar_estado_profesor` (IN `p_cod_profesor` INT, IN `p_estado` TINYINT(1))   BEGIN
    -- Verificar si el ID del profesor existe
    IF EXISTS (SELECT 1 FROM tbl_profesores WHERE Cod_profesor = p_cod_profesor) THEN
        -- Actualizar el estado del profesor
        UPDATE tbl_profesores
        SET estado = p_estado
        WHERE Cod_profesor = p_cod_profesor;
        
        -- Devolver mensaje de éxito
        SELECT 'Estado actualizado exitosamente' AS mensaje;
    ELSE
        -- Devolver mensaje de error si el profesor no existe
        SELECT 'Profesor no encontrado' AS mensaje;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `actualizar_matricula` (IN `p_Cod_matricula` INT, IN `p_fecha_matricula` DATE, IN `p_Cod_persona` INT, IN `p_tipo_estado` VARCHAR(255), IN `p_Fecha_inicio` DATE, IN `p_Fecha_fin` DATE, IN `p_anio_academico` INT, IN `p_tipo_matricula` VARCHAR(255), IN `p_Codificacion_matricula` VARCHAR(255), IN `p_Tipo_transaccion` VARCHAR(50), IN `p_Monto` DECIMAL(10,2), IN `p_Descripcion_caja` VARCHAR(255), IN `p_Cod_concepto` INT)   BEGIN
    DECLARE v_Cod_estado_matricula INT;
    DECLARE v_Cod_periodo_matricula INT;
    DECLARE v_Cod_tipo_matricula INT;

    -- Actualizar tbl_estado_matricula
    INSERT INTO tbl_estado_matricula (tipo)
    VALUES (p_tipo_estado)
    ON DUPLICATE KEY UPDATE tipo = p_tipo_estado;

    SET v_Cod_estado_matricula = LAST_INSERT_ID();

    -- Actualizar tbl_periodo_matricula
    INSERT INTO tbl_periodo_matricula (Fecha_inicio, Fecha_fin, anio_academico)
    VALUES (p_Fecha_inicio, p_Fecha_fin, p_anio_academico)
    ON DUPLICATE KEY UPDATE Fecha_inicio = p_Fecha_inicio, Fecha_fin = p_Fecha_fin, anio_academico = p_anio_academico;

    SET v_Cod_periodo_matricula = LAST_INSERT_ID();

    -- Actualizar tbl_tipo_matricula
    INSERT INTO tbl_tipo_matricula (tipo)
    VALUES (p_tipo_matricula)
    ON DUPLICATE KEY UPDATE tipo = p_tipo_matricula;

    SET v_Cod_tipo_matricula = LAST_INSERT_ID();

    -- Actualizar en tbl_caja
    UPDATE tbl_caja
    SET Fecha = CURRENT_DATE, 
        Tipo_transaccion = p_Tipo_transaccion, 
        Monto = p_Monto, 
        Descripcion = p_Descripcion_caja, 
        Cod_persona = p_Cod_persona, 
        Cod_concepto = p_Cod_concepto
    WHERE Cod_caja = (SELECT Cod_caja FROM tbl_matricula WHERE Cod_matricula = p_Cod_matricula);

    -- Actualizar en tbl_matricula
    UPDATE tbl_matricula
    SET fecha_matricula = p_fecha_matricula, 
        Codificacion_matricula = p_Codificacion_matricula, -- Agregado el campo Codificacion_matricula
        Cod_periodo_matricula = v_Cod_periodo_matricula, 
        Cod_persona = p_Cod_persona, 
        Cod_tipo_matricula = v_Cod_tipo_matricula, 
        Cod_estado_matricula = v_Cod_estado_matricula
    WHERE Cod_matricula = p_Cod_matricula;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `actualizar_solicitud` (IN `p_Cod_solicitud` INT, IN `p_Cod_persona` INT, IN `p_Nombre_solicitud` VARCHAR(255), IN `p_Fecha_solicitud` DATE, IN `p_Hora_Inicio` TIME, IN `p_Hora_Fin` TIME, IN `p_Asunto` VARCHAR(255), IN `p_Persona_requerida` VARCHAR(255), IN `p_estado` ENUM('Pendiente','Finalizada','Cancelada','Activo'), IN `p_motivoCancelacion` VARCHAR(255))   BEGIN
  DECLARE estado_actualizado ENUM('Pendiente', 'Finalizada', 'Cancelada', 'Activo');

  -- Determinar el estado actualizado
  IF p_estado = 'Cancelada' THEN
    SET estado_actualizado = 'Cancelada';
  ELSE
    IF CONCAT(p_Fecha_solicitud, ' ', COALESCE(p_Hora_Fin, '23:59:59')) <= NOW() THEN
      SET estado_actualizado = 'Finalizada';
    ELSE
      SET estado_actualizado = 'Activo';
    END IF;
  END IF;

  -- Actualizar la solicitud
  UPDATE tbl_solicitud
  SET
    Cod_persona = p_Cod_persona,
    Nombre_solicitud = p_Nombre_solicitud,
    Fecha_solicitud = p_Fecha_solicitud,
    Hora_Inicio = p_Hora_Inicio,
    Hora_Fin = p_Hora_Fin,
    Asunto = p_Asunto,
    Persona_requerida = p_Persona_requerida,
    Estado = estado_actualizado,
    MotivoCancelacion = CASE 
                          WHEN estado_actualizado = 'Cancelada' THEN p_motivoCancelacion
                          ELSE NULL
                        END -- Solo actualiza el motivo si está cancelada
  WHERE Cod_solicitud = p_Cod_solicitud;

  -- Retornar el número de filas afectadas y el estado actualizado
  SELECT ROW_COUNT() AS affectedRows, estado_actualizado AS updatedState;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `agregarContacto` (IN `p_cod_persona` INT, IN `p_valor` VARCHAR(255), IN `p_cod_tipo_contacto` INT)   BEGIN
    -- Inserta un nuevo contacto en tbl_contacto
    INSERT INTO tbl_contacto (
        cod_persona,
        Valor,
        cod_tipo_contacto
    ) 
    VALUES (
        p_cod_persona,
        p_valor,
        p_cod_tipo_contacto
    );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `aplicar_descuento_automatico` ()   BEGIN
    DECLARE v_Cod_descuento INT;
    DECLARE v_valor_descuento DECIMAL(10, 2);
    DECLARE v_Cod_caja INT;

    SELECT Cod_caja INTO v_Cod_caja 
    FROM tbl_caja 
    ORDER BY Cod_caja DESC 
    LIMIT 1;

    SELECT Cod_descuento, Valor INTO v_Cod_descuento, v_valor_descuento
    FROM tbl_descuentos  
    ORDER BY Cod_descuento DESC  
    LIMIT 1;

    IF v_valor_descuento IS NOT NULL THEN
        UPDATE tbl_caja
        SET Monto = Monto - v_valor_descuento
        WHERE Cod_caja = v_Cod_caja;

        INSERT INTO tbl_caja_descuento (Cod_caja, Cod_descuento)
        VALUES (v_Cod_caja, v_Cod_descuento);
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No hay descuentos válidos disponibles.';
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `AsignarPermiso` (IN `p_Cod_objeto` INT, IN `p_Cod_rol` INT, IN `p_Permiso_insercion` ENUM('Y','N'), IN `p_Permiso_eliminacion` ENUM('Y','N'), IN `p_Permiso_actualizacion` ENUM('Y','N'), IN `p_Permiso_consultar` ENUM('Y','N'))   BEGIN
    -- Verificar si ya existe un registro de permisos para el rol y el objeto especificado
    IF EXISTS (
        SELECT 1 FROM tbl_permisos 
        WHERE Cod_objeto = p_Cod_objeto AND Cod_rol = p_Cod_rol
    ) THEN
        -- Si el registro ya existe, actualizar los permisos
        UPDATE tbl_permisos
        SET 
            Permiso_insercion = p_Permiso_insercion,
            Permiso_eliminacion = p_Permiso_eliminacion,
            Permiso_actualizacion = p_Permiso_actualizacion,
            Permiso_consultar = p_Permiso_consultar
        WHERE Cod_objeto = p_Cod_objeto AND Cod_rol = p_Cod_rol;
    ELSE
        -- Si el registro no existe, insertar un nuevo registro de permisos
        INSERT INTO tbl_permisos (
            Cod_objeto, Cod_rol, Permiso_insercion, 
            Permiso_eliminacion, Permiso_actualizacion, Permiso_consultar
        )
        VALUES (
            p_Cod_objeto, p_Cod_rol, p_Permiso_insercion, 
            p_Permiso_eliminacion, p_Permiso_actualizacion, p_Permiso_consultar
        );
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `CalcularPromedioPorParcial` (IN `p_cod_seccion_asignatura` INT)   BEGIN
    -- Variable para almacenar el umbral de aprobación
    DECLARE umbral_aprobacion DECIMAL(10, 2);

    -- Obtener el valor del parámetro 'UMBRAL_APROBACION' de la tabla tbl_parametros
    SELECT `Valor` 
    INTO umbral_aprobacion
    FROM `tbl_parametros`
    WHERE `Parametro` = 'UMBRAL_APROBACION'
    LIMIT 1;

    -- Crear una tabla temporal para almacenar las sumatorias por estudiante y parcial
    CREATE TEMPORARY TABLE TempSumatoriasEstudiante (
        CodSeccionMatricula INT,
        CodParcial INT,
        NombreParcial VARCHAR(50),
        Sumatoria DECIMAL(10, 2)
    );

    -- Calcular las sumatorias de las notas por estudiante y parcial
    INSERT INTO TempSumatoriasEstudiante (CodSeccionMatricula, CodParcial, NombreParcial, Sumatoria)
    SELECT 
        n.Cod_seccion_matricula,
        n.Cod_parcial,
        p.Nombre_parcial,
        SUM(n.Nota) AS Sumatoria
    FROM 
        tbl_notas n
    INNER JOIN 
        tbl_actividades_asignatura aa ON n.Cod_actividad_asignatura = aa.Cod_actividad_asignatura
    INNER JOIN 
        tbl_parciales p ON n.Cod_parcial = p.Cod_parcial
    WHERE 
        aa.Cod_seccion_asignatura = p_cod_seccion_asignatura
    GROUP BY 
        n.Cod_seccion_matricula, n.Cod_parcial;

    -- Retornar resultados detallados por parcial
    SELECT 
        CodParcial,
        NombreParcial,
        ROUND(AVG(Sumatoria), 2) AS PromedioGeneral,
        SUM(CASE WHEN Sumatoria >= umbral_aprobacion THEN 1 ELSE 0 END) AS TotalAprobados,
        SUM(CASE WHEN Sumatoria < umbral_aprobacion THEN 1 ELSE 0 END) AS TotalReprobados
    FROM 
        TempSumatoriasEstudiante
    GROUP BY 
        CodParcial, NombreParcial;

    -- Limpiar la tabla temporal
    DROP TEMPORARY TABLE TempSumatoriasEstudiante;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `CrearMatriculaSaintPatrickAcademy` (IN `p_dni_padre` VARCHAR(20), IN `p_fecha_matricula` DATE, IN `p_cod_grado` INT, IN `p_cod_seccion` INT, IN `p_cod_estado_matricula` INT, IN `p_cod_periodo_matricula` INT, IN `p_cod_tipo_matricula` INT, IN `p_cod_hijo` INT, OUT `mensaje` VARCHAR(100))   BEGIN
    DECLARE cod_padre INT;
    DECLARE seccion_valida INT DEFAULT 0;
    DECLARE anio VARCHAR(4);
    DECLARE secuencia INT;
    DECLARE nuevo_codificacion_matricula VARCHAR(20);
    DECLARE cod_caja INT;

    -- Obtener el Cod_persona del padre usando su DNI
    SELECT cod_persona INTO cod_padre
    FROM tbl_personas
    WHERE dni_persona = p_dni_padre;

    -- Verificar si el padre existe
    IF cod_padre IS NULL THEN
        SET mensaje = 'No se encontró un padre con el DNI proporcionado.';
    ELSE
        -- Validar la sección y grado
        SELECT COUNT(*) INTO seccion_valida
        FROM tbl_secciones
        WHERE Cod_secciones = p_cod_seccion AND Cod_grado = p_cod_grado;

        IF seccion_valida = 0 THEN
            SET mensaje = 'La sección especificada no corresponde al grado seleccionado.';
        ELSE
            -- Verificar si el hijo ya está matriculado en este período
            IF EXISTS (
                SELECT 1 
                FROM tbl_matricula
                WHERE cod_persona = p_cod_hijo
                AND Cod_periodo_matricula = p_cod_periodo_matricula
            ) THEN
                SET mensaje = 'El hijo ya tiene una matrícula registrada en este período.';
            ELSE
                -- Calcular el valor de codificacion_matricula
                SET anio = YEAR(p_fecha_matricula);
                SELECT IFNULL(MAX(CAST(SUBSTRING_INDEX(codificacion_matricula, '-', -1) AS UNSIGNED)), 0) + 1
                INTO secuencia
                FROM tbl_matricula
                WHERE codificacion_matricula LIKE CONCAT('SPA-', anio, '-%');

                SET nuevo_codificacion_matricula = CONCAT('SPA-', anio, '-', LPAD(secuencia, 4, '0'));

                -- Crear registro provisional en TBL_CAJA con Estado_pago = 'Pendiente'
                INSERT INTO tbl_caja (Fecha, Tipo_transaccion, Monto, Descripcion, Cod_persona, Cod_concepto, Estado_pago)
                VALUES (NOW(), NULL, NULL, NULL, cod_padre, NULL, 'Pendiente');

                -- Obtener el Cod_caja generado
                SET cod_caja = LAST_INSERT_ID();

                -- Insertar la matrícula
                INSERT INTO tbl_matricula (
                    fecha_matricula, 
                    cod_persona,               
                    Cod_estado_matricula, 
                    Cod_periodo_matricula, 
                    Cod_tipo_matricula,
                    codificacion_matricula,
                    Cod_caja
                )
                VALUES (
                    p_fecha_matricula, 
                    p_cod_hijo,                   
                    p_cod_estado_matricula, 
                    p_cod_periodo_matricula, 
                    p_cod_tipo_matricula,
                    nuevo_codificacion_matricula,
                    cod_caja
                );

                -- Insertar en tbl_secciones_matricula
                INSERT INTO tbl_secciones_matricula (
                    Cod_matricula, 
                    Cod_seccion, 
                    Cod_persona,                
                    Cod_grado
                )
                VALUES (
                    LAST_INSERT_ID(), 
                    p_cod_seccion, 
                    p_cod_hijo,                    
                    p_cod_grado
                );

                -- Mensaje de éxito
                SET mensaje = CONCAT('Matrícula creada exitosamente: ', nuevo_codificacion_matricula, ' | Caja: ', cod_caja);
            END IF;
        END IF;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `crearPersona` (IN `dni_persona` VARCHAR(20), IN `Nombre` TEXT, IN `Segundo_nombre` TEXT, IN `Primer_apellido` TEXT, IN `Segundo_apellido` TEXT, IN `Nacionalidad` VARCHAR(50), IN `direccion_persona` VARCHAR(100), IN `fecha_nacimiento` DATE, IN `Estado_Persona` CHAR(1), IN `cod_tipo_persona` INT, IN `cod_departamento` INT, IN `cod_genero` INT)   BEGIN
    INSERT INTO tbl_personas (dni_persona, Nombre, Segundo_nombre, Primer_apellido, Segundo_apellido, Nacionalidad, direccion_persona, fecha_nacimiento, Estado_Persona, cod_tipo_persona, cod_departamento, cod_genero)
    VALUES (dni_persona, Nombre, Segundo_nombre, Primer_apellido, Segundo_apellido, Nacionalidad, direccion_persona, fecha_nacimiento, Estado_Persona, cod_tipo_persona, cod_departamento, cod_genero);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `crearSeccionAsignatura` (IN `Cod_secciones` INT, IN `Hora_inicio` TIME, IN `Hora_fin` TIME, IN `Cod_grados_asignaturas` INT)   BEGIN
    INSERT INTO tbl_secciones_asignaturas (Cod_secciones, Hora_inicio, Hora_fin, Cod_grados_asignaturas)
    VALUES (Cod_secciones, Hora_inicio, Hora_fin, Cod_grados_asignaturas);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `crearUsuario` (IN `nombre_usuario` VARCHAR(50), IN `correo_usuario` VARCHAR(100), IN `contraseña_usuario` VARCHAR(255), IN `cod_estado_usuario` INT, IN `token_usuario` VARCHAR(255), IN `cod_persona` INT, IN `cod_rol` INT, IN `primer_ingreso` DATE)   BEGIN
    -- Si primer_ingreso es NULL, se establece a la fecha actual
    IF primer_ingreso IS NULL THEN
        SET primer_ingreso = CURDATE();
    END IF;

    INSERT INTO tbl_usuarios (nombre_usuario, correo_usuario, contraseña_usuario, cod_estado_usuario, token_usuario, cod_persona, cod_rol, Primer_ingreso)
    VALUES (nombre_usuario, correo_usuario, contraseña_usuario, cod_estado_usuario, token_usuario, cod_persona, cod_rol, primer_ingreso);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `create_seccion` (IN `p_Nombre_seccion` VARCHAR(30))   BEGIN
    INSERT INTO tbl_secciones (Nombre_seccion) VALUES (p_Nombre_seccion);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_actividad_academica` (IN `p_Cod_actividad_academica` INT)   BEGIN
    DELETE FROM tbl_actividades_academicas WHERE Cod_actividad_academica = p_Cod_actividad_academica;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_asignatura` (IN `p_Cod_asignatura` INT)   BEGIN  
    -- Eliminar la asignatura que coincida con los parámetros dados
    DELETE FROM tbl_asignaturas  
    WHERE Cod_asignatura = p_Cod_asignatura;  

    -- Comprobar si se eliminó alguna fila
    IF ROW_COUNT() = 0 THEN  
        SIGNAL SQLSTATE '45000'  
        SET MESSAGE_TEXT = 'No se encontró ninguna asignatura con esos datos.';  
    END IF;  
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_asistencia` (IN `p_Cod_asistencias` INT)   BEGIN
    -- Verificar que la asistencia exista
    IF (SELECT COUNT(*) FROM tbl_asistencias WHERE Cod_asistencias = p_Cod_asistencias) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La asistencia con el código especificado no existe';
    END IF;


   -- Registrar la eliminación en una tabla de auditoría (opcional)
    /*
    INSERT INTO tbl_auditoria_eliminaciones (Cod_asistencias, Fecha_eliminacion)
    VALUES (p_Cod_asistencias, NOW());
    */

    DELETE FROM tbl_asistencias WHERE Cod_asistencias = p_Cod_asistencias;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_ciclos` (IN `p_Cod_ciclo` INT(11))   DELETE FROM tbl_ciclos
WHERE Cod_ciclo = p_Cod_ciclo$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_especialidad` (IN `p_Cod_Especialidad` INT)   BEGIN
    DELETE FROM tbl_especialidades
    WHERE Cod_Especialidad = p_Cod_Especialidad; -- Asegúrate de que el Cod_Especialidad está correcto
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_estado_asistencia` (IN `p_Cod_estado_asistencia` INT)   BEGIN
 -- Verificar que la asistencia exista
    IF (SELECT COUNT(*) FROM tbl_estado_asistencia WHERE Cod_estado_asistencia = p_Cod_estado_asistencia) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El estado asistencia con el código especificado no existe';
    END IF;

    DELETE FROM tbl_estado_asistencia WHERE Cod_estado_asistencia = p_Cod_estado_asistencia;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_estado_nota` (IN `p_Cod_estado` INT)   BEGIN
    -- Validación
    IF NOT EXISTS (SELECT 1 FROM tbl_estado_nota WHERE Cod_estado = p_Cod_estado) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El Código de Estado no existe';
    END IF;

    -- Eliminación de datos
    DELETE FROM tbl_estado_nota WHERE Cod_estado = p_Cod_estado;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_grados` (IN `p_Cod_grado` INT(11))   DELETE FROM tbl_grados
WHERE Cod_grado = p_Cod_grado$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_grado_academico` (IN `p_Cod_grado_academico` INT)   BEGIN
    DELETE FROM tbl_grado_academico
    WHERE Cod_grado_academico = p_Cod_grado_academico;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_grado_asignaturas` (IN `Cod_grados_asignaturas_input` INT)   BEGIN  
    DELETE FROM tbl_grados_asignaturas  
    WHERE Cod_grados_asignaturas = Cod_grados_asignaturas_input;  

    IF ROW_COUNT() = 0 THEN  
        SIGNAL SQLSTATE '45000'  
        SET MESSAGE_TEXT = 'No se encontró ninguna asignatura en este grado con esos datos.';  
    END IF;  
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `DELETE_HISTORIAL` (IN `p_Cod_historial_academico` INT(11))   BEGIN
    DELETE FROM tbl_historiales_academicos
    WHERE Cod_historial_academico = p_Cod_historial_academico;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_instituto` (IN `p_cod_instituto` INT)  NO SQL DELETE FROM tbl_institutos
    WHERE Cod_Instituto = p_cod_instituto$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_parcial` (IN `p_Cod_parcial` INT(11))   BEGIN 
	-- Eliminar la asignatura que coincida con los parámetros dados 
	DELETE FROM tbl_parciales 
	WHERE Cod_parcial = p_Cod_parcial; 

	-- Comprobar si se eliminó alguna fila 
	IF ROW_COUNT() = 0 THEN 
		SIGNAL SQLSTATE '45000' 
		SET MESSAGE_TEXT = 'No se encontró ningún parcial con esos datos.'; 
	END IF; 
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_persona` (IN `cod_persona` INT)   BEGIN
    DELETE FROM tbl_personas WHERE cod_persona = cod_persona;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_ponderacion` (IN `p_Cod_ponderacion` INT(11))   DELETE FROM tbl_ponderaciones
WHERE Cod_ponderacion = p_Cod_ponderacion$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_Ponderaciones_ciclos` (IN `p_Cod_ponderaciones_ciclos` INT)   BEGIN
    -- Eliminar el registro en tbl_ponderaciones_ciclos.
    DELETE FROM tbl_ponderaciones_ciclos
    WHERE Cod_ponderacion_ciclo = p_Cod_ponderaciones_ciclos;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_profesor` (IN `p_Cod_profesor` INT)   BEGIN
    DELETE FROM tbl_profesores WHERE Cod_profesor = p_Cod_profesor;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_tipo_contrato` (IN `p_Cod_tipo_contrato` INT)   BEGIN
    DELETE FROM tbl_tipo_contrato WHERE Cod_tipo_contrato = p_Cod_tipo_contrato;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `EliminarConceptoPago` (IN `p_Cod_concepto` INT)   BEGIN
    DELETE FROM tbl_concepto_pago 
    WHERE Cod_concepto = p_Cod_concepto;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `eliminarSeccionAsignatura` (IN `id` INT)   BEGIN
    DELETE FROM tbl_seccion_asignatura WHERE Cod_seccion_asignatura = id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `eliminar_actividad_academica` (IN `p_Cod_actividad_academica` INT)   BEGIN
    DELETE FROM tbl_actividades_academicas
    WHERE Cod_actividad_academica = p_Cod_actividad_academica;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `eliminar_matricula` (IN `p_Cod_matricula` INT)   BEGIN
    DECLARE v_Cod_caja INT;

    -- Obtener el Cod_caja relacionado con la matrícula
    SELECT cod_caja INTO v_Cod_caja
    FROM tbl_matricula
    WHERE cod_matricula = p_Cod_matricula;

    -- Eliminar primero las entradas en tbl_caja_descuento que dependan de Cod_caja
    DELETE FROM tbl_caja_descuento WHERE cod_caja = v_Cod_caja;

    -- Eliminar la matrícula
    DELETE FROM tbl_matricula WHERE cod_matricula = p_Cod_matricula;

    -- Eliminar la caja relacionada
    DELETE FROM tbl_caja WHERE cod_caja = v_Cod_caja;

    -- Eliminar los descuentos asociados que no están en uso
    DELETE FROM tbl_descuentos
    WHERE cod_descuento NOT IN (SELECT cod_descuento FROM tbl_caja_descuento);

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `eliminar_profesor_completamente` (IN `p_Cod_profesor` INT)   BEGIN
    -- Elimina las actividades académicas relacionadas con las secciones que dependen de este profesor
    DELETE FROM tbl_actividades_academicas 
    WHERE Cod_secciones IN (
        SELECT Cod_secciones FROM tbl_secciones WHERE Cod_Profesor = p_Cod_profesor
    );

    -- Elimina las secciones que dependen del profesor
    DELETE FROM tbl_secciones WHERE Cod_Profesor = p_Cod_profesor;

    -- Finalmente, elimina al profesor
    DELETE FROM tbl_profesores WHERE Cod_profesor = p_Cod_profesor;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `eliminar_solicitud` (IN `p_Cod_solicitud` INT)   BEGIN
  DELETE FROM tbl_solicitud
  WHERE Cod_solicitud = p_Cod_solicitud;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getActividadesPorAsignatura` (IN `codAsignatura` INT)   BEGIN
  -- Consulta para obtener actividades según la asignatura
  SELECT 
    aa.Cod_actividad_academica,
    aa.Nombre_actividad_academica,
    aa.Descripcion,
    aa.Valor,
    aa.Fechayhora_Inicio,
    aa.Fechayhora_Fin,
    sa.Cod_seccion_asignatura,
    s.Nombre_seccion
  FROM 
    tbl_actividades_academicas aa
  JOIN 
    tbl_actividades_asignatura asa ON aa.Cod_actividad_academica = asa.Cod_actividad_academica
  JOIN 
    tbl_secciones_asignaturas sa ON asa.Cod_seccion_asignatura = sa.Cod_seccion_asignatura
  JOIN 
    tbl_grados_asignaturas ga ON sa.Cod_grados_asignaturas = ga.Cod_grados_asignaturas
  JOIN 
    tbl_asignaturas a ON ga.Cod_asignatura = a.Cod_asignatura
  JOIN 
    tbl_secciones s ON sa.Cod_secciones = s.Cod_secciones
  WHERE 
    a.Cod_asignatura = codAsignatura;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getActividadesPorParcialAsignatura` (IN `p_Cod_seccion_asignatura` INT, IN `p_Cod_parcial` INT)   BEGIN
    SELECT 
        aa.Cod_actividad_academica,
        aa.Nombre_actividad_academica,
        aa.Descripcion,
        aa.Fechayhora_Inicio,
        aa.Fechayhora_Fin,
        aa.Valor
    FROM 
        tbl_actividades_academicas AS aa
    INNER JOIN 
        tbl_actividades_asignatura AS sa
        ON aa.Cod_actividad_academica = sa.Cod_actividad_academica
    INNER JOIN 
        tbl_secciones_asignaturas AS saa
        ON sa.Cod_seccion_asignatura = saa.Cod_seccion_asignatura
    INNER JOIN 
        tbl_secciones AS s
        ON saa.Cod_secciones = s.Cod_secciones    
    WHERE 
        saa.Cod_seccion_asignatura = p_Cod_seccion_asignatura
        AND aa.Cod_parcial = p_Cod_parcial;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getActividadesPorProfesorSeccionAsignaturaParcial` (IN `p_codProfesor` INT, IN `p_codSeccion` INT, IN `p_codAsignatura` INT, IN `p_codParcial` INT)   BEGIN
    SELECT 
        aa.Cod_actividad_academica,
        aa.Nombre_actividad_academica,
        aa.Descripcion,
        aa.Fechayhora_Inicio,
        aa.Fechayhora_Fin,
        aa.Valor,
        p.Nombre_parcial,
        s.Nombre_seccion,
        a.Nombre_asignatura
    FROM tbl_actividades_academicas aa
    INNER JOIN tbl_parciales p ON aa.Cod_parcial = p.Cod_parcial
    INNER JOIN tbl_secciones s ON aa.Cod_secciones = s.Cod_secciones
    INNER JOIN tbl_secciones_asignaturas sa ON s.Cod_secciones = sa.Cod_secciones
    INNER JOIN tbl_asignaturas a ON sa.Cod_asignatura = a.Cod_asignatura
    WHERE 
        aa.Cod_profesor = p_codProfesor
        AND aa.Cod_secciones = p_codSeccion
        AND sa.Cod_asignatura = p_codAsignatura
        AND aa.Cod_parcial = p_codParcial;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getActividadesPorProfesorYAsignatura` (IN `p_Cod_profesor` INT, IN `p_Cod_asignatura` INT)   BEGIN
    SELECT 
        aa.Cod_actividad_academica,
        aa.Cod_profesor,
        aa.Nombre_actividad_academica,
        aa.Descripcion,
        aa.Fechayhora_Inicio,
        aa.Fechayhora_Fin,
        aa.Valor,
        sa.Cod_seccion_asignatura
    FROM 
        tbl_actividades_academicas AS aa
    INNER JOIN 
        tbl_actividades_asignatura AS sa
        ON aa.Cod_actividad_academica = sa.Cod_actividad_academica
    WHERE 
        aa.Cod_profesor = p_Cod_profesor
        AND sa.Cod_seccion_asignatura = p_Cod_asignatura;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getAsignaturasPorSeccion` (IN `codSeccion` INT)   BEGIN
    SELECT 
        a.Cod_asignatura,
        a.Nombre_asignatura,
        sa.Cod_seccion_asignatura
    FROM 
        tbl_secciones_asignaturas sa
    INNER JOIN 
        tbl_grados_asignaturas ga ON sa.Cod_grados_asignaturas = ga.Cod_grados_asignaturas
    INNER JOIN 
        tbl_asignaturas a ON ga.Cod_asignatura = a.Cod_asignatura
    WHERE 
        sa.Cod_secciones = codSeccion;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetGradoSeccionYPadre` (IN `p_cod_persona_estudiante` INT)   BEGIN
    SELECT 
        sm.cod_grado,                     -- Código del grado
        g.nombre_grado,                   -- Nombre del grado
        sm.cod_seccion,                   -- Código de la sección
        s.Nombre_seccion,                 -- Nombre de la sección
        CONCAT_WS(' ', p_padre.Nombre, p_padre.Segundo_nombre, p_padre.Primer_apellido, p_padre.Segundo_apellido) AS nombre_padre,
        p_padre.dni_persona AS dni_padre  -- DNI del padre
    FROM 
        tbl_secciones_matricula sm
    INNER JOIN 
        tbl_estructura_familiar ef
        ON sm.cod_persona = ef.cod_persona_estudiante
    INNER JOIN 
        tbl_personas p_padre
        ON ef.cod_persona_padre = p_padre.cod_persona
    INNER JOIN
        tbl_secciones s
        ON sm.cod_seccion = s.cod_secciones
    INNER JOIN
        tbl_grados g
        ON sm.cod_grado = g.cod_grado
    WHERE 
        sm.cod_persona = p_cod_persona_estudiante;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getParcialesPorSeccionAsignatura` (IN `p_Cod_seccion_asignatura` INT)   BEGIN
    SELECT DISTINCT
        p.Cod_parcial,
        p.Nombre_parcial,
        s.Cod_secciones,
        s.Nombre_seccion,
        saa.Cod_seccion_asignatura
    FROM 
        tbl_parciales AS p
    INNER JOIN 
        tbl_actividades_academicas AS aa
        ON p.Cod_parcial = aa.Cod_parcial
    INNER JOIN 
        tbl_actividades_asignatura AS sa
        ON aa.Cod_actividad_academica = sa.Cod_actividad_academica
    INNER JOIN 
        tbl_secciones_asignaturas AS saa
        ON sa.Cod_seccion_asignatura = saa.Cod_seccion_asignatura
    INNER JOIN 
        tbl_secciones AS s
        ON saa.Cod_secciones = s.Cod_secciones
    WHERE 
        sa.Cod_seccion_asignatura = p_Cod_seccion_asignatura;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetPermissionsByRoleAndObject` (IN `Cod_rol` INT, IN `Nom_objeto` VARCHAR(100))   BEGIN
    SELECT
    sa.Permiso_Modulo,
    sa.Permiso_Consultar,
    sa.Permiso_Insercion,
    sa.Permiso_Actualizacion,
    sa.Permiso_Eliminacion
FROM
    tbl_permisos sa
JOIN tbl_objetos so ON
    sa.Cod_Objeto = so.Cod_Objeto
WHERE
    sa.Cod_Rol = Cod_rol AND so.Nom_objeto = Nom_objeto;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getSeccionesPorProfesor` (IN `codProfesor` INT)   BEGIN
  SELECT 
    s.Cod_secciones, 
    s.Nombre_seccion, 
    g.Nombre_grado, 
    p.Anio_academico
  FROM 
    tbl_secciones s
  JOIN  
    tbl_grados g ON s.Cod_grado = g.Cod_grado
  JOIN 
    tbl_periodo_matricula p ON s.Cod_periodo_matricula = p.Cod_periodo_matricula
  WHERE 
    s.Cod_Profesor = codProfesor;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_actividades_academicas` ()   BEGIN
    SELECT * FROM tbl_actividades_academicas;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_asignaturas` ()   BEGIN
    SELECT * FROM tbl_asignaturas;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_asistencias` (IN `p_cod_seccion` INT(11), IN `p_fecha` DATE)   BEGIN
  SELECT 
    a.Cod_asistencias,
    a.Fecha,
    ea.Descripcion_asistencia AS DescripcionEstado,
    a.Observacion,
    CONCAT(p.Nombre, ' ', p.Segundo_nombre, ' ', p.Primer_apellido, ' ', p.Segundo_Apellido) AS Nombre_Completo
FROM 
    tbl_asistencias a
INNER JOIN 
    tbl_secciones_matricula sap ON a.Cod_seccion_matricula = sap.Cod_seccion_matricula
INNER JOIN 
    tbl_personas p ON sap.Cod_persona = p.Cod_persona
INNER JOIN 
    tbl_estado_asistencia ea ON a.Cod_estado_asistencia = ea.Cod_estado_asistencia
WHERE
    sap.Cod_seccion = p_cod_seccion AND DATE(a.Fecha) = STR_TO_DATE(p_fecha, '%Y-%m-%d');

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_ciclos` ()   SELECT Cod_ciclo, Nombre_ciclo FROM tbl_ciclos$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_estado_asistencias` ()   BEGIN
    SELECT * FROM tbl_estado_asistencia;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_estado_nota` ()   BEGIN
    SELECT * FROM tbl_estado_nota;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_grados` ()   SELECT
Cod_grado,
Cod_ciclo,
Nombre_grado,
Prefijo
FROM tbl_grados$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_grados_asignaturas` (IN `p_Cod_grado` INT)   BEGIN  
    SELECT   
        tga.Cod_grados_asignaturas,
        tga.Cod_grado,   
        tg.Nombre_grado,  
        tga.Cod_asignatura,  
        ta.Nombre_asignatura,  
        ta.Descripcion_asignatura  
    FROM tbl_grados_asignaturas tga  
    JOIN tbl_grados tg ON tga.Cod_grado = tg.Cod_grado  
    JOIN tbl_asignaturas ta ON tga.Cod_asignatura = ta.Cod_asignatura  
    WHERE tga.Cod_grado = p_Cod_grado;  
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_grado_academico` ()   BEGIN
    SELECT * FROM tbl_grado_academico;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_notas` (IN `user_cod_persona` INT)   BEGIN
SELECT 
    s.Cod_secciones, -- Asegúrate de incluir este campo
    s.Nombre_seccion AS Seccion,
    g.Nombre_grado AS Grado,
    COUNT(sm.Cod_persona) AS Total_Alumnos,
    pm.Anio_academico AS Anio_Academico
FROM 
    tbl_secciones s
JOIN 
    tbl_grados g ON s.Cod_grado = g.Cod_grado
JOIN 
    tbl_secciones_matricula sm ON s.Cod_secciones = sm.Cod_seccion
JOIN 
    tbl_periodo_matricula pm ON s.Cod_periodo_matricula = pm.Cod_periodo_matricula
JOIN 
        tbl_profesores pr ON s.Cod_Profesor = pr.Cod_profesor
    JOIN 
        tbl_personas p ON pr.cod_persona = p.cod_persona
    WHERE 
        pr.cod_persona = user_cod_persona
GROUP BY 
    s.Cod_secciones, s.Nombre_seccion, g.Nombre_grado, pm.Anio_academico;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_parcial` ()   BEGIN
    SELECT * FROM tbl_parciales;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_personas` ()   BEGIN
    SELECT * FROM tbl_personas;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_ponderacion` ()   SELECT * FROM tbl_ponderaciones$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_profesores` ()   BEGIN 
    SELECT 
        P.Cod_profesor,
        P.cod_persona,
        P.Cod_grado_academico,
        P.Cod_tipo_contrato,
        P.Hora_entrada,
        P.Hora_salida,
        P.Fecha_ingreso,
        P.Fecha_fin_contrato,
        P.Años_experiencia,
        P.Estado
    FROM 
        tbl_profesores AS P;
 END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_secciones` ()   BEGIN
  SELECT 
        s.Cod_secciones, -- Código de la sección
        s.Nombre_seccion AS Seccion, -- Nombre de la sección
        g.Nombre_grado AS Grado, -- Nombre del grado
        COUNT(sm.Cod_persona) AS Total_Alumnos, -- Total de alumnos en la sección
        pm.Anio_academico AS Anio_Academico, -- Año académico
        CONCAT(p.Nombre, ' ', p.Segundo_nombre, ' ', p.Primer_apellido, ' ', p.Segundo_apellido) AS Nombre_Profesor -- Nombre completo del profesor
    FROM 
        tbl_secciones s
    INNER JOIN 
        tbl_grados g ON s.Cod_grado = g.Cod_grado
    LEFT JOIN 
        tbl_secciones_matricula sm ON s.Cod_secciones = sm.Cod_seccion
    INNER JOIN 
        tbl_periodo_matricula pm ON s.Cod_periodo_matricula = pm.Cod_periodo_matricula
    INNER JOIN 
        tbl_profesores pr ON s.Cod_Profesor = pr.Cod_profesor
    INNER JOIN 
        tbl_personas p ON pr.cod_persona = p.cod_persona
    GROUP BY 
        s.Cod_secciones, s.Nombre_seccion, g.Nombre_grado, pm.Anio_academico, Nombre_Profesor;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_tipos_contrato` ()   BEGIN
    SELECT * FROM tbl_tipo_contrato;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_especialidades` ()   BEGIN
    SELECT * FROM tbl_especialidades;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_EstudiantesPorSeccion` (IN `seccion_id` INT)   BEGIN
    SELECT 
        sm.Cod_seccion_matricula,
        p.cod_persona,
        p.dni_persona AS Identidad, -- Se agrega la columna de identidad
        CONCAT(p.Nombre, ' ', p.Segundo_nombre, ' ', p.Primer_apellido, ' ', p.Segundo_Apellido) AS Nombre_Completo
    FROM 
        tbl_secciones_matricula sm
    INNER JOIN 
        tbl_personas p ON sm.Cod_persona = p.cod_persona
    WHERE 
        sm.Cod_seccion = seccion_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_grados_asignaturas` (IN `p_Cod_grado` INT)   BEGIN  
    SELECT   
        tga.Cod_grados_asignaturas,
        tga.Cod_grado,   
        tg.Nombre_grado,  
        tga.Cod_asignatura,  
        ta.Nombre_asignatura,  
        ta.Descripcion_asignatura  
    FROM tbl_grados_asignaturas tga  
    JOIN tbl_grados tg ON tga.Cod_grado = tg.Cod_grado  
    JOIN tbl_asignaturas ta ON tga.Cod_asignatura = ta.Cod_asignatura  
    WHERE tga.Cod_grado = p_Cod_grado;  
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GET_HISTORIAL_POR_PERSONA` (IN `p_Cod_persona` INT)  NO SQL BEGIN
    SELECT 
        ha.Cod_historial_academico AS CodHistorial,
        e.Descripcion AS Estado,  -- Mostrar la descripción en lugar del código
        CONCAT(p.Nombre, ' ', p.Segundo_nombre, ' ', p.Primer_apellido, ' ', p.Segundo_apellido) AS NombreCompletoEstudiante,
        g.Nombre_grado AS NombreGrado,
        ha.Año_Academico AS AñoAcademico,
        ha.Promedio_Anual AS PromedioAnual,
        ha.Fecha_Registro AS FechaRegistro,
        i.Nom_Instituto AS NombreInstituto,
        ha.Observacion AS Observacion
    FROM 
        tbl_historiales_academicos ha
    JOIN 
        tbl_personas p ON ha.Cod_persona = p.Cod_persona
    JOIN 
        tbl_grados g ON ha.Cod_grado = g.Cod_grado
    JOIN 
        tbl_institutos i ON ha.Cod_Instituto = i.Cod_Instituto
    JOIN
        tbl_estado_nota e ON ha.Cod_estado = e.Cod_estado  -- Unir con la tabla de estados
    WHERE 
        ha.Cod_persona = p_Cod_persona;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_institutos` ()  NO SQL SELECT * FROM tbl_institutos$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_mostrar_grados_asignaturas` ()   BEGIN  
    SELECT   
	tga.Cod_grados_asignaturas,
        tga.Cod_grado,   
        tg.Nombre_grado,  
        tga.Cod_asignatura,  
        ta.Nombre_asignatura,  
        ta.Descripcion_asignatura  
    FROM tbl_grados_asignaturas tga  
    JOIN tbl_grados tg ON tga.Cod_grado = tg.Cod_grado  
    JOIN tbl_asignaturas ta ON tga.Cod_asignatura = ta.Cod_asignatura 
    ORDER BY tga.cod_grado;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_parametros` ()   BEGIN
    SELECT 
        Cod_parametro,
        Cod_usuario,
        Parametro,
        Valor,
        Fecha_Creacion,
        Fecha_Modificacion
    FROM 
        tbl_parametros;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_recuento_asistencias` (IN `cod_seccion` INT)   BEGIN
  SELECT 
        ea.Cod_estado_asistencia AS estado,
        COUNT(*) AS cantidad,
        DATE (a.Fecha) AS fecha
    FROM 
        tbl_asistencias a
    INNER JOIN 
        tbl_estado_asistencia ea ON a.Cod_estado_asistencia = ea.Cod_estado_asistencia
    INNER JOIN 
        tbl_secciones_matricula sm ON a.Cod_seccion_matricula = sm.Cod_seccion_matricula
    WHERE 
        sm.Cod_seccion = cod_seccion
    GROUP BY 
        ea.Cod_estado_asistencia, DATE(a.Fecha);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_Secciones` ()   BEGIN
    SELECT 
    s.Cod_secciones, -- Asegúrate de incluir este campo
    s.Nombre_seccion AS Seccion,
    g.Nombre_grado AS Grado,
    pm.Anio_academico AS Anio_Academico,
     CONCAT(pe.Nombre, ' ', pe.Segundo_nombre, ' ', pe.Primer_apellido, ' ', pe.Segundo_apellido) AS Nombre_Profesor
FROM 
    tbl_secciones s
JOIN 
    tbl_grados g ON s.Cod_grado = g.Cod_grado
JOIN 
    tbl_secciones_matricula sm ON s.Cod_secciones = sm.Cod_seccion
JOIN 
    tbl_periodo_matricula pm ON s.Cod_periodo_matricula = pm.Cod_periodo_matricula
JOIN tbl_profesores pr ON s.Cod_Profesor=pr.Cod_profesor
JOIN tbl_personas pe ON pr.cod_persona=pe.cod_persona
GROUP BY 
    s.Cod_secciones, s.Nombre_seccion, g.Nombre_grado, pm.Anio_academico, pe.Nombre, pe.Segundo_nombre,pe.Primer_apellido, pe.Segundo_apellido;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_seccionesP` ()   BEGIN
    SELECT Cod_secciones, Nombre_seccion FROM tbl_secciones;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_SeccionesProfe` (IN `user_cod_persona` INT)   BEGIN
 SELECT 
     s.Cod_secciones AS Cod_secciones,
     s.Nombre_seccion AS Seccion,
     g.Nombre_grado AS Grado,
     pm.Anio_academico AS Anio_Academico
FROM 
     tbl_secciones s
JOIN 
     tbl_grados g ON s.Cod_grado = g.Cod_grado
JOIN 
     tbl_secciones_matricula sm ON s.Cod_secciones = sm.Cod_seccion
JOIN 
     tbl_periodo_matricula pm ON s.Cod_periodo_matricula = pm.Cod_periodo_matricula
JOIN 
     tbl_profesores pr ON s.Cod_Profesor = pr.Cod_profesor
JOIN 
     tbl_personas pe ON pr.cod_persona = pe.cod_persona
WHERE 
     pr.cod_persona = user_cod_persona
GROUP BY 
     s.Cod_secciones, g.Nombre_grado, pm.Anio_academico;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GET_SECCION_MATRICULA` ()  NO SQL BEGIN
	select * from tbl_secciones_matricula;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertarConceptoPago` (IN `p_Concepto` VARCHAR(100), IN `p_Descripcion` VARCHAR(255), IN `p_Activo` ENUM('Si','No'))   BEGIN
    INSERT INTO tbl_concepto_pago  (Concepto, Descripcion, Fecha_creacion, Activo)
    VALUES (p_Concepto, p_Descripcion, CURRENT_TIMESTAMP, p_Activo);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insertar_actividad_academica` (IN `p_Cod_profesor` INT, IN `p_Cod_ponderacion_ciclo` INT, IN `p_Cod_parcial` INT, IN `p_Nombre_actividad_academica` VARCHAR(30), IN `p_Descripcion` VARCHAR(50), IN `p_Fechayhora_Inicio` DATETIME, IN `p_Fechayhora_Fin` DATETIME, IN `p_Valor` DECIMAL(5,2), IN `p_Cod_secciones` INT, IN `p_Cod_seccion_asignatura` INT)   BEGIN
    DECLARE total_valor DECIMAL(5,2);
    DECLARE max_valor DECIMAL(5,2);
    DECLARE mensaje_error VARCHAR(255);

    -- Obtener el máximo permitido del ciclo para la ponderación actual
    SELECT Valor INTO max_valor
    FROM tbl_ponderaciones_ciclos pc
    INNER JOIN tbl_secciones s ON s.Cod_grado = pc.Cod_ciclo
    WHERE s.Cod_secciones = p_Cod_secciones
      AND pc.Cod_ponderacion_ciclo = p_Cod_ponderacion_ciclo;

    -- Calcular la suma de valores ya registrados para la ponderación actual
    SELECT IFNULL(SUM(aa.Valor), 0) INTO total_valor
    FROM tbl_actividades_academicas aa
    INNER JOIN tbl_actividades_asignatura aass ON aass.Cod_actividad_academica = aa.Cod_actividad_academica
    WHERE aa.Cod_parcial = p_Cod_parcial
      AND aass.Cod_seccion_asignatura = p_Cod_seccion_asignatura
      AND aa.Cod_ponderacion_ciclo = p_Cod_ponderacion_ciclo;

    -- Validar si la nueva actividad no excede el máximo
    IF total_valor + p_Valor > max_valor THEN
        SET mensaje_error = CONCAT(
            'El valor total de las actividades para esta ponderación excede el límite permitido. ',
            'Valor actual: ', total_valor, ', valor a agregar: ', p_Valor, 
            ', máximo permitido: ', max_valor
        );
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = mensaje_error;
    ELSE
        -- Insertar la actividad académica
        INSERT INTO tbl_actividades_academicas (
            Cod_profesor, Cod_ponderacion_ciclo, Cod_parcial, Nombre_actividad_academica,
            Descripcion, Fechayhora_Inicio, Fechayhora_Fin, Valor, Cod_secciones
        )
        VALUES (
            p_Cod_profesor, p_Cod_ponderacion_ciclo, p_Cod_parcial, p_Nombre_actividad_academica,
            p_Descripcion, p_Fechayhora_Inicio, p_Fechayhora_Fin, p_Valor, p_Cod_secciones
        );

        -- Vincular la actividad con la sección asignatura
        INSERT INTO tbl_actividades_asignatura (
            Cod_actividad_academica, Cod_seccion_asignatura
        )
        VALUES (
            LAST_INSERT_ID(), p_Cod_seccion_asignatura
        );
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insertar_aula` (IN `p_Numero_aula` INT, IN `p_Capacidad` INT, IN `p_Cupos_aula` INT, IN `p_Division` INT, IN `p_Secciones_disponibles` INT, IN `p_Secciones_ocupadas` INT, IN `p_Cod_edificio` INT)   BEGIN
    INSERT INTO tbl_aula (Numero_aula, Capacidad, Cupos_aula, Division, Secciones_disponibles, Secciones_ocupadas, Cod_edificio)
    VALUES (p_Numero_aula, p_Capacidad, p_Cupos_aula, p_Division, p_Secciones_disponibles, p_Secciones_ocupadas, p_Cod_edificio);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insertar_matricula` (IN `p_fecha_matricula` DATE, IN `p_Cod_genialogia` INT, IN `p_tipo_estado` ENUM('pendiente','activa','cancelada','inactiva'), IN `p_Fecha_inicio` DATE, IN `p_Fecha_fin` DATE, IN `p_anio_academico` INT, IN `p_tipo_matricula` VARCHAR(255), IN `p_Tipo_transaccion` VARCHAR(50), IN `p_Monto` DECIMAL(10,2), IN `p_Descripcion_caja` VARCHAR(255), IN `p_Cod_concepto` INT, IN `p_Codificacion_matricula` VARCHAR(255))   BEGIN
    DECLARE v_Cod_estado_matricula INT;
    DECLARE v_Cod_periodo_matricula INT;
    DECLARE v_Cod_tipo_matricula INT;

    -- Insertar o actualizar en tbl_estado_matricula
    INSERT INTO tbl_estado_matricula (tipo)
    VALUES (p_tipo_estado)
    ON DUPLICATE KEY UPDATE tipo = p_tipo_estado;

    SET v_Cod_estado_matricula = LAST_INSERT_ID();

    -- Insertar o actualizar en tbl_periodo_matricula
    INSERT INTO tbl_periodo_matricula (Fecha_inicio, Fecha_fin, anio_academico)
    VALUES (p_Fecha_inicio, p_Fecha_fin, p_anio_academico)
    ON DUPLICATE KEY UPDATE Fecha_inicio = p_Fecha_inicio, Fecha_fin = p_Fecha_fin, anio_academico = p_anio_academico;

    SET v_Cod_periodo_matricula = LAST_INSERT_ID();

    -- Insertar o actualizar en tbl_tipo_matricula
    INSERT INTO tbl_tipo_matricula (tipo)
    VALUES (p_tipo_matricula)
    ON DUPLICATE KEY UPDATE tipo = p_tipo_matricula;

    SET v_Cod_tipo_matricula = LAST_INSERT_ID();

    -- Insertar en tbl_caja
    INSERT INTO tbl_caja (Fecha, Tipo_transaccion, Monto, Descripcion, Cod_genialogia, Cod_concepto)
    VALUES (CURRENT_DATE, p_Tipo_transaccion, p_Monto, p_Descripcion_caja, p_Cod_genialogia, p_Cod_concepto);

    -- Insertar en tbl_matricula con los IDs generados y el Cod_caja recién insertado
    INSERT INTO tbl_matricula (fecha_matricula, Codificacion_matricula, Cod_periodo_matricula, Cod_genialogia, Cod_tipo_matricula, Cod_estado_matricula, Cod_caja)
    VALUES (p_fecha_matricula, p_Codificacion_matricula, v_Cod_periodo_matricula, p_Cod_genialogia, v_Cod_tipo_matricula, v_Cod_estado_matricula, LAST_INSERT_ID());

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insertar_solicitud` (IN `p_Cod_persona` INT, IN `p_Nombre_solicitud` VARCHAR(255), IN `p_Fecha_solicitud` DATE, IN `p_Hora_Inicio` TIME, IN `p_Hora_Fin` TIME, IN `p_Asunto` VARCHAR(255), IN `p_Persona_requerida` VARCHAR(255))   BEGIN
    -- Validación para asegurar que la hora de inicio es menor que la hora de fin
    IF p_Hora_Inicio >= p_Hora_Fin THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La hora de inicio no puede ser igual o mayor que la hora de fin.';
    ELSE
        -- Inserta la nueva solicitud en la tabla tbl_solicitud con estado 'Pendiente'
        INSERT INTO tbl_solicitud (
            Cod_persona,
            Nombre_solicitud,
            Fecha_solicitud,
            Hora_Inicio,
            Hora_Fin,
            Asunto,
            Persona_requerida,
            Estado
        ) VALUES (
            p_Cod_persona,
            p_Nombre_solicitud,
            p_Fecha_solicitud,
            p_Hora_Inicio,
            p_Hora_Fin,
            p_Asunto,
            p_Persona_requerida,
            'Pendiente' -- Se establece el estado como 'Pendiente'
        );
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_actividad_academica` (IN `Cod_profesor` INT, IN `Cod_ponderacion_ciclo` INT, IN `Cod_parcial` INT, IN `Nombre_actividad_academica` VARCHAR(50), IN `Descripcion` VARCHAR(80), IN `Fechayhora_Inicio` DATETIME, IN `Fechayhora_Fin` DATETIME, IN `Valor` DECIMAL(5,2), IN `Cod_secciones` INT)   BEGIN
    INSERT INTO tbl_actividades_academicas (
        Cod_profesor,
        Cod_ponderacion_ciclo,
        Cod_parcial,
        Nombre_actividad_academica,
        Descripcion,
        Fechayhora_Inicio,
        Fechayhora_Fin,
        Valor,
        Cod_secciones
    )
    VALUES (
        Cod_profesor,
        Cod_ponderacion_ciclo,
        Cod_parcial,
        Nombre_actividad_academica,
        Descripcion,
        Fechayhora_Inicio,
        Fechayhora_Fin,
        Valor,
        Cod_secciones
    );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_asignatura` (IN `p_Nombre_asignatura` VARCHAR(20), IN `p_Descripcion_asignatura` VARCHAR(60))   BEGIN  
    START TRANSACTION;  

    -- Insertar en la tabla tbl_asignaturas  
    INSERT INTO tbl_asignaturas(Nombre_asignatura, Descripcion_asignatura)  
    VALUES(p_Nombre_asignatura, p_Descripcion_asignatura);  

    COMMIT;  
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_asistencia` (IN `p_Observacion` VARCHAR(60), IN `p_Cod_estado_asistencia` INT, IN `p_Cod_seccion_matricula` INT, IN `p_Fechas` DATETIME)   BEGIN
  -- Verificar si ya existe una asistencia para la fecha y sección
    DECLARE asistenciaExistente INT;

    SELECT COUNT(*) INTO asistenciaExistente 
    FROM tbl_asistencias 
    WHERE Cod_seccion_matricula = p_Cod_seccion_matricula 
    AND DATE(Fecha) = DATE(p_Fechas); 

    IF asistenciaExistente > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La asistencia ya existe para esta fecha y sección';
    ELSE
        -- Insertar nueva asistencia si no existe
        INSERT INTO tbl_asistencias (Fecha, Observacion, Cod_estado_asistencia, Cod_seccion_matricula)
        VALUES (p_Fechas, p_Observacion, p_Cod_estado_asistencia, p_Cod_seccion_matricula);
    END IF;
    
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_ciclos` (IN `p_Nombre_ciclo` VARCHAR(20))   INSERT INTO tbl_ciclos(Nombre_ciclo)
Values(p_Nombre_ciclo)$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_especialidad` (IN `p_Nombre_especialidad` VARCHAR(30))   BEGIN
    INSERT INTO tbl_especialidades (Nombre_especialidad)
    VALUES (p_Nombre_especialidad);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_estado_asistencia` (IN `p_Descripcion_asistencia` VARCHAR(50))   BEGIN
   -- Validar que la descripción no sea nula o vacía
    IF p_Descripcion_asistencia IS NULL OR TRIM(p_Descripcion_asistencia) = '' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La descripción de estado asistencia no puede estar vacía';
    END IF;
    
      -- Validar que no exista un registro duplicado
    IF (SELECT COUNT(*) 
        FROM tbl_estado_asistencia 
        WHERE Descripcion_asistencia = p_Descripcion_asistencia) > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ya existe una estado asistencia con esa descripción ';
    END IF;
    
    
    INSERT INTO tbl_estado_asistencia (Descripcion_asistencia)
    VALUES (p_Descripcion_asistencia);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_estado_nota` (IN `p_Descripcion` VARCHAR(100))   BEGIN
    -- Validaciones
    -- validar que la descripcion no este en blanco o nula
    IF p_Descripcion IS NULL OR p_Descripcion = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La Descripción no puede estar vacía';
    END IF;

 -- Validar que no exista un registro duplicado
    IF (SELECT COUNT(*) 
        FROM tbl_estado_nota 
        WHERE Descripcion = p_Descripcion) > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ya existe una estado nota con esa descripción ';
    END IF;

    -- Inserción de datos
    INSERT INTO tbl_estado_nota (Descripcion)
    VALUES (p_Descripcion);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_grados` (IN `p_Cod_ciclo` INT(11), IN `p_Nombre_grado` VARCHAR(20), IN `p_Prefijo` VARCHAR(50))   INSERT INTO tbl_grados(Cod_ciclo,Nombre_grado,Prefijo) 
VALUES (p_Cod_ciclo,p_Nombre_grado,p_Prefijo)$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_grados_asignaturas` (IN `p_Cod_grado` INT, IN `p_Cod_asignatura` INT)   BEGIN
    -- Verifica si la asignatura ya está en el grado
    IF EXISTS (
        SELECT 1
        FROM tbl_grados_asignaturas
        WHERE Cod_grado = p_Cod_grado
        AND Cod_asignatura = p_Cod_asignatura
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La asignatura ya ha sido asignada a este grado';
    ELSE
        -- Inserta si no existe
        INSERT INTO tbl_grados_asignaturas (Cod_grado, Cod_asignatura)
        VALUES (p_Cod_grado, p_Cod_asignatura);
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_grado_academico` (IN `p_Descripcion` VARCHAR(30))   BEGIN
    INSERT INTO tbl_grado_academico (Descripcion)
    VALUES (p_Descripcion);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `INSERT_HISTORIAL` (IN `p_Cod_estado` INT, IN `p_Cod_persona` INT, IN `p_Grado` INT, IN `p_Año_Academico` INT, IN `p_Promedio_Anual` DECIMAL(5,2), IN `p_Cod_Instituto` INT, IN `p_Observacion` VARCHAR(60))   BEGIN
    INSERT INTO tbl_historiales_academicos (
        Cod_estado, Cod_persona, Cod_grado, Año_Academico, 
        Promedio_Anual, Fecha_Registro, Cod_Instituto, Observacion
    ) 
    VALUES (
        p_Cod_estado, p_Cod_persona, p_Grado, p_Año_Academico,
        p_Promedio_Anual, NOW(), p_Cod_Instituto, p_Observacion
    );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_instituto` (IN `p_nom_instituto` VARCHAR(30))  NO SQL INSERT INTO tbl_institutos (Nom_Instituto)
    VALUES (p_nom_instituto)$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_nota` (IN `p_Nota` DECIMAL(5,2), IN `p_Observacion` VARCHAR(60), IN `p_Cod_parcial` INT, IN `p_Cod_actividad_asignatura` INT, IN `p_Cod_seccion_matricula` INT)   BEGIN
    -- Validaciones
    -- validar que la nota no sea negativo ni mayor a 100
    IF p_Nota IS NULL OR p_Nota < 0 OR p_Nota > 100 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La Nota debe ser un valor entre 0 y 100';
    END IF;

    -- validar que el codigo del parcial exista
    IF p_Cod_parcial IS NULL OR NOT EXISTS (SELECT 1 FROM tbl_parciales WHERE Cod_parcial = p_Cod_parcial) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El Código de Parcial no existe';
    END IF;

    -- validar que el codigo de la intermedia seccion_asignatura exista
    IF p_Cod_actividad_asignatura IS NULL OR NOT EXISTS (SELECT 1 FROM tbl_actividades_asignatura WHERE Cod_actividad_asignatura = p_Cod_actividad_asignatura) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El Código de la actividad de Asignatura no existe';
    END IF;

    -- validar que el codigo de la intermedia seccion_alumno(persona) exista
    IF p_Cod_seccion_matricula IS NULL OR NOT EXISTS (SELECT 1 FROM tbl_secciones_matricula WHERE Cod_seccion_matricula = p_Cod_seccion_matricula) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El Código de Sección de Persona no existe';
    END IF;

	-- Validar que no exista un registro para la misma persona, parcial y sección asignatura
    IF (SELECT COUNT(*) 
        FROM tbl_notas 
        WHERE Cod_parcial = p_Cod_parcial 
          AND Cod_actividad_asignatura = p_Cod_actividad_asignatura
          AND Cod_seccion_matricula = p_Cod_seccion_matricula) > 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Ya existe una nota registrada para ese estudiante, parcial y asignatura';
    END IF;

    -- Inserción de datos
    INSERT INTO tbl_notas (Nota, Observacion, Cod_parcial,Cod_actividad_asignatura, Cod_seccion_matricula)
    VALUES (p_Nota, p_Observacion, p_Cod_parcial, p_Cod_actividad_asignatura, p_Cod_seccion_matricula);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_parametro` (IN `Cod_usuario` INT, IN `Parametro` VARCHAR(50), IN `Valor` VARCHAR(100), IN `Fecha_Creacion` DATETIME, IN `Fecha_Modificacion` DATETIME)   BEGIN
    INSERT INTO `tbl_parametros` (`Cod_usuario`, `Parametro`, `Valor`, `Fecha_Creacion`, `Fecha_Modificacion`)
    VALUES (Cod_usuario, Parametro, Valor, Fecha_Creacion, Fecha_Modificacion);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_parcial` (IN `p_Nombre_parcial` VARCHAR(20))   BEGIN  
    START TRANSACTION;  

    -- Insertar en la tabla tbl_parciales  
    INSERT INTO tbl_parciales (Nombre_parcial)
VALUES (p_Nombre_parcial);
  
    COMMIT;  
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_persona` (IN `dni_persona` VARCHAR(20), IN `Nombre` VARCHAR(50), IN `Segundo_nombre` VARCHAR(50), IN `Primer_apellido` VARCHAR(50), IN `Segundo_Apellido` VARCHAR(50), IN `Nacionalidad` VARCHAR(30), IN `direccion_persona` VARCHAR(100), IN `fecha_nacimiento` DATE, IN `Estado_Persona` TINYINT, IN `Cod_tipo_persona` INT, IN `cod_departamento` INT, IN `cod_genero` INT)   BEGIN
    INSERT INTO tbl_personas (
        dni_persona,
        Nombre,
        Segundo_nombre,
        Primer_apellido,
        Segundo_Apellido,
        Nacionalidad,
        direccion_persona,
        fecha_nacimiento,
        Estado_Persona,
        Cod_tipo_persona,
        cod_departamento,
        cod_genero
    ) VALUES (
        dni_persona,
        Nombre,
        Segundo_nombre,
        Primer_apellido,
        Segundo_Apellido,
        Nacionalidad,
        direccion_persona,
        fecha_nacimiento,
        Estado_Persona,
        Cod_tipo_persona,
        cod_departamento,
        cod_genero
    );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_ponderacion` (IN `p_Descripcion_ponderacion` VARCHAR(50))   INSERT INTO tbl_ponderaciones(Descripcion_ponderacion)
VALUES(p_Descripcion_ponderacion)$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_Ponderaciones_Ciclos` (IN `p_Cod_ponderacion` INT(11), IN `p_Cod_ciclo` INT(11), IN `p_Valor` DECIMAL(5,2))   BEGIN
    DECLARE p_Ponderacion_total DECIMAL(5,2); 
    DECLARE p_Descripcion_ponderacion VARCHAR(50);
    DECLARE p_Recuperacion_ya_registrada INT;

    -- Obtener la descripción de la ponderación
    SELECT Descripcion_ponderacion INTO p_Descripcion_ponderacion
    FROM tbl_ponderaciones 
    WHERE Cod_ponderacion = p_Cod_ponderacion;

    -- Verificar si la descripción contiene la palabra 'recuperacion' (sin importar mayúsculas o minúsculas)
    IF p_Descripcion_ponderacion LIKE '%recuperacion%' THEN
        -- Verificar si ya existe un registro de recuperación en ese ciclo
        SELECT COUNT(*) INTO p_Recuperacion_ya_registrada
        FROM tbl_ponderaciones_ciclos
        WHERE Cod_ciclo = p_Cod_ciclo AND Cod_ponderacion = p_Cod_ponderacion;

        IF p_Recuperacion_ya_registrada > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Ya se ha registrado una recuperación para este ciclo.';
        END IF;

        -- Verificar que el valor de recuperación no exceda 100
        IF p_Valor > 100 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El valor de la recuperación no puede ser mayor a 100.';
        END IF;

    ELSE
        -- Si NO es una recuperación, validamos que la suma de las ponderaciones no exceda el 100%
        SELECT SUM(Valor) INTO p_Ponderacion_total
        FROM tbl_ponderaciones_ciclos
        WHERE Cod_ciclo = p_Cod_ciclo;

        IF p_Valor < 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El valor no puede ser negativo.';
        END IF;

        IF (p_Ponderacion_total + p_Valor) > 100 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La suma de las ponderaciones no puede exceder el 100% para un ciclo.';
        END IF;
    END IF;

    -- Insertar la nueva relación en Ponderacion_ciclos
    INSERT INTO tbl_ponderaciones_ciclos(Cod_ponderacion, Cod_ciclo, Valor)
    VALUES (p_Cod_ponderacion, p_Cod_ciclo, p_Valor);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_profesor` (IN `p_Cod_persona` INT, IN `p_Cod_grado_academico` INT, IN `p_Cod_tipo_contrato` INT, IN `p_Hora_entrada` TIME, IN `p_Hora_salida` TIME, IN `p_Fecha_ingreso` DATE, IN `p_Fecha_fin_contrato` DATE, IN `p_Años_experiencia` TINYINT)   BEGIN
    INSERT INTO tbl_profesores (Cod_persona, Cod_grado_academico, Cod_tipo_contrato, Hora_entrada, Hora_salida, Fecha_ingreso, Fecha_fin_contrato, Años_experiencia)
    VALUES (p_Cod_persona, p_Cod_grado_academico, p_Cod_tipo_contrato, p_Hora_entrada, p_Hora_salida, p_Fecha_ingreso, p_Fecha_fin_contrato, p_Años_experiencia);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_tipo_contrato` (IN `p_Descripcion` VARCHAR(30))   BEGIN
    INSERT INTO tbl_tipo_contrato (Descripcion) VALUES (p_Descripcion);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `MiProcedimiento` (`p_dni_padre` VARCHAR(32))   BEGIN
    -- Declarar la variable cod_padre
    DECLARE cod_padre INT;

    -- Usar la variable en la consulta
    SELECT cod_persona INTO cod_padre
    FROM tbl_personas
    WHERE dni_persona COLLATE utf8mb4_general_ci = p_dni_padre COLLATE utf8mb4_general_ci;

    -- Puedes realizar más operaciones con cod_padre aquí
    SELECT cod_padre;  -- Ejemplo: mostrar el valor de cod_padre (opcional)
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `MostrarPerfil` (IN `p_cod_usuario` INT)   BEGIN
    SELECT 
        u.cod_usuario, 
        u.nombre_usuario, 
        u.correo_usuario, 
        u.cod_persona, 
        u.cod_rol, 
        u.cod_estado_usuario, 
        u.fecha_ultima_conexion, 
        u.primer_ingreso, 
        u.fecha_vencimiento,
        u.is_two_factor_enabled,
        u.otp_verified,
        u.datos_completados,
        u.password_temporal
    FROM 
        tbl_usuarios u
    WHERE 
        u.cod_usuario = p_cod_usuario
    LIMIT 1;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerActividadesCalificadas` (IN `p_Cod_seccion_asignatura` INT)   BEGIN
  SELECT 
    aa.Cod_actividad_asignatura,
    aca.Nombre_actividad_academica,
    aca.Descripcion AS Descripcion_actividad,
    aca.Fechayhora_Inicio,
    aca.Fechayhora_Fin,
    aca.Valor,
    aca.Cod_parcial,
    p.Nombre_parcial,
    CASE 
        WHEN EXISTS (
          SELECT 1 
          FROM tbl_notas n 
          WHERE n.Cod_actividad_asignatura = aa.Cod_actividad_asignatura
        ) THEN 'Calificada'
        ELSE 'Pendiente'
    END AS EstadoCalificacion
  FROM 
    tbl_actividades_asignatura aa
  JOIN 
    tbl_actividades_academicas aca ON aa.Cod_actividad_academica = aca.Cod_actividad_academica
  JOIN 
    tbl_parciales p ON aca.Cod_parcial = p.Cod_parcial
  WHERE 
    aa.Cod_seccion_asignatura = p_Cod_seccion_asignatura
    AND EXISTS (
      SELECT 1 
      FROM tbl_notas n 
      WHERE n.Cod_actividad_asignatura = aa.Cod_actividad_asignatura
    ) -- Solo actividades calificadas
  ORDER BY 
    aca.Cod_parcial, aca.Fechayhora_Inicio ASC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerActividadesPorAsignatura` (IN `Cod_seccion_asignatura` INT)   BEGIN
  SELECT 
    aa.Cod_actividad_asignatura,
        aca.Nombre_actividad_academica,
        aca.Descripcion AS Descripcion_actividad,
        aca.Fechayhora_Inicio,
        aca.Fechayhora_Fin,
        aca.Valor,
        aca.Cod_parcial,
        p.Nombre_parcial, -- Incluye el nombre del parcial
        -- Verifica si la actividad ha sido completamente calificada
        CASE 
            WHEN (
                SELECT COUNT(*)
                FROM tbl_secciones_matricula sm
                WHERE sm.Cod_seccion = sa.Cod_secciones
            ) = (
                SELECT COUNT(*)
                FROM tbl_notas n
                WHERE n.Cod_actividad_asignatura = aa.Cod_actividad_asignatura
            )
            THEN 'Calificada'
            ELSE 'Pendiente'
        END AS EstadoCalificacion
    FROM 
        tbl_actividades_asignatura aa
    JOIN 
        tbl_actividades_academicas aca ON aa.Cod_actividad_academica = aca.Cod_actividad_academica
    JOIN 
        tbl_parciales p ON aca.Cod_parcial = p.Cod_parcial
    JOIN 
        tbl_secciones_asignaturas sa ON aa.Cod_seccion_asignatura = sa.Cod_seccion_asignatura
    WHERE 
        aa.Cod_seccion_asignatura = Cod_seccion_asignatura
    ORDER BY 
        aca.Cod_parcial, aca.Fechayhora_Inicio ASC; -- Ordena primero por parcial, luego por fecha
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerActividadesPorEstudiante` (IN `codPersona` INT)   BEGIN
    -- Declarar la variable para almacenar el rol del usuario
    DECLARE codRol INT;

    -- Verificar si el usuario tiene el rol de estudiante
    SELECT Cod_rol INTO codRol 
    FROM tbl_usuarios 
    WHERE Cod_persona = codPersona;

    -- Si el rol no es "1" (Estudiante), lanzar un error
    IF codRol <> 1 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El usuario no es un Estudiante';
    ELSE
        -- Obtener las asignaturas, actividades, y calificaciones relacionadas con las secciones del estudiante
        SELECT 
            acta.Cod_actividad_asignatura,
            sa.Cod_seccion_asignatura,
            sa.Cod_secciones,
            sa.Hora_inicio, 
            sa.Hora_fin,
            pa.Nombre_parcial,
            p.Descripcion_ponderacion,
            a.Nombre_asignatura,
            a.Descripcion_asignatura,
            aa.Fechayhora_Inicio,
            aa.Fechayhora_Fin,
            aa.Valor,
            aa.Cod_secciones,
            aa.Cod_parcial,
            aa.Nombre_actividad_academica,
            aa.Descripcion,
            aa.Valor
        FROM 
            tbl_secciones_asignaturas sa
        JOIN 
            tbl_actividades_asignatura acta ON sa.Cod_seccion_asignatura = acta.Cod_seccion_asignatura
        JOIN 
            tbl_actividades_academicas aa ON acta.Cod_actividad_academica = aa.Cod_actividad_academica
        JOIN 
            tbl_ponderaciones_ciclos pc ON aa.Cod_ponderacion_ciclo = pc.Cod_ponderacion_ciclo
        JOIN 
            tbl_ponderaciones p ON p.Cod_ponderacion = pc.Cod_ponderacion
        JOIN 
            tbl_grados_asignaturas ga ON sa.Cod_grados_asignaturas = ga.Cod_grados_asignaturas
        JOIN 
            tbl_parciales pa ON aa.Cod_parcial = pa.Cod_parcial
        JOIN 
            tbl_asignaturas a ON ga.Cod_asignatura = a.Cod_asignatura
        WHERE 
            sa.Cod_secciones IN (
                SELECT sm.Cod_seccion 
                FROM tbl_secciones_matricula sm 
                WHERE sm.Cod_persona = codPersona
            );

    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerActividadesPorPadre` (IN `codPersonaPadre` INT)   BEGIN
    -- Validar que el usuario es un padre
   DECLARE codRol INT;

    SELECT Cod_rol INTO codRol 
    FROM tbl_usuarios 
    WHERE Cod_persona = codPersonaPadre;

    -- Verificar que el usuario es un padre
    IF codRol <> 1 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El usuario no es un Padre';
    ELSE
        -- Obtener las actividades académicas de todos los hijos asociados al padre junto con los nombres de los hijos
SELECT 
    ef.cod_persona_estudiante AS cod_hijo,
    COALESCE(CONCAT(hijo.Nombre, ' ', hijo.Primer_apellido), 'Sin nombre') AS nombre_hijo,
    COALESCE(acta.Cod_actividad_asignatura, 0) AS Cod_actividad_asignatura,
    COALESCE(sa.Cod_seccion_asignatura, 0) AS Cod_seccion_asignatura,
    COALESCE(sa.Cod_secciones, 0) AS Cod_secciones,
    COALESCE(sa.Hora_inicio, '00:00:00') AS Hora_inicio,
    COALESCE(sa.Hora_fin, '00:00:00') AS Hora_fin,
    COALESCE(pa.Nombre_parcial, 'Sin parcial') AS Nombre_parcial,
    COALESCE(p.Descripcion_ponderacion, 'Sin descripción') AS Descripcion_ponderacion,
    COALESCE(a.Nombre_asignatura, 'Sin asignatura') AS Nombre_asignatura,
    COALESCE(a.Descripcion_asignatura, 'Sin descripción') AS Descripcion_asignatura,
    COALESCE(aa.Fechayhora_Inicio, '0000-00-00 00:00:00') AS Fechayhora_Inicio,
    COALESCE(aa.Fechayhora_Fin, '0000-00-00 00:00:00') AS Fechayhora_Fin,
    COALESCE(aa.Valor, 0) AS Valor,
    COALESCE(aa.Cod_secciones, 0) AS Cod_secciones,
    COALESCE(aa.Cod_parcial, 0) AS Cod_parcial,
    COALESCE(aa.Nombre_actividad_academica, 'Sin actividad') AS Nombre_actividad_academica,
    COALESCE(aa.Descripcion, 'Sin descripción') AS Descripcion
FROM 
    tbl_estructura_familiar ef
LEFT JOIN 
    tbl_personas hijo ON ef.cod_persona_estudiante = hijo.cod_persona
LEFT JOIN 
    tbl_secciones_matricula sm ON sm.Cod_persona = ef.cod_persona_estudiante
LEFT JOIN 
    tbl_secciones_asignaturas sa ON sm.Cod_seccion = sa.Cod_secciones
LEFT JOIN 
    tbl_actividades_asignatura acta ON sa.Cod_seccion_asignatura = acta.Cod_seccion_asignatura
LEFT JOIN 
    tbl_actividades_academicas aa ON acta.Cod_actividad_academica = aa.Cod_actividad_academica
LEFT JOIN 
    tbl_ponderaciones_ciclos pc ON aa.Cod_ponderacion_ciclo = pc.Cod_ponderacion_ciclo
LEFT JOIN 
    tbl_ponderaciones p ON p.Cod_ponderacion = pc.Cod_ponderacion
LEFT JOIN 
    tbl_grados_asignaturas ga ON sa.Cod_grados_asignaturas = ga.Cod_grados_asignaturas
LEFT JOIN 
    tbl_parciales pa ON aa.Cod_parcial = pa.Cod_parcial
LEFT JOIN 
    tbl_asignaturas a ON ga.Cod_asignatura = a.Cod_asignatura
WHERE 
    ef.cod_persona_padre = codPersonaPadre;

    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerActividadesPorProfesor` (IN `codProfesor` INT, IN `codSeccionAsignatura` INT)   BEGIN
    SELECT 
        aa.Cod_actividad_academica,
        aa.Cod_profesor,
        aa.Cod_parcial,
        aa.Nombre_actividad_academica,
        aa.Descripcion,
        aa.Fechahora_Inicio,
        aa.Fechahora_Fin,
        aa.Valor,
        aa.Cod_secciones
    FROM tbl_actividades_academicas aa
    JOIN tbl_actividades_asignatura sa ON aa.Cod_actividad_academica = sa.Cod_actividad_academica
    WHERE aa.Cod_profesor = codProfesor
    AND sa.Cod_seccion_asignatura = codSeccionAsignatura;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerActividadesPorSeccionAsignatura` (IN `codSeccionAsignatura` INT)   BEGIN
    SELECT 
        aa.Cod_actividad_academica,
        aa.Cod_profesor,
        aa.Cod_ponderacion_ciclo,
        aa.Cod_parcial,
        aa.Nombre_actividad_academica,
        aa.Descripcion,
        aa.Fechayhora_Inicio,
        aa.Fechayhora_Fin,
        aa.Valor,
        aa.Cod_secciones
    FROM 
        tbl_actividades_academicas aa
    JOIN 
        tbl_actividades_asignatura aasa 
        ON aa.Cod_actividad_academica = aasa.Cod_actividad_academica
    WHERE 
        aasa.Cod_seccion_asignatura = codSeccionAsignatura;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerAsignaturasPorProfesor` (IN `codProfesor` INT, IN `Cod_secciones` INT)   BEGIN
    SELECT DISTINCT
        sa.Cod_seccion_asignatura,
        sa.Cod_secciones,
        sa.Hora_inicio,
        sa.Hora_fin,
        sa.Cod_grados_asignaturas,
        sa.Dias_nombres,
        a.Cod_asignatura, -- Asegúrate de incluir este campo
        a.Nombre_asignatura,
        a.Descripcion_asignatura
    FROM tbl_secciones_asignaturas sa
    JOIN tbl_grados_asignaturas ga ON sa.Cod_grados_asignaturas = ga.Cod_grados_asignaturas
    JOIN tbl_asignaturas a ON ga.Cod_asignatura = a.Cod_asignatura
    WHERE sa.Cod_secciones = Cod_secciones
      AND sa.Cod_seccion_asignatura IS NOT NULL;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `obtenerAsignaturasPorSeccion` (IN `codSeccion` INT)   BEGIN
    SELECT 
        a.Cod_asignatura, 
        a.Nombre_asignatura, 
        a.Descripcion_asignatura
    FROM tbl_asignaturas AS a
    JOIN tbl_secciones_asignaturas AS sa 
        ON a.Cod_asignatura = sa.Cod_asignatura
    WHERE sa.Cod_secciones = codSeccion; -- Usa el parámetro para filtrar por sección
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerAsignaturasPorSeccionEspecifica` (IN `codProfesor` INT, IN `codSeccion` INT)   BEGIN
    SELECT DISTINCT
        sa.Cod_seccion_asignatura,
        sa.Cod_secciones,
        sa.Hora_inicio,
        sa.Hora_fin,
        sa.Cod_grados_asignaturas,
        sa.Cod_dias,
        a.Nombre_asignatura,
        a.Descripcion_asignatura
    FROM tbl_secciones_asignaturas sa
    JOIN tbl_asignaturas a ON sa.Cod_grados_asignaturas = a.Cod_asignatura
    WHERE sa.Cod_secciones = codSeccion
    AND sa.Cod_seccion_asignatura IS NOT NULL;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerCodProfesorPorCodPersona` (IN `CodPersona` INT, OUT `CodProfesor` INT)   BEGIN
  -- Busca el Cod_profesor en la tabla de profesores usando el Cod_persona
  SELECT Cod_profesor INTO CodProfesor
  FROM tbl_profesores
  WHERE Cod_persona = CodPersona
  LIMIT 1; -- Asegúrate de que solo obtenga un resultado
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerConceptoPago` (IN `p_Cod_concepto` INT)   BEGIN
    IF p_Cod_concepto IS NULL THEN
        -- Mostrar todos los conceptos
        SELECT Cod_concepto, Concepto, Descripcion, Fecha_creacion, Activo
        FROM tbl_concepto_pago ;
    ELSE
        -- Mostrar un concepto en específico por su ID
        SELECT Cod_concepto, Concepto, Descripcion, Fecha_creacion, Activo
        FROM tbl_concepto_pago 
        WHERE Cod_concepto = p_Cod_concepto;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerConteoParcialesPorSeccion` (IN `Cod_seccion` INT)   BEGIN
 SELECT 
    sa.Cod_seccion_asignatura, -- Incluye el código de la tabla secciones asignaturas
        a.Nombre_asignatura,
        a.Descripcion_asignatura,
        COUNT(n.Cod_nota) AS Total_Notas
    FROM 
        tbl_secciones_asignaturas sa
    JOIN 
        tbl_grados_asignaturas ga ON sa.Cod_grados_asignaturas = ga.Cod_grados_asignaturas
    JOIN 
        tbl_asignaturas a ON ga.Cod_asignatura = a.Cod_asignatura
    LEFT JOIN 
        tbl_actividades_asignatura aa ON sa.Cod_seccion_asignatura = aa.Cod_seccion_asignatura
    LEFT JOIN 
        tbl_notas n ON aa.Cod_actividad_asignatura = n.Cod_actividad_asignatura
    WHERE 
        sa.Cod_secciones = Cod_seccion -- Aquí se coloca el parámetro de la sección
    GROUP BY 
        sa.Cod_seccion_asignatura, a.Nombre_asignatura, a.Descripcion_asignatura; 

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerEstudiantesConNotas` (IN `p_CodSeccion` INT, IN `p_CodSeccionAsignatura` INT, IN `p_CodParcial` INT)   BEGIN
   DECLARE umbral_aprobacion INT;

    -- Obtener el valor del umbral de aprobación desde la tabla tbl_parametros
    SELECT Valor INTO umbral_aprobacion 
    FROM tbl_parametros
    WHERE Parametro = 'UMBRAL_APROBACION'
    LIMIT 1;

    SELECT 
        sm.Cod_seccion_matricula AS CodSeccionMatricula,
        p.cod_persona AS CodPersona,
        p.dni_persona AS Identidad, -- Se agrega la columna de identidad
        CONCAT(p.Nombre, ' ', p.Segundo_nombre, ' ', p.Primer_apellido, ' ', p.Segundo_apellido) AS NombreCompleto,
        IFNULL(SUM(n.Nota), 0) AS NotaTotal,
        -- Unir con la tabla tbl_estado_nota para obtener el estado dinámicamente
        CASE 
            WHEN IFNULL(SUM(n.Nota), 0) >= umbral_aprobacion THEN es.Descripcion
            ELSE es_reprobado.Descripcion
        END AS EstadoNota
    FROM 
        tbl_secciones_matricula sm
    INNER JOIN 
        tbl_personas p ON sm.Cod_persona = p.cod_persona
    LEFT JOIN 
        tbl_notas n ON sm.Cod_seccion_matricula = n.Cod_seccion_matricula
    LEFT JOIN 
        tbl_actividades_asignatura aa ON n.Cod_actividad_asignatura = aa.Cod_actividad_asignatura
    LEFT JOIN 
        tbl_actividades_academicas aca ON aa.Cod_actividad_academica = aca.Cod_actividad_academica
    LEFT JOIN 
        tbl_secciones_asignaturas sa ON aa.Cod_seccion_asignatura = sa.Cod_seccion_asignatura
    LEFT JOIN 
        tbl_estado_nota es ON es.Cod_estado = 1  -- Estado 'APROBADO'
    LEFT JOIN 
        tbl_estado_nota es_reprobado ON es_reprobado.Cod_estado = 2  -- Estado 'REPROBADO'
    WHERE 
        sm.Cod_seccion = p_CodSeccion
        AND sa.Cod_seccion_asignatura = p_CodSeccionAsignatura
        AND aca.Cod_parcial = p_CodParcial
    GROUP BY 
        sm.Cod_seccion_matricula, p.cod_persona;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerGradosMatricula` ()  NO SQL BEGIN
    -- Seleccionar grados únicos
    SELECT DISTINCT
        g.Cod_grado,
        g.Nombre_grado
    FROM 
        tbl_grados AS g
    INNER JOIN 
        tbl_secciones_matricula AS sm
    ON 
        g.Cod_grado = sm.Cod_grado
    ORDER BY 
        g.Nombre_grado;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerNotasModal` (IN `p_Cod_secciones` INT, IN `p_Cod_seccion_asignatura` INT, IN `p_Cod_parcial` INT, IN `p_Cod_actividad_asignatura` INT)   BEGIN
    SELECT 
        n.Cod_nota,
        n.Cod_seccion_matricula AS Estudiante,
        CONCAT(p.Nombre, ' ', p.Segundo_nombre, ' ', p.Primer_apellido, ' ', p.Segundo_apellido) AS Nombre_Completo,
        n.Nota,
        n.Observacion
    FROM 
        tbl_notas n
    INNER JOIN 
        tbl_secciones_matricula sm ON n.Cod_seccion_matricula = sm.Cod_seccion_matricula
    INNER JOIN 
        tbl_personas p ON sm.Cod_persona = p.cod_persona
    INNER JOIN 
        tbl_actividades_asignatura aa ON n.Cod_actividad_asignatura = aa.Cod_actividad_asignatura
    INNER JOIN 
        tbl_actividades_academicas aca ON aa.Cod_actividad_academica = aca.Cod_actividad_academica
    WHERE 
        aca.Cod_secciones = p_Cod_secciones
        AND aa.Cod_seccion_asignatura = p_Cod_seccion_asignatura
        AND n.Cod_parcial = p_Cod_parcial
        AND n.Cod_actividad_asignatura = p_Cod_actividad_asignatura;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerNotasYPromedio` (IN `CodSeccionMatricula` INT)   BEGIN
  -- Obtener las notas por parcial (incluyendo recuperación, si existe alguna)
    SELECT 
        a.Nombre_asignatura AS Asignatura,
        p.Nombre_parcial AS Parcial,
        SUM(CASE 
                WHEN n.Nota IS NOT NULL THEN n.Nota 
                ELSE NULL
            END) AS Nota_Parcial -- Incluye notas y muestra NULL si no existe
    FROM 
        tbl_secciones_asignaturas sa
    INNER JOIN 
        tbl_grados_asignaturas ga ON sa.Cod_grados_asignaturas = ga.Cod_grados_asignaturas
    INNER JOIN 
        tbl_asignaturas a ON ga.Cod_asignatura = a.Cod_asignatura
    CROSS JOIN 
        tbl_parciales p -- Garantiza que todos los parciales estén presentes
    LEFT JOIN 
        tbl_actividades_asignatura aa ON sa.Cod_seccion_asignatura = aa.Cod_seccion_asignatura
    LEFT JOIN 
        tbl_actividades_academicas ac ON aa.Cod_actividad_academica = ac.Cod_actividad_academica
    LEFT JOIN 
        tbl_ponderaciones_ciclos pc ON ac.Cod_ponderacion_ciclo = pc.Cod_ponderacion_ciclo
    LEFT JOIN 
        tbl_ponderaciones pon ON pc.Cod_ponderacion = pon.Cod_ponderacion
    LEFT JOIN 
        tbl_notas n ON aa.Cod_actividad_asignatura = n.Cod_actividad_asignatura 
        AND n.Cod_parcial = p.Cod_parcial
        AND n.Cod_seccion_matricula = CodSeccionMatricula
    WHERE 
        sa.Cod_secciones = (SELECT sm.Cod_seccion 
                            FROM tbl_secciones_matricula sm 
                            WHERE sm.Cod_seccion_matricula = CodSeccionMatricula)
        AND (p.Nombre_parcial LIKE 'RECU%' OR p.Nombre_parcial NOT LIKE 'RECU%')
    GROUP BY 
        a.Cod_asignatura, p.Cod_parcial
    ORDER BY 
        a.Nombre_asignatura, p.Cod_parcial;

    -- Calcular el promedio final por asignatura, considerando la nota de recuperación si existe
    SELECT 
        a.Nombre_asignatura AS Asignatura,
        ROUND(
            CASE
                WHEN MAX(p.Nombre_parcial LIKE 'RECU%') > 0 THEN
                    -- Si existe una recuperación, asigna la nota de recuperación como promedio final
                    MAX(CASE WHEN p.Nombre_parcial LIKE 'RECU%' THEN n.Nota END)
                ELSE
                    -- Si no hay recuperación, calcula el promedio de los parciales normales
                    AVG(CASE 
                        WHEN p.Nombre_parcial NOT LIKE 'RECU%' 
                        THEN total.Nota_Parcial
                        ELSE NULL 
                    END)
            END, 2) AS Promedio_Final
    FROM (
        -- Subconsulta para obtener la sumatoria de las notas por parcial
        SELECT 
            a.Cod_asignatura,
            p.Cod_parcial,
            SUM(CASE 
                    WHEN n.Nota IS NOT NULL THEN n.Nota 
                    ELSE NULL 
                END) AS Nota_Parcial -- Incluye notas y muestra NULL si no existe
        FROM 
            tbl_secciones_asignaturas sa
        INNER JOIN 
            tbl_grados_asignaturas ga ON sa.Cod_grados_asignaturas = ga.Cod_grados_asignaturas
        INNER JOIN 
            tbl_asignaturas a ON ga.Cod_asignatura = a.Cod_asignatura
        CROSS JOIN 
            tbl_parciales p -- Garantiza que todos los parciales estén presentes
        LEFT JOIN 
            tbl_actividades_asignatura aa ON sa.Cod_seccion_asignatura = aa.Cod_seccion_asignatura
        LEFT JOIN 
            tbl_actividades_academicas ac ON aa.Cod_actividad_academica = ac.Cod_actividad_academica
        LEFT JOIN 
            tbl_ponderaciones_ciclos pc ON ac.Cod_ponderacion_ciclo = pc.Cod_ponderacion_ciclo
        LEFT JOIN 
            tbl_ponderaciones pon ON pc.Cod_ponderacion = pon.Cod_ponderacion
        LEFT JOIN 
            tbl_notas n ON aa.Cod_actividad_asignatura = n.Cod_actividad_asignatura 
            AND n.Cod_parcial = p.Cod_parcial
            AND n.Cod_seccion_matricula = CodSeccionMatricula
        WHERE 
            sa.Cod_secciones = (SELECT sm.Cod_seccion 
                                FROM tbl_secciones_matricula sm 
                                WHERE sm.Cod_seccion_matricula = CodSeccionMatricula)
        GROUP BY 
            a.Cod_asignatura, p.Cod_parcial
        HAVING 
            Nota_Parcial IS NOT NULL -- Excluir parciales sin notas
    ) AS total
    INNER JOIN tbl_asignaturas a ON total.Cod_asignatura = a.Cod_asignatura
    INNER JOIN tbl_parciales p ON total.Cod_parcial = p.Cod_parcial
    LEFT JOIN tbl_notas n ON n.Cod_parcial = p.Cod_parcial 
        AND n.Cod_seccion_matricula = CodSeccionMatricula
    GROUP BY 
        a.Cod_asignatura
    ORDER BY 
        a.Nombre_asignatura;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerPersonasPorGrado` (IN `Cod_grado` INT)   BEGIN
    -- Seleccionar las personas asociadas a un grado específico
    SELECT DISTINCT
        sm.Cod_grado,
        g.Nombre_grado,
        sm.Cod_persona,
        p.Nombre AS PNombre_persona,
        p.Segundo_nombre AS SNombre_persona,
        p.Primer_apellido AS PApellido_persona,
        p.Segundo_apellido AS SApellido_persona
    FROM 
        tbl_secciones_matricula AS sm
    INNER JOIN 
        tbl_grados AS g
    ON 
        sm.Cod_grado = g.Cod_grado
    INNER JOIN 
        tbl_personas AS p
    ON 
        sm.Cod_persona = p.cod_persona
    WHERE 
        sm.Cod_grado = Cod_grado -- Filtrar por el código del grado
    ORDER BY 
       p.Nombre, p.Primer_apellido;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerPonderacionesPorProfesor` (IN `CodPersona` INT)   BEGIN
    -- Declarar variables
    DECLARE CodProfesor INT;
    DECLARE CodGrado INT;
    DECLARE CodCiclo INT;

    -- Obtener el código del profesor
    SELECT Cod_profesor
    INTO CodProfesor
    FROM tbl_profesores
    WHERE Cod_persona = CodPersona;

    -- Obtener el código del grado asociado a la sección del profesor
    SELECT Cod_grado
    INTO CodGrado
    FROM tbl_secciones
    WHERE Cod_Profesor = CodProfesor
    LIMIT 1;

    -- Obtener el código del ciclo al que pertenece el grado
    SELECT Cod_ciclo
    INTO CodCiclo
    FROM tbl_grados
    WHERE Cod_grado = CodGrado;

    -- Seleccionar las ponderaciones del ciclo correspondiente
    SELECT 
        pc.Cod_ponderacion_ciclo,
        p.Descripcion_ponderacion,
        pc.Valor
    FROM tbl_ponderaciones_ciclos pc
    JOIN tbl_ponderaciones p ON pc.Cod_ponderacion = p.Cod_ponderacion
    WHERE pc.Cod_ciclo = CodCiclo;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerPromedioParcialesPorSeccion` (IN `Cod_seccion` INT)   BEGIN
  -- Crear una tabla temporal para almacenar las sumatorias por estudiante y parcial
    CREATE TEMPORARY TABLE TempSumatoriasEstudiante (
        CodSeccionMatricula INT,
        CodParcial INT,
        CodSeccionAsignatura INT,
        Sumatoria DECIMAL(10, 2)
    );

    -- Calcular las sumatorias de las notas por estudiante, parcial y asignatura
    INSERT INTO TempSumatoriasEstudiante (CodSeccionMatricula, CodParcial, CodSeccionAsignatura, Sumatoria)
    SELECT 
        sm.Cod_seccion_matricula,
        n.Cod_parcial,
        sa.Cod_seccion_asignatura,
        SUM(n.Nota) AS Sumatoria
    FROM 
        tbl_notas n
    INNER JOIN 
        tbl_actividades_asignatura aa ON n.Cod_actividad_asignatura = aa.Cod_actividad_asignatura
    INNER JOIN 
        tbl_secciones_asignaturas sa ON aa.Cod_seccion_asignatura = sa.Cod_seccion_asignatura
    INNER JOIN 
        tbl_secciones_matricula sm ON sm.Cod_seccion_matricula = n.Cod_seccion_matricula
    WHERE 
        sa.Cod_secciones = Cod_seccion
    GROUP BY 
        sm.Cod_seccion_matricula, n.Cod_parcial, sa.Cod_seccion_asignatura;

    -- Calcular el promedio por parcial para cada asignatura
    CREATE TEMPORARY TABLE TempPromedioPorParcial (
        CodSeccionAsignatura INT,
        CodParcial INT,
        PromedioParcial DECIMAL(10, 2)
    );

    INSERT INTO TempPromedioPorParcial (CodSeccionAsignatura, CodParcial, PromedioParcial)
    SELECT 
        CodSeccionAsignatura,
        CodParcial,
        ROUND(AVG(Sumatoria), 2) AS PromedioParcial
    FROM 
        TempSumatoriasEstudiante
    GROUP BY 
        CodSeccionAsignatura, CodParcial;

    -- Calcular el promedio general basado en parciales para cada asignatura
    SELECT 
        sa.Cod_seccion_asignatura, -- Incluye el código de la tabla secciones asignaturas
        a.Nombre_asignatura,
        a.Descripcion_asignatura,
        ROUND(
            IFNULL(SUM(tp.PromedioParcial) / COUNT(DISTINCT tp.CodParcial), 0), 2
        ) AS Promedio_Notas -- Calcula el promedio general basado en los parciales
    FROM 
        tbl_secciones_asignaturas sa
    JOIN 
        tbl_grados_asignaturas ga ON sa.Cod_grados_asignaturas = ga.Cod_grados_asignaturas
    JOIN 
        tbl_asignaturas a ON ga.Cod_asignatura = a.Cod_asignatura
    LEFT JOIN 
        TempPromedioPorParcial tp ON sa.Cod_seccion_asignatura = tp.CodSeccionAsignatura
    WHERE 
        sa.Cod_secciones = Cod_seccion
    GROUP BY 
        sa.Cod_seccion_asignatura, a.Nombre_asignatura, a.Descripcion_asignatura;

    -- Limpiar tablas temporales
    DROP TEMPORARY TABLE TempSumatoriasEstudiante;
    DROP TEMPORARY TABLE TempPromedioPorParcial;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerRolYCorreo` (IN `p_cod_usuario` INT)   BEGIN
    SELECT 
        u.cod_rol, 
        u.correo_usuario, 
        u.nombre_usuario
    FROM 
        tbl_usuarios u
    WHERE 
        u.cod_usuario = p_cod_usuario
    LIMIT 1; -- Limita el resultado a un solo registro
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `obtenerSeccionAsignaturaPorId` (IN `id` INT)   BEGIN
    SELECT 
        Cod_seccion_asignatura,
        Cod_secciones,
        Hora_inicio,
        Hora_fin,
        Cod_grados_asignaturas
    FROM 
        tbl_seccion_asignatura
    WHERE 
        Cod_seccion_asignatura = id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `obtenerSeccionesAsignaturas` ()   BEGIN
  SELECT 
    Cod_seccion_asignatura,
    Cod_secciones,
    Hora_inicio,
    Hora_fin,
    Cod_grados_asignaturas
  FROM 
    tbl_secciones_asignaturas;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `obtenerSeccionesPorProfesor` (IN `cod_profesor` INT)   BEGIN
    SELECT s.Cod_secciones, s.Nombre_seccion, s.Cod_grado, s.Cod_periodo_matricula
    FROM tbl_secciones AS s
    WHERE s.Cod_profesor = cod_profesor;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerTodasLasMatriculasSaintPatrick` (IN `p_Cod_matricula` INT)   BEGIN
    IF p_Cod_matricula IS NULL THEN
        -- Mostrar todas las matrículas
        SELECT 
            matricula.Cod_matricula,
            IFNULL(matricula.codificacion_matricula, 'N/A') AS codificacion_matricula,  -- Manejar NULL en codificacion_matricula
            matricula.fecha_matricula,
            matricula.Cod_estado_matricula,
            matricula.Cod_periodo_matricula,
            matricula.Cod_tipo_matricula,
            
            hijo.cod_persona AS Cod_Hijo,
            hijo.Nombre AS Nombre_Hijo,
            hijo.Primer_apellido AS Apellido_Hijo,
            
            padre.cod_persona AS Cod_Padre,
            padre.Nombre AS Nombre_Padre,
            padre.Primer_apellido AS Apellido_Padre,
            
            seccion_matricula.Cod_seccion,
            seccion.Nombre_seccion,            -- Nombre de la sección
            grado.Cod_grado,                   -- Código del grado
            grado.Nombre_grado                 -- Nombre del grado
        FROM 
            tbl_matricula AS matricula
        JOIN 
            tbl_personas AS hijo ON matricula.cod_persona = hijo.cod_persona
        JOIN 
            tbl_estructura_familiar AS estructura ON hijo.cod_persona = estructura.Cod_persona_estudiante
        JOIN 
            tbl_personas AS padre ON estructura.Cod_persona_padre = padre.cod_persona
        JOIN 
            tbl_secciones_matricula AS seccion_matricula ON matricula.Cod_matricula = seccion_matricula.Cod_matricula
        LEFT JOIN 
            tbl_secciones AS seccion ON seccion_matricula.Cod_seccion = seccion.Cod_secciones
        LEFT JOIN 
            tbl_grados AS grado ON seccion_matricula.Cod_grado = grado.Cod_grado
        LEFT JOIN 
            tbl_tipo_matricula AS tipo_matricula ON matricula.Cod_tipo_matricula = tipo_matricula.Cod_tipo_matricula
        LEFT JOIN 
            tbl_estado_matricula AS estado_matricula ON matricula.Cod_estado_matricula = estado_matricula.Cod_estado_matricula;
    ELSE
        -- Mostrar un concepto en específico por su ID
        SELECT 
            matricula.Cod_matricula,
            IFNULL(matricula.codificacion_matricula, 'N/A') AS codificacion_matricula,  -- Manejar NULL en codificacion_matricula
            matricula.fecha_matricula,
            matricula.Cod_estado_matricula,
            matricula.Cod_periodo_matricula,
            matricula.Cod_tipo_matricula,
            
            hijo.cod_persona AS Cod_Hijo,
            hijo.Nombre AS Nombre_Hijo,
            hijo.Primer_apellido AS Apellido_Hijo,
            
            padre.cod_persona AS Cod_Padre,
            padre.Nombre AS Nombre_Padre,
            padre.Primer_apellido AS Apellido_Padre,
            
            seccion_matricula.Cod_seccion,
            seccion.Nombre_seccion,            -- Nombre de la sección
            grado.Cod_grado,                   -- Código del grado
            grado.Nombre_grado                 -- Nombre del grado
        FROM 
            tbl_matricula AS matricula
        JOIN 
            tbl_personas AS hijo ON matricula.cod_persona = hijo.cod_persona
        JOIN 
            tbl_estructura_familiar AS estructura ON hijo.cod_persona = estructura.Cod_persona_estudiante
        JOIN 
            tbl_personas AS padre ON estructura.Cod_persona_padre = padre.cod_persona
        JOIN 
            tbl_secciones_matricula AS seccion_matricula ON matricula.Cod_matricula = seccion_matricula.Cod_matricula
        LEFT JOIN 
            tbl_secciones AS seccion ON seccion_matricula.Cod_seccion = seccion.Cod_secciones
        LEFT JOIN 
            tbl_grados AS grado ON seccion_matricula.Cod_grado = grado.Cod_grado
        LEFT JOIN 
            tbl_tipo_matricula AS tipo_matricula ON matricula.Cod_tipo_matricula = tipo_matricula.Cod_tipo_matricula
        LEFT JOIN 
            tbl_estado_matricula AS estado_matricula ON matricula.Cod_estado_matricula = estado_matricula.Cod_estado_matricula
        WHERE 
            matricula.Cod_matricula = p_Cod_matricula;  -- Filtrar por el código de matrícula proporcionado
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerUsuarioPorID` (IN `p_cod_usuario` INT)   BEGIN
    SELECT *
    FROM tbl_usuarios
    WHERE cod_usuario = p_cod_usuario;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerUsuarios` ()   BEGIN
    SELECT * FROM tbl_usuarios;  -- Ajusta la consulta según tu esquema
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `obtener_actividades_por_filtro` (IN `codProfesor` INT, IN `codSeccion` INT, IN `codParcial` INT, IN `codAsignatura` INT)   BEGIN
    SELECT 
        aa.Cod_actividad_academica,
        aa.Cod_profesor,
        aa.Cod_ponderacion_ciclo,
        aa.Cod_parcial,
        aa.Nombre_actividad_academica,
        aa.Descripcion,
        aa.Fechayhora_Inicio,
        aa.Fechayhora_Fin,
        aa.Valor,
        aa.Cod_secciones,
        sa.Cod_seccion_asignatura,
        ga.Cod_asignatura
    FROM 
        tbl_actividades_academicas aa
    INNER JOIN tbl_secciones s 
        ON aa.Cod_secciones = s.Cod_secciones
    INNER JOIN tbl_secciones_asignaturas sa 
        ON s.Cod_secciones = sa.Cod_secciones
    INNER JOIN tbl_actividades_asignatura act_asig
        ON aa.Cod_actividad_academica = act_asig.Cod_actividad_academica
        AND act_asig.Cod_seccion_asignatura = sa.Cod_seccion_asignatura
    INNER JOIN tbl_grados_asignaturas ga 
        ON sa.Cod_grados_asignaturas = ga.Cod_grados_asignaturas
    WHERE 
        aa.Cod_profesor = codProfesor
        AND aa.Cod_secciones = codSeccion
        AND aa.Cod_parcial = codParcial
        AND ga.Cod_asignatura = codAsignatura;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `obtener_aulas` (IN `p_Cod_aula` INT)   BEGIN
    IF p_Cod_aula IS NULL THEN
        SELECT * FROM tbl_aula; -- Retorna todas las aulas
    ELSE
        SELECT * FROM tbl_aula WHERE `Cod_aula` = p_Cod_aula; -- Retorna el aula específica
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `obtener_cod_profesor` (IN `p_codPersona` INT)   BEGIN
    SELECT Cod_profesor
    FROM tbl_profesores
    WHERE Cod_persona = p_codPersona;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `obtener_descuentos` (IN `p_Cod_descuento` INT)   BEGIN
    IF p_Cod_descuento IS NOT NULL THEN
        -- Obtener un descuento específico por ID
        SELECT * FROM tbl_descuentos 
        WHERE cod_descuento = p_Cod_descuento;
    ELSE
        -- Obtener todos los descuentos
        SELECT * FROM tbl_descuentos;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `obtener_parciales_por_filtro` (IN `codProfesor` INT, IN `codSeccion` INT, IN `codAsignatura` INT)   BEGIN
    SELECT 
        p.Cod_parcial,
        p.Nombre_parcial,
        p.Nota_recuperacion
    FROM 
        tbl_parciales p
    INNER JOIN tbl_secciones s ON s.Cod_secciones = codSeccion
    INNER JOIN tbl_secciones_asignaturas sa ON sa.Cod_secciones = s.Cod_secciones
    INNER JOIN tbl_grados_asignaturas ga ON sa.Cod_grados_asignaturas = ga.Cod_grados_asignaturas
    WHERE 
        ga.Cod_asignatura = codAsignatura;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `obtener_parciales_por_profesor` (IN `p_codProfesor` INT, IN `p_codSeccion` INT, IN `p_codSeccionAsignatura` INT)   BEGIN
    SELECT 
        p.Cod_parcial,
        p.Nombre_parcial,
        p.Nota_recuperacion
    FROM 
        tbl_parciales p
    WHERE 
        EXISTS (
            SELECT 1
            FROM tbl_secciones s
            INNER JOIN tbl_secciones_asignaturas sa ON sa.Cod_secciones = s.Cod_secciones
            WHERE 
                s.Cod_profesor = p_codProfesor
                AND s.Cod_secciones = p_codSeccion
                AND sa.Cod_seccion_asignatura = p_codSeccionAsignatura
        );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `obtener_parciales_por_seccion_y_asignatura` (IN `p_codProfesor` INT, IN `p_codSeccion` INT, IN `p_codAsignatura` INT)   BEGIN
    SELECT 
        p.Cod_parcial,
        p.Nombre_parcial,
        p.Fecha_inicio,
        p.Fecha_fin,
        p.Descripcion
    FROM tbl_parciales p
    INNER JOIN tbl_secciones s ON p.Cod_secciones = s.Cod_secciones
    INNER JOIN tbl_secciones_asignaturas sa ON s.Cod_secciones = sa.Cod_secciones
    WHERE 
        sa.Cod_asignatura = p_codAsignatura
        AND s.Cod_secciones = p_codSeccion
        AND EXISTS (
            SELECT 1 
            FROM tbl_profesores prof
            WHERE prof.Cod_Profesor = p_codProfesor
        );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `obtener_persona_por_dni` (IN `dni_input` VARCHAR(50))   BEGIN
    SELECT 
        cod_persona, 
        CONCAT(Nombre, ' ', IFNULL(Segundo_nombre, ''), ' ', Primer_apellido, ' ', IFNULL(Segundo_apellido, '')) AS nombre_completo
    FROM tbl_personas
    WHERE dni_persona = dni_input;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `obtener_solicitudes` ()   BEGIN
    -- Recupera todas las solicitudes de la tabla `tbl_solicitud`, incluyendo el estado
    SELECT 
        Cod_solicitud,
        Cod_persona,
        Nombre_solicitud,
        Fecha_solicitud,
        Hora_Inicio,
        Hora_Fin,
        Asunto,
        Persona_requerida,
        Estado, -- Se agrega la columna Estado
        CASE 
            WHEN Hora_Inicio < Hora_Fin THEN 0 
            ELSE 1 
        END AS Importante
    FROM tbl_solicitud;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `obtener_solicitudes_por_usuario` (IN `userCodPersona` INT)   BEGIN
    SELECT *
    FROM tbl_solicitud
    WHERE Cod_persona = userCodPersona;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `obtener_usuarios_por_rol_admin` ()   BEGIN
    SELECT 
        u.Cod_rol,       -- Incluye el campo Cod_rol
        u.cod_persona, 
        u.correo_usuario 
    FROM 
        tbl_usuarios u
    WHERE 
        u.Cod_rol = 2; -- Filtrar solo los usuarios con Cod_rol = 2
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `PreRegistrarUsuario` (IN `p_primer_nombre` VARCHAR(40), IN `p_primer_apellido` VARCHAR(40), IN `p_correo` VARCHAR(100), IN `p_contraseña` VARCHAR(255))   BEGIN
    -- Insertar en tbl_usuarios o una tabla temporal para pre-registros
    INSERT INTO tbl_pre_registro (primer_nombre, primer_apellido, correo_usuario, contraseña)
    VALUES (p_primer_nombre, p_primer_apellido, p_correo, p_contraseña);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Delete_Contacto` (IN `p_cod_contacto` INT(11))   BEGIN
    DELETE FROM tbl_contacto
    WHERE cod_contacto = p_cod_contacto;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Delete_EstructuraFamiliar` (IN `p_Cod_genealogia` INT)   BEGIN
    DELETE FROM tbl_estructura_familiar WHERE Cod_genealogia = p_Cod_genealogia;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Delete_Genero_Persona` (IN `p_Cod_genero` INT(11))   BEGIN
    DELETE FROM tbl_genero_persona
    WHERE Cod_genero = p_Cod_genero;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Delete_Municipios` ()   BEGIN
    DELETE FROM tbl_municipio 
    WHERE 
        Cod_municipio = p_Cod_municipio;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Delete_Nacionalidad` (IN `p_Cod_nacionalidad` INT)   BEGIN
    -- Verificar si el registro existe
    IF EXISTS (SELECT 1 FROM tbl_nacionalidad WHERE Cod_nacionalidad = p_Cod_nacionalidad) THEN
        DELETE FROM tbl_nacionalidad
        WHERE Cod_nacionalidad = p_Cod_nacionalidad;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El registro no existe.';
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Delete_Personas` (IN `p_cod_persona` INT)   BEGIN
    DELETE FROM tbl_personas
    WHERE cod_persona = p_cod_persona;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Delete_TipoRelacion` (IN `p_Cod_tipo_relacion` INT)   BEGIN
  DELETE FROM tbl_tipo_relacion WHERE Cod_tipo_relacion = p_Cod_tipo_relacion;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Delete_Tipo_Contacto` (IN `p_cod_tipo_contacto` INT(11))   BEGIN
    DELETE FROM tbl_tipo_contacto
    WHERE cod_tipo_contacto = p_cod_tipo_contacto;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Get_Contacto` ()   BEGIN
    SELECT * FROM tbl_contacto;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Get_Contacto_Por_Codigo` (IN `p_cod_contacto` INT(11))   BEGIN
    SELECT * FROM tbl_contacto
    WHERE cod_contacto = p_cod_contacto;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Get_Contacto_Por_Persona` (IN `p_cod_persona` INT(11))   BEGIN
    SELECT * FROM tbl_contacto
    WHERE cod_persona = p_cod_persona;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Get_Departamento` ()   BEGIN
    SELECT * FROM tbl_departamento;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Get_EstructuraFamiliar` ()   BEGIN
  SELECT * FROM tbl_estructura_familiar;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Get_Estructuras_Familiares` (IN `p_cod_persona` INT)   BEGIN
    SELECT 
        ef.Cod_genealogia,
        ef.cod_persona_padre,
        ef.cod_persona_estudiante,
        ef.cod_tipo_relacion,
        ef.descripcion
    FROM 
        tbl_estructura_familiar ef
    WHERE 
        ef.cod_persona_padre = p_cod_persona OR ef.cod_persona_estudiante = p_cod_persona;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Get_Genero_Persona` ()   BEGIN
    SELECT * FROM tbl_genero_persona;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Get_Genero_Persona_Por_Codigo` (IN `Cod_genero` INT(11))   BEGIN
    SELECT * FROM tbl_genero_persona
    WHERE Cod_genero = Cod_genero;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Get_Municipios` ()   BEGIN
    SELECT 
        Cod_municipio, 
        Nombre_municipio, 
        Cod_departamento 
    FROM 
        tbl_municipio;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Get_MunicipiosPorDepartamento` (IN `p_Cod_departamento` INT)   BEGIN
    SELECT 
        cod_municipio, 
        nombre_municipio
    FROM 
        tbl_municipio
    WHERE 
        cod_departamento = p_Cod_departamento
    ORDER BY 
        nombre_municipio ASC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Get_Municipios_Departamento` ()   BEGIN
  SELECT 
    m.Cod_municipio,
    m.Nombre_municipio,
    d.Cod_departamento,
    d.Nombre_departamento 
  FROM 
    tbl_municipio m
  JOIN 
    tbl_departamento d ON m.Cod_departamento = d.Cod_departamento;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Get_Nacionalidad` ()   BEGIN
    SELECT Cod_nacionalidad, Id_nacionalidad, pais_nacionalidad, pais
    FROM tbl_nacionalidad;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Get_Personas` ()   BEGIN
  SELECT * FROM tbl_personas;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Get_Persona_Detalle` (IN `p_cod_persona` INT)   BEGIN
    SELECT 
        dni_persona,
        Nombre,
        Segundo_nombre,
        Primer_apellido,
        Segundo_apellido,
        Nacionalidad,
        direccion_persona,
        fecha_nacimiento,
        Estado_Persona,
        cod_tipo_persona,
        cod_departamento,
        cod_genero
    FROM 
        tbl_personas
    WHERE 
        cod_persona = p_cod_persona;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Get_TipoRelacion` ()   BEGIN
  SELECT * FROM tbl_tipo_relacion;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Get_Tipo_Contacto` ()   BEGIN
    SELECT * FROM tbl_tipo_contacto;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Get_Tipo_Contacto_Por_Codigo` (IN `cod_tipo_contacto` INT)   BEGIN
    SELECT * 
    FROM tbl_tipo_contacto
    WHERE cod_tipo_contacto = cod_tipo_contacto;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Get_Tipo_Persona` ()   BEGIN
    SELECT * FROM tbl_tipo_persona;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Insert_Contacto` (IN `p_cod_persona` INT, IN `p_cod_tipo_contacto` INT, IN `p_Valor` VARCHAR(100))   BEGIN
    INSERT INTO tbl_contacto (cod_persona, cod_tipo_contacto, Valor)
    VALUES (p_cod_persona, p_cod_tipo_contacto, p_Valor);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Insert_Genero_Persona` (IN `Tipo_genero_param` VARCHAR(100))   BEGIN
    -- Validación: el campo no debe ser NULL ni vacío
    IF Tipo_genero_param IS NULL OR Tipo_genero_param = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El campo Tipo_genero no puede estar vacío.';
    END IF;

    -- Validación: el campo no debe exceder 100 caracteres
    IF CHAR_LENGTH(Tipo_genero_param) > 100 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Tipo_genero excede la longitud máxima permitida.';
    END IF;

    -- Inserta el registro en la tabla
    INSERT INTO tbl_genero_persona (Tipo_genero)
    VALUES (Tipo_genero_param);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Insert_Tipo_Contacto` (IN `tipo_contacto` VARCHAR(50))   BEGIN
    INSERT INTO tbl_tipo_contacto (tipo_contacto)
    VALUES (tipo_contacto);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Post_EstructuraFamiliar` (IN `p_cod_persona_estudiante` INT, IN `p_cod_persona_padre` INT, IN `p_cod_tipo_relacion` INT, IN `p_descripcion` VARCHAR(100))   BEGIN
    INSERT INTO tbl_estructura_familiar (
        cod_persona_estudiante, 
        cod_persona_padre, 
        cod_tipo_relacion,
        descripcion
    ) 
    VALUES (
        p_cod_persona_estudiante, 
        p_cod_persona_padre, 
        p_cod_tipo_relacion,
        p_descripcion
    );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Post_Municipios` (IN `p_Nombre_municipio` VARCHAR(255), IN `p_Cod_departamento` INT)   BEGIN
    INSERT INTO tbl_municipio (Nombre_municipio, Cod_departamento)
    VALUES (p_Nombre_municipio, p_Cod_departamento);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Post_Nacionalidad` (IN `p_Id_nacionalidad` VARCHAR(25), IN `p_pais_nacionalidad` VARCHAR(100), IN `p_pais` VARCHAR(250))   BEGIN
    -- Validar si ya existe una nacionalidad con el mismo Id_nacionalidad
    IF EXISTS (SELECT 1 FROM tbl_nacionalidad WHERE Id_nacionalidad = p_Id_nacionalidad) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El Id_nacionalidad ya existe.';
    ELSE
        INSERT INTO tbl_nacionalidad (Id_nacionalidad, pais_nacionalidad, pais)
        VALUES (p_Id_nacionalidad, p_pais_nacionalidad, p_pais);
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Post_Personas` (IN `p_dni_persona` VARCHAR(32), IN `p_nombre` TEXT, IN `p_segundo_nombre` TEXT, IN `p_primer_apellido` TEXT, IN `p_segundo_apellido` TEXT, IN `p_direccion_persona` VARCHAR(50), IN `p_fecha_nacimiento` DATE, IN `p_estado_persona` ENUM('A','S'), IN `p_principal` TINYINT(1), IN `p_cod_tipo_persona` INT, IN `p_cod_genero` INT, IN `p_cod_nacionalidad` INT, IN `p_cod_departamento` INT, IN `p_cod_municipio` INT)   BEGIN
    INSERT INTO tbl_personas (
        dni_persona,
        Nombre,
        Segundo_nombre,
        Primer_apellido,
        Segundo_apellido,
        direccion_persona,
        fecha_nacimiento,
        Estado_Persona,
        principal,
        cod_tipo_persona,
        cod_genero,
        cod_nacionalidad,
        cod_departamento,
        cod_municipio
    )
    VALUES (
        p_dni_persona,
        p_nombre,
        p_segundo_nombre,
        p_primer_apellido,
        p_segundo_apellido,
        p_direccion_persona,
        p_fecha_nacimiento,
        p_estado_persona,
        p_principal,
        p_cod_tipo_persona,
        p_cod_genero,
        p_cod_nacionalidad,
        p_cod_departamento,
        p_cod_municipio
    );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Post_TipoRelacion` (IN `p_Tipo_relacion` VARCHAR(50))   BEGIN
  INSERT INTO tbl_tipo_relacion (tipo_relacion) VALUES (p_Tipo_relacion);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Put_Contacto` (IN `p_cod_contacto` INT(11), IN `p_cod_persona` INT(11), IN `p_cod_tipo_contacto` INT(11), IN `p_Valor` VARCHAR(100))   BEGIN
    UPDATE tbl_contacto
    SET cod_persona = p_cod_persona,
        cod_tipo_contacto = p_cod_tipo_contacto,
        Valor = p_Valor
    WHERE cod_contacto = p_cod_contacto;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Put_EstructuraFamiliar` (IN `p_Cod_genealogia` INT, IN `p_cod_persona_estudiante` INT, IN `p_cod_persona_padre` INT, IN `p_cod_tipo_relacion` INT, IN `p_descripcion` VARCHAR(255))   BEGIN
    -- Actualiza el registro en la tabla tbl_estructura_familiar
    UPDATE tbl_estructura_familiar
    SET 
    	cod_persona_estudiante = p_cod_persona_estudiante,
        cod_persona_padre = p_cod_persona_padre,
        cod_tipo_relacion = p_cod_tipo_relacion,
        descripcion = p_descripcion
    WHERE Cod_genealogia = p_Cod_genealogia;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Put_Municipios` (IN `p_Cod_municipio` INT, IN `p_Nombre_municipio` VARCHAR(255), IN `p_Cod_departamento` INT)   BEGIN
    UPDATE tbl_municipio
    SET 
        Nombre_municipio = p_Nombre_municipio, 
        Cod_departamento = p_Cod_departamento
    WHERE 
        Cod_municipio = p_Cod_municipio;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Put_Nacionalidad` (IN `p_Cod_nacionalidad` INT, IN `p_Id_nacionalidad` VARCHAR(25), IN `p_pais_nacionalidad` VARCHAR(100), IN `p_pais` VARCHAR(250))   BEGIN
    -- Validar si el registro existe antes de actualizar
    IF EXISTS (SELECT 1 FROM tbl_nacionalidad WHERE Cod_nacionalidad = p_Cod_nacionalidad) THEN
        UPDATE tbl_nacionalidad
        SET Id_nacionalidad = p_Id_nacionalidad,
            pais_nacionalidad = p_pais_nacionalidad,
            pais = p_pais
        WHERE Cod_nacionalidad = p_Cod_nacionalidad;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El registro no existe.';
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Put_Personas` (IN `p_cod_persona` INT, IN `p_dni_persona` VARCHAR(32), IN `p_nombre` TEXT, IN `p_segundo_nombre` TEXT, IN `p_primer_apellido` TEXT, IN `p_segundo_apellido` TEXT, IN `p_direccion_persona` VARCHAR(50), IN `p_fecha_nacimiento` DATE, IN `p_estado_persona` ENUM('A','S'), IN `p_principal` TINYINT(1), IN `p_cod_genero` INT, IN `p_cod_tipo_persona` INT, IN `p_cod_nacionalidad` INT, IN `p_cod_departamento` INT, IN `p_cod_municipio` INT)   BEGIN
    UPDATE tbl_personas
    SET 
        dni_persona = p_dni_persona,
        Nombre = p_nombre,
        Segundo_nombre = p_segundo_nombre,
        Primer_apellido = p_primer_apellido,
        Segundo_apellido = p_segundo_apellido,
        direccion_persona = p_direccion_persona,
        fecha_nacimiento = p_fecha_nacimiento,
        Estado_Persona = p_estado_persona,
        principal = p_principal,
        cod_genero = p_cod_genero,
        cod_tipo_persona = p_cod_tipo_persona,
        cod_nacionalidad = p_cod_nacionalidad,
        cod_departamento = p_cod_departamento,
        cod_municipio = p_cod_municipio
    WHERE cod_persona = p_cod_persona;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Put_TipoRelacion` (IN `p_Cod_tipo_relacion` INT, IN `p_Tipo_relacion` VARCHAR(100) CHARSET utf8)   BEGIN
  UPDATE tbl_tipo_relacion
  SET Tipo_relacion = p_Tipo_relacion
  WHERE Cod_tipo_relacion = p_Cod_tipo_relacion;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Update_Genero_Persona` (IN `Cod_genero` INT, IN `Tipo_genero` VARCHAR(100))   BEGIN
    UPDATE tbl_genero_persona
    SET Tipo_genero = Tipo_Genero -- Asigna el valor del parámetro a la columna
    WHERE Cod_genero = Cod_Genero; -- Filtra usando el parámetro
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `P_Update_Tipo_Contacto` (IN `cod_tipo_contacto` INT(11), IN `tipo_contacto` VARCHAR(50))   BEGIN
    UPDATE tbl_tipo_contacto
    SET tipo_contacto = tipo_contacto
    WHERE cod_tipo_contacto = cod_tipo_contacto;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `registrarActividadPorAsignatura` (IN `Cod_profesor` INT, IN `Cod_ponderacion_ciclo` INT, IN `Cod_parcial` INT, IN `Nombre_actividad_academica` VARCHAR(100), IN `Descripcion` VARCHAR(255), IN `Fechayhora_Inicio` DATETIME, IN `Fechayhora_Fin` DATETIME, IN `Valor` DECIMAL(5,2), IN `Cod_secciones` INT, IN `Cod_seccion_asignatura` INT)   BEGIN
   DECLARE last_inserted_id INT; -- Declarar una variable para almacenar el último ID

    -- Inserta en tbl_actividades_academicas
    INSERT INTO tbl_actividades_academicas (
        Cod_profesor,
        Cod_ponderacion_ciclo,
        Cod_parcial,
        Nombre_actividad_academica,
        Descripcion,  
        Fechayhora_Inicio,
        Fechayhora_Fin,
        Valor,
        Cod_secciones
    ) VALUES (
        Cod_profesor,
        Cod_ponderacion_ciclo,
        Cod_parcial,
        Nombre_actividad_academica,
        Descripcion,
        Fechayhora_Inicio,
        Fechayhora_Fin,
        Valor,
        Cod_secciones
    );

    -- Obtener el último ID generado
    SET last_inserted_id = LAST_INSERT_ID();

    -- Inserta en tbl_actividades_asignatura
    INSERT INTO tbl_actividades_asignatura (
        Cod_actividad_academica,
        Cod_seccion_asignatura
    ) VALUES (
        last_inserted_id,
        Cod_seccion_asignatura
    );


END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `RegistrarPagoCaja` (IN `p_cod_caja` INT, IN `p_monto` DOUBLE, IN `p_descripcion_caja` VARCHAR(255), IN `p_cod_concepto` INT, IN `p_cod_descuento` INT)   BEGIN
    DECLARE descuento_aplicado DOUBLE DEFAULT 0; -- Descuento calculado
    DECLARE monto_final DOUBLE; -- Monto final después del descuento
    DECLARE valor_descuento DOUBLE; -- Valor del descuento obtenido de la tabla
    DECLARE tipo_descuento ENUM('PORCENTAJE', 'MONTO'); -- Tipo de descuento (Porcentaje o Monto Fijo)
    DECLARE fecha_actual DATETIME; -- Fecha actual

    SET fecha_actual = NOW(); -- Establecer la fecha y hora actual

    -- Verificar si se ha proporcionado un código de descuento
    IF p_cod_descuento IS NOT NULL THEN
        -- Obtener el valor y tipo del descuento desde `tbl_descuentos`
        SELECT Valor, 
               IF(Valor <= 1, 'PORCENTAJE', 'MONTO') AS Tipo
        INTO valor_descuento, tipo_descuento
        FROM tbl_descuentos
        WHERE Cod_descuento = p_cod_descuento;

        -- Calcular el descuento basado en el tipo
        IF tipo_descuento = 'PORCENTAJE' THEN
            SET descuento_aplicado = (p_monto * valor_descuento); -- Descuento porcentual
        ELSE
            SET descuento_aplicado = valor_descuento; -- Descuento fijo
        END IF;

        -- Registrar la relación entre la caja y el descuento en `tbl_caja_descuento`
        INSERT INTO tbl_caja_descuento (Cod_caja, Cod_descuento)
        VALUES (p_cod_caja, p_cod_descuento);
    END IF;

    -- Calcular el monto final
    SET monto_final = p_monto - descuento_aplicado;

    -- Asegurarse de que el monto final no sea negativo
    IF monto_final < 0 THEN
        SET monto_final = 0;
    END IF;

    -- Actualizar la información de la caja en `tbl_caja`
    UPDATE tbl_caja
    SET Monto = monto_final,
        Descripcion = p_descripcion_caja,
        Cod_concepto = p_cod_concepto,
        Estado_pago = 'Pagado',
        Hora_registro = fecha_actual
    WHERE Cod_caja = p_cod_caja;

    -- Actualizar el estado de matrícula asociado a la caja en `tbl_matriculas`
    UPDATE tbl_matricula
    SET Cod_estado_matricula = (
        SELECT Cod_estado_matricula
        FROM tbl_estado_matricula
        WHERE Tipo = 'Activa' -- Cambia a 'Activa'
        LIMIT 1
    )
    WHERE Cod_caja = p_cod_caja; -- Encuentra la matrícula asociada a la caja
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_actividad_extracurricular` (IN `p_Cod_actividades_extracurriculares` INT, IN `p_Nombre` VARCHAR(50), IN `p_Descripcion` VARCHAR(200), IN `p_Hora_inicio` TIME, IN `p_Hora_final` TIME, IN `p_Cod_secciones` INT, IN `p_Fecha` DATE)   BEGIN
    -- Verificar que la hora final sea mayor que la hora de inicio
    IF p_Hora_final <= p_Hora_inicio THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'La hora final debe ser posterior a la hora de inicio.';
    END IF;

    -- Verificar si la sección existe
    IF NOT EXISTS (
        SELECT 1 
        FROM tbl_secciones
        WHERE Cod_secciones = p_Cod_secciones
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'La sección especificada no existe.';
    END IF;

    -- Verificar si ya existe otra actividad que se traslape en la misma sección y fecha
    IF EXISTS (
        SELECT 1 
        FROM tbl_actividades_extracurriculares
        WHERE 
            Cod_seccion = p_Cod_secciones
            AND Fecha = p_Fecha
            AND Cod_actividades_extracurriculares != p_Cod_actividades_extracurriculares
            AND (
                (p_Hora_inicio >= Hora_inicio AND p_Hora_inicio < Hora_final) OR
                (p_Hora_final > Hora_inicio AND p_Hora_final <= Hora_final) OR
                (p_Hora_inicio <= Hora_inicio AND p_Hora_final >= Hora_final)
            )
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Ya existe otra actividad extracurricular en este horario y sección.';
    END IF;

    -- Actualizar el registro de la actividad extracurricular
    UPDATE tbl_actividades_extracurriculares
    SET 
        Nombre = p_Nombre, 
        Descripcion = p_Descripcion, 
        Hora_inicio = p_Hora_inicio, 
        Hora_final = p_Hora_final, 
        Cod_seccion = p_Cod_secciones, 
        Fecha = p_Fecha
    WHERE Cod_actividades_extracurriculares = p_Cod_actividades_extracurriculares;

    -- Retornar el código de la sección actualizada
    SELECT p_Cod_secciones AS Cod_seccion_actualizado;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_aula` (IN `p_Cod_aula` INT, IN `p_Numero_aula` INT, IN `p_Capacidad` INT, IN `p_Cupos_aula` INT, IN `p_Cod_edificio` INT, IN `p_Division` INT, IN `p_Secciones_ocupadas` INT)   BEGIN
    DECLARE v_Secciones_disponibles INT;
    DECLARE v_Nombre_edificios VARCHAR(60);
    DECLARE v_AulaExistente INT;

    -- Validar que el edificio exista
    SELECT Nombre_edificios INTO v_Nombre_edificios
    FROM tbl_edificio 
    WHERE Cod_edificio = p_Cod_edificio;

    -- Verificar si el edificio no fue encontrado
    IF v_Nombre_edificios IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El edificio especificado no existe.';
    END IF;

    -- Verificar si el Numero_aula ya existe en el mismo Cod_edificio (excluyendo el aula actual)
    SELECT COUNT(*) INTO v_AulaExistente
    FROM tbl_aula
    WHERE Numero_aula = p_Numero_aula 
      AND Cod_edificio = p_Cod_edificio 
      AND Cod_aula != p_Cod_aula;

    IF v_AulaExistente > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El número de aula ya existe en el edificio especificado.';
    END IF;

    -- Obtener el número actual de secciones disponibles del aula
    SELECT Secciones_disponibles INTO v_Secciones_disponibles
    FROM tbl_aula
    WHERE Cod_aula = p_Cod_aula;

    -- Validar que hay suficientes secciones disponibles para ocupar una nueva sección
    IF p_Secciones_ocupadas > (p_Secciones_ocupadas + v_Secciones_disponibles) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: No hay suficientes secciones disponibles para ocupar más secciones.';
    END IF;

    -- Validar que los cupos no sean mayores a la capacidad
    IF p_Cupos_aula > p_Capacidad THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Los cupos del aula no pueden ser mayores a la capacidad del aula.';
    END IF;

    -- Calcular las nuevas secciones disponibles
    SET v_Secciones_disponibles = v_Secciones_disponibles - (p_Secciones_ocupadas - (SELECT Secciones_ocupadas FROM tbl_aula WHERE Cod_aula = p_Cod_aula));

    -- Actualizar el aula
    UPDATE tbl_aula
    SET 
        Numero_aula = p_Numero_aula,
        Capacidad = p_Capacidad,
        Cupos_aula = p_Cupos_aula,
        Cod_edificio = p_Cod_edificio,
        Division = p_Division,
        Secciones_disponibles = v_Secciones_disponibles,
        Secciones_ocupadas = p_Secciones_ocupadas
    WHERE 
        Cod_aula = p_Cod_aula;

    -- Devolver el nombre del edificio junto con el mensaje de confirmación
    SELECT v_Nombre_edificios AS Nombre_edificio, 'Aula actualizada exitosamente' AS mensaje;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_datos_completados` (IN `p_cod_usuario` INT)   BEGIN
    -- Actualizar directamente el campo datos_completados a 1 en tbl_usuarios
    UPDATE tbl_usuarios
    SET datos_completados = 1
    WHERE cod_usuario = p_cod_usuario;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_dia` (IN `p_Cod_dias` INT, IN `p_Nuevo_dia` VARCHAR(50), IN `p_Nuevo_prefijo` VARCHAR(50))   BEGIN
    -- Validar si el Cod_dias existe
    IF NOT EXISTS (
        SELECT 1 
        FROM tbl_dias 
        WHERE Cod_dias = p_Cod_dias
    ) THEN
        -- Si no existe el Cod_dias, lanzar un error
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El código del día no existe.';
    ELSE
        -- Validar si ya existe otro día con el mismo nombre
        IF EXISTS (
            SELECT 1 
            FROM tbl_dias 
            WHERE dias = p_Nuevo_dia
            AND Cod_dias != p_Cod_dias  -- Excluir el día que estamos actualizando
        ) THEN
            -- Si ya existe un día con el mismo nombre, lanzar un error
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Ya existe otro día con el mismo nombre.';
        ELSE
            -- Actualizar el día y el prefijo
            UPDATE tbl_dias
            SET 
                dias = p_Nuevo_dia,
                prefijo_dia = p_Nuevo_prefijo
            WHERE 
                Cod_dias = p_Cod_dias;
        END IF;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_edificio` (IN `p_Cod_edificio` INT, IN `p_Nuevo_nombre_edificio` VARCHAR(60), IN `p_Numero_pisos` INT, IN `p_Aulas_disponibles` INT)   BEGIN
    -- Validar si el Cod_edificio existe
    IF NOT EXISTS (
        SELECT 1 
        FROM tbl_edificio 
        WHERE Cod_edificio = p_Cod_edificio
    ) THEN
        -- Si no existe el Cod_edificio, lanzar un error
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El código del edificio no existe.';
    ELSE
        -- Validar si ya existe otro edificio con el mismo nombre
        IF EXISTS (
            SELECT 1 
            FROM tbl_edificio 
            WHERE Nombre_edificios = p_Nuevo_nombre_edificio
            AND Cod_edificio != p_Cod_edificio  -- Excluir el edificio que estamos actualizando
        ) THEN
            -- Si ya existe un edificio con el mismo nombre, lanzar un error
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Ya existe otro edificio con el mismo nombre.';
        ELSE
            -- Actualizar el edificio
            UPDATE tbl_edificio
            SET 
                Nombre_edificios = p_Nuevo_nombre_edificio,
                Numero_pisos = p_Numero_pisos,
                Aulas_disponibles = p_Aulas_disponibles
            WHERE 
                Cod_edificio = p_Cod_edificio;
        END IF;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_estado_matricula` (IN `p_cod_estado_matricula` INT, IN `p_tipo` VARCHAR(50))   BEGIN
    -- Actualizar datos en la tabla tbl_estado_matricula
    UPDATE tbl_estado_matricula
    SET Tipo = p_tipo
    WHERE Cod_estado_matricula = p_cod_estado_matricula;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_historico_procedencia` (IN `p_cod_procedencia` INT, IN `p_Nombre_procedencia` VARCHAR(80), IN `p_Lugar_procedencia` VARCHAR(80), IN `p_Instituto` VARCHAR(80))   BEGIN
    DECLARE v_Existente INT;
    
    -- Validar si el cod_procedencia existe
    IF NOT EXISTS (
        SELECT 1 
        FROM tbl_historico_procedencia 
        WHERE cod_procedencia = p_cod_procedencia
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El código de procedencia no existe.';
    ELSE
        -- Verificar si la combinación de campos ya existe
        SELECT COUNT(*) INTO v_Existente
        FROM tbl_historico_procedencia
        WHERE 
            (Nombre_procedencia = p_Nombre_procedencia OR p_Nombre_procedencia IS NULL) AND
            (Lugar_procedencia = p_Lugar_procedencia OR p_Lugar_procedencia IS NULL) AND
            (Instituto = p_Instituto OR p_Instituto IS NULL) AND
            cod_procedencia != p_cod_procedencia;

        IF v_Existente > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Ya existe un registro con los mismos valores.';
        ELSE
            -- Construir la consulta de actualización
            SET @sql = 'UPDATE tbl_historico_procedencia SET ';
            SET @params = '';
            
            IF p_Nombre_procedencia IS NOT NULL THEN
                SET @sql = CONCAT(@sql, 'Nombre_procedencia = ?, ');
                SET @param1 = p_Nombre_procedencia;
            ELSE
                SET @param1 = NULL;
            END IF;

            IF p_Lugar_procedencia IS NOT NULL THEN
                SET @sql = CONCAT(@sql, 'Lugar_procedencia = ?, ');
                SET @param2 = p_Lugar_procedencia;
            ELSE
                SET @param2 = NULL;
            END IF;

            IF p_Instituto IS NOT NULL THEN
                SET @sql = CONCAT(@sql, 'Instituto = ?, ');
                SET @param3 = p_Instituto;
            ELSE
                SET @param3 = NULL;
            END IF;

            -- Eliminar la última coma y espacio
            SET @sql = LEFT(@sql, LENGTH(@sql) - 2);

            -- Agregar la cláusula WHERE
            SET @sql = CONCAT(@sql, ' WHERE cod_procedencia = ?');

            -- Preparar y ejecutar la consulta
            PREPARE stmt FROM @sql;
            SET @param4 = p_cod_procedencia;

            -- Ejecutar la consulta con los parámetros válidos
            EXECUTE stmt USING @param1, @param2, @param3, @param4;

            -- Liberar la declaración
            DEALLOCATE PREPARE stmt;
        END IF;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_horario_y_grado_seccion_asignatura` (IN `p_Cod_seccion_asignatura` INT, IN `p_Cod_grados_asignaturas` INT, IN `p_Cod_dias` INT, IN `p_Hora_inicio` TIME, IN `p_Hora_fin` TIME)   BEGIN
    IF NOT EXISTS (SELECT 1 FROM tbl_secciones_asignaturas WHERE Cod_seccion_asignatura = p_Cod_seccion_asignatura) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: El registro de sección de asignatura especificado no existe.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM tbl_grados_asignaturas WHERE Cod_grados_asignaturas = p_Cod_grados_asignaturas) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: El grado-asignatura especificado no existe.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM tbl_dias WHERE Cod_dias = p_Cod_dias) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: El día especificado no existe.';
    END IF;

    IF p_Hora_inicio >= p_Hora_fin THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: La hora de inicio no puede ser mayor o igual que la hora de fin.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM tbl_secciones_asignaturas
        WHERE Cod_secciones = (SELECT Cod_secciones FROM tbl_secciones_asignaturas WHERE Cod_seccion_asignatura = p_Cod_seccion_asignatura)
        AND Cod_dias = p_Cod_dias
        AND Cod_seccion_asignatura != p_Cod_seccion_asignatura
        AND (
            (p_Hora_inicio BETWEEN Hora_inicio AND Hora_fin) OR
            (p_Hora_fin BETWEEN Hora_inicio AND Hora_fin) OR
            (Hora_inicio BETWEEN p_Hora_inicio AND p_Hora_fin) OR
            (Hora_fin BETWEEN p_Hora_inicio AND p_Hora_fin)
        )
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Ya existe un horario para esta sección y día que se solapa con el horario ingresado.';
    END IF;

    UPDATE tbl_secciones_asignaturas
    SET 
        Cod_grados_asignaturas = p_Cod_grados_asignaturas,
        Cod_dias = p_Cod_dias,
        Hora_inicio = p_Hora_inicio,
        Hora_fin = p_Hora_fin
    WHERE 
        Cod_seccion_asignatura = p_Cod_seccion_asignatura;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_password_temporal` (IN `p_cod_usuario` INT, IN `p_nueva_contraseña` VARCHAR(100), OUT `p_mensaje` VARCHAR(100))   BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_mensaje = 'Error al actualizar la contraseña';
        ROLLBACK;
    END;

    START TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM tbl_usuarios WHERE cod_usuario = p_cod_usuario) THEN
        SET p_mensaje = 'Usuario no encontrado';
        ROLLBACK;
    ELSE
        UPDATE tbl_usuarios 
        SET contraseña_usuario = p_nueva_contraseña,
            password_temporal = 0,
            ultima_actualizacion = CURRENT_TIMESTAMP,
            Fecha_ultima_conexion = NOW()
        WHERE cod_usuario = p_cod_usuario;

        SET p_mensaje = 'Contraseña actualizada correctamente';
        COMMIT;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_periodo_matricula` (IN `p_cod_periodo_matricula` INT, IN `p_fecha_inicio` DATE, IN `p_fecha_fin` DATE, IN `p_anio_academico` INT, IN `p_estado` ENUM('activo','inactivo'))   BEGIN
    -- Actualizar datos en la tabla tbl_periodo_matricula
    UPDATE tbl_periodo_matricula
    SET 
        Fecha_inicio = p_fecha_inicio,
        Fecha_fin = p_fecha_fin,
        anio_academico = p_anio_academico,
        estado = p_estado
    WHERE Cod_periodo_matricula = p_cod_periodo_matricula;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_secciones` (IN `p_Cod_secciones` INT, IN `p_Nombre_seccion` VARCHAR(45), IN `p_Numero_aula` INT, IN `p_Nombre_grado` VARCHAR(45), IN `p_Cod_Profesor` INT, IN `p_Cod_periodo_matricula` INT)   BEGIN
    DECLARE v_Cod_aula INT;
    DECLARE v_Cod_grado INT;
    DECLARE v_Aula_Anterior INT;

    -- Buscar el código del aula nueva usando el número de aula
    SELECT Cod_aula INTO v_Cod_aula
    FROM tbl_aula
    WHERE Numero_aula = p_Numero_aula
    LIMIT 1;

    IF v_Cod_aula IS NULL THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'El aula especificada no existe.';
    END IF;

    -- Buscar el código del grado usando el nombre del grado
    SELECT Cod_grado INTO v_Cod_grado
    FROM tbl_grados
    WHERE Nombre_grado = p_Nombre_grado
    LIMIT 1;

    IF v_Cod_grado IS NULL THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'El grado especificado no existe.';
    END IF;

    -- Obtener el aula actual de la sección
    SELECT Cod_aula INTO v_Aula_Anterior
    FROM tbl_secciones
    WHERE Cod_secciones = p_Cod_secciones;

    -- Si el aula cambia, ajustar secciones disponibles y ocupadas
    IF v_Aula_Anterior != v_Cod_aula THEN
        -- Incrementar secciones disponibles en el aula anterior
        UPDATE tbl_aula
        SET 
            Secciones_disponibles = Secciones_disponibles + 1,
            Secciones_ocupadas = Secciones_ocupadas - 1
        WHERE Cod_aula = v_Aula_Anterior;

        -- Verificar que haya espacio disponible en el aula nueva
        IF (SELECT Secciones_disponibles FROM tbl_aula WHERE Cod_aula = v_Cod_aula) <= 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El aula seleccionada no tiene secciones disponibles.';
        END IF;

        -- Reducir secciones disponibles en el aula nueva
        UPDATE tbl_aula
        SET 
            Secciones_disponibles = Secciones_disponibles - 1,
            Secciones_ocupadas = Secciones_ocupadas + 1
        WHERE Cod_aula = v_Cod_aula;
    END IF;

    -- Verificar si existe otra sección con los mismos datos
    IF EXISTS (
        SELECT 1 
        FROM tbl_secciones
        WHERE 
            Nombre_seccion = p_Nombre_seccion 
            AND Cod_aula = v_Cod_aula
            AND Cod_grado = v_Cod_grado
            AND Cod_periodo_matricula = p_Cod_periodo_matricula
            AND Cod_secciones != p_Cod_secciones
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Ya existe otra sección con los mismos datos.';
    ELSE
        -- Actualizar la sección
        UPDATE tbl_secciones
        SET 
            Nombre_seccion = p_Nombre_seccion, 
            Cod_aula = v_Cod_aula, 
            Cod_Profesor = p_Cod_Profesor, 
            Cod_grado = v_Cod_grado, 
            Cod_periodo_matricula = p_Cod_periodo_matricula
        WHERE Cod_secciones = p_Cod_secciones;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_secciones_asignaturas` (IN `p_Cod_seccion_asignatura` INT, IN `p_Cod_secciones` INT, IN `p_Hora_inicio` TIME, IN `p_Hora_fin` TIME, IN `p_Cod_grados_asignaturas` INT, IN `p_Cod_dias` VARCHAR(255))   BEGIN
    DECLARE dia_id INT;
    DECLARE num_dias INT;
    DECLARE i INT DEFAULT 1;
    DECLARE error_mensaje VARCHAR(255);

    -- Validar que el registro existe
    IF NOT EXISTS (
        SELECT 1 
        FROM tbl_secciones_asignaturas 
        WHERE Cod_seccion_asignatura = p_Cod_seccion_asignatura
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: El registro no existe.';
    END IF;

    -- Validar rango de horas
    IF p_Hora_inicio < '07:00:00' OR p_Hora_inicio > '14:00:00' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: La hora de inicio debe estar entre las 07:00 y las 14:00.';
    END IF;

    IF p_Hora_fin < '07:00:00' OR p_Hora_fin > '14:00:00' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: La hora final debe estar entre las 07:00 y las 14:00.';
    END IF;

    -- Validar que la hora final sea después de la hora de inicio
    IF p_Hora_fin <= p_Hora_inicio THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: La hora final debe ser posterior a la hora de inicio.';
    END IF;

    -- Calcular la cantidad de días
    SET num_dias = LENGTH(p_Cod_dias) - LENGTH(REPLACE(p_Cod_dias, ',', '')) + 1;

    -- Validar traslapes dentro de la misma combinación de sección y grado
    WHILE i <= num_dias DO
        SET dia_id = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(p_Cod_dias, ',', i), ',', -1) AS UNSIGNED);

        IF EXISTS (
            SELECT 1
            FROM tbl_secciones_asignaturas sa
            JOIN tbl_secciones_asignaturas_dias sad ON sa.Cod_seccion_asignatura = sad.Cod_seccion_asignatura
            WHERE sa.Cod_secciones = p_Cod_secciones
              AND sad.Cod_dias = dia_id
              AND sa.Cod_seccion_asignatura != p_Cod_seccion_asignatura
              AND (
                  (p_Hora_inicio >= sa.Hora_inicio AND p_Hora_inicio < sa.Hora_fin) OR
                  (p_Hora_fin > sa.Hora_inicio AND p_Hora_fin <= sa.Hora_fin) OR
                  (p_Hora_inicio <= sa.Hora_inicio AND p_Hora_fin >= sa.Hora_fin)
              )
        ) THEN
            -- Generar mensaje sin CONCAT
            SET error_mensaje = 'Error: Conflicto de horario en el día ';
            CASE dia_id
                WHEN 1 THEN SET error_mensaje = CONCAT(error_mensaje, 'Lunes.');
                WHEN 2 THEN SET error_mensaje = CONCAT(error_mensaje, 'Martes.');
                WHEN 3 THEN SET error_mensaje = CONCAT(error_mensaje, 'Miércoles.');
                WHEN 4 THEN SET error_mensaje = CONCAT(error_mensaje, 'Jueves.');
                WHEN 5 THEN SET error_mensaje = CONCAT(error_mensaje, 'Viernes.');
                WHEN 6 THEN SET error_mensaje = CONCAT(error_mensaje, 'Sábado.');
                WHEN 7 THEN SET error_mensaje = CONCAT(error_mensaje, 'Domingo.');
            END CASE;

            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = error_mensaje;
        END IF;

        SET i = i + 1;
    END WHILE;

    -- Actualizar los datos principales
    UPDATE tbl_secciones_asignaturas
    SET 
        Hora_inicio = p_Hora_inicio,
        Hora_fin = p_Hora_fin
    WHERE 
        Cod_seccion_asignatura = p_Cod_seccion_asignatura;

    -- Actualizar días existentes
    DELETE FROM tbl_secciones_asignaturas_dias
    WHERE Cod_seccion_asignatura = p_Cod_seccion_asignatura;

    -- Insertar los nuevos días
    SET i = 1;
    WHILE i <= num_dias DO
        SET dia_id = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(p_Cod_dias, ',', i), ',', -1) AS UNSIGNED);
        INSERT INTO tbl_secciones_asignaturas_dias (Cod_seccion_asignatura, Cod_dias)
        VALUES (p_Cod_seccion_asignatura, dia_id);
        SET i = i + 1;
    END WHILE;

    -- Actualizar el campo Dias_nombres en la tabla tbl_secciones_asignaturas
    UPDATE tbl_secciones_asignaturas
    SET Dias_nombres = (
        SELECT GROUP_CONCAT(d.prefijo_dia ORDER BY FIELD(d.Cod_dias, 6, 2, 7, 3, 4, 5, 8) SEPARATOR ', ')
        FROM tbl_secciones_asignaturas_dias sad
        JOIN tbl_dias d ON sad.Cod_dias = d.Cod_dias
        WHERE sad.Cod_seccion_asignatura = p_Cod_seccion_asignatura
    )
    WHERE Cod_seccion_asignatura = p_Cod_seccion_asignatura;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_tipo_matricula` (IN `p_cod_tipo_matricula` INT, IN `p_tipo` VARCHAR(50))   BEGIN
    -- Actualizar el tipo de matrícula en la tabla tbl_tipo_matricula
    UPDATE tbl_tipo_matricula
    SET Tipo = p_tipo
    WHERE Cod_tipo_matricula = p_cod_tipo_matricula;

    -- Verificar si alguna fila fue afectada
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'El código de tipo de matrícula no existe';
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_agregar_catalogo_cuenta` (IN `p_nombre_cuenta` VARCHAR(100), IN `p_descripcion` VARCHAR(255), IN `p_tipo_cuenta` ENUM('ACTIVO','PASIVO','PATRIMONIO','INGRESO','EGRESO'), IN `p_naturaleza_cuenta` ENUM('DEUDORA','ACREEDORA'), IN `p_estado_sf` ENUM('ESTADO DE RESULTADO','BALANCE GENERAL'), IN `p_nivel` ENUM('1','2','3','4','5'))   BEGIN
    DECLARE v_cod_cuenta INT;

    -- Insertar la nueva cuenta en la tabla `tbl_catalogo_cuentas`
    INSERT INTO tbl_catalogo_cuentas (
        Nombre_cuenta,
        Descripcion,
        Tipo_Cuenta,
        Naturaleza_cuenta,
        Estado_Situacion_Financiera,
        Nivel
    ) VALUES (
        p_nombre_cuenta,
        p_descripcion,
        p_tipo_cuenta,
        p_naturaleza_cuenta,
        p_estado_sf,
        p_nivel
    );

    -- Obtener el ID generado
    SET v_cod_cuenta = LAST_INSERT_ID();

    -- Devolver el ID de la cuenta creada
    SELECT v_cod_cuenta AS cod_cuenta;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_agregar_libro_diario` (IN `p_Fecha` DATE, IN `p_Descripcion` VARCHAR(200), IN `p_Cod_cuenta` INT, IN `p_Monto` DECIMAL(10,2), IN `p_tipo` ENUM('DEUDOR','ACREEDOR'))   BEGIN
    INSERT INTO tbl_libro_diario(
        Fecha, 
        Descripcion, 
        Cod_cuenta, 
        Monto, 
        tipo
    ) VALUES (
        p_Fecha,
        p_Descripcion,
        p_Cod_cuenta,
        p_Monto,
        p_tipo
    );
    
    -- Devolver el ID insertado
    SELECT LAST_INSERT_ID() as Cod_libro_diario;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_asignar_permiso` (IN `p_Cod_objeto` INT, IN `p_Cod_rol` INT, IN `p_Permiso_insercion` ENUM('Y','N'), IN `p_Permiso_eliminacion` ENUM('Y','N'), IN `p_Permiso_actualizacion` ENUM('Y','N'), IN `p_Permiso_consultar` ENUM('Y','N'))   BEGIN
    -- Verificar si ya existe un permiso para el rol y objeto específicos
    IF EXISTS (SELECT 1 FROM tbl_permisos 
               WHERE Cod_objeto = p_Cod_objeto AND Cod_rol = p_Cod_rol) THEN
        -- Si existe, actualizar los permisos
        UPDATE tbl_permisos
        SET Permiso_insercion = p_Permiso_insercion,
            Permiso_eliminacion = p_Permiso_eliminacion,
            Permiso_actualizacion = p_Permiso_actualizacion,
            Permiso_consultar = p_Permiso_consultar
        WHERE Cod_objeto = p_Cod_objeto AND Cod_rol = p_Cod_rol;
    ELSE
        -- Si no existe, insertar un nuevo registro de permisos
        INSERT INTO tbl_permisos (Cod_objeto, Cod_rol, Permiso_insercion, Permiso_eliminacion, Permiso_actualizacion, Permiso_consultar)
        VALUES (p_Cod_objeto, p_Cod_rol, p_Permiso_insercion, p_Permiso_eliminacion, p_Permiso_actualizacion, p_Permiso_consultar);
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_cambiar_estado_actividad` (IN `p_Cod_actividades_extracurriculares` INT, IN `p_Estado` ENUM('Activa','Cancelada'), IN `p_Motivo` VARCHAR(200), OUT `p_Mensaje` VARCHAR(200))   BEGIN
    DECLARE v_Existe INT DEFAULT 0;

    -- Verificar si la actividad existe
    SELECT COUNT(*)
    INTO v_Existe
    FROM tbl_actividades_extracurriculares
    WHERE Cod_actividades_extracurriculares = p_Cod_actividades_extracurriculares;

    IF v_Existe = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La actividad extracurricular especificada no existe.';
    END IF;

    -- Verificar que el estado sea válido
    IF p_Estado NOT IN ('Activa', 'Cancelada') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El estado proporcionado no es válido.';
    END IF;

    -- Si el estado es "Cancelada", asegurarse de que el motivo sea proporcionado
    IF p_Estado = 'Cancelada' AND (p_Motivo IS NULL OR p_Motivo = '') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El motivo de la cancelación es requerido.';
    END IF;

    -- Actualizar el estado y el motivo (si es cancelada)
    UPDATE tbl_actividades_extracurriculares
    SET Estado = p_Estado,
        Motivo_Cancelacion = IF(p_Estado = 'Cancelada', p_Motivo, NULL) -- Asignar el motivo solo si la actividad está cancelada
    WHERE Cod_actividades_extracurriculares = p_Cod_actividades_extracurriculares;

    -- Generar un mensaje basado en el nuevo estado
    IF p_Estado = 'Cancelada' THEN
        SET p_Mensaje = CONCAT('La actividad con ID ', p_Cod_actividades_extracurriculares, ' ha sido cancelada correctamente. Motivo: ', p_Motivo);
    ELSEIF p_Estado = 'Activa' THEN
        SET p_Mensaje = CONCAT('La actividad con ID ', p_Cod_actividades_extracurriculares, ' ha sido activada correctamente.');
    END IF;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_consultar_tipo_matricula` (IN `p_cod_tipo_matricula` INT)   BEGIN
    -- Si se proporciona un Cod_tipo_matricula, se obtiene un registro específico
    IF p_cod_tipo_matricula IS NOT NULL THEN
        SELECT *
        FROM tbl_tipo_matricula
        WHERE Cod_tipo_matricula = p_cod_tipo_matricula;
    ELSE
        -- Si no se proporciona, se obtienen todos los registros
        SELECT *
        FROM tbl_tipo_matricula;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_persona_usuario` (IN `p_dni_persona` VARCHAR(32), IN `p_nombre` TEXT, IN `p_segundo_nombre` TEXT, IN `p_primer_apellido` TEXT, IN `p_segundo_apellido` TEXT, IN `p_nacionalidad` VARCHAR(60), IN `p_direccion_persona` VARCHAR(50), IN `p_fecha_nacimiento` DATE, IN `p_cod_tipo_persona` INT, IN `p_cod_departamento` INT, IN `p_cod_municipio` INT, IN `p_cod_genero` INT, IN `p_nombre_usuario` VARCHAR(32), IN `p_correo_usuario` VARCHAR(50), IN `p_contraseña_usuario` VARCHAR(100), IN `p_cod_rol` INT, OUT `p_cod_persona` INT, OUT `p_cod_usuario` INT, OUT `p_mensaje` VARCHAR(100))   BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_mensaje = 'Error al crear el usuario';
        SET p_cod_persona = 0;
        SET p_cod_usuario = 0;
    END;

    START TRANSACTION;

    -- Verificar si existe el correo
    IF EXISTS (SELECT 1 FROM tbl_usuarios WHERE correo_usuario = p_correo_usuario) THEN
        SET p_mensaje = 'Ya existe un usuario con este correo electrónico';
        SET p_cod_persona = 0;
        SET p_cod_usuario = 0;
        ROLLBACK;
    -- Verificar si existe el DNI
    ELSEIF EXISTS (SELECT 1 FROM tbl_personas WHERE dni_persona = p_dni_persona) THEN
        SET p_mensaje = 'Ya existe una persona con este número de documento';
        SET p_cod_persona = 0;
        SET p_cod_usuario = 0;
        ROLLBACK;
    ELSE
        -- Insertar persona
        INSERT INTO tbl_personas (
            dni_persona,
            Nombre,
            Segundo_nombre,
            Primer_apellido,
            Segundo_apellido,
            Nacionalidad,
            direccion_persona,
            fecha_nacimiento,
            Estado_Persona,
            cod_tipo_persona,
            cod_departamento,
            cod_municipio,
            cod_genero
        ) VALUES (
            p_dni_persona,
            p_nombre,
            p_segundo_nombre,
            p_primer_apellido,
            p_segundo_apellido,
            p_nacionalidad,
            p_direccion_persona,
            p_fecha_nacimiento,
            'A',
            p_cod_tipo_persona,
            p_cod_departamento,
            p_cod_municipio,
            p_cod_genero
        );

        SET p_cod_persona = LAST_INSERT_ID();

        -- Insertar usuario
        INSERT INTO tbl_usuarios (
            nombre_usuario,
            correo_usuario,
            contraseña_usuario,
            token_usuario,
            confirmacion_email,
            cod_persona,
            Cod_rol,
            Cod_estado_usuario,
            is_two_factor_enabled,
            otp_verified,
            datos_completados,
            password_temporal,
            Primer_ingreso,
            Fecha_ultima_conexion
        ) VALUES (
            p_nombre_usuario,
            p_correo_usuario,
            p_contraseña_usuario,
            NULL,
            1,
            p_cod_persona,
            p_cod_rol,
            1,
            0,
            0,
            1,
            1,
            NOW(),
            NOW()
        );

        SET p_cod_usuario = LAST_INSERT_ID();
        SET p_mensaje = 'Usuario creado exitosamente';
        
        COMMIT;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_tipo_matricula` (IN `p_tipo` VARCHAR(50))   BEGIN
    -- Insertar un nuevo tipo de matrícula en la tabla tbl_tipo_matricula
    INSERT INTO tbl_tipo_matricula (Tipo)
    VALUES (p_tipo);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_delete_departamento` (IN `p_Cod_departamento` INT)   BEGIN
    DELETE FROM tbl_departamento
    WHERE Cod_departamento = p_Cod_departamento;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_delete_tipo_persona` (IN `p_Cod_tipo_persona` INT)   BEGIN
    DELETE FROM tbl_tipo_persona WHERE Cod_tipo_persona = p_Cod_tipo_persona;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_editar_catalogo_cuenta` (IN `p_cod_cuenta` INT, IN `p_nombre_cuenta` VARCHAR(255), IN `p_descripcion` TEXT, IN `p_tipo_cuenta` ENUM('ACTIVO','PASIVO'), IN `p_naturaleza_cuenta` ENUM('DEUDORA','ACREEDORA'), IN `p_estado_sf` VARCHAR(255), IN `p_nivel` INT)   BEGIN
    -- Actualizar la cuenta en la tabla `tbl_catalogo_cuentas`
    UPDATE tbl_catalogo_cuentas
    SET 
        Nombre_cuenta = p_nombre_cuenta,
        Descripcion = p_descripcion,
        Tipo_Cuenta = p_tipo_cuenta,
        Naturaleza_cuenta = p_naturaleza_cuenta,
        Estado_Situacion_Financiera = p_estado_sf,
        Nivel = p_nivel
    WHERE Cod_cuenta = p_cod_cuenta;

    -- Devolver el número de filas afectadas
    SELECT ROW_COUNT() AS filas_afectadas;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_editar_libro_diario` (IN `p_cod_libro_diario` INT, IN `p_fecha` DATE, IN `p_descripcion` VARCHAR(200), IN `p_cod_cuenta` INT, IN `p_monto` DECIMAL(10,2), IN `p_tipo` ENUM('DEUDOR','ACREEDOR'))   BEGIN
    UPDATE tbl_libro_diario
    SET Fecha = p_fecha,
        Descripcion = p_descripcion,
        Cod_cuenta = p_cod_cuenta,
        Monto = p_monto,
        Tipo = p_tipo
    WHERE Cod_libro_diario = p_cod_libro_diario;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_eliminar_actividad_extracurricular` (IN `p_Cod_actividades_extracurriculares` INT)   BEGIN
    -- Eliminar la actividad extracurricular por su código
    DELETE FROM tbl_actividades_extracurriculares
    WHERE Cod_actividades_extracurriculares = p_Cod_actividades_extracurriculares;

    -- Verificar si se afectó alguna fila (actividad encontrada y eliminada)
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se encontró la actividad extracurricular especificada.';
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_eliminar_aula` (IN `p_Cod_aula` INT)   BEGIN
    -- Verificar si el aula existe
    DECLARE aula_existe INT;

    SELECT COUNT(*) INTO aula_existe
    FROM tbl_aula
    WHERE Cod_aula = p_Cod_aula;

    IF aula_existe = 0 THEN
        -- Si el aula no existe, lanzar un error
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: El aula no existe.';
    ELSE
        -- Eliminar el aula
        DELETE FROM tbl_aula
        WHERE Cod_aula = p_Cod_aula;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_eliminar_catalogo_cuenta` (IN `p_cod_cuenta` INT)   BEGIN
    DELETE FROM tbl_catalogo_cuentas WHERE Cod_cuenta = p_cod_cuenta;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_eliminar_dia` (IN `p_Cod_dias` INT)   BEGIN
    DECLARE dia_existe INT;

    -- Verificar si el día existe en la tabla
    SELECT COUNT(*) INTO dia_existe
    FROM tbl_dias
    WHERE Cod_dias = p_Cod_dias;

    IF dia_existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: El día no existe.';
    ELSE
        -- Eliminar el día si existe
        DELETE FROM tbl_dias WHERE Cod_dias = p_Cod_dias;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_eliminar_edificio` (IN `p_Cod_edificio` INT)   BEGIN
    DECLARE edificio_existe INT;

    -- Verificar si el edificio existe en la tabla correcta
    SELECT COUNT(*) INTO edificio_existe
    FROM tbl_edificio
    WHERE Cod_edificio = p_Cod_edificio;

    IF edificio_existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: El edificio no existe.';
    ELSE
        -- Eliminar el edificio si existe
        DELETE FROM tbl_edificio WHERE Cod_edificio = p_Cod_edificio;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_eliminar_estado_matricula` (IN `p_cod_estado_matricula` INT)   BEGIN
    -- Eliminar el registro de la tabla tbl_estado_matricula
    DELETE FROM tbl_estado_matricula
    WHERE Cod_estado_matricula = p_cod_estado_matricula;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_eliminar_historico_procedencia` (IN `p_cod_procedencia` INT)   BEGIN
    DECLARE registro_existe INT DEFAULT 0;

    -- Verificar si el registro existe en la tabla
    SELECT COUNT(*) INTO registro_existe
    FROM tbl_historico_procedencia
    WHERE cod_procedencia = p_cod_procedencia;

    -- Si el registro no existe, lanzar un error
    IF registro_existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: El registro de procedencia no existe.';
    ELSE
        -- Eliminar el registro si existe
        DELETE FROM tbl_historico_procedencia WHERE cod_procedencia = p_cod_procedencia;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_eliminar_libro_diario` (IN `p_cod_libro_diario` INT)   BEGIN
    -- Declarar una variable para verificar si el registro existe
    DECLARE registro_existente INT DEFAULT 0;

    -- Verificar que el parámetro de entrada no sea NULL
    IF p_cod_libro_diario IS NULL THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Código de libro diario no válido.';
    ELSE
        -- Consultar si el registro existe
        SELECT COUNT(*) INTO registro_existente
        FROM tbl_libro_diario
        WHERE Cod_libro_diario = p_cod_libro_diario;

        -- Si el registro no existe, enviar un mensaje de error
        IF registro_existente = 0 THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'El registro no existe.';
        ELSE
            -- Eliminar el registro si existe
            DELETE FROM tbl_libro_diario
            WHERE Cod_libro_diario = p_cod_libro_diario;
        END IF;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_eliminar_periodo_matricula` (IN `p_cod_periodo_matricula` INT)   BEGIN
    -- Verificar si el periodo de matrícula existe
    DECLARE v_existe INT;
    SELECT COUNT(*) INTO v_existe
    FROM tbl_periodo_matricula
    WHERE Cod_periodo_matricula = p_cod_periodo_matricula;

    -- Si el periodo no existe, lanzar un error
    IF v_existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El periodo de matrícula no existe';
    ELSE
        -- Eliminar el registro de la tabla tbl_periodo_matricula
        DELETE FROM tbl_periodo_matricula
        WHERE Cod_periodo_matricula = p_cod_periodo_matricula;
    END IF;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_eliminar_secciones` (IN `p_Cod_secciones` INT)   BEGIN
    -- Paso 1: Eliminar los registros hijos en tbl_secciones_asignaturas
    DELETE FROM tbl_secciones_asignaturas
    WHERE Cod_secciones = p_Cod_secciones;

    -- Paso 2: Intentar eliminar el registro en tbl_secciones
    DELETE FROM tbl_secciones
    WHERE Cod_secciones = p_Cod_secciones;

    -- Paso 3: Verificar si se eliminó el registro en tbl_secciones
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'No se encontró la sección especificada.';
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_eliminar_tipo_matricula` (IN `p_cod_tipo_matricula` INT)   BEGIN
    -- Eliminar el tipo de matrícula de la tabla tbl_tipo_matricula
    DELETE FROM tbl_tipo_matricula
    WHERE Cod_tipo_matricula = p_cod_tipo_matricula;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_departamento` (IN `p_Cod_departamento` INT)   BEGIN
    IF p_Cod_departamento IS NULL THEN
        -- Si no se pasa un ID, devolver todos los registros
        SELECT Cod_departamento, Nombre_departamento, Nombre_municipio 
        FROM tbl_departamento;
    ELSE
        -- Si se pasa un ID, devolver el registro correspondiente
        SELECT Cod_departamento, Nombre_departamento, Nombre_municipio 
        FROM tbl_departamento 
        WHERE Cod_departamento = p_Cod_departamento;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_tipo_persona` (IN `p_Cod_tipo_persona` INT)   BEGIN
    IF p_Cod_tipo_persona IS NULL THEN
        SELECT * FROM tbl_tipo_persona;
    ELSE
        SELECT * FROM tbl_tipo_persona WHERE Cod_tipo_persona = p_Cod_tipo_persona;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_InsertarBitacora` (IN `p_cod_usuario` INT, IN `p_cod_objeto` INT, IN `p_accion` ENUM('INSERT','UPDATE','DELETE','LOGIN','LOGOUT'), IN `p_descripcion` TEXT)   BEGIN
    INSERT INTO tbl_bitacora (
        Cod_usuario,
        Cod_objeto,
        Fecha,         -- Este se llenará automáticamente con CURRENT_TIMESTAMP
        Accion,
        Descripcion
    ) VALUES (
        p_cod_usuario,
        p_cod_objeto,
        NOW(),
        p_accion,
        p_descripcion
    );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_InsertarTipoContacto` (IN `p_tipo_contacto` VARCHAR(50))   BEGIN
    INSERT INTO tbl_tipo_contacto (tipo_contacto)
    VALUES (p_tipo_contacto);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insertar_actividad_extracurricular` (IN `p_Nombre` VARCHAR(50), IN `p_Descripcion` VARCHAR(200), IN `p_Hora_inicio` TIME, IN `p_Hora_final` TIME, IN `p_Cod_seccion` INT, IN `p_Fecha` DATE)   BEGIN
    -- Verificar que la hora final no sea anterior a la hora de inicio
    IF p_Hora_final < p_Hora_inicio THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'La hora final no puede ser anterior a la hora de inicio.';
    ELSE
        -- Verificar si la sección existe
        IF NOT EXISTS (
            SELECT 1 
            FROM tbl_secciones 
            WHERE Cod_secciones = p_Cod_seccion
        ) THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'La sección especificada no existe.';
        ELSE
            -- Verificar si ya existe un registro que se traslape
            IF EXISTS (
                SELECT 1 
                FROM tbl_actividades_extracurriculares
                WHERE 
                    Cod_seccion = p_Cod_seccion
                    AND Fecha = p_Fecha
                    AND (
                        (p_Hora_inicio >= Hora_inicio AND p_Hora_inicio < Hora_final) OR
                        (p_Hora_final > Hora_inicio AND p_Hora_final <= Hora_final) OR
                        (p_Hora_inicio <= Hora_inicio AND p_Hora_final >= Hora_final)
                    )
            ) THEN
                SIGNAL SQLSTATE '45000' 
                SET MESSAGE_TEXT = 'Ya existe una actividad extracurricular en este horario y sección.';
            ELSE
                -- Inserción del registro
                INSERT INTO tbl_actividades_extracurriculares (
                    Nombre, 
                    Descripcion, 
                    Hora_inicio, 
                    Hora_final, 
                    Cod_seccion, 
                    Fecha,
                    Estado
                ) 
                VALUES (
                    p_Nombre, 
                    p_Descripcion, 
                    p_Hora_inicio, 
                    p_Hora_final, 
                    p_Cod_seccion, 
                    p_Fecha,
                    'Activa'
                );
            END IF;
        END IF;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insertar_agrupacion_secciones` ()   BEGIN
    DECLARE Cod_periodo INT;
    DECLARE Total_secciones INT;
    DECLARE Existente INT;

    -- Obtener el Cod_periodo_matricula activo
    SELECT Cod_periodo_matricula INTO Cod_periodo
    FROM tbl_periodo_matricula
    WHERE estado = 'activo'
    LIMIT 1;

    -- Verificar si ya existe una agrupación para este periodo
    SELECT COUNT(*) INTO Existente
    FROM tbl_historial_secciones
    WHERE Cod_periodo_matricula = Cod_periodo;

    -- Si ya existe una agrupación, no insertar y salir del procedimiento
    IF Existente > 0 THEN
        -- Mensaje opcional (solo funciona en MySQL 5.5+)
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Ya existe una agrupación para el periodo activo.';
    ELSE
        -- Calcular el total de secciones para ese periodo
        SELECT COUNT(*) INTO Total_secciones
        FROM tbl_secciones
        WHERE Cod_periodo_matricula = Cod_periodo;

        -- Insertar el total en la tabla agrupadora
        INSERT INTO tbl_historial_secciones (Cod_periodo_matricula, Total_secciones, Fecha_agrupacion)
        VALUES (Cod_periodo, Total_secciones, NOW());
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insertar_aulas` (IN `p_Numero_aula` INT, IN `p_Capacidad` INT, IN `p_Cupos_aula` INT, IN `p_Division` INT, IN `p_Secciones_disponibles` INT, IN `p_Secciones_ocupadas` INT, IN `p_Cod_edificio` INT)   BEGIN
    DECLARE v_AulaExistente INT;

    -- Verificar si el Cod_edificio existe
    IF NOT EXISTS (
        SELECT 1
        FROM tbl_edificio
        WHERE Cod_edificio = p_Cod_edificio
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Edificio no encontrado';
    END IF;

    -- Verificar si el Numero_aula ya existe en el mismo Cod_edificio
    SELECT COUNT(*) INTO v_AulaExistente
    FROM tbl_aula
    WHERE Numero_aula = p_Numero_aula AND Cod_edificio = p_Cod_edificio;

    IF v_AulaExistente > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El aula ya existe en el edificio especificado';
    END IF;

    -- Validar que los cupos no sean mayores que la capacidad
    IF p_Cupos_aula > p_Capacidad THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El número de cupos no puede ser mayor que la capacidad del aula';
    END IF;

    -- Validar que Division sea coherente
    IF p_Division < 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El número de divisiones debe ser al menos 1';
    END IF;

    IF p_Division > p_Capacidad THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El número de divisiones no puede exceder la capacidad del aula';
    END IF;

    -- Validar que la suma de secciones no exceda la capacidad
    IF p_Secciones_disponibles + p_Secciones_ocupadas > p_Capacidad THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La suma de secciones disponibles y ocupadas no puede exceder la capacidad del aula';
    END IF;

    -- Insertar el aula
    INSERT INTO tbl_aula (
        Numero_aula, 
        Capacidad, 
        Cupos_aula, 
        Division, 
        Secciones_disponibles, 
        Secciones_ocupadas, 
        Cod_edificio
    )
    VALUES (
        p_Numero_aula, 
        p_Capacidad, 
        p_Cupos_aula, 
        p_Division, 
        p_Secciones_disponibles, 
        p_Secciones_ocupadas, 
        p_Cod_edificio
    );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insertar_dias` (IN `p_dias` VARCHAR(50), IN `p_prefijo_dia` VARCHAR(50))   BEGIN
    -- Verificación de valores no vacíos
    IF p_dias IS NULL OR p_dias = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El nombre del día no puede estar vacío';
    END IF;

    IF p_prefijo_dia IS NULL OR p_prefijo_dia = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El prefijo del día no puede estar vacío';
    END IF;

    -- Verificación de duplicados
    IF EXISTS (SELECT 1 FROM tbl_dias WHERE dias = p_dias) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El día ya existe';
    END IF;

    -- Inserción en la tabla
    INSERT INTO tbl_dias (dias, prefijo_dia) VALUES (p_dias, p_prefijo_dia);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insertar_edificio` (IN `p_Nombre_edificio` VARCHAR(60), IN `p_Numero_pisos` INT, IN `p_Aulas_disponibles` INT)   BEGIN
    INSERT INTO tbl_edificio (Nombre_edificios, Numero_pisos, Aulas_disponibles)
    VALUES (p_Nombre_edificio, p_Numero_pisos, p_Aulas_disponibles);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insertar_estado_matricula` (IN `p_tipo` VARCHAR(50))   BEGIN
    -- Insertar datos en la tabla tbl_estado_matricula
    INSERT INTO tbl_estado_matricula (Tipo)
    VALUES (p_tipo);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insertar_historico_procedencia` (IN `p_Nombre_procedencia` VARCHAR(80), IN `p_Lugar_procedencia` VARCHAR(80), IN `p_Instituto` VARCHAR(80))   BEGIN
    -- Verificación de campos vacíos o nulos
    IF p_Nombre_procedencia IS NULL OR p_Nombre_procedencia = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El nombre de procedencia no puede estar vacío';
    END IF;
    
    IF p_Lugar_procedencia IS NULL OR p_Lugar_procedencia = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El lugar de procedencia no puede estar vacío';
    END IF;

    IF p_Instituto IS NULL OR p_Instituto = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El instituto no puede estar vacío';
    END IF;

    -- Verificación de duplicados
    IF EXISTS (
        SELECT 1 
        FROM tbl_historico_procedencia 
        WHERE Nombre_procedencia = p_Nombre_procedencia 
          AND Lugar_procedencia = p_Lugar_procedencia 
          AND Instituto = p_Instituto
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La procedencia ya existe en el historial';
    END IF;

    -- Inserción en la tabla
    INSERT INTO tbl_historico_procedencia (Nombre_procedencia, Lugar_procedencia, Instituto)
    VALUES (p_Nombre_procedencia, p_Lugar_procedencia, p_Instituto);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insertar_horario_seccion_asignatura` (IN `p_Cod_grados_asignaturas` INT, IN `p_Cod_secciones` INT, IN `p_Cod_dias` INT, IN `p_Hora_inicio` TIME, IN `p_Hora_fin` TIME)   BEGIN
    IF NOT EXISTS (SELECT 1 FROM tbl_grados_asignaturas WHERE Cod_grados_asignaturas = p_Cod_grados_asignaturas) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: La asignación de grado y asignatura especificada no existe.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM tbl_secciones WHERE Cod_secciones = p_Cod_secciones) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: La sección especificada no existe.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM tbl_dias WHERE Cod_dias = p_Cod_dias) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: El día especificado no existe.';
    END IF;

    IF p_Hora_inicio >= p_Hora_fin THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: La hora de inicio no puede ser mayor o igual que la hora de fin.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM tbl_secciones_asignaturas
        WHERE Cod_secciones = p_Cod_secciones
        AND Cod_dias = p_Cod_dias
        AND (
            (p_Hora_inicio BETWEEN Hora_inicio AND Hora_fin) OR
            (p_Hora_fin BETWEEN Hora_inicio AND Hora_fin) OR
            (Hora_inicio BETWEEN p_Hora_inicio AND p_Hora_fin) OR
            (Hora_fin BETWEEN p_Hora_inicio AND p_Hora_fin)
        )
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Ya existe un horario para esta sección y día que se solapa con el horario ingresado.';
    END IF;

    INSERT INTO tbl_secciones_asignaturas (
        Cod_grados_asignaturas,
        Cod_secciones,
        Cod_dias,
        Hora_inicio,
        Hora_fin
    ) VALUES (
        p_Cod_grados_asignaturas,
        p_Cod_secciones,
        p_Cod_dias,
        p_Hora_inicio,
        p_Hora_fin
    );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insertar_objeto` (IN `p_Objeto` VARCHAR(255), IN `p_Descripcion` TEXT, IN `p_Tipo_Objeto` VARCHAR(50))   BEGIN
    -- Verificar si el objeto ya existe en la tabla
    IF EXISTS (SELECT 1 FROM tbl_objetos WHERE Objeto = p_Objeto) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El objeto ya existe en la tabla.';
    ELSE
        -- Insertar el nuevo objeto en la tabla
        INSERT INTO tbl_objetos (Objeto, Descripcion, Tipo_Objeto)
        VALUES (p_Objeto, p_Descripcion, p_Tipo_Objeto);
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insertar_periodo_matricula` (IN `p_fecha_inicio` DATE, IN `p_fecha_fin` DATE, IN `p_anio_academico` INT, IN `p_estado` ENUM('activo','inactivo'))   BEGIN
    -- Validar que las fechas no sean NULL
    IF p_fecha_inicio IS NULL OR p_fecha_fin IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Las fechas no pueden ser NULL';
    END IF;

    -- Insertar datos en la tabla tbl_periodo_matricula
    INSERT INTO tbl_periodo_matricula (Fecha_inicio, Fecha_fin, Anio_academico, estado)
    VALUES (p_fecha_inicio, p_fecha_fin, p_anio_academico, p_estado);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insertar_procedencia_persona` (IN `p_Nombre_procedencia` INT, IN `p_Nombre_persona` INT, IN `p_Anio_procedencia` INT, IN `p_Grado_procedencia` VARCHAR(50))   BEGIN
    DECLARE v_Cod_procedencia INT;
    DECLARE v_Cod_persona INT;

    -- Verificar si el Nombre_procedencia es válido
    SELECT cod_procedencia INTO v_Cod_procedencia
    FROM tbl_historico_procedencia
    WHERE Nombre_procedencia = p_Nombre_procedencia;

    IF v_Cod_procedencia IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El nombre de procedencia no existe en el historial de procedencias.';
    END IF;

    -- Verificar si el Nombre_persona es válido
    SELECT cod_persona INTO v_Cod_persona
    FROM tbl_personas
    WHERE CONCAT(Nombre, ' ', Primer_apellido) = p_Nombre_persona;

    IF v_Cod_persona IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El nombre de la persona no existe en la lista de personas.';
    END IF;

    -- Verificación de duplicados en tbl_procedencia_persona
    IF EXISTS (
        SELECT 1
        FROM tbl_procedencia_persona
        WHERE Cod_procedencia = v_Cod_procedencia
          AND Cod_persona = v_Cod_persona
          AND Anio_procedencia = p_Anio_procedencia
          AND Grado_procedencia = p_Grado_procedencia
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Ya existe un registro con los mismos valores.';
    END IF;

    -- Inserción en la tabla tbl_procedencia_persona
    INSERT INTO tbl_procedencia_persona (Cod_procedencia, Cod_persona, Anio_procedencia, Grado_procedencia)
    VALUES (v_Cod_procedencia, v_Cod_persona, p_Anio_procedencia, p_Grado_procedencia);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insertar_secciones` (IN `p_Cod_aula` INT, IN `p_Cod_grado` INT, IN `p_Cod_Profesor` INT, IN `p_Cod_periodo_matricula` INT)   BEGIN
    DECLARE aula_existe INT DEFAULT 0;
    DECLARE grado_existe INT DEFAULT 0;
    DECLARE profesor_existe INT DEFAULT 0;
    DECLARE ultimo_nombre_seccion VARCHAR(45);
    DECLARE nuevo_nombre_seccion VARCHAR(45);
    DECLARE ultimo_numero INT DEFAULT 0;
    DECLARE nuevo_numero INT DEFAULT 0;

    -- Validar que el aula especificada existe
    SELECT COUNT(1) INTO aula_existe
    FROM tbl_aula 
    WHERE Cod_aula = p_Cod_aula;

    IF aula_existe = 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'El aula especificada no existe.';
    END IF;

    -- Validar que el grado especificado existe
    SELECT COUNT(1) INTO grado_existe
    FROM tbl_grados 
    WHERE Cod_grado = p_Cod_grado;

    IF grado_existe = 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'El grado especificado no existe.';
    END IF;

    -- Validar que el profesor especificado existe
    SELECT COUNT(1) INTO profesor_existe
    FROM tbl_profesores 
    WHERE Cod_profesor = p_Cod_Profesor;

    IF profesor_existe = 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'El profesor especificado no existe.';
    END IF;

    -- Obtener el último nombre de sección para el mismo grado y período académico
    SELECT Nombre_seccion
    INTO ultimo_nombre_seccion
    FROM tbl_secciones
    WHERE Cod_grado = p_Cod_grado AND Cod_periodo_matricula = p_Cod_periodo_matricula
    ORDER BY Cod_secciones DESC
    LIMIT 1;

    -- Manejo de errores al extraer el número
    BEGIN
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
        SET ultimo_numero = 0;

        -- Extraer el número del último nombre de sección
        IF ultimo_nombre_seccion IS NOT NULL THEN
            SET ultimo_numero = CAST(SUBSTRING(ultimo_nombre_seccion, 2) AS UNSIGNED);
        ELSE
            SET ultimo_numero = 0;
        END IF;
    END;

    -- Generar el nuevo número de sección
    SET nuevo_numero = ultimo_numero + 1;

    -- Generar el nuevo nombre de sección (siempre comienza con "A")
    SET nuevo_nombre_seccion = CONCAT('A', nuevo_numero);

    -- Insertar la nueva sección con el nombre generado
    INSERT INTO tbl_secciones (
        Nombre_seccion, 
        Cod_aula, 
        Cod_Profesor, 
        Cod_grado, 
        Cod_periodo_matricula
    ) 
    VALUES (
        nuevo_nombre_seccion, 
        p_Cod_aula, 
        p_Cod_Profesor, 
        p_Cod_grado, 
        p_Cod_periodo_matricula
    );
    
    -- Devolver el ID de la sección recién creada
    SELECT LAST_INSERT_ID() AS Cod_secciones;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insertar_seccion_asignatura` (IN `p_Cod_grados_asignaturas` INT, IN `p_Cod_secciones` INT, IN `p_Cod_dias` VARCHAR(255), IN `p_Hora_inicio` TIME, IN `p_Hora_fin` TIME)   BEGIN
    DECLARE new_Cod_seccion_asignatura INT;
    DECLARE dia_id INT;
    DECLARE i INT DEFAULT 1;
    DECLARE num_dias INT;
    DECLARE concatenated_dias VARCHAR(255) DEFAULT '';

    -- Validaciones previas
    IF NOT EXISTS (
        SELECT 1 
        FROM tbl_grados_asignaturas 
        WHERE Cod_grados_asignaturas = p_Cod_grados_asignaturas
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: La asignación de grado y asignatura especificada no existe.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM tbl_secciones 
        WHERE Cod_secciones = p_Cod_secciones
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: La sección especificada no existe.';
    END IF;

    IF p_Hora_inicio >= p_Hora_fin THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: La hora de inicio no puede ser mayor o igual que la hora de fin.';
    END IF;

    IF p_Cod_dias IS NULL OR p_Cod_dias = '' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: No se especificaron días para la asignación.';
    END IF;

    -- Validar si ya existe un registro con la misma combinación de sección y asignatura
    IF EXISTS (
        SELECT 1
        FROM tbl_secciones_asignaturas
        WHERE Cod_grados_asignaturas = p_Cod_grados_asignaturas
          AND Cod_secciones = p_Cod_secciones
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: Ya existe un registro con la misma sección y asignatura.';
    END IF;

    -- Validar conflicto de horarios
    WHILE i <= LENGTH(p_Cod_dias) - LENGTH(REPLACE(p_Cod_dias, ',', '')) + 1 DO
        SET dia_id = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(p_Cod_dias, ',', i), ',', -1) AS UNSIGNED);

        -- Verificar si el día existe en tbl_dias
        IF NOT EXISTS (SELECT 1 FROM tbl_dias WHERE Cod_dias = dia_id) THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Error: Uno o más días especificados no existen en tbl_dias.';
        END IF;

        -- Verificar conflicto de horario
        IF EXISTS (
            SELECT 1
            FROM tbl_secciones_asignaturas sa
            JOIN tbl_secciones_asignaturas_dias sad ON sa.Cod_seccion_asignatura = sad.Cod_seccion_asignatura
            WHERE sa.Cod_secciones = p_Cod_secciones
              AND sad.Cod_dias = dia_id
              AND (
                   (p_Hora_inicio >= sa.Hora_inicio AND p_Hora_inicio < sa.Hora_fin) OR
                   (p_Hora_fin > sa.Hora_inicio AND p_Hora_fin <= sa.Hora_fin) OR
                   (p_Hora_inicio <= sa.Hora_inicio AND p_Hora_fin >= sa.Hora_fin)
              )
        ) THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Error: Conflicto de horario en los días especificados.';
        END IF;

        SET i = i + 1;
    END WHILE;

    -- Insertar en tbl_secciones_asignaturas
    INSERT INTO tbl_secciones_asignaturas (
        Cod_grados_asignaturas,
        Cod_secciones,
        Hora_inicio,
        Hora_fin
    ) VALUES (
        p_Cod_grados_asignaturas,
        p_Cod_secciones,
        p_Hora_inicio,
        p_Hora_fin
    );

    SET new_Cod_seccion_asignatura = LAST_INSERT_ID();

    -- Asegurarse de haber obtenido un new_Cod_seccion_asignatura válido
    IF new_Cod_seccion_asignatura IS NULL THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: No se pudo obtener el ID de la asignación de sección.';
    END IF;

    -- Calcular el número de días en la lista
    SET num_dias = LENGTH(p_Cod_dias) - LENGTH(REPLACE(p_Cod_dias, ',', '')) + 1;

    -- Procesar e insertar cada día en tbl_secciones_asignaturas_dias
    SET i = 1; -- Reiniciar contador
    WHILE i <= num_dias DO
        SET dia_id = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(p_Cod_dias, ',', i), ',', -1) AS UNSIGNED);

        -- Insertar en la tabla intermedia
        INSERT INTO tbl_secciones_asignaturas_dias (Cod_seccion_asignatura, Cod_dias)
        VALUES (new_Cod_seccion_asignatura, dia_id);

        -- Concatenar los nombres de los días
        SET concatenated_dias = CONCAT_WS(', ', concatenated_dias, 
            (SELECT dias FROM tbl_dias WHERE Cod_dias = dia_id));

        SET i = i + 1;
    END WHILE;

    -- Actualizar el campo Dias_nombres en tbl_secciones_asignaturas
    UPDATE tbl_secciones_asignaturas
    SET Dias_nombres = TRIM(TRAILING ', ' FROM concatenated_dias)
    WHERE Cod_seccion_asignatura = new_Cod_seccion_asignatura;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insert_Aula` (IN `p_Numero_aula` VARCHAR(50), IN `p_Capacidad` INT, IN `p_Cupos_aula` INT, IN `p_Nombre_edificio` VARCHAR(100), IN `p_Division` INT, IN `p_Secciones_disponibles` INT)   BEGIN
    INSERT INTO aula (Numero_aula, Capacidad, Cupos_aula, Nombre_edificio, Division, Secciones_disponibles)
    VALUES (p_Numero_aula, p_Capacidad, p_Cupos_aula, p_Nombre_edificio, p_Division, p_Secciones_disponibles);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insert_departamento` (IN `p_Nombre_departamento` VARCHAR(100), IN `p_Nombre_municipio` VARCHAR(100))   BEGIN
    INSERT INTO tbl_departamento (Nombre_departamento, Nombre_municipio)
    VALUES (p_Nombre_departamento, p_Nombre_municipio);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insert_tipo_persona` (IN `p_Tipo` VARCHAR(255))   BEGIN
    -- Check if the type already exists
    IF (SELECT COUNT(*) FROM tbl_tipo_persona WHERE Tipo = p_Tipo) > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El tipo de persona ya existe';
    ELSE
        -- Insert the new type
        INSERT INTO tbl_tipo_persona (Tipo) VALUES (p_Tipo);
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_actividad_extracurricular` (IN `p_Cod_actividades_extracurriculares` INT)   BEGIN
    IF p_Cod_actividades_extracurriculares = 0 THEN
        SELECT 
            a.Cod_actividades_extracurriculares AS Codigo_actividad,  -- Código de la actividad
            a.Nombre AS Nombre_actividad,
            a.Descripcion,
            a.Hora_inicio,
            a.Hora_final,
            a.Fecha,  -- Fecha de la actividad
            a.Estado, -- Estado de la actividad
            s.Cod_secciones AS Codigo_seccion, -- Código de la sección
            s.Nombre_seccion, -- Nombre de la sección
            g.Nombre_grado -- Nombre del grado asociado a la sección
        FROM 
            tbl_actividades_extracurriculares a
        LEFT JOIN 
            tbl_secciones s ON a.Cod_seccion = s.Cod_secciones
        LEFT JOIN 
            tbl_grados g ON s.Cod_grado = g.Cod_grado; -- Relacionar con los grados
    ELSE
        SELECT 
            a.Cod_actividades_extracurriculares AS Codigo_actividad,  -- Código de la actividad
            a.Nombre AS Nombre_actividad,
            a.Descripcion,
            a.Hora_inicio,
            a.Hora_final,
            a.Fecha,  -- Fecha de la actividad
            a.Estado, -- Estado de la actividad
            s.Cod_secciones AS Codigo_seccion, -- Código de la sección
            s.Nombre_seccion, -- Nombre de la sección
            g.Nombre_grado -- Nombre del grado asociado a la sección
        FROM 
            tbl_actividades_extracurriculares a
        LEFT JOIN 
            tbl_secciones s ON a.Cod_seccion = s.Cod_secciones
        LEFT JOIN 
            tbl_grados g ON s.Cod_grado = g.Cod_grado
        WHERE 
            a.Cod_actividades_extracurriculares = p_Cod_actividades_extracurriculares; -- Retorna la actividad específica
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_asignaturas_por_seccion_y_profesor` (IN `p_cod_seccion` INT, IN `P_cod_profesor` INT)   BEGIN
    SELECT
        sa.Cod_seccion_asignatura,
        sa.Cod_secciones,
        sa.Hora_inicio,
        sa.Hora_fin,
        gr.Nombre_grado,
        a.Nombre_asignatura,
        d.dias AS Nombre_dia
    FROM
        tbl_secciones_asignaturas sa
    JOIN tbl_grados_asignaturas ga ON sa.Cod_grados_asignaturas = ga.Cod_grados_asignaturas
    JOIN tbl_grados gr ON ga.Cod_grado = gr.Cod_grado
    JOIN tbl_asignaturas a ON ga.Cod_asignatura = a.Cod_asignatura
    JOIN tbl_secciones s ON sa.Cod_secciones = s.Cod_secciones
    JOIN tbl_dias d ON sa.Cod_dias = d.Cod_dias
    WHERE
        sa.Cod_secciones = p_cod_seccion 
        AND s.Cod_Profesor = p_cod_profesor;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_aulas` (IN `p_Cod_aula` INT)   BEGIN
    IF p_Cod_aula = 0 THEN
        SELECT 
            a.Cod_aula,
            a.Numero_aula,
            a.Capacidad,
            a.Cupos_aula,
            a.Division,
            a.Secciones_disponibles,
            a.Secciones_ocupadas,
            e.Nombre_edificios
        FROM tbl_aula a
        JOIN tbl_edificio e ON a.Cod_edificio = e.Cod_edificio
        ORDER BY a.Numero_aula;
    ELSE
        SELECT 
            a.Cod_aula,
            a.Numero_aula,
            a.Capacidad,
            a.Cupos_aula,
            a.Division,
            a.Secciones_disponibles,
            a.Secciones_ocupadas,
            e.Nombre_edificios
        FROM tbl_aula a
        JOIN tbl_edificio e ON a.Cod_edificio = e.Cod_edificio
        WHERE a.Cod_aula = p_Cod_aula
        ORDER BY a.Numero_aula;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_caja` (IN `p_cod_caja` INT)   BEGIN
    IF p_cod_caja IS NOT NULL THEN
        SELECT * FROM tbl_caja WHERE Cod_caja = p_cod_caja;
    ELSE
        SELECT * FROM tbl_caja; -- Si es NULL, obtiene todas las cajas
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_catalogo_cuenta_esp` (IN `p_cod_catalogo_cuenta` INT)  NO SQL BEGIN
	SELECT * FROM tbl_catalogo_cuentas WHERE Cod_cuenta = p_cod_catalogo_cuenta;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_detalle_seccion_asignatura` (IN `p_Cod_seccion_asignatura` INT)   BEGIN
    SELECT 
        sa.Cod_seccion_asignatura,
        s.Nombre_seccion,
        sa.Hora_inicio,
        sa.Hora_fin,
        gr.Nombre_grado,
        a.Nombre_asignatura,
        GROUP_CONCAT(DISTINCT d.prefijo_dia ORDER BY d.prefijo_dia SEPARATOR ', ') AS Nombre_dia
    FROM 
        tbl_secciones_asignaturas sa
    JOIN 
        tbl_grados_asignaturas g ON sa.Cod_grados_asignaturas = g.Cod_grados_asignaturas
    JOIN 
        tbl_grados gr ON g.Cod_grado = gr.Cod_grado
    JOIN 
        tbl_asignaturas a ON g.Cod_asignatura = a.Cod_asignatura
    JOIN 
        tbl_secciones s ON sa.Cod_secciones = s.Cod_secciones
    LEFT JOIN 
        tbl_secciones_asignaturas_dias sad ON sa.Cod_seccion_asignatura = sad.Cod_seccion_asignatura
    LEFT JOIN 
        tbl_dias d ON sad.Cod_dias = d.Cod_dias
    WHERE 
        sa.Cod_seccion_asignatura = p_Cod_seccion_asignatura
    GROUP BY
        sa.Cod_seccion_asignatura, s.Nombre_seccion, sa.Hora_inicio, sa.Hora_fin, gr.Nombre_grado, a.Nombre_asignatura;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_dias` (IN `p_Cod_dias` INT)   BEGIN
    IF p_Cod_dias = 0 THEN
        -- Retorna todos los días en el orden correcto
        SELECT 
            Cod_dias, 
            dias, 
            prefijo_dia
        FROM tbl_dias;
    ELSE
        -- Verifica si existe el día especificado y devuelve solo ese día
        SELECT 
            Cod_dias, 
            dias, 
            prefijo_dia
        FROM tbl_dias 
        WHERE Cod_dias = p_Cod_dias;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_edificios` (IN `p_Cod_edificio` INT)   BEGIN
    IF p_Cod_edificio = 0 THEN
        SELECT * FROM tbl_edificio; -- Retorna todos las edificios
    ELSE
        SELECT * FROM tbl_edificio WHERE `Cod_edificio` = p_Cod_edificio; -- Retorna el edificio específico
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_estado_matricula` (IN `p_Cod_estado_matricula` INT)   BEGIN
    -- Si se proporciona un Cod_estado_matricula, se obtiene un registro específico
    IF p_Cod_estado_matricula IS NOT NULL THEN
        SELECT *
        FROM tbl_estado_matricula
        WHERE Cod_estado_matricula = p_Cod_estado_matricula;
    ELSE
        -- Si no se proporciona, se obtienen todos los registros
        SELECT *
        FROM tbl_estado_matricula;
    END IF;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_historico_procedencia` (IN `p_cod_procedencia` INT)   BEGIN
    IF p_cod_procedencia IS NULL OR p_cod_procedencia = 0 THEN
        -- Retorna todos los registros del histórico de procedencia
        SELECT * FROM tbl_historico_procedencia;
    ELSE
        -- Verifica si existe el registro especificado
        SELECT * FROM tbl_historico_procedencia WHERE cod_procedencia = p_cod_procedencia;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_matriculas` (IN `p_Cod_matricula` INT)   BEGIN
    IF p_Cod_matricula IS NOT NULL THEN
        SELECT 
            m.Cod_matricula,
            m.Codificacion_matricula,
            m.fecha_matricula,
            m.Cod_genialogia ,
            em.tipo AS tipo_estado,
            pm.Fecha_inicio,
            pm.Fecha_fin,
            pm.anio_academico,
            tm.tipo AS tipo_matricula,
            c.Fecha AS fecha_caja,
            c.Tipo_transaccion,
            c.Monto,
            c.Descripcion AS descripcion_caja,
            c.Cod_concepto
        FROM 
            tbl_matricula m
        LEFT JOIN 
            tbl_estado_matricula em ON m.Cod_estado_matricula = em.Cod_estado_matricula
        LEFT JOIN 
            tbl_periodo_matricula pm ON m.Cod_periodo_matricula = pm.Cod_periodo_matricula
        LEFT JOIN 
            tbl_tipo_matricula tm ON m.Cod_tipo_matricula = tm.Cod_tipo_matricula
        LEFT JOIN 
            tbl_caja c ON m.Cod_caja = c.Cod_caja
        WHERE 
            m.Cod_matricula = p_Cod_matricula;
    ELSE
        SELECT 
            m.Cod_matricula,
            m.Codificacion_matricula,
            m.fecha_matricula,
            m.Cod_genialogia ,
            em.tipo AS tipo_estado,
            pm.Fecha_inicio,
            pm.Fecha_fin,
            pm.anio_academico,
            tm.tipo AS tipo_matricula,
            c.Fecha AS fecha_caja,
            c.Tipo_transaccion,
            c.Monto,
            c.Descripcion AS descripcion_caja,
            c.Cod_concepto
        FROM 
            tbl_matricula m
        LEFT JOIN 
            tbl_estado_matricula em ON m.Cod_estado_matricula = em.Cod_estado_matricula
        LEFT JOIN 
            tbl_periodo_matricula pm ON m.Cod_periodo_matricula = pm.Cod_periodo_matricula
        LEFT JOIN 
            tbl_tipo_matricula tm ON m.Cod_tipo_matricula = tm.Cod_tipo_matricula
        LEFT JOIN 
            tbl_caja c ON m.Cod_caja = c.Cod_caja;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_periodo_matricula` (IN `p_Cod_periodo_matricula` INT)   BEGIN
    -- Si se proporciona un Cod_periodo_matricula, se obtiene un registro específico
    IF p_Cod_periodo_matricula IS NOT NULL THEN
        SELECT *
        FROM tbl_periodo_matricula
        WHERE Cod_periodo_matricula = p_Cod_periodo_matricula;
    ELSE
        -- Si no se proporciona, se obtienen todos los registros
        SELECT *
        FROM tbl_periodo_matricula;
    END IF;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_secciones` (IN `p_Cod_secciones` INT)   BEGIN
    IF p_Cod_secciones = 0 THEN
        SELECT 
            s.Cod_secciones,
            s.Nombre_seccion,
            a.Numero_aula,
            g.Nombre_grado,
            s.Cod_Profesor,
            s.Cod_periodo_matricula
        FROM tbl_secciones s
        JOIN tbl_aula a ON s.Cod_aula = a.Cod_aula
        JOIN tbl_grados g ON s.Cod_grado = g.Cod_grado;
    ELSE
        SELECT 
            s.Cod_secciones,
            s.Nombre_seccion,
            a.Numero_aula,
            g.Nombre_grado,
            s.Cod_Profesor,
            s.Cod_periodo_matricula
        FROM tbl_secciones s
        JOIN tbl_aula a ON s.Cod_aula = a.Cod_aula
        JOIN tbl_grados g ON s.Cod_grado = g.Cod_grado
        WHERE s.Cod_secciones = p_Cod_secciones;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_secciones_periodo_activo` ()   BEGIN
    -- Declarar variable para almacenar el código del periodo activo
    DECLARE p_Cod_periodo_matricula INT;

    -- Obtener el periodo activo
    SELECT Cod_periodo_matricula
    INTO p_Cod_periodo_matricula
    FROM tbl_periodo_matricula
    WHERE Estado = 'Activo'
    LIMIT 1;

    -- Verificar si no hay un periodo activo
    IF p_Cod_periodo_matricula IS NULL THEN
        SELECT 'No hay un periodo activo' AS Mensaje;
    ELSE
        -- Obtener las secciones del periodo activo
        SELECT 
            s.Cod_secciones,
            s.Nombre_seccion,
            g.Nombre_grado,
            CONCAT(pers.Nombre, ' ', IFNULL(pers.Primer_apellido, ''), ' ', IFNULL(pers.Segundo_apellido, '')) AS Profesor
        FROM 
            tbl_secciones s
        INNER JOIN tbl_grados g ON s.Cod_grado = g.Cod_grado
        INNER JOIN tbl_profesores prof ON s.Cod_Profesor = prof.Cod_profesor
        INNER JOIN tbl_personas pers ON prof.cod_persona = pers.cod_persona
        WHERE s.Cod_periodo_matricula = p_Cod_periodo_matricula;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_secciones_por_periodo` (IN `p_Cod_periodo_matricula` INT)   BEGIN
    SELECT 
        s.Cod_secciones,
        s.Nombre_seccion,
        a.Numero_aula AS Aula, -- Número del aula
        g.Nombre_grado AS Grado, -- Nombre del grado
        CONCAT(
            pers.Nombre, ' ', 
            IFNULL(pers.Primer_apellido, ''), ' ', 
            IFNULL(pers.Segundo_apellido, '')
        ) AS Profesor -- Nombre completo del profesor
    FROM 
        tbl_secciones s
    INNER JOIN 
        tbl_aula a ON s.Cod_aula = a.Cod_aula
    INNER JOIN 
        tbl_grados g ON s.Cod_grado = g.Cod_grado
    INNER JOIN 
        tbl_profesores prof ON s.Cod_Profesor = prof.Cod_profesor
    INNER JOIN 
        tbl_personas pers ON prof.cod_persona = pers.cod_persona
    WHERE 
        s.Cod_periodo_matricula = p_Cod_periodo_matricula;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_secciones_por_profesor` (IN `p_cod_profesor` INT)   BEGIN
    SELECT
        s.Cod_secciones,
        s.Nombre_seccion,
        s.Cod_aula,
        s.Cod_grado,
        s.Cod_periodo_matricula
    FROM
        tbl_secciones s
    WHERE
        s.Cod_Profesor = p_cod_profesor;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_seccion_por_id` (IN `p_Cod_secciones` INT)   BEGIN
    SELECT 
        s.Cod_secciones,
        s.Nombre_seccion,
        e.Cod_edificio,
        e.Nombre_edificios,
        a.Cod_aula,
        a.Numero_aula,
        g.Cod_grado,
        g.Nombre_grado,
        p.Cod_profesor,
        CONCAT(per.Nombre, ' ', IFNULL(per.Segundo_nombre, ''), ' ', per.Primer_apellido, ' ', IFNULL(per.Segundo_apellido, '')) AS Nombre_completo,
        s.Cod_periodo_matricula
    FROM tbl_secciones s
    JOIN tbl_aula a ON s.Cod_aula = a.Cod_aula
    JOIN tbl_edificio e ON a.Cod_edificio = e.Cod_edificio
    JOIN tbl_grados g ON s.Cod_grado = g.Cod_grado
    JOIN tbl_profesores p ON s.Cod_Profesor = p.Cod_Profesor
    JOIN tbl_personas per ON p.Cod_persona = per.Cod_persona
    WHERE s.Cod_secciones = p_Cod_secciones;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_TodasAgrupacionesConEstado` ()   BEGIN
    SELECT 
        hs.Cod_agrupadora,
        hs.Cod_periodo_matricula,
        (SELECT COUNT(*) 
         FROM tbl_secciones 
         WHERE Cod_periodo_matricula = hs.Cod_periodo_matricula) AS Total_secciones,
        hs.Fecha_agrupacion,
        pm.Anio_academico,
        CASE 
            WHEN pm.estado = 'activo' THEN 'Activo'
            ELSE 'Inactivo'
        END AS Estado
    FROM 
        tbl_historial_secciones hs
    JOIN 
        tbl_periodo_matricula pm 
    ON 
        hs.Cod_periodo_matricula = pm.Cod_periodo_matricula;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_TotalSeccionesAgrupadores` ()   BEGIN
    SELECT 
        hs.Cod_agrupadora,
        hs.Cod_periodo_matricula,
        (SELECT COUNT(*) 
         FROM tbl_secciones 
         WHERE Cod_periodo_matricula = hs.Cod_periodo_matricula) AS Total_secciones,
        hs.Fecha_agrupacion,
        pm.Anio_academico,
        pm.estado
    FROM 
        tbl_historial_secciones hs
    JOIN 
        tbl_periodo_matricula pm 
    ON 
        hs.Cod_periodo_matricula = pm.Cod_periodo_matricula;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_departamento` (IN `p_Cod_departamento` INT, IN `p_Nombre_departamento` VARCHAR(100), IN `p_Nombre_municipio` VARCHAR(100))   BEGIN
    UPDATE tbl_departamento
    SET 
        Nombre_departamento = p_Nombre_departamento,
        Nombre_municipio = p_Nombre_municipio
    WHERE Cod_departamento = p_Cod_departamento;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_tipo_persona` (IN `p_Cod_tipo_persona` INT, IN `p_Tipo` VARCHAR(30))   BEGIN
    UPDATE tbl_tipo_persona SET Tipo = p_Tipo WHERE Cod_tipo_persona = p_Cod_tipo_persona;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_usuariosRolActividadesExtra` (IN `p_cod_seccion` INT)   BEGIN
    IF p_cod_seccion IS NULL THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'El parámetro p_cod_seccion no puede ser NULL';
    END IF;

    SELECT 
        u.cod_persona,
        CONCAT_WS(' ', p.Nombre, p.Segundo_nombre, p.Primer_apellido, p.Segundo_apellido) AS nombre_completo,
        u.correo_usuario
    FROM 
        tbl_usuarios u
    INNER JOIN 
        tbl_personas p ON u.cod_persona = p.cod_persona
    INNER JOIN 
        tbl_estructura_familiar ef ON p.cod_persona = ef.cod_persona_padre
    INNER JOIN 
        tbl_secciones_matricula sm ON ef.cod_persona_estudiante = sm.cod_persona
    WHERE 
        u.cod_rol = 1 AND sm.cod_seccion = p_cod_seccion;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_actividad_academica` (IN `p_Cod_actividad_academica` INT, IN `p_Cod_profesor` INT, IN `p_Cod_ponderacion_ciclo` INT, IN `p_Cod_parcial` INT, IN `p_Nombre_actividad_academica` VARCHAR(50), IN `p_Descripcion` VARCHAR(80), IN `p_Fechayhora_Inicio` DATETIME, IN `p_Fechayhora_Fin` DATETIME, IN `p_Valor` DECIMAL(5,2), IN `p_Cod_secciones` INT(11))   BEGIN
     UPDATE tbl_actividades_academicas
    SET
        Cod_profesor = p_Cod_profesor,
        Cod_ponderacion_ciclo = p_Cod_ponderacion_ciclo,
        Cod_parcial = p_Cod_parcial,
        Nombre_actividad_academica = p_Nombre_actividad_academica,
        Descripcion = p_Descripcion,
        Fechayhora_Inicio = p_Fechayhora_Inicio,
        Fechayhora_Fin = p_Fechayhora_Fin,
        Valor = p_Valor,
        Cod_secciones = Cod_secciones
    WHERE Cod_actividad_academica = p_Cod_actividad_academica;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_asignatura` (IN `p_Cod_asignatura` INT(11), IN `p_Nombre_asignatura` VARCHAR(20), IN `p_Descripcion_asignatura` VARCHAR(60))   BEGIN  
    -- Iniciar la transacción  
    START TRANSACTION;  

    -- Actualizar el registro en la tabla tbl_asignaturas
    UPDATE tbl_asignaturas  
    SET Nombre_asignatura = p_Nombre_asignatura, 
        Descripcion_asignatura = p_Descripcion_asignatura  
    WHERE Cod_asignatura = p_Cod_asignatura;  

    -- Comprobar si la actualización se realizó correctamente  
    IF ROW_COUNT() = 0 THEN  
        -- Si no se actualizó ninguna fila, lanzar un error  
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se encontró ninguna asignatura con ese código.';  
    END IF;  

    -- Confirmar la transacción  
    COMMIT;  
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_asistencia` (IN `p_Cod_asistencias` INT, IN `p_Observacion` VARCHAR(60), IN `p_Cod_estado_asistencia` INT, IN `p_Cod_seccion_matricula` INT)   BEGIN
  -- Verificar que el código de asistencia existe
    IF (SELECT COUNT(*) FROM tbl_asistencias WHERE Cod_asistencias = p_Cod_asistencias) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El código de asistencia no existe';
    END IF;

    -- Verificar que el código de estado de asistencia existe solo si se proporciona
    IF p_Cod_estado_asistencia IS NOT NULL AND 
       (SELECT COUNT(*) FROM tbl_estado_asistencia WHERE Cod_estado_asistencia = p_Cod_estado_asistencia) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El código de estado de asistencia no existe';
    END IF;

    -- Verificar que el código de sección matrícula existe solo si se proporciona
    IF p_Cod_seccion_matricula IS NOT NULL AND 
       (SELECT COUNT(*) FROM tbl_secciones_matricula WHERE Cod_seccion_matricula = p_Cod_seccion_matricula) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El código de sección matrícula no existe';
    END IF;

    -- Actualizar los campos sin modificar la fecha
    UPDATE tbl_asistencias
    SET 
        Cod_estado_asistencia = COALESCE(p_Cod_estado_asistencia, Cod_estado_asistencia),
        Cod_seccion_matricula = COALESCE(p_Cod_seccion_matricula, Cod_seccion_matricula),
        Observacion = CASE 
            WHEN p_Observacion = 'BORRAR' THEN NULL
            WHEN p_Observacion IS NOT NULL AND p_Observacion != '' THEN p_Observacion
            ELSE Observacion
        END
    WHERE Cod_asistencias = p_Cod_asistencias;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_ciclos` (IN `p_Cod_ciclo` INT(11), IN `p_Nombre_ciclo` VARCHAR(20))   UPDATE tbl_ciclos
SET
Nombre_ciclo = p_Nombre_ciclo
WHERE Cod_ciclo = p_Cod_ciclo$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_especialidad` (IN `p_Cod_Especialidad` INT, IN `p_Nombre_especialidad` VARCHAR(30))   BEGIN
    UPDATE tbl_especialidades
    SET Nombre_especialidad = p_Nombre_especialidad
    WHERE Cod_Especialidad = p_Cod_Especialidad; -- Usar el parámetro aquí
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_estado_asistencia` (IN `p_Cod_estado_asistencia` INT, IN `p_Descripcion_asistencia` VARCHAR(50))   BEGIN
-- Verificar que el código de estado asistencia existe
    IF (SELECT COUNT(*) FROM tbl_estado_asistencia WHERE Cod_estado_asistencia = p_Cod_estado_asistencia) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El código de estado asistencia no existe';
    END IF;
    
-- Validar que la descripción no sea nula o vacía
    IF p_Descripcion_asistencia IS NULL OR TRIM(p_Descripcion_asistencia) = '' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La descripción de estado asistencia no puede estar vacía';
    END IF;

    -- Validar longitud de la descripción
    IF LENGTH(p_Descripcion_asistencia) > 50 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La descripción de estado asistencia no puede exceder los 50 caracteres';
    END IF;
    
    -- Validar que no exista un registro duplicado (excluyendo el que está siendo actualizado)
    IF (SELECT COUNT(*) 
        FROM tbl_estado_asistencia 
        WHERE Descripcion_asistencia = p_Descripcion_asistencia
        AND Cod_estado_asistencia != p_Cod_estado_asistencia) > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ya existe un estado asistencia con esa descripción';
    END IF;

    UPDATE tbl_estado_asistencia
    SET Descripcion_asistencia = p_Descripcion_asistencia
    WHERE Cod_estado_asistencia = p_Cod_estado_asistencia;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_estado_nota` (IN `p_Cod_estado` INT, IN `p_Descripcion` VARCHAR(100))   BEGIN
    -- Validaciones
    -- validar que codigo al que va actualizar informacion exista
    IF NOT EXISTS (SELECT 1 FROM tbl_estado_nota WHERE Cod_estado = p_Cod_estado) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El Código de Estado no existe';
    END IF;

    -- validar que la descripcion no este en blanco o nula
    IF p_Descripcion IS NULL OR p_Descripcion = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La Descripción no puede estar vacía';
    END IF;

    -- Actualización de datos
    UPDATE tbl_estado_nota
    SET Descripcion = p_Descripcion
    WHERE Cod_estado = p_Cod_estado;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_grados` (IN `p_Cod_grado` INT(11), IN `p_Cod_ciclo` INT(11), IN `p_Nombre_grado` VARCHAR(20), IN `p_Prefijo` VARCHAR(50))   UPDATE tbl_grados
SET
Cod_ciclo = p_Cod_ciclo,
Nombre_grado = p_Nombre_grado,
Prefijo = p_Prefijo
WHERE Cod_grado = p_Cod_grado$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_grado_academico` (IN `p_Cod_grado_academico` INT, IN `p_Descripcion` VARCHAR(30))   BEGIN
    UPDATE tbl_grado_academico
    SET Descripcion = p_Descripcion
    WHERE Cod_grado_academico = p_Cod_grado_academico;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `UPDATE_HISTORIAL` (IN `p_Cod_historial_academico` INT(11), IN `p_Cod_estado` INT(11), IN `p_Cod_persona` INT(11), IN `p_Grado` INT(11), IN `p_Año_Academico` INT(11), IN `p_Promedio_Anual` DECIMAL(5,2), IN `p_Cod_Instituto` INT(11), IN `p_Observacion` VARCHAR(60))   BEGIN
    UPDATE tbl_historiales_academicos
    SET 
        Cod_estado = p_Cod_estado,
        Cod_persona = p_Cod_persona,
        Cod_grado = p_Grado,
        Año_Academico = p_Año_Academico,
        Promedio_Anual = p_Promedio_Anual,
        Fecha_Registro = NOW(),  -- Asignamos la fecha actual en lugar de pasarla como parámetro
        Cod_Instituto = p_Cod_Instituto,
        Observacion = p_Observacion
    WHERE Cod_historial_academico = p_Cod_historial_academico;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_instituto` (IN `p_cod_instituto` INT, IN `p_nom_instituto` VARCHAR(30))  NO SQL UPDATE tbl_institutos
    SET 
    Nom_Instituto = p_nom_instituto
    WHERE Cod_Instituto = p_cod_instituto$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_nota` (IN `p_Cod_nota` INT, IN `p_Nota` DECIMAL(5,2), IN `p_Observacion` VARCHAR(60))   BEGIN
    -- Verifica si el registro existe antes de actualizar
    IF EXISTS (SELECT 1 FROM tbl_notas WHERE Cod_nota = p_Cod_nota) THEN
        -- Actualiza el registro en la tabla
        UPDATE tbl_notas
        SET 
            Nota = p_Nota,
            Observacion = p_Observacion,
            Cod_estado = NULL -- Dejar el campo como NULL
        WHERE 
            Cod_nota = p_Cod_nota;
    ELSE
        -- Mensaje de error si el registro no existe
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El código de la nota especificado no existe.';
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_parametro` (IN `p_Cod_parametro` INT, IN `p_Parametro` VARCHAR(50), IN `p_Valor` VARCHAR(100), IN `p_Fecha_Modificacion` DATETIME)   BEGIN
    -- Actualizar solo los parámetros y la fecha de modificación
    UPDATE `tbl_parametros`
    SET 
        `Parametro` = p_Parametro,
        `Valor` = p_Valor,
        `Fecha_Modificacion` = p_Fecha_Modificacion
    WHERE `Cod_parametro` = p_Cod_parametro;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_parcial` (IN `p_Cod_parcial` INT(11), IN `p_Nombre_parcial` VARCHAR(20))   BEGIN  
    -- Iniciar la transacción  
    START TRANSACTION;  

    -- Actualizar el registro en la tabla tbl_parciales
    UPDATE tbl_parciales  
    SET Nombre_parcial = p_Nombre_parcial
    WHERE Cod_parcial = p_Cod_parcial;  

    -- Comprobar si la actualización se realizó correctamente  
    IF ROW_COUNT() = 0 THEN  
        -- Si no se actualizó ninguna fila, lanzar un error  
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se encontró ningún parcial con ese código.';  
    END IF;  

    -- Confirmar la transacción  
    COMMIT;  
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_persona` (IN `cod_persona` INT, IN `dni_persona` VARCHAR(20), IN `Nombre` VARCHAR(50), IN `Segundo_nombre` VARCHAR(50), IN `Primer_apellido` VARCHAR(50), IN `Segundo_Apellido` VARCHAR(50), IN `Nacionalidad` VARCHAR(30), IN `direccion_persona` VARCHAR(100), IN `fecha_nacimiento` DATE, IN `Estado_Persona` TINYINT, IN `Cod_tipo_persona` INT, IN `cod_departamento` INT, IN `cod_genero` INT)   BEGIN
    UPDATE tbl_personas SET
        dni_persona = dni_persona,
        Nombre = Nombre,
        Segundo_nombre = Segundo_nombre,
        Primer_apellido = Primer_apellido,
        Segundo_Apellido = Segundo_Apellido,
        Nacionalidad = Nacionalidad,
        direccion_persona = direccion_persona,
        fecha_nacimiento = fecha_nacimiento,
        Estado_Persona = Estado_Persona,
        Cod_tipo_persona = Cod_tipo_persona,
        cod_departamento = cod_departamento,
        cod_genero = cod_genero
    WHERE cod_persona = cod_persona;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_ponderacion` (IN `p_Cod_ponderacion` INT(11), IN `p_Descripcion_ponderacion` VARCHAR(20))   UPDATE tbl_ponderaciones
SET
Descripcion_ponderacion = p_Descripcion_ponderacion
WHERE Cod_ponderacion = p_Cod_ponderacion$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_Ponderaciones_Ciclos` (IN `p_Cod_ponderacion_ciclo` INT(11), IN `p_Cod_ponderacion` INT(11), IN `p_Cod_ciclo` INT(11), IN `p_Valor` DECIMAL(5,2))   BEGIN
    DECLARE p_Ponderacion_total DECIMAL(5,2);
DECLARE p_Descripcion_ponderacion VARCHAR(50);
DECLARE p_Valor_max DECIMAL(5,2); -- Para el valor máximo de la recuperación

-- Obtener la descripción de la ponderación
SELECT Descripcion_ponderacion INTO p_Descripcion_ponderacion
FROM tbl_ponderaciones 
WHERE Cod_ponderacion = p_Cod_ponderacion;

-- Verificar si la descripción contiene la palabra 'recuperacion' (sin importar mayúsculas o minúsculas)
IF p_Descripcion_ponderacion LIKE '%recuperacion%' THEN
    -- Verificar si ya existe un valor de recuperación para este ciclo
    SELECT SUM(Valor) INTO p_Ponderacion_total
    FROM tbl_ponderaciones_ciclos
    WHERE Cod_ciclo = p_Cod_ciclo AND Cod_ponderacion = p_Cod_ponderacion;

    IF p_Ponderacion_total > 100 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La suma de las ponderaciones no puede exceder 100% para la recuperación.';
    END IF;

    -- Verificar si el valor de la recuperación es mayor a 100
    IF p_Valor > 100 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El valor de la recuperación no puede ser mayor a 100.';
    END IF;

ELSE
    -- Si NO es una recuperación, validamos que la suma de las ponderaciones no exceda el 100%
    SELECT SUM(Valor) INTO p_Ponderacion_total
    FROM tbl_ponderaciones_ciclos
    WHERE Cod_ciclo = p_Cod_ciclo AND Cod_ponderacion_ciclo != p_Cod_ponderacion_ciclo;

    IF p_Valor < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El valor no puede ser negativo.';
    END IF;

    IF (p_Ponderacion_total + p_Valor) > 200 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La suma de las ponderaciones no puede exceder el 100% para el ciclo.';
    END IF;
END IF;

-- Si pasó las validaciones, actualizamos el registro en tbl_ponderaciones_ciclos.
UPDATE tbl_ponderaciones_ciclos
SET
    Cod_ponderacion = p_Cod_ponderacion, 
    Cod_ciclo = p_Cod_ciclo,
    Valor = p_Valor
WHERE Cod_ponderacion_ciclo = p_Cod_ponderacion_ciclo;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_profesor` (IN `p_Cod_profesor` INT, IN `p_Cod_persona` INT, IN `p_Cod_grado_academico` INT, IN `p_Cod_tipo_contrato` INT, IN `p_Hora_entrada` TIME, IN `p_Hora_salida` TIME, IN `p_Fecha_ingreso` DATE, IN `p_Fecha_fin_contrato` DATE, IN `P_Años_experiencia` TINYINT)   BEGIN
    UPDATE tbl_profesores
    SET 
        Cod_persona = p_Cod_persona,
        Cod_grado_academico = p_Cod_grado_academico,
        Cod_tipo_contrato = p_Cod_tipo_contrato,
        Hora_entrada = p_Hora_entrada,
        Hora_salida = p_Hora_salida,
        Fecha_ingreso = p_Fecha_ingreso,
        Fecha_fin_contrato = p_Fecha_fin_contrato,
        Años_experiencia = p_Años_experiencia
    WHERE Cod_profesor = p_Cod_profesor;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_seccion` (IN `p_Cod_seccion` INT, IN `p_Nombre_seccion` VARCHAR(30))   BEGIN
    UPDATE TBL_SECCIONES SET Nombre_seccion = p_Nombre_seccion WHERE Cod_seccion = p_Cod_seccion;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_tipo_contrato` (IN `p_Cod_tipo_contrato` INT, IN `p_Descripcion` VARCHAR(30))   BEGIN
    UPDATE tbl_tipo_contrato SET Descripcion = p_Descripcion WHERE Cod_tipo_contrato = p_Cod_tipo_contrato;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `VerCaja` (IN `p_Cod_caja` INT)   BEGIN
    -- Ver todos los registros o un registro específico si se proporciona un Cod_caja
    IF p_Cod_caja IS NOT NULL THEN
        -- Mostrar solo el registro con el Cod_caja especificado
        SELECT cod_caja, 
               cod_persona, 
               fecha, 
               tipo_transaccion, 
               monto, 
               descripcion, 
               cod_concepto, 
               estado_pago
        FROM tbl_caja
        WHERE cod_caja = p_Cod_caja;
    ELSE
        -- Mostrar todos los registros de la tabla
        SELECT cod_caja, 
               cod_persona, 
               fecha, 
               tipo_transaccion, 
               monto, 
               descripcion, 
               cod_concepto, 
               estado_pago
        FROM tbl_caja;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `verPonderacionesCiclos` ()   BEGIN
    SELECT pc.Cod_ponderacion_ciclo, p.Descripcion_ponderacion, pc.Cod_ciclo, pc.Valor
    FROM tbl_ponderaciones_ciclos AS pc
    JOIN tbl_ponderaciones AS p ON pc.Cod_ponderacion = p.Cod_ponderacion;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `verPonderaciones_Ciclosporciclo` (IN `p_Cod_ciclo` INT(11))   SELECT * from tbl_ponderaciones_ciclos where Cod_ciclo = p_Cod_ciclo$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ver_actividades_por_profesor` (IN `p_Cod_profesor` INT)   BEGIN
    SELECT * 
    FROM tbl_actividades_academicas 
    WHERE Cod_profesor = p_Cod_profesor;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_actividades_academicas`
--

CREATE TABLE `tbl_actividades_academicas` (
  `Cod_actividad_academica` int(11) NOT NULL,
  `Cod_profesor` int(11) NOT NULL,
  `Cod_ponderacion_ciclo` int(11) NOT NULL,
  `Cod_parcial` int(11) NOT NULL,
  `Nombre_actividad_academica` varchar(255) NOT NULL,
  `Descripcion` varchar(255) DEFAULT NULL,
  `Fechayhora_Inicio` datetime NOT NULL,
  `Fechayhora_Fin` datetime NOT NULL,
  `Valor` decimal(5,2) NOT NULL,
  `Cod_secciones` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_actividades_academicas`
--

INSERT INTO `tbl_actividades_academicas` (`Cod_actividad_academica`, `Cod_profesor`, `Cod_ponderacion_ciclo`, `Cod_parcial`, `Nombre_actividad_academica`, `Descripcion`, `Fechayhora_Inicio`, `Fechayhora_Fin`, `Valor`, `Cod_secciones`) VALUES
(89, 1, 1, 1, 'asd', 'asd', '2024-11-16 00:00:00', '2024-11-30 00:00:00', 22.00, 2),
(90, 1, 1, 1, 'asd', 'asd', '2024-11-27 00:00:00', '2024-11-30 00:00:00', 3.00, 2),
(94, 1, 1, 2, 'asd', 'asd', '2024-11-07 00:00:00', '2024-11-30 00:00:00', 22.00, 2),
(96, 1, 1, 1, 'sdf', 'sdf', '2024-11-22 00:00:00', '2024-11-30 00:00:00', 22.00, 2),
(97, 1, 2, 1, 'asd', 'asd', '2024-11-27 00:00:00', '2024-11-30 00:00:00', 2.00, 2),
(98, 1, 2, 1, 'asd', 'asd', '2024-11-27 00:00:00', '2024-11-29 00:00:00', 18.00, 2),
(101, 1, 2, 1, 'VVV', 'VVV', '2024-11-20 00:00:00', '2024-11-29 00:00:00', 22.00, 2),
(102, 1, 1, 1, 'ASD', 'ASS', '2024-11-20 00:00:00', '2024-11-30 00:00:00', 18.00, 2),
(103, 2, 1, 2, 'JJJ', 'JJJJ', '2024-11-27 00:00:00', '2024-12-07 00:00:00', 44.00, 3),
(104, 2, 1, 4, 'EDSF', 'SDFSDF', '2024-11-13 00:00:00', '2024-11-30 00:00:00', 55.00, 3),
(106, 2, 1, 2, 'VV', 'VV', '2024-11-23 00:00:00', '2024-11-30 00:00:00', 40.00, 3),
(108, 2, 3, 3, 'FG', 'FGFG', '2024-11-08 00:00:00', '2024-12-07 00:00:00', 10.00, 3),
(109, 2, 4, 3, 'BBB', 'BB', '2024-11-15 00:00:00', '2024-11-30 00:00:00', 5.00, 3),
(111, 2, 2, 3, '23', 'AD', '2024-11-02 00:00:00', '2024-11-30 00:00:00', 20.00, 3),
(112, 2, 5, 3, 'ASD', 'ASD', '2024-11-23 00:00:00', '2024-12-07 00:00:00', 25.00, 3),
(113, 2, 2, 2, 'ASD', 'ASD', '2024-11-17 00:00:00', '2024-12-01 00:00:00', 20.00, 3),
(114, 2, 3, 2, 'ASD', 'ASD', '2024-11-15 00:00:00', '2024-11-30 00:00:00', 10.00, 3),
(126, 2, 4, 2, 'QASD', 'ASD', '2024-11-08 06:00:00', '2024-11-30 06:00:00', 5.00, 3),
(131, 2, 1, 1, 'ASD', 'ASD', '2024-11-17 00:00:00', '2024-12-02 00:00:00', 20.00, 3),
(133, 2, 4, 1, 'ASD', 'ASD', '2024-11-16 06:00:00', '2024-11-30 06:00:00', 5.00, 3),
(136, 2, 1, 3, 'ASD', 'ASD', '2024-11-23 00:00:00', '2024-11-30 00:00:00', 40.00, 3),
(139, 2, 5, 2, 'ASD', 'ASD', '2024-11-08 00:14:00', '2024-11-30 00:14:00', 25.00, 3),
(140, 2, 5, 1, 'ASD', 'ASD', '2024-11-16 13:54:00', '2024-12-07 13:54:00', 25.00, 3),
(142, 2, 1, 1, 'ASD', 'ASD', '2024-12-22 21:05:00', '2024-12-30 21:05:00', 20.00, 3),
(144, 1, 15, 1, 'ASD', 'ASD', '2024-12-04 23:33:00', '2024-12-21 23:33:00', 18.00, 2),
(146, 1, 1, 2, 'ASD', 'ASD', '2024-12-02 00:40:00', '2025-01-03 00:40:00', 22.00, 2),
(147, 1, 1, 2, 'AS', 'ASDASD', '2024-12-28 00:40:00', '2025-01-11 00:40:00', 18.00, 2),
(148, 1, 2, 2, 'ASD', 'ASD', '2024-12-04 00:43:00', '2024-12-17 00:43:00', 4.00, 2),
(149, 2, 3, 1, 'DD', 'DD', '2024-12-03 12:59:00', '2024-12-28 12:59:00', 10.00, 3),
(150, 2, 2, 1, 'DD', 'DDD', '2024-12-18 01:00:00', '2025-01-31 01:00:00', 20.00, 3),
(151, 1, 1, 1, 'FFF', 'FF', '2024-12-12 03:17:00', '2025-01-03 03:17:00', 22.00, 2),
(152, 2, 1, 1, 'ASD', 'ASD', '2024-12-05 10:22:00', '2024-12-14 10:22:00', 2.00, 3),
(155, 2, 5, 4, 'EXAMEN FINAL', 'EXAMEN FINAL', '2024-12-10 23:34:00', '2024-12-12 23:34:00', 13.00, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_actividades_asignatura`
--

CREATE TABLE `tbl_actividades_asignatura` (
  `Cod_actividad_asignatura` int(11) NOT NULL,
  `Cod_actividad_academica` int(11) NOT NULL,
  `Cod_seccion_asignatura` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tbl_actividades_asignatura`
--

INSERT INTO `tbl_actividades_asignatura` (`Cod_actividad_asignatura`, `Cod_actividad_academica`, `Cod_seccion_asignatura`) VALUES
(71, 89, 8),
(72, 90, 8),
(76, 94, 11),
(78, 96, 11),
(79, 97, 8),
(80, 98, 8),
(83, 101, 11),
(84, 102, 11),
(85, 103, 9),
(86, 104, 12),
(88, 106, 6),
(90, 108, 6),
(91, 109, 6),
(93, 111, 6),
(94, 112, 6),
(95, 113, 6),
(96, 114, 6),
(108, 126, 6),
(113, 131, 6),
(115, 133, 6),
(118, 136, 6),
(121, 139, 6),
(122, 140, 6),
(124, 142, 6),
(126, 144, 2),
(128, 146, 2),
(129, 147, 2),
(130, 148, 2),
(131, 149, 6),
(132, 150, 6),
(133, 151, 2),
(134, 152, 4),
(137, 155, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_actividades_extracurriculares`
--

CREATE TABLE `tbl_actividades_extracurriculares` (
  `Cod_actividades_extracurriculares` int(11) NOT NULL,
  `Nombre` varchar(50) NOT NULL,
  `Descripcion` varchar(200) NOT NULL,
  `Hora_inicio` time NOT NULL,
  `Hora_final` time NOT NULL,
  `Cod_seccion` int(11) NOT NULL,
  `Fecha` date DEFAULT NULL,
  `Estado` enum('Activa','Cancelada') NOT NULL DEFAULT 'Activa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_actividades_extracurriculares`
--

INSERT INTO `tbl_actividades_extracurriculares` (`Cod_actividades_extracurriculares`, `Nombre`, `Descripcion`, `Hora_inicio`, `Hora_final`, `Cod_seccion`, `Fecha`, `Estado`) VALUES
(1, 'Danza', 'Danza folclórica', '10:00:00', '12:00:00', 3, '2024-11-19', 'Cancelada'),
(3, 'Probando', 'probando', '08:00:00', '09:00:00', 3, '2024-11-19', 'Activa');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_asignaturas`
--

CREATE TABLE `tbl_asignaturas` (
  `Cod_asignatura` int(11) NOT NULL,
  `Nombre_asignatura` varchar(20) NOT NULL,
  `Descripcion_asignatura` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_asignaturas`
--

INSERT INTO `tbl_asignaturas` (`Cod_asignatura`, `Nombre_asignatura`, `Descripcion_asignatura`) VALUES
(1, 'ESPAÑOL', 'CLASE DE GRAMÁTICA, LITERATURA Y CULTURA ESPAÑOL'),
(2, 'MATEMÁTICAS', 'DESARROLLO DE HABILIDADES NUMÉRICAS Y LÓGICAS'),
(3, 'ESTUDIOS SOCIALES', 'HISTORIA Y CULTURA DE HONDURAS Y EL MUNDO'),
(4, 'INGLÉS', 'DOMINIO DEL INGLÉS EN LECTURA, ESCRITURA Y CONVERSACIÓN'),
(5, 'CIENCIAS NATURALES', 'EXPLORACIÓN DEL ENTORNO Y FENÓMENOS NATURALES'),
(6, 'para borrar', 'asignatura matematicas');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_asistencias`
--

CREATE TABLE `tbl_asistencias` (
  `Cod_asistencias` int(11) NOT NULL,
  `Fecha` datetime NOT NULL,
  `Observacion` varchar(60) DEFAULT NULL,
  `Cod_estado_asistencia` int(11) NOT NULL,
  `Cod_seccion_matricula` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_asistencias`
--

INSERT INTO `tbl_asistencias` (`Cod_asistencias`, `Fecha`, `Observacion`, `Cod_estado_asistencia`, `Cod_seccion_matricula`) VALUES
(2, '2024-11-15 23:53:46', NULL, 1, 1),
(3, '2024-11-15 23:54:01', NULL, 2, 2),
(4, '2024-11-16 00:17:15', NULL, 3, 2),
(5, '2024-11-16 01:05:20', NULL, 4, 1),
(6, '2024-11-16 17:08:24', NULL, 1, 3),
(7, '2024-11-17 21:24:26', NULL, 4, 3),
(8, '2024-11-21 18:21:09', NULL, 2, 1),
(9, '2024-11-23 23:24:05', NULL, 3, 1),
(10, '2024-11-23 23:24:05', NULL, 3, 5),
(11, '2024-11-24 02:17:47', NULL, 2, 1),
(12, '2024-11-24 02:17:47', NULL, 2, 5),
(13, '2024-12-01 18:09:21', NULL, 2, 1),
(14, '2024-12-01 18:09:21', NULL, 2, 16),
(15, '2024-12-01 18:09:21', NULL, 2, 15),
(16, '2024-12-01 18:09:21', NULL, 2, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_aula`
--

CREATE TABLE `tbl_aula` (
  `Cod_aula` int(11) NOT NULL,
  `Numero_aula` int(11) NOT NULL,
  `Capacidad` int(11) NOT NULL,
  `Cod_edificio` int(11) NOT NULL,
  `Division` int(11) NOT NULL,
  `Secciones_disponibles` int(11) NOT NULL,
  `Secciones_ocupadas` int(11) NOT NULL,
  `Cupos_aula` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_aula`
--

INSERT INTO `tbl_aula` (`Cod_aula`, `Numero_aula`, `Capacidad`, `Cod_edificio`, `Division`, `Secciones_disponibles`, `Secciones_ocupadas`, `Cupos_aula`) VALUES
(3, 21, 30, 1, 24, 2, 12, 13),
(4, 1, 25, 1, 0, 5, 0, 10),
(5, 1, 25, 1, 0, 5, 0, 10),
(6, 234, 24, 1, 243, 23, 3, 234),
(7, 12, 12, 1, 12, 12, 1, 12),
(8, 23, 23, 1, 23, 23, 23, 23),
(9, 1, 2, 1, 4, 5, 6, 3),
(10, 12, 12, 1, 12, 12, 12, 12),
(11, 13, 11, 1, 3, 13, 31, 131),
(12, 12, 13, 1, 15, 13, 17, 14),
(13, 1, 2, 1, 44, 3, 6, 3),
(14, 12, 12, 1, 12, 12, 11, 12),
(15, 23, 23, 1, 23, 23, 23, 23);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_bitacora`
--

CREATE TABLE `tbl_bitacora` (
  `Cod_bitacora` int(11) NOT NULL,
  `Cod_usuario` int(11) NOT NULL,
  `Cod_objeto` int(11) NOT NULL,
  `Fecha` datetime DEFAULT current_timestamp(),
  `Accion` enum('INSERT','UPDATE','DELETE','LOGIN','LOGOUT') NOT NULL,
  `Descripcion` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_bitacora`
--

INSERT INTO `tbl_bitacora` (`Cod_bitacora`, `Cod_usuario`, `Cod_objeto`, `Fecha`, `Accion`, `Descripcion`) VALUES
(1, 205, 79, '2024-12-10 19:55:13', 'UPDATE', 'El usuario: arielo_o67 ha actualizado la actividad academica: FFF, con valor 22'),
(2, 205, 79, '2024-12-10 19:55:28', 'UPDATE', 'El usuario: arielo_o67 ha actualizado la actividad academica: ASD, con valor 18'),
(3, 205, 76, '2024-12-11 08:54:02', 'LOGIN', 'Inicio de sesión exitoso del usuario: arielo_o67'),
(1642, 221, 76, '2024-12-12 19:27:53', 'LOGIN', 'Inicio de sesión exitoso del usuario: alexa.cruz.1221'),
(1643, 221, 76, '2024-12-12 19:34:17', 'LOGIN', 'Inicio de sesión exitoso del usuario: alexa.cruz.1221'),
(1644, 221, 76, '2024-12-13 14:47:35', 'LOGIN', 'Inicio de sesión exitoso del usuario: alexa.cruz.1221'),
(1645, 221, 76, '2024-12-13 14:47:46', 'LOGOUT', 'Cierre de sesión del usuario'),
(1646, 222, 76, '2024-12-13 14:47:52', 'LOGIN', 'Inicio de sesión exitoso del usuario: andinoariel5@gmail.com'),
(1647, 222, 76, '2024-12-13 14:48:23', 'LOGOUT', 'Cierre de sesión del usuario'),
(1648, 221, 76, '2024-12-13 20:07:13', 'LOGIN', 'Inicio de sesión exitoso del usuario: alexa.cruz.1221'),
(1649, 221, 76, '2024-12-13 20:18:06', 'LOGOUT', 'Cierre de sesión del usuario'),
(1650, 222, 76, '2024-12-13 20:18:14', 'LOGIN', 'Inicio de sesión exitoso del usuario: andinoariel5@gmail.com'),
(1651, 222, 76, '2024-12-13 20:18:39', 'LOGOUT', 'Cierre de sesión del usuario'),
(1652, 205, 76, '2024-12-13 20:18:42', 'LOGIN', 'Inicio de sesión exitoso del usuario: arielo_o67'),
(1653, 205, 76, '2024-12-13 20:18:52', 'LOGOUT', 'Cierre de sesión del usuario'),
(1654, 221, 76, '2024-12-17 02:22:58', 'LOGIN', 'Inicio de sesión exitoso del usuario: alexa.cruz.1221'),
(1655, 221, 76, '2024-12-17 02:49:14', 'LOGOUT', 'Cierre de sesión del usuario');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_caja`
--

CREATE TABLE `tbl_caja` (
  `Cod_caja` int(11) NOT NULL,
  `Fecha` date DEFAULT NULL,
  `Tipo_transaccion` enum('Ingreso','Egreso') DEFAULT NULL,
  `Monto` double DEFAULT NULL,
  `Descripcion` varchar(70) DEFAULT NULL,
  `Cod_persona` int(11) DEFAULT NULL,
  `Cod_concepto` int(11) DEFAULT NULL,
  `Estado_pago` enum('Pagado','Pendiente') DEFAULT NULL,
  `Hora_registro` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_caja`
--

INSERT INTO `tbl_caja` (`Cod_caja`, `Fecha`, `Tipo_transaccion`, `Monto`, `Descripcion`, `Cod_persona`, `Cod_concepto`, `Estado_pago`, `Hora_registro`) VALUES
(160, '2024-11-23', NULL, 2000, 'PAGO DE MATRICULA', 1, 1, 'Pagado', '2024-11-24 23:21:41'),
(162, '2024-11-24', NULL, NULL, NULL, 144, NULL, 'Pendiente', '2024-11-24 21:13:00'),
(173, '2024-11-25', NULL, 500, 'PAGO DEL IA', 195, 32, 'Pendiente', '2024-11-25 00:03:18'),
(174, '2024-11-25', NULL, 280, 'PEREZ', 195, 38, 'Pendiente', '2024-11-25 00:04:19'),
(175, '2024-11-25', NULL, 3000, 'PAGO DE MATRICULA', 141, 1, 'Pendiente', '2024-11-25 01:29:20'),
(176, '2024-11-25', NULL, NULL, NULL, 138, NULL, 'Pendiente', '2024-11-25 01:28:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_caja_descuento`
--

CREATE TABLE `tbl_caja_descuento` (
  `Cod_caja_descuento` int(11) NOT NULL,
  `Cod_caja` int(11) NOT NULL,
  `Cod_descuento` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_caja_descuento`
--

INSERT INTO `tbl_caja_descuento` (`Cod_caja_descuento`, `Cod_caja`, `Cod_descuento`) VALUES
(37, 172, 42),
(38, 174, 43);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_catalogo_cuentas`
--

CREATE TABLE `tbl_catalogo_cuentas` (
  `Cod_cuenta` int(11) NOT NULL,
  `Nombre_cuenta` varchar(100) NOT NULL,
  `Descripcion` varchar(200) DEFAULT NULL,
  `Tipo_Cuenta` enum('ACTIVO','PASIVO','PATRIMONIO','INGRESO','GASTO') NOT NULL,
  `Naturaleza_cuenta` enum('DEUDORA','ACREEDORA') NOT NULL,
  `Estado_Situacion_Financiera` enum('ESTADO DE RESULTADO','BALANCE GENERAL') NOT NULL,
  `Nivel` enum('1','2','3','4','5') NOT NULL DEFAULT '1',
  `Fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_catalogo_cuentas`
--

INSERT INTO `tbl_catalogo_cuentas` (`Cod_cuenta`, `Nombre_cuenta`, `Descripcion`, `Tipo_Cuenta`, `Naturaleza_cuenta`, `Estado_Situacion_Financiera`, `Nivel`, `Fecha_creacion`) VALUES
(7, 'Ingresos por ', 'Pago de Matrícula Recibido', 'ACTIVO', 'DEUDORA', 'BALANCE GENERAL', '3', '2024-11-13 03:32:36'),
(8, 'Ingresos por Matrícula', 'Pago de Matrícula Recibido', 'ACTIVO', 'ACREEDORA', 'ESTADO DE RESULTADO', '3', '2024-11-14 23:01:11'),
(9, 'Ingresos por asdasdsassssdsad', 'Pago de Matrícula Recibido', 'ACTIVO', 'ACREEDORA', 'ESTADO DE RESULTADO', '3', '2024-11-14 23:01:15'),
(14, 'CAJA', 'ASDASDADS', 'ACTIVO', 'ACREEDORA', 'BALANCE GENERAL', '2', '2024-11-16 13:27:25'),
(16, 'Productos Financieros', 'Ingreso de productos financieros (intereses)', 'ACTIVO', 'ACREEDORA', 'ESTADO DE RESULTADO', '1', '2024-11-20 13:04:59'),
(18, 'CAJA CHICA', 'REGISTRO DE CAJA CHICA', 'ACTIVO', 'ACREEDORA', 'BALANCE GENERAL', '2', '2024-11-20 21:26:57');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_ciclos`
--

CREATE TABLE `tbl_ciclos` (
  `Cod_ciclo` int(11) NOT NULL,
  `Nombre_ciclo` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_ciclos`
--

INSERT INTO `tbl_ciclos` (`Cod_ciclo`, `Nombre_ciclo`) VALUES
(1, 'PRIMER CICLO'),
(3, 'TERCER CICLO'),
(4, 'EDUCACIÓN MEDIA'),
(5, 'segundo ciclo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_concepto_pago`
--

CREATE TABLE `tbl_concepto_pago` (
  `Cod_concepto` int(11) NOT NULL,
  `Concepto` varchar(100) NOT NULL,
  `Descripcion` varchar(100) NOT NULL,
  `Fecha_creacion` datetime DEFAULT current_timestamp(),
  `Activo` enum('Si','No') DEFAULT 'Si'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_concepto_pago`
--

INSERT INTO `tbl_concepto_pago` (`Cod_concepto`, `Concepto`, `Descripcion`, `Fecha_creacion`, `Activo`) VALUES
(1, 'matricula', 'pago', '2024-10-05 17:19:15', 'Si'),
(32, 'asdasd', 'dasdasdwqeq', '2024-10-22 02:06:40', 'Si'),
(34, 'HOLA MUNDO', 'MUNDO HOLA', '2024-10-27 23:40:28', 'Si'),
(37, 'NUEVO PAGO', 'DEPARTAMENTE DE PAGOS', '2024-10-28 05:12:31', 'No'),
(38, 'PRESTAMO', 'PRESTAMO 10', '2024-10-28 14:37:23', 'Si'),
(39, 'PRESTAMOS', 'PRSTAMO 10', '2024-10-28 14:39:16', 'Si'),
(40, 'SADAS', 'ASDSADS', '2024-10-29 21:34:05', 'No'),
(41, 'ASDSASDS', 'ASDASDAS', '2024-10-29 21:34:13', 'Si'),
(42, 'DSADAS', 'SSSSSS', '2024-10-29 21:34:45', 'No'),
(43, 'mensualidad', 'pago', '2024-11-23 22:06:03', 'Si'),
(44, 'mensualidad', 'pago', '2024-11-23 22:06:08', 'Si');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_contacto`
--

CREATE TABLE `tbl_contacto` (
  `cod_contacto` int(11) NOT NULL,
  `cod_persona` int(11) NOT NULL,
  `cod_tipo_contacto` int(11) NOT NULL,
  `Valor` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_departamento`
--

CREATE TABLE `tbl_departamento` (
  `Cod_departamento` int(11) NOT NULL,
  `Nombre_departamento` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_departamento`
--

INSERT INTO `tbl_departamento` (`Cod_departamento`, `Nombre_departamento`) VALUES
(1, 'Atlántida'),
(2, 'Choluteca'),
(3, 'Colón'),
(4, 'Comayagua'),
(5, 'Copán'),
(6, 'Cortés'),
(7, 'El Paraíso'),
(8, 'Francisco Morazán'),
(9, 'Gracias a Dios'),
(10, 'Intibucá'),
(11, 'Islas de la Bahía'),
(12, 'La Paz'),
(13, 'Lempira'),
(14, 'Ocotepeque'),
(15, 'Olancho'),
(16, 'Santa Bárbara'),
(17, 'Valle'),
(18, 'YORO'),
(159, 'INPUT');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_descuentos`
--

CREATE TABLE `tbl_descuentos` (
  `Cod_descuento` int(11) NOT NULL,
  `Nombre_descuento` varchar(50) DEFAULT NULL,
  `Valor` varchar(45) NOT NULL,
  `Fecha_inicio` date NOT NULL,
  `Fecha_fin` date NOT NULL,
  `Descripcion` varchar(60) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_descuentos`
--

INSERT INTO `tbl_descuentos` (`Cod_descuento`, `Nombre_descuento`, `Valor`, `Fecha_inicio`, `Fecha_fin`, `Descripcion`) VALUES
(39, 'add', '2000.00', '2024-10-13', '2024-10-15', 'dada'),
(42, NULL, '100', '2024-11-24', '2024-12-24', ''),
(43, NULL, '20', '2024-11-24', '2024-12-24', 'ASASAS');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_dias`
--

CREATE TABLE `tbl_dias` (
  `Cod_dias` int(11) NOT NULL,
  `dias` varchar(50) NOT NULL,
  `prefijo_dia` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tbl_dias`
--

INSERT INTO `tbl_dias` (`Cod_dias`, `dias`, `prefijo_dia`) VALUES
(2, 'Martes', 'Mar'),
(3, 'Jueves', 'Jue'),
(4, 'Viernes', 'Vie'),
(5, 'Sábado', 'Sab'),
(6, 'Lunes', 'Lu'),
(7, 'Miércoles', 'Mie'),
(8, 'Domingo', 'Dom');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_edificio`
--

CREATE TABLE `tbl_edificio` (
  `Cod_edificio` int(11) NOT NULL,
  `Nombre_edificios` varchar(60) NOT NULL,
  `Numero_pisos` int(11) NOT NULL,
  `Aulas_disponibles` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_edificio`
--

INSERT INTO `tbl_edificio` (`Cod_edificio`, `Nombre_edificios`, `Numero_pisos`, `Aulas_disponibles`) VALUES
(1, 'PRUEBA EDIFICIO', 2, 8),
(2, 'Saint Patricks Academy', 2, 15),
(5, 'Prueba Edificios', 99, 99);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_especialidades`
--

CREATE TABLE `tbl_especialidades` (
  `Cod_Especialidad` int(11) NOT NULL,
  `Nombre_especialidad` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_especialidades`
--

INSERT INTO `tbl_especialidades` (`Cod_Especialidad`, `Nombre_especialidad`) VALUES
(1, 'MATEMÁTICAS'),
(2, 'CIENCIAS NATURALES'),
(3, 'LENGUA Y LITERATURA'),
(4, 'HISTORIA Y CIENCIAS SOCIALES'),
(6, 'TECNOLOGÍA Y COMPUTACIÓN'),
(7, 'EDUCACION FISICA'),
(8, 'ARTES');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_estado_asistencia`
--

CREATE TABLE `tbl_estado_asistencia` (
  `Cod_estado_asistencia` int(11) NOT NULL,
  `Descripcion_asistencia` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_estado_asistencia`
--

INSERT INTO `tbl_estado_asistencia` (`Cod_estado_asistencia`, `Descripcion_asistencia`) VALUES
(1, 'PRESENTE'),
(2, 'AUSENTE'),
(3, 'JUSTIFICADO'),
(4, 'TARDANZA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_estado_matricula`
--

CREATE TABLE `tbl_estado_matricula` (
  `Cod_estado_matricula` int(11) NOT NULL,
  `Tipo` enum('Activa','Cancelada','Pendiente','Inactiva') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_estado_matricula`
--

INSERT INTO `tbl_estado_matricula` (`Cod_estado_matricula`, `Tipo`) VALUES
(120, 'Activa'),
(122, 'Cancelada'),
(125, 'Pendiente'),
(152, 'Inactiva');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_estado_nota`
--

CREATE TABLE `tbl_estado_nota` (
  `Cod_estado` int(11) NOT NULL,
  `Descripcion` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_estado_nota`
--

INSERT INTO `tbl_estado_nota` (`Cod_estado`, `Descripcion`) VALUES
(1, 'APROBADO'),
(2, 'REPROBADO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_estado_usuario`
--

CREATE TABLE `tbl_estado_usuario` (
  `Cod_estado_usuario` int(11) NOT NULL,
  `estado` enum('Activo','Inactivo','Suspendido') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_estado_usuario`
--

INSERT INTO `tbl_estado_usuario` (`Cod_estado_usuario`, `estado`) VALUES
(1, 'Activo'),
(2, 'Inactivo'),
(3, 'Suspendido');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_estructura_familiar`
--

CREATE TABLE `tbl_estructura_familiar` (
  `Cod_genealogia` int(11) NOT NULL,
  `cod_persona_padre` int(11) NOT NULL,
  `cod_persona_estudiante` int(11) NOT NULL,
  `cod_tipo_relacion` int(11) NOT NULL,
  `Descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_estructura_familiar`
--

INSERT INTO `tbl_estructura_familiar` (`Cod_genealogia`, `cod_persona_padre`, `cod_persona_estudiante`, `cod_tipo_relacion`, `Descripcion`) VALUES
(1, 1, 134, 2, 'Probando MODAL'),
(3, 1, 130, 2, 'NUEVO DISEÑO'),
(5, 1, 137, 2, 'padre'),
(6, 1, 2, 1, 'aaa'),
(7, 128, 139, 2, 'aa'),
(8, 188, 129, 2, 'aaa'),
(9, 130, 131, 2, 'aaaa'),
(10, 132, 133, 2, 'aaa'),
(11, 134, 135, 3, '1111'),
(12, 136, 209, 2, 'qqqq'),
(13, 138, 146, 2, 'aaaaa'),
(14, 192, 176, 2, 'aaa'),
(15, 144, 145, 2, 'aaaa'),
(16, 195, 142, 2, 'qqq'),
(17, 1, 191, 3, 'aaa');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_genero_persona`
--

CREATE TABLE `tbl_genero_persona` (
  `Cod_genero` int(11) NOT NULL,
  `Tipo_genero` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_genero_persona`
--

INSERT INTO `tbl_genero_persona` (`Cod_genero`, `Tipo_genero`) VALUES
(1, 'MASCULINO'),
(2, 'FEMENINO'),
(3, 'NO BINARIO'),
(4, 'OTRO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_grados`
--

CREATE TABLE `tbl_grados` (
  `Cod_grado` int(11) NOT NULL,
  `Cod_ciclo` int(11) NOT NULL,
  `Nombre_grado` varchar(20) NOT NULL,
  `Prefijo` varchar(50) NOT NULL DEFAULT 'SIN_PREFIJO'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_grados`
--

INSERT INTO `tbl_grados` (`Cod_grado`, `Cod_ciclo`, `Nombre_grado`, `Prefijo`) VALUES
(1, 1, 'PRIMER GRADO', 'PRI'),
(2, 1, 'SEGUNDO GRADO', 'SEG'),
(3, 1, 'TERCER GRADO', 'TER'),
(4, 2, 'CUARTO GRADO', 'CUA'),
(5, 2, 'QUINTO GRADO', 'QUI'),
(6, 2, 'SEXT GRADO', 'SEX'),
(7, 3, 'SÉPTIMO GRADO', 'SEP'),
(8, 3, 'OCTAVO GRADO', 'OCT'),
(9, 3, 'NOVENO GRADO', 'NOV'),
(10, 4, 'DÉCIMO', 'DEC'),
(11, 4, 'UNDÉCIMO', 'UND'),
(12, 4, 'DUODÉCIMO', 'DUO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_grados_asignaturas`
--

CREATE TABLE `tbl_grados_asignaturas` (
  `Cod_grados_asignaturas` int(11) NOT NULL,
  `Cod_grado` int(11) NOT NULL,
  `Cod_asignatura` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_grados_asignaturas`
--

INSERT INTO `tbl_grados_asignaturas` (`Cod_grados_asignaturas`, `Cod_grado`, `Cod_asignatura`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 1, 4),
(5, 2, 1),
(6, 2, 2),
(7, 2, 5),
(11, 12, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_grado_academico`
--

CREATE TABLE `tbl_grado_academico` (
  `Cod_grado_academico` int(11) NOT NULL,
  `Descripcion` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_grado_academico`
--

INSERT INTO `tbl_grado_academico` (`Cod_grado_academico`, `Descripcion`) VALUES
(1, 'LICENCIATURA'),
(2, 'MAESTRÍA'),
(3, 'DOCTORADO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_historiales_academicos`
--

CREATE TABLE `tbl_historiales_academicos` (
  `Cod_historial_academico` int(11) NOT NULL,
  `Cod_estado` int(11) NOT NULL,
  `Cod_persona` int(11) NOT NULL,
  `Grado` varchar(45) NOT NULL,
  `Año_Academico` int(11) NOT NULL,
  `Promedio_Anual` decimal(5,2) NOT NULL,
  `Fecha_Registro` datetime NOT NULL,
  `Cod_Instituto` int(11) NOT NULL,
  `Observacion` varchar(60) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_historiales_academicos`
--

INSERT INTO `tbl_historiales_academicos` (`Cod_historial_academico`, `Cod_estado`, `Cod_persona`, `Grado`, `Año_Academico`, `Promedio_Anual`, `Fecha_Registro`, `Cod_Instituto`, `Observacion`) VALUES
(1, 1, 136, 'PRIMER GRADO', 2024, 12.00, '2024-12-01 17:37:50', 1, 'Nuevo registro generado automáticamente'),
(2, 1, 148, 'PRIMER GRADO', 2024, 0.00, '2024-12-01 17:38:05', 1, 'Nuevo registro generado automáticamente'),
(3, 1, 145, 'PRIMER GRADO', 2024, 0.00, '2024-12-01 17:38:05', 1, 'Nuevo registro generado automáticamente'),
(4, 1, 142, 'PRIMER GRADO', 2024, 0.00, '2024-12-01 17:38:05', 1, 'Nuevo registro generado automáticamente'),
(5, 1, 134, 'SEGUNDO GRADO', 2024, 0.00, '2024-12-10 17:51:28', 1, 'Nuevo registro generado automáticamente'),
(6, 1, 147, 'SEGUNDO GRADO', 2024, 0.00, '2024-12-10 17:51:28', 1, 'Nuevo registro generado automáticamente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_historiales_asignaturas`
--

CREATE TABLE `tbl_historiales_asignaturas` (
  `Cod_historial_asignatura` int(11) NOT NULL,
  `Promedio_asignatura` decimal(5,2) NOT NULL,
  `Cod_asignatura` int(11) NOT NULL,
  `Cod_historial_academico` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_historiales_asignaturas`
--

INSERT INTO `tbl_historiales_asignaturas` (`Cod_historial_asignatura`, `Promedio_asignatura`, `Cod_asignatura`, `Cod_historial_academico`) VALUES
(1, 22.00, 3, 1),
(2, 2.00, 2, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_historial_pago`
--

CREATE TABLE `tbl_historial_pago` (
  `Cod_historial_pago` int(11) NOT NULL,
  `Monto` decimal(10,2) NOT NULL,
  `Fecha_pago` datetime NOT NULL,
  `Metodo_pago` enum('Efectivo','Transferencia','Tarjeta') NOT NULL,
  `Descripcion` varchar(200) DEFAULT NULL,
  `Cod_matricula` int(11) DEFAULT NULL,
  `Cod_caja` int(11) DEFAULT NULL,
  `Cod_concepto` int(11) NOT NULL,
  `Cod_usuario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_historial_secciones`
--

CREATE TABLE `tbl_historial_secciones` (
  `Cod_agrupadora` int(11) NOT NULL,
  `Cod_periodo_matricula` int(11) NOT NULL,
  `Total_secciones` int(11) NOT NULL,
  `Fecha_agrupacion` date NOT NULL DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_historico_procedencia`
--

CREATE TABLE `tbl_historico_procedencia` (
  `cod_procedencia` int(11) NOT NULL,
  `Nombre_procedencia` varchar(80) NOT NULL,
  `Lugar_procedencia` varchar(80) NOT NULL,
  `Instituto` varchar(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_hist_contraseña`
--

CREATE TABLE `tbl_hist_contraseña` (
  `Cod_hist_contrasena` int(11) NOT NULL,
  `Cod_usuario` int(11) NOT NULL,
  `Contraseña` varchar(255) NOT NULL,
  `Fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_hist_contraseña`
--

INSERT INTO `tbl_hist_contraseña` (`Cod_hist_contrasena`, `Cod_usuario`, `Contraseña`, `Fecha_creacion`) VALUES
(52, 181, '$2b$10$LgzKC.U0U2V4E6IOuMsOSeYrf1Rz98E9ZTCYL5Wv221RlvXzBceWS', '2024-10-28 02:32:24'),
(53, 181, '$2b$10$GqcU5AwqFt8nMC21NgllDekaKDiojXByQUYM5bLcTOCtveQ4Wxb1G', '2024-10-28 02:43:22'),
(54, 197, '$2b$10$K7Mj35vF9GfyqtM/eEZAL.HShbCB1kz2JMvm.lHxVAtVbYP95wJau', '2024-11-04 01:00:50'),
(55, 196, '$2b$10$akIw7SgMdpdHTyfi3w8MReFHTGJvq..6kROehUA4V0hJdzzzITLKK', '2024-11-04 23:36:28'),
(56, 203, '$2b$10$.2v2tvOAKBpu2WaVtmE7QeXR0FtqF5rV88wuVe3BZyMuvRB57WVHi', '2024-11-07 02:23:09'),
(57, 205, '$2b$10$mPil0PtwtuotBVNCpxXofeul58X6Te9IO2hW/vHWPeLwqdsn6fQjm', '2024-11-11 05:26:31'),
(58, 205, '$2b$10$aC1f5pZ2HBSSGLELH1mZzeadxN/M2LIlKwh/.9QqwhBmpH.E4bDuK', '2024-11-11 05:27:44'),
(59, 209, '$2b$10$D3EDMBtI3xVjhpXb6n7DX.SSvHTYrOJqSf9Trcs63JX0.BsszAtY6', '2024-11-17 22:20:02'),
(60, 210, '$2b$10$var/i9F8o457tAlisntVnu3BopVqVxYBdxZW.2A9xMuu/fAFsaeYO', '2024-11-18 01:22:44'),
(61, 210, '$2b$10$ce2ksEfUQsDnmOBcC0OkWe0dvoCJwTxRYskY5z93LftFlC7g44Yme', '2024-11-18 02:11:06'),
(62, 212, '$2b$10$iXk6cXqBDVJ5nAxsV/DJSepLRTy..l36MhW2dSXdHSgZ3UmOERUYy', '2024-11-19 21:25:23'),
(63, 213, '$2b$10$v5uQpd2dXt4Jm6YahZ5KXuKTfPVZ.R2Y28ap062kRxTbPaQIUWQz.', '2024-11-19 21:32:48'),
(64, 213, '$2b$10$dSIUg5XOZeF7HvcCp54TOOTfl1BZs36M3fiVmBXJWovc6XKSTvG4u', '2024-11-19 21:35:02'),
(65, 216, '$2b$10$eUZ5Njj1IOSzLV2jMDeqK.1/8BoRwszaYq5gixE5k0uDZD16KLNT2', '2024-11-20 14:55:49'),
(66, 217, '$2b$10$XFeBNuFdeKStMJV5IQXRHOqPjt4D9pqPp.gw2Y9J2PoFRIwg/5TYm', '2024-11-20 14:57:38'),
(67, 218, '$2b$10$cT3li9kO1/TacTG0MCC7BeV4xW9CtfSYHmHYahM/aX4d5q7gc6MxW', '2024-11-21 02:17:00'),
(68, 218, '$2b$10$SSp00zFMrnCiTPwG3biNoeTsjazctf4C0FVYvN2jfGE/nAFOvPHPG', '2024-11-21 02:18:27'),
(69, 222, '$2b$10$s6Yl.CmyQgUankHo8aEeD.mG.ZhwET2rgWS8z0spvqyCzlk4GDJfe', '2024-11-22 04:34:05'),
(70, 223, '$2b$10$z0VJlXHxDAIkXBd3iSlDRur1NTQr3fvGdVaPtnmDStOHcH9BgDtWe', '2024-11-22 04:37:47'),
(71, 223, '$2b$10$Ub4zpilnSynjFVQFYyFDle8swML496RcJasKXDPXhj2HbmcYj48qS', '2024-11-22 04:40:17'),
(72, 225, '$2b$10$W9I3mDhVSQcryudkca1K/uZbCg9L00/XOLlmGVhtO7jIOz6aC/Ffu', '2024-11-24 00:32:33'),
(73, 226, '$2b$10$l5ej0fuOGRS4Mv.Zo4E2A.VKgCcrPm.wb6Jr2/juOsC59bVE5yMY2', '2024-11-24 20:20:33'),
(74, 222, '$2b$10$PStpcl/ijRnwAAW4zbbR4.7KZaT/xI9h/MPTSyMoqF9l8nKzOeR3C', '2024-11-27 00:11:29'),
(75, 222, '$2b$10$klWdIrHzH.X9ELhmAUnWxuXv1s/3IJnzdZx4nGbLwHpI3xcLLxTNi', '2024-11-27 00:12:00'),
(76, 222, '$2b$10$ulfCpWVZ8MY16TV6Pn8sp.VCjCKzwKw83l30L0a4VDh0EYF/7uLAy', '2024-11-27 00:15:46'),
(77, 229, '$2b$10$akoWGdmSn0LaScDueMt4XezvfmuATXKRqLXz5DVXEvfPsN3v7n1Sa', '2024-12-07 01:17:13'),
(78, 230, '$2b$10$hZdOP0HvKvZ7BFvslSItceUGQuLgqVnQalXhyFEfw4mPqGCwhTUBq', '2024-12-07 01:22:44'),
(79, 231, '$2b$10$VAm7RQPW9XjwfrZLxGSAVuQAxgHd/AzMee0Q/IYYSP1SpBrFxpGGK', '2024-12-07 01:25:54'),
(80, 232, '$2b$10$Nr1U6b/Vi3zOoWQyLnwn6OgA5WwDGuyui.qOH0xu/4zdYe7.N3aU6', '2024-12-07 01:28:06'),
(81, 233, '$2b$10$dOI.YEJLknuFzSya/2PHPOtNAeUHUC762zS/nXM1ShharQGk0mHhS', '2024-12-07 01:33:27'),
(82, 234, '$2b$10$8iVq.EQke2NUrDRxoawX/uT2gw16yDVOkC8WOIsOKLxgynoBSGBSa', '2024-12-07 01:38:06'),
(83, 235, '$2b$10$Zg0DJwZkDV/KGOQrb/e4ku66f8U/ElWqgeu9g0fgsQQ6cRbLeRR4G', '2024-12-07 02:06:38'),
(84, 222, '$2b$10$pyF/rnqj0Sl9RWsLk/lc6ug9irXVQHz5cSTcmlvro6yQzrhSIGLK.', '2024-12-08 04:15:23'),
(85, 222, '$2b$10$yo414ylJdiNvjhR4A00xLOqnFI2LqIbW/mnWao5O6A8G4YxArzSQm', '2024-12-08 04:16:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_institutos`
--

CREATE TABLE `tbl_institutos` (
  `Cod_Instituto` int(11) NOT NULL,
  `Nom_Instituto` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_institutos`
--

INSERT INTO `tbl_institutos` (`Cod_Instituto`, `Nom_Instituto`) VALUES
(1, 'SAINT PATRICK ACADEMY');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_libro_diario`
--

CREATE TABLE `tbl_libro_diario` (
  `Cod_libro_diario` int(11) NOT NULL,
  `Fecha` datetime NOT NULL,
  `Descripcion` varchar(200) NOT NULL,
  `Cod_cuenta` int(11) NOT NULL,
  `tipo` enum('DEUDOR','ACREEDOR') NOT NULL,
  `Monto` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_libro_diario`
--

INSERT INTO `tbl_libro_diario` (`Cod_libro_diario`, `Fecha`, `Descripcion`, `Cod_cuenta`, `tipo`, `Monto`) VALUES
(38, '2024-11-16 00:00:00', 'adasdasd', 7, 'DEUDOR', 100.00),
(39, '2024-11-16 00:00:00', 'sdfsdfsdfs', 8, 'ACREEDOR', 100.00),
(40, '2024-11-16 00:00:00', 'DFGDFG', 7, 'DEUDOR', 100.00),
(41, '2024-11-16 00:00:00', 'DFGDFGFD', 14, 'ACREEDOR', 100.00),
(43, '2024-11-19 00:00:00', 'yyyyy', 8, 'ACREEDOR', 1000.00),
(44, '2024-11-20 00:00:00', 'sdfsdf', 7, 'DEUDOR', 1500.00),
(45, '2024-11-20 00:00:00', 'w53423', 8, 'ACREEDOR', 1000.00),
(49, '2024-11-20 00:00:00', 'Registro de pago de matrícula #457', 8, 'ACREEDOR', 1000.00),
(50, '2024-11-21 00:00:00', 'DEUDA', 7, 'DEUDOR', 100.00),
(51, '2024-11-21 00:00:00', 'PISTOO', 18, 'ACREEDOR', 100.00),
(52, '2024-11-24 00:00:00', 'ererewr', 7, 'DEUDOR', 50000.00),
(53, '2024-11-24 00:00:00', 'sdfgdfhyfgj', 14, 'ACREEDOR', 10000.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_matricula`
--

CREATE TABLE `tbl_matricula` (
  `Cod_matricula` int(11) NOT NULL,
  `codificacion_matricula` varchar(20) DEFAULT NULL,
  `Fecha_matricula` date NOT NULL,
  `Cod_persona` int(11) NOT NULL,
  `Cod_caja` int(11) NOT NULL,
  `Cod_periodo_matricula` int(11) NOT NULL,
  `Cod_tipo_matricula` int(11) NOT NULL,
  `Cod_estado_matricula` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_matricula`
--

INSERT INTO `tbl_matricula` (`Cod_matricula`, `codificacion_matricula`, `Fecha_matricula`, `Cod_persona`, `Cod_caja`, `Cod_periodo_matricula`, `Cod_tipo_matricula`, `Cod_estado_matricula`) VALUES
(87, NULL, '2024-11-16', 130, 129, 118, 118, 120),
(88, NULL, '2024-11-19', 131, 130, 177, 102, 120),
(89, NULL, '2024-11-19', 132, 131, 177, 118, 120),
(90, NULL, '2024-11-19', 133, 132, 177, 102, 120),
(91, NULL, '2024-11-19', 134, 133, 177, 101, 120),
(92, NULL, '2024-11-19', 135, 134, 177, 144, 120),
(93, NULL, '2024-11-22', 137, 135, 118, 118, 120),
(95, NULL, '2024-11-22', 134, 137, 177, 118, 120),
(96, NULL, '2024-11-22', 130, 141, 177, 118, 120),
(97, NULL, '2024-11-22', 131, 142, 177, 118, 120),
(98, NULL, '2024-11-22', 209, 149, 118, 118, 120),
(103, 'SPA-2024-0001', '2024-11-23', 2, 160, 177, 118, 120),
(104, 'SPA-2024-0002', '2024-11-24', 145, 162, 177, 118, 120),
(105, 'SPA-2024-0003', '2024-11-24', 142, 163, 177, 118, 120),
(106, 'SPA-2024-0004', '2024-11-24', 191, 175, 177, 118, 120),
(107, 'SPA-2024-0005', '2024-11-25', 146, 176, 177, 118, 120);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_municipio`
--

CREATE TABLE `tbl_municipio` (
  `Cod_municipio` int(11) NOT NULL,
  `Nombre_municipio` varchar(255) DEFAULT NULL,
  `Cod_departamento` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_municipio`
--

INSERT INTO `tbl_municipio` (`Cod_municipio`, `Nombre_municipio`, `Cod_departamento`) VALUES
(1, 'La Ceiba', 1),
(2, 'Tela', 1),
(3, 'Jutiapa', 1),
(4, 'Arizona', 1),
(5, 'El Porvenir', 1),
(6, 'Esparta', 1),
(7, 'La Masica', 1),
(8, 'San Francisco', 1),
(9, 'Choluteca', 2),
(10, 'Apacilagua', 2),
(11, 'Concepción de María', 2),
(12, 'Duyure', 2),
(13, 'El Corpus', 2),
(14, 'El Triunfo', 2),
(15, 'Marcovia', 2),
(16, 'Morolica', 2),
(17, 'Namasigüe', 2),
(18, 'Orocuina', 2),
(19, 'Pespire', 2),
(20, 'San Antonio de Flores', 2),
(21, 'San Isidro', 2),
(22, 'San José', 2),
(23, 'San Marcos de Colón', 2),
(24, 'Santa Ana de Yusguare', 2),
(25, 'Trujillo', 3),
(26, 'Balfate', 3),
(27, 'Iriona', 3),
(28, 'Limón', 3),
(29, 'Sabá', 3),
(30, 'Santa Fe', 3),
(31, 'Santa Rosa de Aguán', 3),
(32, 'Sonaguera', 3),
(33, 'Tocoa', 3),
(34, 'Bonito Oriental', 3),
(35, 'Comayagua', 4),
(36, 'Ajuterique', 4),
(37, 'El Rosario', 4),
(38, 'Esquías', 4),
(39, 'Humuya', 4),
(40, 'La Libertad', 4),
(41, 'La Trinidad', 4),
(42, 'Lejamaní', 4),
(43, 'Meámbar', 4),
(44, 'Minas de Oro', 4),
(45, 'Ojos de Agua', 4),
(46, 'San Jerónimo', 4),
(47, 'San José de Comayagua', 4),
(48, 'San José del Potrero', 4),
(49, 'San Luis', 4),
(50, 'San Sebastián', 4),
(51, 'Siguatepeque', 4),
(52, 'Villa de San Antonio', 4),
(53, 'Las Lajas', 4),
(54, 'Taulabé', 4),
(55, 'Santa Rosa de Copán', 5),
(56, 'Cabañas', 5),
(57, 'Concepción', 5),
(58, 'Copán Ruinas', 5),
(59, 'Corquín', 5),
(60, 'Cucuyagua', 5),
(61, 'Dolores', 5),
(62, 'Dulce Nombre', 5),
(63, 'El Paraíso', 5),
(64, 'Florida', 5),
(65, 'La Jigua', 5),
(66, 'La Unión', 5),
(67, 'Nueva Arcadia', 5),
(68, 'San Agustín', 5),
(69, 'San Antonio', 5),
(70, 'San Jerónimo', 5),
(71, 'San José', 5),
(72, 'San Juan de Opoa', 5),
(73, 'San Nicolás', 5),
(74, 'San Pedro de Copán', 5),
(75, 'Santa Rita', 5),
(76, 'Trinidad de Copán', 5),
(77, 'Veracruz', 5),
(78, 'San Pedro Sula', 6),
(79, 'Choloma', 6),
(80, 'Omoa', 6),
(81, 'Pimienta', 6),
(82, 'Potrerillos', 6),
(83, 'Puerto Cortés', 6),
(84, 'San Antonio de Cortés', 6),
(85, 'San Francisco de Yojoa', 6),
(86, 'San Manuel', 6),
(87, 'Santa Cruz de Yojoa', 6),
(88, 'Villanueva', 6),
(89, 'La Lima', 6),
(90, 'Yuscarán', 7),
(91, 'Alauca', 7),
(92, 'Danlí', 7),
(93, 'El Paraíso', 7),
(94, 'Güinope', 7),
(95, 'Jacaleapa', 7),
(96, 'Liure', 7),
(97, 'Morocelí', 7),
(98, 'Oropolí', 7),
(99, 'Potrerillos', 7),
(100, 'San Antonio de Flores', 7),
(101, 'San Lucas', 7),
(102, 'San Matías', 7),
(103, 'Soledad', 7),
(104, 'Teupasenti', 7),
(105, 'Texiguat', 7),
(106, 'Vado Ancho', 7),
(107, 'Yauyupe', 7),
(108, 'Trojes', 7),
(109, 'Tegucigalpa', 8),
(110, 'Alubarén', 8),
(111, 'Cedros', 8),
(112, 'Curarén', 8),
(113, 'El Porvenir', 8),
(114, 'Guaimaca', 8),
(115, 'La Libertad', 8),
(116, 'La Venta', 8),
(117, 'Lepaterique', 8),
(118, 'Maraita', 8),
(119, 'Marale', 8),
(120, 'Nueva Armenia', 8),
(121, 'Ojojona', 8),
(122, 'Orica', 8),
(124, 'Sabanagrande', 8),
(125, 'San Antonio de Oriente', 8),
(126, 'San Buenaventura', 8),
(127, 'San Ignacio', 8),
(128, 'San Juan de Flores', 8),
(129, 'San Miguelito', 8),
(130, 'Santa Ana', 8),
(131, 'Santa Lucía', 8),
(132, 'Talanga', 8),
(133, 'Tatumbla', 8),
(134, 'Valle de Ángeles', 8),
(135, 'Villa de San Francisco', 8),
(136, 'Vallecillo', 8),
(137, 'Puerto Lempira', 9),
(138, 'Brus Laguna', 9),
(139, 'Ahuas', 9),
(140, 'Juan Francisco Bulnes', 9),
(141, 'Ramón Villeda Morales', 9),
(142, 'Wampusirpi', 9),
(143, 'La Esperanza', 10),
(144, 'Camasca', 10),
(145, 'Colomoncagua', 10),
(146, 'Concepción', 10),
(147, 'Dolores', 10),
(148, 'Intibucá', 10),
(149, 'Jesús de Otoro', 10),
(150, 'Magdalena', 10),
(151, 'Masaguara', 10),
(152, 'San Antonio', 10),
(153, 'San Isidro', 10),
(154, 'San Juan', 10),
(155, 'San Marcos de la Sierra', 10),
(156, 'San Miguel Guancapla', 10),
(157, 'Santa Lucía', 10),
(158, 'Yamaranguila', 10),
(159, 'Roatán', 11),
(160, 'José Santos Guardiola', 11),
(161, 'Guanaja', 11),
(162, 'Utila', 11),
(163, 'La Paz', 12),
(164, 'Aguanqueterique', 12),
(165, 'Cabañas', 12),
(166, 'Cane', 12),
(167, 'Chinacla', 12),
(168, 'Guajiquiro', 12),
(169, 'Lauterique', 12),
(170, 'Marcala', 12),
(171, 'Mercedes de Oriente', 12),
(172, 'Opatoro', 12),
(173, 'San Antonio del Norte', 12),
(174, 'San José', 12),
(175, 'San Juan', 12),
(176, 'San Pedro de Tutule', 12),
(177, 'Santa Ana', 12),
(178, 'Santa Elena', 12),
(179, 'Santa María', 12),
(180, 'Santiago de Puringla', 12),
(181, 'Yarula', 12),
(182, 'Gracias', 13),
(183, 'Belén', 13),
(184, 'Candelaria', 13),
(185, 'Cololaca', 13),
(186, 'Erandique', 13),
(187, 'Gualcince', 13),
(188, 'Guarita', 13),
(189, 'La Campa', 13),
(190, 'La Iguala', 13),
(191, 'Las Flores', 13),
(192, 'La Unión', 13),
(193, 'La Virtud', 13),
(194, 'Lepaera', 13),
(195, 'Mapulaca', 13),
(196, 'Piraera', 13),
(197, 'San Andrés', 13),
(198, 'San Francisco', 13),
(199, 'San Juan Guarita', 13),
(200, 'San Manuel Colohete', 13),
(201, 'San Rafael', 13),
(202, 'San Sebastián', 13),
(203, 'Santa Cruz', 13),
(204, 'Talgua', 13),
(205, 'Tambla', 13),
(206, 'Tomalá', 13),
(207, 'Valladolid', 13),
(208, 'Virginia', 13),
(209, 'San Marcos de Caiquín', 13),
(210, 'Ocotepeque', 14),
(211, 'Belén Gualcho', 14),
(212, 'Concepción', 14),
(213, 'Dolores Merendón', 14),
(214, 'Fraternidad', 14),
(215, 'La Encarnación', 14),
(216, 'La Labor', 14),
(217, 'Lucerna', 14),
(218, 'Mercedes', 14),
(219, 'San Fernando', 14),
(220, 'San Francisco del Valle', 14),
(221, 'San Jorge', 14),
(222, 'San Marcos', 14),
(223, 'Santa Fe', 14),
(224, 'Sensenti', 14),
(225, 'Sinuapa', 14),
(226, 'Juticalpa', 15),
(227, 'Campamento', 15),
(228, 'Catacamas', 15),
(229, 'Concordia', 15),
(230, 'Dulce Nombre de Culmí', 15),
(231, 'El Rosario', 15),
(232, 'Esquipulas del Norte', 15),
(233, 'Gualaco', 15),
(234, 'Guarizama', 15),
(235, 'Guata', 15),
(236, 'Guayape', 15),
(237, 'Jano', 15),
(238, 'La Unión', 15),
(239, 'Mangulile', 15),
(240, 'Manto', 15),
(241, 'Salamá', 15),
(242, 'San Esteban', 15),
(243, 'San Francisco de Becerra', 15),
(244, 'San Francisco de la Paz', 15),
(245, 'Santa María del Real', 15),
(246, 'Silca', 15),
(247, 'Yocón', 15),
(248, 'Patuca', 15),
(249, 'Santa Bárbara', 16),
(250, 'Arada', 16),
(251, 'Atima', 16),
(252, 'Azacualpa', 16),
(253, 'Ceguaca', 16),
(254, 'Concepción del Norte', 16),
(255, 'Concepción del Sur', 16),
(256, 'Chinda', 16),
(257, 'El Níspero', 16),
(258, 'Gualala', 16),
(259, 'Ilama', 16),
(260, 'Las Vegas', 16),
(261, 'Macuelizo', 16),
(262, 'Naranjito', 16),
(263, 'Nueva Celilac', 16),
(264, 'Petoa', 16),
(265, 'Protección', 16),
(266, 'Quimistán', 16),
(267, 'San Francisco de Ojuera', 16),
(268, 'San José de Colinas', 16),
(269, 'San Luis', 16),
(270, 'San Marcos', 16),
(271, 'San Nicolás', 16),
(272, 'San Pedro Zacapa', 16),
(273, 'San Vicente Centenario', 16),
(274, 'Santa Rita', 16),
(275, 'Trinidad', 16),
(276, 'Nacaome', 17),
(277, 'Alianza', 17),
(278, 'Amapala', 17),
(279, 'Aramecina', 17),
(280, 'Caridad', 17),
(281, 'Goascorán', 17),
(282, 'Langue', 17),
(283, 'San Francisco de Coray', 17),
(284, 'San Lorenzo', 17),
(285, 'Yoro', 18),
(286, 'Arenal', 18),
(287, 'El Negrito', 18),
(288, 'El Progreso', 18),
(289, 'Jocón', 18),
(290, 'Morazán', 18),
(291, 'Olanchito', 18),
(292, 'Santa Rita', 18),
(293, 'Sulaco', 18),
(294, 'Victoria', 18),
(295, 'Yorito', 18),
(297, 'LA CEIBA', 2),
(298, 'TELA', 1),
(299, 'MARCOVIA', 2),
(300, 'REITOCA', 8);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_nacionalidad`
--

CREATE TABLE `tbl_nacionalidad` (
  `Cod_nacionalidad` int(11) NOT NULL,
  `Id_nacionalidad` varchar(25) NOT NULL,
  `pais_nacionalidad` varchar(100) NOT NULL,
  `pais` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_nacionalidad`
--

INSERT INTO `tbl_nacionalidad` (`Cod_nacionalidad`, `Id_nacionalidad`, `pais_nacionalidad`, `pais`) VALUES
(1, 'AFG', 'AFGANO(A)', 'AFGANISTÁN'),
(2, 'ALB', 'ALBANÉS(A)', 'ALBANIA'),
(3, 'DZA', 'ARGELINO(A)', 'ARGELIA'),
(4, 'AND', 'ANDORRANO(A)', 'ANDORRA'),
(5, 'AGO', 'ANGOLEÑO(A)', 'ANGOLA'),
(6, 'ATG', 'ANTIGUANO(A)', 'ANTIGUA Y BARBUDA'),
(7, 'ARG', 'ARGENTINO(A)', 'ARGENTINA'),
(8, 'ARM', 'ARMENIO(A)', 'ARMENIA'),
(9, 'AUS', 'AUSTRALIANO(A)', 'AUSTRALIA'),
(10, 'AUT', 'AUSTRÍACO(A)', 'AUSTRIA'),
(11, 'AZE', 'AZERÍ', 'AZERBAIYÁN'),
(12, 'BHS', 'BAHAMEÑO(A)', 'BAHAMAS'),
(13, 'BHR', 'BAREINÍ', 'BARÉIN'),
(14, 'BGD', 'BANGLADESÍ', 'BANGLADESH'),
(15, 'BRB', 'BARBADENSE', 'BARBADOS'),
(16, 'BLR', 'BIELORRUSO(A)', 'BIELORRUSIA'),
(17, 'BEL', 'BELGA', 'BÉLGICA'),
(18, 'BLZ', 'BELICEÑO(A)', 'BELICE'),
(19, 'BEN', 'BENINÉS(A)', 'BENÍN'),
(20, 'BTN', 'BUTANÉS(A)', 'BUTÁN'),
(21, 'BOL', 'BOLIVIANO(A)', 'BOLIVIA'),
(22, 'BIH', 'BOSNIO(A)', 'BOSNIA Y HERZEGOVINA'),
(23, 'BWA', 'BOTSUANO(A)', 'BOTSUANA'),
(24, 'BGR', 'BÚLGARO(A)', 'BULGARIA'),
(25, 'BFA', 'BURKINÉS(A)', 'BURKINA FASO'),
(26, 'BDI', 'BURUNDÉS(A)', 'BURUNDI'),
(27, 'CPV', 'CABOVERDIANO(A)', 'CABO VERDE'),
(28, 'KHM', 'CAMBOYANO(A)', 'CAMBOYA'),
(29, 'CMR', 'CAMERUNÉS(A)', 'CAMERÚN'),
(30, 'CAN', 'CANADIENSE', 'CANADÁ'),
(31, 'CAF', 'CENTROAFRICANO(A)', 'REPÚBLICA CENTROAFRICANA'),
(32, 'TCD', 'CHADIANO(A)', 'CHAD'),
(33, 'CHL', 'CHILENO(A)', 'CHILE'),
(34, 'CHN', 'CHINO(A)', 'CHINA'),
(35, 'COL', 'COLOMBIANO(A)', 'COLOMBIA'),
(36, 'COM', 'COMORENSE', 'COMORAS'),
(37, 'COG', 'CONGOLEÑO(A)', 'REPÚBLICA DEL CONGO'),
(38, 'COK', 'ISLEÑO(A) DE COOK', 'ISLAS COOK'),
(39, 'CRI', 'COSTARRICENSE', 'COSTA RICA'),
(40, 'HRV', 'CROATA', 'CROACIA'),
(41, 'CUB', 'CUBANO(A)', 'CUBA'),
(42, 'CYP', 'CIPRIOTA', 'CIPRE'),
(43, 'CZE', 'CHECO(A)', 'REPÚBLICA CHECA'),
(44, 'DNK', 'DANÉS(A)', 'DINAMARCA'),
(45, 'DJI', 'YEMENÍ', 'YIBUTI'),
(46, 'DMA', 'DOMINIQUEÑO(A)', 'DOMINICA'),
(47, 'DOM', 'DOMINICANO(A)', 'REPÚBLICA DOMINICANA'),
(48, 'ECU', 'ECUATORIANO(A)', 'ECUADOR'),
(49, 'EGY', 'EGIPCIO(A)', 'EGIPTO'),
(50, 'SLV', 'SALVADOREÑO(A)', 'EL SALVADOR'),
(51, 'GNQ', 'ECUATOGUINEANO(A)', 'GUINEA ECUATORIAL'),
(52, 'ERI', 'ERITREO(A)', 'ERITREA'),
(53, 'EST', 'ESTONIO(A)', 'ESTONIA'),
(54, 'ETH', 'ETÍOPE', 'ETIOPÍA'),
(55, 'FJI', 'FIJIANO(A)', 'FIJI'),
(56, 'FIN', 'FINLANDÉS(A)', 'FINLANDIA'),
(57, 'FRA', 'FRANCÉS(A)', 'FRANCIA'),
(58, 'GAB', 'GABONÉS(A)', 'GABÓN'),
(59, 'GMB', 'GAMBIANO(A)', 'GAMBIA'),
(60, 'GEO', 'GEORGIANO(A)', 'GEORGIA'),
(61, 'GHA', 'GHANÉS(A)', 'GHANA'),
(62, 'GRC', 'GRIEGO(A)', 'GRECIA'),
(63, 'GRD', 'GRANADINO(A)', 'GRANADA'),
(64, 'GTM', 'GUATEMALTECO(A)', 'GUATEMALA'),
(65, 'GIN', 'GUINEANO(A)', 'GUINEA'),
(66, 'GNB', 'GUINEANO-BISAUENSE', 'GUINEA-BISÁU'),
(67, 'GUY', 'GUAYANÉS(A)', 'GUYANA'),
(68, 'HTI', 'HAITIANO(A)', 'HAITÍ'),
(69, 'HND', 'HONDUREÑO(A)', 'HONDURAS'),
(70, 'HUN', 'HÚNGARO(A)', 'HUNGRÍA'),
(71, 'ISL', 'ISLANDÉS(A)', 'ISLANDIA'),
(72, 'IND', 'INDIO(A)', 'INDIA'),
(73, 'IDN', 'INDONESIO(A)', 'INDONESIA'),
(74, 'IRN', 'IRANÍ', 'IRÁN'),
(75, 'IRQ', 'IRAKÍ', 'IRAK'),
(76, 'IRL', 'IRLANDÉS(A)', 'IRLANDA'),
(77, 'ISR', 'ISRAELO(A)', 'ISRAEL'),
(78, 'ITA', 'ITALIANO(A)', 'ITALIA'),
(79, 'JAM', 'JAMAICANO(A)', 'JAMAICA'),
(80, 'JPN', 'JAPONÉS(A)', 'JAPÓN'),
(81, 'JOR', 'JORDANO(A)', 'JORDANIA'),
(82, 'KAZ', 'KAZAJO(A)', 'KAZAJISTÁN'),
(83, 'KEN', 'KENIATA', 'KENIA'),
(84, 'KIR', 'KIRIBATIANO(A)', 'KIRIBATI'),
(85, 'KOR', 'COREANO(A)', 'COREA DEL SUR'),
(86, 'KWT', 'KUWAITÍ', 'KUWAIT'),
(87, 'KGZ', 'KIRGUÍS(A)', 'KIRGUISTÁN'),
(88, 'LAO', 'LAOSIANO(A)', 'LAOS'),
(89, 'LVA', 'LETÓN(A)', 'LETONIA'),
(90, 'LBN', 'LIBANÉS(A)', 'LÍBANO'),
(91, 'LSO', 'LESOTO', 'LESOTO'),
(92, 'LBR', 'LIBERIANO(A)', 'LIBERIA'),
(93, 'LBY', 'LIBIO(A)', 'LIBIA'),
(94, 'LIE', 'LIECHTENSTEINIANO(A)', 'LIECHTENSTEIN'),
(95, 'LTU', 'LITUANO(A)', 'LITUANIA'),
(96, 'LUX', 'LUXEMBURGUÉS(A)', 'LUXEMBURGO'),
(97, 'MDG', 'MALGACHE', 'MADAGASCAR'),
(98, 'MWI', 'MALAUÍ', 'MALAWI'),
(99, 'MYS', 'MALASIO(A)', 'MALASIA'),
(100, 'MDV', 'MALDIVO(A)', 'MALDIVAS'),
(101, 'MLI', 'MALIENSE', 'MALÍ'),
(102, 'MLT', 'MALTES(A)', 'MALTA'),
(103, 'MHL', 'ISLEÑO(A) DE MARSHALL', 'ISLAS MARSHALL'),
(104, 'MNG', 'MONGOL(A)', 'MONGOLIA'),
(105, 'MNP', 'ISLEÑO(A) DEL NORTE DE MARIANA', 'ISLAS MARIANAS DEL NORTE'),
(106, 'MOZ', 'MOZAMBIQUEÑO(A)', 'MOZAMBIQUE'),
(107, 'MMR', 'BIRMANO(A)', 'MYANMAR'),
(108, 'NAM', 'NAMIBIO(A)', 'NAMIBIA'),
(109, 'NER', 'NIGERIANO(A)', 'NÍGER'),
(110, 'NGA', 'NIGERIANO(A)', 'NÍGERIA'),
(111, 'NIU', 'NIUANO(A)', 'NIUE'),
(112, 'NFK', 'ISLEÑO(A) NORFOLK', 'ISLA NORFOLK'),
(113, 'NPL', 'NEPALÍ', 'NEPAL'),
(114, 'NLD', 'NEERLANDÉS(A)', 'PAÍSES BAJOS'),
(115, 'NOR', 'NORUEGO(A)', 'NORUEGA'),
(116, 'NRU', 'NAURUANO(A)', 'NAURU'),
(117, 'NZL', 'NEOZELANDÉS(A)', 'NUEVA ZELANDA'),
(118, 'OMN', 'OMANÍ', 'OMÁN'),
(119, 'PAK', 'PAKISTANÍ', 'PAKISTÁN'),
(120, 'PLW', 'PALAUANO(A)', 'PALAU'),
(121, 'PAN', 'PANAMEÑO(A)', 'PANAMÁ'),
(122, 'PNG', 'PAPÚO(A) DE NUEVA GUINEA', 'PAPÚA NUEVA GUINEA'),
(123, 'PRT', 'PORTUGUÉS(A)', 'PORTUGAL'),
(124, 'PRY', 'PARAGUAYO(A)', 'PARAGUAY'),
(125, 'PER', 'PERUANO(A)', 'PERÚ'),
(126, 'PHL', 'FILIPINO(A)', 'FILIPINAS'),
(127, 'POL', 'POLACO(A)', 'POLONIA'),
(128, 'KOR', 'COREANO(A)', 'COREA DEL SUR'),
(129, 'QAT', 'QATARÍ', 'QATAR'),
(130, 'ROM', 'RUMANO(A)', 'RUMANÍA'),
(131, 'RUS', 'RUSO(A)', 'RUSIA'),
(132, 'RWA', 'RUANDÉS(A)', 'RUANDA'),
(133, 'REU', 'REUNION', 'REUNIÓN'),
(134, 'WSM', 'SAMOANO(A)', 'SAMOA'),
(135, 'SEN', 'SENEGALEÑO(A)', 'SENEGAL'),
(136, 'SRB', 'SERBIO(A)', 'SERBIA'),
(137, 'SYC', 'SEYCHELENSE', 'SEYCHELLES'),
(138, 'SLE', 'SIERRALEONÉS(A)', 'SIERRA LEONA'),
(139, 'SGP', 'SINGAPUREÑO(A)', 'SINGAPUR'),
(140, 'SVK', 'ESLOVACO(A)', 'ESLOVAQUIA'),
(141, 'SVN', 'ESLOVENO(A)', 'ESLOVENIA'),
(142, 'SOM', 'SOMALÍ', 'SOMALIA'),
(143, 'ZAF', 'SURAFRICANO(A)', 'SUDÁFRICA'),
(144, 'SSD', 'SUDANEÑO(A)', 'SUDÁN DEL SUR'),
(145, 'ESP', 'ESPAÑOL(A)', 'ESPAÑA'),
(146, 'LKA', 'CEILANDES(A)', 'CEILÁNDIA'),
(147, 'SDN', 'SUDANÉS(A)', 'SUDÁN'),
(148, 'SUR', 'SURINAMÉS(A)', 'SURINAM'),
(149, 'SWZ', 'ESUATINI', 'ESUATINI'),
(150, 'SWE', 'SUECO(A)', 'SUECIA'),
(151, 'CHE', 'SUIZO(A)', 'SUIZA'),
(152, 'SYR', 'SIRIO(A)', 'SIRIA'),
(153, 'TWN', 'TAIWANÉS(A)', 'TAIWÁN'),
(154, 'TJK', 'TAYIKO(A)', 'TAYIKISTÁN'),
(155, 'TAN', 'TANZANO(A)', 'TANZANÍA'),
(156, 'THA', 'TAILANDÉS(A)', 'TAILANDIA'),
(157, 'TGO', 'TOGOLEÑO(A)', 'TOGO'),
(158, 'TKM', 'TURCOMANO(A)', 'TURKMENISTÁN'),
(159, 'TUN', 'TUNECINO(A)', 'TÚNEZ'),
(160, 'TUR', 'TURCO(A)', 'TURQUÍA'),
(161, 'TUV', 'TUVALUANO(A)', 'TUVALU'),
(162, 'UGA', 'UGANDÉS(A)', 'UGANDA'),
(163, 'UKR', 'UCRANIANO(A)', 'UCRANIA'),
(164, 'ARE', 'EMIRATÍ', 'EMIRATOS ÁRABES UNIDOS'),
(165, 'GBR', 'BRITÁNICO(A)', 'REINO UNIDO'),
(166, 'USA', 'ESTADOUNIDENSE', 'ESTADOS UNIDOS'),
(167, 'URY', 'URUGUAYO(A)', 'URUGUAY'),
(168, 'UZB', 'UZBECO(A)', 'UZBEKISTÁN'),
(169, 'VUT', 'VANUATENSE', 'VANUATU'),
(170, 'VEN', 'VENEZOLANO(A)', 'VENEZUELA'),
(171, 'VNM', 'VIETNAMITA', 'VIETNAM'),
(172, 'VGB', 'ISLEÑO(A) DE LAS ISLAS VÍRGENES BRITÁNICAS', 'ISLAS VÍRGENES BRITÁNICAS'),
(173, 'VIR', 'ISLEÑO(A) DE LAS ISLAS VÍRGENES DE LOS ESTADOS UNIDOS', 'ISLAS VÍRGENES DE LOS ESTADOS UNIDOS'),
(174, 'WLF', 'WALLISIANO(A)', 'WALLIS Y FUTUNA'),
(175, 'WSM', 'SAMOANO(A)', 'SAMOA'),
(176, 'YEM', 'YEMENÍ', 'YEMEN'),
(177, 'ZMB', 'ZAMBIANO(A)', 'ZAMBIA'),
(178, 'ZWE', 'ZIMBABUEÑO(A)', 'ZIMBABUE');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_notas`
--

CREATE TABLE `tbl_notas` (
  `Cod_nota` int(11) NOT NULL,
  `Nota` int(11) NOT NULL,
  `Observacion` varchar(60) DEFAULT NULL,
  `Cod_parcial` int(11) NOT NULL,
  `Cod_estado` int(11) DEFAULT NULL,
  `Cod_actividad_asignatura` int(11) NOT NULL,
  `Cod_seccion_matricula` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_notas`
--

INSERT INTO `tbl_notas` (`Cod_nota`, `Nota`, `Observacion`, `Cod_parcial`, `Cod_estado`, `Cod_actividad_asignatura`, `Cod_seccion_matricula`) VALUES
(29, 10, 'REPUSO TAREA', 4, NULL, 2, 1),
(30, 9, 'REPOSICION DE TAREA', 4, NULL, 2, 5),
(31, 33, NULL, 4, NULL, 30, 1),
(32, 33, NULL, 4, NULL, 30, 5),
(33, 22, NULL, 2, NULL, 17, 1),
(34, 22, NULL, 2, NULL, 17, 5),
(35, 25, NULL, 3, NULL, 29, 1),
(36, 25, NULL, 3, NULL, 29, 5),
(37, 25, NULL, 3, NULL, 29, 15),
(38, 40, NULL, 2, NULL, 13, 1),
(39, 45, NULL, 2, NULL, 13, 5),
(40, 30, NULL, 2, NULL, 13, 15),
(41, 25, NULL, 2, NULL, 13, 16),
(42, 22, NULL, 2, NULL, 9, 1),
(43, 22, NULL, 2, NULL, 9, 5),
(44, 22, NULL, 2, NULL, 9, 15),
(45, 22, NULL, 2, NULL, 9, 16),
(46, 10, NULL, 2, NULL, 6, 1),
(47, 10, NULL, 2, NULL, 6, 5),
(48, 10, NULL, 2, NULL, 6, 15),
(49, 10, NULL, 2, NULL, 6, 16),
(50, 22, NULL, 1, NULL, 74, 1),
(51, 22, NULL, 1, NULL, 74, 5),
(52, 22, NULL, 1, NULL, 74, 15),
(53, 22, NULL, 1, NULL, 74, 16),
(54, 22, NULL, 1, NULL, 75, 1),
(55, 22, NULL, 1, NULL, 75, 5),
(56, 22, NULL, 1, NULL, 75, 15),
(57, 22, NULL, 1, NULL, 75, 16),
(58, 22, NULL, 1, NULL, 71, 1),
(59, 22, NULL, 1, NULL, 71, 5),
(60, 2, NULL, 1, NULL, 71, 15),
(61, 2, NULL, 1, NULL, 71, 16),
(62, 5, NULL, 1, NULL, 115, 2),
(63, 5, NULL, 1, NULL, 115, 6),
(64, 2, NULL, 1, NULL, 115, 13),
(65, 25, NULL, 1, NULL, 122, 2),
(66, 25, NULL, 1, NULL, 122, 6),
(67, 1, NULL, 1, NULL, 122, 13),
(68, 20, NULL, 1, NULL, 113, 2),
(69, 20, NULL, 1, NULL, 113, 6),
(70, 1, NULL, 1, NULL, 113, 13),
(71, 10, NULL, 1, NULL, 131, 2),
(72, 10, NULL, 1, NULL, 131, 6),
(73, 1, 'NO PRESENTO LA TAREA COMPLETA 1', 1, NULL, 131, 13),
(74, 20, NULL, 1, NULL, 132, 2),
(75, 20, NULL, 1, NULL, 132, 6),
(76, 1, NULL, 1, NULL, 132, 13),
(77, 20, NULL, 1, NULL, 124, 2),
(78, 20, NULL, 1, NULL, 124, 6),
(79, 1, NULL, 1, NULL, 124, 13);

--
-- Disparadores `tbl_notas`
--
DELIMITER $$
CREATE TRIGGER `trg_actualizar_historial_academic2` AFTER INSERT ON `tbl_notas` FOR EACH ROW BEGIN
    DECLARE promedio_final DECIMAL(5, 2);
    DECLARE cod_periodo INT;
    DECLARE cod_historial_academico INT;

    -- Paso 1: Obtener el período académico asociado al estudiante mediante la sección matrícula
    SELECT pm.Cod_periodo_matricula
    INTO cod_periodo
    FROM tbl_periodo_matricula pm
    INNER JOIN tbl_secciones s ON pm.Cod_periodo_matricula = s.Cod_periodo_matricula
    INNER JOIN tbl_secciones_matricula sm ON s.Cod_secciones = sm.Cod_seccion
    WHERE sm.Cod_seccion_matricula = NEW.Cod_seccion_matricula
    LIMIT 1;

    -- Paso 2: Calcular el promedio de las notas de la actividad asignada al estudiante
    SELECT AVG(n.Nota)
    INTO promedio_final
    FROM tbl_notas n
    WHERE n.Cod_actividad_asignatura = NEW.Cod_actividad_asignatura
      AND n.Cod_seccion_matricula = NEW.Cod_seccion_matricula;

    -- Paso 3: Verificar si ya existe un historial académico para el estudiante y el período
    SELECT ha.Cod_historial_academico
    INTO cod_historial_academico
    FROM tbl_historiales_academicos ha
    WHERE ha.Cod_persona = (
        SELECT sm.Cod_persona
        FROM tbl_secciones_matricula sm
        WHERE sm.Cod_seccion_matricula = NEW.Cod_seccion_matricula
    )
    LIMIT 1;

    -- Paso 4: Si no existe un historial académico, insertar uno nuevo
    IF cod_historial_academico IS NULL THEN
        INSERT INTO tbl_historiales_academicos (Cod_persona, Cod_estado, Grado, Año_Academico, Promedio_Anual, Fecha_Registro, Cod_Instituto, Observacion)
        VALUES (
            (SELECT sm.Cod_persona FROM tbl_secciones_matricula sm WHERE sm.Cod_seccion_matricula = NEW.Cod_seccion_matricula),
            1, -- Estado inicial
            (SELECT g.Nombre_grado 
             FROM tbl_grados g 
             INNER JOIN tbl_secciones_matricula sm ON g.Cod_grado = sm.Cod_grado 
             WHERE sm.Cod_seccion_matricula = NEW.Cod_seccion_matricula),
            YEAR(NOW()),
            0.00, -- Promedio inicial
            NOW(),
            1, -- Instituto predeterminado
            'Nuevo registro generado automáticamente'
        );

        SET cod_historial_academico = LAST_INSERT_ID();
    END IF;

    -- Paso 5: Verificar si ya existe un historial para la asignatura relacionada con el grado
    IF NOT EXISTS (
        SELECT 1
        FROM tbl_historiales_asignaturas 
        WHERE Cod_historial_academico = cod_historial_academico
          AND Cod_asignatura = (
              SELECT ga.Cod_asignatura
              FROM tbl_grados_asignaturas ga
              INNER JOIN tbl_secciones_asignaturas sa ON ga.Cod_grados_asignaturas = sa.Cod_grados_asignaturas
              INNER JOIN tbl_actividades_asignatura aa ON sa.Cod_seccion_asignatura = aa.Cod_seccion_asignatura
              WHERE aa.Cod_actividad_asignatura = NEW.Cod_actividad_asignatura
              LIMIT 1
          )
    ) THEN
        -- Insertar un nuevo historial de asignatura
        INSERT INTO tbl_historiales_asignaturas (Cod_historial_academico, Cod_asignatura, Promedio_asignatura)
        VALUES (
            cod_historial_academico,
            (SELECT ga.Cod_asignatura
             FROM tbl_grados_asignaturas ga
             INNER JOIN tbl_secciones_asignaturas sa ON ga.Cod_grados_asignaturas = sa.Cod_grados_asignaturas
             INNER JOIN tbl_actividades_asignatura aa ON sa.Cod_seccion_asignatura = aa.Cod_seccion_asignatura
             WHERE aa.Cod_actividad_asignatura = NEW.Cod_actividad_asignatura
             LIMIT 1),
            promedio_final
        );
    ELSE
        -- Actualizar el promedio en el historial de asignaturas
        UPDATE tbl_historiales_asignaturas
        SET Promedio_asignatura = promedio_final
        WHERE Cod_historial_academico = cod_historial_academico
          AND Cod_asignatura = (
              SELECT ga.Cod_asignatura
              FROM tbl_grados_asignaturas ga
              INNER JOIN tbl_secciones_asignaturas sa ON ga.Cod_grados_asignaturas = sa.Cod_grados_asignaturas
              INNER JOIN tbl_actividades_asignatura aa ON sa.Cod_seccion_asignatura = aa.Cod_seccion_asignatura
              WHERE aa.Cod_actividad_asignatura = NEW.Cod_actividad_asignatura
              LIMIT 1
          );
    END IF;

   -- Paso 6: Actualizar el promedio anual en el historial académico
UPDATE tbl_historiales_academicos
SET Promedio_Anual = (
    SELECT AVG(ha.Promedio_asignatura)
    FROM tbl_historiales_asignaturas ha
    WHERE ha.Cod_historial_academico = tbl_historiales_academicos.Cod_historial_academico
)
WHERE Cod_historial_academico = cod_historial_academico;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_actualizar_historial_academico` AFTER UPDATE ON `tbl_notas` FOR EACH ROW BEGIN
    DECLARE promedio_final DECIMAL(5, 2);
    DECLARE cod_periodo INT;
    DECLARE cod_historial_academico INT;

    -- Paso 1: Obtener el período académico asociado al estudiante mediante la sección matrícula
    SELECT pm.Cod_periodo_matricula
    INTO cod_periodo
    FROM tbl_periodo_matricula pm
    INNER JOIN tbl_secciones s ON pm.Cod_periodo_matricula = s.Cod_periodo_matricula
    INNER JOIN tbl_secciones_matricula sm ON s.Cod_secciones = sm.Cod_seccion
    WHERE sm.Cod_seccion_matricula = NEW.Cod_seccion_matricula
    LIMIT 1;

    -- Paso 2: Calcular el promedio de las notas de la actividad asignada al estudiante

    SELECT AVG(n.Nota)
    INTO promedio_final
    FROM tbl_notas n
    WHERE n.Cod_actividad_asignatura = NEW.Cod_actividad_asignatura
      AND n.Cod_seccion_matricula = NEW.Cod_seccion_matricula;

    -- Paso 3: Verificar si ya existe un historial académico para el estudiante y el período
    SELECT ha.Cod_historial_academico
    INTO cod_historial_academico
    FROM tbl_historiales_academicos ha
    WHERE ha.Cod_persona = (
        SELECT sm.Cod_persona
        FROM tbl_secciones_matricula sm
        WHERE sm.Cod_seccion_matricula = NEW.Cod_seccion_matricula
    )
    LIMIT 1;

    -- Paso 4: Si no existe un historial académico, insertar uno nuevo
    IF cod_historial_academico IS NULL THEN
        INSERT INTO tbl_historiales_academicos (Cod_persona, Cod_estado, Grado, Año_Academico, Promedio_Anual, Fecha_Registro, Cod_Instituto, Observacion)
        VALUES (
            (SELECT sm.Cod_persona FROM tbl_secciones_matricula sm WHERE sm.Cod_seccion_matricula = NEW.Cod_seccion_matricula),
            1, -- Estado inicial
            (SELECT g.Nombre_grado 
             FROM tbl_grados g 
             INNER JOIN tbl_secciones_matricula sm ON g.Cod_grado = sm.Cod_grado 
             WHERE sm.Cod_seccion_matricula = NEW.Cod_seccion_matricula),
            YEAR(NOW()),
            0.00, -- Promedio inicial
            NOW(),
            1, -- Instituto predeterminado
            'Actualización automática de historial académico'
        );

        SET cod_historial_academico = LAST_INSERT_ID();
    END IF;

    -- Paso 5: Verificar si ya existe un historial para la asignatura relacionada con el grado
    IF NOT EXISTS (
        SELECT 1
        FROM tbl_historiales_asignaturas 
        WHERE Cod_historial_academico = cod_historial_academico
          AND Cod_asignatura = (
              SELECT ga.Cod_asignatura
              FROM tbl_grados_asignaturas ga
              INNER JOIN tbl_secciones_asignaturas sa ON ga.Cod_grados_asignaturas = sa.Cod_grados_asignaturas
              INNER JOIN tbl_actividades_asignatura aa ON sa.Cod_seccion_asignatura = aa.Cod_seccion_asignatura
              WHERE aa.Cod_actividad_asignatura = NEW.Cod_actividad_asignatura
              LIMIT 1
          )
    ) THEN
        -- Insertar un nuevo historial de asignatura
        INSERT INTO tbl_historiales_asignaturas (Cod_historial_academico, Cod_asignatura, Promedio_asignatura)
        VALUES (
            cod_historial_academico,
            (SELECT ga.Cod_asignatura
             FROM tbl_grados_asignaturas ga
             INNER JOIN tbl_secciones_asignaturas sa ON ga.Cod_grados_asignaturas = sa.Cod_grados_asignaturas
             INNER JOIN tbl_actividades_asignatura aa ON sa.Cod_seccion_asignatura = aa.Cod_seccion_asignatura
             WHERE aa.Cod_actividad_asignatura = NEW.Cod_actividad_asignatura
             LIMIT 1),
            promedio_final
        );
    ELSE
        -- Actualizar el promedio en el historial de asignaturas
        UPDATE tbl_historiales_asignaturas
        SET Promedio_asignatura = promedio_final
        WHERE Cod_historial_academico = cod_historial_academico
          AND Cod_asignatura = (
              SELECT ga.Cod_asignatura
              FROM tbl_grados_asignaturas ga
              INNER JOIN tbl_secciones_asignaturas sa ON ga.Cod_grados_asignaturas = sa.Cod_grados_asignaturas
              INNER JOIN tbl_actividades_asignatura aa ON sa.Cod_seccion_asignatura = aa.Cod_seccion_asignatura
              WHERE aa.Cod_actividad_asignatura = NEW.Cod_actividad_asignatura
              LIMIT 1
          );
    END IF;

    -- Paso 6: Actualizar el promedio anual en el historial académico
    UPDATE tbl_historiales_academicos
    SET Promedio_Anual = (
        SELECT AVG(ha.Promedio_asignatura)
        FROM tbl_historiales_asignaturas ha
        WHERE ha.Cod_historial_academico = tbl_historiales_academicos.Cod_historial_academico
    )
    WHERE Cod_historial_academico = cod_historial_academico;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_objetos`
--

CREATE TABLE `tbl_objetos` (
  `Cod_Objeto` int(11) NOT NULL,
  `Nom_objeto` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Descripcion` varchar(100) NOT NULL,
  `Tipo_Objeto` enum('pantalla','boton','ruta') NOT NULL,
  `Ind_objeto` enum('1','0') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tbl_objetos`
--

INSERT INTO `tbl_objetos` (`Cod_Objeto`, `Nom_objeto`, `Descripcion`, `Tipo_Objeto`, `Ind_objeto`) VALUES
(12, 'Dashboard', 'Página del tablero de control', 'pantalla', '1'),
(45, 'GestionUsuarios', 'GestionUsuarios', 'pantalla', '1'),
(46, 'PaginaPrincipal', 'Dashboard para padres', 'pantalla', '1'),
(47, 'ListaAsistencia', 'ListaAsistencia', 'pantalla', '1'),
(48, 'ListaProfesores', 'ListaProfesores', 'pantalla', '1'),
(49, 'ListaEstadonota', 'ListaEstadonota', 'pantalla', '1'),
(50, 'ListaEstructura', 'ListaEstructura', 'pantalla', '1'),
(51, 'ListaAsignaturas', 'ListaAsignaturas', 'pantalla', '1'),
(52, 'ListaCiclos', 'ListaCiclos', 'pantalla', '1'),
(53, 'ListaEspecialidades', 'ListaEspecialidades', 'pantalla', '1'),
(54, 'ListaEstadoasistencia', 'ListaEstadoasistencia', 'pantalla', '1'),
(55, 'ListaGrados', 'ListaGrados', 'pantalla', '1'),
(56, 'ListaGradoAcademico', 'ListaGradoAcademico', 'pantalla', '1'),
(57, 'ListaParciales', 'ListaParciales', 'pantalla', '1'),
(58, 'ListaPonderaciones', 'ListaPonderaciones', 'pantalla', '1'),
(59, 'ListaTipoContrato', 'ListaTipoContrato', 'pantalla', '1'),
(60, 'tipomatricula', 'tipomatricula', 'pantalla', '1'),
(61, 'periodomatricula', 'periodomatricula', 'pantalla', '1'),
(62, 'estadomatricula', 'estadomatricula', 'pantalla', '1'),
(63, 'conceptopago', 'conceptopago', 'pantalla', '1'),
(64, 'departamento', 'departamento', 'pantalla', '1'),
(65, 'tipopersona', 'tipopersona', 'pantalla', '1'),
(66, 'edificios', 'edificios', 'pantalla', '1'),
(67, 'dias', 'dias', 'pantalla', '1'),
(68, 'ListaHistoricoProc', 'ListaHistoricoProc', 'pantalla', '1'),
(69, 'ListaRelacion', 'ListaRelacion', 'pantalla', '1'),
(70, 'Contabilidad', 'Contabilidad', 'pantalla', '1'),
(71, 'LibroDiario', 'LibroDiario', 'pantalla', '1'),
(72, 'rolesandpermissions', 'rolesandpermissions', 'pantalla', '1'),
(73, 'ListaHistorial', 'ListaHistorial', 'pantalla', '1'),
(74, 'actividades', 'actividades', 'pantalla', '1'),
(75, 'Contabilidad', 'Contabilidad', 'pantalla', '1'),
(76, 'Login', 'Login', 'pantalla', '1'),
(77, 'Matricula', 'Matricula', 'pantalla', '1'),
(78, 'VistaProfesores', 'VistaProfesores', 'pantalla', '1'),
(79, 'ListaActividadesAca', 'ListaActividadesAca', 'pantalla', '1'),
(80, 'ListaPersonas', 'ListaPersoans', 'pantalla', '1'),
(81, 'Municipios', 'Municipios', 'pantalla', '1'),
(82, 'rolesypermisos', 'rolesypermisos', 'pantalla', '1'),
(83, 'ListaActividadesProfesor', 'ListaActividadesProfesor', 'pantalla', '1'),
(84, 'ListaAsistenciaProfesor', 'ListaAsistenciaProfesor', 'pantalla', '1'),
(85, 'ListaNotasProfesor', 'ListaNotasProfesor', 'pantalla', '1'),
(86, 'actividades', 'actividades', 'pantalla', '1'),
(87, 'ListaNotas', 'ListaNotas', 'pantalla', '1'),
(88, 'ListaGradosAsignaturas', 'ListaGradosAsignaturas', 'pantalla', '1'),
(89, 'ListaPonderacionesCiclos', 'ListaPonderacionesCiclos', 'pantalla', '1'),
(90, 'Solicitud_admin', 'Solicitud_admin', 'pantalla', '1'),
(91, 'Solicitudes_Padre', 'Solicitudes_Padre', 'pantalla', '1'),
(92, 'matriculasAnioAnterior', 'matriculasAnioAnterior', 'pantalla', '1'),
(93, 'ListaSecciones_Asignatura', 'ListaSecciones_Asignatura', 'pantalla', '1'),
(94, 'Auditoria', 'Auditoria', 'pantalla', '1'),
(95, 'ListaParametro', 'ListaParametro', 'pantalla', '1'),
(96, 'gestion_academica', 'gestion_academica', 'pantalla', '1'),
(97, 'Secciones', 'Secciones', 'pantalla', '1'),
(98, 'ListaCuadroProfesor', 'ListaCuadroProfesor', 'pantalla', '1'),
(99, 'ListaCuadro', 'ListaCuadro', 'pantalla', '1'),
(102, 'ListaActividadesAcaVistaPadre', 'ListaActividadesAcaVistaProfesor', 'pantalla', '1'),
(103, 'ListaCuadroPadre', 'ListaCuadroPadre', 'pantalla', '1'),
(104, 'ListaInstitutos', 'ListaInstitutos', 'pantalla', '1');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_parametros`
--

CREATE TABLE `tbl_parametros` (
  `Cod_parametro` int(11) NOT NULL,
  `Cod_usuario` int(11) DEFAULT NULL,
  `Parametro` varchar(50) NOT NULL,
  `Valor` varchar(100) NOT NULL,
  `Fecha_Creacion` datetime DEFAULT current_timestamp(),
  `Fecha_Modificacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_parametros`
--

INSERT INTO `tbl_parametros` (`Cod_parametro`, `Cod_usuario`, `Parametro`, `Valor`, `Fecha_Creacion`, `Fecha_Modificacion`) VALUES
(2, NULL, 'UMBRAL_APROBACION', '70', '2024-12-01 17:44:31', '2024-12-02 00:19:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_parciales`
--

CREATE TABLE `tbl_parciales` (
  `Cod_parcial` int(11) NOT NULL,
  `Nombre_parcial` varchar(20) NOT NULL,
  `Nota_recuperacion` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_parciales`
--

INSERT INTO `tbl_parciales` (`Cod_parcial`, `Nombre_parcial`, `Nota_recuperacion`) VALUES
(1, 'PRIMER PARCIAL', NULL),
(2, 'SEGUNDO PARCIAL', NULL),
(3, 'TERCER PARCIAL', NULL),
(4, 'CUARTO PARCIAL', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_periodo_matricula`
--

CREATE TABLE `tbl_periodo_matricula` (
  `Cod_periodo_matricula` int(11) NOT NULL,
  `Fecha_inicio` date NOT NULL,
  `Fecha_fin` date NOT NULL,
  `Anio_academico` int(11) NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_periodo_matricula`
--

INSERT INTO `tbl_periodo_matricula` (`Cod_periodo_matricula`, `Fecha_inicio`, `Fecha_fin`, `Anio_academico`, `estado`) VALUES
(118, '2024-10-19', '2024-10-20', 2025, 'inactivo'),
(177, '2024-10-21', '2024-10-24', 2024, 'activo'),
(179, '2024-10-27', '2024-10-29', 2024, 'inactivo'),
(180, '2024-10-28', '2024-10-30', 2023, 'inactivo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_permisos`
--

CREATE TABLE `tbl_permisos` (
  `Cod_Permiso` int(11) NOT NULL,
  `Cod_Objeto` int(11) NOT NULL,
  `Cod_Rol` int(11) NOT NULL,
  `Permiso_Modulo` enum('1','0') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Permiso_Insercion` enum('1','0') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Permiso_Eliminacion` enum('1','0') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Permiso_Actualizacion` enum('1','0') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Permiso_Consultar` enum('1','0') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Permiso_Nav` enum('1','0') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Permiso_Ver` enum('1','0') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_permisos`
--

INSERT INTO `tbl_permisos` (`Cod_Permiso`, `Cod_Objeto`, `Cod_Rol`, `Permiso_Modulo`, `Permiso_Insercion`, `Permiso_Eliminacion`, `Permiso_Actualizacion`, `Permiso_Consultar`, `Permiso_Nav`, `Permiso_Ver`) VALUES
(101, 12, 4, '1', '0', '0', '0', '1', '0', NULL),
(102, 45, 4, '1', '1', '1', '1', '1', '1', NULL),
(103, 45, 2, '1', '0', '0', '0', '1', '0', NULL),
(105, 46, 1, '1', '1', '1', '1', '1', '0', NULL),
(109, 47, 4, '1', '1', '1', '1', '1', '0', NULL),
(110, 47, 2, '1', '1', '1', '1', '1', '0', NULL),
(111, 48, 2, '1', '1', '1', '1', '1', '0', NULL),
(112, 48, 4, '1', '0', '1', '1', '1', '0', NULL),
(113, 49, 2, '1', '1', '1', '1', '1', '0', NULL),
(114, 49, 4, '1', '1', '1', '1', '1', '1', NULL),
(115, 50, 2, '1', '1', '1', '1', '1', '0', NULL),
(116, 50, 4, '1', '1', '1', '1', '1', '1', NULL),
(117, 51, 2, '1', '1', '1', '1', '1', '0', NULL),
(118, 51, 4, '1', '1', '1', '1', '1', '1', NULL),
(119, 12, 1, '0', '0', '0', '0', '0', NULL, NULL),
(120, 12, 3, '0', '0', '0', '0', '0', '0', NULL),
(121, 12, 2, '1', '1', '1', '1', '1', '0', NULL),
(122, 45, 1, '0', '0', '0', '0', '0', '0', NULL),
(123, 45, 3, '0', '0', '0', '0', '0', '0', NULL),
(124, 46, 2, '0', '0', '0', '0', '0', '0', NULL),
(125, 46, 3, '1', '0', '0', '0', '1', '0', NULL),
(126, 46, 4, '0', '0', '0', '0', '0', NULL, NULL),
(127, 47, 1, '0', '0', '0', '0', '0', '0', NULL),
(128, 47, 3, '0', '0', '0', '0', '0', '0', NULL),
(131, 48, 1, '0', '0', '0', '0', '0', '0', NULL),
(132, 48, 3, '0', '0', '0', '0', '0', '0', NULL),
(133, 49, 1, '0', '0', '0', '0', '0', '0', NULL),
(134, 49, 3, '0', '0', '0', '0', '0', '0', NULL),
(135, 50, 1, '0', '0', '0', '0', '0', '0', NULL),
(136, 50, 2, '1', '1', '1', '1', '1', '0', NULL),
(137, 51, 1, '0', '0', '0', '0', '0', '0', NULL),
(138, 51, 3, '0', '0', '0', '0', '0', '0', NULL),
(139, 52, 1, '0', '0', '0', '0', '0', '0', NULL),
(140, 52, 2, '1', '1', '1', '1', '1', '0', NULL),
(141, 52, 3, '0', '0', '0', '0', '0', '0', NULL),
(142, 52, 4, '1', '1', '1', '1', '1', '1', NULL),
(143, 53, 1, '0', '0', '0', '0', '0', '0', NULL),
(144, 53, 2, '1', '1', '1', '1', '1', '0', NULL),
(147, 53, 3, '0', '0', '0', '0', '0', '0', NULL),
(148, 53, 4, '1', '1', '1', '1', '1', '1', NULL),
(149, 54, 1, '0', '0', '0', '0', '0', '0', NULL),
(150, 54, 2, '1', '1', '1', '1', '1', '0', NULL),
(151, 54, 3, '0', '0', '0', '0', '0', '0', NULL),
(152, 54, 4, '1', '1', '1', '1', '1', '1', NULL),
(153, 55, 1, '0', '0', '0', '0', '0', '0', NULL),
(154, 55, 2, '1', '1', '1', '1', '1', '0', NULL),
(155, 55, 3, '0', '0', '0', '0', '0', '0', NULL),
(156, 55, 4, '1', '1', '1', '1', '1', '1', NULL),
(157, 56, 1, '0', '0', '0', '0', '0', '0', NULL),
(158, 56, 2, '1', '1', '1', '1', '1', '0', NULL),
(159, 56, 3, '0', '0', '0', '0', '0', '0', NULL),
(160, 56, 4, '1', '1', '1', '1', '1', '1', NULL),
(161, 57, 1, '1', NULL, NULL, NULL, NULL, '0', NULL),
(162, 57, 2, '1', '1', '1', '1', '1', '0', NULL),
(163, 57, 3, '0', '0', '0', '0', '0', '0', NULL),
(164, 57, 4, '1', '1', '1', '1', '1', '1', NULL),
(165, 58, 1, '1', NULL, NULL, NULL, NULL, '0', NULL),
(166, 58, 2, '1', '1', '1', '1', '1', '0', NULL),
(167, 58, 3, '0', '0', '0', '0', '0', '0', NULL),
(168, 58, 4, '1', '1', '1', '1', '1', '1', NULL),
(169, 59, 1, '1', NULL, NULL, NULL, NULL, '0', NULL),
(170, 59, 2, '1', '1', '1', '1', '1', '0', NULL),
(171, 59, 3, '0', '0', '0', '0', '0', '0', NULL),
(172, 59, 4, '1', '1', '1', '1', '1', '1', NULL),
(173, 60, 1, '1', NULL, NULL, NULL, NULL, '0', NULL),
(174, 60, 2, '1', '1', '1', '1', '1', '0', NULL),
(175, 60, 3, '0', '0', '0', '0', '0', '0', NULL),
(176, 60, 4, '1', '1', '1', '1', '1', '1', NULL),
(177, 61, 1, '0', '0', '0', '0', '0', '0', NULL),
(178, 61, 2, '1', '1', '1', '1', '1', '0', NULL),
(179, 61, 3, '0', '0', '0', '0', '0', '0', NULL),
(180, 61, 4, '1', '1', '1', '1', '1', '1', NULL),
(181, 62, 1, '0', '0', '0', '0', '0', '0', NULL),
(182, 62, 2, '1', '1', '1', '1', '1', '0', NULL),
(183, 62, 3, '0', '0', '0', '0', '0', '0', NULL),
(184, 62, 4, '1', '1', '1', '1', '1', '1', NULL),
(185, 63, 1, '0', '0', '0', '0', '0', '0', NULL),
(186, 63, 2, '1', '1', '1', '1', '1', '0', NULL),
(187, 63, 3, '0', '0', '0', '0', '0', '0', NULL),
(188, 63, 4, '1', '1', '1', '1', '1', '1', NULL),
(189, 64, 1, '0', '0', '0', '0', '0', '0', NULL),
(190, 64, 2, '1', '1', '1', '1', '1', '0', NULL),
(191, 64, 3, '0', '0', '0', '0', '0', '0', NULL),
(192, 64, 4, '1', '1', '1', '1', '1', '1', NULL),
(193, 65, 1, '0', '0', '0', '0', '0', '0', NULL),
(194, 65, 2, '1', '1', '1', '1', '1', '0', NULL),
(195, 65, 3, '0', '0', '0', '0', '0', '0', NULL),
(196, 65, 4, '1', '1', '1', '1', '1', '1', NULL),
(197, 66, 1, '0', '0', '0', '0', '0', '0', NULL),
(198, 66, 2, '1', '1', '1', '1', '1', '0', NULL),
(199, 66, 3, '0', '0', '0', '0', '0', '0', NULL),
(200, 66, 4, '1', '1', '1', '1', '1', '1', NULL),
(201, 67, 1, '0', '0', '0', '0', '0', '0', NULL),
(202, 67, 2, '1', '1', '1', '1', '1', '0', NULL),
(203, 67, 3, '0', '0', '0', '0', '0', '0', NULL),
(204, 67, 4, '1', '1', '1', '1', '1', '1', NULL),
(205, 68, 1, '0', '0', '0', '0', '0', '0', NULL),
(206, 68, 2, '1', '1', '1', '1', '1', '0', NULL),
(207, 68, 3, '0', '0', '0', '0', '0', '0', NULL),
(208, 68, 4, '1', '1', '1', '1', '1', '1', NULL),
(211, 69, 1, '0', '0', '0', '0', '0', '0', NULL),
(212, 69, 2, '1', '1', '1', '1', '1', '0', NULL),
(213, 69, 3, '0', '0', '0', '0', '0', '0', NULL),
(214, 69, 4, '1', '1', '1', '1', '1', '1', NULL),
(215, 70, 1, '0', '0', '0', '0', '0', '0', NULL),
(216, 70, 2, '1', '1', '1', '1', '1', '0', NULL),
(217, 70, 3, '0', '0', '0', '0', '0', '0', NULL),
(218, 70, 4, '1', '1', '1', '1', '1', '1', NULL),
(219, 71, 1, '0', '0', '0', '0', '0', '0', NULL),
(220, 71, 2, '1', '1', '1', '1', '1', '0', NULL),
(221, 71, 3, '0', '0', '0', '0', '0', '0', NULL),
(222, 71, 4, '1', '1', '1', '1', '1', '1', NULL),
(223, 72, 1, '0', '0', '0', '0', '0', '0', NULL),
(224, 72, 2, '0', '0', '0', '0', '0', NULL, NULL),
(225, 72, 3, '0', '0', '0', '0', '0', '0', NULL),
(226, 72, 4, '1', '1', '1', '1', '1', '1', NULL),
(227, 73, 1, '0', '0', '0', '0', '0', '0', NULL),
(228, 73, 2, '1', '1', '1', '1', '1', '0', NULL),
(229, 73, 3, '0', '0', '0', '0', '0', '0', NULL),
(230, 73, 4, '1', '1', '1', '1', '1', '0', NULL),
(231, 74, 1, '0', '0', '0', '0', '0', '0', NULL),
(232, 74, 2, '1', '1', '1', '1', '1', '0', NULL),
(233, 74, 3, '0', '0', '0', '0', '0', '0', NULL),
(234, 74, 4, '1', '1', '1', '1', '1', '0', NULL),
(235, 75, 1, '0', '0', '0', '0', '0', '0', NULL),
(236, 75, 2, '1', '0', '1', '1', '1', '0', NULL),
(237, 75, 3, '0', '0', '0', '0', '0', '0', NULL),
(238, 75, 4, '1', '1', '1', '1', '1', '0', NULL),
(239, 77, 1, '0', '0', '0', '0', '0', '0', NULL),
(240, 77, 2, '1', '1', '1', '1', '1', '0', NULL),
(243, 77, 3, '0', '0', '0', '0', '0', '0', NULL),
(244, 77, 4, '1', '1', '1', '1', '1', '1', NULL),
(245, 78, 1, '0', '0', '0', '0', '0', '0', NULL),
(246, 78, 2, '1', '0', '0', '0', '1', '0', NULL),
(247, 78, 3, '0', '0', '0', '0', '0', '0', NULL),
(248, 78, 4, '1', '1', '1', '1', '1', '1', NULL),
(249, 79, 1, '0', '0', '0', '0', '0', '0', NULL),
(250, 79, 2, '1', '1', '1', '1', '1', '0', NULL),
(253, 79, 3, '0', '0', '0', '0', '0', '0', NULL),
(254, 79, 4, '1', '1', '1', '1', '1', '1', NULL),
(255, 50, 3, '0', '0', '0', '0', '0', '0', NULL),
(256, 80, 1, '0', '0', '0', '0', '0', '0', NULL),
(257, 80, 2, '1', '1', '1', '1', '1', '0', NULL),
(258, 80, 3, '0', '0', '0', '0', '0', '0', NULL),
(259, 80, 4, '1', '1', '1', '1', '1', '1', NULL),
(260, 81, 1, '0', '0', '0', '0', '0', '0', NULL),
(261, 81, 2, '1', '1', '1', '1', '1', '0', NULL),
(262, 81, 3, '0', '0', '0', '0', '0', '0', NULL),
(263, 81, 4, '1', '1', '1', '1', '1', '1', NULL),
(266, 83, 1, '0', '0', '0', '0', '0', '0', NULL),
(267, 83, 2, '0', '0', '0', '0', '0', '0', '0'),
(268, 83, 3, '1', '1', '1', '1', '1', '1', '1'),
(269, 83, 4, '0', '0', '0', '0', '0', '0', '0'),
(270, 84, 1, '0', '0', '0', '0', '0', '0', NULL),
(271, 84, 2, '0', '0', '0', '0', '0', '0', NULL),
(272, 84, 3, '1', '1', '1', '1', '1', '1', NULL),
(273, 84, 4, '0', '0', '0', '0', '0', '0', NULL),
(274, 85, 1, '0', '0', '0', '0', '0', '0', NULL),
(275, 85, 2, '0', '0', '0', '0', '0', '0', NULL),
(276, 85, 3, '1', '1', '1', '1', '1', '1', NULL),
(277, 85, 1, '0', '0', '0', '0', '0', '0', NULL),
(278, 86, 1, '0', '0', '0', '0', '0', '0', NULL),
(279, 86, 2, '1', '1', '1', '1', '1', '1', NULL),
(280, 86, 3, '0', '0', '0', '0', '0', '0', NULL),
(281, 86, 3, '1', '1', '1', '1', '1', '1', NULL),
(282, 87, 1, '0', '0', '0', '0', '0', '0', '0'),
(283, 87, 2, '1', '1', '1', '1', '1', '1', '1'),
(284, 87, 3, '0', '0', '0', '0', '0', '0', '0'),
(285, 87, 4, '1', '1', '1', '1', '1', '1', '1'),
(286, 88, 2, '1', '1', '1', '1', '1', '1', '1'),
(287, 88, 4, '1', '1', '1', '1', '1', '1', '1'),
(288, 89, 2, '1', '1', '1', '1', '1', '1', '1'),
(289, 89, 4, '1', '1', '1', '1', '1', '1', '1'),
(290, 90, 1, '0', '0', '0', '0', '0', '0', '0'),
(291, 90, 2, '1', '1', '1', '1', '1', '1', '1'),
(292, 90, 3, '0', '0', '0', '0', '0', '0', '0'),
(293, 90, 4, '1', '1', '1', '1', '1', '0', NULL),
(294, 91, 1, '1', '1', '1', '1', '1', '1', '1'),
(295, 91, 2, '0', '0', '0', '0', '0', '0', '0'),
(296, 91, 3, '0', '0', '0', '0', '0', '0', '0'),
(297, 91, 4, '0', '0', '0', '0', '0', '0', '0'),
(298, 92, 1, '0', '0', '0', '0', '0', '0', '0'),
(299, 92, 2, '1', '1', '1', '1', '1', '1', '1'),
(300, 92, 3, '0', '0', '0', '0', '0', '0', '0'),
(301, 92, 4, '1', '1', '1', '1', '1', '1', '1'),
(302, 88, 1, '0', '0', '0', '0', '0', '0', '0'),
(303, 88, 3, '0', '0', '0', '0', '0', '0', '0'),
(304, 89, 1, '0', '0', '0', '0', '0', '0', '0'),
(305, 89, 3, '0', '0', '0', '0', '0', '0', '0'),
(306, 93, 1, '0', '0', '0', '0', '0', '0', '0'),
(307, 93, 2, '1', '1', '1', '1', '1', '1', '1'),
(308, 93, 3, '1', '0', '0', '0', '1', '0', NULL),
(309, 93, 4, '1', '1', '1', '1', '1', '1', '1'),
(310, 94, 1, '0', '0', '0', '0', '0', '0', '0'),
(311, 94, 2, '1', '1', '1', '1', '1', '1', '1'),
(312, 94, 3, '0', '0', '0', '0', '0', '0', '0'),
(313, 94, 4, '1', '1', '1', '1', '1', '1', '1'),
(314, 95, 1, '0', '0', '0', '0', '0', '0', '0'),
(315, 95, 2, '1', '1', '1', '1', '1', '1', '1'),
(316, 95, 3, '0', '0', '0', '0', '0', '0', '0'),
(317, 95, 4, '1', '1', '1', '1', '1', '1', '1'),
(320, 96, 1, '0', '0', '0', '0', '0', '0', '0'),
(321, 96, 4, '1', '1', '1', '1', '1', '0', NULL),
(322, 96, 2, '1', '1', '1', '1', '1', '1', '1'),
(323, 97, 1, '0', '0', '0', '0', '0', '0', '0'),
(324, 97, 2, '1', '1', '1', '1', '1', '1', '1'),
(325, 97, 3, '1', '0', '0', '0', '1', '1', '1'),
(326, 97, 4, '1', '1', '1', '1', '1', '1', NULL),
(327, 98, 1, '0', '0', '0', '0', '0', '0', '0'),
(328, 98, 2, '0', '0', '0', '0', '0', '0', '0'),
(329, 98, 3, '1', '1', '1', '1', '1', '1', '1'),
(330, 98, 4, '0', '0', '0', '0', '0', '0', '0'),
(331, 99, 1, '0', '0', '0', '0', '0', '0', '0'),
(332, 99, 2, '1', '1', '1', '1', '1', '1', '1'),
(333, 99, 3, '0', '0', '0', '0', '0', '0', '0'),
(334, 99, 4, '1', '1', '1', '1', '1', '1', '1'),
(335, 96, 3, '1', '0', '0', '0', '1', '0', NULL),
(336, 102, 1, '1', '0', '0', '0', '1', '1', '1'),
(337, 102, 2, '0', '0', '0', '0', '0', '0', '0'),
(338, 102, 3, '0', '0', '0', '0', '0', '0', '0'),
(339, 102, 4, '0', '0', '0', '0', '0', '0', '0'),
(340, 103, 1, '1', '1', '1', '1', '1', '1', '1'),
(341, 103, 2, '0', '0', '0', '0', '0', '0', '0'),
(342, 103, 3, '0', '0', '0', '0', '0', '0', '0'),
(343, 103, 4, '0', '0', '0', '0', '0', '0', '0'),
(344, 104, 1, '0', '0', '0', '0', '0', '0', '0'),
(345, 104, 2, '1', '1', '1', '1', '1', '1', '1'),
(346, 104, 3, '0', '0', '0', '0', '0', '0', '0'),
(347, 104, 4, '1', '1', '1', '1', '1', '1', '1');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_personas`
--

CREATE TABLE `tbl_personas` (
  `cod_persona` int(11) NOT NULL,
  `dni_persona` varchar(32) DEFAULT NULL,
  `Nombre` text DEFAULT NULL,
  `Segundo_nombre` text DEFAULT NULL,
  `Primer_apellido` text DEFAULT NULL,
  `Segundo_apellido` text DEFAULT NULL,
  `Cod_nacionalidad` int(60) DEFAULT NULL,
  `direccion_persona` varchar(50) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `Estado_Persona` enum('A','S') NOT NULL COMMENT 'A= ACTIVO, S=SUSPENDIDO',
  `cod_tipo_persona` int(11) DEFAULT NULL,
  `cod_departamento` int(11) DEFAULT NULL,
  `cod_municipio` int(11) DEFAULT NULL,
  `cod_genero` int(11) DEFAULT NULL,
  `principal` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_personas`
--

INSERT INTO `tbl_personas` (`cod_persona`, `dni_persona`, `Nombre`, `Segundo_nombre`, `Primer_apellido`, `Segundo_apellido`, `Cod_nacionalidad`, `direccion_persona`, `fecha_nacimiento`, `Estado_Persona`, `cod_tipo_persona`, `cod_departamento`, `cod_municipio`, `cod_genero`, `principal`) VALUES
(1, '0801199720553', 'ARIEL ', NULL, 'ANDINO', NULL, 0, NULL, '2024-10-08', 'A', 2, 17, NULL, 1, 0),
(2, '0801200005494', 'GENESIS', '', 'CRUZ', '', 0, 'David Betancourt', '2000-06-14', 'A', 2, 1, 2, 1, 1),
(3, '0801199720553', 'GEOVANNY', NULL, NULL, 'ANDINO', 1, '2asd', '2024-10-08', 'A', NULL, 2, 2, 1, 0),
(128, '0801200005494', 'JASON', 'JHAIR', 'PERDOMO', 'CRUZ', 0, 'Arcieri', '2000-02-14', 'A', 1, 16, 118, 1, 1),
(129, '12345678', 'MICHELLE', 'ABIGAIL', 'TORRES', 'MELENDEZ', 0, NULL, NULL, 'A', 2, NULL, NULL, NULL, 0),
(130, '1478523691472', 'VALERIA', 'MARIA', 'CRUZ', 'PERDOMO', 0, NULL, '2010-11-03', 'A', 1, 8, NULL, 2, 0),
(131, '3698521473692', 'SONIA', 'GLADIS', 'MEJIA', 'HERNANDEZ', 0, NULL, NULL, 'A', 1, 8, NULL, 2, 0),
(132, '9512368742369', 'KAREN', 'JOHANA', 'GALINDO', 'FUNES', 0, NULL, NULL, 'A', NULL, 8, NULL, 2, 0),
(133, '5877824242', 'DAVID', 'JOSUE', 'GOMEZ', 'ESTRADA', 0, NULL, NULL, 'A', NULL, 8, NULL, 1, 0),
(134, '553453767', 'YAHAIRA', 'INEZ', 'FLORES', 'MEJIA', 0, NULL, NULL, 'A', 1, 8, NULL, 2, 0),
(135, '2344565767', 'CARLOS', 'ANDRES', 'MENJIVAR', 'RODRIGUEZ', 0, NULL, NULL, 'A', NULL, 8, NULL, 1, 0),
(136, '83115445', 'ANA', 'MARIA', 'GONZALEZ', 'LOPEZ', 0, NULL, NULL, 'A', 1, 8, NULL, 2, 0),
(137, '871555655', 'CARLOS', 'EDUARDO', 'PEREZ', 'SANCHEZ', 0, NULL, NULL, 'A', 1, NULL, NULL, NULL, 0),
(138, '9985562312322', 'LAURA', 'ISABEL', 'FERNANDEZ', 'RAMIREZ', 0, NULL, NULL, 'A', 1, NULL, NULL, NULL, 0),
(139, '2215585485', 'JOSE', 'LUI', 'MARTINEZ', 'TORRES', 0, NULL, NULL, 'A', 1, NULL, NULL, NULL, 0),
(140, '0801200209345', 'KEVIN', 'STEVEN', 'SAUCEDA', 'FLORES', 0, 'COLONIA POLICARPO PAZ GARCIA', '2002-02-22', 'A', 1, 16, 264, 1, 0),
(141, '7779715116123', 'MARIA', 'ELENA', 'HERRERA', 'VARGAS', NULL, NULL, NULL, 'A', 1, NULL, NULL, NULL, 0),
(142, '255466898', 'JUAN', 'PABLO', 'RODRIGUEZ', 'GUTIERREZ', 0, NULL, NULL, 'A', 1, NULL, NULL, 1, 0),
(143, '0801200303929', 'Gabriel', 'MICHELLE', 'Amador', 'PONCE', 0, 'COL.HATO DE ENMEDIO', '2017-03-17', 'A', 1, 10, 143, 1, 0),
(144, '9985564213256', 'ANDREA', 'SOFÍA', 'MORALES', 'CASTILLO', 0, NULL, NULL, 'A', 1, NULL, NULL, 2, 0),
(145, '145787797', 'LUIS', 'FERNANDO', 'REYES', 'AGUIRRE', 0, NULL, NULL, 'A', 1, NULL, NULL, 1, 0),
(146, '5522454879', 'CAMILA', 'ALEJANDRA', 'RÍOS', 'DOMÍNGUES', 0, NULL, NULL, 'A', 1, NULL, NULL, 2, 0),
(147, '0801201055698', 'MAYNOR', 'JAVIER', 'ORELLANA', 'CRUZ', 0, 'COL. BELLA VISTA', '2010-11-01', 'A', 1, 8, 109, 1, 0),
(148, '0801201266325', 'MIRNA', 'ALEJANDRA', 'LOPEZ', 'ORTIZ', 0, 'RES.HONDURAS', '2012-07-24', 'A', 1, 8, 109, 2, 0),
(149, '0801201200487', 'JOSE', 'MANUEL', 'GUTIERREZ', 'FLORES', 0, 'RES.DORADO', '2012-02-14', 'A', 1, 8, 109, 1, 0),
(176, NULL, 'AXEL', NULL, 'FLORES', NULL, NULL, NULL, NULL, 'A', 1, NULL, NULL, NULL, 0),
(177, NULL, 'ODALIS', NULL, 'GARMENDIA', NULL, NULL, NULL, NULL, 'A', 1, NULL, NULL, NULL, 0),
(186, '0801200355896', 'SAMANTA', 'JOHANA', 'CASCO', 'ORTIZ', 0, 'EL NARANJAL', '2003-06-10', 'A', NULL, 8, 109, 2, NULL),
(187, '0801200077654', 'MANUEL', 'ANTONIO', 'RODRIGUEZ', 'YUNEZ', 0, 'COL.MIRAFLORES', '2000-07-12', 'A', NULL, 8, 109, 1, NULL),
(188, NULL, 'ANDRE', NULL, 'CRUZ', NULL, NULL, NULL, NULL, 'A', 1, NULL, NULL, NULL, 0),
(189, '0801200104965', 'DREW', 'ISAÍ', 'SS', 'ORDOÑEZ', 0, 'RES. ALEMAN', '2001-01-25', 'A', 1, 8, 109, 1, 0),
(190, NULL, 'KEVIN', NULL, 'SAUCEDA', NULL, NULL, NULL, NULL, 'A', 1, NULL, NULL, NULL, 0),
(191, NULL, 'JASON ', NULL, 'PERDOMO', NULL, NULL, NULL, NULL, 'A', 1, NULL, NULL, NULL, 0),
(192, NULL, 'JUAN', NULL, 'PEREZ', NULL, NULL, NULL, NULL, 'A', 1, NULL, NULL, NULL, 0),
(194, '0801199720550', 'ARIEL', 'GEOVANNY', 'CHINCHILLA', 'CHINCHILLA', 0, 'CASA', '1997-06-13', 'A', NULL, 8, 109, 1, 0),
(195, '2342343512323', 'MARIO', 'ENRIQUE', 'QUINTANILLA', 'CRUZ', 0, NULL, NULL, 'A', 2, NULL, NULL, 1, 0),
(199, '1234567890', 'John', 'Doe', 'Smith', 'Johnson', 0, 'Calle 123, Buenos Aires', '1990-01-01', 'A', 1, 1, 1, 1, 0),
(200, '0801200209344', 'AD', 'ADAD', 'ADAD', 'ADDA', 0, 'LA QUEZADA ', '2024-11-04', 'A', 1, 9, 140, 1, 0),
(201, '0801200209349', 'KEVIN', 'STEVEN', 'SAUCEDA', 'FLORES', 0, 'UNAH', '2000-07-05', 'A', 1, 1, 4, 1, 0),
(202, '0801200233333', 'KEVIN', 'STEVEN', 'SAUCEDA', 'FLORES', 0, 'UNAH', '2002-05-22', 'A', 1, 12, 173, 1, 0),
(203, '0801200206885', 'ANDREA', 'SABINE', 'LAINEZ', 'ESCOTO', 0, 'CARRIZAL', '2002-04-10', 'A', 1, 8, 114, 2, 0),
(204, '0801200200120', 'SAUL', 'ISAIAS', 'PERDOMO', 'GARAY', 0, 'DFSDDFSDFSD', '2002-07-27', 'A', 1, 8, 109, 1, 0),
(205, '0801200203455', 'KEVIN', 'STEVEN', 'SAUCEDA', 'FLORES', 0, 'UNAH', '2002-05-22', 'A', 1, 2, 13, 1, 0),
(206, '0801200274734', 'ANDREA', 'SABINE', 'LAINEZ', 'ESCOTO', 0, 'CARRIZAL', '2002-05-22', 'A', 1, 12, 175, 1, 0),
(207, '0801200205456', 'ANDREA', 'SABINE', 'LAINEZ', 'ESCOTO', 0, 'CARRIZAL', '2002-04-22', 'A', 1, 13, 191, 1, 0),
(208, '0801200209888', 'KEVIN', 'STEVEN', 'SAUCEDA', 'FLORES', 0, 'UNAH', '2002-05-22', 'A', 1, 14, 222, 1, 0),
(209, NULL, 'KEVIN', NULL, 'SAUCEDA', NULL, NULL, NULL, NULL, 'A', 2, NULL, NULL, NULL, 0),
(210, '0801200209666', 'KEVIN', 'STEVEN', 'SAUCEDA', 'FLORES', 0, 'UNAH', '2002-05-22', 'A', 1, 12, 170, 1, 0),
(212, '0801199720522', 'ARIEL', 'ARIEL GEOVANNY', 'ANDINO', 'CHINCHILLA', 0, 'COL. KENNEDY, BL 2, CASA 3844, GRUPO 21', '1997-06-13', 'A', 1, 16, 263, 1, 0),
(213, '0102939382821', 'GENESIS', 'ARIEL GEOVANNY', 'CRUZ', 'CHINCHILLA', 0, 'COL. KENNEDY, BL 2, CASA 3844, GRUPO 21', '2002-11-12', 'A', 1, 11, 160, 2, 0),
(214, '0801200100250', 'MARIO', 'ALEXIS', 'HERNANDEZ', 'MENDOZA', 0, 'COLONIA BELLA VISTA, BARIRIO LAS CRUCITAS', '1998-05-28', 'A', 1, 8, 109, 1, 0),
(218, NULL, 'ASDAS', NULL, 'ASDASD', NULL, NULL, NULL, NULL, 'A', 1, NULL, NULL, NULL, 0),
(219, '0801112334242', 'HOLA', NULL, 'MUNDO', NULL, 0, 'ASDASDASDA', '1993-02-25', 'A', 1, 8, 120, 1, 0),
(220, NULL, 'JHANN CARLO', NULL, 'PÉREZ AGUILAR', NULL, NULL, NULL, NULL, 'A', 1, NULL, NULL, NULL, 0),
(221, '0101200000413', 'JHANN CARLO', 'JHANN CARLO', 'PEREZ', 'AGUILAR', 0, 'TEGUCIGALPA, COL, KENNEDY', '2000-06-29', 'A', 1, 12, 170, 1, 0),
(223, '0801112334222', 'ASD', 'ASD', 'ASD', 'ASD', 69, 'COL. KENNEDY, BL 2, CASA 3844, GRUPO 21', '2024-12-03', 'A', 1, 8, 115, 1, 0),
(224, '0801112334223', 'BVBV', 'VBVB', 'VBVB', 'VBVB', 69, 'COL. KENNEDY, BL 2, CASA 3844, GRUPO 21', '2024-12-02', 'A', 1, 8, 126, 1, 0),
(225, '0801112334224', 'ASD', 'ASD', 'ASD', 'ASD', 69, 'COL. KENNEDY, BL 2, CASA 3844, GRUPO 21', '2024-12-14', 'A', 1, 8, 126, 1, 0),
(227, '0801112334233', 'ASD', 'ASD', 'ASD', 'ASD', 69, 'COL. KENNEDY, BL 2, CASA 3844, GRUPO 21', '2024-12-11', 'A', 1, 14, 224, 1, 0),
(228, '0801199720544', 'ASD', 'ASD', 'ASD', 'ASD', 69, 'COL. KENNEDY, BL 2, CASA 3844, GRUPO 21', '2024-12-06', 'A', 1, 13, 196, 1, 0),
(229, '0801199766666', 'ASD', 'DDDD', 'DDD', 'DDD', 69, 'COL. KENNEDY, BL 2, CASA 3844, GRUPO 21', '2024-12-13', 'A', 1, 16, 266, 1, 0),
(230, '0801112334256', 'ASD', 'FF', 'FFFF', 'DF', 69, 'COL. KENNEDY, BL 2, CASA 3844, GRUPO 21', '2024-12-06', 'A', 1, 14, 221, 1, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_ponderaciones`
--

CREATE TABLE `tbl_ponderaciones` (
  `Cod_ponderacion` int(11) NOT NULL,
  `Descripcion_ponderacion` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_ponderaciones`
--

INSERT INTO `tbl_ponderaciones` (`Cod_ponderacion`, `Descripcion_ponderacion`) VALUES
(1, 'ACTIVIDADES DE AULA'),
(2, 'ACTIVIDADES EXTRA AULA'),
(3, 'VALORES Y ACTITUDES'),
(4, 'EXPRESIONES ARTÍSTICAS, DEPORTIVAS Y HUMANÍSTICAS'),
(5, 'EXAMEN PRÁCTICO O TEORICO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_ponderaciones_ciclos`
--

CREATE TABLE `tbl_ponderaciones_ciclos` (
  `Cod_ponderacion_ciclo` int(11) NOT NULL,
  `Cod_ponderacion` int(11) NOT NULL,
  `Cod_ciclo` int(11) NOT NULL,
  `Valor` decimal(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_ponderaciones_ciclos`
--

INSERT INTO `tbl_ponderaciones_ciclos` (`Cod_ponderacion_ciclo`, `Cod_ponderacion`, `Cod_ciclo`, `Valor`) VALUES
(1, 1, 1, 40.00),
(2, 2, 1, 20.00),
(3, 3, 1, 10.00),
(4, 4, 1, 5.00),
(5, 5, 1, 25.00),
(6, 1, 2, 35.00),
(7, 2, 2, 20.00),
(8, 3, 2, 10.00),
(9, 4, 2, 5.00),
(10, 5, 2, 30.00),
(11, 1, 3, 30.00),
(12, 2, 3, 20.00),
(13, 3, 3, 10.00),
(14, 4, 3, 5.00),
(15, 5, 3, 35.00),
(16, 1, 4, 25.00),
(17, 2, 4, 15.00),
(18, 3, 4, 10.00),
(19, 4, 4, 5.00),
(20, 5, 4, 45.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_procedencia_persona`
--

CREATE TABLE `tbl_procedencia_persona` (
  `Cod_procedencia_persona` int(11) NOT NULL,
  `Cod_procedencia` int(11) NOT NULL,
  `Cod_persona` int(11) NOT NULL,
  `Anio_procedencia` int(11) NOT NULL,
  `Grado_procedencia` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_profesores`
--

CREATE TABLE `tbl_profesores` (
  `Cod_profesor` int(11) NOT NULL,
  `cod_persona` int(11) NOT NULL,
  `Cod_grado_academico` int(11) NOT NULL,
  `Cod_tipo_contrato` int(11) NOT NULL,
  `Hora_entrada` time NOT NULL,
  `Hora_salida` time NOT NULL,
  `Fecha_ingreso` date NOT NULL,
  `Fecha_fin_contrato` date DEFAULT NULL,
  `Años_experiencia` tinyint(4) NOT NULL,
  `Estado` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_profesores`
--

INSERT INTO `tbl_profesores` (`Cod_profesor`, `cod_persona`, `Cod_grado_academico`, `Cod_tipo_contrato`, `Hora_entrada`, `Hora_salida`, `Fecha_ingreso`, `Fecha_fin_contrato`, `Años_experiencia`, `Estado`) VALUES
(1, 186, 1, 2, '09:00:00', '17:00:00', '2024-11-12', '2024-11-12', 4, 1),
(2, 2, 1, 1, '07:00:00', '16:00:00', '2018-01-30', '2026-11-20', 15, 1),
(3, 132, 1, 2, '08:00:00', '16:00:00', '2024-01-01', '2025-01-01', 6, 1),
(4, 133, 1, 1, '17:51:00', '17:51:00', '2024-10-09', '2024-11-06', 8, 1),
(5, 134, 1, 1, '09:04:00', '18:07:00', '2024-10-09', '2024-11-07', 88, 1),
(6, 135, 1, 1, '00:36:00', '02:36:00', '2024-11-11', '2024-11-12', 22, 1),
(7, 225, 1, 1, '01:22:00', '03:33:00', '2024-12-07', '2025-01-02', 2, 1),
(8, 228, 1, 1, '05:33:00', '17:33:00', '2024-12-07', '2024-12-27', 3, 1),
(9, 229, 1, 1, '09:37:00', '16:37:00', '2024-12-07', '2025-01-04', 3, 1),
(10, 230, 1, 1, '11:11:00', '12:22:00', '2024-12-07', '2024-12-25', 3, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_profesores_rel_especialidad`
--

CREATE TABLE `tbl_profesores_rel_especialidad` (
  `Cod_profesor_especialidad` int(11) NOT NULL,
  `Profesores_Id_Profesor` int(11) NOT NULL,
  `Especialidad_Id_Especialidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_roles`
--

CREATE TABLE `tbl_roles` (
  `Cod_rol` int(11) NOT NULL,
  `Nom_rol` varchar(255) NOT NULL,
  `Descripcion` enum('P','A','D','M') NOT NULL,
  `Ind_Rol` enum('1','0') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_roles`
--

INSERT INTO `tbl_roles` (`Cod_rol`, `Nom_rol`, `Descripcion`, `Ind_Rol`) VALUES
(1, '', 'P', '1'),
(2, '', 'A', '1'),
(3, '', 'D', '1'),
(4, '', 'M', '1');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_secciones`
--

CREATE TABLE `tbl_secciones` (
  `Cod_secciones` int(11) NOT NULL,
  `Nombre_seccion` varchar(45) NOT NULL,
  `Cod_aula` int(11) NOT NULL,
  `Cod_Profesor` int(11) NOT NULL,
  `Cod_grado` int(11) NOT NULL,
  `Cod_periodo_matricula` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_secciones`
--

INSERT INTO `tbl_secciones` (`Cod_secciones`, `Nombre_seccion`, `Cod_aula`, `Cod_Profesor`, `Cod_grado`, `Cod_periodo_matricula`) VALUES
(2, 'A', 3, 1, 1, 177),
(3, 'B', 4, 2, 2, 179),
(4, 'C', 5, 3, 3, 177),
(5, 'D', 6, 4, 4, 180),
(6, 'E', 7, 3, 2, 177),
(7, 'F', 8, 4, 5, 177);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_secciones_asignaturas`
--

CREATE TABLE `tbl_secciones_asignaturas` (
  `Cod_seccion_asignatura` int(11) NOT NULL,
  `Cod_secciones` int(11) NOT NULL,
  `Hora_inicio` time NOT NULL,
  `Hora_fin` time NOT NULL,
  `Cod_grados_asignaturas` int(11) NOT NULL,
  `Dias_nombres` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_secciones_asignaturas`
--

INSERT INTO `tbl_secciones_asignaturas` (`Cod_seccion_asignatura`, `Cod_secciones`, `Hora_inicio`, `Hora_fin`, `Cod_grados_asignaturas`, `Dias_nombres`) VALUES
(2, 2, '07:00:00', '07:40:00', 3, ', Domingo, Jueves'),
(3, 5, '09:00:00', '09:40:00', 6, ', Lunes, Martes, Miércoles'),
(4, 4, '09:00:00', '09:40:00', 3, ', Viernes'),
(5, 5, '08:00:00', '08:40:00', 4, ', Domingo, Sábado'),
(6, 3, '09:00:00', '09:40:00', 6, ', Lunes'),
(7, 5, '11:00:00', '11:40:00', 2, ', Lunes, Martes, Miércoles, Jueves, Viernes'),
(8, 2, '07:00:00', '07:40:00', 2, ', Lunes, Martes, Miércoles'),
(9, 3, '07:00:00', '07:40:00', 5, ', Jueves'),
(10, 4, '08:00:00', '08:40:00', 2, ', Viernes, Sábado'),
(11, 2, '17:00:00', '17:40:00', 4, 'Sábado, Lunes'),
(12, 3, '08:00:00', '08:40:00', 4, ', Lunes, Martes, Miércoles'),
(13, 4, '09:00:00', '09:40:00', 6, ', Lunes');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_secciones_asignaturas_dias`
--

CREATE TABLE `tbl_secciones_asignaturas_dias` (
  `Cod_secciones_asignaturas_dias` int(11) NOT NULL,
  `Cod_seccion_asignatura` int(11) NOT NULL,
  `Cod_dias` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_secciones_asignaturas_dias`
--

INSERT INTO `tbl_secciones_asignaturas_dias` (`Cod_secciones_asignaturas_dias`, `Cod_seccion_asignatura`, `Cod_dias`) VALUES
(1, 2, 8),
(2, 2, 3),
(3, 3, 6),
(4, 3, 2),
(5, 3, 7),
(6, 4, 4),
(7, 5, 8),
(8, 5, 5),
(9, 6, 6),
(10, 7, 6),
(11, 7, 2),
(12, 7, 7),
(13, 7, 3),
(14, 7, 4),
(15, 8, 6),
(16, 8, 2),
(17, 3, 7),
(18, 9, 3),
(19, 10, 4),
(20, 10, 5),
(22, 11, 5),
(23, 11, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_secciones_matricula`
--

CREATE TABLE `tbl_secciones_matricula` (
  `Cod_seccion_matricula` int(11) NOT NULL,
  `Cod_seccion` int(11) NOT NULL,
  `Cod_matricula` int(11) NOT NULL,
  `Cod_persona` int(11) NOT NULL,
  `Cod_grado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_secciones_matricula`
--

INSERT INTO `tbl_secciones_matricula` (`Cod_seccion_matricula`, `Cod_seccion`, `Cod_matricula`, `Cod_persona`, `Cod_grado`) VALUES
(1, 2, 87, 136, 1),
(2, 3, 88, 134, 2),
(3, 6, 89, 135, 2),
(4, 4, 93, 137, 3),
(5, 2, 94, 148, 1),
(6, 3, 95, 147, 2),
(7, 6, 96, 130, 2),
(8, 4, 97, 131, 3),
(9, 7, 98, 149, 5),
(10, 7, 99, 146, 5),
(11, 5, 100, 191, 4),
(12, 4, 101, 145, 3),
(13, 3, 102, 142, 2),
(14, 6, 103, 2, 2),
(15, 2, 104, 145, 1),
(16, 2, 105, 142, 1),
(17, 5, 106, 191, 4),
(18, 6, 107, 146, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_solicitud`
--

CREATE TABLE `tbl_solicitud` (
  `Cod_solicitud` int(11) NOT NULL,
  `Cod_persona` int(11) NOT NULL,
  `Nombre_solicitud` varchar(45) NOT NULL,
  `Fecha_solicitud` date NOT NULL,
  `Hora_Inicio` time(2) NOT NULL,
  `Hora_fin` time(2) NOT NULL,
  `Asunto` varchar(100) NOT NULL,
  `Persona_requerida` varchar(45) NOT NULL,
  `Estado` enum('Finalizada','Pendiente','Cancelada','') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_solicitud`
--

INSERT INTO `tbl_solicitud` (`Cod_solicitud`, `Cod_persona`, `Nombre_solicitud`, `Fecha_solicitud`, `Hora_Inicio`, `Hora_fin`, `Asunto`, `Persona_requerida`, `Estado`) VALUES
(72, 2, 'PRUEBA', '2024-11-23', '20:05:00.00', '23:06:00.00', 'EJEMPLO', 'FUNCIONAMIENTO DE CITA ', 'Finalizada'),
(73, 2, 'METODO DE PAG', '2024-11-22', '01:21:00.00', '02:21:00.00', 'SOBRE PAGO DE MATRICUL', 'DIRECTO', 'Finalizada'),
(74, 143, 'RUNION  ', '2024-11-24', '15:24:00.00', '23:24:00.00', 'DISCUTIR AVANCES  ', 'GABRIEL  ', 'Finalizada'),
(75, 143, 'PROYECTO  ', '2024-11-24', '13:26:00.00', '21:00:00.00', 'DISCUTIR PAGOS  ', 'JUAN MANUEL  ', 'Finalizada'),
(76, 143, 'REUNION DE PROYECTOS  ', '2024-11-26', '19:27:00.00', '23:27:00.00', 'AVANCES DE PROYECTOS  ', 'MARIA JOSE  ', 'Pendiente'),
(77, 143, 'PAGOS  ', '2024-11-25', '13:28:00.00', '14:28:00.00', 'DISCUTIR PAGOS MENSUALES  ', 'MARIA JOSE  ', 'Pendiente'),
(78, 2, 'REUNION  ', '2024-11-22', '22:29:00.00', '23:29:00.00', 'INFORMATICA  ', 'GERMAN EDGARDO  ', 'Finalizada'),
(79, 143, 'METODO DE PAGO', '2024-11-22', '02:37:00.00', '10:37:00.00', 'SOBRE PAGO DE MATRICULA ', 'DIRECTOR ', 'Finalizada'),
(80, 2, 'CITA NUEVA', '2024-11-21', '22:38:00.00', '23:39:00.00', 'EJEMPLO', 'MARIA', 'Finalizada'),
(83, 186, 'METODO DE PAGO ', '2024-11-22', '02:53:00.00', '23:12:00.00', 'SOBRE PAGO DE MATRICULA ', 'DIRECTOR ', 'Finalizada'),
(84, 186, 'METODO DE PAGOS ', '2024-11-30', '02:53:00.00', '05:59:00.00', 'SOBRE PAGO DE MATRICULASS ', 'DIRECTORS ', 'Pendiente'),
(85, 143, 'METODO DE PAGOS', '2024-11-21', '02:04:00.00', '04:33:00.00', 'SOBRE PAGO DE MATRICULA ', 'DIRECTOR ', 'Finalizada'),
(86, 143, 'METODO DE PAGOS ', '2024-11-19', '03:04:00.00', '09:04:00.00', 'SOBRE PAGO DE MATRICULA ', 'DIRECTOR ', 'Cancelada'),
(89, 143, 'INFORMATICA ADMINISTRATIVAS', '2024-11-21', '01:41:00.00', '12:41:00.00', 'SOBRE PAGO DE MATRICULA', 'DIRECTOR', 'Finalizada'),
(91, 186, 'EJEMPLO', '2024-11-24', '12:07:00.00', '16:07:00.00', 'PRUEBA ', 'HOLA MUNDO ', 'Finalizada'),
(92, 186, 'NUEVA CITA  ', '2024-11-23', '04:37:00.00', '23:12:00.00', 'EJEMPLOS ', 'JUAN  ', 'Finalizada'),
(93, 186, 'REUNION ', '2024-11-14', '03:46:00.00', '06:46:00.00', 'PROYECTOS ', 'GABRIEL MESSI ', 'Finalizada'),
(95, 140, 'BIENVENIDO A MAGICEVENTS ', '2024-11-25', '17:00:00.00', '18:00:00.00', 'MAGICEVENTS ', 'JEFFERSON GUTIERRITOS ', 'Pendiente'),
(96, 221, 'NUEVA CITA ', '2024-11-25', '07:49:00.00', '20:50:00.00', 'AVANCES EN PROYECTO DE GESTION DE PADRES ', 'MESSI ', 'Pendiente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_tipo_contacto`
--

CREATE TABLE `tbl_tipo_contacto` (
  `Cod_tipo_contacto` int(11) NOT NULL,
  `tipo_contacto` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_tipo_contacto`
--

INSERT INTO `tbl_tipo_contacto` (`Cod_tipo_contacto`, `tipo_contacto`) VALUES
(1, 'Email'),
(2, 'Teléfono movil'),
(3, 'Teléfono fijo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_tipo_contrato`
--

CREATE TABLE `tbl_tipo_contrato` (
  `Cod_tipo_contrato` int(11) NOT NULL,
  `Descripcion` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_tipo_contrato`
--

INSERT INTO `tbl_tipo_contrato` (`Cod_tipo_contrato`, `Descripcion`) VALUES
(1, 'TIEMPO COMPLETO'),
(2, 'MEDIO TIEMPO'),
(3, 'Por Hora');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_tipo_matricula`
--

CREATE TABLE `tbl_tipo_matricula` (
  `Cod_tipo_matricula` int(11) NOT NULL,
  `Tipo` enum('Estandar','Extraordinaria','Beca','Otras') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_tipo_matricula`
--

INSERT INTO `tbl_tipo_matricula` (`Cod_tipo_matricula`, `Tipo`) VALUES
(101, 'Extraordinaria'),
(102, 'Beca'),
(118, 'Estandar'),
(144, 'Otras');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_tipo_persona`
--

CREATE TABLE `tbl_tipo_persona` (
  `Cod_tipo_persona` int(11) NOT NULL,
  `Tipo` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_tipo_persona`
--

INSERT INTO `tbl_tipo_persona` (`Cod_tipo_persona`, `Tipo`) VALUES
(1, 'ESTUDIANTE'),
(2, 'PADRE'),
(3, 'PERSONAL DOCENTE'),
(4, 'PERSONAL ADMINISTRATIVO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_tipo_relacion`
--

CREATE TABLE `tbl_tipo_relacion` (
  `Cod_tipo_relacion` int(11) NOT NULL,
  `tipo_relacion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tbl_tipo_relacion`
--

INSERT INTO `tbl_tipo_relacion` (`Cod_tipo_relacion`, `tipo_relacion`) VALUES
(1, 'HIJO'),
(2, 'HIJA'),
(3, 'PADRE'),
(4, 'MADRE'),
(5, 'TUTOR(A)'),
(6, 'ABUELO(A)'),
(7, 'TÍO(A)');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_usuarios`
--

CREATE TABLE `tbl_usuarios` (
  `cod_usuario` int(11) NOT NULL,
  `nombre_usuario` varchar(32) DEFAULT NULL,
  `correo_usuario` varchar(50) NOT NULL,
  `contraseña_usuario` varchar(100) NOT NULL,
  `token_usuario` varchar(500) DEFAULT NULL,
  `confirmacion_email` double DEFAULT 0,
  `cod_persona` int(11) DEFAULT NULL,
  `Cod_rol` int(11) NOT NULL,
  `Cod_estado_usuario` int(11) DEFAULT 1,
  `Fecha_ultima_conexion` datetime DEFAULT NULL,
  `Primer_ingreso` datetime DEFAULT NULL,
  `Fecha_vencimiento` date DEFAULT NULL,
  `two_factor_code` varchar(32) DEFAULT NULL,
  `is_two_factor_enabled` tinyint(1) DEFAULT 0,
  `otp_verified` tinyint(1) DEFAULT 0,
  `ultima_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `datos_completados` tinyint(1) DEFAULT 0,
  `password_temporal` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_usuarios`
--

INSERT INTO `tbl_usuarios` (`cod_usuario`, `nombre_usuario`, `correo_usuario`, `contraseña_usuario`, `token_usuario`, `confirmacion_email`, `cod_persona`, `Cod_rol`, `Cod_estado_usuario`, `Fecha_ultima_conexion`, `Primer_ingreso`, `Fecha_vencimiento`, `two_factor_code`, `is_two_factor_enabled`, `otp_verified`, `ultima_actualizacion`, `datos_completados`, `password_temporal`) VALUES
(151, 'kevsauceda00', 'kevsauceda00@gmail.com', '$2b$10$WNU.2tgzWveb7TbCBk0oYuDWRaqckWrYwqK5h9x0TFSR66i4Ujhr2', '1ib5s296cb012tln77so', 1, 140, 4, 1, '2024-11-24 18:23:17', '2024-10-24 20:43:33', '2036-11-24', 'KJNEERRSENQUASBOIRZVUR2GGNQUSWRO', 0, 0, '2024-11-25 08:43:20', 1, 0),
(154, 'gabrielamador469', 'gabrielamador469@gmail.com', '$2b$10$VAsUKA7YbLeI3mTUhejyfeBYsAFa1VqqGdlXFj2cGxIyodHFCuF.i', '1ib8buo1d1aq7qnjsnm8', 1, 143, 4, 1, '2024-11-25 01:38:30', '2024-10-26 23:13:26', '2036-11-25', NULL, 0, 0, '2024-11-25 08:43:20', 1, 0),
(187, 'Axel', 'Axel@gmail.com', '$2b$10$fCAlAbsNZ6vItrD5p.fwUuwG076KRUSIidR/x/2Ev7WxvodS0s5U6', NULL, 1, 176, 1, 1, '2024-10-30 15:14:04', '2024-10-30 15:14:04', '2036-10-30', NULL, 0, 0, '2024-11-25 08:43:20', 0, 0),
(188, 'odalisgarmendia1996', 'odalisgarmendia1996@gmail.com', '$2b$10$mRwv8U6kKWJ7z8VP3WlV8eGt.PRV83AJcuA4d/tHv6R/AsSTYxKve', NULL, 1, 177, 1, 1, '2024-10-30 20:20:27', '2024-10-30 20:20:27', '2036-10-30', NULL, 0, 0, '2024-11-25 08:43:20', 0, 0),
(197, 'cascosamprueba', 'cascosamprueba@gmail.com', '$2b$10$K7Mj35vF9GfyqtM/eEZAL.HShbCB1kz2JMvm.lHxVAtVbYP95wJau', NULL, 1, 186, 3, 1, '2024-12-01 18:30:31', '2024-11-03 18:09:49', '2036-12-01', NULL, 0, 0, '2024-12-02 01:11:03', 1, 0),
(198, 'manuyunez19003', 'manuyunez19003@gmail.com', '$2b$10$/7hkkHBlySwe9/2tGvXIK.TEBDKY0AXVy69jnNlGmXYP4ESzcEZU.', NULL, 1, 187, 2, 1, '2024-12-01 19:11:14', '2024-11-03 19:29:31', '2036-12-01', NULL, 0, 0, '2024-12-02 01:11:14', 1, 0),
(200, 'drew._.dll', 'andre.isai.cruz@gmail.com', '$2b$10$fZyRUHkfMnWEOY9Dcqm3quWUxfuvkJUmTIMKcLlu5HR54bPKdQLaq', NULL, 1, 189, 4, 1, '2024-11-20 11:54:08', '2024-11-05 20:09:11', '2036-11-20', NULL, 0, 0, '2024-11-25 08:43:20', 1, 0),
(202, 'cruz.jasonperdomo', 'cruz.jasonperdomo@gmail.com', '$2b$10$NlJxxmbfiMZNQ8yB5bF1NO5w6yM0/jwu4T1xHiP26Gmsm36m2bMuK', NULL, 1, 191, 4, 1, '2024-11-24 20:38:51', '2024-11-05 21:48:17', '2036-11-24', NULL, 0, 0, '2024-11-25 08:43:20', 1, 0),
(205, 'arielo_o67', 'arielo_o67@hotmail.es', '$2b$10$aC1f5pZ2HBSSGLELH1mZzeadxN/M2LIlKwh/.9QqwhBmpH.E4bDuK', NULL, 1, 194, 4, 1, '2024-12-13 20:18:42', '2024-11-10 22:53:28', '2036-12-13', NULL, 0, 0, '2024-12-14 02:18:52', 1, 0),
(213, 'andreasabilainez2002', 'andreasabilainez2002@gmail.com', '$2b$10$dSIUg5XOZeF7HvcCp54TOOTfl1BZs36M3fiVmBXJWovc6XKSTvG4u', NULL, 1, 203, 3, 1, '2024-11-19 15:38:10', '2024-11-19 16:32:48', '2036-11-19', NULL, 0, 0, '2024-11-25 08:43:20', 1, 0),
(214, 'isaiasgaray2763', 'isaiasgaray2763@gmail.com', '$2b$10$BiyvUfmKmQLZyWYNkYBuN.gnONf1Um2wdGC/Zmi0SsBFF7fPQcPne', NULL, 1, 204, 4, 1, '2024-11-24 17:08:40', '2024-11-19 20:39:52', '2036-11-24', NULL, 0, 0, '2024-11-25 08:43:20', 1, 0),
(219, 'kevinsaueflo05', 'kevinsaueflo05@gmail.com', '$2b$10$NLnjXJOTnNw.OGcvKv2Pd.Z1PSEnnMVcuhqDw/Drvy0oib92ka4V.', '1id68dbq4u9crnot9rgg', 0, 209, 1, 2, NULL, NULL, NULL, NULL, 0, 0, '2024-11-25 08:43:20', 0, 0),
(220, 'kevinsauceflo05', 'kevinsauceflo05@gmail.com', '$2b$10$iM8z.zVTDgHcPYVUkmFbhuZiH5CNDgGqFdmj.Ef01f/x85lcpfjEi', NULL, 1, 210, 1, 1, '2024-11-20 20:23:47', '2024-11-20 20:23:47', '2036-11-20', NULL, 0, 0, '2024-11-25 08:43:20', 1, 0),
(221, 'alexa.cruz.1221', 'alexa.cruz.1221@gmail.com', '$2b$10$n.pW6meo4A6rctZ1s4TkvuTT.HYElmEF9Ui9JSli5J4Kie6xzly.G', NULL, 1, 2, 3, 1, '2024-12-17 02:22:58', '2024-11-20 23:59:07', '2036-12-17', NULL, 0, 0, '2024-12-17 08:49:14', 1, 0),
(222, 'ariel.andino', 'andinoariel5@gmail.com', '$2b$10$yo414ylJdiNvjhR4A00xLOqnFI2LqIbW/mnWao5O6A8G4YxArzSQm', NULL, 1, 1, 1, 1, '2024-12-13 20:18:14', '2024-11-21 23:34:05', '2036-12-13', NULL, 0, 0, '2024-12-14 02:18:39', 1, 0),
(223, 'alexacruz.1221', 'ALEXACRUZ.1221@GMAIL.COM', '$2b$10$Ub4zpilnSynjFVQFYyFDle8swML496RcJasKXDPXhj2HbmcYj48qS', NULL, 1, 213, 3, 1, '2024-11-21 23:40:17', '2024-11-21 23:37:47', '2036-11-21', NULL, 0, 0, '2024-11-25 08:43:20', 1, 0),
(224, 'mariohernandez28051998', 'mariohernandez28051998@gmail.com', '$2b$10$OZLUCkNztt53M2kHPNhLwOGfgGUj0IGXqwnw5t6nM4sk4ykDN6dbK', NULL, 1, 214, 2, 1, '2024-11-24 23:13:46', '2024-11-21 22:39:02', '2036-11-24', NULL, 0, 0, '2024-11-25 08:43:20', 1, 0),
(225, 'isaiasgaray6327', 'isaiasgaray6327@gmail.com', '$2b$10$W9I3mDhVSQcryudkca1K/uZbCg9L00/XOLlmGVhtO7jIOz6aC/Ffu', NULL, 1, 218, 1, 1, '2024-11-23 18:32:59', '2024-11-23 18:32:59', '2036-11-23', NULL, 0, 0, '2024-11-25 08:43:20', 0, 0),
(226, 'jomlususpo', 'jomlususpo@gufum.com', '$2b$10$l5ej0fuOGRS4Mv.Zo4E2A.VKgCcrPm.wb6Jr2/juOsC59bVE5yMY2', NULL, 1, 219, 3, 1, '2024-11-24 15:20:33', '2024-11-24 15:20:33', NULL, NULL, 0, 0, '2024-11-25 08:43:20', 1, 1),
(227, 'jhanncarlo1999', 'jhanncarlo1999@gmail.com', '$2b$10$m4oiYkacoes7dbD7V7V0EO6WseFKiL95eUmKCc.ge72DFtCwnIaKe', '1idgea79r8ha5bhsobao', 0, 220, 1, 1, NULL, NULL, NULL, NULL, 0, 0, '2024-11-25 08:43:20', 0, 0),
(228, 'jhannc110', 'jhannc110@gmail.com', '$2b$10$Kik4y7RvB2UnPD1eqYd8teNM1cLg3fhICzXenHTdZ4xUukAW0wlfa', NULL, 1, 221, 1, 1, '2024-11-25 00:49:41', '2024-11-24 19:34:12', '2036-11-25', NULL, 0, 0, '2024-11-25 08:43:20', 1, 0),
(229, 'locomundo', 'locomundo@hotmail.es', '$2b$10$akoWGdmSn0LaScDueMt4XezvfmuATXKRqLXz5DVXEvfPsN3v7n1Sa', NULL, 1, 224, 3, 3, '2024-12-06 19:17:13', '2024-12-06 19:17:13', NULL, NULL, 0, 0, '2024-12-07 01:21:45', 1, 1),
(230, 'locods', 'locods@unah.hn', '$2b$10$hZdOP0HvKvZ7BFvslSItceUGQuLgqVnQalXhyFEfw4mPqGCwhTUBq', NULL, 1, 225, 3, 1, '2024-12-06 19:22:44', '2024-12-06 19:22:44', NULL, NULL, 0, 0, '2024-12-07 01:22:44', 1, 1),
(231, 'locosdemil', 'locosdemil@gmail.com', '$2b$10$VAm7RQPW9XjwfrZLxGSAVuQAxgHd/AzMee0Q/IYYSP1SpBrFxpGGK', NULL, 1, 226, 3, 1, '2024-12-06 19:25:54', '2024-12-06 19:25:54', NULL, NULL, 0, 0, '2024-12-07 01:25:54', 1, 1),
(232, 'locos', 'locos@unah.hn', '$2b$10$Nr1U6b/Vi3zOoWQyLnwn6OgA5WwDGuyui.qOH0xu/4zdYe7.N3aU6', NULL, 1, 227, 3, 1, '2024-12-06 19:28:06', '2024-12-06 19:28:06', NULL, NULL, 0, 0, '2024-12-07 01:28:06', 1, 1),
(233, 'locosgdgfd', 'locosgdgfd@unah.hn', '$2b$10$dOI.YEJLknuFzSya/2PHPOtNAeUHUC762zS/nXM1ShharQGk0mHhS', NULL, 1, 228, 3, 1, '2024-12-06 19:33:27', '2024-12-06 19:33:27', NULL, NULL, 0, 0, '2024-12-07 01:33:27', 1, 1),
(234, 'asdasdasd', 'asdasdasd@unah.hn', '$2b$10$8iVq.EQke2NUrDRxoawX/uT2gw16yDVOkC8WOIsOKLxgynoBSGBSa', NULL, 1, 229, 3, 1, '2024-12-06 19:38:06', '2024-12-06 19:38:06', NULL, NULL, 0, 0, '2024-12-07 01:38:06', 1, 1),
(235, 'asdasdasdasda', 'asdasdasdasda@unah.hn', '$2b$10$Zg0DJwZkDV/KGOQrb/e4ku66f8U/ElWqgeu9g0fgsQQ6cRbLeRR4G', NULL, 1, 230, 3, 1, '2024-12-06 20:06:38', '2024-12-06 20:06:38', NULL, NULL, 0, 0, '2024-12-07 02:06:38', 1, 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `tbl_actividades_academicas`
--
ALTER TABLE `tbl_actividades_academicas`
  ADD PRIMARY KEY (`Cod_actividad_academica`),
  ADD KEY `Cod_profesor` (`Cod_profesor`),
  ADD KEY `Cod_ponderacion_ciclo` (`Cod_ponderacion_ciclo`),
  ADD KEY `Cod_parcial` (`Cod_parcial`),
  ADD KEY `tbl_actividades_academicas_ibfk_4` (`Cod_secciones`);

--
-- Indices de la tabla `tbl_actividades_asignatura`
--
ALTER TABLE `tbl_actividades_asignatura`
  ADD PRIMARY KEY (`Cod_actividad_asignatura`),
  ADD KEY `actividad_asignatura_seccion_asignatura` (`Cod_seccion_asignatura`),
  ADD KEY `actividad_asignatura_actividad_academica` (`Cod_actividad_academica`);

--
-- Indices de la tabla `tbl_actividades_extracurriculares`
--
ALTER TABLE `tbl_actividades_extracurriculares`
  ADD PRIMARY KEY (`Cod_actividades_extracurriculares`),
  ADD KEY `Cod_seccion` (`Cod_seccion`);

--
-- Indices de la tabla `tbl_asignaturas`
--
ALTER TABLE `tbl_asignaturas`
  ADD PRIMARY KEY (`Cod_asignatura`);

--
-- Indices de la tabla `tbl_asistencias`
--
ALTER TABLE `tbl_asistencias`
  ADD PRIMARY KEY (`Cod_asistencias`),
  ADD KEY `Cod_estado_asistencia` (`Cod_estado_asistencia`),
  ADD KEY `Cod_seccion_persona` (`Cod_seccion_matricula`);

--
-- Indices de la tabla `tbl_aula`
--
ALTER TABLE `tbl_aula`
  ADD PRIMARY KEY (`Cod_aula`),
  ADD KEY `Cod_edificio` (`Cod_edificio`);

--
-- Indices de la tabla `tbl_bitacora`
--
ALTER TABLE `tbl_bitacora`
  ADD PRIMARY KEY (`Cod_bitacora`),
  ADD KEY `Cod_usuario` (`Cod_usuario`),
  ADD KEY `Cod_objeto` (`Cod_objeto`);

--
-- Indices de la tabla `tbl_caja`
--
ALTER TABLE `tbl_caja`
  ADD PRIMARY KEY (`Cod_caja`),
  ADD KEY `Cod_concepto` (`Cod_concepto`),
  ADD KEY `Cod_persona` (`Cod_persona`);

--
-- Indices de la tabla `tbl_caja_descuento`
--
ALTER TABLE `tbl_caja_descuento`
  ADD PRIMARY KEY (`Cod_caja_descuento`),
  ADD KEY `Cod_caja` (`Cod_caja`),
  ADD KEY `Cod_descuento` (`Cod_descuento`);

--
-- Indices de la tabla `tbl_catalogo_cuentas`
--
ALTER TABLE `tbl_catalogo_cuentas`
  ADD PRIMARY KEY (`Cod_cuenta`);

--
-- Indices de la tabla `tbl_ciclos`
--
ALTER TABLE `tbl_ciclos`
  ADD PRIMARY KEY (`Cod_ciclo`);

--
-- Indices de la tabla `tbl_concepto_pago`
--
ALTER TABLE `tbl_concepto_pago`
  ADD PRIMARY KEY (`Cod_concepto`);

--
-- Indices de la tabla `tbl_contacto`
--
ALTER TABLE `tbl_contacto`
  ADD PRIMARY KEY (`cod_contacto`),
  ADD KEY `cod_persona` (`cod_persona`),
  ADD KEY `cod_tipo_contacto` (`cod_tipo_contacto`);

--
-- Indices de la tabla `tbl_departamento`
--
ALTER TABLE `tbl_departamento`
  ADD PRIMARY KEY (`Cod_departamento`);

--
-- Indices de la tabla `tbl_descuentos`
--
ALTER TABLE `tbl_descuentos`
  ADD PRIMARY KEY (`Cod_descuento`);

--
-- Indices de la tabla `tbl_dias`
--
ALTER TABLE `tbl_dias`
  ADD PRIMARY KEY (`Cod_dias`);

--
-- Indices de la tabla `tbl_edificio`
--
ALTER TABLE `tbl_edificio`
  ADD PRIMARY KEY (`Cod_edificio`);

--
-- Indices de la tabla `tbl_especialidades`
--
ALTER TABLE `tbl_especialidades`
  ADD PRIMARY KEY (`Cod_Especialidad`);

--
-- Indices de la tabla `tbl_estado_asistencia`
--
ALTER TABLE `tbl_estado_asistencia`
  ADD PRIMARY KEY (`Cod_estado_asistencia`);

--
-- Indices de la tabla `tbl_estado_matricula`
--
ALTER TABLE `tbl_estado_matricula`
  ADD PRIMARY KEY (`Cod_estado_matricula`);

--
-- Indices de la tabla `tbl_estado_nota`
--
ALTER TABLE `tbl_estado_nota`
  ADD PRIMARY KEY (`Cod_estado`);

--
-- Indices de la tabla `tbl_estado_usuario`
--
ALTER TABLE `tbl_estado_usuario`
  ADD PRIMARY KEY (`Cod_estado_usuario`);

--
-- Indices de la tabla `tbl_estructura_familiar`
--
ALTER TABLE `tbl_estructura_familiar`
  ADD PRIMARY KEY (`Cod_genealogia`),
  ADD KEY `cod_persona_padre` (`cod_persona_padre`),
  ADD KEY `cod_persona_estudiante` (`cod_persona_estudiante`),
  ADD KEY `cod_tipo_relacion` (`cod_tipo_relacion`);

--
-- Indices de la tabla `tbl_genero_persona`
--
ALTER TABLE `tbl_genero_persona`
  ADD PRIMARY KEY (`Cod_genero`);

--
-- Indices de la tabla `tbl_grados`
--
ALTER TABLE `tbl_grados`
  ADD PRIMARY KEY (`Cod_grado`),
  ADD KEY `Cod_ciclo` (`Cod_ciclo`);

--
-- Indices de la tabla `tbl_grados_asignaturas`
--
ALTER TABLE `tbl_grados_asignaturas`
  ADD PRIMARY KEY (`Cod_grados_asignaturas`),
  ADD KEY `Cod_grado` (`Cod_grado`),
  ADD KEY `Cod_asignatura` (`Cod_asignatura`);

--
-- Indices de la tabla `tbl_grado_academico`
--
ALTER TABLE `tbl_grado_academico`
  ADD PRIMARY KEY (`Cod_grado_academico`);

--
-- Indices de la tabla `tbl_historiales_academicos`
--
ALTER TABLE `tbl_historiales_academicos`
  ADD PRIMARY KEY (`Cod_historial_academico`),
  ADD KEY `Cod_estado` (`Cod_estado`),
  ADD KEY `Cod_persona` (`Cod_persona`),
  ADD KEY `Cod_Instituto` (`Cod_Instituto`);

--
-- Indices de la tabla `tbl_historiales_asignaturas`
--
ALTER TABLE `tbl_historiales_asignaturas`
  ADD PRIMARY KEY (`Cod_historial_asignatura`),
  ADD KEY `Cod_asignatura` (`Cod_asignatura`),
  ADD KEY `Cod_historial_academico` (`Cod_historial_academico`);

--
-- Indices de la tabla `tbl_historial_pago`
--
ALTER TABLE `tbl_historial_pago`
  ADD PRIMARY KEY (`Cod_historial_pago`),
  ADD KEY `Cod_matricula` (`Cod_matricula`),
  ADD KEY `Cod_caja` (`Cod_caja`),
  ADD KEY `Cod_concepto` (`Cod_concepto`),
  ADD KEY `fk_usuario` (`Cod_usuario`);

--
-- Indices de la tabla `tbl_historial_secciones`
--
ALTER TABLE `tbl_historial_secciones`
  ADD PRIMARY KEY (`Cod_agrupadora`),
  ADD KEY `Cod_periodo_matricula` (`Cod_periodo_matricula`);

--
-- Indices de la tabla `tbl_historico_procedencia`
--
ALTER TABLE `tbl_historico_procedencia`
  ADD PRIMARY KEY (`cod_procedencia`);

--
-- Indices de la tabla `tbl_hist_contraseña`
--
ALTER TABLE `tbl_hist_contraseña`
  ADD PRIMARY KEY (`Cod_hist_contrasena`),
  ADD KEY `Cod_usuario` (`Cod_usuario`);

--
-- Indices de la tabla `tbl_institutos`
--
ALTER TABLE `tbl_institutos`
  ADD PRIMARY KEY (`Cod_Instituto`);

--
-- Indices de la tabla `tbl_libro_diario`
--
ALTER TABLE `tbl_libro_diario`
  ADD PRIMARY KEY (`Cod_libro_diario`),
  ADD KEY `Cod_cuenta` (`Cod_cuenta`);

--
-- Indices de la tabla `tbl_matricula`
--
ALTER TABLE `tbl_matricula`
  ADD PRIMARY KEY (`Cod_matricula`),
  ADD KEY `Cod_caja` (`Cod_caja`),
  ADD KEY `Cod_periodo_matricula` (`Cod_periodo_matricula`),
  ADD KEY `Cod_tipo_matricula` (`Cod_tipo_matricula`),
  ADD KEY `Cod_estado_matricula` (`Cod_estado_matricula`),
  ADD KEY `Cod_genialogia` (`Cod_persona`);

--
-- Indices de la tabla `tbl_municipio`
--
ALTER TABLE `tbl_municipio`
  ADD PRIMARY KEY (`Cod_municipio`),
  ADD KEY `Cod_departamento` (`Cod_departamento`);

--
-- Indices de la tabla `tbl_nacionalidad`
--
ALTER TABLE `tbl_nacionalidad`
  ADD PRIMARY KEY (`Cod_nacionalidad`);

--
-- Indices de la tabla `tbl_notas`
--
ALTER TABLE `tbl_notas`
  ADD PRIMARY KEY (`Cod_nota`),
  ADD KEY `Cod_parcial` (`Cod_parcial`),
  ADD KEY `Cod_estado` (`Cod_estado`),
  ADD KEY `Cod_seccion_persona` (`Cod_seccion_matricula`),
  ADD KEY `Cod_actividad_asignatura` (`Cod_actividad_asignatura`);

--
-- Indices de la tabla `tbl_objetos`
--
ALTER TABLE `tbl_objetos`
  ADD PRIMARY KEY (`Cod_Objeto`);

--
-- Indices de la tabla `tbl_parametros`
--
ALTER TABLE `tbl_parametros`
  ADD PRIMARY KEY (`Cod_parametro`),
  ADD KEY `Cod_usuario` (`Cod_usuario`);

--
-- Indices de la tabla `tbl_parciales`
--
ALTER TABLE `tbl_parciales`
  ADD PRIMARY KEY (`Cod_parcial`);

--
-- Indices de la tabla `tbl_periodo_matricula`
--
ALTER TABLE `tbl_periodo_matricula`
  ADD PRIMARY KEY (`Cod_periodo_matricula`);

--
-- Indices de la tabla `tbl_permisos`
--
ALTER TABLE `tbl_permisos`
  ADD PRIMARY KEY (`Cod_Permiso`),
  ADD KEY `Cod_Objeto` (`Cod_Objeto`),
  ADD KEY `Cod_Rol` (`Cod_Rol`);

--
-- Indices de la tabla `tbl_personas`
--
ALTER TABLE `tbl_personas`
  ADD PRIMARY KEY (`cod_persona`),
  ADD KEY `fk_tipo_persona` (`cod_tipo_persona`),
  ADD KEY `cod_departamento` (`cod_departamento`),
  ADD KEY `cod_genero` (`cod_genero`),
  ADD KEY `Relacion_Personas_Municipios` (`cod_municipio`);

--
-- Indices de la tabla `tbl_ponderaciones`
--
ALTER TABLE `tbl_ponderaciones`
  ADD PRIMARY KEY (`Cod_ponderacion`);

--
-- Indices de la tabla `tbl_ponderaciones_ciclos`
--
ALTER TABLE `tbl_ponderaciones_ciclos`
  ADD PRIMARY KEY (`Cod_ponderacion_ciclo`),
  ADD KEY `Cod_ponderacion` (`Cod_ponderacion`),
  ADD KEY `Cod_ciclo` (`Cod_ciclo`);

--
-- Indices de la tabla `tbl_procedencia_persona`
--
ALTER TABLE `tbl_procedencia_persona`
  ADD PRIMARY KEY (`Cod_procedencia_persona`),
  ADD KEY `Cod_procedencia` (`Cod_procedencia`),
  ADD KEY `Cod_persona` (`Cod_persona`);

--
-- Indices de la tabla `tbl_profesores`
--
ALTER TABLE `tbl_profesores`
  ADD PRIMARY KEY (`Cod_profesor`),
  ADD KEY `Cod_grado_academico` (`Cod_grado_academico`),
  ADD KEY `Cod_tipo_contrato` (`Cod_tipo_contrato`),
  ADD KEY `tbl_profesores_ibfk_1` (`cod_persona`);

--
-- Indices de la tabla `tbl_profesores_rel_especialidad`
--
ALTER TABLE `tbl_profesores_rel_especialidad`
  ADD PRIMARY KEY (`Cod_profesor_especialidad`),
  ADD KEY `Profesores_Id_Profesor` (`Profesores_Id_Profesor`),
  ADD KEY `Especialidad_Id_Especialidad` (`Especialidad_Id_Especialidad`);

--
-- Indices de la tabla `tbl_roles`
--
ALTER TABLE `tbl_roles`
  ADD PRIMARY KEY (`Cod_rol`);

--
-- Indices de la tabla `tbl_secciones`
--
ALTER TABLE `tbl_secciones`
  ADD PRIMARY KEY (`Cod_secciones`),
  ADD KEY `Cod_aula` (`Cod_aula`),
  ADD KEY `Cod_Profesor` (`Cod_Profesor`),
  ADD KEY `Cod_grado` (`Cod_grado`),
  ADD KEY `tbl_secciones_ibfk_4` (`Cod_periodo_matricula`);

--
-- Indices de la tabla `tbl_secciones_asignaturas`
--
ALTER TABLE `tbl_secciones_asignaturas`
  ADD PRIMARY KEY (`Cod_seccion_asignatura`),
  ADD KEY `Cod_secciones` (`Cod_secciones`),
  ADD KEY `Cod_grados_asignaturas` (`Cod_grados_asignaturas`);

--
-- Indices de la tabla `tbl_secciones_asignaturas_dias`
--
ALTER TABLE `tbl_secciones_asignaturas_dias`
  ADD PRIMARY KEY (`Cod_secciones_asignaturas_dias`),
  ADD KEY `Cod_dias` (`Cod_dias`),
  ADD KEY `Cod_seccion_asignatura` (`Cod_seccion_asignatura`);

--
-- Indices de la tabla `tbl_secciones_matricula`
--
ALTER TABLE `tbl_secciones_matricula`
  ADD PRIMARY KEY (`Cod_seccion_matricula`),
  ADD KEY `Cod_seccion` (`Cod_seccion`),
  ADD KEY `Cod_matricula` (`Cod_matricula`),
  ADD KEY `Cod_persona` (`Cod_persona`),
  ADD KEY `Cod_grado` (`Cod_grado`);

--
-- Indices de la tabla `tbl_solicitud`
--
ALTER TABLE `tbl_solicitud`
  ADD PRIMARY KEY (`Cod_solicitud`),
  ADD KEY `Cod_persona` (`Cod_persona`);

--
-- Indices de la tabla `tbl_tipo_contacto`
--
ALTER TABLE `tbl_tipo_contacto`
  ADD PRIMARY KEY (`Cod_tipo_contacto`);

--
-- Indices de la tabla `tbl_tipo_contrato`
--
ALTER TABLE `tbl_tipo_contrato`
  ADD PRIMARY KEY (`Cod_tipo_contrato`);

--
-- Indices de la tabla `tbl_tipo_matricula`
--
ALTER TABLE `tbl_tipo_matricula`
  ADD PRIMARY KEY (`Cod_tipo_matricula`);

--
-- Indices de la tabla `tbl_tipo_persona`
--
ALTER TABLE `tbl_tipo_persona`
  ADD PRIMARY KEY (`Cod_tipo_persona`);

--
-- Indices de la tabla `tbl_tipo_relacion`
--
ALTER TABLE `tbl_tipo_relacion`
  ADD PRIMARY KEY (`Cod_tipo_relacion`);

--
-- Indices de la tabla `tbl_usuarios`
--
ALTER TABLE `tbl_usuarios`
  ADD PRIMARY KEY (`cod_usuario`),
  ADD KEY `fk_cod_Persona` (`cod_persona`),
  ADD KEY `Cod_rol` (`Cod_rol`),
  ADD KEY `Cod_estado_usuario` (`Cod_estado_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `tbl_actividades_academicas`
--
ALTER TABLE `tbl_actividades_academicas`
  MODIFY `Cod_actividad_academica` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=157;

--
-- AUTO_INCREMENT de la tabla `tbl_actividades_asignatura`
--
ALTER TABLE `tbl_actividades_asignatura`
  MODIFY `Cod_actividad_asignatura` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=139;

--
-- AUTO_INCREMENT de la tabla `tbl_actividades_extracurriculares`
--
ALTER TABLE `tbl_actividades_extracurriculares`
  MODIFY `Cod_actividades_extracurriculares` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tbl_asignaturas`
--
ALTER TABLE `tbl_asignaturas`
  MODIFY `Cod_asignatura` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `tbl_asistencias`
--
ALTER TABLE `tbl_asistencias`
  MODIFY `Cod_asistencias` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `tbl_aula`
--
ALTER TABLE `tbl_aula`
  MODIFY `Cod_aula` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `tbl_bitacora`
--
ALTER TABLE `tbl_bitacora`
  MODIFY `Cod_bitacora` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1656;

--
-- AUTO_INCREMENT de la tabla `tbl_caja`
--
ALTER TABLE `tbl_caja`
  MODIFY `Cod_caja` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=220;

--
-- AUTO_INCREMENT de la tabla `tbl_caja_descuento`
--
ALTER TABLE `tbl_caja_descuento`
  MODIFY `Cod_caja_descuento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT de la tabla `tbl_catalogo_cuentas`
--
ALTER TABLE `tbl_catalogo_cuentas`
  MODIFY `Cod_cuenta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `tbl_ciclos`
--
ALTER TABLE `tbl_ciclos`
  MODIFY `Cod_ciclo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tbl_concepto_pago`
--
ALTER TABLE `tbl_concepto_pago`
  MODIFY `Cod_concepto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de la tabla `tbl_contacto`
--
ALTER TABLE `tbl_contacto`
  MODIFY `cod_contacto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tbl_departamento`
--
ALTER TABLE `tbl_departamento`
  MODIFY `Cod_departamento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=160;

--
-- AUTO_INCREMENT de la tabla `tbl_descuentos`
--
ALTER TABLE `tbl_descuentos`
  MODIFY `Cod_descuento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de la tabla `tbl_dias`
--
ALTER TABLE `tbl_dias`
  MODIFY `Cod_dias` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `tbl_edificio`
--
ALTER TABLE `tbl_edificio`
  MODIFY `Cod_edificio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tbl_especialidades`
--
ALTER TABLE `tbl_especialidades`
  MODIFY `Cod_Especialidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `tbl_estado_asistencia`
--
ALTER TABLE `tbl_estado_asistencia`
  MODIFY `Cod_estado_asistencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `tbl_estado_matricula`
--
ALTER TABLE `tbl_estado_matricula`
  MODIFY `Cod_estado_matricula` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=153;

--
-- AUTO_INCREMENT de la tabla `tbl_estado_nota`
--
ALTER TABLE `tbl_estado_nota`
  MODIFY `Cod_estado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tbl_estado_usuario`
--
ALTER TABLE `tbl_estado_usuario`
  MODIFY `Cod_estado_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `tbl_estructura_familiar`
--
ALTER TABLE `tbl_estructura_familiar`
  MODIFY `Cod_genealogia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT de la tabla `tbl_genero_persona`
--
ALTER TABLE `tbl_genero_persona`
  MODIFY `Cod_genero` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `tbl_grados`
--
ALTER TABLE `tbl_grados`
  MODIFY `Cod_grado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `tbl_grados_asignaturas`
--
ALTER TABLE `tbl_grados_asignaturas`
  MODIFY `Cod_grados_asignaturas` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `tbl_grado_academico`
--
ALTER TABLE `tbl_grado_academico`
  MODIFY `Cod_grado_academico` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tbl_historiales_academicos`
--
ALTER TABLE `tbl_historiales_academicos`
  MODIFY `Cod_historial_academico` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `tbl_historiales_asignaturas`
--
ALTER TABLE `tbl_historiales_asignaturas`
  MODIFY `Cod_historial_asignatura` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `tbl_historial_pago`
--
ALTER TABLE `tbl_historial_pago`
  MODIFY `Cod_historial_pago` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `tbl_historial_secciones`
--
ALTER TABLE `tbl_historial_secciones`
  MODIFY `Cod_agrupadora` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `tbl_historico_procedencia`
--
ALTER TABLE `tbl_historico_procedencia`
  MODIFY `cod_procedencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `tbl_hist_contraseña`
--
ALTER TABLE `tbl_hist_contraseña`
  MODIFY `Cod_hist_contrasena` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT de la tabla `tbl_institutos`
--
ALTER TABLE `tbl_institutos`
  MODIFY `Cod_Instituto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `tbl_libro_diario`
--
ALTER TABLE `tbl_libro_diario`
  MODIFY `Cod_libro_diario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT de la tabla `tbl_matricula`
--
ALTER TABLE `tbl_matricula`
  MODIFY `Cod_matricula` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=160;

--
-- AUTO_INCREMENT de la tabla `tbl_municipio`
--
ALTER TABLE `tbl_municipio`
  MODIFY `Cod_municipio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=301;

--
-- AUTO_INCREMENT de la tabla `tbl_nacionalidad`
--
ALTER TABLE `tbl_nacionalidad`
  MODIFY `Cod_nacionalidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=189;

--
-- AUTO_INCREMENT de la tabla `tbl_notas`
--
ALTER TABLE `tbl_notas`
  MODIFY `Cod_nota` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT de la tabla `tbl_objetos`
--
ALTER TABLE `tbl_objetos`
  MODIFY `Cod_Objeto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=105;

--
-- AUTO_INCREMENT de la tabla `tbl_parametros`
--
ALTER TABLE `tbl_parametros`
  MODIFY `Cod_parametro` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `tbl_parciales`
--
ALTER TABLE `tbl_parciales`
  MODIFY `Cod_parcial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tbl_periodo_matricula`
--
ALTER TABLE `tbl_periodo_matricula`
  MODIFY `Cod_periodo_matricula` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=191;

--
-- AUTO_INCREMENT de la tabla `tbl_permisos`
--
ALTER TABLE `tbl_permisos`
  MODIFY `Cod_Permiso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=348;

--
-- AUTO_INCREMENT de la tabla `tbl_personas`
--
ALTER TABLE `tbl_personas`
  MODIFY `cod_persona` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=231;

--
-- AUTO_INCREMENT de la tabla `tbl_ponderaciones`
--
ALTER TABLE `tbl_ponderaciones`
  MODIFY `Cod_ponderacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `tbl_ponderaciones_ciclos`
--
ALTER TABLE `tbl_ponderaciones_ciclos`
  MODIFY `Cod_ponderacion_ciclo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `tbl_procedencia_persona`
--
ALTER TABLE `tbl_procedencia_persona`
  MODIFY `Cod_procedencia_persona` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tbl_profesores`
--
ALTER TABLE `tbl_profesores`
  MODIFY `Cod_profesor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `tbl_profesores_rel_especialidad`
--
ALTER TABLE `tbl_profesores_rel_especialidad`
  MODIFY `Cod_profesor_especialidad` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tbl_roles`
--
ALTER TABLE `tbl_roles`
  MODIFY `Cod_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT de la tabla `tbl_secciones`
--
ALTER TABLE `tbl_secciones`
  MODIFY `Cod_secciones` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `tbl_secciones_asignaturas`
--
ALTER TABLE `tbl_secciones_asignaturas`
  MODIFY `Cod_seccion_asignatura` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `tbl_secciones_asignaturas_dias`
--
ALTER TABLE `tbl_secciones_asignaturas_dias`
  MODIFY `Cod_secciones_asignaturas_dias` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `tbl_secciones_matricula`
--
ALTER TABLE `tbl_secciones_matricula`
  MODIFY `Cod_seccion_matricula` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `tbl_solicitud`
--
ALTER TABLE `tbl_solicitud`
  MODIFY `Cod_solicitud` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

--
-- AUTO_INCREMENT de la tabla `tbl_tipo_contacto`
--
ALTER TABLE `tbl_tipo_contacto`
  MODIFY `Cod_tipo_contacto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tbl_tipo_contrato`
--
ALTER TABLE `tbl_tipo_contrato`
  MODIFY `Cod_tipo_contrato` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tbl_tipo_matricula`
--
ALTER TABLE `tbl_tipo_matricula`
  MODIFY `Cod_tipo_matricula` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=145;

--
-- AUTO_INCREMENT de la tabla `tbl_tipo_persona`
--
ALTER TABLE `tbl_tipo_persona`
  MODIFY `Cod_tipo_persona` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT de la tabla `tbl_tipo_relacion`
--
ALTER TABLE `tbl_tipo_relacion`
  MODIFY `Cod_tipo_relacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `tbl_usuarios`
--
ALTER TABLE `tbl_usuarios`
  MODIFY `cod_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=236;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `tbl_actividades_academicas`
--
ALTER TABLE `tbl_actividades_academicas`
  ADD CONSTRAINT `tbl_actividades_academicas_ibfk_1` FOREIGN KEY (`Cod_profesor`) REFERENCES `tbl_profesores` (`Cod_profesor`),
  ADD CONSTRAINT `tbl_actividades_academicas_ibfk_2` FOREIGN KEY (`Cod_ponderacion_ciclo`) REFERENCES `tbl_ponderaciones_ciclos` (`Cod_ponderacion_ciclo`),
  ADD CONSTRAINT `tbl_actividades_academicas_ibfk_3` FOREIGN KEY (`Cod_parcial`) REFERENCES `tbl_parciales` (`Cod_parcial`),
  ADD CONSTRAINT `tbl_actividades_academicas_ibfk_4` FOREIGN KEY (`Cod_secciones`) REFERENCES `tbl_secciones` (`Cod_secciones`);

--
-- Filtros para la tabla `tbl_actividades_asignatura`
--
ALTER TABLE `tbl_actividades_asignatura`
  ADD CONSTRAINT `actividad_asignatura_actividad_academica` FOREIGN KEY (`Cod_actividad_academica`) REFERENCES `tbl_actividades_academicas` (`Cod_actividad_academica`),
  ADD CONSTRAINT `actividad_asignatura_seccion_asignatura` FOREIGN KEY (`Cod_seccion_asignatura`) REFERENCES `tbl_secciones_asignaturas` (`Cod_seccion_asignatura`);

--
-- Filtros para la tabla `tbl_asistencias`
--
ALTER TABLE `tbl_asistencias`
  ADD CONSTRAINT `tbl_asistencias_ibfk_1` FOREIGN KEY (`Cod_estado_asistencia`) REFERENCES `tbl_estado_asistencia` (`Cod_estado_asistencia`),
  ADD CONSTRAINT `tbl_asistencias_ibfk_2` FOREIGN KEY (`Cod_seccion_matricula`) REFERENCES `tbl_secciones_matricula` (`Cod_seccion_matricula`);

--
-- Filtros para la tabla `tbl_aula`
--
ALTER TABLE `tbl_aula`
  ADD CONSTRAINT `tbl_aula_ibfk_1` FOREIGN KEY (`Cod_edificio`) REFERENCES `tbl_edificio` (`Cod_edificio`);

--
-- Filtros para la tabla `tbl_caja`
--
ALTER TABLE `tbl_caja`
  ADD CONSTRAINT `Relacion_Concept o_Cod_concepto` FOREIGN KEY (`Cod_concepto`) REFERENCES `tbl_concepto_pago` (`Cod_concepto`),
  ADD CONSTRAINT `fk_persona` FOREIGN KEY (`Cod_persona`) REFERENCES `tbl_personas` (`cod_persona`);

--
-- Filtros para la tabla `tbl_contacto`
--
ALTER TABLE `tbl_contacto`
  ADD CONSTRAINT `Relación_Tipo_contacto_cod_tipo_contacto` FOREIGN KEY (`cod_tipo_contacto`) REFERENCES `tbl_tipo_contacto` (`Cod_tipo_contacto`),
  ADD CONSTRAINT `Relación_contacto_cod_persona` FOREIGN KEY (`cod_persona`) REFERENCES `tbl_personas` (`cod_persona`);

--
-- Filtros para la tabla `tbl_historiales_academicos`
--
ALTER TABLE `tbl_historiales_academicos`
  ADD CONSTRAINT `tbl_historiales_academicos_ibfk_1` FOREIGN KEY (`Cod_estado`) REFERENCES `tbl_estado_nota` (`Cod_estado`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tbl_historiales_academicos_ibfk_2` FOREIGN KEY (`Cod_persona`) REFERENCES `tbl_personas` (`cod_persona`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tbl_historiales_academicos_ibfk_3` FOREIGN KEY (`Cod_Instituto`) REFERENCES `tbl_institutos` (`Cod_Instituto`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `tbl_parametros`
--
ALTER TABLE `tbl_parametros`
  ADD CONSTRAINT `tbl_parametros_ibfk_1` FOREIGN KEY (`Cod_usuario`) REFERENCES `tbl_usuarios` (`cod_usuario`);

DELIMITER $$
--
-- Eventos
--
CREATE DEFINER=`root`@`localhost` EVENT `actualizar_estado_citas_event` ON SCHEDULE EVERY 15 SECOND STARTS '2024-11-22 00:20:16' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
  -- Actualizar solicitudes cuya Hora_Fin ya haya pasado
  UPDATE tbl_solicitud
  SET Estado = 'Finalizada'
  WHERE Estado = 'Activo'
    AND TIMESTAMP(Fecha_solicitud, Hora_Fin) <= NOW();
END$$

CREATE DEFINER=`root`@`localhost` EVENT `ResetOtpVerified` ON SCHEDULE EVERY 1 HOUR STARTS '2024-11-03 19:29:46' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    UPDATE tbl_usuarios
    SET otp_verified = 0
    WHERE otp_verified = 1 
    AND ultima_actualizacion < NOW() - INTERVAL 3 HOUR;
END$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
