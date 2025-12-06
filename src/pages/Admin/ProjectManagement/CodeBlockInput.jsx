import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Terminal, Copy, Code } from 'lucide-react';
import { highlightCode } from '../../../utils/syntaxHighlighter';

const THEMES = [
  {
    id: 'dracula',
    name: 'Dracula',
    style: {
      backgroundColor: '#282a36',
      color: '#f8f8f2',
      borderColor: '#6272a4'
    },
    headerStyle: {
      backgroundColor: '#21222c',
      color: '#bd93f9'
    },
    syntax: {
      '--syntax-comment': '#6272a4',
      '--syntax-punctuation': '#f8f8f2',
      '--syntax-number': '#bd93f9',
      '--syntax-string': '#f1fa8c',
      '--syntax-operator': '#ff79c6',
      '--syntax-keyword': '#ff79c6',
      '--syntax-function': '#50fa7b',
      '--syntax-variable': '#8be9fd',
      '--syntax-tag': '#ff79c6',
      '--syntax-attr-name': '#50fa7b',
      '--syntax-builtin': '#8be9fd',
      '--syntax-class-name': '#8be9fd'
    }
  },
  {
    id: 'monokai',
    name: 'Monokai',
    style: {
      backgroundColor: '#272822',
      color: '#f8f8f2',
      borderColor: '#75715e'
    },
    headerStyle: {
      backgroundColor: '#1e1f1c',
      color: '#f92672'
    },
    syntax: {
      '--syntax-comment': '#75715e',
      '--syntax-punctuation': '#f8f8f2',
      '--syntax-number': '#ae81ff',
      '--syntax-string': '#e6db74',
      '--syntax-operator': '#f92672',
      '--syntax-keyword': '#f92672',
      '--syntax-function': '#a6e22e',
      '--syntax-variable': '#fd971f',
      '--syntax-tag': '#f92672',
      '--syntax-attr-name': '#a6e22e',
      '--syntax-builtin': '#66d9ef',
      '--syntax-class-name': '#a6e22e'
    }
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    style: {
      backgroundColor: '#0d1117',
      color: '#c9d1d9',
      borderColor: '#30363d'
    },
    headerStyle: {
      backgroundColor: '#161b22',
      color: '#58a6ff'
    },
    syntax: {
      '--syntax-comment': '#8b949e',
      '--syntax-punctuation': '#c9d1d9',
      '--syntax-number': '#79c0ff',
      '--syntax-string': '#a5d6ff',
      '--syntax-operator': '#79c0ff',
      '--syntax-keyword': '#ff7b72',
      '--syntax-function': '#d2a8ff',
      '--syntax-variable': '#79c0ff',
      '--syntax-tag': '#7ee787',
      '--syntax-attr-name': '#d2a8ff',
      '--syntax-builtin': '#79c0ff',
      '--syntax-class-name': '#ffa657'
    }
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    style: {
      backgroundColor: '#ffffff',
      color: '#24292f',
      borderColor: '#d0d7de'
    },
    headerStyle: {
      backgroundColor: '#f6f8fa',
      color: '#0969da'
    },
    syntax: {
      '--syntax-comment': '#6e7781',
      '--syntax-punctuation': '#24292f',
      '--syntax-number': '#005cc5',
      '--syntax-string': '#0a3069',
      '--syntax-operator': '#005cc5',
      '--syntax-keyword': '#d73a49',
      '--syntax-function': '#6f42c1',
      '--syntax-variable': '#e36209',
      '--syntax-tag': '#22863a',
      '--syntax-attr-name': '#6f42c1',
      '--syntax-builtin': '#005cc5',
      '--syntax-class-name': '#e36209'
    }
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    style: {
      backgroundColor: '#002b36',
      color: '#839496',
      borderColor: '#073642'
    },
    headerStyle: {
      backgroundColor: '#073642',
      color: '#268bd2'
    },
    syntax: {
      '--syntax-comment': '#586e75',
      '--syntax-punctuation': '#93a1a1',
      '--syntax-number': '#2aa198',
      '--syntax-string': '#2aa198',
      '--syntax-operator': '#859900',
      '--syntax-keyword': '#859900',
      '--syntax-function': '#268bd2',
      '--syntax-variable': '#b58900',
      '--syntax-tag': '#268bd2',
      '--syntax-attr-name': '#93a1a1',
      '--syntax-builtin': '#b58900',
      '--syntax-class-name': '#b58900'
    }
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    style: {
      backgroundColor: '#fdf6e3',
      color: '#657b83',
      borderColor: '#eee8d5'
    },
    headerStyle: {
      backgroundColor: '#eee8d5',
      color: '#268bd2'
    },
    syntax: {
      '--syntax-comment': '#93a1a1',
      '--syntax-punctuation': '#586e75',
      '--syntax-number': '#2aa198',
      '--syntax-string': '#2aa198',
      '--syntax-operator': '#859900',
      '--syntax-keyword': '#859900',
      '--syntax-function': '#268bd2',
      '--syntax-variable': '#b58900',
      '--syntax-tag': '#268bd2',
      '--syntax-attr-name': '#586e75',
      '--syntax-builtin': '#b58900',
      '--syntax-class-name': '#b58900'
    }
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    style: {
      backgroundColor: '#011627',
      color: '#d6deeb',
      borderColor: '#5f7e97'
    },
    headerStyle: {
      backgroundColor: '#011627',
      color: '#82aaff'
    },
    syntax: {
      '--syntax-comment': '#637777',
      '--syntax-punctuation': '#c792ea',
      '--syntax-number': '#f78c6c',
      '--syntax-string': '#ecc48d',
      '--syntax-operator': '#c792ea',
      '--syntax-keyword': '#c792ea',
      '--syntax-function': '#82aaff',
      '--syntax-variable': '#addb67',
      '--syntax-tag': '#7fdbca',
      '--syntax-attr-name': '#addb67',
      '--syntax-builtin': '#82aaff',
      '--syntax-class-name': '#ffcb6b'
    }
  },
  {
    id: 'nord',
    name: 'Nord',
    style: {
      backgroundColor: '#2e3440',
      color: '#d8dee9',
      borderColor: '#4c566a'
    },
    headerStyle: {
      backgroundColor: '#3b4252',
      color: '#88c0d0'
    },
    syntax: {
      '--syntax-comment': '#4c566a',
      '--syntax-punctuation': '#eceff4',
      '--syntax-number': '#b48ead',
      '--syntax-string': '#a3be8c',
      '--syntax-operator': '#81a1c1',
      '--syntax-keyword': '#81a1c1',
      '--syntax-function': '#88c0d0',
      '--syntax-variable': '#d8dee9',
      '--syntax-tag': '#81a1c1',
      '--syntax-attr-name': '#8fbcbb',
      '--syntax-builtin': '#88c0d0',
      '--syntax-class-name': '#8fbcbb'
    }
  },
  {
    id: 'cobalt2',
    name: 'Cobalt2',
    style: {
      backgroundColor: '#193549',
      color: '#ffffff',
      borderColor: '#15232d'
    },
    headerStyle: {
      backgroundColor: '#15232d',
      color: '#ffc600'
    },
    syntax: {
      '--syntax-comment': '#0088ff',
      '--syntax-punctuation': '#ffffff',
      '--syntax-number': '#ff628c',
      '--syntax-string': '#3ad900',
      '--syntax-operator': '#ff9d00',
      '--syntax-keyword': '#ff9d00',
      '--syntax-function': '#ffc600',
      '--syntax-variable': '#ffc600',
      '--syntax-tag': '#9EFEFF',
      '--syntax-attr-name': '#ffc600',
      '--syntax-builtin': '#ff9d00',
      '--syntax-class-name': '#ffc600'
    }
  },
  {
    id: 'shades-of-purple',
    name: 'Shades of Purple',
    style: {
      backgroundColor: '#2d2b55',
      color: '#ffffff',
      borderColor: '#1e1e3f'
    },
    headerStyle: {
      backgroundColor: '#1e1e3f',
      color: '#9EFEFF'
    },
    syntax: {
      '--syntax-comment': '#b362ff',
      '--syntax-punctuation': '#ffffff',
      '--syntax-number': '#ff628c',
      '--syntax-string': '#a5ff90',
      '--syntax-operator': '#ff9d00',
      '--syntax-keyword': '#ff9d00',
      '--syntax-function': '#9EFEFF',
      '--syntax-variable': '#fad000',
      '--syntax-tag': '#ff9d00',
      '--syntax-attr-name': '#fad000',
      '--syntax-builtin': '#ff9d00',
      '--syntax-class-name': '#ffc600'
    }
  },
  {
    id: 'synthwave-84',
    name: 'Synthwave 84',
    style: {
      backgroundColor: '#2b213a',
      color: '#ffffff',
      borderColor: '#241b2f'
    },
    headerStyle: {
      backgroundColor: '#241b2f',
      color: '#ff7edb'
    },
    syntax: {
      '--syntax-comment': '#6d77b3',
      '--syntax-punctuation': '#ffffff',
      '--syntax-number': '#f97e72',
      '--syntax-string': '#ff8b39',
      '--syntax-operator': '#f97e72',
      '--syntax-keyword': '#f97e72',
      '--syntax-function': '#36f9f6',
      '--syntax-variable': '#ff7edb',
      '--syntax-tag': '#f97e72',
      '--syntax-attr-name': '#ff7edb',
      '--syntax-builtin': '#36f9f6',
      '--syntax-class-name': '#ff7edb'
    }
  },
  {
    id: 'atom-one-dark',
    name: 'Atom One Dark',
    style: {
      backgroundColor: '#282c34',
      color: '#abb2bf',
      borderColor: '#21252b'
    },
    headerStyle: {
      backgroundColor: '#21252b',
      color: '#61afef'
    },
    syntax: {
      '--syntax-comment': '#5c6370',
      '--syntax-punctuation': '#abb2bf',
      '--syntax-number': '#d19a66',
      '--syntax-string': '#98c379',
      '--syntax-operator': '#56b6c2',
      '--syntax-keyword': '#c678dd',
      '--syntax-function': '#61afef',
      '--syntax-variable': '#e06c75',
      '--syntax-tag': '#e06c75',
      '--syntax-attr-name': '#d19a66',
      '--syntax-builtin': '#56b6c2',
      '--syntax-class-name': '#e5c07b'
    }
  },
  {
    id: 'material-ocean',
    name: 'Material Ocean',
    style: {
      backgroundColor: '#0f111a',
      color: '#8f93a2',
      borderColor: '#090b10'
    },
    headerStyle: {
      backgroundColor: '#090b10',
      color: '#82aaff'
    },
    syntax: {
      '--syntax-comment': '#464b5d',
      '--syntax-punctuation': '#8f93a2',
      '--syntax-number': '#f78c6c',
      '--syntax-string': '#c3e88d',
      '--syntax-operator': '#89ddff',
      '--syntax-keyword': '#c792ea',
      '--syntax-function': '#82aaff',
      '--syntax-variable': '#f07178',
      '--syntax-tag': '#f07178',
      '--syntax-attr-name': '#c792ea',
      '--syntax-builtin': '#82aaff',
      '--syntax-class-name': '#ffcb6b'
    }
  },
  {
    id: 'andromeda',
    name: 'Andromeda',
    style: {
      backgroundColor: '#23262e',
      color: '#d5ced9',
      borderColor: '#1b1d23'
    },
    headerStyle: {
      backgroundColor: '#1b1d23',
      color: '#00e8c6'
    },
    syntax: {
      '--syntax-comment': '#a0a1a7',
      '--syntax-punctuation': '#d5ced9',
      '--syntax-number': '#f39c12',
      '--syntax-string': '#96e072',
      '--syntax-operator': '#00e8c6',
      '--syntax-keyword': '#c74ded',
      '--syntax-function': '#ffe66d',
      '--syntax-variable': '#00e8c6',
      '--syntax-tag': '#ff00aa',
      '--syntax-attr-name': '#ffe66d',
      '--syntax-builtin': '#00e8c6',
      '--syntax-class-name': '#ffe66d'
    }
  },
  {
    id: 'deep-sea',
    name: 'Deep Sea',
    style: {
      backgroundColor: '#09141f',
      color: '#ffffff',
      borderColor: '#050a10'
    },
    headerStyle: {
      backgroundColor: '#050a10',
      color: '#00fff5'
    },
    syntax: {
      '--syntax-comment': '#4a5c6a',
      '--syntax-punctuation': '#ffffff',
      '--syntax-number': '#ff9f1c',
      '--syntax-string': '#2ec4b6',
      '--syntax-operator': '#00fff5',
      '--syntax-keyword': '#ff9f1c',
      '--syntax-function': '#00fff5',
      '--syntax-variable': '#2ec4b6',
      '--syntax-tag': '#00fff5',
      '--syntax-attr-name': '#2ec4b6',
      '--syntax-builtin': '#00fff5',
      '--syntax-class-name': '#ff9f1c'
    }
  }
];

export default function CodeBlockInput({ initialData, onSave, onCancel }) {
  const [content, setContent] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [language, setLanguage] = useState('javascript');
  const [fileName, setFileName] = useState('');
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  };

  useEffect(() => {
    if (initialData) {
      setContent(initialData.text || '');
      if (initialData.themeId) {
        const theme = THEMES.find(t => t.id === initialData.themeId);
        if (theme) setSelectedTheme(theme);
      }
      if (initialData.language) setLanguage(initialData.language);
      if (initialData.fileName) setFileName(initialData.fileName);
    }
  }, [initialData]);

  const handleSave = () => {
    onSave({
      text: content,
      themeId: selectedTheme.id,
      styles: selectedTheme.style,
      headerStyle: selectedTheme.headerStyle,
      syntax: selectedTheme.syntax,
      language,
      fileName
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Code className="w-5 h-5 text-teal-700" />
            {initialData ? 'Edit Code Block' : 'Insert Code Block'}
          </h3>
          <button type="button" onClick={onCancel} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar - Themes */}
          <div className="w-full md:w-64 bg-gray-50 border-r overflow-y-auto p-4">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Themes</h4>
            <div className="space-y-2">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedTheme(theme)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    selectedTheme.id === theme.id 
                      ? 'bg-teal-100 text-teal-800 ring-1 ring-teal-500' 
                      : 'hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <div 
                    className="w-4 h-4 rounded-full border" 
                    style={{ backgroundColor: theme.style.backgroundColor }} 
                  />
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
              <div className="rounded-lg overflow-hidden shadow-lg transition-all duration-300" style={{ backgroundColor: selectedTheme.style.backgroundColor }}>
                {/* Mac Header */}
                <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: selectedTheme.headerStyle.backgroundColor }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <div className="text-xs font-mono opacity-70" style={{ color: selectedTheme.headerStyle.color }}>
                    {fileName || 'script.js'}
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="opacity-50 hover:opacity-100 transition-opacity relative group"
                    title="Copy code"
                  >
                    {copied ? (
                      <span className="text-xs font-medium" style={{ color: selectedTheme.headerStyle.color }}>Copied!</span>
                    ) : (
                      <Copy className="w-4 h-4" style={{ color: selectedTheme.headerStyle.color }} />
                    )}
                  </button>
                </div>
                
                {/* Code Content */}
                <div 
                  className="p-4 overflow-x-auto" 
                  style={{ 
                    backgroundColor: selectedTheme.style.backgroundColor,
                    ...selectedTheme.syntax 
                  }}
                >
                  <pre className="font-mono text-sm m-0" style={{ color: selectedTheme.style.color }}>
                    <code 
                      dangerouslySetInnerHTML={{ 
                        __html: highlightCode(content || '// Your code will appear here...', language) 
                      }}
                    />
                  </pre>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Name (Optional)</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. App.jsx"
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="no-color">No Color (Plain Text)</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="json">JSON</option>
                  <option value="bash">Bash</option>
                  <option value="sql">SQL</option>
                  <option value="java">Java</option>
                  <option value="csharp">C#</option>
                  <option value="cpp">C++</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="php">PHP</option>
                  <option value="ruby">Ruby</option>
                </select>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your code here..."
                className="flex-1 w-full p-4 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                spellCheck="false"
                style={{ minHeight: '250px' }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!content.trim()}
            className="px-6 py-2 rounded-lg bg-teal-700 text-white hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {initialData ? 'Update Code Block' : 'Insert Code Block'}
          </button>
        </div>
      </div>
    </div>
  );
}
