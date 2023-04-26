import tkinter as tk
from tkinter import ttk
import os
from tkinter import filedialog
from tkinter import messagebox
from tkinter import simpledialog
from datetime import datetime, timedelta
import csv
import pandas as pd
 


# ----------------- FILE SELECTION -----------------
root = tk.Tk()
root.withdraw()
messagebox.showinfo("File selection", "Select your .zip file or .txt file.", parent=root)
file_path = filedialog.askopenfilename(parent=root)
if file_path == "":
    messagebox.showwarning("File Selection", "Process cancelled", parent=root)
    close(askopenfilename)

file_name = os.path.basename(file_path)
file_extension = os.path.splitext(file_path)[1]

# ----------------- FILE SELECTION -----------------

# ----------------- NEW FILE SELECTION --------------
if file_name.endswith('.zip'):
    messagebox.showinfo("New file", "Select the name and the path to save the new file.")
    new_file_path = filedialog.asksaveasfilename(defaultextension=".txt")

    if new_file_path == "":
        messagebox.showwarning(" New File ", "Process cancelled", parent=root)
        close(asksaveasfilename)
else:
    new_file_path = file_path

# ----------------- NEW FILE SELECTION --------------
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


# ----------------- FILES MERGE --------------------
if file_name.endswith('.zip'):
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
        # for key in unique_file_names:
        #    file_names = unique_file_names[key]
        #    files_dict[key] = []
        for file_name in file_names:
            if file_name.endswith('.txt'):
                with zip_ref.open(file_name) as file:
                    csv_list = read_file_as_csv(file.read().decode('utf-8'))
                    files.extend(csv_list)

        print('Please wait, the files are being sorted.')
        files.sort(key=sortByTimestamp)

        print('Writing to the final file.')
        with open(new_file_path, 'w', newline='') as outfile:
            writer = csv.writer(outfile, delimiter=';')
            for file in files:
                writer.writerow(flatten(list(file.values())))

    messagebox.showinfo("Merge Result", f"The contents of the text files have been merged into {new_file_path}.")

# ----------------- FILES MERGE --------------------

# --------------------- FILES METRICS --------------
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


# -------------------------- BTRC TIME DIFERENCE ----------------------------------

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
    listbox.insert(tk.END, "            Timestamp                      Time Difference(hours:minutes:seconds)")
    for event in events:
        disconnected_time = event[0]
        time_difference = event[-1]
        seconds = time_difference.total_seconds()
        hours = int(seconds / 3600)
        minutes = int((seconds % 3600) / 60)
        seconds = int(seconds % 60)
        timestamp = disconnected_time.strftime('%d-%m-%Y %H:%M:%S')
        text = f'{timestamp.ljust(25)}           {hours:02d}:{minutes:02d}:{seconds:02d}'.ljust(20)
        listbox.insert(tk.END, text)


# -------------------------- BTRC TIME DIFERENCE ----------------------------------

# ----------------------- STATUSBIT TIME DIFFERENCES -----------------

def get_time_differences(content, status_log, event):
    events = []
    time_0 = None
    found_1 = False
    filter_date = None

    lines = csv.DictReader(content, delimiter=';', fieldnames=['timestamp', 'status', 'event'])
    for line in lines:
        try:
            timestamp = datetime.strptime(line['timestamp'], '%d-%m-%Y %H:%M:%S.%f')
        except ValueError:
            continue

        line_status_log = line['status']
        if status_log not in line_status_log:
            continue

        line_event = line['event']
        if not line_event.startswith(event):
            continue

        line_event_value_str = line_event.strip().split("=")[-1]
        try:
            line_event_value = int(line_event_value_str)
        except ValueError:
            continue

        if line_event_value == 1:
            if time_0 is None:
                time_0 = timestamp

        elif line_event_value == 0:
            if time_0 is not None and not found_1:
                time_1 = timestamp
                time_difference = time_1 - time_0
                #filter_date = datetime.strptime('20-01-2023 00:00:00.00', '%d-%m-%Y %H:%M:%S.%f')
                if filter_date != None:
                    if (time_0 - filter_date).days >= 0:
                        events.append({"Timestamp": time_0, "Time Difference": time_difference})
                else:
                    events.append({"Timestamp": time_0, "Time Difference": time_difference})
                time_0 = None
                found_1 = False
    return pd.DataFrame(events)

dac_signal_events = get_time_differences(content, 'StatusBitLog', 'DAC_SIGNAL')
on_off_events = get_time_differences(content, 'StatusBitLog', 'ONOFF')

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
                time_differences.append(datetime.fromtimestamp(ct / 1000) - datetime.fromtimestamp(dt / 1000))
    return disconnected_times, time_differences, connected_times


# ----------------------- STATUSBIT TIME DIFFERENCES -----------------


