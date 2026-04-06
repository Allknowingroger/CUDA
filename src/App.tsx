/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BookOpen, Cpu, Terminal, Zap, Play, Cloud, Layers, Code, Loader2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';

// Study Guide Content
const studyGuides: { [key: string]: string } = {
  'Course Philosophy': `# Course Philosophy
  CUDA (Compute Unified Device Architecture) is a parallel computing platform and programming model developed by NVIDIA. The philosophy behind CUDA is to enable developers to use the massive parallel processing power of GPUs for general-purpose computing, not just graphics.
  - **Data Parallelism:** Focus on performing the same operation on many data elements simultaneously.
  - **Heterogeneous Computing:** Leverage both the CPU (for serial tasks) and the GPU (for parallel tasks).`,
  'Overview': `# Overview
  CUDA allows you to write C/C++ code that executes on the GPU.
  - **Kernels:** Functions that execute on the GPU.
  - **Threads, Blocks, and Grids:** The hierarchy of execution.
  - **Memory Hierarchy:** Global, Shared, and Local memory.`,
  'Prerequisites': `# Prerequisites
  - **C/C++ Proficiency:** Essential for writing CUDA kernels.
  - **Basic Linear Algebra:** Understanding matrices and vectors is crucial.
  - **NVIDIA GPU:** Required for hardware-level execution.`,
  'Hardware Requirements': `# Hardware Requirements
  - **NVIDIA GPU:** Must be CUDA-capable.
  - **CUDA Toolkit:** The development environment.
  - **Drivers:** Up-to-date NVIDIA drivers.`
};

// CUDA Examples
const cudaExamples = [
  {
    title: 'Vector Addition',
    code: `__global__ void add(int *a, int *b, int *c) {
    int tid = blockIdx.x * blockDim.x + threadIdx.x;
    c[tid] = a[tid] + b[tid];
}`,
    explanation: 'This kernel adds two vectors element-wise. Each thread calculates the sum for one element.',
    simulatedOutput: 'Success: Kernel compiled.\nOutput: Vector addition completed for 1024 elements.'
  },
  {
    title: 'Thread Indexing',
    code: `__global__ void printIndices() {
    int tid = threadIdx.x;
    int bid = blockIdx.x;
    printf("Block: %d, Thread: %d\\n", bid, tid);
}`,
    explanation: 'This kernel prints the block and thread indices to demonstrate the hierarchy.',
    simulatedOutput: 'Success: Kernel compiled.\nOutput: Block: 0, Thread: 0\nBlock: 0, Thread: 1\n...'
  }
];

// Enhanced Thread Hierarchy Visualizer
function ThreadHierarchyVisualizer() {
  const [blocks, setBlocks] = useState(2);
  const [threadsPerBlock, setThreadsPerBlock] = useState(4);
  const [hoveredThread, setHoveredThread] = useState<{b: number, t: number} | null>(null);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
        <Layers className="w-5 h-5 text-blue-600" /> Thread Hierarchy
      </h2>
      <div className="flex gap-4 mb-4 text-sm">
        <label className="flex items-center gap-2">Blocks: <input type="number" value={blocks} onChange={(e) => setBlocks(Math.max(1, Number(e.target.value)))} className="w-16 border rounded p-1" /></label>
        <label className="flex items-center gap-2">Threads/Block: <input type="number" value={threadsPerBlock} onChange={(e) => setThreadsPerBlock(Math.max(1, Number(e.target.value)))} className="w-16 border rounded p-1" /></label>
      </div>
      <div className="flex gap-4 overflow-x-auto p-4 bg-gray-50 rounded-lg border border-gray-100">
        {Array.from({ length: blocks }).map((_, b) => (
          <div key={b} className="border-2 border-blue-200 p-3 rounded-lg bg-white">
            <div className="text-xs font-bold mb-2 text-blue-700">Block {b}</div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: threadsPerBlock }).map((_, t) => (
                <div 
                  key={t} 
                  onMouseEnter={() => setHoveredThread({b, t})}
                  onMouseLeave={() => setHoveredThread(null)}
                  className={`w-10 h-10 flex items-center justify-center text-xs rounded-md transition-all cursor-pointer ${hoveredThread?.b === b && hoveredThread?.t === t ? 'bg-blue-700 text-white scale-110 shadow-lg' : 'bg-blue-100 text-blue-800'}`}
                >
                  T{t}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {hoveredThread && (
        <div className="mt-4 p-2 bg-gray-800 text-white text-xs rounded">
          Hovered: Block {hoveredThread.b}, Thread {hoveredThread.t} (Global ID: {hoveredThread.b * threadsPerBlock + hoveredThread.t})
        </div>
      )}
    </div>
  );
}

// CUDA Best Practices & Pitfalls
const bestPractices = [
  { keyword: 'shared', title: 'Use Shared Memory', content: 'Shared memory is much faster than global memory. Use it for frequently accessed data within a block.' },
  { keyword: 'if', title: 'Avoid Warp Divergence', content: 'Divergent branching within a warp can significantly reduce performance. Try to keep execution paths uniform.' },
  { keyword: 'cudaMemcpy', title: 'Minimize Data Transfer', content: 'Data transfer between CPU and GPU is slow. Minimize the amount of data transferred.' },
  { keyword: 'global', title: 'Coalesced Memory Access', content: 'Ensure threads in a warp access contiguous memory locations to enable coalesced memory access.' }
];

export default function App() {
  const [selectedExample, setSelectedExample] = useState(cudaExamples[0]);
  const [code, setCode] = useState(selectedExample.code);
  const [output, setOutput] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedExplanation, setGeneratedExplanation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAdvice, setActiveAdvice] = useState<typeof bestPractices>([]);

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
    const newAdvice = bestPractices.filter(advice => value?.toLowerCase().includes(advice.keyword.toLowerCase()));
    setActiveAdvice(newAdvice);
  };

  useEffect(() => {
    setActiveAdvice(bestPractices.filter(advice => selectedExample.code.toLowerCase().includes(advice.keyword.toLowerCase())));
  }, [selectedExample]);

  const topics = [
    { title: 'Course Philosophy', icon: BookOpen },
    { title: 'Overview', icon: Zap },
    { title: 'Prerequisites', icon: Terminal },
    { title: 'Hardware Requirements', icon: Cpu },
  ];

  const handleRun = () => {
    setOutput(`Simulating compilation...\n${selectedExample.simulatedOutput}`);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setOutput(`Generating CUDA code for: "${prompt}"...`);
    
    // Simulate API delay
    setTimeout(() => {
      const generatedCode = `__global__ void generatedKernel() {
    // Generated code based on: ${prompt}
    // This is a placeholder kernel.
}`;
      setCode(generatedCode);
      setGeneratedExplanation(`This kernel was generated based on your prompt: "${prompt}". It serves as a starting point for your custom CUDA kernel development.`);
      setOutput(`Generating CUDA code for: "${prompt}"...\n\nKernel generated successfully.`);
      setIsGenerating(false);
      
      const newAdvice = bestPractices.filter(advice => generatedCode.toLowerCase().includes(advice.keyword.toLowerCase()));
      setActiveAdvice(newAdvice);
    }, 1500);
  };

  const handleExampleChange = (example: typeof cudaExamples[0]) => {
    setSelectedExample(example);
    setCode(example.code);
    setGeneratedExplanation('');
    setOutput('');
    const newAdvice = bestPractices.filter(advice => example.code.toLowerCase().includes(advice.keyword.toLowerCase()));
    setActiveAdvice(newAdvice);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Cpu className="text-blue-600" /> CUDA Learning Assistant</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {topics.map((topic) => (
            <div
              key={topic.title}
              onClick={() => setSelectedTopic(topic.title)}
              className={`bg-white p-6 rounded-xl shadow-sm border ${selectedTopic === topic.title ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'} hover:shadow-md transition-all cursor-pointer`}
            >
              <topic.icon className="w-8 h-8 text-blue-600 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900">{topic.title}</h2>
            </div>
          ))}
        </div>

        {selectedTopic && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 animate-in fade-in slide-in-from-top-2">
            <div className="text-gray-800 space-y-4">
              <ReactMarkdown>{studyGuides[selectedTopic]}</ReactMarkdown>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800"><Code className="w-5 h-5 text-blue-600" /> CUDA Code Generator</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Describe your CUDA kernel:</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Add two matrices..."
                  className="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={handleGenerate} disabled={isGenerating} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50">
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
                </button>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800"><Code className="w-5 h-5 text-blue-600" /> CUDA Code Editor</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Example:</label>
              <select 
                onChange={(e) => handleExampleChange(cudaExamples.find(ex => ex.title === e.target.value)!)}
                className="w-full p-2 border rounded-lg"
              >
                {cudaExamples.map(ex => <option key={ex.title} value={ex.title}>{ex.title}</option>)}
              </select>
            </div>

            <div className="h-64 mb-4 border border-gray-300 rounded-lg overflow-hidden shadow-inner">
              <Editor
                height="100%"
                defaultLanguage="cpp"
                value={code}
                onChange={handleCodeChange}
                options={{ fontSize: 14, minimap: { enabled: false } }}
              />
            </div>
            
            {activeAdvice.length > 0 && (
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg text-sm text-yellow-800 border border-yellow-100">
                <h3 className="font-bold mb-1">💡 Best Practices & Pitfalls:</h3>
                {activeAdvice.map(advice => (
                  <p key={advice.keyword} className="mb-1"><strong>{advice.title}:</strong> {advice.content}</p>
                ))}
              </div>
            )}

            <div className="mb-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-100">
              <strong>Explanation:</strong> {generatedExplanation || selectedExample.explanation}
            </div>

            <div className="flex gap-4 mb-4">
              <button onClick={handleRun} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm">
                <Play className="w-4 h-4" /> Run (Simulated)
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 shadow-sm">
                <Cloud className="w-4 h-4" /> Run in Google Colab
              </button>
            </div>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-32 overflow-y-auto shadow-inner">
              {output || 'Output will appear here...'}
            </div>
          </div>
          
          <ThreadHierarchyVisualizer />
        </div>
      </main>
    </div>
  );
}
