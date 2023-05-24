import React from 'react';
import Dropzone from 'react-dropzone';
import Sidebar from './Sidebar';

function FileUploader() {
  const [file, setFile] = React.useState(null);

  const handleDrop = acceptedFiles => {
    setFile(acceptedFiles[0]);
  };

  const handleClick = () => {
    document.getElementById('fileInput').click();
  };

  const handleInputChange = event => {
    console.log(event.target.files[0]);
    setFile(event.target.files[0]);
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="content">
        <Dropzone onDrop={handleDrop} accept=".zip,.txt">
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input
                type="file"
                {...getInputProps({ id: 'fileInput', onChange: handleInputChange })}
                style={{ display: 'none' }}
              />
              <button onClick={handleClick} id="fileButton">
                Selecione o arquivo
              </button>
              <p>{file ? `Arquivo selecionado: ${file.name}` : 'Nenhum arquivo selecionado'}</p>
            </div>
          )}
        </Dropzone>
      </div>
    </div>
  );
}

export default FileUploader;