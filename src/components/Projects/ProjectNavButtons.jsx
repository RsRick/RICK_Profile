import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProjectNavButtons({ onPrevious, onNext, hasPrevious, hasNext }) {
  return (
    <div className="project-nav-buttons-wrapper" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '20px',
      margin: '0.5rem 0',
      padding: '0.5rem'
    }}>
      {/* Previous Post Button */}
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="project-nav-btn project-nav-prev"
        style={{
          display: 'flex',
          height: '3em',
          width: '150px',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#eeeeee4b',
          borderRadius: '3px',
          letterSpacing: '1px',
          transition: 'all 0.2s linear',
          cursor: hasPrevious ? 'pointer' : 'not-allowed',
          border: 'none',
          background: '#fff',
          opacity: hasPrevious ? 1 : 0.5,
          fontSize: '14px',
          fontWeight: '500',
          color: '#105652'
        }}
      >
        <ChevronLeft 
          style={{
            marginRight: '5px',
            marginLeft: '5px',
            fontSize: '20px',
            transition: 'all 0.4s ease-in'
          }}
        />
        Previous Post
      </button>

      {/* Next Post Button */}
      <button
        onClick={onNext}
        disabled={!hasNext}
        className="project-nav-btn project-nav-next"
        style={{
          display: 'flex',
          height: '3em',
          width: '150px',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#eeeeee4b',
          borderRadius: '3px',
          letterSpacing: '1px',
          transition: 'all 0.2s linear',
          cursor: hasNext ? 'pointer' : 'not-allowed',
          border: 'none',
          background: '#fff',
          opacity: hasNext ? 1 : 0.5,
          fontSize: '14px',
          fontWeight: '500',
          color: '#105652'
        }}
      >
        Next Post
        <ChevronRight 
          style={{
            marginRight: '5px',
            marginLeft: '5px',
            fontSize: '20px',
            transition: 'all 0.4s ease-in'
          }}
        />
      </button>
    </div>
  );
}
