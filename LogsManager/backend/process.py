import os
import sys
import zipfile
import shutil
import time
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import re


try:
    # Estabelece a conexão com o MySQL
    connection = mysql.connector.connect(user='root', password='nbhrn84k', host='localhost', database='pm7_logs')

    if connection.is_connected():
        db_Info = connection.get_server_info()
        print('Conectado ao servidor MySQL versão', db_Info)

        # Obtém o cursor
        cursor = connection.cursor()
        cursor.execute('select database();')
        record = cursor.fetchone()
        print('Conectado ao banco de dados', record)

        # Desabilita o autocommit para iniciar uma transação
        connection.autocommit = False

        # Caminho do arquivo zip
        file_path = sys.argv[1]
        print('Caminho do arquivo ZIP:', file_path)

        # Extraindo o arquivo
        extracted_dir = file_path.replace('.zip', '')
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            zip_ref.extractall(extracted_dir)

        # Início da contagem de tempo
        start_time = time.time()

        # Coleta os nomes dos arquivos extraídos
        extracted_files = os.listdir(extracted_dir)

        # Insere o ID do medidor (Meter ID)
        meter_id = None
        for file_name in extracted_files:
            if file_name.endswith('.id'):
                with open(os.path.join(extracted_dir, file_name), 'r') as file:
                    meter_id = file.read().strip()
                    break

        if not meter_id:
            print('ID do medidor não encontrado')
            sys.exit(1)

        insert_query = "INSERT INTO meter (id) VALUES (%s)"
        cursor.execute(insert_query, (meter_id,))

        # Desabilita os índices para inserção em massa
        disable_indexes_query = "ALTER TABLE audiocapturememoryusage DISABLE KEYS"
        cursor.execute(disable_indexes_query)

        # Extrai o nome da pasta do diretório do arquivo
        folder_name = os.path.basename(extracted_dir)
        # Extrai o nome desejado usando regex
        match = re.search(r'^(.*?)(?:_\d{2}-\d{2}-\d{4}_\d{2}_\d{2}_\d{2})?$', folder_name)
        if match:
            meter_name = match.group(1)

            # Verifica se o ID já está inserido na tabela
            check_query = f"SELECT id FROM meterid WHERE meter_name = '{meter_name}'"
            cursor.execute(check_query)
            result = cursor.fetchone()
            if result is None:
                # Insere o valor do ID na tabela meterid
                insert_query = f"INSERT INTO meterid (meter_name) VALUES ('{meter_name}')"
                cursor.execute(insert_query)
                connection.commit()
                meter_id = cursor.lastrowid
                print(f'Inserção do ID do meter ({meter_name}) concluída com sucesso')
            else:
                meter_id = result[0]  # Recupera o ID existente
                print(f'Chave de registro ({meter_name}) já gravada no banco de dados.')

            print(f'O ID do meter no banco de dados é: {meter_id}')

        # Grupo 0: Processamento dos arquivos: statusbitlog
        for file_name in extracted_files:
            file_path = os.path.join(extracted_dir, file_name)
            if file_name.startswith("StatusBitLog"):
                # Processamento do arquivo StatusBitLog
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        bit_status = values[2]
                        insert_query = f"INSERT IGNORE INTO statusbitlog \
                                        (timestamp, logname, bit_status, fk_statusbitlog_id) \
                                        VALUES ('{timestamp}', '{logname}', '{bit_status}', {meter_id})"
                        cursor.execute(insert_query)
                        print(f'Dados do arquivo {file_name} inseridos com sucesso')


        # Grupo 1: Processamento dos arquivos:bluetoothcommslog,connectionmanagementlog,onofflog,statuslog
        for file_name in extracted_files:
            file_path = os.path.join(extracted_dir, file_name)
            if file_name.startswith("BluetoothCommsLog"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        sensor_mode = values[2]
                        sensor_name = values[3]
                        device_connection = values[4]
                        connection_status = values[5]
                        range_connection = values[6]
                        insert_query = f"INSERT IGNORE INTO bluetoothcommslog (timestamp, logname, sensor_mode, sensor_name, " \
                                       f"device_connection, connection_status, range_connection, fk_bluetoothcommslog_id) " \
                                       f"VALUES ('{timestamp}', '{logname}', '{sensor_mode}', '{sensor_name}', " \
                                       f"'{device_connection}', '{connection_status}', '{range_connection}', {meter_id})"
                        cursor.execute(insert_query)
                    connection.commit()  # Confirma a inserção no banco de dados
                    print(f'File data {file_name} inserted successfully')

            elif file_name.startswith("ConnectionManagementLog"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    insert_query = "INSERT IGNORE INTO connectionmanagementlog \
                                       (timestamp, logname, connection_status, sim_info, network_info, apn_info, fk_connectionman_id) \
                                       VALUES (%s, %s, %s, %s, %s, %s, %s)"
                    cursor = connection.cursor()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        connection_status = values[2]
                        try:
                            sim_info = values[3]
                            network_info = values[4]
                            apn_info = values[5]
                        except IndexError:
                            # Índices 3, 4 e 5 não existem, atribua valores padrão ou pule para a próxima iteração
                            sim_info = ""
                            network_info = ""
                            apn_info = ""
                        insert_data = (timestamp, logname, connection_status, sim_info, network_info, apn_info, meter_id)
                        cursor.execute(insert_query, insert_data)
                    connection.commit()
                    print(f'File data {file_name} inserted successfully')

            elif file_name.startswith("OnOffLog"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        connection_status = values[2]
                        reading = values[3]
                        min_thresholdreading = values[4]
                        max_thresholdreading = values[5]
                        insert_query = f"INSERT IGNORE INTO onofflog \
                                           (timestamp, logname, connection_status, reading, min_thresholdreading, max_thresholdreading, fk_onofflog_id) \
                                           VALUES ('{timestamp}', '{logname}', '{connection_status}', '{reading}', '{min_thresholdreading}', '{max_thresholdreading}', '{meter_id}')"
                        cursor.execute(insert_query)
                    connection.commit()
                print(f'File data {file_name} inserted successfully')

            elif file_name.startswith("StatusLog"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        if not timestamp_str:
                            continue
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        pw_source = values[2]
                        op_status = values[3]
                        tv_status = values[4]
                        input_value = values[5]
                        panelists = values[6]
                        guests = values[7]
                        insert_query = f"INSERT IGNORE INTO statuslog \
                                           (timestamp, logname, pw_source, op_status, tv_status, input_value, panelists,\
                                            guests,fk_statuslog_id) \
                                           VALUES ('{timestamp}', '{logname}', '{pw_source}', '{op_status}', '{tv_status}', \
                                           '{input_value}', '{panelists}', '{guests}','{meter_id}')"
                        cursor.execute(insert_query)
                    print(f'File data {file_name} inserted successfully')


        # Grupo 2: Processamento dos arquivos: dmbelog,lamlog,watchdoglog,ntpserverlog, sensorsprocesslog
        for file_name in extracted_files:
            file_path = os.path.join(extracted_dir, file_name)
            if file_name.startswith("DMBELog"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        communication_status = values[2]
                        insert_query = f"INSERT IGNORE INTO dmbelog \
                                           (timestamp, logname, communication_status,fk_dmbelog_id) \
                                           VALUES ('{timestamp}', '{logname}', '{communication_status}','{meter_id}')"
                        cursor = connection.cursor()
                        cursor.execute(insert_query)
                        connection.commit()
                    print(f'File data {file_name} inserted successfully')

            elif file_name.startswith("LAMLog"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip()
                        if ';' in values:
                            values = values.split(';')
                        else:
                            values = values.split('-;')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        lam = values[2]
                        input_1 = values[3]
                        input_2 = values[4]
                        input_3 = values[5]
                        input_4 = values[6]
                        input_5 = values[7]
                        input_6 = values[8]
                        input_7 = values[9]
                        insert_query = f"INSERT IGNORE INTO lamlog \
                                           (timestamp, logname, lam, input_1, input_2, input_3, \
                                           input_4, input_5, input_6, input_7,fk_lamlog_id) \
                                           VALUES ('{timestamp}', '{logname}', '{lam}', '{input_1}', '{input_2}', \
                                           '{input_3}', '{input_4}', '{input_5}', '{input_6}', '{input_7}','{meter_id}')"
                        cursor = connection.cursor()
                        cursor.execute(insert_query)
                        connection.commit()
                    print(f'File data {file_name} inserted successfully')

            elif file_name.startswith("NTPServerLog"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        ntp_status = values[2]

                        insert_query = f"INSERT IGNORE INTO ntpserverlog \
                                        (timestamp, logname, ntp_status, fk_ntpserverlog_id) \
                                        VALUES ('{timestamp}', '{logname}', '{ntp_status}', '{meter_id}')"

                        cursor = connection.cursor()
                        cursor.execute(insert_query)
                        connection.commit()

                    print(f'File data {file_name} inserted successfully')

            elif file_name.startswith("SensorsProcessLog"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    # Lista para armazenar os valores das inserções
                    values_list = []
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        if not timestamp_str:  # Verifica se timestamp_str está vazio
                            continue
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        sensor_mode = values[2]
                        sensor_name = values[3]
                        sensor_status = ';'.join(values[4:])

                        # Adicionar os valores à lista
                        values_list.append((timestamp, logname, sensor_mode, sensor_name, sensor_status, meter_id))

                    insert_query = "INSERT IGNORE INTO sensorsprocesslog (timestamp, logname, sensor_mode, sensor_name, " \
                                   "sensor_status, fk_sensorsprocess_id) VALUES (%s, %s, %s, %s, %s, %s)"
                    cursor = connection.cursor()  # Criar o cursor fora do loop
                    cursor.executemany(insert_query, values_list)  # Executar a inserção com a lista de valores
                    connection.commit()  # Confirmar as inserções

                print(f'File data {file_name} inserted successfully')

            elif file_name.startswith("WatchDogLog"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()

                for line in lines:
                    values = line.strip().split(';')
                    timestamp_str = values[0]
                    timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime('%Y-%m-%d %H:%M:%S')
                    logname = values[1]
                    service_status = values[2]

                    insert_query = f"INSERT IGNORE INTO watchdoglog \
                                       (timestamp, logname, service_status, fk_watchdoglog_id) \
                                       VALUES ('{timestamp}', '{logname}', '{service_status}', '{meter_id}')"

                    cursor = connection.cursor()
                    cursor.execute(insert_query)

                connection.commit()

                print(f'Dados do arquivo {file_name} inseridos com sucesso')

        # Grupo 3: Processamento dos arquivos: mainlog,rtmdeliverylog,btrclog,batterychargecontrollog\
        # ,batterylifemonitorlog
        for file_name in extracted_files:
            file_path = os.path.join(extracted_dir, file_name)
            if file_name.startswith("BTRCLog"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                           '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        btrc_status = values[2]
                        insert_query = f"INSERT IGNORE INTO btrclog \
                            (timestamp, logname, btrc_status, fk_btrclog_id) \
                            VALUES ('{timestamp}', '{logname}', '{btrc_status}', '{meter_id}')"

                        cursor = connection.cursor()
                        cursor.execute(insert_query)
                        connection.commit()
                    print(f'File data {file_name} inserted successfully')

            elif file_name.startswith("BatteryChargeControlLog"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        battery_status = values[2]

                        insert_query = f"INSERT IGNORE INTO batterychargecontrollog \
                                        (timestamp, logname, battery_status, fk_batchargecontlog_id) \
                                        VALUES ('{timestamp}', '{logname}', '{battery_status}', '{meter_id}')"

                        cursor = connection.cursor()
                        cursor.execute(insert_query)

                    connection.commit()
                    print(f'File data {file_name} inserted successfully')

            elif file_name.startswith("BatteryLifeMonitorLog"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                for line in lines:
                    values = line.strip().split(';')
                    timestamp_str = values[0]
                    timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime('%Y-%m-%d %H:%M:%S')
                    logname = values[1]
                    charging_status = values[2]
                    charging_percentage = values[3]
                    pw_source = values[4]
                    health = values[5]
                    temperature = values[6]
                    voltage = values[7]
                    current_status = values[8]
                    capacity = values[9]
                    avg_current = values[10]
                    now_current = values[11]
                    insert_query = f"INSERT IGNORE INTO batterylifemonitorlog (timestamp, logname, charging_status, " \
                                   f"charging_percentage, pw_source, health, temperature, voltage, current_status, " \
                                   f"capacity, avg_current, now_current, fk_batlifemonit_id) VALUES ('{timestamp}', '{logname}', " \
                                   f"'{charging_status}', '{charging_percentage}', '{pw_source}', '{health}', " \
                                   f"'{temperature}', '{voltage}', '{current_status}', '{capacity}', '{avg_current}', " \
                                   f"'{now_current}', '{meter_id}')"
                    cursor.execute(insert_query)
                connection.commit()  # Confirma a inserção no banco de dados
                print(f'Dados do arquivo {file_name} inseridos com sucesso')


            elif file_name.startswith("MainLog"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        message = values[2]

                        insert_query = f"INSERT IGNORE INTO mainlog \
                                        (timestamp, logname, message, fk_mainlog_id) \
                                        VALUES ('{timestamp}', '{logname}', '{message}', '{meter_id}')"

                        cursor = connection.cursor()
                        cursor.execute(insert_query)

                    connection.commit()
                    print(f'File data {file_name} inserted successfully')

            elif file_name.startswith("RTMDeliveryLog"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        delivery_status = values[2]
                        insert_query = f"INSERT IGNORE INTO rtmdeliverylog \
                                        (timestamp, logname, delivery_status, fk_rtmdeliverylog_id) \
                                        VALUES ('{timestamp}', '{logname}', '{delivery_status}', '{meter_id}')"

                        cursor = connection.cursor()
                        cursor.execute(insert_query)

                    connection.commit()
                    print(f'File data {file_name} inserted successfully')

        # Grupo 4: Processamento dos arquivos: awmdetectionlog,awmdetectorlog,filerotationcontrol,storagestats
        for file_name in extracted_files:
            file_path = os.path.join(extracted_dir, file_name)
            if file_name.startswith("AwmDetectionLog"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
               # Dicionário para armazenar os valores agrupados por dia
                values_dict = {}
                for line in lines:
                   values = line.strip().split(';')
                   timestamp_str = values[0]
                   timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime('%Y-%m-%d')
                   logname = values[1]
                   license_number = values[2]
                   technology = values[3]
                   channel_content_id = values[4]
                   event_timestamp = values[5]
                   offset = values[6]
                   reference_time = values[7]
                   confidence = values[8]
                   event_type = values[9]

                   # Verificar se já existe um grupo de valores para o dia atual
                   if timestamp in values_dict:
                       values_dict[timestamp].append(
                           (timestamp, logname, license_number, technology, channel_content_id,
                            event_timestamp, offset, reference_time, confidence, event_type, meter_id))
                   else:
                        values_dict[timestamp] = [
                            (timestamp, logname, license_number, technology, channel_content_id,
                             event_timestamp, offset, reference_time, confidence, event_type, meter_id)]

                insert_query = "INSERT IGNORE INTO awmdetectionlog (timestamp, logname, license_number, technology, " \
                       "channel_content_id, event_timestamp, offset, reference_time, confidence, event_type, " \
                       "fk_awmdetectionlog_id) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"

                cursor = connection.cursor()  # Criar o cursor fora do loop
                for values_list in values_dict.values():
                   cursor.executemany(insert_query,
                               values_list)  # Executar a inserção com a lista de valores para cada dia
                connection.commit()  # Confirmar as inserções
                print(f'File data {file_name} inserted successfully')

            elif file_name.startswith("AwmDetectorLog"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    # Lista para armazenar os valores das inserções
                    values_list = []
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        event_type = values[2]
                        reference_time = values[3]
                        confidence = values[4]
                        # Adicionar os valores à lista
                        values_list.append((timestamp, logname, event_type, reference_time, confidence, meter_id))
                    insert_query = "INSERT IGNORE INTO awmdetectorlog (timestamp, logname, event_type, reference_time, confidence, fk_awmdetectorlog_id) " \
                                   "VALUES (%s, %s, %s, %s, %s, %s)"
                    cursor = connection.cursor()  # Criar o cursor fora do loop
                    cursor.executemany(insert_query, values_list)  # Executar a inserção com a lista de valores
                    connection.commit()  # Confirmar as inserções
                print(f'File data {file_name} inserted successfully')


            elif file_name.startswith("FileRotationControl"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                for line in lines:
                    values = line.strip().split(';')
                    timestamp_str = values[0]
                    timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime('%Y-%m-%d %H:%M:%S')
                    logname = values[1]
                    rotation_status = values[2]
                    insert_query = f"INSERT IGNORE INTO filerotationcontrol (timestamp, logname, rotation_status, fk_filerotationcontrol_id) " \
                                   f"VALUES ('{timestamp}', '{logname}', '{rotation_status}', '{meter_id}')"
                    cursor = connection.cursor()
                    cursor.execute(insert_query)
                    connection.commit()
                print(f'File data {file_name} inserted successfully')

            elif file_name.startswith("StorageStats"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                for line in lines:
                    values = line.strip().split(';')
                    timestamp_str = values[0]
                    if not timestamp_str:
                        continue
                    timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime('%Y-%m-%d %H:%M:%S')
                    logname = values[1]
                    freebytes = values[2]
                    totalbytes = values[3]
                    insert_query = f"INSERT IGNORE INTO storagestats (timestamp, logname, freebytes, totalbytes, fk_storagestats_id) " \
                                   f"VALUES ('{timestamp}', '{logname}', '{freebytes}', '{totalbytes}', '{meter_id}')"
                    cursor = connection.cursor()
                    cursor.execute(insert_query)
                print(f'File data {file_name} inserted successfully')

        # Grupo 5: Processamento dos arquivos: dashboardcommunication,bootlog,daclog,sensorspointerlog

        for file_name in extracted_files:
            file_path = os.path.join(extracted_dir, file_name)
            if file_name.startswith("DashBoard_Communication"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    insert_query = "INSERT IGNORE INTO dashboardcommunication (timestamp, fk_dashboardcom_id) VALUES (%s, %s)"
                    cursor = connection.cursor()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        insert_data = (timestamp, meter_id)
                        cursor.execute(insert_query, insert_data)
                    connection.commit()
                print(f'File data {file_name} inserted successfully')

            elif file_name.startswith("BootLog"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        process_status = values[2]
                        insert_query = f"INSERT IGNORE INTO bootlog (timestamp, logname, process_status, fk_bootlog_id) \
                                        VALUES ('{timestamp}', '{logname}', '{process_status}', '{meter_id}')"
                        cursor = connection.cursor()
                        cursor.execute(insert_query)
                    connection.commit()
                    print(f'File data {file_name} inserted successfully')

            elif file_name.startswith("DACLog"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    insert_query = "INSERT IGNORE INTO dacLog (timestamp, logname, dac_info, fk_daclog_id) \
                                    VALUES (%s, %s, %s, %s)"
                    cursor = connection.cursor()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        dac_info = values[2]
                        insert_data = (timestamp, logname, dac_info, meter_id)
                        cursor.execute(insert_query, insert_data)
                    connection.commit()
                print(f'File data {file_name} inserted successfully')

            elif file_name.startswith("SensorsPointerLog"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    # Lista para armazenar os valores das inserções
                    values_list = []
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        sensor_mode = values[2]
                        sensor_name = values[3]
                        realtimepointer = values[4]
                        lastpointer = values[5]
                        newpointer = values[6]
                        err_cle_or_ok = values[7]
                        err_dlp_or_ok = values[8]
                        cadenceerror = values[9]
                        delayerror = values[10]
                        # Adicionar os valores à lista
                        values_list.append(
                            (timestamp, logname, sensor_mode, sensor_name, realtimepointer, lastpointer, newpointer,
                             err_cle_or_ok,
                             err_dlp_or_ok, cadenceerror, delayerror, meter_id))

                    insert_query = "INSERT IGNORE INTO sensorspointerlog (timestamp, logname, sensor_mode, sensor_name, " \
                                   "realtimepointer, lastpointer, newpointer, err_cle_or_ok, err_dlp_or_ok, cadenceerror, " \
                                   "delayerror, fk_sensorspointerlogcol_id) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"

                    cursor = connection.cursor()  # Criar o cursor fora do loop
                    cursor.executemany(insert_query, values_list)  # Executar a inserção com a lista de valores

                    connection.commit()  # Confirmar as inserções
                print(f'File data {file_name} inserted successfully')

            # Grupo 6: Processamento dos arquivos: audiocapturememoryusage,audiomatchingmemoryusage,
            # audiowatermarkingmemoryusage,backendmemoryusage,deliveryservicememoryusage,lcmmemoryusage,
            # mainprocessmemoryusage,watchdogmemoryusage,internetdataconsumptionlog,workflowstepmanager

        for file_name in extracted_files:
            file_path = os.path.join(extracted_dir, file_name)
            if file_name.startswith("AudioCaptureMemoryUsage"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                             '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        os_memory = values[2]
                        pr_total_memory = values[3]
                        pr_free_memory = values[4]
                        pr_used_memory = values[5]
                        insert_query = "INSERT IGNORE INTO audiocapturememoryusage \
                                               (timestamp, logname, os_memory, pr_total_memory, pr_free_memory, pr_used_memory, fk_audiocapturememoryusage_id) \
                                               VALUES (%s, %s, %s, %s, %s, %s, %s)"
                        insert_values = (timestamp, logname, os_memory, pr_total_memory, pr_free_memory, pr_used_memory, meter_id)
                        cursor.execute(insert_query, insert_values)
                    print(f'File data {file_name} inserted successfully')

            elif file_name.startswith("AudioMatchingMemoryUsage"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        os_memory = values[2]
                        pr_total_memory = values[3]
                        pr_free_memory = values[4]
                        pr_used_memory = values[5]
                        insert_query = f"INSERT IGNORE INTO audiomatchingmemoryusage \
                            (timestamp, logname, os_memory, pr_total_memory, pr_free_memory, pr_used_memory, fk_audiomatchingmemoryusage_id) \
                            VALUES ('{timestamp}', '{logname}', '{os_memory}', '{pr_total_memory}', '{pr_free_memory}', '{pr_used_memory}', '{meter_id}')"
                        cursor.execute(insert_query)
                    print(f'File data {file_name} inserted successfully')


            elif file_name.startswith("AudioWatermarkingMemoryUsage"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        os_memory = values[2]
                        pr_total_memory = values[3]
                        pr_free_memory = values[4]
                        pr_used_memory = values[5]
                        insert_query = f"INSERT IGNORE INTO audiowatermarkingmemoryusage \
                            (timestamp, logname, os_memory, pr_total_memory, pr_free_memory, pr_used_memory, fk_audiowatermarkingmemoryusage_id) \
                            VALUES ('{timestamp}', '{logname}', '{os_memory}', '{pr_total_memory}', '{pr_free_memory}', '{pr_used_memory}', '{meter_id}')"
                        cursor.execute(insert_query)
                    print(f'File data {file_name} inserted successfully')


            elif file_name.startswith("BackendMemoryUsage"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        os_memory = values[2]
                        pr_total_memory = values[3]
                        pr_free_memory = values[4]
                        pr_used_memory = values[5]
                        insert_query = f"INSERT IGNORE INTO backendmemoryusage \
                            (timestamp, logname, os_memory, pr_total_memory, pr_free_memory, pr_used_memory, fk_backendmemoryusage_id) \
                            VALUES ('{timestamp}', '{logname}', '{os_memory}', '{pr_total_memory}', '{pr_free_memory}', '{pr_used_memory}', '{meter_id}')"
                        cursor.execute(insert_query)
                    print(f'File data {file_name} inserted successfully')


            elif file_name.startswith("DeliveryServiceMemoryUsage"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        os_memory = values[2]
                        pr_total_memory = values[3]
                        pr_free_memory = values[4]
                        pr_used_memory = values[5]
                        insert_query = f"INSERT IGNORE INTO deliveryservicememoryusage \
                            (timestamp, logname, os_memory, pr_total_memory, pr_free_memory, pr_used_memory, fk_deliveryservmemoryusage_id) \
                            VALUES ('{timestamp}', '{logname}', '{os_memory}', '{pr_total_memory}', '{pr_free_memory}', '{pr_used_memory}', '{meter_id}')"
                        cursor.execute(insert_query)
                    connection.commit()
                    print(f'File data {file_name} inserted successfully')


            elif file_name.startswith("LcmMemoryUsage"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        os_memory = values[2]
                        pr_total_memory = values[3]
                        pr_free_memory = values[4]
                        pr_used_memory = values[5]
                        insert_query = f"INSERT IGNORE INTO lcmmemoryusage \
                            (timestamp, logname, os_memory, pr_total_memory, pr_free_memory, pr_used_memory, fk_lcmmemoryusage_id) \
                            VALUES ('{timestamp}', '{logname}', '{os_memory}', '{pr_total_memory}', '{pr_free_memory}', '{pr_used_memory}', '{meter_id}')"
                        cursor.execute(insert_query)
                    connection.commit()
                    print(f'File data {file_name} inserted successfully')


            elif file_name.startswith("MainProcessMemoryUsage"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        os_memory = values[2]
                        pr_total_memory = values[3]
                        pr_free_memory = values[4]
                        pr_used_memory = values[5]
                        insert_query = f"INSERT IGNORE INTO mainprocessmemoryusage \
                            (timestamp, logname, os_memory, pr_total_memory, pr_free_memory, pr_used_memory, fk_mainprocmemusg_id) \
                            VALUES ('{timestamp}', '{logname}', '{os_memory}', '{pr_total_memory}', '{pr_free_memory}', '{pr_used_memory}', '{meter_id}')"
                        cursor.execute(insert_query)
                    connection.commit()
                    print(f'File data {file_name} inserted successfully')


            elif file_name.startswith("WatchdogMemoryUsage"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        os_memory = values[2]
                        pr_total_memory = values[3]
                        pr_free_memory = values[4]
                        pr_used_memory = values[5]
                        insert_query = "INSERT IGNORE INTO watchdogmemoryusage \
                            (timestamp, logname, os_memory, pr_total_memory, pr_free_memory, pr_used_memory, fk_watchdogmemoryusage_id) \
                            VALUES (%s, %s, %s, %s, %s, %s, %s)"
                        insert_values = (
                        timestamp, logname, os_memory, pr_total_memory, pr_free_memory, pr_used_memory, meter_id)
                        cursor.execute(insert_query, insert_values)
                    connection.commit()
                print(f'File data {file_name} inserted successfully')

            elif file_name.startswith("InternetDataConsumptionLog"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                    for line in lines:
                        values = line.strip().split(';')
                        timestamp_str = values[0]
                        timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime(
                            '%Y-%m-%d %H:%M:%S')
                        logname = values[1]
                        txbytes = values[2]
                        rxbytes = values[3]
                        txdiffvalue = values[4]
                        rxdiffvalue = values[5]
                        insert_query = "INSERT IGNORE INTO internetdataconsumptionlog \
                            (timestamp, logname, txbytes, rxbytes, txdiffvalue, rxdiffvalue, fk_internetdataconslog_id) \
                            VALUES (%s, %s, %s, %s, %s, %s, %s)"
                        insert_values = (timestamp, logname, txbytes, rxbytes, txdiffvalue, rxdiffvalue, meter_id)
                        cursor.execute(insert_query, insert_values)
                    connection.commit()
                print(f'File data {file_name} inserted successfully')

            elif file_name.startswith("WorkflowStepManager"):
                with open(file_path, 'r') as file:
                    lines = file.readlines()
                for line in lines:
                    values = line.strip().split(';')
                    timestamp_str = values[0]
                    timestamp = datetime.strptime(timestamp_str, '%d-%m-%Y %H:%M:%S.%f').strftime('%Y-%m-%d %H:%M:%S')
                    logname = values[1]
                    workflow_status = values[2]
                    insert_query = f"INSERT IGNORE INTO workflowstepmanager (timestamp, logname, workflow_status, fk_workflowstepmanager_id) \
                        VALUES ('{timestamp}', '{logname}', '{workflow_status}', '{meter_id}')"
                    cursor = connection.cursor()
                    cursor.execute(insert_query)
                connection.commit()
                print(f'Dados do arquivo {file_name} inseridos com sucesso')

        # Reativa os índices após a inserção em massa
        enable_indexes_query = "ALTER TABLE audiocapturememoryusage ENABLE KEYS"
        cursor.execute(enable_indexes_query)

        # Fim da contagem de tempo
        end_time = time.time()
        elapsed_time = end_time - start_time
        print('Elapsed time: ', elapsed_time)


except mysql.connector.Error as error:
    # Reverte a transação em caso de erro
    connection.rollback()
    print(f'Erro ao conectar ao servidor MySQL: {error}')

except Exception as e:
    print(f'Erro não tratado: {e}')

finally:
    if connection.is_connected():
        cursor.close()
        connection.close()
    print('Conexão MySQL fechada')