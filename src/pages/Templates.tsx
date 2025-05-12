import React, { useState } from 'react';

interface Template {
  id: number;
  name: string;
  category: string;
}

const Templates: React.FC = () => {
  const [category, setCategory] = useState<string>('all');
  const templates: Template[] = [
    { id: 1, name: 'Modern Blue', category: 'business' },
    { id: 2, name: 'Creative Minimal', category: 'creative' },
    { id: 3, name: 'Classic Black', category: 'minimal' },
  ];

  const filteredTemplates = category === 'all' ? templates : templates.filter((t) => t.category === category);

  return (
    <main className="templates container mx-auto p-4">
      <h2 className="text-2xl mb-4">Template Gallery</h2>
      <div className="templates__filters mb-4">
        <button onClick={() => setCategory('all')} className="mr-2 p-2 bg-gray-200 rounded">All</button>
        <button onClick={() => setCategory('business')} className="mr-2 p-2 bg-gray-200 rounded">Business</button>
        <button onClick={() => setCategory('creative')} className="mr-2 p-2 bg-gray-200 rounded">Creative</button>
        <button onClick={() => setCategory('minimal')} className="p-2 bg-gray-200 rounded">Minimal</button>
      </div>
      <div className="templates__grid grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="templates__item border p-4">
            <h3>{template.name}</h3>
            <button className="mt-2 bg-blue-600 text-white px-2 py-1 rounded">Preview</button>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Templates;