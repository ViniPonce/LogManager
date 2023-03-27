import tkinter as tk
from tkinter import ttk
import os
from tkinter import filedialog
from tkinter import messagebox
from datetime import datetime
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

# --------------------- METRICS DISPLAY --------------

metrics_window = tk.Tk()
metrics_window.title("Files Metrics")
metrics_window.geometry("1900x1500")

top_frame = tk.Frame(metrics_window)
top_frame.pack(side="top", fill="x")

notebook = ttk.Notebook(top_frame, width=1780, height=1300)

summary_tab = tk.Frame(notebook)
log_analysis_tab = tk.Frame(notebook)
status_bit_analysis_tab = tk.Frame(notebook)

notebook.add(summary_tab, text="Summary")
notebook.add(log_analysis_tab, text="Log analysis")
notebook.add(status_bit_analysis_tab, text="Status bit analysis")

notebook.pack(side="top")

summary_label = tk.Label(summary_tab, text="Summary:", font=("Arial", 10, "bold"))
summary_label.pack(pady=20)

summary_text = tk.Label(summary_tab,
                        text=f"PM7 had {OS_RST_count + MRST_count} resets, which {OS_RST_count} of them were from Operating System resets, {MRST_count} of them were from APP resets.",
                        font=("Arial", 8))
summary_text.pack()
# -------------- BTRC Listbox ----------------
btrc_label = tk.Label(log_analysis_tab, text="BTRC Lost Connection Occurrences:", font=("Arial", 10, "bold"))
btrc_label.grid(row=0, column=0, pady=10, padx=20)

btrc_listbox = tk.Listbox(log_analysis_tab, width=80, height=20, font=("Arial", 8))
btrc_listbox.grid(row=1, column=0, pady=20, padx=20)

events = calculate_time_differences(new_file_path)
display_events_in_listbox(events, btrc_listbox)

# -------------- OS_RST Listbox ----------------
os_rst_label = tk.Label(log_analysis_tab, text="OS_RST Occurrences:", font=("Arial", 10, "bold"))
os_rst_label.grid(row=0, column=1, pady=10, padx=20)

os_rst_listbox = tk.Listbox(log_analysis_tab, width=80, height=20, font=("Arial", 8))
os_rst_listbox.grid(row=1, column=1, pady=20, padx=20)
os_rst_listbox.insert(0, "                   Timestamp                      ")

for date in OS_RST_dates:
    os_rst_listbox.insert(tk.END, date)
# -------------- OS_RST Listbox ----------------

# -------------- MRST Listbox ----------------
mrst_label = tk.Label(log_analysis_tab, text="MRST Occurrences:", font=("Arial", 10, "bold"))
mrst_label.grid(row=0, column=2, pady=10, padx=20)

mrst_listbox = tk.Listbox(log_analysis_tab, width=80, height=20, font=("Arial", 8))
mrst_listbox.grid(row=1, column=2, pady=20, padx=20)
mrst_listbox.insert(0, "                   Timestamp                      ")

for date in MRST_dates:
    mrst_listbox.insert(tk.END, date)
# -------------- MRST Listbox ----------------

# Atualizar a função para lidar com DataFrames
def display_events_in_treeview(events_df, treeview):
    treeview.delete(*treeview.get_children())
    for index, row in events_df.iterrows():
        treeview.insert("", "end", values=(row["Timestamp"], row["Time Difference"]))

# Criar DataFrame para DAC_SIGNAL e ONOFF
dac_signal_df = pd.DataFrame(dac_signal_events)
on_off_df = pd.DataFrame(on_off_events)

# Criar Treeview com colunas de Timestamp e Time Difference
treeview = ttk.Treeview(status_bit_analysis_tab, columns=("Timestamp", "Time Difference"), show="headings")
treeview.heading("Timestamp", text="Timestamp")
treeview.heading("Time Difference", text="Time Difference(hours:minutes:seconds)")
treeview.column("Timestamp", width=150)
treeview.column("Time Difference", width=150)
treeview.pack(pady=10, padx=20, fill="both", expand=True)


# Função para atualizar a Treeview com base nos checkboxes
def update_treeview():
    treeview.delete(*treeview.get_children())
    merged_df = pd.DataFrame(columns=["Timestamp", "Time Difference"])

    if dac_signal_var.get():
        merged_df = merged_df.append(dac_signal_df, ignore_index=True)
    if on_off_var.get():
        merged_df = merged_df.append(on_off_df, ignore_index=True)

    display_events_in_treeview(merged_df, treeview)

# Função para lidar com o estado do checkbox e chamar update_treeview
def on_checkbutton_click():
    # Inverte o estado do checkbox
    if dac_signal_var.get() == on_off_var.get():
        dac_signal_var.set(not dac_signal_var.get())
    else:
        on_off_var.set(not on_off_var.get())

    # Atualiza a Treeview
    merged_df = pd.DataFrame(columns=["Timestamp", "Time Difference"])

    if dac_signal_var.get():
        merged_df = merged_df.append(dac_signal_df, ignore_index=True)

    if on_off_var.get():
        merged_df = merged_df.append(on_off_df, ignore_index=True)

    display_events_in_treeview(merged_df, treeview)

# Criar checkboxes para selecionar DAC_SIGNAL e ONOFF
dac_signal_var = tk.BooleanVar(value=False)
on_off_var = tk.BooleanVar(value=False)

dac_signal_check = tk.Checkbutton(status_bit_analysis_tab, text="DAC_SIGNAL", variable=dac_signal_var, command=on_checkbutton_click)
on_off_check = tk.Checkbutton(status_bit_analysis_tab, text="ONOFF", variable=on_off_var, command=on_checkbutton_click)

dac_signal_check.pack(pady=10)
on_off_check.pack(pady=10)

# Inicializar a Treeview vazia
update_treeview()

# ---------------------LOOP--------------------
metrics_window.mainloop()
