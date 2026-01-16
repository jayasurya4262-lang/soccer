import React, { useState, useRef, useCallback, useEffect } from 'react';

const TextEditor = ({ isOpen, onClose, onSave }) => {
  const [textLayers, setTextLayers] = useState([
    {
      id: 1,
      text: 'Neon Slime Arena',
      x: 50,
      y: 50,
      fontSize: 48,
      fontFamily: 'Arial',
      color: '#00CED1',
      opacity: 1,
      rotation: 0,
      fontWeight: 'bold',
      textShadow: true,
      stroke: false,
      strokeColor: '#000000',
      strokeWidth: 2,
      isDragging: false,
      dragOffset: { x: 0, y: 0 }
    },
    {
      id: 2,
      text: 'Created by Jayasurya',
      x: 50,
      y: 120,
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#FFFFFF',
      opacity: 0.8,
      rotation: 0,
      fontWeight: 'normal',
      textShadow: true,
      stroke: false,
      strokeColor: '#000000',
      strokeWidth: 2,
      isDragging: false,
      dragOffset: { x: 0, y: 0 }
    }
  ]);

  const [selectedLayer, setSelectedLayer] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const containerRef = useRef(null);
  const [availableFonts] = useState([
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
    'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS', 'Impact',
    'Trebuchet MS', 'Lucida Console', 'Tahoma', 'Arial Black', 'Roboto'
  ]);

  const handleMouseDown = useCallback((e, layerId) => {
    e.preventDefault();
    const layer = textLayers.find(l => l.id === layerId);
    if (!layer) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const offsetX = e.clientX - rect.left - layer.x;
    const offsetY = e.clientY - rect.top - layer.y;

    setTextLayers(prev => prev.map(l => 
      l.id === layerId 
        ? { ...l, isDragging: true, dragOffset: { x: offsetX, y: offsetY } }
        : l
    ));
    setSelectedLayer(layerId);
  }, [textLayers]);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;

    const draggingLayer = textLayers.find(l => l.isDragging);
    if (!draggingLayer) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - draggingLayer.dragOffset.x;
    const newY = e.clientY - rect.top - draggingLayer.dragOffset.y;

    setTextLayers(prev => prev.map(l =>
      l.id === draggingLayer.id
        ? { ...l, x: Math.max(0, Math.min(newX, rect.width - 100)), y: Math.max(0, Math.min(newY, rect.height - 50)) }
        : l
    ));
  }, [textLayers]);

  const handleMouseUp = useCallback(() => {
    setTextLayers(prev => prev.map(l => ({ ...l, isDragging: false })));
  }, []);

  useEffect(() => {
    if (textLayers.some(l => l.isDragging)) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [textLayers, handleMouseMove, handleMouseUp]);

  const updateLayer = (id, updates) => {
    setTextLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const addTextLayer = () => {
    const newLayer = {
      id: Date.now(),
      text: 'New Text',
      x: 100,
      y: 100,
      fontSize: 32,
      fontFamily: 'Arial',
      color: '#FFFFFF',
      opacity: 1,
      rotation: 0,
      fontWeight: 'normal',
      textShadow: true,
      stroke: false,
      strokeColor: '#000000',
      strokeWidth: 2,
      isDragging: false,
      dragOffset: { x: 0, y: 0 }
    };
    setTextLayers(prev => [...prev, newLayer]);
    setSelectedLayer(newLayer.id);
  };

  const deleteLayer = (id) => {
    setTextLayers(prev => prev.filter(l => l.id !== id));
    if (selectedLayer === id) setSelectedLayer(null);
  };

  const duplicateLayer = (id) => {
    const layer = textLayers.find(l => l.id === id);
    if (!layer) return;
    const newLayer = { ...layer, id: Date.now(), x: layer.x + 20, y: layer.y + 20 };
    setTextLayers(prev => [...prev, newLayer]);
    setSelectedLayer(newLayer.id);
  };

  const exportDesign = () => {
    const design = {
      layers: textLayers.map(({ isDragging, dragOffset, ...layer }) => layer),
      exportedAt: new Date().toISOString(),
      author: 'Jayasurya'
    };
    const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'soccer-slime-design.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDesign = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const design = JSON.parse(event.target.result);
        if (design.layers) {
          setTextLayers(design.layers.map(l => ({ ...l, isDragging: false, dragOffset: { x: 0, y: 0 } })));
        }
      } catch (error) {
        alert('Failed to import design. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const selectedLayerData = textLayers.find(l => l.id === selectedLayer);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full h-full max-w-7xl max-h-[95vh] m-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl border border-white/20 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ✨ Text & Watermark Editor
            </h2>
            <p className="text-gray-400 text-sm mt-1">Created by Jayasurya - Customize your design with multiple text layers</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg border border-blue-400/30 transition-all"
            >
              {previewMode ? 'Edit Mode' : 'Preview Mode'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-500/80 hover:bg-red-500 rounded-lg border border-red-400/30 transition-all"
            >
              ✕ Close
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Preview Area */}
          <div className="flex-1 relative bg-gradient-to-br from-slate-800 to-slate-900 p-8 overflow-auto">
            <div
              ref={containerRef}
              className="relative w-full h-full min-h-[500px] bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-pink-900/30 rounded-2xl border-2 border-dashed border-white/20"
              style={{ position: 'relative' }}
            >
              {textLayers.map((layer) => (
                <div
                  key={layer.id}
                  onClick={() => setSelectedLayer(layer.id)}
                  onMouseDown={(e) => handleMouseDown(e, layer.id)}
                  className={`absolute cursor-move select-none ${selectedLayer === layer.id ? 'ring-4 ring-cyan-400 ring-offset-2' : ''}`}
                  style={{
                    left: `${layer.x}px`,
                    top: `${layer.y}px`,
                    fontSize: `${layer.fontSize}px`,
                    fontFamily: layer.fontFamily,
                    color: layer.color,
                    opacity: layer.opacity,
                    transform: `rotate(${layer.rotation}deg)`,
                    fontWeight: layer.fontWeight,
                    textShadow: layer.textShadow ? '2px 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.3)' : 'none',
                    WebkitTextStroke: layer.stroke ? `${layer.strokeWidth}px ${layer.strokeColor}` : 'none',
                    zIndex: selectedLayer === layer.id ? 1000 : layer.id
                  }}
                >
                  {layer.text || 'Enter text...'}
                </div>
              ))}
              {textLayers.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <div className="text-xl">Click "Add Text Layer" to start</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Control Panel */}
          {!previewMode && (
            <div className="w-96 bg-black/40 backdrop-blur-xl border-l border-white/10 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Layer Management */}
                <div>
                  <h3 className="text-xl font-bold mb-4 text-white">Text Layers</h3>
                  <div className="space-y-2 mb-4">
                    {textLayers.map((layer) => (
                      <div
                        key={layer.id}
                        onClick={() => setSelectedLayer(layer.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedLayer === layer.id
                            ? 'bg-cyan-500/20 border-cyan-400'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 truncate text-white font-semibold">{layer.text || 'Empty'}</div>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateLayer(layer.id);
                              }}
                              className="p-1 text-blue-400 hover:text-blue-300"
                              title="Duplicate"
                            >
                              📋
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteLayer(layer.id);
                              }}
                              className="p-1 text-red-400 hover:text-red-300"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addTextLayer}
                    className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 rounded-lg font-bold text-white transition-all"
                  >
                    + Add Text Layer
                  </button>
                </div>

                {/* Text Properties */}
                {selectedLayerData && (
                  <div className="space-y-4 border-t border-white/10 pt-6">
                    <h3 className="text-xl font-bold text-white">Text Properties</h3>

                    {/* Text Content */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Text Content</label>
                      <input
                        type="text"
                        value={selectedLayerData.text}
                        onChange={(e) => updateLayer(selectedLayer, { text: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        placeholder="Enter your text..."
                      />
                    </div>

                    {/* Font Family */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Font Family</label>
                      <select
                        value={selectedLayerData.fontFamily}
                        onChange={(e) => updateLayer(selectedLayer, { fontFamily: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      >
                        {availableFonts.map(font => (
                          <option key={font} value={font} style={{ fontFamily: font, backgroundColor: '#1e293b' }}>
                            {font}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Font Size */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Font Size: {selectedLayerData.fontSize}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="120"
                        value={selectedLayerData.fontSize}
                        onChange={(e) => updateLayer(selectedLayer, { fontSize: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Font Weight */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Font Weight</label>
                      <select
                        value={selectedLayerData.fontWeight}
                        onChange={(e) => updateLayer(selectedLayer, { fontWeight: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                        <option value="lighter">Light</option>
                        <option value="bolder">Bolder</option>
                      </select>
                    </div>

                    {/* Color */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Text Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedLayerData.color}
                          onChange={(e) => updateLayer(selectedLayer, { color: e.target.value })}
                          className="w-16 h-10 rounded-lg border border-white/20 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedLayerData.color}
                          onChange={(e) => updateLayer(selectedLayer, { color: e.target.value })}
                          className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          placeholder="#FFFFFF"
                        />
                      </div>
                    </div>

                    {/* Opacity */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Opacity: {Math.round(selectedLayerData.opacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={selectedLayerData.opacity}
                        onChange={(e) => updateLayer(selectedLayer, { opacity: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Rotation */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Rotation: {selectedLayerData.rotation}°
                      </label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={selectedLayerData.rotation}
                        onChange={(e) => updateLayer(selectedLayer, { rotation: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Text Shadow */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-300">Text Shadow</label>
                      <input
                        type="checkbox"
                        checked={selectedLayerData.textShadow}
                        onChange={(e) => updateLayer(selectedLayer, { textShadow: e.target.checked })}
                        className="w-5 h-5 rounded"
                      />
                    </div>

                    {/* Stroke */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-300">Text Stroke</label>
                      <input
                        type="checkbox"
                        checked={selectedLayerData.stroke}
                        onChange={(e) => updateLayer(selectedLayer, { stroke: e.target.checked })}
                        className="w-5 h-5 rounded"
                      />
                    </div>

                    {selectedLayerData.stroke && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">Stroke Color</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={selectedLayerData.strokeColor}
                              onChange={(e) => updateLayer(selectedLayer, { strokeColor: e.target.value })}
                              className="w-16 h-10 rounded-lg border border-white/20 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={selectedLayerData.strokeColor}
                              onChange={(e) => updateLayer(selectedLayer, { strokeColor: e.target.value })}
                              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Stroke Width: {selectedLayerData.strokeWidth}px
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={selectedLayerData.strokeWidth}
                            onChange={(e) => updateLayer(selectedLayer, { strokeWidth: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Export/Import */}
                <div className="border-t border-white/10 pt-6 space-y-3">
                  <button
                    onClick={exportDesign}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-lg font-bold text-white transition-all"
                  >
                    💾 Export Design
                  </button>
                  <label className="block w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 rounded-lg font-bold text-white transition-all text-center cursor-pointer">
                    📥 Import Design
                    <input
                      type="file"
                      accept=".json"
                      onChange={importDesign}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => onSave(textLayers)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 rounded-lg font-bold text-white transition-all"
                  >
                    ✅ Save & Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextEditor;

