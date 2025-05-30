import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { templates } from '../const/templatesData';

const Templates: React.FC = () => {
  const [category, setCategory] = useState<string>('all');
  const navigate = useNavigate();

  const filteredTemplates = category === 'all' ? templates : templates.filter((t) => t.category === category);

  const handlePreview = (backgroundImage: string) => {
    navigate(`/create?background=${encodeURIComponent(backgroundImage)}`);
  };

  return (
    <main className="templates container mx-auto p-4">
      <h2 className="text-2xl text-center mb-4">Template Gallery</h2>
      <div className="flex flex-wrap gap-2 templates__filters mb-4 justify-center">
        <button onClick={() => setCategory('all')} className="p-2 bg-gray-200 rounded">All</button>
        <button onClick={() => setCategory('business')} className="p-2 bg-gray-200 rounded">Business</button>
        <button onClick={() => setCategory('creative')} className="p-2 bg-gray-200 rounded">Creative</button>
        <button onClick={() => setCategory('nature')} className="p-2 bg-gray-200 rounded">Nature</button>
        <button onClick={() => setCategory('country')} className="p-2 bg-gray-200 rounded">Country</button>
      </div>
      <div className="templates__grid grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="templates__item border p-4 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
            <img
              src={template.backgroundImage}
              alt={`${template.name} preview`}
              className="mb-2"
              style={{
                width: '100%',
                maxWidth: '200px',
                height: 'auto',
                aspectRatio: '7 / 4',
                objectFit: 'cover',
                borderRadius: '5px',
              }}
              onError={(e) => {
                e.currentTarget.src = 'https://i.postimg.cc/R0yg93Hm/image-not-found.png';
              }}
            />
            <button
              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
              onClick={() => handlePreview(template.backgroundImage)}
            >
              Preview
            </button>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Templates;