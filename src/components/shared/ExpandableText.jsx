import React, { useState, useMemo } from 'react';

const ExpandableText = ({ text, maxLength = 150, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const wrapperClasses = useMemo(() => {
    return ['block text-gray-600 text-sm', className].filter(Boolean).join(' ');
  }, [className]);

  if (!text) return null;

  if (text.length <= maxLength) {
    return <span className={wrapperClasses}>{text}</span>;
  }

  return (
    <span className={wrapperClasses}>
      {isExpanded ? text : `${text.slice(0, maxLength)}...`}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded((prev) => !prev);
        }}
        className="ml-1 text-green-600 hover:text-green-700 font-medium focus:outline-none inline"
      >
        {isExpanded ? 'Show Less' : 'Show More'}
      </button>
    </span>
  );
};

export default ExpandableText;