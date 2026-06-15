import React, { Fragment, useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { toast } from "react-toastify";

// Controlled Dropzone: dùng được cả nội bộ lẫn bên ngoài (AddPropertyForm) truyền files vào
const DropZones = ({ multiple = true, files, onFilesChange, maxFiles = 10, maxSizeMB = 20 }) => {
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
    setFiles((prevFiles) => {
      let newFiles = [...prevFiles, ...acceptedFiles];
      
      if (newFiles.length > maxFiles) {
        toast.warning(`Chỉ được tải lên tối đa ${maxFiles} tệp.`);
        newFiles = newFiles.slice(0, maxFiles);
      }
      
      const totalSize = newFiles.reduce((acc, file) => acc + file.size, 0);
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      
      if (totalSize > maxSizeBytes) {
        toast.error(`Tổng dung lượng các tệp không được vượt quá ${maxSizeMB}MB.`);
        return prevFiles; // Hủy thêm các file mới nếu vượt quá dung lượng
      }
      
      return newFiles;
    });
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
                <p 
                  className='file-name' 
                  title={file.name}
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                    display: 'block'
                  }}
                >
                  {file.name}
                </p>
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