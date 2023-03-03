import tkinter as tk
import zipfile
import os
from tkinter import filedialog
from tkinter import messagebox
from datetime import datetime
import csv
from collections.abc import Iterable





#----------------- FILE SELECTION -----------------
root = tk.Tk()
root.withdraw()

messagebox.showinfo("File selection", "Select your .zip file.")
file_path = filedialog.askopenfilename()
file_name = os.path.basename(file_path)
#----------------- FILE SELECTION -----------------

#----------------- NEW FILE SELECTION --------------
messagebox.showinfo("New file", "Select the name and the path to save the new file.")

new_file_path = filedialog.asksaveasfilename(defaultextension=".txt")
#----------------- NEW FILE SELECTION --------------
def flatten(xs):
    result = []
    if isinstance(xs, (list, tuple)):
        for x in xs:
            result.extend(flatten(x))
    else:
        result.append(xs)
    return result

def read_file_as_csv(file):

    return list(csv.DictReader(file.splitlines(), delimiter=';', fieldnames=['timestamp', 'status', 'event']))
def sortByTimestamp(e):
    time_format = "%d-%m-%Y %H:%M:%S.%f" if '.' in e['timestamp'] else "%d-%m-%Y %H:%M:%S"
    return datetime.strptime(e['timestamp'], time_format)

#----------------- FILES MERGE --------------------
with zipfile.ZipFile(file_path, 'r') as zip_ref:
    txt_dir = ''
    for file_name in zip_ref.namelist():
        if file_name.endswith('.txt'):
            txt_dir = os.path.dirname(file_name)
            break

    file_names = sorted(zip_ref.namelist())
    unique_file_names = dict()

    print('Getting File Names.')
    for file_name in file_names:
        fn = file_name.split('_')[0]
        if fn not in unique_file_names:
            unique_file_names[fn] = []
        unique_file_names[fn].append(file_name)

    files_dict = dict()
    files = []
    for key in unique_file_names:
        file_names = unique_file_names[key]
        files_dict[key] = []
        for file_name in file_names:
            if file_name.endswith('.txt'):
                with zip_ref.open(file_name) as file:
                    csv_list = read_file_as_csv(file.read().decode('utf-8'))
                    files_dict[key].extend(csv_list)
        files.extend(files_dict.values())

    files = list(flatten(files))
    print('Please wait, the files are being sorted.')
    files.sort(key=sortByTimestamp)

    print('Writing to the final file.')
    with open(new_file_path, 'w', newline='') as outfile:
        writer = csv.writer(outfile, delimiter=';')
        for file in files:
            writer.writerow(flatten(list(file.values())))

messagebox.showinfo("Merge Result", f"The contents of the text files have been merged into {new_file_path}.")
#----------------- FILES MERGE --------------------


#--------------------- FILES METRICS --------------
with open(new_file_path) as f:
    content = f.readlines()
    OS_RST_dates = []
    MRST_dates = []
    for line in content:
        if "OS_RST" in line:
            date = line.split(";")[0]
            OS_RST_dates.append(date)
        if "MRST = 1" in line:
            date = line.split(";")[0]
            MRST_dates.append(date)

    OS_RST_count = len(OS_RST_dates)
    MRST_count = len(MRST_dates)
#-------------------------- BTRC TIME DIFERENCE ----------------------------------

def calculate_time_differences(new_file_path):
    with open(new_file_path, 'r') as file:
        lines = file.readlines()
    events = []
    disconnected_time = None
    connected_time = None
    for line in lines:
        if "BTRC lost connection" in line:
            disconnected_time = datetime.strptime(line[:23], '%d-%m-%Y %H:%M:%S.%f')
        if "BTRC connected" in line and disconnected_time is not None:
            connected_time = datetime.strptime(line[:23], '%d-%m-%Y %H:%M:%S.%f')
            time_difference = connected_time - disconnected_time
            events.append((disconnected_time, time_difference))
            disconnected_time = None
    events.sort()
    return events

def display_events_in_listbox(events, listbox):
    listbox.delete(0, tk.END)
    listbox.insert(tk.END, "Timestamp                    Time Difference(hours:minutes:seconds)")
    for event in events:
        disconnected_time = event[0]
        time_difference = event[1]
        seconds = time_difference.total_seconds()
        hours = int(seconds / 3600)
        minutes = int((seconds % 3600) / 60)
        seconds = int(seconds % 60)
        timestamp = disconnected_time.strftime('%d-%m-%Y %H:%M:%S')
        text = f'{timestamp.ljust(25)}  {hours:02d}:{minutes:02d}:{seconds:02d}'.ljust(20)
        listbox.insert(tk.END, text)
#-------------------------- BTRC TIME DIFERENCE ----------------------------------

#-------------------------------- STATUSBIT ONOFF TIME DIFFERENCE --------------------
def get_on_off_time_differences(files):
    on_off_events = []
    on_off_0_time = None
    on_off_1_found = False

    for line in files:
        # Se a linha não tem pelo menos três partes, pula para a próxima
        if len(line) < 3:
            continue

        try:
            timestamp = datetime.strptime(line['timestamp'], '%d-%m-%Y %H:%M:%S.%f')
        except ValueError:
            # Se não conseguir converter a data/hora, pula para a próxima linha
            continue
        # Verifica se a linha contém a string "StatusBitLog"
        status_log = line['status']
        if "StatusBitLog" not in status_log:
            continue

        event = line['event']
        if not event.startswith("ONOFF ="):
            continue
        # Extrai o valor de ONOFF da terceira parte
        onoff_str = event.strip().split("=")[-1]
        try:
            onoff = int(onoff_str)
        except ValueError:
            # Se não conseguir converter o valor de ONOFF para inteiro, pula para a próxima linha
            continue
        # Se o valor de ONOFF for 0, registra a data/hora como a de ONOFF=0
        if onoff == 0:
            if on_off_0_time is None:
                on_off_0_time = timestamp
        # Se o valor de ONOFF for 1, registra a diferença entre a data/hora atual e a de ONOFF=0
        elif onoff == 1:
            if on_off_0_time is not None and not on_off_1_found:
                on_off_1_time = timestamp
                on_off_time_difference = on_off_1_time - on_off_0_time
                on_off_events.append((on_off_0_time, on_off_1_time, on_off_time_difference))
                on_off_0_time = None
                on_off_1_found = False
    return on_off_events

on_off_events = get_on_off_time_differences(files)
for event in on_off_events:
    on_off_0_time = event[0].strftime("%d-%m-%Y %H:%M:%S.%f")
    on_off_1_time = event[1].strftime("%d-%m-%Y %H:%M:%S.%f")
    on_off_time_difference = event[2]
    print(f"ON/OFF event: {on_off_0_time} - {on_off_1_time} -> {on_off_time_difference}")

#-------------------------------- STATUSBIT ONOFF TIME DIFFERENCE --------------------

#----------------------- STATUSBIT DAC TIME DIFFERENCE -----------------

def calculate_dac_signal_durations(new_file_path):
    disconnected_times = []
    connected_times = []
    with open(new_file_path, "r") as f:
        prev_value = None
        prev_timestamp = None
        for line in f:
            columns = line.strip().split(";")
            if len(columns) >= 6 and columns[4] == "StatusBitLog" and columns[5].startswith("DAC_SIGNAL"):
                timestamp = int(columns[0])
                value = int(columns[5].split("=")[1].strip())
                if prev_value is None:
                    prev_value = value
                    prev_timestamp = timestamp
                    continue
                if value != prev_value:
                    if value == 0:
                        disconnected_times.append(prev_timestamp)
                    elif value == 1:
                        connected_times.append(prev_timestamp)
                    prev_value = value
                    prev_timestamp = timestamp
        if len(disconnected_times) != len(connected_times):
            max_len = max(len(disconnected_times), len(connected_times))
            min_len = min(len(disconnected_times), len(connected_times))
            diff_len = max_len - min_len
            if len(disconnected_times) > len(connected_times):
                connected_times += [None] * diff_len
            else:
                disconnected_times += [None] * diff_len

        time_differences = []
        for dt, ct in zip(disconnected_times, connected_times):
            if dt is None or ct is None:
                time_differences.append(None)
            else:
                time_differences.append(datetime.fromtimestamp(ct/1000) - datetime.fromtimestamp(dt/1000))
    return disconnected_times, time_differences, connected_times

# --------------------- METRICS DISPLAY --------------
metrics_window = tk.Tk()
metrics_window.title("Files Metrics")
metrics_window.geometry("1900x1500")

OS_RST_label = tk.Label(metrics_window, text="OS_RST occurrences:", font=("Arial", 12, "bold"))
OS_RST_count_label = tk.Label(metrics_window, text=OS_RST_count, font=("Arial", 12))
OS_RST_dates_label = tk.Label(metrics_window, text="OS_RST occurrence dates:", font=("Arial", 12, "bold"))

OS_RST_scrollbar = tk.Scrollbar(metrics_window)
OS_RST_dates_text = tk.Text(metrics_window, height=5, width=30, yscrollcommand=OS_RST_scrollbar.set)
OS_RST_dates_text.insert(tk.END, '\n'.join(OS_RST_dates))
OS_RST_scrollbar.config(command=OS_RST_dates_text.yview)

MRST_label = tk.Label(metrics_window, text="MRST occurrences:", font=("Arial", 12, "bold"))
MRST_count_label = tk.Label(metrics_window, text=MRST_count, font=("Arial", 12))
MRST_dates_label = tk.Label(metrics_window, text="MRST occurrence dates:", font=("Arial", 12, "bold"))

MRST_scrollbar = tk.Scrollbar(metrics_window)
MRST_dates_text = tk.Text(metrics_window, height=5, width=30, yscrollcommand=MRST_scrollbar.set)
MRST_dates_text.insert(tk.END, '\n'.join(MRST_dates))
MRST_scrollbar.config(command=MRST_dates_text.yview)

summary_label = tk.Label(metrics_window, text="Summary:", font=("Arial", 12, "bold"))
summary_text = tk.Label(metrics_window, text=f"PM7 had {OS_RST_count + MRST_count} resets, which {OS_RST_count} of them were from Operating System resets, {MRST_count} of them were from APP resets", font=("Arial", 12))

OS_RST_label.pack()
OS_RST_count_label.pack()
OS_RST_dates_label.pack()
OS_RST_dates_text.pack()

MRST_label.pack()
MRST_count_label.pack()
MRST_dates_label.pack()
MRST_dates_text.pack()


#------------------ BTRC LISTBOX ------------

# Create Listbox
listbox = tk.Listbox(metrics_window, width=65, height=10, font=("Arial", 8))
listbox.place(x=50, y=30)

# BTRC Ocurrences text
label = tk.Label(metrics_window, text="BTRC Lost Connection Occurrences", font=("Arial", 10, "bold"))
label.place(x=120, y=5)

# Events to the Listbox
events = calculate_time_differences(new_file_path)
display_events_in_listbox(events, listbox)
#------------------ BTRC LISTBOX ------------

#------------------ STATUSBIT ONOFF LISTBOX ------------



#------------------ STATUSBIT ONOFF LISTBOX ------------

#----------------- dac

dac_signal_duration_label = tk.Label(metrics_window, text="Time between DAC_SIGNAL OFF and ON events:", font=("Arial", 12))
dac_signal_duration_label.pack()

dac_signal_duration_listbox = tk.Listbox(metrics_window, height=10, width=65)
dac_signal_duration_listbox.pack()

disconnected_times, time_differences, connected_times = calculate_dac_signal_durations(new_file_path)

if len(disconnected_times) > 0:
    events = sorted(list(zip(disconnected_times, time_differences, connected_times)))
    dac_signal_duration_listbox.insert(tk.END, f"{'Disconnected Time':<30}{'Connected Time':<30}{'Time Difference (minutes:seconds:ms)':<40}")
    for event in events:
        disconnected_time = event[0].strftime('%d-%m-%Y %H:%M:%S.%f')[:-3] if event[0] else ''
        connected_time = event[2].strftime('%d-%m-%Y %H:%M:%S.%f')[:-3] if event[2] else ''
        time_diff = event[1]
        time_str = ''
        if time_diff:
            seconds = abs(time_diff.total_seconds())
            hours = int(seconds / 3600)
            minutes = int((seconds % 3600) / 60)
            seconds = int(seconds % 60)
            time_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        dac_signal_duration_listbox.insert(tk.END, f"{disconnected_time:<30}{connected_time:<30}{time_str:<40}")
else:
    dac_signal_duration_listbox.insert(tk.END, "No DAC_SIGNAL OFF and ON events found.")

summary_label.pack(pady=20)
summary_text.pack()

metrics_window.mainloop()