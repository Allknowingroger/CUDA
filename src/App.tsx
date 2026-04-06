/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BookOpen, Cpu, Terminal, Zap, Play, Cloud } from 'lucide-react';
import Editor from '@monaco-editor/react';

export default function App() {
  const [code, setCode] = useState(`__global__ void add(int *a, int *b, int *c) {
    int tid = blockIdx.x;
    c[tid] = a[tid] + b[tid];
}`);
  const [output, setOutput] = useState('');

  const topics = [
    { title: 'Course Philosophy', icon: BookOpen },
    { title: 'Overview', icon: Zap },
    { title: 'Prerequisites', icon: Terminal },
    { title: 'Hardware Requirements', icon: Cpu },
  ];

  const handleRun = () => {
    setOutput('Simulating compilation...\nSuccess: Kernel compiled.\nOutput: [Mock execution feedback: CUDA kernel initialized on device 0]');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">CUDA Learning Assistant</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {topics.map((topic) => (
            <div
              key={topic.title}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            >
              <topic.icon className="w-8 h-8 text-blue-600 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900">{topic.title}</h2>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">CUDA Code Editor</h2>
          <div className="h-64 mb-4 border border-gray-300 rounded overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="cpp"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{ fontSize: 14, minimap: { enabled: false } }}
            />
          </div>
          <div className="flex gap-4 mb-4">
            <button onClick={handleRun} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              <Play className="w-4 h-4" /> Run (Simulated)
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">
              <Cloud className="w-4 h-4" /> Run in Google Colab
            </button>
          </div>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-32 overflow-y-auto">
            {output || 'Output will appear here...'}
          </div>
        </div>
      </main>
    </div>
  );
}
