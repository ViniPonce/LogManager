import tkinter as tk
import zipfile
import os
from tkinter import filedialog
from tkinter import messagebox
from datetime import datetime




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

#----------------- FILES MERGE --------------------
with zipfile.ZipFile(file_path, 'r') as zip_ref:
    txt_dir = ''
    for file_name in zip_ref.namelist():
        if file_name.endswith('.txt'):
            txt_dir = os.path.dirname(file_name)
            break

    with open(new_file_path, 'w') as outfile:
        for file_name in zip_ref.namelist():
            if file_name.endswith('.txt'):
                with zip_ref.open(file_name) as infile:
                    outfile.write(infile.read().decode('utf-8'))

messagebox.showinfo("Merge Result", f"The contents of the text files have been merged into {new_file_path}.")
#----------------- FILES MERGE --------------------

#--------------------- FILES METRICS --------------
with open(new_file_path) as f:
    content = f.readlines()
    OS_RST_dates = []
    MRST_dates = []
    BTRC_dates = []
    for line in content:
        if "OS_RST" in line:
            date = line.split(";")[0]
            OS_RST_dates.append(date)
        if "MRST = 1" in line:
            date = line.split(";")[0]
            MRST_dates.append(date)
        if "BTRC lost connection" in line:
            date = line.split(";")[0]
            BTRC_dates.append(date)

    OS_RST_count = len(OS_RST_dates)
    MRST_count = len(MRST_dates)
    BTRC_count = len(BTRC_dates)
#-------------------------- BTRC TIME DIFERENCE ----------------------------------

def calculate_time_differences(new_file_path):
    with open(new_file_path, 'r') as file:
        lines = file.readlines()
    disconnected_times = []
    connected_times = []
    for line in lines:
        if "BTRC lost connection" in line:
            disconnected_times.append(datetime.strptime(line[:23], '%d-%m-%Y %H:%M:%S.%f'))
        if "BTRC connected" in line:
            connected_times.append(datetime.strptime(line[:23], '%d-%m-%Y %H:%M:%S.%f'))
    time_differences = []
    i = 0
    while i < len(disconnected_times):
        j = 0
        while j < len(connected_times) and disconnected_times[i] > connected_times[j]:
            j += 1
        if j >= len(connected_times):
            break
        time_difference = disconnected_times[i] - connected_times[j]
        time_differences.append(time_difference)
        i += 1
    return disconnected_times, time_differences, connected_times

disconnected_times, time_differences, connected_times = calculate_time_differences(new_file_path)
events = sorted(list(zip(disconnected_times, time_differences)))
for event in events:
    timestamp = event[0].strftime('%d-%m-%Y %H:%M:%S.%f')
    time_diff = event[1]
    seconds = time_diff.total_seconds()
    hours = int(seconds / 3600)
    minutes = int((seconds % 3600) / 60)
    seconds = int(seconds % 60)


#-------------------------------- STATUSBIT ONOFF TIME DIFFERENCE --------------------

def calculate_on_off_time_differences(new_file_path):
    with open(new_file_path, 'r') as file:
        lines = file.readlines()
    on_times = []
    off_times = []
    for line in lines:
        if "StatusBitLog;ONOFF = 1" in line:
            on_times.append(datetime.strptime(line[:23], '%d-%m-%Y %H:%M:%S.%f'))
        if "StatusBitLog;ONOFF = 0" in line:
            off_times.append(datetime.strptime(line[:23], '%d-%m-%Y %H:%M:%S.%f'))
    on_times = sorted(on_times)
    off_times = sorted(off_times)
    time_differences = []
    i = 0
    while i < len(on_times):
        j = 0
        while j < len(off_times) and off_times[j] < on_times[i]:
            j += 1
        if j >= len(off_times):
            break
        time_difference = on_times[i] - off_times[j]
        time_differences.append(time_difference)
        i += 1
    return on_times, time_differences

on_times, time_differences = calculate_on_off_time_differences(new_file_path)
events = sorted(list(zip(on_times, time_differences)))
for event in events:
    timestamp = event[0].strftime('%d-%m-%Y %H:%M:%S.%f')
    time_diff = event[1]
    seconds = abs(time_diff.total_seconds())
    hours = int(seconds / 3600)
    minutes = int((seconds % 3600) / 60)
    seconds = int(seconds % 60)

#-------------------------------- STATUSBIT DAC TIME DIFFERENCE --------------------

def calculate_dac_time_differences(new_file_path):
    with open(new_file_path, 'r') as file:
        lines = file.readlines()
    dac_0_times = []
    dac_1_times = []
    for line in lines:
        if "DAC_SIGNAL = 0" in line:
            dac_0_times.append(datetime.strptime(line[:23], '%d-%m-%Y %H:%M:%S.%f'))
        if "DAC_SIGNAL = 1" in line:
            dac_1_times.append(datetime.strptime(line[:23], '%d-%m-%Y %H:%M:%S.%f'))
    dac_0_times = sorted(dac_0_times)
    dac_1_times = sorted(dac_1_times)
    time_differences = []
    i = 0
    while i < len(dac_0_times):
        j = 0
        while j < len(dac_1_times) and dac_1_times[j] < dac_0_times[i]:
            j += 1
        if j >= len(dac_1_times):
            break
        time_difference = dac_1_times[j] - dac_0_times[i]
        time_differences.append(time_difference)
        i += 1
    return dac_0_times, time_differences

dac_0_times, time_differences = calculate_dac_time_differences(new_file_path)
events = sorted(list(zip(dac_0_times, time_differences)))
for i in range(len(events)-1):
    start_time = events[i][0]
    end_time = events[i+1][0]
    time_diff = events[i+1][1]
    timestamp = start_time.strftime('%d-%m-%Y %H:%M:%S.%f')
    total_seconds = abs(int(time_diff.total_seconds()))
    hours, remainder = divmod(total_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)




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

BTRC_label = tk.Label(metrics_window, text="BTRC lost connection occurrences:", font=("Arial", 12, "bold"))
BTRC_count_label = tk.Label(metrics_window, text=BTRC_count, font=("Arial", 12))
BTRC_dates_label = tk.Label(metrics_window, text="BTRC lost connection occurrence dates:", font=("Arial", 12, "bold"))

BTRC_scrollbar = tk.Scrollbar(metrics_window)
BTRC_dates_text = tk.Text(metrics_window, height=5, width=30, yscrollcommand=BTRC_scrollbar.set)
BTRC_dates_text.insert(tk.END, '\n'.join(BTRC_dates))
BTRC_scrollbar.config(command=BTRC_dates_text.yview)

summary_label = tk.Label(metrics_window, text="Summary:", font=("Arial", 12, "bold"))
summary_text = tk.Label(metrics_window, text=f"PM7 had {OS_RST_count + MRST_count} resets, which {OS_RST_count} of them were from Operating System resets, {MRST_count} of them were from APP resets.\nAlso, there were {BTRC_count} BTRC connection losts.", font=("Arial", 12))

OS_RST_label.pack()
OS_RST_count_label.pack()
OS_RST_dates_label.pack()
OS_RST_dates_text.pack()

MRST_label.pack()
MRST_count_label.pack()
MRST_dates_label.pack()
MRST_dates_text.pack()

BTRC_label.pack()
BTRC_count_label.pack()
BTRC_dates_label.pack()
BTRC_dates_text.pack()


BTRC_duration_label = tk.Label(metrics_window, text="Time between BTRC Lost connections and the next BTRC Connection:", font=("Arial", 12))
BTRC_duration_label.pack()


BTRC_duration_listbox = tk.Listbox(metrics_window, height=10, width=60)
BTRC_duration_listbox.pack()


disconnected_times, time_differences, connected_times = calculate_time_differences(new_file_path)
events = sorted(list(zip(disconnected_times, time_differences)))
BTRC_duration_listbox.insert(tk.END, f"{'Timestamp':<30}{'Time Difference (hours:minutes:seconds)':<40}")
for event in events:
    timestamp = event[0].strftime('%d-%m-%Y %H:%M:%S.%f')
    time_diff = event[1]
    seconds = time_diff.total_seconds()
    hours = int(seconds / 3600)
    minutes = int((seconds % 3600) / 60)
    seconds = int(seconds % 60)
    time_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    BTRC_duration_listbox.insert(tk.END, f"{timestamp:<30}{time_str:<40}")



statusbit_duration_label = tk.Label(metrics_window, text="Time between StatusBit ON and OFF events:", font=("Arial", 12))
statusbit_duration_label.pack()

statusbit_duration_listbox = tk.Listbox(metrics_window, height=10, width=65)
statusbit_duration_listbox.pack()

on_times, time_differences = calculate_on_off_time_differences(new_file_path)
events = sorted(list(zip(on_times, time_differences)))
statusbit_duration_listbox.insert(tk.END, f"{'Timestamp':<30}{'Time Difference (minutes:seconds:ms)':<40}")
for event in events:
    timestamp = event[0].strftime('%d-%m-%Y %H:%M:%S.%f')
    time_diff = event[1]
    seconds = abs(time_diff.total_seconds())
    hours = int(seconds / 3600)
    minutes = int((seconds % 3600) / 60)
    seconds = int(seconds % 60)
    time_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    statusbit_duration_listbox.insert(tk.END, f"{timestamp:<30}{time_str:<40}")

statusbit_duration_label = tk.Label(metrics_window, text="Time between StatusBit DAC events:", font=("Arial", 12))
statusbit_duration_label.pack()

statusbit_duration_listbox = tk.Listbox(metrics_window, height=10, width=65)
statusbit_duration_listbox.pack()

dac_on_times, dac_time_differences = calculate_dac_time_differences(new_file_path)
events = sorted(list(zip(dac_on_times, dac_time_differences)))
statusbit_duration_listbox.insert(tk.END, f"{'Timestamp':<30}{'Time Difference (minutes:seconds:ms)':<40}")
for event in events:
    timestamp = event[0].strftime('%d-%m-%Y %H:%M:%S.%f')
    time_diff = event[1]
    seconds = abs(time_diff.total_seconds())
    hours = int(seconds / 3600)
    minutes = int((seconds % 3600) / 60)
    seconds = int(seconds % 60)
    time_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    statusbit_duration_listbox.insert(tk.END, f"{timestamp:<30}{time_str:<40}")


if len(event) >= 3:
    BTRC_ONOFF_label.pack(pady=20)
summary_label.pack(pady=20)
summary_text.pack()

metrics_window.mainloop()


# --------------------- METRICS DISPLAY --------------