import React, { useState } from 'react';

const ExpandableText = ({ text, maxLength = 150 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) return null;
  
  if (text.length <= maxLength) {
    return <div className="text-gray-600 text-sm">{text}</div>;
  }

  return (
    <div className="text-gray-600 text-sm">
      {isExpanded ? text : `${text.slice(0, maxLength)}...`}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="ml-1 text-green-600 hover:text-green-700 font-medium focus:outline-none"
      >
        {isExpanded ? 'Show Less' : 'Show More'}
      </button>
    </div>
  );
};

export default ExpandableText; 