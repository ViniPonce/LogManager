import os
from Config import *
from ConnectionFactory import ConnectionFactory
from Utils import *

# Importe todos os arquivos Python que você deseja executar
import SaveAudioCaptureMemoryUsageData

def process_files(extractPath):
    # Chame as funções de processamento de cada arquivo Python aqui
    SaveAudioCaptureMemoryUsageData.readFile(extractPath)

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        extractPath = sys.argv[1]
        process_files(extractPath)
    else:
        print("Usage: python process.py <extractPath>")
