import sources from 'virtual:ira-svg-sources';
export const iconNames = Object.freeze([...sources.keys()]);
export const getSource = name => sources.get(name);
