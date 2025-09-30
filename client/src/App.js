import React from 'react';
import './App.css';
import FileManager from './components/FileManager';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AWS S3 File Manager</h1>
        <p>Upload, download, and manage files in your S3 bucket</p>
      </header>
      <main className="App-main">
        <FileManager />
      </main>
    </div>
  );
}

export default App;
