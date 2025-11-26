import React, { Fragment, useEffect, useState } from "react";
import Dropzone from "react-dropzone";

// Controlled Dropzone: dùng được cả nội bộ lẫn bên ngoài (AddPropertyForm) truyền files vào
const DropZones = ({ multiple = true, files, onFilesChange }) => {
  const [internalFiles, setInternalFiles] = useState(files || []);

  // Đồng bộ khi props.files thay đổi
  useEffect(() => {
    if (files) {
      setInternalFiles(files);
    }
  }, [files]);

  const setFiles = (updater) => {
    setInternalFiles((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (onFilesChange) {
        onFilesChange(next);
      }
      return next;
    });
  };

  const onDrop = (acceptedFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  };

  const removeFile = (indexToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const hasFiles = internalFiles.length > 0;

  return (
    <Fragment>
      {/* Dropzone visible only if no files are uploaded */}
      {!hasFiles ? (
        <Dropzone onDrop={onDrop}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()} className='dropzone-container'>
              <input {...getInputProps()} />
              <p>Drag & drop your file here, or click to select a file</p>
            </div>
          )}
        </Dropzone>
      ) : (
        <Fragment>
          {/* Dropzone for adding more files */}
          {multiple && (
            <Dropzone onDrop={onDrop}>
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps()} className='add-more-files-zone'>
                  <input {...getInputProps()} />
                  <p>Click or drag more files to add</p>
                </div>
              )}
            </Dropzone>
          )}

          {/* Display uploaded files */}
          <div className='uploaded-files'>
            {internalFiles.map((file, index) => (
              <div key={index} className='file-card'>
                {file.type.startsWith("image/") ? (
                  <img src={URL.createObjectURL(file)} alt={file.name} className='file-thumbnail' />
                ) : (
                  <div className='file-placeholder'>{file.name.split(".").pop()?.toUpperCase()} File</div>
                )}
                <p className='file-name'>{file.name}</p>
                <p className='file-size'>{(file.size / 1024).toFixed(2)} KB</p>
                <button onClick={() => removeFile(index)} className='remove-button' title='Remove file'>
                  ×
                </button>
              </div>
            ))}
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default DropZones;