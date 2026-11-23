import React from 'react';
import { createRoot } from 'react-dom/client';
import Icon from '../react/Icon.tsx';

createRoot(document.getElementById('root')!).render(
  <Icon name="search" size={32} label="Search" />,
);
