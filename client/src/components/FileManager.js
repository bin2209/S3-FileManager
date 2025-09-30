import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const FileManager = () => {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Fetch files on component mount
    useEffect(() => {
        fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/files`);
            const data = await response.json();
            
            if (response.ok) {
                setFiles(data.files || []);
            } else {
                showMessage(data.error || 'Failed to fetch files', 'error');
            }
        } catch (error) {
            showMessage('Error connecting to server', 'error');
            console.error('Fetch files error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        
        if (!selectedFile) {
            showMessage('Please select a file to upload', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            setUploading(true);
            const response = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(`File "${selectedFile.name}" uploaded successfully!`, 'success');
                setSelectedFile(null);
                event.target.reset();
                fetchFiles(); // Refresh file list
            } else {
                showMessage(data.error || 'Upload failed', 'error');
            }
        } catch (error) {
            showMessage('Error uploading file', 'error');
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (filename) => {
        try {
            const response = await fetch(`${API_BASE_URL}/download/${filename}`);
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                showMessage(`File "${filename}" downloaded successfully!`, 'success');
            } else {
                const data = await response.json();
                showMessage(data.error || 'Download failed', 'error');
            }
        } catch (error) {
            showMessage('Error downloading file', 'error');
            console.error('Download error:', error);
        }
    };

    const handleDelete = async (filename) => {
        if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/delete/${filename}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(`File "${filename}" deleted successfully!`, 'success');
                fetchFiles(); // Refresh file list
            } else {
                showMessage(data.error || 'Delete failed', 'error');
            }
        } catch (error) {
            showMessage('Error deleting file', 'error');
            console.error('Delete error:', error);
        }
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="file-manager">
            {/* Upload Section */}
            <div className="upload-section">
                <h2>Upload File</h2>
                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
                <form onSubmit={handleUpload} className="upload-form">
                    <div className="file-input-container">
                        <input
                            type="file"
                            onChange={handleFileSelect}
                            className="file-input"
                            accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
                        />
                    </div>
                    {selectedFile && (
                        <div className="selected-file">
                            <strong>Selected:</strong> {selectedFile.name} ({formatFileSize(selectedFile.size)})
                        </div>
                    )}
                    <button 
                        type="submit" 
                        disabled={!selectedFile || uploading}
                        className="upload-btn"
                    >
                        {uploading ? 'Uploading...' : 'Upload File'}
                    </button>
                </form>
            </div>

            {/* Files List Section */}
            <div className="files-section">
                <h2>Your Files ({files.length})</h2>
                <button 
                    onClick={fetchFiles} 
                    className="btn btn-download"
                    style={{ marginBottom: '20px' }}
                >
                    Refresh
                </button>
                
                {loading ? (
                    <div className="loading">Loading files...</div>
                ) : files.length === 0 ? (
                    <div className="no-files">
                        No files uploaded yet. Upload your first file!
                    </div>
                ) : (
                    <div className="files-list">
                        {files.map((file, index) => (
                            <div key={index} className="file-item">
                                <div className="file-info">
                                    <div className="file-name">{file.key}</div>
                                    <div className="file-meta">
                                        Size: {formatFileSize(file.size)} | 
                                        Modified: {formatDate(file.lastModified)}
                                    </div>
                                </div>
                                <div className="file-actions">
                                    <button
                                        onClick={() => handleDownload(file.key)}
                                        className="btn btn-download"
                                    >
                                        Download
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file.key)}
                                        className="btn btn-delete"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileManager;